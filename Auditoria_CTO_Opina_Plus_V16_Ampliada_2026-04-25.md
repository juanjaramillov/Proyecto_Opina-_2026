# Auditoría Técnica Ampliada — Opina+ V16

**Fecha:** 2026-04-25
**Autor:** Claude (rol Director CTO)
**Alcance:** Segunda pasada profunda, accionable y verificable. NO se modifica código.
**Base auditada:** `/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V16`
**Documento previo:** `Auditoria_CTO_Opina_Plus_V16_2026-04-25.md` (Fase 1, complementaria)

> **Reglas seguidas:** sin refactors, sin branches, sin cambios. Cada hallazgo cita archivo y línea. Se separa hecho verificado de inferencia (marcado **(inferencia)**).

---

## 1. Resumen Ejecutivo (≤ 10 líneas)

**Clasificación:** **Parcialmente Sólida**, con bases técnicas serias y dos zonas frágiles concretas.

La arquitectura del motor de señales (`signal_events` + `insert_signal_event` RPC + outbox + idempotencia por `client_event_id`) está bien diseñada y es defendible ante un equipo externo. RLS está habilitado en las 95 tablas y el patrón Gate está correctamente aplicado en todas las rutas administrativas y B2B. Sin embargo: (a) **20 funciones SECURITY DEFINER no tienen `SET search_path`** (riesgo de inyección de search_path), (b) un trigger reciente (`audit_role_changes`, migración 20260425031603) inserta en columnas que **no existen** en `admin_audit_log` y romperá cualquier cambio de rol vía SQL, (c) `adminUsersService.ts:29` muta `users.role` directamente desde el cliente saltándose la RPC de admin, y (d) `wa-webhook` (legacy) sigue desplegada con `verify_jwt=false`, sin HMAC, mientras Meta no ha sido apuntado al endpoint nuevo. Frontend tiene 0 dependencias circulares, 8 e2e Playwright + 22 unit, pero falta CSP/headers en `vercel.json` y la rotación de la anon key vive en `.env` local. Recomendación: **NO ir a producción comercial sin cerrar P0 (4 ítems)**; el resto puede gestionarse en sprints.

---

## 2. Mapa Real del Proyecto (verificado)

### 2.1 Stack

| Capa | Tecnología | Versión / Evidencia |
|------|------------|---------------------|
| Frontend | React 18 + Vite + TypeScript | `package.json` |
| Estado | Zustand + React Context | `src/features/*/context/` |
| Routing | React Router v6 | `src/App.tsx` |
| Estilos | Tailwind 3 + tokens corporativos | `tailwind.config.js` |
| Observabilidad | Sentry | `src/main.tsx` |
| Backend | Supabase (Postgres + RLS + RPC + Edge Functions Deno) | `supabase/` |
| Tests | Vitest (22) + Playwright (8 e2e) | `src/**/*.test.ts`, `tests/e2e/` |
| Hosting | Vercel | `vercel.json` |
| LLM | OpenAI vía Edge Functions (insights-generator, llm-narrative) | `supabase/functions/` |

### 2.2 Estructura de carpetas (verificada)

```
src/
├── App.tsx                          # 35 rutas; admin/B2B siempre en <Gate>
├── main.tsx                         # Sentry init
├── supabase/client.ts               # único createClient + lock override
├── features/
│   ├── access/                      # Gate + policyResolver
│   ├── admin/                       # 8 servicios CRUD admin
│   ├── auth/                        # AuthContext + useSessionGuard
│   ├── b2b/                         # dashboard B2B
│   ├── signals/                     # signalWriteService (motor)
│   ├── modules/                     # versus, torneo, profundidad, actualidad, pulse
│   ├── narrative/                   # llm-narrative consumer
│   └── places/                      # módulo futuro
├── shared/                          # ui, layout, utils
└── types/                           # types Supabase generados

supabase/
├── migrations/                      # ~80 archivos, baseline 20260312
├── functions/                       # ~15 edge functions
└── config.toml                      # verify_jwt por función
```

### 2.3 Inventario cuantitativo (todos verificados con bash)

