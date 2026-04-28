# Arquitectura Técnica y Stack Tecnológico: Opina+

> Actualización 2026-04-28 — este documento fue reescrito para reflejar el stack **realmente implementado** en V16. La versión original (Marzo 2026) describía un stack aspiracional con Redis, colas de mensajes y WebSockets que nunca se llegaron a implementar; toda esa carga la absorbe hoy Supabase + Edge Functions sobre Postgres puro. Si en el futuro se necesita una capa de buffer en memoria, la decisión y el diseño deben quedar en este mismo documento antes de ejecutarse.

## 1. Patrón Arquitectónico General

Opina+ está construido sobre una arquitectura **frontend SPA + Backend-as-a-Service**, con dos cargas de trabajo conviviendo:

* **Lecturas rápidas y UI gamificada:** una SPA en React/Vite servida estáticamente desde Vercel, con caché de datos del lado del cliente vía TanStack Query.
* **Ingesta de señales y reglas de negocio:** Supabase Postgres como única fuente de verdad transaccional, con RLS estricto y RPCs `SECURITY DEFINER` para operaciones que cruzan filas o que requieren validaciones server-side. Edge Functions de Supabase manejan integraciones externas (LLM, captcha, WhatsApp).

No hay capa intermedia de Node propia, ni Redis, ni colas, ni WebSockets. La latencia de escritura percibida la cubre el patrón de **outbox client-side** (`signalOutbox`) y el optimistic update de TanStack Query.

## 2. Stack Tecnológico Real (V16)

### Frontend
* **Bundler / Framework:** **Vite 7 + React 19**. SPA pura, sin SSR/Next.
* **Lenguaje:** **TypeScript** estricto (`tsc --noEmit` en CI). Tipos de BD generados desde Supabase y endurecidos vía `database-contracts.ts` (alias `StrictDatabase`).
* **UI Toolkit:** **Tailwind CSS** con paleta corporativa propia (`brand-*`, `accent-*`, tokens `danger-*`/`warning-*`). **Framer Motion** para micro-interacciones y transiciones. Sin Glassmorphism agresivo; estilo limpio sobre fondo claro (invariante de diseño).
* **Estado servidor:** **TanStack Query v5** (cache, refetch, optimistic updates). Migración completa al 2026-04-26: 22 archivos migrados desde el patrón viejo de `useEffect + setLoading + supabase.from(...)`.
* **Estado UI efímero:** React `useState`/`useReducer` y un par de stores acotados con Zustand donde el árbol lo requiere; React Context para Auth.
* **Routing:** `react-router-dom` con `lazy()` para code splitting por feature.
* **Observabilidad:** `errorReporter` con bridge a `window.onerror`/`unhandledrejection`; sink configurable (Sentry opcional). Logs estructurados con `lib/logger` y sanitización de PII (27 keys + 7 sufijos).

### Backend (Supabase)
* **Postgres** gestionado, con **RLS** activo en toda tabla con datos de usuario. Catálogos públicos legítimos documentados como decisión consciente (`F-09`).
* **RPCs `SECURITY DEFINER`** para escrituras que cruzan filas: 7 RPCs admin para edición editorial (`F-08`), `admin_set_user_role`, `enforce_signal_rate_limit`, `insert_signal_event`, `seed_synthetic_batch`/`delete_synthetic_batch`, `admin_seed_battles_from_entities`, etc. Todas con `search_path` fijado (`F-02`) y `log_admin_action()` para auditoría (`F-15`).
* **Auth:** Supabase Auth + tabla `profiles` propia para datos extendidos. Multi-session lock vía `user_sessions` + `useSessionGuard` (ping 30s).
* **Edge Functions (Deno):**
  * `llm-narrative` — narrativas ejecutivas LLM (entity / market) con Zod estricto, prompts v2 anti-injection, fallback determinístico, audit log.
  * `insights-generator` — generación de AI summaries para batallas/topics.
  * `register-user` — alta de usuario con verificación captcha (Cloudflare Turnstile, post-pivot desde hCaptcha).
  * `whatsapp-webhook` — recepción de eventos Meta con HMAC.
  * `brandfetch-proxy` — proxy a Brandfetch para enriquecimiento de logos.
  * `wa-webhook` — **deprecado**, eliminado el 2026-04 (legacy V14 sin HMAC, reemplazado por `whatsapp-webhook`).
  * Toda llamada a OpenAI vive **solo** en Edge Functions; el frontend nunca tiene `OPENAI_API_KEY` ni instancia el cliente OpenAI directamente.

### Persistencia
* **PostgreSQL gestionado por Supabase** como única columna vertebral transaccional. No hay otras bases.
* **Migraciones** versionadas en `supabase/migrations/` con timestamp ISO. Generación automática de tipos TypeScript vía `npm run ops:db:generate-types`.
* **Sin caches externos:** todas las "vistas" analíticas son `VIEW` o `MATERIALIZED VIEW` en Postgres (ej. `analytics_daily_entity_rollup`, `v_trend_week_over_week`, `v_comparative_preference_summary`). Cuando una vista materializada se considera, se documenta su política de refresh en el mismo migration.

### Despliegue
* **Vercel** para el frontend (build estático Vite). Headers de seguridad CSP/HSTS centralizados en `vercel.json` (`F-06`).
* **Supabase Cloud** para BD + Auth + Edge Functions. Secrets gestionados con `supabase secrets set` (no en `.env` del repo). Runbook de rotación en `docs/runbooks/secrets-rotation.md`.
* **CI:** GitHub Actions con `tsc`, `vitest`, lint y un step de coverage (gate soft con `|| true`, hard-gate pendiente — ver `F-11`).

### Capa de tiempo real
**No implementada y no proyectada en el corto plazo.** Las pantallas que parecen "vivas" (resultados que cambian post-voto, ranking que se reordena) lo logran con TanStack Query: invalidación selectiva, optimistic updates y refetch dirigido. Si en algún momento se necesita push real desde el servidor, la opción nativa es `supabase.channel(...)` (Supabase Realtime sobre WebSockets) — la integración requiere su propio doc de diseño antes de tocarse.

## 3. Lo que NO está en el stack (anti-patrón documentado)

Para evitar que documentos viejos confundan a futuros colaboradores, dejamos explícito lo que **no** existe:

* **No hay Redis** ni cualquier caché en memoria distribuido. La idea original de "buffer de alta frecuencia" la cubre el outbox client-side y los rate limits server-side.
* **No hay colas de mensajes** (sin RabbitMQ, sin SQS, sin pg_boss). Las tareas asíncronas se resuelven con Edge Functions invocadas directamente.
* **No hay WebSockets propios** ni Socket.io. La única opción de realtime futura sería Supabase Realtime nativo.
* **No hay servicio de Node.js propio.** Todo lo que necesita correr server-side vive en Edge Functions Deno.
* **No hay Next.js / SSR.** SPA pura sobre Vite. SEO se maneja con metas estáticas y, si se necesitara SSR para landing, sería decisión nueva en otro doc.
* **No hay OpenAI desde el navegador.** Cualquier llamada a OpenAI viaja por Edge Functions; `dangerouslyAllowBrowser` está prohibido en `src/`.
