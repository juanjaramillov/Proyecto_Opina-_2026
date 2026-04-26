# Admin audit log

> **Estado**: vigente desde migración `20260424000100_admin_audit_log.sql`.
> **Cierra**: #8 Media de la auditoría técnica Drimo — "Tabla admin_audit_log + triggers en operaciones admin".

## Qué resuelve

Antes no había trazabilidad de las acciones sensibles que hace un admin (crear códigos, revocarlos, banear devices, cambiar el modo de analytics, etc.). Si mañana alguien se pregunta **quién** revocó tal código y **cuándo**, no había forma de saberlo excepto revisando backups.

Ahora cada operación admin de escritura inserta una fila inmutable en `public.admin_audit_log` con el actor, la acción, el objeto afectado y el payload relevante.

## Esquema

Tabla `public.admin_audit_log`:

| columna          | tipo        | nota                                                  |
|------------------|-------------|-------------------------------------------------------|
| `id`             | uuid        | PK                                                    |
| `created_at`     | timestamptz | default `now()`                                       |
| `actor_user_id`  | uuid        | FK a `auth.users(id)` ON DELETE SET NULL              |
| `actor_email`    | text        | snapshot del email del admin (no se actualiza)        |
| `action`         | text        | p. ej. `generate_invites`, `revoke_invite`            |
| `target_type`    | text        | p. ej. `invitation_code`, `device_hash`, `app_config` |
| `target_id`      | text        | id textual del objeto (uuid serializado, hash, etc.)  |
| `payload`        | jsonb       | detalles específicos por acción                       |

Índices:
- `(created_at DESC)` — listado reverso (dashboard)
- `(actor_user_id, created_at DESC)` — filtrar por admin
- `(action, created_at DESC)` — filtrar por acción
- `(target_type, target_id)` parcial (donde no es NULL) — buscar historial de un objeto

## Inmutabilidad por RLS

- **SELECT**: permitido solo si `is_admin_user()` es true.
- **INSERT**: bloqueado desde `authenticated` y `anon`; se inserta únicamente vía `log_admin_action()` que es `SECURITY DEFINER` (owner postgres). `service_role` también puede insertar para backfills ad-hoc.
- **UPDATE / DELETE**: policy `admin_audit_log_deny_write` con `USING (false) WITH CHECK (false)` + `REVOKE ALL` desde `PUBLIC`. En la práctica solo `postgres`/superuser podría tocar la tabla.

## Operaciones instrumentadas

| RPC                              | action                   | target_type        | target_id           | payload                                               |
|----------------------------------|--------------------------|--------------------|---------------------|-------------------------------------------------------|
| `admin_delete_invitation`        | `delete_invitation`      | `invitation_code`  | `<invite_id>`       | `{ code }`                                            |
| `admin_generate_invites`         | `generate_invites`       | `invitation_code`  | `<id>` si count=1   | `{ count, prefix, expires_at, has_aliases, invite_ids }` |
| `admin_revoke_invite`            | `revoke_invite`          | `invitation_code`  | `<invite_id>`/code  | `{ code, invite_id }`                                 |
| `admin_set_analytics_mode`       | `set_analytics_mode`     | `app_config`       | `analytics_mode`    | `{ previous, next }`                                  |
| `admin_set_device_ban`           | `set_device_ban`         | `device_hash`      | `<hash>`            | `{ banned, reason }`                                  |
| `admin_set_invitation_status`    | `set_invitation_status`  | `invitation_code`  | `<invite_id>`       | `{ previous, next }`                                  |

Las operaciones de **lectura** (`admin_get_*`, `admin_list_*`, `admin_modules_*`) NO se registran — no modifican estado y generarían ruido.

## Tolerancia a fallas

`log_admin_action()` está diseñada para **nunca** romper la RPC que la invoca:

1. Primero intenta insertar en `admin_audit_log`.
2. Si falla (permiso, lock, lo que sea), intenta dejar rastro en `app_events` con `event_name='admin_audit_log_insert_failed'`.
3. Si eso también falla, retorna NULL y la RPC sigue su curso.

Esto significa que la acción admin siempre tiene éxito para el usuario final, aunque por alguna razón la bitácora falle.

## Cómo consultar

**Desde SQL Editor (service_role o admin logueado):**

```sql
-- Últimas 50 acciones de cualquier admin
SELECT * FROM public.admin_list_audit_log(50, NULL);

-- Solo revocaciones de invite
SELECT * FROM public.admin_list_audit_log(200, 'revoke_invite');

-- Historial completo de un código puntual
SELECT created_at, actor_email, action, payload
  FROM public.admin_audit_log
 WHERE target_type = 'invitation_code'
   AND target_id = '<UUID_DEL_INVITE>'
 ORDER BY created_at DESC;
```

**Desde el cliente (Admin dashboard):**

```ts
const { data, error } = await supabase.rpc('admin_list_audit_log', {
  p_limit: 100,
  p_action: null, // o 'revoke_invite'
});
```

La RPC respeta RLS → solo responde si el caller es admin.

## Próximos pasos sugeridos (fuera de scope de esta migración)

- **UI en Admin Health**: tabla paginada con filtros por `action` y `actor_email`, usando `admin_list_audit_log`. Ya hay componentes similares en `src/features/admin/`.
- **Retención**: sumar una policy de purga (`DELETE FROM admin_audit_log WHERE created_at < now() - interval '2 years'`) si el volumen lo requiere. No es urgente: las acciones admin son de bajo throughput.
- **Exportable**: endpoint CSV para descargas de auditoría interna.

## Referencias

- Migración: `supabase/migrations/20260424000100_admin_audit_log.sql`
- RPCs instrumentadas originalmente en `supabase/migrations/20260312000000_consolidated_baseline.sql`.
- Servicio cliente afectado (lectura futura): `src/features/admin/services/adminInvitesService.ts` y análogos.
