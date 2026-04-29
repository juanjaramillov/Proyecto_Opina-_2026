# Auditoría técnica integral consolidada — Opina+ V16
**Fecha:** 28 de Abril de 2026
**Alcance:** arquitectura, backend, frontend, seguridad, funcionamiento. NO incluye UI/UX, paleta, branding ni copy.
**Fuentes:** auditoría Claude (sesión 28-abr) + auditoría Antigravity (28-abr), con verificaciones cruzadas contra código real.
**Modo:** análisis crítico, sin cambios al código.

> [!CAUTION]
> Esta auditoría revela vulnerabilidades **CRÍTICAS** en seguridad, integridad referencial, schema drift, capability gating y contaminación analítica. La combinación de hallazgos requiere remediación inmediata antes de operar comercialmente con clientes B2B reales o escalar tráfico B2C.

---

## Cómo se construyó este reporte

Se ejecutaron dos auditorías independientes en paralelo:
- **Auditoría Claude** (este chat): 6 bloques con grep + análisis estático del repo, sin asumir nada de docs.
- **Auditoría Antigravity** (chat externo): 4 secciones con foco en RLS, FKs, schema drift y deuda frontend.

Ambas se cruzaron para detectar:
- **Hallazgos coincidentes** (alta confianza, prioridad alta).
- **Hallazgos únicos de cada una** (validados con grep/lectura del código antes de incluirse).
- **Falsos positivos** (hallazgos descartados con evidencia).

Cada hallazgo lleva la etiqueta de origen `[C]`, `[A]` o `[C+A]` para trazabilidad.

---

## Resumen ejecutivo

El proyecto Opina+ V16 está estructuralmente sólido en defensa en profundidad: 97 tablas con RLS, 247 funciones SECURITY DEFINER con `search_path` corregido, audit log invocado en 39 de 40 RPCs admin, idempotencia por `client_event_id` UNIQUE, OpenAI estrictamente backend-only, CSP estricto, Outbox client-side robusto, hCaptcha→Turnstile + HMAC en webhooks, y un frontend mayoritariamente migrado a TanStack Query con typecheck en EXIT=0. Estos son hechos importantes y no triviales.

**Sin embargo, la auditoría cruzada destapa nueve hallazgos críticos o altos que afectan la viabilidad comercial inmediata**, distribuidos así:

**Riesgos de integridad referencial (encontrados por Antigravity, confirmados):**
- `signal_events.entity_id` **NO tiene foreign key** a `entities(id)`. La tabla más importante del producto puede aceptar entity_id fantasma.
- `b2b_leads` tiene **5 columnas en BD que no existen en `database.types.ts`** (tier_interesado, scope_interesado, tamano_empresa, industria, source). El código que lea esas columnas falla silenciosamente o requiere casts inseguros.

**Riesgos analíticos y de credibilidad B2B (encontrados por Claude):**
- Datos sintéticos contaminan métricas analíticas. `signal_events` no tiene `is_synthetic` ni filtro en vistas/RPCs B2B. Si se vende inteligencia con seeds activos, los clientes ven datos mixtos.
- 5 vistas SQL consumidas por código (`v_entity_reputation_risk`, `v_avg_response_ms_daily`, `v_topic_persistence`, `v_entity_volatility_cross_modules`, `v_trust_vs_choice_gap`) no aparecen en migrations ni en types.
- Capability gating B2B inexistente: el rol `b2b_pro` aparece solo en una whitelist hardcoded; la spec describe 4 tiers que no existen.

**Riesgos de seguridad y resiliencia (encontrados por Claude):**
- Bypass de admin check en `admin_search_users` cuando `auth.uid()` es null.
- Cron `cron-evaluate-weekly-missions` sin verificación de secret.

**Riesgos de escalabilidad (encontrados por Claude):**
- `signal_events` no está particionada y no hay política de retención.
- 3 dependencias circulares detectadas por madge (B2B/feed).

**Riesgos de compliance (encontrados por Claude):**
- Sin endpoint "delete my account" (Right to be Forgotten).
- Sin banner de cookie consent / terms acceptance gating.

