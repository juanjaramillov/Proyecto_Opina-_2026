# Auditoría técnica integral — Opina+ V16
**Fecha:** 2026-04-28
**Alcance:** arquitectura, código, funcionamiento. NO incluye UI/UX, paleta, branding ni copy.
**Modo:** análisis crítico, sin cambios al código.

---

## Resumen ejecutivo

Después de 13 commits hoy en distintas áreas (migración React Query completa, limpieza de docs, hard-gate de coverage, working tree sincronizado con synthetic seeder + commercial flags + base de Intelligence B2B), el proyecto está **estructuralmente sólido** en varias dimensiones críticas pero arrastra **deudas concretas que pueden morder en producción si crece la carga o se vende a clientes B2B con pretensiones serias de compliance**.

El backend Supabase tiene una arquitectura defensiva razonable (97 tablas con RLS, 247 funciones SECURITY DEFINER, 39 de 40 RPCs admin invocan `admin_audit_log`, idempotencia por `client_event_id` UNIQUE en `signal_events`, Outbox client-side robusto con MAX_QUEUE 500 y retención 7 días, Wilson + OpinaScore implementados con multiplicador de integridad, hCaptcha→Turnstile + HMAC en webhook de WhatsApp, CSP estricto en producción). El frontend está mayoritariamente migrado a TanStack Query con defaults sensatos (staleTime 5min, retry 1, refetchOnWindowFocus false), tests unitarios subiendo de baseline, typecheck en EXIT=0 y CI con hard-gate honesto. **Estos son hechos importantes y no triviales** — muchos repos de tamaño similar fallan en una o más de estas dimensiones.

Sin embargo, hay **cuatro hallazgos críticos o altos que recomiendo abordar antes de cualquier venta B2B real**:

1. **Contaminación de datos sintéticos en métricas analíticas.** El sistema de seed sintético agrega `is_synthetic` a `users` y `user_profiles`, pero **no a `signal_events`**, y las vistas analíticas (`signal_events_analytics`, `signal_events_analytics_clean`) y los RPCs de B2B (`get_b2b_battle_analytics`, `calculate_opinascore_v1_1`) **no filtran por `is_synthetic`**. Si un cliente B2B paga por inteligencia y los seeds sintéticos están corriendo (uso normal en demos), las métricas que ve están mezcladas con data ficticia. Esto es un riesgo legal y reputacional real.

2. **5 vistas consumidas por código que no existen en el repo.** `resultsCommunityReadModel.ts` lee con `as unknown as` cinco vistas (`v_entity_reputation_risk`, `v_avg_response_ms_daily`, `v_topic_persistence`, `v_entity_volatility_cross_modules`, `v_trust_vs_choice_gap`) que no aparecen en `supabase/migrations/` ni en `database.types.ts`. Si la BD prod no las tiene, las queries fallan en runtime silenciosamente (los casts `as unknown as` esquivan el typecheck). Si la BD prod sí las tiene, hay drift no versionado.

3. **Capability gating B2B inexistente.** Hay base de UI implementada (`IntelligenceTierScopeSelector`, `tierScopeMatrix.ts`) pero `role` es `TEXT` libre en la tabla `users` (no enum), no hay tabla de tiers, no hay enforcement server-side. Si vendés acceso a "B2B Pro" para narrativa LLM, el único gate es la whitelist `['admin', 'b2b_pro']` en `llm-narrative/index.ts:18` — y el rol `b2b_pro` no se asigna en ningún lugar del código actual. Pagás dos riesgos: (a) clientes con `role='b2b'` plano podrían pretender acceso premium y técnicamente nada los detiene; (b) la spec de monetización (`monetization-plans-v13.md`) describe 4 tiers que no existen.

4. **Base de datos no particionada y sin política de retención.** `signal_events` es la tabla más grande del producto (todas las interacciones de usuarios) y no está particionada. Tiene 15 índices razonables, pero a medida que crece (estimando >100k signals/mes a escala) las queries de rango (`created_at` entre fechas) se van a degradar exponencialmente. Tampoco hay job de limpieza/archivado de signals viejos.

Hay además **deudas medias** de tamaño no trivial: 20 god components >300 líneas (los 5 más grandes superan 444 líneas), 3 dependencias circulares detectadas por madge, 41 `as unknown as` y 10 `as any` que ocultan problemas reales o son workarounds legítimos (mezclados), 63 exports muertos detectados por ts-prune, ningún pre-commit hook ni Dependabot, React 18.2 frente a 19 disponible, coverage real al 13.28% (lines), un fallback de seguridad inseguro en `admin_search_users.sql` que bypasea el check de admin si `auth.uid()` es null (pensado para "dev local" pero deployable).

