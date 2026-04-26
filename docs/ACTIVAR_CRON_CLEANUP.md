# Activar el cron de limpieza automática de usuarios huérfanos

> **Estado**: pendiente de activación. El sistema funciona sin esto — activarlo es defensa en profundidad.
> **Tiempo estimado**: 10 minutos.
> **Dónde se hace**: todo en Supabase Dashboard (no requiere terminal).

---

## Qué hace este cron

Cada noche a las 3:00 AM UTC (~00:00 Chile en verano), llama a la Edge Function `cleanup-orphan-users` y borra los `auth.users` que lleven más de 24h sin registro en `user_profiles`.

**Protege contra**: casos edge donde el rollback atómico del registro falle y queden usuarios zombi ocupando emails.

---

## Prerrequisitos — hay que habilitar 2 extensiones de Postgres

### 1. pg_cron (permite programar tareas periódicas)

1. Ir a: https://supabase.com/dashboard/project/neltawfiwpvunkwyvfse/database/extensions
2. En el buscador, escribir: `pg_cron`
3. Click en el toggle para habilitarlo.
4. Confirmar.

### 2. pg_net (permite que el cron haga HTTP requests a la Edge Function)

1. En la misma pantalla de Extensions, buscar: `pg_net`
2. Click en el toggle para habilitarlo.
3. Confirmar.

> Si alguno ya está activado (toggle verde), déjalo como está.

---

## Paso 1 — Conseguir tu SERVICE_ROLE_KEY

El cron necesita autorización para llamar a la Edge Function (que requiere JWT de admin). Usamos la `service_role` key del proyecto.

1. Ir a: https://supabase.com/dashboard/project/neltawfiwpvunkwyvfse/settings/api
2. En la sección **"Project API keys"**, buscar la línea que dice **`service_role`** (NO la `anon`).
3. Click en **"Reveal"** para verla.
4. Copiarla entera (empieza con `eyJ...` y es muy larga).

> ⚠️ **Nunca pongas la `service_role` key en código cliente ni la compartas**. Es como una llave maestra. Solo la vas a pegar una vez en Supabase SQL Editor.

---

## Paso 2 — Crear el schedule

1. Ir al SQL Editor: https://supabase.com/dashboard/project/neltawfiwpvunkwyvfse/sql/new

2. Pegar este SQL **reemplazando** `<PEGAR_SERVICE_ROLE_KEY_AQUI>` por la key que copiaste en el Paso 1:

```sql
SELECT cron.schedule(
  'cleanup-orphan-users-daily',
  '0 3 * * *',  -- todos los días a las 03:00 UTC
  $$
    SELECT net.http_post(
      url     := 'https://neltawfiwpvunkwyvfse.supabase.co/functions/v1/cleanup-orphan-users',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <PEGAR_SERVICE_ROLE_KEY_AQUI>'
      ),
      body := jsonb_build_object('older_than_hours', 24, 'dry_run', false)
    ) AS request_id;
  $$
);
```

3. Click **"Run"**.

**Qué esperar**: te devuelve una fila con un número (el jobid) tipo:

```
| schedule |
| -------- |
| 1        |
```

---

## Paso 3 — Verificar que el schedule quedó registrado

Pegar esta query en el SQL Editor y ejecutar:

```sql
SELECT jobid, schedule, command, active
FROM cron.job
WHERE jobname = 'cleanup-orphan-users-daily';
```

**Qué esperar**: 1 fila con `schedule = '0 3 * * *'` y `active = true`.

---

## Paso 4 — Probar sin esperar a la medianoche (dry_run)

Para confirmar que la función responde correctamente antes de que el cron la llame por primera vez, puedes dispararla manualmente en modo "dry_run" (no borra nada, solo cuenta):

1. Ir a Edge Functions: https://supabase.com/dashboard/project/neltawfiwpvunkwyvfse/functions/cleanup-orphan-users/details
2. En la sección "Invoke function", click **"Test"**.
3. En el body, pegar:
   ```json
   { "older_than_hours": 24, "dry_run": true }
   ```
4. En los headers, agregar:
   - `Content-Type: application/json`
   - `Authorization: Bearer <tu_service_role_key>`
5. Click **"Send"**.

**Qué esperar**: respuesta JSON con:
```json
{
  "ok": true,
  "dry_run": true,
  "orphan_count": 0,    // o el número que encuentre
  "orphans": []
}
```

Si `orphan_count > 0`, esos son los huérfanos que el cron borraría en la próxima corrida.

---

## Monitoreo — ver corridas del cron

Después de que corra al menos una vez (24h de espera para el primer run), puedes revisar el historial:

```sql
SELECT start_time, status, return_message, database
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-orphan-users-daily')
ORDER BY start_time DESC
LIMIT 20;
```

`status = 'succeeded'` en cada fila → todo bien.
`status = 'failed'` → revisa `return_message` para ver qué falló.

---

## Cómo desactivar el cron (si alguna vez quieres)

Correr en el SQL Editor:

```sql
SELECT cron.unschedule('cleanup-orphan-users-daily');
```

Te devuelve `true` si lo sacó del schedule.

---

## Troubleshooting

### "ERROR: permission denied for schema cron"
No tienes permisos. En Supabase los usuarios normales no tienen acceso a cron; tiene que ser el SQL Editor del dashboard (que corre como postgres/supabase_admin). Asegúrate de estar en el SQL Editor, no conectado via psql con otra cuenta.

### "ERROR: function net.http_post does not exist"
La extensión `pg_net` no está habilitada. Volver al prerrequisito.

### El cron corre pero la función falla con 401
La `service_role_key` que pegaste es incorrecta o expiró. Reemplazarla siguiendo el Paso 1 → sacar el schedule con `cron.unschedule(...)` → volver a crearlo.

### El cron no borra nada pero hay huérfanos
Revisa `older_than_hours`. Por default pedimos 24h — si creaste usuarios hoy y se rompieron, todavía no tienen 24h. Espera o cambia el parámetro en el body del cron.

---

## Referencias al código

- Edge Function: `supabase/functions/cleanup-orphan-users/index.ts`
- Config: `supabase/config.toml` → `[functions.cleanup-orphan-users]`
- Migración opcional comentada: `supabase/migrations/_optional_cron_cleanup_orphan_users.sql`