**Falsos positivos descartados:**
- Antigravity reportó RLS `entities_read_all USING (true)` como crítico. Está dropeada en la migración remediadora `20260426000200_close_open_rls_policies.sql` (26-abr). **Solo es válida la alerta si esa migración no se aplicó en prod**. Validable con `\d entities` en SQL editor de Supabase.

**Hay un riesgo sistémico que merece nombre propio: la disciplina del ciclo "migración → regenerar types → commitear".** Tres incidentes lo confirman: (1) drift de b2b_leads encontrado por Antigravity, (2) las 5 vistas usadas con `as unknown as` encontradas por Claude, (3) en sesiones previas, las RPCs `seed_synthetic_batch` y `delete_synthetic_batch` que existían en BD pero no en types. Sin pre-commit hook que falle si types están desactualizados, este patrón se va a repetir.

---

## Tabla maestra de hallazgos (consolidados, ordenados por severidad)

### CRÍTICOS

| ID | Origen | Hallazgo | Evidencia | Impacto | Esfuerzo |
|------|--------|----------|-----------|---------|----------|
| **CR-01** | [A] | `signal_events.entity_id` SIN foreign key a `entities(id)` | `consolidated_baseline.sql`: las únicas FKs en signal_events son `algorithm_version_id`, `battle_id`, `battle_instance_id`, `option_id`, `user_id`. **No existe** `signal_events_entity_id_fkey`. Otras tablas SÍ tienen FK a entities (`depth_definitions`, `entity_daily_aggregates`, `entity_rank_snapshots`). | Permite signal_events con `entity_id` apuntando a entidades borradas o nunca existentes. Corrupción silenciosa de rollups y RPCs analíticas que asumen integridad referencial. | M |
| **CR-02** | [C] | Datos sintéticos contaminan métricas analíticas B2B/B2C | `is_synthetic` existe en `users` y `user_profiles` (mig. `20260427120000`), pero **NO en `signal_events`**. Las vistas `signal_events_analytics`, `signal_events_analytics_clean` y los RPCs `get_b2b_battle_analytics`, `calculate_opinascore_v1_1` tienen 0 menciones de `is_synthetic`. | Cualquier dashboard B2B muestra signals sintéticos mezclados con reales. Riesgo legal/reputacional si se vende inteligencia premium. | M |

### ALTOS