Hay **un riesgo sistémico** que merece nombre propio: **el patrón "vistas SQL sin versionar" + "tipos Supabase desincronizados"**. La aparición de 5 vistas en código consumidas con cast `as unknown as`, junto con el hallazgo en sesiones anteriores de RPCs `seed_synthetic_batch` y `delete_synthetic_batch` que existían en BD pero no en `database.types.ts`, sugiere que el ciclo "aplicar migración → regenerar types → commitear types" no está disciplinado. Eso es exactamente el tipo de drift que hace que un equipo pierda visibilidad sobre el contrato real entre app y BD.

A continuación, las tablas detalladas por bloque, el top-10 priorizado, el mapa de salud y la recomendación de próximos sprints.

---

## Bloque A — Estructura, data layer, anti-patterns React

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| A-01 | ALTO | 3 dependencias circulares detectadas por madge | `useBenchmarkB2BState.ts ↔ narrativeProvider.ts ↔ narrativeEngine.ts`; `LugarDetailView.tsx ↔ LugarSignalWizard.tsx` | Rompe tree-shaking (bundle más grande), aumenta riesgo de bugs por orden de inicialización indefinido | M | Romper ciclos extrayendo tipos/constantes a archivo neutro; o invertir dependencia con dependency injection |
| A-02 | ALTO | 4 llamadas directas `supabase.from()` desde un componente React (no service) | `src/features/signals/components/versus/VersusGamificationCard.tsx` | Rompe boundary de capas; el componente no es testeable sin mockear Supabase entero | S | Mover queries a un hook (`useGamification`) o service dedicado |
| A-03 | MEDIO | 20 god components >300 líneas (top 5 superan 444 líneas) | `AdminEntities.tsx 765`, `ServiciosView.tsx 485`, `InsightsChartsSection.tsx 451`, `IntelligenceLanding.tsx 447`, `InsightPack.tsx 444` | Cuesta entender, modificar y testear; aumenta blast radius de bugs | L | Extraer subcomponentes con responsabilidad única (header, body, modal, lista) |
| A-04 | MEDIO | 63 exports muertos detectados por ts-prune | `userMasterResultsReadModel.ts:9` (read-model entero sin consumidores), múltiples helpers en `analyticsTypes.ts`, `metricLabels.ts:7` | Código que se mantiene pero nadie usa; engaña en futuras lecturas | M | Borrar después de doble verificación de cada export |
| A-05 | MEDIO | 3 archivos con patrón viejo `useEffect+setLoading+supabase` (no migrado a TanStack Query) | `Login.tsx`, `VersusGamificationCard.tsx`, `B2BLeadForm.tsx` | Inconsistencia de cache, riesgo de race conditions, fricción para refetch coordinado | S | Migrar a `useQuery` con queryKey por entidad |
| A-06 | BAJO | 15 archivos con `setInterval`/`setTimeout` sin `clearInterval`/`clearTimeout` (heurística) | Top: `Profile.tsx`, `VersusGame.tsx`, `ProgressiveRunner.tsx`, `signalOutbox.ts` | Posible memory leak si el componente desmonta sin cleanup | M | Auditar uno a uno; muchos pueden ser one-shot o estar dentro de cleanup return |
| A-07 | BAJO | NO hay supabase Realtime ni suscripciones abiertas | grep `supabase.channel\(` = 0 | Sin riesgo de leak por suscripciones mal cerradas (positivo, no hallazgo) | — | — |
| A-08 | INFO | Outbox cliente sólido | `signalOutbox.ts`: MAX_QUEUE 500, MAX_AGE_MS 7 días, IDB persistente, idempotencia por client_event_id, prune en cada flush | Bueno: garantiza durabilidad ante crash y network failure | — | Mantener |

**Síntesis Bloque A:** la estructura de capas está correctamente segmentada (0 imports cruzados entre features, query client centralizado con defaults sensatos, outbox bien diseñado). Los problemas son de *higiene* más que de *diseño*: ciclos en B2B/feed, god components que crecieron sin ser refactorizados, dead code acumulado y un componente que llama Supabase directo (`VersusGamificationCard`). Riesgo sistémico bajo, pero la deuda crece silenciosamente — a los 6 meses sin atender esto, el costo de cambio en cada PR aumenta visiblemente.

---

