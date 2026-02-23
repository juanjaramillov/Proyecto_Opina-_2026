BEGIN;

-- =========================================================================
-- 1) public.users
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.users FROM public, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO service_role;
GRANT SELECT ON TABLE public.users TO authenticated; -- Solo lectura limitada para el app

DROP POLICY IF EXISTS "permit_self_select_users" ON public.users;
CREATE POLICY "permit_self_select_users" ON public.users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- NOTA: Si el frontend hace INSERT/UPDATE en users directo, fallará. 
-- Debe hacerse por RPCs (ej. bootstrap_user_after_signup). 


-- =========================================================================
-- 2) public.user_profiles
-- =========================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_profiles FROM public, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO service_role;
GRANT SELECT, UPDATE, INSERT ON TABLE public.user_profiles TO authenticated;

DROP POLICY IF EXISTS "permit_self_select_profiles" ON public.user_profiles;
CREATE POLICY "permit_self_select_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "permit_self_update_profiles" ON public.user_profiles;
CREATE POLICY "permit_self_update_profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "permit_self_insert_profiles" ON public.user_profiles;
CREATE POLICY "permit_self_insert_profiles" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());


-- =========================================================================
-- 3) public.signal_events
-- =========================================================================
ALTER TABLE public.signal_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.signal_events FROM public, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.signal_events TO service_role;

DROP POLICY IF EXISTS "block_direct_reads_signal_events" ON public.signal_events;
DROP POLICY IF EXISTS "block_direct_inserts_signal_events" ON public.signal_events;

-- Ninguna policy para anon/authenticated. Se escribe SOLO vía insert_signal_event() (Security Definer)
-- y se lee vía RPCs o vistas materializadas (Security Definer).


-- =========================================================================
-- 4) public.public_rank_snapshots 
-- =========================================================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='public_rank_snapshots') THEN
    ALTER TABLE public.public_rank_snapshots ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.public_rank_snapshots FROM public, anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.public_rank_snapshots TO service_role;
    GRANT SELECT ON TABLE public.public_rank_snapshots TO anon, authenticated;

    DROP POLICY IF EXISTS "permit_public_read_snapshots" ON public.public_rank_snapshots;
    CREATE POLICY "permit_public_read_snapshots" ON public.public_rank_snapshots
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;


-- =========================================================================
-- 5) public.user_stats 
-- =========================================================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_stats') THEN
    ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.user_stats FROM public, anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_stats TO service_role;
    GRANT SELECT ON TABLE public.user_stats TO authenticated;

    DROP POLICY IF EXISTS "permit_self_select_user_stats" ON public.user_stats;
    CREATE POLICY "permit_self_select_user_stats" ON public.user_stats
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;


-- =========================================================================
-- 6) public.user_activity
-- =========================================================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_activity') THEN
    ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.user_activity FROM public, anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_activity TO service_role;
    GRANT SELECT, INSERT, UPDATE ON TABLE public.user_activity TO authenticated;

    DROP POLICY IF EXISTS "permit_self_select_activity" ON public.user_activity;
    CREATE POLICY "permit_self_select_activity" ON public.user_activity
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    DROP POLICY IF EXISTS "permit_self_insert_activity" ON public.user_activity;
    CREATE POLICY "permit_self_insert_activity" ON public.user_activity
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    DROP POLICY IF EXISTS "permit_self_update_activity" ON public.user_activity;
    CREATE POLICY "permit_self_update_activity" ON public.user_activity
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

COMMIT;