| ID | Origen | Hallazgo | Evidencia | Impacto | Esfuerzo |
|------|--------|----------|-----------|---------|----------|
| **AL-01** | [C] | Bypass de admin check en `admin_search_users` cuando `auth.uid()` es null | `20260312230000_admin_search_users.sql:18-22`: comentario "If auth.uid() is null (service role), we bypass". El código evalúa `current_setting('request.jwt.claims', true) IS NOT NULL`; si retorna null, NO valida nada. | Cualquier invocación con `service_role` key (desde edge function comprometida) puede listar todos los usuarios. | S |
| **AL-02** | [C] | Edge function `cron-evaluate-weekly-missions` sin verificación de secret | grep en `supabase/functions/cron-evaluate-weekly-missions/index.ts`: no hay `Authorization`, `Bearer`, ni `CRON_SECRET`. | Cualquiera puede invocar el cron y disparar evaluación de misiones (potencial efecto sobre rewards). | S |
| **AL-03** | [A] | Schema drift en `b2b_leads`: 5 columnas en BD ausentes en types | Migración `20260428000003_b2b_leads_extend_fields.sql` agregó `tier_interesado`, `scope_interesado`, `tamano_empresa`, `industria`, `source`. `database.types.ts:853-880` solo lista `company/created_at/email/id/interest/name/role/status`. | Código que lee esas columnas falla en runtime o requiere `as any`/`as unknown as` que esquivan el typecheck. Pérdida de garantía de Type Safety. | S |
| **AL-04** | [C] | 5 vistas SQL consumidas por código pero ausentes en migrations Y en types | `resultsCommunityReadModel.ts` usa `as unknown as` para leer `v_entity_reputation_risk`, `v_avg_response_ms_daily`, `v_topic_persistence`, `v_entity_volatility_cross_modules`, `v_trust_vs_choice_gap`. Cero ocurrencias en `supabase/migrations/` y `database.types.ts`. | Si BD prod no las tiene → runtime errors silenciados. Si las tiene → drift de schema no versionado. En cualquier caso, contrato app↔BD invisible. | S-M |
| **AL-05** | [C] | Capability gating B2B inexistente | `users.role` es TEXT libre (no enum). `llm-narrative/index.ts:18`: única whitelist `['admin', 'b2b_pro']`. El rol `b2b_pro` no se asigna en ningún lugar del código actual. La spec `monetization-plans-v13.md` describe 4 tiers que no existen. | Comercialmente no se puede vender tiers diferenciados con confianza. El gating real lo hace una whitelist en una sola función. | M-L |
| **AL-06** | [C] | `signal_events` no está particionada | `consolidated_baseline.sql`: `CREATE TABLE signal_events` sin `PARTITION BY`. | Tabla más grande del producto. A escala >1M rows, queries por rango de `created_at` se degradan; reindex y vacuum se vuelven costosos. | L |
| **AL-07** | [C] | 0 índices en `analytics_daily_entity_rollup` | grep `CREATE INDEX.*analytics_daily_entity_rollup` = 0. | Tabla de rollups B2B; full scan a partir de >100k filas. | S |
| **AL-08** | [C] | 3 dependencias circulares (madge) | `useBenchmarkB2BState.ts ↔ narrativeProvider.ts ↔ narrativeEngine.ts`; `LugarDetailView.tsx ↔ LugarSignalWizard.tsx`. | Rompe tree-shaking, aumenta bundle size, riesgo de bugs por orden de inicialización indefinido. | M |
| **AL-09** | [C+A] | Capa de datos fragmentada: 49 `supabase.from()` y 25 `supabase.rpc()` directos en src/ | grep, distribuidos en services pero también en componentes (`VersusGamificationCard.tsx` con 4 calls). | Sin capa unificada, reintentos coordinados, observabilidad transversal y caching consistente cuestan más. | M-L |
| **AL-10** | [A] | Client-side rate limiting en localStorage es trivialmente evadible | `rateLimit.ts` usa `localStorage.getItem/setItem`; si los Edge Functions no aplican rate-limit estricto server-side, hay vector de DDoS y voto masivo. | Manipulación de signals (voto masivo), posibilidad DDoS contra Supabase. | S-M |

### MEDIOS