## Bloque B — Backend Supabase, integrity, escalabilidad, signals model

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| B-01 | **CRÍTICO** | Datos sintéticos contaminan métricas B2B/B2C: `signal_events` no tiene columna `is_synthetic` ni filtro en vistas analíticas | `signal_events_analytics`, `signal_events_analytics_clean` solo filtran por `antifraud_flags`, NO por `is_synthetic`; RPCs B2B (`get_b2b_battle_analytics`, `calculate_opinascore_v1_1`) tienen 0 menciones de `is_synthetic` | Si cliente B2B paga por insights y demos están corriendo, ve datos mixtos sintético+real sin saberlo. Riesgo legal/reputacional. | M | Opciones: (a) agregar `is_synthetic` derivable a `signal_events` vía JOIN con `users.is_synthetic` filtrado en CADA vista analítica, (b) usar schemas separados (`real`/`synthetic`) y exponer solo `real` a B2B. |
| B-02 | **ALTO** | 5 vistas consumidas por código pero NO existen en migrations ni en types | `resultsCommunityReadModel.ts` consume `v_entity_reputation_risk`, `v_avg_response_ms_daily`, `v_topic_persistence`, `v_entity_volatility_cross_modules`, `v_trust_vs_choice_gap` con cast `as unknown as` | Si BD prod no las tiene → runtime errors silenciados. Si las tiene → drift de schema no versionado. En cualquier caso, types desincronizados. | S | Verificar en BD prod si existen. Si sí: regenerar `database.types.ts` y commitear las migrations faltantes. Si no: borrar el código que las consume. |
| B-03 | **ALTO** | `signal_events` no está particionada | `CREATE TABLE signal_events` sin `PARTITION BY` en `consolidated_baseline.sql` | Tabla más grande del producto (toda interacción de usuario). A escala >1M rows, queries de rango por `created_at` se degradan; reindex y vacuum se vuelven costosos | L | Particionar por mes (`PARTITION BY RANGE (created_at)`). Requiere migración cuidadosa con downtime planificado o con dual-write transitorio. |
| B-04 | **ALTO** | 0 índices en `analytics_daily_entity_rollup` | grep `CREATE INDEX.*analytics_daily_entity_rollup` = 0 | Tabla de rollups B2B; si crece a >100k filas, queries por entity_id + summary_date hacen full scan | S | Agregar índice compuesto `(entity_id, summary_date DESC)` |
| B-05 | MEDIO | Sin política de retención: signals viejos no se purgan | grep `DELETE.*FROM.*WHERE.*created_at` = 0 (excepto archivado de admin_audit_log) | A medida que crece la app, BD se llena indefinidamente. Costo Supabase y degradación en índices | M | Cron de archivado para signals >2 años (Ley 19.628 chilena permite retener anonimizado, pero idealmente eliminar PII derivada) |
| B-06 | MEDIO | 12 referencias a `PARTITION` pero no a tablas críticas | grep `PARTITION BY|PARTITION OF` = 12 ocurrencias | Hay particionamiento en *algunas* tablas, pero no en signal_events. Verificar cuáles | S | Auditar qué se particionó y por qué; replicar criterio para signal_events si aplica |
| B-07 | MEDIO | 10 RLS `USING (true)` post-baseline (loyalty, weekly_missions, whatsapp_webhook_logs, analytics) | `loyalty_levels`, `loyalty_actions`, `weekly_missions`, `analytics` (3 vistas) | Cualquier authenticated user puede leer estas tablas. Bajo riesgo si son catálogos públicos, pero `whatsapp_webhook_logs` no debería estar accesible a usuarios | S | Auditar cada caso. Catálogos OK con `USING(true)` para SELECT. Logs de webhook deberían ser admin-only. |
| B-08 | MEDIO | 39/40 RPCs admin invocan `log_admin_action`, falta uno | Verificar cuál no logea | Pérdida de auditoría en una operación admin específica | S | Identificar y agregar `log_admin_action` |
| B-09 | BAJO | 109 DROP POLICY o DISABLE ROW LEVEL SECURITY en migrations | grep en migrations | Alta volatilidad histórica (ya remediada por F-09). No es problema actual pero indica que el sistema RLS evolucionó por iteraciones, no por diseño inicial | — | Documentar en ADR la política definitiva |
| B-10 | INFO | Idempotencia robusta: `client_event_id` UNIQUE INDEX en `signal_events` | `signal_events_client_event_id_uidx WHERE client_event_id IS NOT NULL` | Doble-click no duplica votos. Bueno. | — | Mantener |
| B-11 | INFO | 15 índices en `signal_events`, 120 totales | grep | Cobertura razonable. GIN sobre `metadata` (JSONB) es buena práctica | — | Mantener |
| B-12 | INFO | 247 funciones SECURITY DEFINER, mayoría con `search_path` corregido en `20260425035000_set_search_path_security_definer.sql` | F-02 cerrado | Riesgo de privilege escalation por search_path mitigado | — | Verificar contra `pg_proc` en prod después de cualquier nueva función DEFINER |