| Métrica | Valor |
|---------|-------|
| Tablas con RLS | **95 / 95** |
| Políticas RLS | **131** |
| Funciones SECURITY DEFINER | **31** |
| SECURITY DEFINER **sin** `SET search_path` | **20** ⚠ |
| Tests Vitest | 22 |
| Tests Playwright e2e | 8 |
| Dependencias circulares (madge) | **0** ✓ |
| Edge functions | ~15 |
| Edge functions con `verify_jwt = false` | 2 (`register-user`, `wa-webhook`) |

### 2.4 Modelo de señales — `signal_events` (tabla madre)

Verificado en `supabase/migrations/20260312000000_consolidated_baseline.sql`:

- 50+ columnas; campos clave: `id`, `signal_id`, `anon_id NOT NULL`, `user_id`, `entity_id`, `module_type`, `signal_type_id`, `value_json`, `signal_weight`, `computed_weight`, `algorithm_version`, `gender`, `age_bucket`, `region`, `country='CL'`, `client_event_id`, `device_hash`, `verification_level_id`, `raw_weight`, `effective_weight`, `source_module`, `occurred_at`, `created_at`.
- Índice **único** `signal_events_client_event_id_uidx` ON `(client_event_id) WHERE client_event_id IS NOT NULL` → **idempotencia real garantizada**.
- 20+ índices secundarios (segmentación por `gender`, `age_bucket`, `region`, `module_type`, `entity_id`, `occurred_at`).
- FKs correctas con `ON DELETE SET NULL` hacia `auth.users`, `battles`, `battle_instances`, `battle_options`.
- RLS activo; inserción canalizada por RPC `insert_signal_event` que aplica antifraude y exclusión de admins de la captura.

---

## 3. Tabla de Hallazgos (con evidencia exacta)

> Prioridad: **P0** = bloqueante producción · **P1** = antes de B2B real · **P2** = antes de escalar · **P3** = puede esperar