| ID | Origen | Hallazgo | Evidencia | Impacto | Esfuerzo |
|------|--------|----------|-----------|---------|----------|
| **ME-01** | [C+A] | God components: 20 archivos >300 líneas, top 5 superan 444 líneas | `AdminEntities.tsx 765`, `ServiciosView.tsx 485`, `InsightsChartsSection.tsx 451`, `IntelligenceLanding.tsx 447`, `InsightPack.tsx 444`. | Dificultad de mantenimiento, alto blast radius de bugs, fricción para review. | L |
| **ME-02** | [C+A] | Coverage real al 13.28% lines / 9.62% branches / 10.53% functions / 12.63% statements | vitest output 2026-04-28. | Lejos del threshold aspiracional 70/60. Hard-gate previene degradación, pero baseline crece más lento que el código. | XL |
| **ME-03** | [C] | NO hay endpoint "delete my account" (Right to be Forgotten) | grep `delete.*account|forget_user` solo encuentra cleanup-orphan-users (admin-side). | Sector B2B con DPA / Ley 19.628 chilena pide esto. No se puede honrar en UI. | M |
| **ME-04** | [C] | Sin banner cookie consent ni terms acceptance gating con tracking | grep `consent\|cookie.*banner\|terms.*acceptance` = 0. Sentry y telemetría empiezan al primer load. | Riesgo Ley 19.628 / GDPR si se opera con usuarios EU/UK. | M |
| **ME-05** | [C] | 41 `as unknown as` y 10 `as any` en src/, mezclando workarounds legítimos con drift | `resultsCommunityReadModel.ts` (5x para vistas no tipadas), `metricsService.ts`, `authService.ts`, `depthService.ts`. | Los casts ocultan que `database.types.ts` no refleja schema completo. | M |
| **ME-06** | [C] | Sin pre-commit hooks ni Dependabot/Renovate | No `.husky/`, no `.github/dependabot.yml` ni `renovate.json`. | Errores TS/lint llegan a CI sin filtro local; deps no se actualizan automáticamente. | S |
| **ME-07** | [C] | Sin política de retención: signals viejos no se purgan | grep `DELETE.*FROM.*WHERE.*created_at` = 0 (excepto admin_audit_log). | BD se llena indefinidamente. Costo Supabase y degradación en índices. | M |
| **ME-08** | [C+A] | 63 exports muertos detectados por ts-prune | `userMasterResultsReadModel.ts:9` (read-model entero sin consumidores), helpers en `analyticsTypes.ts`, `metricLabels.ts:7`. | Código que se mantiene pero nadie usa; engaña en lecturas futuras. | M |
| **ME-09** | [A+C] | `session_id` y `device_hash` en localStorage (no cookie HTTP-only) | `useSessionGuard.ts`, `signalWriteService.ts`. | Vulnerable a XSS si lo hubiera (CSP estricto mitiga). `device_hash` se puede limpiar para evadir bans. | M-L |
| **ME-10** | [C] | Timeout default en `supabase.functions.invoke` (60s) | grep — clientes no especifican `signal: AbortSignal.timeout()`. | Si edge function se cuelga, UX espera 60s. | S |
| **ME-11** | [C] | Sin alerting / on-call definido en Sentry | `Sentry.init` configurado, no veo alertas activas en `index.tsx`. | Errores de prod no notifican proactivamente. | S |
| **ME-12** | [C] | 3 archivos con patrón viejo `useEffect+setLoading+supabase` (no migrado a TanStack Query) | `Login.tsx`, `VersusGamificationCard.tsx`, `B2BLeadForm.tsx`. | Inconsistencia de cache, race conditions potenciales. | S |
| **ME-13** | [C] | 39/40 RPCs admin invocan `log_admin_action`, falta uno | grep | Pérdida de auditoría en una operación admin específica. | S |
| **ME-14** | [A] | Falta linter automatizado para `SECURITY DEFINER` sin `search_path` | El bulk-fix se hizo en `20260425035000`, pero no hay test/CI que bloquee futuras migraciones que omitan `search_path`. | Posible reintroducción del problema. | S |

### BAJOS / INFO

| ID | Origen | Hallazgo | Evidencia | Comentario |
|------|--------|----------|-----------|------------|
| **BJ-01** | [C] | 15 archivos con `setInterval`/`setTimeout` sin `clearInterval`/`clearTimeout` (heurística) | grep | Auditar uno a uno; muchos pueden estar dentro de cleanup return. |
| **BJ-02** | [C] | 34 `console.log/warn/error` en src/ | grep — mayoría en código de inicialización legítima. | Reemplazar decorativos por `logger.*`. |
| **BJ-03** | [C] | React 18.2 (latest 19), Vite 6.4 (latest 7) | package.json | Major upgrades pendientes pero no urgentes. |
| **BJ-04** | [C] | 10 RLS `USING (true)` post-baseline (loyalty, weekly_missions, whatsapp_webhook_logs, analytics) | grep | Catálogos OK con SELECT public; logs de webhook deberían ser admin-only. |
| **BJ-05** | [C] | NO hay supabase Realtime ni suscripciones abiertas | grep `supabase.channel\(` = 0 | Sin riesgo de leak por suscripciones (positivo). |
| **BJ-06** | [C] | 109 DROP POLICY o DISABLE RLS en migrations | grep | Alta volatilidad histórica (ya remediada por F-09); no es problema actual. |

### FALSOS POSITIVOS DESCARTADOS

| ID | Origen | Hallazgo reportado | Por qué se descarta |
|------|--------|--------------------|---------------------|
| **FP-01** | [A] | RLS `entities_read_all USING(true)` en `entities` (CRÍTICO) | La policy fue **dropeada y reemplazada** por `entities_select_authenticated` en migración `20260426000200_close_open_rls_policies.sql` el 26-abr. Antigravity no consideró la migración remediadora. **CAVEAT:** validar en BD prod con `\d entities` que la migración fue aplicada. |
| **FP-02** | [C] | Bug en `signalWriteService` que mapeaba `source: 'actualidad'` al else con `module='versus'` (de auditoría externa pegada al inicio del chat) | Verificación cruzada: `signalWriteService.ts:75-77` mapea correctamente a `module='news'`. Auditoría externa estaba mal. |