**Síntesis Bloque B:** el backend tiene **buena defensa en profundidad** (RLS extenso, audit log, search_path remediado, idempotencia, índices generosos en signal_events). Pero hay **dos riesgos estratégicos**: contaminación con synthetic (B-01) y vistas no versionadas (B-02). Ambos se notan poco hoy pero pueden hundir una venta B2B grande. La falta de particionamiento (B-03) es la deuda de escalabilidad más cara: cuanto más se posterga, más costoso el rebuild.

---

## Bloque C — Type safety y flujos E2E críticos

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| C-01 | **ALTO** | Cron `cron-evaluate-weekly-missions` sin verificación de secret de invocación | `supabase/functions/cron-evaluate-weekly-missions/index.ts` no contiene `Authorization`, `Bearer`, ni `CRON_SECRET` | Cualquiera puede invocar el cron y disparar evaluación de misiones (potencial efecto sobre rewards) | S | Agregar header `x-cron-secret` o `Authorization: Bearer ${CRON_SECRET}` al cron y validarlo en la función |
| C-02 | MEDIO | 41 `as unknown as` en src/, varios para esquivar tipos faltantes | `resultsCommunityReadModel.ts` (5x para vistas), `metricsService.ts` (cast a 'categories' para vista no tipada), `authService.ts` y `depthService.ts` (cast del SupabaseClient por mismatch de versión PostgREST) | Los casts ocultan que `database.types.ts` no refleja schema completo | M | Regenerar types después de aplicar todas las migraciones; eliminar casts cuando sea posible |
| C-03 | MEDIO | 10 `as any` en src/ — la mayoría en tests pero 2 en código de producción | `DepthComplete.tsx` (`(profile as any)?.profileCompleteness`), `signalReadService.ts` (`sb.rpc as any`) | Los de producción ocultan campos que faltan en el tipo | S | Extender tipo de profile o regenerar types DB |
| C-04 | BAJO | TODO único en código: regenerar types | `AdminDemoLaunchpad.tsx`: "TODO: regenerar tipos con npm run ops:db:generate-types y remover el cast" | Confirma el patrón de drift de tipos | S | Resolver junto con C-02 |
| C-05 | INFO | typecheck limpio (`tsc --noEmit` EXIT=0) | Verificado | Bueno | — | Mantener |
| C-06 | INFO | 0 `@ts-ignore` y 0 `@ts-nocheck` | grep | Bueno: no se silencian errores con ignores absolutos | — | Mantener |
| C-07 | INFO | Zod en 2 edge functions críticas | `llm-narrative/`, `insights-generator/` | Validación robusta de payloads LLM | — | Mantener; replicar patrón en cualquier edge function nueva |
| C-08 | INFO | HMAC validation en webhook WhatsApp | `whatsapp-webhook/index.ts:14-30`: SHA-256 con `WHATSAPP_APP_SECRET` | Webhook seguro contra spoofing de Meta | — | Mantener |
| C-09 | INFO | Captcha + rate limit en `register-user` | `TURNSTILE_SECRET_KEY` + `rateLimitMap` por IP | Defense-in-depth en signup público | — | Mantener |

**Síntesis Bloque C:** el typecheck pasa limpio y la validación de inputs en endpoints críticos (LLM, webhook WhatsApp, signup) está implementada con Zod, HMAC y captcha. **Pero el cron `cron-evaluate-weekly-missions` está abierto al público** — eso es un hallazgo alto que se debe cerrar antes de monetizar misiones. Los 41 `as unknown as` no son catastróficos pero confirman el patrón de tipos desactualizados (B-02).

---