| ID | Área | Hallazgo | Evidencia (archivo:línea) | Riesgo | Prioridad | Recomendación |
|----|------|----------|--------------------------|--------|-----------|---------------|
| **F-01** | DB / Seguridad | Trigger `audit_role_changes` inserta en columnas `target_resource` y `details` que **no existen** en `admin_audit_log` (esquema real: `actor_user_id, action, target_type, target_id, payload, created_at`). Cualquier UPDATE a `users.role` lanzará error y revertirá la transacción. | `supabase/migrations/20260425031603_security_fix_prevent_role_escalation.sql:153` vs `20260424000100_admin_audit_log.sql` | **Crítico** — bloquea promoción/democión de rol | **P0** | Renombrar columnas en el INSERT a `target_type='users'`, `target_id=NEW.user_id`, `payload=jsonb_build_object('old_role',OLD.role,'new_role',NEW.role)` |
| **F-02** | DB / Seguridad | 20 funciones `SECURITY DEFINER` **sin** `SET search_path = public, pg_temp` (riesgo de search_path hijacking si un esquema malicioso queda primero en el path). | `bash` sobre `supabase/migrations/*.sql` (20 ocurrencias DEFINER sin SET search_path) | Alto | **P0** | Auditar las 20 funciones y agregar `SET search_path = public, pg_temp;` |
| **F-03** | Frontend / Seguridad | Cambio de rol se hace por mutación directa del cliente: `supabase.from('users').update({ role }).eq('user_id', userId)`. Saltea la RPC `admin_promote_user` (si existe) y depende solo de RLS. | `src/features/admin/services/adminUsersService.ts:29` | Alto | **P0** | Crear/usar RPC `admin_set_user_role(target_user_id uuid, new_role text)` con `SECURITY DEFINER`, `is_admin_user()` check y `log_admin_action()` |
| **F-04** | Edge Function / Seguridad | `wa-webhook` legacy desplegada con `verify_jwt=false`, sin HMAC, `VERIFY_TOKEN` por defecto `my_super_secret_token`, `console.log` del body completo (PII en logs). Meta sigue apuntando aquí. | `supabase/functions/wa-webhook/index.ts` (61 líneas), `supabase/config.toml` | Alto (mientras Meta no se redirija) | **P0** | Apuntar Meta a `whatsapp-webhook` (ya tiene HMAC SHA256 timing-safe), luego `supabase functions delete wa-webhook` |
| **F-05** | Edge Function / Seguridad | `llm-narrative` interpola `entry.entityName` y `entry.stabilityLabel` directamente en el prompt OpenAI sin Zod ni sanitización. Vector clásico de prompt injection. | `supabase/functions/llm-narrative/index.ts:73` | Medio-Alto | **P1** | Validar con Zod, escapar/limitar longitud, separar contexto de instrucciones con delimitadores |
| **F-06** | Frontend / Seguridad | `vercel.json` no define headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). | `vercel.json` (solo redirects + rewrites) | Medio | **P1** | Agregar bloque `headers` con CSP estricta apuntando a `*.supabase.co`, `sentry.io`, `vercel.app` |
| **F-07** | Frontend / Performance | `AuthContext` recarga el perfil completo en cada `onAuthStateChange`, incluyendo eventos de refresh de token (~cada hora). Potencial N+1 al hidratar la app. | `src/features/auth/context/AuthContext.tsx` | Bajo-Medio | **P2** | Cachear perfil con TTL o reaccionar solo a SIGNED_IN/SIGNED_OUT/USER_UPDATED |
| **F-08** | Frontend / Calidad | Servicios admin (`adminActualidadCrudService.ts`) hacen 7 mutaciones directas (`.insert/.update/.delete`) sobre tablas privadas, dependiendo solo de RLS. | `src/features/admin/services/adminActualidadCrudService.ts:103,162,188,202,210,292,310,329` | Medio | **P1** | Migrar a RPCs con `is_admin_user()` + `log_admin_action()` |
| **F-09** | DB / Modelo | 14 políticas RLS con `USING (true)`. 12 son catálogos públicos legítimos; 2 requieren revisión (no detalladas aquí — auditar nombre tabla por tabla). | `bash grep "USING (true)" supabase/migrations` | Bajo-Medio | **P2** | Revisar las 14, dejar comentario `-- public catalog: intentional` en las legítimas |
| **F-10** | Frontend / Estado | 17 usos de `localStorage` en 7 archivos (no encriptado, accesible por XSS). Si alguno guarda token o flag de bypass, es vector. | `bash grep "localStorage" src/` (7 archivos) | Medio (depende contenido) | **P2** | Revisar cada uso; mover lo sensible a `httpOnly cookies` (ya lo hace Supabase para sesión) o cifrar |
| **F-11** | Tests / Cobertura | 22 unit + 8 e2e cubren flujos clave (auth, gate, signals, admin). Pero no hay cobertura medida ni gates de CI obligatorios. | `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/*` (inferencia: no verificado en este pase) | Bajo | **P2** | Agregar `vitest --coverage` con umbral 70% en CI |
| **F-12** | Build / Secrets | `.env` no está en git (verificado en Fase 1), pero la rotación de keys vive solo en `.env` local; sin Doppler/1Password ni rotación periódica documentada. | Política operacional, no archivo | Medio (operacional) | **P1** | Migrar a Vercel Env + Supabase Vault o Doppler; documentar rotación |
| **F-13** | Edge Function / Resiliencia | `register-user` con `verify_jwt=false`. Necesario por diseño (signup), pero requiere rate limit y captcha. | `supabase/config.toml`, `supabase/functions/register-user/` | Medio | **P1** | Agregar Turnstile/hCaptcha + rate limit por IP |
| **F-14** | Frontend / UX | `Gate.tsx` usa `useEffect` para toasts laterales en deny. Funciona, pero acopla UX a re-renders. | `src/features/access/components/Gate.tsx` | Bajo | **P3** | Mover toast a action al primer render con flag |
| **F-15** | DB / Observabilidad | `admin_audit_log` no se purga ni rota. Crecerá indefinidamente. | `supabase/migrations/20260424000100_admin_audit_log.sql` | Bajo | **P3** | Cron mensual archivando >90 días a tabla fría o S3 |

---

## 4. Hallazgos Críticos (bloqueantes producción)

Solo los **P0** de la tabla anterior:

1. **F-01** — Trigger `audit_role_changes` con columnas inexistentes. **Cualquier flujo que cambie `users.role` está roto**. Si un admin hoy intenta promover un usuario a B2B, recibirá error de columna inexistente y la transacción se revertirá. Validable en 30s con un UPDATE en SQL Editor.

2. **F-02** — 20 SECURITY DEFINER sin `search_path`. Riesgo de escalación si un atacante con permiso `CREATE` en un esquema (poco probable en Supabase managed, pero principio de defensa en profundidad). Suma puntos en cualquier auditoría externa o due diligence.

