# Datos sintéticos — guía de uso

> Uso interno. Pensado para sembrar usuarios y señales de prueba durante la
> revisión previa al lanzamiento público de Opina+. Toda la marca es
> trazable y se borra en bloque antes de publicar.

## 1. Qué se crea

| Capa | Marca | Cómo se borra |
| --- | --- | --- |
| `auth.users` | email `synthetic+<batch>+NNNN@opina.test` + `raw_user_meta_data.synthetic = true` | `delete_synthetic_batch` o `delete_all_synthetic_data` |
| `public.users` | columna `is_synthetic = true` + `synthetic_batch_label` | cascade desde `auth.users` |
| `public.user_profiles` | columna `is_synthetic = true` + `synthetic_batch_label` | cascade desde `auth.users` |
| `public.signal_events` | `meta.synthetic = true` + `meta.batch = <label>` | borrado explícito por la RPC |
| `public.synthetic_seed_batches` | registro maestro por batch | `deleted_at` se setea al borrar |

Cada usuario sintético genera entre **5 y 20 señales versus** contra los
battles existentes con `status = 'active'` (Reyes del Bajón, Guerra de la
Plata, Guerra del Internet). Todos los timestamps quedan distribuidos en
los últimos 60 días para que los dashboards muestren patrones temporales.

Demografía variada por usuario: género, age_bucket, región, comuna,
educación, situación laboral, ingreso, vivienda, comportamiento de
compra, nivel de influencia, hogar, hijos y autos. `profile_stage = 2`
para que cuenten como onboarding completo (requisito para emitir señales).

## 2. Aplicar la migración

La migración vive en
`supabase/migrations/20260427120000_synthetic_data_infrastructure.sql`.

**No la apliques en el proyecto de producción.** Va sobre un entorno
interno (branch de Supabase, proyecto de staging o local).

```bash
# Opción 1 — Supabase CLI (preferida si ya estás conectado al ambiente correcto)
supabase db push

# Opción 2 — pegar el archivo entero en SQL Editor
# Studio → SQL Editor → pega el contenido de la migración → Run.
```

Tras aplicarla, la migración corre `NOTIFY pgrst, 'reload schema'`
automáticamente. Si PostgREST sigue cacheando la versión anterior, repite
el NOTIFY desde el SQL Editor.

## 3. Sembrar un batch

### 3.a Desde el panel admin (recomendado)

1. Loguéate como admin (`admin@opina.com`).
2. Andá a `/admin/synthetic` en el navegador.
3. Llená el form:
   - **Label**: identificador único, ej. `review-2026-04` (regex
     `^[a-zA-Z0-9_-]{2,40}$`).
   - **Cantidad de usuarios**: 1..1000. Por defecto 100.
   - **Notas** (opcional): contexto del batch.
4. Clic en **Crear batch**. Toma unos segundos por cada 100 usuarios.

### 3.b Desde el SQL Editor (alternativa)

```sql
SELECT public.seed_synthetic_batch(
    p_label      := 'review-2026-04',
    p_user_count := 100,
    p_notes      := 'Revisión interna del módulo versus'
);
-- Devuelve: <batch_id uuid>
```

Reglas que valida la RPC:

- `p_user_count` debe estar entre 1 y 1000.
- `p_label` debe matchear `^[a-zA-Z0-9_-]{2,40}$` (caracteres inválidos
  se reemplazan por `_` antes de validar).
- Solo `is_admin_user() = true` puede ejecutar.

## 4. Verificar lo sembrado

```sql
-- 1) ¿Cuántos usuarios sintéticos vivos hay y de qué batches?
SELECT synthetic_batch_label, COUNT(*) AS users
FROM public.users
WHERE is_synthetic = true
GROUP BY synthetic_batch_label;

-- 2) ¿Cuántas señales sintéticas hay por batch?
SELECT meta->>'batch' AS batch, COUNT(*) AS signals
FROM public.signal_events
WHERE meta->>'synthetic' = 'true'
GROUP BY meta->>'batch';

-- 3) Resumen por batch (vista provista por la migración)
SELECT * FROM public.synthetic_seed_summary;
```

La vista `synthetic_seed_summary` ya está protegida con
`WHERE public.is_admin_user()`, así que solo el admin la lee.

## 5. Borrar un batch

### 5.a Desde el panel

`/admin/synthetic` → fila del batch → botón **Borrar** → confirmar.

### 5.b Desde SQL