## Bloque D — Seguridad, auth profundo, privacidad/compliance

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| D-01 | **ALTO** | `admin_search_users` permite **bypass de admin check si `auth.uid()` es null** | `20260312230000_admin_search_users.sql:18-22`: comentario dice "If auth.uid() is null (service role), we bypass" — el código actual evalúa `current_setting('request.jwt.claims', true) IS NOT NULL`; si retorna null, NO valida nada | Cualquier invocación con `service_role` key (desde una edge function comprometida o mal configurada) puede listar todos los usuarios | S | Reemplazar el bypass por `RAISE EXCEPTION 'Access denied: no auth context'` cuando claims sea null |
| D-02 | **ALTO** | Capability gating B2B inexistente — solo whitelist hardcoded en una edge function | `llm-narrative/index.ts:18`: `const ALLOWED_ROLES = new Set(['admin', 'b2b_pro'])`. No hay enum de roles en BD ni RPC que asigne `b2b_pro`. La spec en `monetization-plans-v13.md` describe 4 tiers que no existen | Comercialmente no podés vender tiers diferenciados con confianza. El gating "real" lo hace una whitelist en una sola función. | M-L | Crear enum `subscription_tier` en BD (`free`, `b2c_plus`, `b2b_starter`, `b2b_pro`), añadir columna `users.tier`, añadir RPC `is_tier_at_least(user, required_tier)` y usar en cada gate (no solo LLM) |
| D-03 | MEDIO | NO hay endpoint "delete my account" para Right to be Forgotten (Ley 19.628 / GDPR) | grep `delete.*account|forget_user` no encuentra flujo de usuario; existe solo `cleanup-orphan-users` (admin-side) | Cliente B2B con preocupaciones legales puede pedir esto y no se puede honrar en UI; usuario final no puede ejercer derecho legal | M | Implementar `delete_my_account` RPC con SELECT FOR UPDATE + soft delete en `users` + cascade cleanup (signal_events anonimizadas a `anon_id` artificial, profile borrado, sesiones revocadas). Documentar en `/privacy` |
| D-04 | MEDIO | Sin banner cookie consent ni terms acceptance con tracking | grep `consent\|cookie.*banner\|terms.*acceptance` = 0 | Sentry + telemetría empiezan a tracker desde el primer load sin consentimiento explícito. Riesgo Ley 19.628 / GDPR | M | Implementar banner con default-deny para tracking opcional; gate Sentry/telemetría hasta que el usuario consienta |
| D-05 | MEDIO | Solo 9 archivos con `is_admin_user` check, pero hay 40 RPCs admin (heurística cruda) | grep | Falsos positivos altos: muchas RPCs hacen check inline (`SELECT FROM users WHERE role='admin'`). Pero D-01 confirma al menos un caso real con bypass. | S | Auditoría manual archivo por archivo (ya empezada con D-01) |
| D-06 | BAJO | `session_id` y `device_hash` en localStorage (no en cookie HTTP-only) | `useSessionGuard.ts`, `signalWriteService.ts` | Vulnerable a XSS si lo hubiera (con CSP estricto en su lugar el riesgo es bajo); `device_hash` se puede limpiar para evadir bans | M-L | Migrar `session_id` a cookie HTTP-only con SameSite=Strict (cambio de arquitectura, post-MVP) |
| D-07 | BAJO | Multi-tenancy: solo 3 referencias a `organization_id`/`tenant_id` en migraciones | grep | El sistema asume single-tenant. Si querés vender a múltiples clientes B2B con datos aislados, falta esa capa | XL | Decisión de roadmap: ¿el producto B2B vende "vista global del mercado" (donde todos ven los mismos signals) o "vista privada del cliente" (donde cada cliente tiene su tenant)? La arquitectura actual sirve solo para el primero. |
| D-08 | INFO | CSP estricto, HSTS, X-Content-Type-Options, Referrer-Policy en `vercel.json` | Verificado | Excelente defense-in-depth | — | Mantener; agregar dominios nuevos a connect-src/img-src antes de deploy |
| D-09 | INFO | Logger sanitiza PII (27 keys + 7 sufijos) | `lib/logger.ts:43-84` | Bueno: logs no contienen email/phone/token aunque el contexto lo pase | — | Mantener |
| D-10 | INFO | RLS en tablas críticas (profiles, signal_events, battles, user_sessions, admin_audit_log, b2b_leads) | Verificado | Bueno | — | Mantener |
| D-11 | INFO | b2b_leads con policy `Allow anonymous inserts WITH CHECK (true)` + `Allow admins to select` | Pattern correcto para form de leads | Cualquiera puede dejar un lead, solo admin puede leerlos. Bueno. | — | Mantener |
| D-12 | INFO | 0 secretos hardcoded en src/ (solo `DELETE_ALL_CONFIRM_TOKEN` que es UX, no secreto) | grep | Bueno | — | Mantener |
| D-13 | INFO | 0 ocurrencias de `dangerouslyAllowBrowser` ni imports de `openai` en src/ | grep | OpenAI estrictamente backend-only ✓ | — | Mantener |

**Síntesis Bloque D:** la base de seguridad está sólida (CSP, RLS amplio, sanitización de logs, hCaptcha→Turnstile, HMAC en webhooks, OpenAI solo en backend). **Pero D-01 y D-02 son hallazgos altos que afectan la propuesta comercial**: si vendés B2B, no podés tener un bypass admin "para dev local" en producción ni tiers que no existen. D-03/D-04 son de compliance — si Opina+ apunta a sector regulado o si firma DPA con clientes corporativos, hay que cerrarlos.