---

## Tabla de coincidencias entre auditorías (para confianza estadística)

| Hallazgo | Claude detectó | Antigravity detectó | Severidad consolidada |
|----------|:--:|:--:|----|
| God component AdminEntities (765 líneas) | ✓ | ✓ | MEDIO (consenso) |
| Coverage ~13% | ✓ | ✓ | MEDIO (consenso) |
| Capa de datos fragmentada con `supabase.from()` directos | ✓ | ✓ | ALTO (consenso) |
| `localStorage` para session/device/rate-limit | ✓ MEDIO/BAJO | ✓ CRÍTICO | **ALTO** (Antigravity tiene razón al subirla — sin enforcement server-side, vector real) |
| Falta linter para search_path en SECURITY DEFINER | ✗ | ✓ | MEDIO (validado al consolidar) |
| `signal_events.entity_id` SIN FK | ✗ | ✓ | **CRÍTICO** (Antigravity correcto, Claude lo perdió) |
| Drift `b2b_leads` específico | parcial (B-02 genérico) | ✓ específico | ALTO |
| Synthetic data contamination | ✓ | ✗ | **CRÍTICO** (Claude correcto, Antigravity lo perdió) |
| Bypass admin_search_users | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| Cron sin secret | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| 5 vistas no versionadas | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| Capability gating B2B inexistente | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| `signal_events` sin partitioning | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| 3 ciclos circulares (madge) | ✓ | ✗ | ALTO (Claude correcto, Antigravity lo perdió) |
| Sin "delete my account" | ✓ | ✗ | MEDIO (Claude correcto, Antigravity lo perdió) |
| Sin cookie consent | ✓ | ✗ | MEDIO (Claude correcto, Antigravity lo perdió) |
| RLS USING(true) en entities | ✗ | ✓ | **FALSO POSITIVO** (ya remediado) |

**Lectura:** las auditorías independientes coincidieron en 4 hallazgos (god component, coverage, fragmentación de datos, localStorage). **Cada una encontró elementos críticos que la otra perdió** — Antigravity descubrió la falta de FK en `signal_events.entity_id` (crítico real, costo bajo de fix) y el drift específico en `b2b_leads`; Claude descubrió 7 hallazgos altos/críticos que Antigravity no detectó (synthetic, bypass admin, cron, vistas no versionadas, capability gating, partitioning, ciclos). **Esto valida correr 2+ auditorías paralelas con metodologías distintas para reducir blind spots.**

---

## Top 12 hallazgos prioritarios (consolidado y ordenado)

| # | ID | Severidad | Hallazgo | Esfuerzo | Por qué primero |
|---|------|----|---|----|---|
| 1 | CR-01 | CRÍTICO | `signal_events.entity_id` SIN FK | M | Corrupción silenciosa de analytics. Migración + cleanup huérfanos. **Detectado por Antigravity.** |
| 2 | CR-02 | CRÍTICO | Synthetic contamina métricas B2B | M | Riesgo legal/reputacional inmediato si se vende con seeds activos. **Detectado por Claude.** |
| 3 | AL-01 | ALTO | Bypass admin en `admin_search_users` | S | 30 min de fix, alto upside seguridad. |
| 4 | AL-02 | ALTO | Cron sin secret de invocación | S | 1 hora, cierra superficie expuesta. |
| 5 | AL-03 | ALTO | Drift schema `b2b_leads` (5 columnas) | S | `npm run ops:db:generate-types` + commit. **Detectado por Antigravity.** |
| 6 | AL-04 | ALTO | 5 vistas SQL no versionadas | S-M | Drift schema; bug latente runtime. |
| 7 | AL-05 | ALTO | Capability gating B2B inexistente | M-L | Bloquea venta seria de tiers; pre-requisito monetización. |
| 8 | AL-10 | ALTO | Rate limiting solo client-side bypassable | S-M | Vector real DDoS si edge functions no aplican server-side. **Antigravity subió severidad correctamente.** |
| 9 | AL-06 | ALTO | `signal_events` no particionada | L | Inversión preventiva escala. |
| 10 | AL-08 | ALTO | 3 dependencias circulares | M | Tree-shaking, bundle size. |
| 11 | AL-09 | ALTO | Capa de datos fragmentada | M-L | 1 componente con 4 `supabase.from()` directos. |
| 12 | AL-07 | ALTO | 0 indexes en `analytics_daily_entity_rollup` | S | Quick win 30 min. |

