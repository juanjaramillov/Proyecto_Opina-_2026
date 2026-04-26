-- ============================================================
-- Hardening RLS: sesión, comportamiento y audit (Fase 3)
-- ============================================================
-- Cubre 4 tablas que quedaron sin RLS. pilot_access_attempts se
-- omite intencionalmente: ya tiene RLS + policy correcta desde
-- 20260422000000_debt006_backend_rate_limiting.sql.
--
-- Hallazgo relevante: fn_validate_profile_update (trigger) NO es
-- SECURITY DEFINER. Por eso profile_history tiene policy INSERT
-- que el trigger puede pasar. No modificamos el trigger.
--
-- Dependencia: public.is_admin() (existe desde 20260330000002).
-- ============================================================

-- =====================================
-- app_sessions — user_owns_row + admin read
-- =====================================
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_sessions_select_own"  ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_insert_own"  ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_update_own"  ON public.app_sessions;
DROP POLICY IF EXISTS "app_sessions_admin_read"  ON public.app_sessions;

CREATE POLICY "app_sessions_select_own"
  ON public.app_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "app_sessions_insert_own"
  ON public.app_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_sessions_update_own"
  ON public.app_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_sessions_admin_read"
  ON public.app_sessions
  FOR SELECT
  USING (public.is_admin());

-- =====================================
-- profile_history — admin SELECT + user INSERT (para trigger)
-- =====================================
ALTER TABLE public.profile_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_history_insert_own"  ON public.profile_history;
DROP POLICY IF EXISTS "profile_history_admin_read"  ON public.profile_history;

CREATE POLICY "profile_history_insert_own"
  ON public.profile_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_history_admin_read"
  ON public.profile_history
  FOR SELECT
  USING (public.is_admin());

-- =====================================
-- Backend-only (RLS sin policies)
-- =====================================
ALTER TABLE public.behavior_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_migration_audit_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.behavior_events            IS 'Backend-only. RLS sin policies — acceso solo vía service_role y RPCs SECURITY DEFINER (get_system_health).';
COMMENT ON TABLE public.signal_migration_audit_log IS 'Backend-only. RLS sin policies — audit log interno de migraciones de datos.';