---

## Bloque E — Concurrencia, resiliencia, ops, CI/CD

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| E-01 | MEDIO | Sin pre-commit hooks ni Dependabot/Renovate | No existe `.husky/`, no existe `.github/dependabot.yml` ni `renovate.json` | Errores TS/lint pueden llegar a CI sin filtro local; deps no se actualizan automáticamente | S | Agregar husky+lint-staged para `tsc --noEmit && eslint`; agregar Dependabot config con grouping de minors |
| E-02 | MEDIO | Timeout default en `supabase.functions.invoke` (60s) | grep | Si edge function se cuelga, UX espera 60s. El cliente OpenAI ya usa `withTimeout(TIMEOUT_MS, …)` en `llm-narrative` (12s), pero el caller cliente espera 60s | S | Agregar `signal: AbortSignal.timeout(15000)` al cliente que invoca |
| E-03 | MEDIO | Sin alerting / on-call definido | grep alerting + Sentry config | Sentry está conectado pero no veo alertas activas en `index.tsx` Sentry.init | S | Configurar alertas en Sentry para tasa de errores > X por minuto |
| E-04 | BAJO | 5 archivos `_rollback_*.sql` para migrations RLS | `supabase/migrations/` | Buena práctica DR (fase de RLS revertible) | — | Mantener |
| E-05 | BAJO | 0 migrations destructivas (DROP COLUMN, ALTER TYPE) en últimos 30 días | grep | Bueno: no se está haciendo cambios destructivos en producción sin gate | — | Mantener |
| E-06 | INFO | client_event_id propagado en Outbox para idempotencia | `signalOutbox.ts` | Bueno | — | Mantener |
| E-07 | INFO | Backoff/retry implementado en al menos 20 referencias | grep | Hay manejo de network failures | — | Mantener |
| E-08 | INFO | Workflow CI con typecheck + lint + tests + coverage hard-gate + build | `.github/workflows/validate.yml` | Pipeline correcto | — | Mantener |

**Síntesis Bloque E:** la resiliencia operacional es razonable (idempotencia client-side, retry en LLM, rollback files para RLS, hard-gate de coverage). Lo que falta es la **capa de "deploy safety automation"**: pre-commit hooks (E-01) y alerting reactivo (E-03). Son inversiones chicas con retorno alto en tiempo de detección de problemas.

---

## Bloque F — Performance, testing, observabilidad, deuda

| ID | Sev | Hallazgo | Evidencia | Impacto | Esfuerzo | Recomendación |
|---|---|---|---|---|---|---|
| F-01 | MEDIO | Coverage real al 13.28% lines / 12.63% statements / 9.62% branches / 10.53% functions | vitest output 2026-04-28 | Lejos del threshold aspiracional 70/60. Tests cubren áreas críticas (signals, observability, narrativeEngine, deviceFingerprint, stores, read-models recientemente). Resto sin tests. | XL | Sprint dedicado a coverage. Targets pendientes: `resultsCommunityReadModel.ts` (1011L), componentes UI grandes con lógica (`AdminEntities`, `ProfileWizard`). |
| F-02 | MEDIO | React 18.2 (latest 19.x), Vite 6.4 (latest 7.x) | package.json | Major upgrades pendientes; React 19 trae mejoras de performance y nuevas APIs útiles | M | Bump major en sprint dedicado, con changelog review |
| F-03 | BAJO | 34 console.log/warn/error en src/ (mayoría en código de inicialización legítima) | grep | Ruido en consola del usuario en prod | S | Reemplazar logs decorativos por `logger.*`; mantener solo errores críticos |
| F-04 | BAJO | 0 N+1 queries detectados en heurística básica | grep `supabase\.from` dentro de map/forEach/for | Bueno | — | Mantener vigilancia |
| F-05 | INFO | 35 `lazy()` en App.tsx para 52 rutas | grep | Code splitting cubierto en mayor parte del routing | — | Mantener |
| F-06 | INFO | 58 `useMemo`/`useCallback` en features | grep | Memoización razonable; no exceso | — | Mantener |
| F-07 | INFO | Sentry conectado en `index.tsx` con dynamic import (lazy) | `src/index.tsx` + `lib/observability/SentryReporter.ts` | Bueno: lazy import evita bloat en initial bundle | — | Mantener |
| F-08 | INFO | 0 tests deshabilitados con `.skip`/`xit`/`xdescribe` | grep | Bueno: no hay tests ocultos | — | Mantener |
| F-09 | INFO | 1 TODO único en código (relacionado a regenerar types) | `AdminDemoLaunchpad.tsx` | Bueno: no hay deuda explícita acumulada en TODOs | — | Resolver junto con C-02 |

