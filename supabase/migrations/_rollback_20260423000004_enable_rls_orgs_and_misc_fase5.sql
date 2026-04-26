-- ============================================================
-- ROLLBACK — Fase 5 RLS (orgs B2B, identidades, logs, catálogos)
-- ============================================================
-- NO APLICAR salvo regresión. Uso manual en SQL Editor.
-- ============================================================

DROP POLICY IF EXISTS "organizations_select_member"      ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_write"        ON public.organizations;
DROP POLICY IF EXISTS "organization_members_select_own"  ON public.organization_members;
DROP POLICY IF EXISTS "organization_members_admin_write" ON public.organization_members;
DROP POLICY IF EXISTS "api_usage_logs_admin_read"        ON public.api_usage_logs;
DROP POLICY IF EXISTS "signal_contexts_select_all"       ON public.signal_contexts;
DROP POLICY IF EXISTS "signal_contexts_admin_write"      ON public.signal_contexts;
DROP POLICY IF EXISTS "platform_alerts_admin_all"        ON public.platform_alerts;

ALTER TABLE public.organizations         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_identities  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_contexts       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_alerts       DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.anonymous_identities IS NULL;
