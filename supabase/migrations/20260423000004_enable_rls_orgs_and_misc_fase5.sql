-- ============================================================
-- Hardening RLS: orgs B2B, identidades, logs y catálogos (Fase 5)
-- ============================================================
-- Cierra 6 tablas que el audit inicial había marcado como "RLS
-- sin policies" pero la verificación global reveló que en realidad
-- no tenían RLS habilitado. Con esta fase se completa el audit
-- al 100% de las tablas de aplicación.
--
-- Decisiones:
-- - organizations/organization_members: patrón B2B multi-tenancy
--   (miembro ve la suya, admin ve todas).
-- - anonymous_identities: backend-only (acceso vía RPC
--   get_or_create_anon_id con SECURITY DEFINER).
-- - api_usage_logs: admin_read (auditoría B2B).
-- - signal_contexts: catálogo público con escritura admin.
-- - platform_alerts: admin-only (operacional).
--
-- Dependencia: public.is_admin() (existe desde 20260330000002).
-- Idempotente: puede re-aplicarse sin efectos secundarios.
-- ============================================================

-- =====================================
-- organizations — B2B multi-tenancy
-- =====================================
DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_write"   ON public.organizations;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select_member"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "organizations_admin_write"
  ON public.organizations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================
-- organization_members — usuario ve sus filas, admin todas
-- =====================================
DROP POLICY IF EXISTS "organization_members_select_own"  ON public.organization_members;
DROP POLICY IF EXISTS "organization_members_admin_write" ON public.organization_members;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organization_members_select_own"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "organization_members_admin_write"
  ON public.organization_members FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================
-- anonymous_identities — backend-only
-- =====================================
ALTER TABLE public.anonymous_identities ENABLE ROW LEVEL SECURITY;

-- =====================================
-- api_usage_logs — admin SELECT
-- =====================================
DROP POLICY IF EXISTS "api_usage_logs_admin_read" ON public.api_usage_logs;

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_usage_logs_admin_read"
  ON public.api_usage_logs FOR SELECT
  USING (public.is_admin());

-- =====================================
-- signal_contexts — catálogo público + admin write
-- =====================================
DROP POLICY IF EXISTS "signal_contexts_select_all"  ON public.signal_contexts;
DROP POLICY IF EXISTS "signal_contexts_admin_write" ON public.signal_contexts;

ALTER TABLE public.signal_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signal_contexts_select_all"
  ON public.signal_contexts FOR SELECT
  USING (true);

CREATE POLICY "signal_contexts_admin_write"
  ON public.signal_contexts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================
-- platform_alerts — admin only
-- =====================================
DROP POLICY IF EXISTS "platform_alerts_admin_all" ON public.platform_alerts;

ALTER TABLE public.platform_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_alerts_admin_all"
  ON public.platform_alerts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================
-- Comentarios descriptivos
-- =====================================
COMMENT ON TABLE public.anonymous_identities IS 'Backend-only. RLS sin policies — acceso solo vía RPC get_or_create_anon_id() (SECURITY DEFINER).';