**Síntesis Bloque F:** observabilidad está bien (Sentry conectado, logger estructurado con sanitización, audit log invocado). Performance no muestra red flags inmediatas. **El hallazgo grueso es coverage**: 13% es lejos del aspiracional, pero el hard-gate previene degradación y el sprint actual está subiendo baseline incremental. Decision pending: ¿invertir 1-2 semanas en sprint dedicado de tests, o mantener crecimiento incremental?

---

## Top 10 hallazgos prioritarios

| Rank | ID | Severidad | Hallazgo | Esfuerzo | Por qué primero |
|------|------|-----------|----------|----------|-----------------|
| 1 | B-01 | CRÍTICO | Datos sintéticos contaminan métricas analíticas | M | Riesgo legal/reputacional inmediato si se vende B2B con seeds activos |
| 2 | D-01 | ALTO | `admin_search_users` con bypass de admin check | S | 30 min de fix, alto upside de seguridad |
| 3 | C-01 | ALTO | Cron sin secret de invocación | S | 1 hora, cierre de superficie expuesta |
| 4 | B-02 | ALTO | 5 vistas SQL no versionadas en migrations | S-M | Drift de schema; bug latente en runtime |
| 5 | D-02 | ALTO | Capability gating B2B inexistente | M-L | Bloquea venta seria de tiers; pre-requisito para monetización B2B |
| 6 | B-03 | ALTO | `signal_events` no particionada | L | Inversión preventiva; cuanto antes, mejor (escala) |
| 7 | A-01 | ALTO | 3 dependencias circulares | M | Rompe tree-shaking; arreglo conocido |
| 8 | A-02 | ALTO | Componente React con `supabase.from()` directo | S | 30 min, alinea con el patrón del resto del repo |
| 9 | D-03 | MEDIO | Sin "delete my account" para Right to be Forgotten | M | Pre-requisito para DPA con clientes corporativos / Ley 19.628 |
| 10 | C-02 + F-09 | MEDIO | 41 `as unknown as` y TODO de regenerar types | M | Resolver el drift de types remueve los casts y cierra parte de B-02 |

---

## Mapa de salud por pilar

| Pilar | Estado | Justificación |
|-------|--------|---------------|
| 1. Arquitectura/estructura | 🟡 Amarillo | Boundaries OK, pero god components y ciclos circulares |
| 2. Backend Supabase | 🟡 Amarillo | RLS y audit log buenos, pero synthetic contamination + vistas no versionadas + sin partitioning |
| 3. Data layer frontend | 🟢 Verde | TanStack Query migrado, defaults sensatos, outbox robusto |
| 4. Type safety | 🟢 Verde | typecheck EXIT=0, 0 ts-ignore. Solo casts as unknown as |
| 5. Flujos E2E | 🟢 Verde | Idempotencia, captcha, HMAC, multi-session lock funcionando |
| 6. Seguridad aplicativa | 🟢 Verde | CSP, HSTS, sanitización, OpenAI backend-only |
| 7. Performance | 🟢 Verde | Code splitting, sin N+1 detectados, memoization razonable |
| 8. Testing | 🟡 Amarillo | Hard-gate honesto pero baseline 13% — lejos de 70 |
| 9. Observabilidad | 🟢 Verde | Sentry, logger sanitizado, audit log |
| 10. Deuda técnica | 🟡 Amarillo | 63 dead exports, deps majors desactualizadas, sin pre-commit |
| 11. Concurrencia/race | 🟢 Verde | Idempotencia y locks atómicos |
| 12. Data integrity | 🟡 Amarillo | FKs y CASCADEs definidos, pero sin partitioning |
| 13. Auth profundo | 🔴 Rojo | Bypass de admin check + capability gating inexistente |
| 14. Resiliencia red | 🟢 Verde | Retry, backoff, outbox |
| 15. Ops/Backup/DR | 🟡 Amarillo | Rollback files OK, pero sin pre-commit, sin alertas |
| 16. Escalabilidad DB | 🟡 Amarillo | Indexes buenos en signal_events, pero sin particionamiento |
| 17. Privacidad/compliance | 🔴 Rojo | Sin "delete my account", sin cookie consent, sin retention |
| 18. CI/CD safety | 🟡 Amarillo | Pipeline OK, sin pre-commit, sin Dependabot |
| 19. Anti-patterns React | 🟡 Amarillo | Posibles memory leaks en 15 archivos (heurística) |
| 20. Specifics signals | 🟡 Amarillo | Idempotencia OK, but synthetic contamination |

