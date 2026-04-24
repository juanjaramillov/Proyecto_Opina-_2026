# Multi-session lock

> **Estado**: vigente desde migración `20260424000200_multi_session_lock.sql`.
> **Cierra**: #5 Media de la auditoría técnica Drimo — "Verificar multi-session lock en Supabase".

## Qué resuelve

Supabase Auth por default permite **sesiones concurrentes ilimitadas** por usuario. Si alguien loguea en su teléfono, su laptop y una tablet prestada, las tres sesiones siguen válidas simultáneamente hasta que expiren. Esto habilita:

- **Compartición de cuentas** — un código de invitación se convierte en "la cuenta" y circula entre varias personas.
- **Sesiones comprometidas sin detección** — si alguien te roba el JWT, tu sesión legítima sigue viva y nunca te enterás.

La solución es una capa de aplicación que exige **una sola sesión activa por usuario**: al loguearte en un nuevo dispositivo, las otras sesiones quedan marcadas como revocadas. El cliente (otros dispositivos) lo detecta en su próximo ping y hace `signOut()` local mostrando un aviso.

## Esquema

Tabla `public.user_sessions` (append-only, no se borran filas):

| columna          | tipo        | nota                                                            |
|------------------|-------------|-----------------------------------------------------------------|
| `id`             | uuid        | PK → se usa como `session_id` en el cliente                     |
| `user_id`        | uuid        | FK a `auth.users` ON DELETE CASCADE                             |
| `created_at`     | timestamptz | default `now()`                                                 |
| `last_seen_at`   | timestamptz | updateado por `ping_user_session` cada 30s                      |
| `revoked_at`     | timestamptz | NULL = activa                                                   |
| `revoked_reason` | text        | `superseded_by_new_login` \| `manual_user` \| `manual_admin` \| `expired_idle` |
| `device_label`   | text        | `navigator.platform` snapshot al login                          |
| `user_agent`     | text        | `navigator.userAgent` snapshot (truncado a 500 chars)           |
| `ip_addr`        | inet        | reservado para futuro backfill server-side                      |

Índices:
- `(user_id, created_at DESC)` parcial donde `revoked_at IS NULL` — listar sesiones activas.
- `(last_seen_at DESC)` — mantenimiento (`revoke_idle_user_sessions`).

## RLS

- **SELECT**: permitido si `user_id = auth.uid()` **O** `is_admin_user()` — cada usuario ve solo las suyas, admins ven todo.
- **INSERT / UPDATE / DELETE**: bloqueado desde `authenticated` (`USING (false) WITH CHECK (false)`). Toda escritura pasa por las RPCs `SECURITY DEFINER` descritas abajo.

`REVOKE ALL` desde `PUBLIC`/`anon`; `GRANT SELECT` a `authenticated`; `service_role` puede escribir para mantenimiento ad-hoc.

## RPCs

| RPC                              | llamable por      | qué hace                                                              |
|----------------------------------|-------------------|-----------------------------------------------------------------------|
| `register_user_session(label, ua)` | `authenticated` | Revoca todas las sesiones activas del user y crea una nueva. Retorna `session_id`. |
| `ping_user_session(session_id)`  | `authenticated`   | Si la sesión está activa, update de `last_seen_at` y retorna `{active:true}`. Si está revocada, retorna `{active:false, reason:'...'}`. |
| `list_my_active_sessions()`      | `authenticated`   | Lista sesiones activas del caller (para UI "Mis dispositivos").       |
| `revoke_my_session(session_id)`  | `authenticated`   | Usuario cierra una sesión propia puntual.                              |
| `admin_revoke_user_sessions(user_id, reason)` | admin | Revoca TODAS las sesiones de un user dado. Loguea en `admin_audit_log`. |
| `revoke_idle_user_sessions(idle_days)` | `service_role` | Revoca sesiones con `last_seen_at < now() - idle_days`. Mantenimiento. |

## Flujo en el cliente — `useSessionGuard`

Ubicación: `src/features/auth/hooks/useSessionGuard.ts`. Montado una sola vez en `AuthProvider`.