---

## Mapa de salud actualizado por pilar

| Pilar | Estado | Justificación |
|-------|--------|---------------|
| 1. Arquitectura/estructura | 🟡 | Boundaries OK pero god components y ciclos circulares |
| 2. Backend Supabase | 🔴 | **FK faltante + synthetic contamination + vistas no versionadas + sin partitioning** (subió de 🟡 a 🔴 al consolidar) |
| 3. Data layer frontend | 🟡 | TanStack Query migrado, defaults sensatos. Pero 49 from() + 25 rpc() en src/ y rate-limit solo client-side |
| 4. Type safety | 🟡 | typecheck EXIT=0, 0 ts-ignore. Pero **drift en b2b_leads + 5 vistas no tipadas + 41 `as unknown as`** (subió de 🟢 a 🟡) |
| 5. Flujos E2E | 🟢 | Idempotencia, captcha, HMAC, multi-session lock funcionando |
| 6. Seguridad aplicativa | 🟢 | CSP, HSTS, sanitización, OpenAI backend-only |
| 7. Performance | 🟢 | Code splitting, sin N+1 detectados, memoization razonable |
| 8. Testing | 🟡 | Hard-gate honesto pero baseline 13% |
| 9. Observabilidad | 🟢 | Sentry, logger sanitizado, audit log |
| 10. Deuda técnica | 🟡 | 63 dead exports, deps majors desactualizadas, sin pre-commit |
| 11. Concurrencia/race | 🟢 | Idempotencia y locks atómicos |
| 12. Data integrity | 🔴 | **FK faltante en signal_events.entity_id es problema serio** (subió de 🟡 a 🔴) |
| 13. Auth profundo | 🔴 | Bypass admin + capability gating inexistente |
| 14. Resiliencia red | 🟢 | Retry, backoff, outbox |
| 15. Ops/Backup/DR | 🟡 | Rollback files OK, sin pre-commit, sin alertas |
| 16. Escalabilidad DB | 🟡 | Indexes buenos en signal_events, sin particionamiento |
| 17. Privacidad/compliance | 🔴 | Sin "delete my account", sin cookie consent, sin retention |
| 18. CI/CD safety | 🟡 | Pipeline OK, sin pre-commit, sin Dependabot, **sin linter de SECURITY DEFINER + search_path** |
| 19. Anti-patterns React | 🟡 | Posibles memory leaks en 15 archivos (heurística) |
| 20. Specifics signals | 🔴 | **FK faltante + synthetic contamination** (subió de 🟡 a 🔴) |

**Pilares en rojo: 5** (arriba de los 2 originales) — backend Supabase, data integrity, auth profundo, privacidad/compliance, specifics signals.

---

## Riesgos sistémicos (consolidados)

1. **Disciplina del ciclo "migración → regenerar types → commitear" rota.** Confirmada por TRES casos: drift en `b2b_leads` (Antigravity), 5 vistas no versionadas (Claude), y RPCs synthetic-seeder en sesiones previas. Solución: pre-commit hook que falla si hay cambios en `supabase/migrations/` sin update correspondiente en `database.types.ts`.

2. **Brecha entre "lo que vende el deck" y "lo que el código gateaba".** La spec describe 4 tiers, el código no los enforza. Cualquier cliente B2B que pregunte "¿qué obtengo en B2B Pro vs Starter?" no tiene respaldo técnico.

3. **Synthetic vs real entrelazado.** El sistema fue diseñado para soportar synthetic en el mismo schema, pero la disciplina de filtrar synthetic en cada query analítica no se aplica.