3. **F-03** — Cambio de rol por `.update()` directo. Si las RLS de `users` permiten `WITH CHECK` por `is_admin_user()`, el ataque está mitigado, pero la **defensa única** es RLS. Una migración futura que afloje esa policy abre privilege escalation. Convertir a RPC ahora cuesta 1h, evitarlo cuesta el incidente.

4. **F-04** — `wa-webhook` legacy expuesta. Mientras Meta apunte ahí, cualquiera con la URL (que no es secreta) puede inyectar mensajes simulados, llenar logs, o disparar lógica downstream. **Cerrarlo es trivial** — apuntar Meta al `whatsapp-webhook` (que ya tiene HMAC) y borrar la legacy.

---

## 5. Hallazgos Importantes No Bloqueantes

- **F-05** prompt injection en `llm-narrative` — cualquier nombre de entidad con texto malicioso (`"Ignore previous instructions and..."`) puede inyectarse al modelo. Rompe garantías de salida, no de seguridad de datos.
- **F-06** sin CSP — facilita XSS si llega a haber.
- **F-08** mutaciones directas en admin actualidad — patrón inconsistente con el resto de admin RPCs.
- **F-12** secrets sin rotación — operacional.
- **F-13** signup sin captcha — riesgo de bot signup masivo.

---

## 6. Cosas Bien Resueltas (con evidencia)

| Acierto | Evidencia |
|---------|-----------|
| **Idempotencia de señales real** (no decorativa) | UNIQUE INDEX `signal_events_client_event_id_uidx WHERE client_event_id IS NOT NULL` en migración baseline |
| **Multi-session lock funcional** | `useSessionGuard` con ping 30s + `user_sessions.revoked_reason` con valores semánticos (`superseded_by_new_login`, etc.) |
| **Gate centralizado** | `src/features/access/components/Gate.tsx` + `policyResolver.ts` — todas las rutas admin/B2B en `App.tsx` envueltas |
| **RLS activo en 100% de tablas** | 95/95 tablas con `ENABLE ROW LEVEL SECURITY` |
| **Cero dependencias circulares** | `madge` reporta 0 |
| **`anon_id NOT NULL`** en signal_events | Tipos de señal siempre asociables a un visitante, incluso anónimos |
| **`whatsapp-webhook` (nuevo) bien hecho** | HMAC SHA256 + timing-safe comparison, 219 líneas vs 61 del legacy |
| **Outbox pattern para señales** | `enqueueInsertSignalEvent` + custom event `opina:signal_emitted` permite reintento offline |
| **Antifraude server-side** | RPC `insert_signal_event` excluye admins y aplica reglas; no es lógica frontend |
| **Admin audit log + helper** | `log_admin_action()` ya disponible para nuevas RPCs |
| **`whatsapp-webhook` con `verify_jwt=true`** | Configuración correcta en `config.toml` |
| **Migraciones consolidadas en baseline** | `20260312000000_consolidated_baseline.sql` permite reset limpio |

---

## 7. Deuda Técnica Priorizada

### 7.1 Antes de producción (P0 — bloqueantes)
- F-01 — fix trigger `audit_role_changes`
- F-02 — `SET search_path` en 20 funciones DEFINER
- F-03 — RPC `admin_set_user_role`
- F-04 — apuntar Meta + borrar `wa-webhook`

### 7.2 Antes de escalar / ir a B2B real (P1)
- F-05 — Zod + sanitización en `llm-narrative` y otras edge functions con OpenAI
- F-06 — headers CSP en `vercel.json`
- F-08 — migrar admin CRUD actualidad a RPCs
- F-12 — Doppler/Vault + rotación documentada
- F-13 — Turnstile en `register-user`

### 7.3 Antes de venta B2B / due diligence (P2)
- F-07 — desacoplar reload de perfil de refresh de token
- F-09 — revisión policies `USING (true)`
- F-10 — auditoría de `localStorage`
- F-11 — coverage threshold en CI

### 7.4 Antes de compartir repo público (P0/P1)
- Confirmar `.env*` ignorado (✓ ya verificado)
- F-04 — borrar webhook legacy (sino expone URL)
- Revisar `console.log` con PII (F-04 incluye esto)

### 7.5 Puede esperar (P3)
- F-14 — toast en Gate
- F-15 — rotación de admin_audit_log

---

## 8. Arquitectura Objetivo Recomendada

