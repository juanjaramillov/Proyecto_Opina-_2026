-- ============================================================
-- ROLLBACK — Fase 3 RLS (sesión, comportamiento, audit)
-- ============================================================
-- NO APLICAR salvo que el deploy principal
-- (20260423000002_enable_rls_sessions_behavior_fase3.sql) cause
-- regresión.
--
-- Prefijo `_` para que el CLI no lo ejecute automáticamente.
-- Uso manual: Supabase SQL Editor → pegar contenido → Run.
-- ============================================================

DROP POLICY IF EXISTS "app_sessions_select_own"       ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_insert_own"       ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_update_own"       ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_admin_read"       ON public.app_sessions;
DROP POLICY IF EXISTS "profile_history_insert_own"    ON public.profile_history;
DROP POLICY IF EXISTS "profile_history_admin_read"    ON public.profile_history;

ALTER TABLE public.app_sessions               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_history            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_events            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_migration_audit_log DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.behavior_events            IS NULL;
COMMENT ON TABLE public.signal_migration_audit_log IS NULL;