---

## Riesgos sistémicos

1. **Ciclo migrations → types → código quebrado.** El patrón de "aplicar migración a BD pero no regenerar types" se repite (synthetic seeder, 5 vistas en `resultsCommunityReadModel`, RPCs que requieren `as unknown as`). Solución: pre-commit hook que falla si `database.types.ts` no fue regenerado después de cambios en `supabase/migrations/`.

2. **Brecha entre "lo que vende el deck" y "lo que el código gateaba".** La spec de monetización describe 4 tiers que el código no enforza. Si la conversación con un cliente B2B llega a "¿qué obtengo en B2B Pro vs Starter?", el código no respalda la diferencia.

3. **Synthetic vs real entrelazado.** El sistema fue diseñado para soportar synthetic en el mismo schema que real; pero la **disciplina de filtrar synthetic en cada query analítica no se está aplicando**. Es un riesgo activo, no teórico.

4. **Coverage de tests es baja base ↔ ritmo de cambio es alto.** En esta sesión se agregaron ~600 líneas de código nuevo (synthetic admin, Intelligence B2B base, B2BCompositeIndicesCard, etc.) sin tests. El hard-gate previene degradación pero la baseline crece relativamente más lento que el código.

5. **`signal_events` es el cuello de botella futuro.** Es la tabla que más crecerá (todos los votos de todos los usuarios). No tener partitioning ni retention es deuda compuesta.

---

## Lo que NO pude verificar

- **Estado real de la BD prod** (vistas, RPCs, índices). Mis hallazgos están contra `supabase/migrations/`. Si Juan aplicó migraciones a prod sin commitear (como ya pasó con synthetic), las vistas del B-02 podrían existir en prod aunque no en repo. Validable con `\d v_entity_reputation_risk` en SQL editor de Supabase.
- **Performance real bajo carga.** Sin acceso a APM/profiling de prod, las afirmaciones sobre N+1, queries lentas y bundle size son heurísticas estáticas.
- **Flujos B2B con clientes reales.** No hay tests E2E de flujos como "cliente B2B Starter intenta usar feature de B2B Pro" que confirmen el gating real.
- **Backups y restore probado.** Asumo que Supabase tiene PITR habilitado en el plan, pero un restore "real" para verificar que los backups funcionan no se ha hecho que yo sepa.
- **Bundle size real.** No corrí `npm run build && du -sh dist/` para medir tamaño; solo grep heurístico de imports.

---

## Recomendación de próximos 3 sprints

### Sprint 1 (semana 1) — "Cerrar superficie expuesta"
**Objetivo:** eliminar los hallazgos críticos y altos de seguridad/integridad que son rápidos.
- B-01: filtrar `is_synthetic` en vistas analíticas y RPCs B2B (M).
- D-01: arreglar bypass en `admin_search_users` (S).
- C-01: agregar secret check al cron `cron-evaluate-weekly-missions` (S).
- B-02: verificar y commitear las 5 vistas faltantes O borrar el código que las consume (S-M).
- A-02: mover `supabase.from()` de `VersusGamificationCard` a un service/hook (S).

### Sprint 2 (semanas 2-3) — "Capability gating B2B real"
**Objetivo:** implementar tiers de monetización para que la propuesta comercial tenga respaldo en código.
- D-02: enum `subscription_tier`, columna `users.tier`, RPC `is_tier_at_least`, gates en cada feature B2B (M-L).
- B-04: agregar índice compuesto a `analytics_daily_entity_rollup` (S).
- D-03: implementar `delete_my_account` con cleanup en cascada (M).
- E-01: agregar pre-commit hooks (husky + lint-staged) y Dependabot (S).

### Sprint 3 (semanas 4-5) — "Escalabilidad y deuda transversal"
**Objetivo:** invertir en infraestructura para soportar crecimiento.
- B-03: particionar `signal_events` por mes (L).
- B-05: política de retención + job de archivado (M).
- A-01: romper 3 dependencias circulares (M).
- A-04: borrar 63 dead exports (M).
- C-02: regenerar types y eliminar `as unknown as` evitables (M).
- F-02: bump React 19 + Vite 7 (M).

Después de los 3 sprints, el roadmap natural sería: sprint dedicado a coverage (subir baseline a 30-40%), sprint de UX/copy (no cubierto en esta auditoría), y exploración de multi-tenancy (D-07) si el product/market fit lo requiere.

---

*Auditoría generada en sesión asistida por IA, basada en análisis estático del repo a 2026-04-28. Verificar hallazgos contra estado real de BD prod antes de actuar sobre los items de tipo "vistas no versionadas" o "BD particionada".*