**Tesis:** la arquitectura actual es defendible. No hace falta refactor estructural. Las brechas son de **endurecimiento**, no de diseño.

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite + Vercel)                            │
│  ├─ Gate (ya existe)                                         │
│  ├─ AuthContext + useSessionGuard (ya existe)                │
│  └─ TODAS las mutaciones admin → RPC (objetivo)              │
└──────────────┬───────────────────────────────────────────────┘
               │ Supabase JS client
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  ├─ RLS en 95 tablas (ya)                                    │
│  ├─ RPCs admin con is_admin_user() + log_admin_action()      │
│  ├─ TODAS las DEFINER con SET search_path (objetivo)         │
│  └─ Trigger audit_role_changes con columnas correctas        │
│                                                              │
│  Edge Functions (Deno)                                       │
│  ├─ insert-signal-event (capa de captura + antifraude)       │
│  ├─ insights-generator + llm-narrative con Zod (objetivo)    │
│  ├─ whatsapp-webhook (HMAC ✓)                                │
│  ├─ register-user con Turnstile (objetivo)                   │
│  └─ wa-webhook → BORRADA (objetivo)                          │
└──────────────────────────────────────────────────────────────┘
```

**Cambios estructurales recomendados:** ninguno mayor. Ajustes:
- Capa de validación con Zod compartida entre edge functions (esquemas en `supabase/functions/_shared/schemas.ts`).
- Helper `assertAdmin(supabase)` reusable en cada edge function admin.
- Test e2e de promoción de rol (cubriría F-01 automáticamente).

---

## 9. Backlog Técnico Recomendado

> Formato: `[Prioridad] Título — esfuerzo estimado — criterio de done`

### Sprint 1 (P0 — bloqueantes, ~3-5 días)
- **[P0] Fix trigger `audit_role_changes`** — 30 min — UPDATE a `users.role` desde SQL Editor exitoso, fila en `admin_audit_log`.
- **[P0] `SET search_path` en 20 DEFINER** — 2h — `bash grep -L "search_path" supabase/migrations/*.sql` sobre funciones DEFINER da 0.
- **[P0] RPC `admin_set_user_role`** — 1h — `adminUsersService.ts:29` reemplazado por `.rpc()`; e2e test cambio de rol.
- **[P0] Cerrar `wa-webhook`** — 1h — Meta apuntando a `/whatsapp-webhook`; `supabase functions delete wa-webhook` ejecutado; entry borrada de `config.toml`.

### Sprint 2 (P1 — antes de B2B real, ~5-7 días)
- **[P1] Zod en edge functions OpenAI** — 4h — `llm-narrative` y `insights-generator` validan entrada; tests con payload malicioso.
- **[P1] CSP + headers en Vercel** — 2h — `vercel.json` con bloque `headers`; verificar con `securityheaders.com`.
- **[P1] Migrar admin actualidad a RPCs** — 1 día — todas las mutaciones en `adminActualidadCrudService.ts` vía `.rpc()`.
- **[P1] Doppler / Vercel Env + rotación** — 0.5 día — runbook documentado.
- **[P1] Turnstile en `register-user`** — 0.5 día — registro requiere captcha válido.

### Sprint 3 (P2 — antes de escalar, ~3-5 días)
- **[P2] Cache de perfil con TTL** — 0.5 día — `AuthContext` no refetcha en TOKEN_REFRESHED.
- **[P2] Revisión `USING (true)`** — 2h — comentarios `-- public catalog` en las legítimas.
- **[P2] Auditoría `localStorage`** — 2h — inventario doc + nada sensible.
- **[P2] Coverage gate en CI** — 0.5 día — Vitest umbral 70%.

### Backlog (P3)
- **[P3] Rotación `admin_audit_log`** — 4h.
- **[P3] Refactor toast en `Gate`** — 1h.

---

## 10. Veredicto Final

**¿Lista para producción comercial?** **No, hasta cerrar P0.**

**¿Lista para piloto cerrado / beta privada?** **Sí**, con los cuatro P0 cerrados (estimado: 5 días).

**¿Sólida para due diligence técnica?** Después de Sprint 1 + Sprint 2: **sí**. Hoy: el revisor externo encontrará F-01 a F-04 en la primera tarde y bajará la nota.

**¿Reescritura?** **No.** El motor de señales, el patrón Gate, multi-session lock, idempotencia y outbox están correctamente implementados. Lo que falta es endurecimiento (defensa en profundidad), no rediseño.

**Tiempo estimado total de los 3 sprints:** **2-3 semanas** con un ingeniero senior dedicado, o 4 semanas con uno mid.

---

# Anexos — Checklists obligatorias

## Checklist 1 — Producción (Go/No-Go)

| Ítem | Estado | Evidencia / Acción |
|------|--------|--------------------|
| `.env*` fuera de git | ✅ | Solo `.env.example` versionado |
| Sentry inicializado en frontend | ✅ | `src/main.tsx` |
| RLS en 100% de tablas | ✅ | 95/95 |
| Edge functions con `verify_jwt=true` por default | ⚠ | 2 excepciones: `register-user` (necesaria, falta captcha), `wa-webhook` (legacy, borrar) |
| HMAC en webhooks externos | ⚠ | `whatsapp-webhook` ✓; `wa-webhook` ✗ (borrar) |
| Headers de seguridad (CSP, X-Frame, etc.) | ❌ | `vercel.json` no los define — F-06 |
| Rate limiting en endpoints públicos | ⚠ | Existe en `insert_signal_event` (40/min); falta en `register-user` |
| Captcha en signup | ❌ | F-13 |
| Logs sin PII | ⚠ | `wa-webhook` loguea body completo — se cierra con F-04 |
| Audit log de acciones admin | ✅ | `admin_audit_log` + `log_admin_action()` |
| Backups DB documentados | ❓ | (inferencia) Supabase managed los hace; falta runbook de restore |
| Plan de rotación de keys | ❌ | F-12 |
| Monitoreo de errores en edge functions | ❓ | (inferencia) Falta verificar Logflare / Sentry edge |
| Tests e2e de flujos críticos | ✅ | 8 Playwright |

**Veredicto:** **NO GO** hasta cerrar F-01..F-04.

---

## Checklist 2 — Supabase (Hardening)

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| RLS habilitado en todas las tablas de aplicación | ✅ | 95/95 `ENABLE ROW LEVEL SECURITY` |
| Políticas RLS revisadas (no `USING (true)` accidentales) | ⚠ | 14 políticas con `USING (true)` — revisar (F-09) |
| Funciones DEFINER con `SET search_path` | ❌ | 11/31 sí, 20/31 **no** — F-02 |
| RPCs admin verifican `is_admin_user()` server-side | ✅ | Verificado en `admin_search_users`, `admin_generate_invites`, etc. |
| Migraciones idempotentes / consolidables | ✅ | Baseline `20260312000000` |
| FKs con `ON DELETE` definidos | ✅ | Verificado en `signal_events` (SET NULL hacia auth.users) |
| Triggers con tests | ❌ | F-01 no se hubiera escapado con un test |
| `auth.users` no es referenciada con CASCADE | ✅ | Solo SET NULL |
| `admin_audit_log` rotada | ❌ | F-15 |

---

## Checklist 3 — Testing

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Unit tests en lógica de servicios | ⚠ | 22 tests — cubre core; falta admin |
| E2E en flujos auth + gate + signal | ✅ | 8 Playwright |
| E2E de promoción de rol | ❌ | Hubiera detectado F-01 |
| Coverage medido | ❌ | F-11 |
| CI ejecuta tests obligatoriamente | ❓ | (inferencia) verificar `.github/workflows` |
| Tests de RLS (negative path) | ❌ | Falta — usuario no-admin intentando RPCs admin |
| Tests de idempotencia de signals | ❓ | Verificar |
| Tests de rate limit | ❌ | Falta |
| Tests de prompt injection en LLM functions | ❌ | F-05 |

---

## Checklist 4 — Resumen Expandido por Área

| Área | Estado | Comentario corto |
|------|--------|------------------|
| **Arquitectura general** | 🟢 Sólida | Gate + RLS + RPC + Outbox bien aplicados |
| **Modelo de datos (signals)** | 🟢 Sólida | 50+ columnas, 20 índices, idempotencia real |
| **Auth y sesiones** | 🟢 Sólida | Multi-session lock funcional |
| **Autorización (admin)** | 🟡 Parcial | 1 servicio aún muta tabla directa (F-03) |
| **Edge functions seguridad** | 🟡 Parcial | `whatsapp-webhook` ✓, `wa-webhook` ✗, OpenAI sin Zod |
| **Frontend seguridad** | 🟡 Parcial | Falta CSP, localStorage por revisar |
| **DB seguridad (DEFINER)** | 🔴 Frágil | 20/31 sin search_path |
| **Triggers / audit** | 🔴 Frágil | F-01 actualmente roto |
| **Tests** | 🟡 Parcial | Cobertura razonable, sin coverage gate |
| **CI/CD** | 🟡 Parcial | (inferencia) verificar `.github/workflows` |
| **Observabilidad** | 🟡 Parcial | Sentry sí; falta Logflare verificación |
| **Secrets** | 🟡 Parcial | Local seguro, falta rotación operacional |
| **Documentación** | 🟡 Parcial | Memoria de decisiones existe, runbooks faltan |

---

## Checklist 5 — Tabla Expandida de Hallazgos (vista alternativa por archivo)

| Archivo | Línea | Hallazgo ID | Tipo |
|---------|-------|-------------|------|
| `supabase/migrations/20260425031603_security_fix_prevent_role_escalation.sql` | 153 | F-01 | Bug crítico |
| `supabase/migrations/*.sql` (20 funciones) | varios | F-02 | Hardening |
| `src/features/admin/services/adminUsersService.ts` | 29 | F-03 | Patrón |
| `supabase/functions/wa-webhook/index.ts` | 1-61 | F-04 | Seguridad |
| `supabase/functions/llm-narrative/index.ts` | 73 | F-05 | Validación |
| `vercel.json` | (ausencia) | F-06 | Seguridad |
| `src/features/auth/context/AuthContext.tsx` | (lógica) | F-07 | Performance |
| `src/features/admin/services/adminActualidadCrudService.ts` | 103,162,188,202,210,292,310,329 | F-08 | Patrón |
| `supabase/migrations/*.sql` | varios | F-09 | RLS |
| `src/**/*.ts` (7 archivos) | varios | F-10 | Frontend |
| `vitest.config.ts` / CI | — | F-11 | Tests |
| `.env` / Vercel | — | F-12 | Operacional |
| `supabase/functions/register-user/` + `config.toml` | — | F-13 | Seguridad |
| `src/features/access/components/Gate.tsx` | (useEffect) | F-14 | UX |
| `supabase/migrations/20260424000100_admin_audit_log.sql` | (sin retención) | F-15 | Operacional |

---

## Checklist 6 — Veredicto Actualizado

| Pregunta | Respuesta |
|----------|-----------|
| ¿Pasar a producción comercial hoy? | **No.** Cerrar F-01..F-04 primero. |
| ¿Lanzar piloto privado? | **Sí**, después de los 4 P0 (5 días). |
| ¿Aguanta due diligence técnica? | **Hoy: no.** Después de Sprint 1+2: **sí**. |
| ¿Necesita reescritura? | **No.** El diseño es correcto. |
| ¿Compartir repo público hoy? | **No** mientras `wa-webhook` esté desplegada. |
| ¿Tiempo estimado a producción robusta? | **2-3 semanas** con 1 senior. |
| ¿Está el motor de señales listo para escalar? | **Sí**, técnicamente. Falta tuning operacional (cron, retención). |
| ¿Riesgo de privilege escalation hoy? | **Bajo pero existente** — F-03 mitigado por RLS solamente. |
| ¿Riesgo de pérdida de datos? | **Muy bajo** — FKs correctas, ON DELETE SET NULL. |
| ¿Riesgo legal (PII)? | **Medio** — F-04 loguea PII de WhatsApp. Cierre urgente. |

---

# Próximos pasos recomendados (handoff accionable)

1. **Hoy mismo (15 min):** validar F-01 en SQL Editor → `UPDATE users SET role='b2b' WHERE user_id='<test>'` → si falla con error de columna, F-01 confirmado en producción.
2. **Esta semana:** ejecutar Sprint 1 (los 4 P0). Estimado real: 5 días.
3. **Semanas 2-3:** Sprint 2 (P1).
4. **Semana 4:** Sprint 3 (P2) + revisar este documento para reclasificar a 🟢 todos los ítems.

---

**Fin del documento.**
**Notas:** todo lo marcado **(inferencia)** requiere verificación adicional (CI workflows, monitoreo de edge functions, runbook de restore). El resto está verificado con bash directo sobre el repo durante esta sesión.
