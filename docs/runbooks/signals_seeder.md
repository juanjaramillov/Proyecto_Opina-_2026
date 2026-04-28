# Runbook — Seeder de batallas para /signals

## Contexto

La página `/signals` muestra un PageState `"Sin señales activas"` cuando
`get_active_battles()` devuelve `[]`. Esa RPC filtra de manera estricta:

1. `battles.status = 'active'`
2. cada batalla con **≥ 2** `battle_options`
3. cada `battle_option` apunta a una entity con **≥ 10** `depth_definitions`

Cualquier categoría/entity que no cumpla queda silenciosamente fuera del
Hub. Por eso el seed legacy en `supabase/seed.sql` (que filtraba por
`e.category = 'Comida Rápida'`) dejó de poblar la app cuando el catálogo
real migró a slugs en kebab-case (`fast-food`, `bancos`, etc.).

## Estado actual (post-2026-04-27)

- Migración `20260427000000_seed_battles_from_entities.sql` genera
  **1 batalla activa por cada categoría con ≥ 2 entities aptas**, con
  slug determinístico `versus-<category_slug>`.
- RPC `public.admin_seed_battles_from_entities()` re-aplica el mismo
  seeder bajo demanda (idempotente, audit-logged, admin-only).
- Hoy quedan **80 batallas / 518 options** alimentando `/signals`.

## Cuándo correr el seeder otra vez

- Cargaste nuevas entities (≥ 10 depth_definitions cada una) en una
  categoría existente → quieres que aparezcan como nuevas options en su
  batalla.
- Diste de alta una nueva categoría con ≥ 2 entities aptas → quieres que
  aparezca una nueva batalla `versus-<slug>`.
- Renombraste una categoría (cambió `categories.name`) → quieres que el
  título de la batalla refleje el nuevo nombre.

## Cómo correrlo (Supabase SQL Editor del proyecto Opina+)

1. Abre el [SQL Editor](https://supabase.com/dashboard/project/neltawfiwpvunkwyvfse/sql/new).
2. Pega y ejecuta:

   ```sql
   SELECT public.admin_seed_battles_from_entities();
   ```

3. Devuelve un JSON tipo:

   ```json
   {
     "battles_upserted": 80,
     "options_upserted": 518,
     "instances_inserted": 0,
     "active_after": 80,
     "caller": "dashboard"
   }
   ```

   `caller` distingue de dónde se invocó: `dashboard` (SQL Editor como
   superuser `postgres` sin sesión de auth — no se loggea en
   `admin_audit_log`) o `frontend` (admin logueado, sí se loggea).

   - `battles_upserted` / `options_upserted` cuentan filas tocadas
     (insertadas o actualizadas).
   - `instances_inserted` solo se incrementa para batallas nuevas (las
     existentes ya tienen `version=1`).
   - `active_after` es lo que verá el frontend al recargar `/signals`.

4. (Opcional) `NOTIFY pgrst, 'reload schema';` si tocaste columnas en
   tablas relacionadas. Para esta RPC en particular no hace falta.

## Verificación rápida

```sql
SELECT COUNT(*) FROM public.get_active_battles();   -- esperado: ≥ 80
SELECT slug, title, jsonb_array_length(options) AS n
FROM public.get_active_battles() ORDER BY slug LIMIT 5;
```

Y en el browser: recarga `http://localhost:5173/signals`. El estado
`"Sin señales activas"` desaparece y el Hero/Bento renderiza la primera
batalla activa.

## Anti-patrones

- ❌ Insertar `battles` directamente vía SQL ad-hoc sin pasar por el
  filtro de "≥ 10 depth_definitions" → la batalla quedará invisible al
  Hub aunque exista en la tabla.
- ❌ Usar `categories.emoji` como prefijo de UI: ese campo a veces guarda
  nombres de Material Icons (`account_balance`, `flight`, …) en vez de
  emoji Unicode. Confiar en `categories.name`.
- ❌ Borrar `battles` con TRUNCATE → arrastra cascada a `battle_options`,
  `battle_instances` y `signal_events`. Si necesitas reiniciar, prefiere
  desactivar (`UPDATE battles SET status='archived' WHERE …`) y luego
  re-correr la RPC para regenerar.

## Auditoría

Cada llamada a la RPC genera una fila en `public.admin_audit_log` con
`action = 'admin_seed_battles_from_entities'` y `payload` con los
contadores. Útil para postmortems y para confirmar quién regeneró el Hub.
