-- ============================================================================
-- F-02 (CTO audit, 2026-04-25): Fijar search_path en funciones SECURITY DEFINER
-- ============================================================================
--
-- POR QUÉ:
-- Las funciones SECURITY DEFINER que NO fijan `search_path` son vulnerables
-- a "search_path hijacking": un atacante con permisos para crear objetos en
-- un schema temporal (pg_temp) o en cualquier schema que aparezca antes de
-- 'public' en el search_path puede definir una función con el mismo nombre
-- que una referenciada SIN qualifier dentro del cuerpo de la función
-- SECURITY DEFINER, y Postgres ejecutará la versión maliciosa con los
-- privilegios del owner (postgres). Es el equivalente PG de un PATH hijack.
--
-- FIX:
-- Forzar `search_path = public, extensions, pg_temp` en cada función.
--   - `public`     → schema principal de la app.
--   - `extensions` → schema donde Supabase deja pgcrypto / uuid-ossp.
--                    Necesario porque varias funciones usan gen_random_uuid()
--                    sin qualificar.
--   - `pg_temp`    → SIEMPRE al final, para que un objeto temporal jamás
--                    tenga prioridad sobre uno "real". Es justo el vector
--                    que estamos cerrando.
--
-- POR QUÉ ALTER y NO RECREAR:
-- ALTER FUNCTION ... SET search_path solo modifica `pg_proc.proconfig`. No
-- toca el cuerpo, no rompe firmas, no invalida grants, no requiere `DROP`
-- previo. Es la operación más segura posible y es idempotente: re-aplicarla
-- no falla ni cambia nada.
--
-- LISTA AUTORITATIVA:
-- Las 16 funciones de abajo se obtuvieron de una query directa a producción
-- (pg_proc + pg_namespace) el 2026-04-25, no de las migraciones del repo.
-- Esto es importante porque algunas migraciones referencian funciones que
-- en prod ya fueron reemplazadas por versiones `_v1_1` con search_path.
--
-- PATRÓN A FUTURO:
-- TODA nueva función SECURITY DEFINER debe declarar
--   `SET search_path TO 'public, extensions, pg_temp'`
-- directamente dentro de su CREATE OR REPLACE FUNCTION. La query de
-- validación al final de este archivo debe seguir devolviendo 0 filas
-- tras cada deploy. Si devuelve >0, alguien introdujo una función
-- SECURITY DEFINER sin search_path y debe arreglarse.
-- ============================================================================

ALTER FUNCTION public.admin_search_users(text)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.calculate_opinascore_v1_1(uuid, text, uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.calculate_user_segment_comparison(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_analytical_integrity_flags(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_b2b_actualidad_topic_analytics(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_b2b_battle_analytics(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_b2b_depth_brand_analytics(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_b2b_trending_decay_leaderboard(numeric, character varying, integer)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_hub_live_stats_24h()
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_premium_eligibility_v1_1(uuid, text)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_results_kpis()
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_system_health()
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.get_user_personal_history(uuid)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.initialize_user_loyalty()
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.process_loyalty_action(uuid, character varying)
    SET search_path = public, extensions, pg_temp;

ALTER FUNCTION public.process_weekly_missions()
    SET search_path = public, extensions, pg_temp;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN POST-DEPLOY
-- ----------------------------------------------------------------------------
-- Correr en Supabase Dashboard → SQL Editor después del deploy. Debe devolver
-- exactamente 0 filas. Si devuelve >0, alguna función SECURITY DEFINER quedó
-- sin search_path y este fix está incompleto.
--
--   SELECT
--     p.proname AS function_name,
--     pg_get_function_identity_arguments(p.oid) AS args
--   FROM pg_proc p
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public'
--     AND p.prosecdef = true
--     AND (
--       p.proconfig IS NULL
--       OR NOT EXISTS (
--         SELECT 1 FROM unnest(p.proconfig) AS c
--         WHERE c LIKE 'search_path=%'
--       )
--     )
--   ORDER BY p.proname;
-- ----------------------------------------------------------------------------
