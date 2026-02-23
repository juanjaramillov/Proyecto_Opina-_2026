BEGIN;

-- =========================================================
-- A) CONGELAR LEGACY (sin borrar datos)
-- =========================================================

-- 1) profiles legacy: renombrar tabla si existe, luego crear VIEW de compat
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='profiles'
  ) THEN
    -- si ya es view, no renombrar
    IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname='profiles' AND c.relkind='r'
    ) THEN
      ALTER TABLE public.profiles RENAME TO profiles_legacy_20260223;
    END IF;
  END IF;
END $$;

-- 2) ranking_snapshots legacy: si existe, renombrar para evitar motores paralelos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='ranking_snapshots'
  ) THEN
    ALTER TABLE public.ranking_snapshots RENAME TO ranking_snapshots_legacy_20260223;
  END IF;
END $$;

-- 3) Desactivar cron viejo (si existiera) para rankings legacy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('generate-ranking-snapshots');
    EXCEPTION WHEN others THEN
      -- noop
    END;
  END IF;
END $$;


-- =========================================================
-- B) VIEW de compat: public.profiles (para que nada reviente)
-- Fuente real: public.user_profiles + public.users
-- =========================================================
DROP VIEW IF EXISTS public.profiles;

CREATE VIEW public.profiles AS
SELECT
  up.user_id,
  up.nickname,

  -- Demografía (compat)
  up.gender,
  up.age_bucket,
  up.region,
  up.comuna,
  up.education,

  -- Calidad
  up.profile_completeness,
  1.0 AS signal_weight,
  u.is_identity_verified AS verified,

  -- Seguridad / RBAC
  u.role,
  u.is_identity_verified AS identity_verified,
  u.invitation_code_id,

  up.last_demographics_update,
  up.created_at,
  up.updated_at
FROM public.user_profiles up
LEFT JOIN public.users u ON u.user_id = up.user_id;

-- La view es solo lectura desde cliente; si alguien intenta UPDATE directo, falla.
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;


-- =========================================================
-- C) “HEALTHCHECK” para validar baseline (sin adivinar)
-- =========================================================
CREATE OR REPLACE FUNCTION public.healthcheck_baseline()
RETURNS TABLE(check_name text, ok boolean, detail text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 'table.signal_events', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='signal_events'
  ), 'signal_events exists';

  RETURN QUERY
  SELECT 'table.users', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'
  ), 'users exists';

  RETURN QUERY
  SELECT 'table.user_profiles', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_profiles'
  ), 'user_profiles exists';

  RETURN QUERY
  SELECT 'rpc.insert_signal_event', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='insert_signal_event'
  ), 'insert_signal_event exists';

  RETURN QUERY
  SELECT 'rpc.insert_depth_answers', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='insert_depth_answers'
  ), 'insert_depth_answers exists';

  RETURN QUERY
  SELECT 'rpc.get_entity_rankings_latest', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='get_entity_rankings_latest'
  ), 'rankings rpc exists';

  RETURN QUERY
  SELECT 'view.profiles', EXISTS(
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='profiles'
  ), 'profiles compatibility view exists';
END;
$$;

GRANT EXECUTE ON FUNCTION public.healthcheck_baseline() TO authenticated;

COMMIT;