4. **`signal_events` es el cuello de botella futuro.** Tabla más grande del producto, sin partitioning, sin retention, **sin FK a entities**. Cada deficiencia se compone con las otras.

5. **Defensa client-side trivial pero defensa server-side desconocida.** Rate limiting depende de localStorage. Si `enforce_signal_rate_limit` server-side está activo y robusto, mitigación OK. Si no, vector DDoS real.

6. **Coverage ↔ ritmo de cambio.** En esta sesión se agregaron ~600 líneas de código nuevo (synthetic admin, Intelligence B2B, B2BCompositeIndicesCard) sin tests. Hard-gate previene degradación pero baseline crece más lento que el código.

7. **Auditorías paralelas tienen blind spots distintos.** Ninguna auditoría individual capturó todos los hallazgos críticos. Esta consolidación combinó dos para reducir el riesgo de "lo que no se ve".

---

## Lo que NO se pudo verificar

- **Estado real de BD prod.** ¿La migración remediadora `20260426000200` que dropeó `entities_read_all` fue aplicada? ¿Las 5 vistas existen en prod? ¿`signal_events.entity_id` tiene huérfanos hoy? Validable con SQL editor de Supabase.
- **Performance real bajo carga.** Sin acceso a APM/profiling.
- **Backup PITR probado.** Asumido pero no verificado con restore real.
- **Server-side rate limiting de signals.** El código tiene `signalRateLimiter` cliente y `enforce_signal_rate_limit` server, pero no se midió la cobertura real del enforcement bajo abuso.
- **Bundle size real.** No se corrió `npm run build && du -sh dist/`.

---

## Roadmap consolidado de remediación (3 sprints integrados)

### Sprint 1 (semana 1) — "Cerrar superficie crítica + integridad referencial"
**Objetivo:** eliminar los hallazgos CRÍTICOS y los ALTOS rápidos. Resolver el patrón "drift de types".

1. **CR-01** (M): migración SQL para limpiar huérfanos en `signal_events.entity_id` (DELETE o UPDATE NULL las filas con entity_id no existente) + agregar FK con `ON DELETE SET NULL` para no romper signals existentes en flujos non-battle.
2. **CR-02** (M): agregar columna `is_synthetic` a `signal_events` con DEFAULT false; modificar vistas analíticas (`signal_events_analytics`, `_clean`) para filtrar `WHERE is_synthetic = false`; modificar RPCs B2B (`get_b2b_battle_analytics`, `calculate_opinascore_v1_1`) idem; backfill `is_synthetic` desde `users.is_synthetic` para signals históricos.
3. **AL-01** (S): reemplazar el bypass de `admin_search_users` por `RAISE EXCEPTION 'Access denied: no auth context'` cuando claims sea null.
4. **AL-02** (S): agregar `Authorization: Bearer ${CRON_SECRET}` al cron + validación en la edge function.
5. **AL-03** + **AL-04** (S-M juntos): correr `npm run ops:db:generate-types` y commitear; verificar las 5 vistas mencionadas en `resultsCommunityReadModel.ts` contra BD prod (si existen, agregar migration; si no, borrar el código que las consume).
6. **AL-07** (S): agregar índice compuesto `(entity_id, summary_date DESC)` a `analytics_daily_entity_rollup`.
7. **ME-06** (S): pre-commit hook con husky+lint-staged que corra `tsc --noEmit && eslint`. Adicional: hook que falla si hay cambios en `supabase/migrations/*.sql` sin diff correspondiente en `database.types.ts`.
8. **ME-14** (S): test/regla CI que falla si una migración nueva crea SECURITY DEFINER sin `SET search_path`.

### Sprint 2 (semanas 2-3) — "Capability gating B2B real + control de abuso"
**Objetivo:** respaldar la propuesta comercial con código + cerrar vector DDoS.