1. Al detectar `onAuthStateChange === 'SIGNED_IN'` (o en mount si ya había sesión), llama `register_user_session`. El servidor revoca las demás y devuelve el `session_id`.
2. Guarda el `session_id` en `localStorage['opina:session_id']`. Compartido entre pestañas del mismo origin → no genera filas duplicadas.
3. Cada 30s (`PING_INTERVAL_MS`) llama `ping_user_session(session_id)`:
   - `active=true` → update silencioso de `last_seen_at`.
   - `active=false` → borra `opina:session_id` de localStorage, dispara `CustomEvent('opina:session_superseded')`, hace `supabase.auth.signOut()`.
4. Tolerante a fallas: si la RPC devuelve error de red/servidor, **NO** hace signOut (evita patear al usuario por un blip).
5. En `SIGNED_OUT`, limpia `opina:session_id`.

El componente `SessionSupersededBanner` (montado dentro del `AuthContext.Provider`) escucha el evento y muestra un modal explicativo con CTA a `/login`.

## Casos de uso esperados

| Escenario                                                    | Comportamiento                                                                                       |
|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| Mismo usuario, 2 pestañas del mismo navegador                | Comparten `session_id` (localStorage) → 1 fila activa, cero supersede.                               |
| Mismo usuario loguea en navegador B mientras A está abierto  | B registra nueva sesión, revoca A. A recibe `active=false` en su próximo ping → signOut + banner.   |
| Usuario pierde device → pide al admin cerrar sus sesiones    | Admin llama `admin_revoke_user_sessions(user_id)`. El dispositivo perdido se desloguea en el próximo ping (máx 30s). |
| Sesión queda abierta 31 días sin uso                         | Cron externo / cleanup ejecuta `revoke_idle_user_sessions(30)` y la sesión queda revocada.          |
| Red cae durante ping                                          | El hook asume "activa" y reintenta en el siguiente ciclo.                                            |

## Integración con Supabase Refresh Token Rotation (bonus)

Esta capa **se suma** a la rotación nativa de refresh tokens de Supabase (Authentication → Sessions → "Detect and revoke potentially compromised refresh tokens"). Hacen cosas distintas:

- **Refresh token reuse detection** (nativo) → detecta si un mismo refresh token se usa desde dos lugares al mismo tiempo → revoca la familia. Se aplica a robo de JWT.
- **Multi-session lock** (esta migración) → no tolera dos sesiones legítimas abiertas a la vez. Se aplica a compartición de cuentas.

Ambas deben estar activadas. Ver sección "Pasos de deploy" abajo.

## Cómo testear

```sql
-- 1) Listar sesiones activas de un user dado (como admin)
SELECT id, created_at, last_seen_at, device_label
  FROM public.user_sessions
 WHERE user_id = '<UUID>'
   AND revoked_at IS NULL
 ORDER BY created_at DESC;

-- 2) Revocar manualmente todas las sesiones de un user (como admin)
SELECT public.admin_revoke_user_sessions('<UUID>', 'manual_admin');

-- 3) Verificar que las funciones están creadas
SELECT proname FROM pg_proc
 WHERE proname IN (
   'register_user_session','ping_user_session','list_my_active_sessions',
   'revoke_my_session','admin_revoke_user_sessions','revoke_idle_user_sessions'
 )
 ORDER BY proname;
```

**Prueba end-to-end desde la app:**
1. Loguearse como `admin@opina.com` en Chrome.
2. Loguearse como `admin@opina.com` en Firefox (o ventana de incógnito).
3. Esperar hasta 30s en la pestaña de Chrome → debe aparecer el modal "Sesión cerrada" y redirigir a `/login`.

## Mantenimiento sugerido

- Correr `SELECT public.revoke_idle_user_sessions(30);` semanalmente (pg_cron o Edge Function) para limpiar sesiones abandonadas > 30 días.
- Cuando el volumen crezca, considerar `DELETE FROM user_sessions WHERE revoked_at < now() - interval '1 year'` para compactar — hasta entonces la tabla es chica y los índices parciales son baratos.

## Referencias

- Migración: `supabase/migrations/20260424000200_multi_session_lock.sql`
- Hook cliente: `src/features/auth/hooks/useSessionGuard.ts`
- Banner UI: `src/features/auth/components/SessionSupersededBanner.tsx`
- Integración: `src/features/auth/context/AuthContext.tsx`
- Relacionado: `docs/architecture/admin-audit-log.md` (el revoke admin se loguea ahí)
