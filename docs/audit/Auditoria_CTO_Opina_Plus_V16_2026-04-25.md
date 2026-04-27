# Auditoría CTO — Opina+ V16

**Fecha:** 2026-04-25
**Auditor:** Director CTO (revisión integral pre-producción)
**Alcance:** Backend Supabase (60+ migraciones, 14 edge functions), frontend React (~352 archivos TS/TSX), seguridad, calidad, deuda técnica.
**Verdict global:** 🟠 **NO listo para producción con datos reales.** Sólido en arquitectura y disciplina de tipos, pero con **5 vulnerabilidades críticas** y **un trigger admin roto** que deben cerrarse antes de abrir.

---

## TL;DR — Lo que importa antes de abrir

| # | Hallazgo | Severidad | Impacto |
|---|---|---|---|
| 1 | `wa-webhook` (Edge Function) **sin HMAC** y con token default `'my_super_secret_token'` | 🔴 Crítico | Spoofing total de WhatsApp; Meta sigue llamando aquí |
| 2 | Trigger `audit_role_changes` inserta en columna inexistente `target_resource` → **falla silenciosa** | 🔴 Crítico | Cambios de rol admin no se auditan |
| 3 | 7 tablas analíticas con RLS **habilitado pero sin policies** (efecto: bloquea todo, incluso lecturas legítimas si alguien revoca service_role) | 🔴 Crítico | Fragilidad operativa + falsa sensación de seguridad |
| 4 | 3 edge functions con OpenAI sin **Zod / validación de input** → prompt injection viable | 🔴 Crítico | Jailbreak del LLM, costos no controlados |
| 5 | 5 archivos `.env*` con secretos reales en filesystem local (no en git, pero presentes — OpenAI, Supabase service_role, WhatsApp, Vercel OIDC) | 🟠 Alto | Riesgo si la máquina se compromete; secretos antiguos no rotados |
| 6 | `vercel.json` sin headers de seguridad (CSP, X-Frame-Options, etc.) | 🟠 Alto | Clickjacking, XSS amplificado |
| 7 | Función `is_admin` con **3 nombres** (`is_admin`, `is_admin_user`, `current_user_is_admin`) y semántica solapada | 🟠 Alto | Drift; un fix no aplica al otro |

Las 7 anteriores son las que recomiendo cerrar **esta semana**. Detalle completo abajo.

---

## 1. Backend Supabase

### 🔴 Crítico