1. **AL-05** (M-L): enum `subscription_tier` en BD (`free`, `b2c_plus`, `b2b_starter`, `b2b_pro`); columna `users.tier`; RPC `is_tier_at_least(user_id, required_tier) RETURNS BOOLEAN`; reemplazar la whitelist hardcoded en `llm-narrative` por uso del RPC; gates en cada feature B2B (intelligence drawer, exports, etc.).
2. **AL-10** (S-M): trasladar enforcement de rate-limit de cliente a `enforce_signal_rate_limit` RPC; auditar que todos los flujos críticos llamen al RPC server-side antes del INSERT; eliminar dependencia de `localStorage` para rate-limiting.
3. **ME-09** (M-L): migrar `session_id` a cookie HTTP-only con SameSite=Strict + flag Secure (cambio de arquitectura, requiere coordinación con Supabase Auth).
4. **ME-03** (M): implementar `delete_my_account` RPC con SELECT FOR UPDATE + soft delete en `users` + cascade cleanup (`signal_events` anonimizadas a `anon_id` artificial, profile borrado, sesiones revocadas). Documentar en `/privacy`.
5. **ME-04** (M): banner cookie consent default-deny para tracking opcional; gate Sentry/telemetría hasta consentimiento.
6. **ME-11** (S): configurar alertas Sentry para tasa de errores > N por minuto + on-call mínimo.

### Sprint 3 (semanas 4-5) — "Escalabilidad y deuda transversal"
**Objetivo:** invertir en infraestructura para soportar crecimiento.

1. **AL-06** (L): particionar `signal_events` por mes (`PARTITION BY RANGE (created_at)`). Requiere downtime planificado o dual-write transitorio. Crear job de creación automática de particiones futuras.
2. **ME-07** (M): política de retención + job de archivado para signals >2 años (anonimizar PII, mover a tabla `signal_events_archive`).
3. **AL-08** (M): romper 3 dependencias circulares extrayendo tipos/constantes a archivos neutros.
4. **AL-09** + **ME-12** (M-L): introducir capa de services unificada que encapsule `supabase.from()` y `supabase.rpc()`. Migrar las 3 archivos con patrón viejo (`Login`, `VersusGamificationCard`, `B2BLeadForm`).
5. **ME-08** (M): borrar 63 dead exports después de doble verificación.
6. **ME-05** (M): regenerar types DB y eliminar `as unknown as` evitables.
7. **BJ-03** (M): bump React 19 + Vite 7 con changelog review.

### Sprint 4+ (futuro) — "Infraestructura B2B premium"
- Sprint dedicado a **coverage** (subir baseline 13% → 30-40%).
- Sprint de **multi-tenancy** (D-07) si product/market fit B2B lo requiere.
- Auditoría externa de **penetration testing** profesional antes de venta a empresas con compliance estricto.

---

## Notas finales sobre la metodología

Este reporte combina dos auditorías independientes ejecutadas el mismo día (28-abr-2026):

- **Claude** (asistente IA en sesión interactiva): cobertura amplia con 6 bloques temáticos (estructura, backend, correctness, seguridad, resiliencia, perf/testing/deuda). Foco en pilares de "lo que un no-experto técnico no pediría pero importa" (concurrencia, ops, escalabilidad, compliance).
- **Antigravity** (auditoría externa, externa al proyecto): 4 secciones con foco más quirúrgico en seguridad inmediata (RLS, FKs, schema drift, deuda frontend visible).

**Resultado de la cruz:**
- 4 hallazgos en consenso (alta confianza).
- 9 hallazgos únicos de Claude (post-verificación, todos validados como reales).
- 2 hallazgos únicos de Antigravity (post-verificación, ambos validados como reales y críticos).
- 1 falso positivo de Antigravity descartado con evidencia (ya remediado en migración posterior).
- 1 falso positivo descartado de auditoría externa previa (bug `source: 'actualidad'` que no existe).

**Conclusión metodológica:** correr 2+ auditorías paralelas con prompts/metodologías distintas reduce blind spots de manera medible. Ninguna auditoría individual capturó el 100% de los hallazgos críticos. Para due diligence B2B serio, validar cada hallazgo crítico contra estado real de BD prod antes de actuar.

---

*Auditoría consolidada generada en sesión asistida por IA, basada en análisis estático del repo + cruce con auditoría externa Antigravity, ambas a 2026-04-28. Verificar contra estado real de BD prod (`\d entities`, `\d signal_events`, `\d b2b_leads`, lista de vistas) antes de actuar sobre items de tipo "FK faltante", "vistas no versionadas" o "drift de schema".*