```sql
SELECT public.delete_synthetic_batch('review-2026-04');
-- Devuelve: { batch_id, label, users_deleted, signals_deleted }
```

Borra primero todas las `signal_events` del batch, luego las filas de
`auth.users` (cascadea a `public.users` y `public.user_profiles`), y
marca el batch como `deleted_at = now()` en
`synthetic_seed_batches` (no lo elimina físicamente — queda el rastro
para auditoría).

## 6. Limpieza total antes de publicar

Pensada para correr **una vez** justo antes de abrir la plataforma al
público. Borra todos los datos sintéticos sin importar el batch.

### 6.a Desde el panel

`/admin/synthetic` → al final de la página, sección **Zona peligrosa**
→ **Limpieza total de datos sintéticos** → confirmar.

### 6.b Desde SQL (con token literal, defensa contra accidentes)

```sql
SELECT public.delete_all_synthetic_data('YES_DELETE_ALL_SYNTHETIC');
-- Devuelve: { users_deleted, signals_deleted, batches_marked }
```

Sin ese token exacto la RPC tira `CONFIRM_REQUIRED`.

## 7. Verificar que la base quedó limpia

Tres queries que deben devolver **0 filas** después de la limpieza:

```sql
-- A) Usuarios marcados como sintéticos en public.users
SELECT COUNT(*) FROM public.users WHERE is_synthetic = true;

-- B) Usuarios sintéticos en auth.users (por metadata o por email pattern)
SELECT COUNT(*)
FROM auth.users
WHERE raw_user_meta_data->>'synthetic' = 'true'
   OR email LIKE 'synthetic+%@opina.test';

-- C) Señales sintéticas
SELECT COUNT(*)
FROM public.signal_events
WHERE meta->>'synthetic' = 'true';
```

Si los 3 dan 0, no queda nada sintético en la base. Los registros en
`synthetic_seed_batches` con `deleted_at IS NOT NULL` son solo trazas de
auditoría y no contienen datos productivos — no hace falta borrarlos
para "publicar limpio".

## 8. Auditoría de quién hizo qué

Toda invocación de `seed_synthetic_batch`, `delete_synthetic_batch` y
`delete_all_synthetic_data` queda registrada en `admin_audit_log` vía
`log_admin_action`.

```sql
SELECT created_at, actor_email, action, target_id, payload
FROM public.admin_audit_log
WHERE action LIKE '%synthetic%'
ORDER BY created_at DESC;
```

## 9. Limitaciones conocidas

- **Login**: los usuarios sintéticos NO pueden loguearse — su
  `encrypted_password` es un hash bcrypt aleatorio sin contraparte
  conocida. Esto es intencional: no queremos que existan cuentas
  loguables sin owner.
- **Solo señales versus**: por ahora se generan únicamente señales
  `VERSUS_SIGNAL` contra battles activos. Si querés que las páginas de
  Actualidad / current_topics también se vean pobladas, hay que extender
  `seed_synthetic_batch` para emitir `CONTEXT_SIGNAL` — está pendiente
  como una segunda fase.
- **No simula sesiones**: no se insertan filas en `user_sessions`. Los
  signals quedan con `session_id = NULL`, que es un valor permitido.
- **Distribuciones uniformes**: género, región, opciones de battle, etc.
  se eligen con `random()` uniforme. Si necesitás distribuciones más
  realistas (ej. 70/30 polarizado por battle), hay que customizar la RPC.

## 10. Si la migración falla en `auth.users`

Distintas versiones de Supabase tienen columnas adicionales NOT NULL en
`auth.users` (tokens, flags SSO, etc.). La migración inserta el set
mínimo común — si tu instancia exige más columnas, agregalas al
`INSERT INTO auth.users (...)` dentro de `seed_synthetic_batch`. El
error te dirá exactamente qué columna falta.

Alternativa robusta: cambiar la RPC para usar la API admin de Supabase
desde una Edge Function, pero esto agrega complejidad de infra y no era
necesario para el alcance interno actual.

## 11. Archivos relacionados

- Migración: `supabase/migrations/20260427120000_synthetic_data_infrastructure.sql`
- Servicio: `src/features/admin/services/adminSyntheticService.ts`
- Hook: `src/features/admin/hooks/useAdminSynthetic.ts`
- Página: `src/features/admin/pages/AdminSynthetic.tsx`
- Ruta: `src/App.tsx` (sección 5.6, `/admin/synthetic`)