**1.1 — `wa-webhook` (Edge Function legacy) sin HMAC**
- `supabase/functions/wa-webhook/index.ts:4` → `VERIFY_TOKEN = Deno.env.get(...) || 'my_super_secret_token'` (default leak).
- No verifica `x-hub-signature-256`. Cualquiera puede `POST` y meter eventos falsos en `whatsapp_webhook_logs`.
- Coexiste con `whatsapp-webhook` (que **sí** tiene HMAC y comparación timing-safe).
- **Tu memoria ya documenta esto** (`project_opina_s03_pending_meta`): falta apuntar Meta al webhook seguro y eliminar el legacy.
- **Fix:** apuntar Meta a `whatsapp-webhook`, deshabilitar/borrar `wa-webhook`, rotar `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

**1.2 — Trigger `audit_role_changes` referencia columna inexistente**
- `supabase/migrations/20260425031603_security_fix_prevent_role_escalation.sql:153`:
  ```sql
  INSERT INTO admin_audit_log (actor_user_id, action, target_resource, details)
  ```
- Pero `admin_audit_log` (migración `20260424000100`) define `target_type`, `target_id`, `payload`. **`target_resource` y `details` no existen.**
- Los cambios de rol que pasen por este trigger fallarán o (si está envuelto en EXCEPTION) se ejecutarán sin auditoría.
- **Fix:**
  ```sql
  INSERT INTO admin_audit_log (actor_user_id, action, target_type, target_id, payload)
  VALUES (auth.uid(), 'role_changed', 'public.users', NEW.user_id::text,
          jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
  ```

**1.3 — RLS habilitado sin policies en tablas analíticas**
- `supabase/migrations/20260423000001_enable_rls_analytics_fase2.sql` activa RLS en `user_daily_metrics`, `signal_hourly_aggs`, `signal_rollups_hourly`, `category_daily_aggregates`, `entity_daily_aggregates`, `rollup_state`, `volatility_snapshots` — pero **sin** `CREATE POLICY`.
- Hoy funciona porque solo se accede vía service_role (que bypassa RLS). Pero el patrón es frágil: si mañana alguien GRANT-ea SELECT a `authenticated`, RLS bloqueará todo silenciosamente y romperá analytics.
- **Fix:** policy explícita de denegación + comment:
  ```sql
  CREATE POLICY "deny_all_authenticated"
    ON public.user_daily_metrics FOR ALL TO authenticated
    USING (false) WITH CHECK (false);
  COMMENT ON POLICY ... IS 'Backend-only via service_role';
  ```

**1.4 — Función admin con 3 nombres**
- `is_admin()` (migración 20260330000002), `is_admin_user()` (migración 20260424000200), `current_user_is_admin()` (migración 20260425031603).
- Cada una se usa en distintas policies/triggers. Un fix de seguridad solo aplica a la que actualizas.
- **Fix:** consolidar en `is_admin_user()`, dejar las otras como `CREATE OR REPLACE` que delegan a la canónica, deprecar.

### 🟠 Alto

**1.5 — Migraciones `_rollback_*` aún en `supabase/migrations/`**
- 5 archivos (`_rollback_20260423000000_*.sql` … `_rollback_20260423000004_*.sql`) que nunca se aplicaron y ya son obsoletos. Generan ruido.
- **Fix:** mover a `supabase/migrations/.archive/` o eliminar (si necesitás rollback futuro, escribís migración nueva).

**1.6 — Falta de idempotencia en `20260313024718_add_loyalty_program.sql`**
- 7 `CREATE TABLE` sin `IF NOT EXISTS`. Bloquea cualquier rollback+reapply.
- **Fix:** agregar `IF NOT EXISTS` a las 7 (`loyalty_levels`, `loyalty_actions`, `user_loyalty_stats`, `user_wallets`, `wallet_transactions`, `weekly_missions`, `user_weekly_mission_progress`).

**1.7 — Índices faltantes en agregados analíticos**
- `analytics_daily_entity_rollup`, `analytics_daily_segment_rollup`, `analytics_daily_depth_rollup` no tienen índices compuestos para el patrón (day DESC, entity_id, segmentación). Hoy es barato; al volumen de B2B se vuelve caro.
- **Fix:** índices compuestos por las queries reales (revisar logs de pg_stat_statements antes).

### 🟡 Medio

**1.8 — `seed.sql` (333 KB) no idempotente**
- UPDATE a `entities` sin `ON CONFLICT`. Re-ejecutar puede borrar imágenes que ya están bien.
- **Fix:** `WHERE image_url IS NULL OR image_url <> '...'`.

**1.9 — `cleanup_all_users_and_data.sql` suelto en `supabase/`**
- Script DESTRUCTIVO en raíz de `supabase/`, sin marca clara y al alcance de cualquier `psql -f`.
- **Fix:** mover a `supabase/dangerous/` y agregar guard `RAISE EXCEPTION` si `current_database() LIKE '%prod%'`.

**1.10 — Edge Functions sin rate limiting**
- `actualidad-bot`, `versus-bot`, `insights-generator`: hacen fetches externos / llamadas a OpenAI sin throttling. Riesgo de DoS externo o costo desbocado en OpenAI.
- **Fix:** rate limit en tabla `function_call_logs` con sliding window por user_id.

**1.11 — `register-user` sin pre-check de email duplicado**
- Confía en el UNIQUE de auth.users. La UX en colisión es un 500 sin mensaje.
- **Fix:** SELECT previo + mensaje claro.

---

## 2. Seguridad

### 🔴 Crítico

**2.1 — Prompt injection en 3 edge functions con OpenAI**
- `llm-narrative/index.ts:96-127` interpola `entry.entityName`, `entry.stabilityLabel`, etc. **sin Zod**. Un payload con `\n\nIgnore all previous instructions...` jailbreakea el LLM.
- `insights-generator/index.ts:26-39` toma `battle_slug` sin validar formato.
- `versus-bot/index.ts:38-48` toma `category_slug` sin validar formato.
- **Fix:** Zod con `regex(/^[a-z0-9_-]+$/)` y `z.string().min(1).max(100)` en cada input antes de tocar el prompt.

### 🟠 Alto

**2.2 — 5 archivos `.env*` con secretos reales en filesystem**
- `.env`, `.env.local`, `.env.development.local`, `.env.vercel.prod`, `.env.vercel.tmp`.
- Verifiqué: **NO están en git** (solo `.env.example`). El `.gitignore` los cubre correctamente.
- Pero contienen: `OPENAI_API_KEY` (sk-proj-…), `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, Vercel OIDC JWTs. Son secretos vivos.
- **Fix recomendado:**
  1. Rotar OpenAI key (probable que ya esté en muchos lados).
  2. Rotar Supabase service_role.
  3. Rotar WhatsApp access token.
  4. Borrar `.env.vercel.prod` y `.env.vercel.tmp` (se manejan en Vercel Dashboard, no en disco).
  5. Quedarte con `.env.local` único para dev.

**2.3 — `vercel.json` sin headers de seguridad**
- Sin CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Fix:** agregar bloque `headers` en `vercel.json` (CSP que permita Supabase + OpenAI + fonts; X-Frame-Options DENY).

**2.4 — CORS abierto a `*` en todas las edge functions**
- `supabase/functions/_shared/requireAdmin.ts:4-8`. Mitigado parcialmente porque hay JWT, pero amplía superficie.
- **Fix:** allowlist con `opinamas.app`, `app.opinamas.app`, `localhost:5173`.

### 🟢 Bien (mantener)

- `whatsapp-webhook` (el seguro) hace HMAC-SHA256 con comparación timing-safe. Excelente.
- `register-user` valida email/password/nickname con regex y rate-limita 5/min/IP.
- `useSessionGuard` (multi-session lock) bien implementado.
- Cero `dangerouslySetInnerHTML` en `src/`. Cero markdown sin sanitizar.
- `<Gate>` envolviendo todas las rutas admin.
- Sentry + logger redactor de credenciales.

---

## 3. Frontend React

### 🟠 Alto

**3.1 — `AuthContext` recarga perfil en cada `onAuthStateChange`**
- `src/features/auth/context/AuthContext.tsx:59-75`. Cada cambio de auth state dispara un RPC. Con multi-session lock + supersesión hay riesgo de cascadas.
- **Fix:** debounce + caché por user_id, o migrar a React Query (el plan que ya tenés en memoria — `project_react_query_pendiente`).

**3.2 — `OptionCard` memoizado pero parents no usan `useCallback` para `onClick`**
- `OptionCard.tsx:285` tiene `React.memo(...)` con comparator granular, pero `onClick` y `momentum` llegan como nuevas refs en cada render del parent. **El memo no sirve.**
- **Fix:** `useCallback` en `VersusGame`/`SignalsHub` para `onVote`; `useMemo` para `momentum`.

**3.3 — Tres ErrorBoundary anidados sin responsabilidades claras**
- `src/components/ui/{GlobalErrorBoundary,ModuleErrorBoundary,ErrorBoundary}.tsx`. Ambigüedad: ¿cuál atrapa qué?
- **Fix:** consolidar a 2 (app-level + feature-level), documentar en JSDoc cuál cuándo.

**3.4 — `signalStore` (Zustand) persiste `streakDays`, `signalsToday`, `signalEvents` en localStorage**
- Cualquier usuario teclea `localStorage.clear()` y pierde streak. Cualquier usuario malicioso lo infla.
- **Fix:** mover `signalEvents` y métricas de gamification a server state (Supabase + React Query). Dejar solo UI ephemeral en Zustand.

**3.5 — `chart.js` (~200 KB) en bundle principal**
- Solo se usa en admin. Penaliza a B2C.
- **Fix:** dynamic `import()` en componentes admin.

### 🟡 Medio

**3.6 — Lazy loading sin Suspense fallback contextual**
- `App.tsx` lazy-carga todo, fallback genérico. Hasta `NotFound` se lazy-loadea (no debería).
- **Fix:** eager-load NotFound y Login; Suspense con skeleton por ruta.

**3.7 — `getCategories`/`getActiveBattles` se llaman 3+ veces sin caché**
- Home, SignalsHub y Admin las invocan sin compartir resultado.
- **Fix:** React Query con `staleTime: Infinity` para datos casi-estáticos.

**3.8 — `localStorage.getItem` sin try/catch en `signalWriteService.ts:37`**
- Safari Private rompe en QuotaExceededError.
- **Fix:** helper `safeLocalStorage` con try/catch.

**3.9 — `react-helmet-async` importado pero sin uso en pages**
- Sin títulos dinámicos por ruta, SEO pobre.
- **Fix:** `<Helmet>` con `title` + OG en cada page top.

### 🟢 Bien

- Estructura `features/` consistente, sin solapes graves.
- Cero dependencias circulares (verificado con `madge`).
- Naming consistente (PascalCase componentes, camelCase services, kebab-case carpetas).
- Sin `dangerouslySetInnerHTML`, sin `innerHTML` en código de producción.

---

## 4. Calidad de código y tests

### Métricas verificadas

| Métrica | Valor | Veredicto |
|---|---|---|
| `: any` explícito | 6 (todos en mocks/tests) | ✅ |
| `as any` | 0 | ✅ |
| `@ts-ignore` / `@ts-expect-error` | 1 | ✅ |
| `eslint-disable` | 16 (todos justificados) | ✅ |
| `console.log` en src/ | 1 | ✅ |
| `console.error` en src/ | 0 (se usa Sentry) | ✅ |
| `debugger;` | 0 | ✅ |
| TODO/FIXME/HACK | 1 | ✅ |
| Dependencias circulares (`madge`) | 0 | ✅ |
| TypeScript strict | activo | ✅ |
| ESLint con `no-explicit-any: error` | sí | ✅ |
| Cobertura test (archivos) | 17 / 352 ≈ 4.8% | ⚠️ baja en UI |
| E2E Playwright | 8 specs | ✅ smoke profesional |
| CI/CD (`validate.yml`) | typecheck → lint → test → build → e2e | ✅ |

### 🟡 Medio

**4.1 — Cobertura unitaria baja en componentes de UI**
- Tests sólidos para servicios críticos (rate limiter, narrativa, outbox, policy resolver). Pero los componentes refactorizados de Fase 2 (Hub, Results, B2B pages) no tienen tests.
- **Fix:** 15-20 tests de componentes en próxima sprint, con `@testing-library/react`.

**4.2 — Lint script no falla en warnings**
- `npm run lint` admite warnings.
- **Fix:** `lint: "eslint . --max-warnings=0"`.

**4.3 — Visual regression gateado (`E2E_VISUAL=1`)**
- `hub-visual.spec.ts` no se corre en CI. Sin baselines commiteados.
- **Fix:** generar baselines, commit, habilitar en CI.

---

## 5. Deuda técnica y limpieza

### 🟠 Alto

**5.1 — Dependencias no usadas en producción**
- `cheerio`, `csv-parse`, `csv-parser` (duplicado), `node-fetch` (Node 20 ya tiene fetch), `puppeteer` (devDep, solo legacy), `image-size`, `@types/image-size`, `uuid` (Supabase + crypto cubren).
- **Fix:** `npm uninstall cheerio csv-parse csv-parser node-fetch puppeteer image-size @types/image-size uuid`. Verificar build + tests.

**5.2 — `scripts/legacy_tools/` (36 archivos, ~1.2 MB)**
- Su propio README dice "obsoletos y desactivados", pero siguen en repo. Incluyen `.xlsx` y `.docx` históricos.
- **Fix:** mover a `archive/legacy-tools-v13/` (fuera del path de build) o eliminar (git history los preserva).

**5.3 — PDFs comerciales y técnicos trackeados en git (~50 MB)**
- `Opina_Comercial_v11.pdf` (9 MB), `Opina_Maestro_Comercial_v8.pdf`, `Presentación Tecnica-Economica Opina+.pdf`, varios en `docs/Normas Gráficas/`.
- `.gitignore` no tiene `*.pdf`. Inflan clones.
- **Fix:** `*.pdf` al `.gitignore`, `git rm --cached <archivos>`, mover a Drive/Notion/Wiki.

**5.4 — Docx fuera de lugar**
- `Auditoria_Tecnica_Opina_Plus_V16_2026-04-24.docx` y `Marco_Metodologico_KPIs_Opina_Plus_clean.docx` en raíz.
- **Fix:** mover a `docs/audit-reports/` y `docs/operations/` respectivamente.

**5.5 — 5 migraciones `_rollback_*` muertas**
- Ya cubierto en 1.5.

### 🟡 Medio

**5.6 — Confusión `src/supabase/` vs `supabase/`**
- Mismo nombre, distintos rol. Una es cliente, otra es proyecto Supabase.
- **Fix:** renombrar `src/supabase/` → `src/lib/supabase/` o `src/integrations/supabase/`.

**5.7 — Carpetas redundantes `src/lib/` vs `src/shared/utils/` vs `src/services/`**
- Sin reglas claras (`shared/utils/rateLimit.ts` único allí; `services/` con 1 archivo).
- **Fix:** colapsar `shared/utils/` y `services/` en `lib/`. Documentar en `docs/architecture/code-organization.md`.

**5.8 — Tests en 4 ubicaciones distintas**
- `src/test/smoke/`, `tests/`, `e2e/`, inline `src/**/*.test.tsx`.
- Funcionalmente OK (cada `npm script` apunta a su lugar), pero sin guía escrita.
- **Fix:** `docs/testing/guidelines.md` con la regla.

**5.9 — Documentación con sufijo `v13` (8+ archivos)**
- `feature-canon-v13.md`, `architecture-v13.md`, etc. Confunde si son históricos o vivos.
- **Fix:** si están vigentes, renombrar (sin versión); si históricos, `docs/archive/v13/`.

**5.10 — CSVs históricos en `docs/catalog/` (`batch_1..8.csv`, `partial_dominios*.csv`, `todas_las_marcas.csv`, `logo-fetch-report.csv`)**
- Mezcla de inputs activos y outputs viejos.
- **Fix:** `docs/catalog/README.md` enumerando cuáles son fuente vs derivado, archivar los derivados.

**5.11 — `seed.sql` y `supabase/seeds/` coexisten**
- Doble fuente de verdad para datos seed.
- **Fix:** consolidar en `supabase/seeds/` con un README que liste el orden de aplicación.

### 🟢 Bajo

**5.12 — README menciona scripts legacy sin marca**
- 4 scripts `legacy:logos:*` en `package.json` no aparecen marcados en README.
- **Fix:** sección "Scripts deprecated" en README.

**5.13 — `src/index.css` tiene `--primary` y `--secondary` como "LEGACY ALIAS"**
- Si nadie los usa, eliminar (greppear primero).

**5.14 — Botones icon-only sin `aria-label`**
- `OptionCard` y otros. Accesibilidad básica.
- **Fix:** auditar todos los `<button>` sin texto y agregar `aria-label`.

---

## 6. Plan de remediación priorizado

### Sprint 0 — esta semana (blockers de producción)

1. **Apuntar Meta a `whatsapp-webhook` y eliminar `wa-webhook`.** (1.1)
2. **Arreglar trigger `audit_role_changes`** (cambiar `target_resource`/`details` a `target_type`/`target_id`/`payload`). (1.2)
3. **Agregar Zod a `llm-narrative`, `insights-generator`, `versus-bot`.** (2.1)
4. **Headers de seguridad en `vercel.json` (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).** (2.3)
5. **Rotar secretos** (OpenAI, Supabase service_role, WhatsApp). Eliminar `.env.vercel.*`. (2.2)
6. **Policies explícitas `deny_all_authenticated` en las 7 tablas analíticas con RLS vacío.** (1.3)
7. **Consolidar `is_admin` / `is_admin_user` / `current_user_is_admin`.** (1.4)

**Tiempo estimado:** 1 sprint (~5 días dev + 1 día QA).

### Sprint 1 — próxima semana (estabilización)

8. Eliminar dependencias no usadas (5.1).
9. `lint --max-warnings=0` + visual regression activado (4.2, 4.3).
10. CORS allowlist en edge functions (2.4).
11. `useCallback` en parents de `OptionCard`; consolidar ErrorBoundary (3.2, 3.3).
12. Mover `signalEvents` y métricas de gamification a React Query / Supabase (3.4) — alineado con `project_react_query_pendiente`.
13. Lazy load `chart.js` (3.5).
14. Migraciones rollback huérfanas: archivar (1.5).

### Sprint 2 — limpieza profunda

15. Reorganizar carpetas (`shared/`, `services/`, `lib/`) y renombrar `src/supabase/` (5.6, 5.7).
16. Eliminar `scripts/legacy_tools/` y PDFs del repo (5.2, 5.3).
17. Documentar `docs/architecture/code-organization.md` y `docs/testing/guidelines.md`.
18. Cobertura unitaria de UI: 15-20 tests para Hub, Results, B2B (4.1).
19. `seed.sql` idempotente (1.8).
20. Rate limiting en edge functions (1.10).

---

## 7. Lo que está bien (no tocar)

Para que la crítica no oculte lo bueno:

- **Disciplina de tipos extraordinaria.** Cero `as any`, 6 `: any` todos justificados, lint estricto.
- **Documentación maestra de calidad atípica** (`PROJECT_MASTER_STATUS.md`, `DEBT_REGISTER.md`, `ONBOARDING_DEVELOPER.md`). Cada deuda cerrada con trazabilidad.
- **CI/CD robusto** (`.github/workflows/validate.yml`).
- **Arquitectura `features/` modular y sin dependencias circulares.**
- **`whatsapp-webhook` (el seguro), `register-user`, `useSessionGuard`** — implementaciones de calidad senior.
- **`admin_audit_log` con `log_admin_action()` SECURITY DEFINER** — patrón correcto.
- **Migraciones de RLS Fase 1-5 ejecutadas y verificadas.**
- **Cero XSS detectado, cero secretos en git, cero `dangerouslySetInnerHTML`.**

---

## 8. Conclusión ejecutiva

El proyecto está en el **percentil 90 de calidad** para un repo React + Supabase. La arquitectura es seria, la documentación es ejemplar, la disciplina de tipos es modélica.

Pero hay **3 bugs críticos concretos** (webhook legacy sin HMAC, trigger admin con columna inexistente, RLS vacío) y **un vector de prompt injection** que **bloquean abrir a producción con datos reales**. Son fixes acotados (1 sprint), no rediseños.

Cerrando el Sprint 0, el sistema queda **listo para producción**. Sprint 1 y 2 son pulido para llevar al 100%.

---

*Generado por auditoría automatizada en paralelo: backend / frontend / seguridad / calidad / deuda técnica. Verificaciones manuales aplicadas a hallazgos de mayor severidad antes de reportar.*
