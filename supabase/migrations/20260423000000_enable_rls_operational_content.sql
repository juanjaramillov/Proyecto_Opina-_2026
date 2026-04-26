-- ============================================================
-- Hardening RLS: contenido operacional (Fase 1 del audit RLS)
-- ============================================================
-- Contexto: auditoría interna detectó 31 tablas sin RLS.
-- Esta migración cubre las 9 más críticas del tier de contenido
-- operacional. Fases siguientes atacarán analytics_* y behavior.
--
-- Patrón aplicado:
-- - Grupo A (leído por el front): SELECT libre + escritura admin.
-- - Grupo B (backend-only): RLS sin policies. Solo service_role
--   y funciones SECURITY DEFINER pueden accederlas.
--
-- Dependencia: requiere la función public.is_admin() definida en
-- 20260330000002_admin_entities_rls.sql.
-- ============================================================

-- =====================================
-- GRUPO A — leídas desde el cliente
-- =====================================

-- battles ------------------------------------------------------
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "battles_select_all"        ON public.battles;
DROP POLICY IF EXISTS "battles_write_admin_only"  ON public.battles;

CREATE POLICY "battles_select_all"
  ON public.battles
  FOR SELECT
  USING (true);

CREATE POLICY "battles_write_admin_only"
  ON public.battles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- battle_options -----------------------------------------------
ALTER TABLE public.battle_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "battle_options_select_all"        ON public.battle_options;
DROP POLICY IF EXISTS "battle_options_write_admin_only"  ON public.battle_options;

CREATE POLICY "battle_options_select_all"
  ON public.battle_options
  FOR SELECT
  USING (true);

CREATE POLICY "battle_options_write_admin_only"
  ON public.battle_options
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- categories ---------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all"        ON public.categories;
DROP POLICY IF EXISTS "categories_write_admin_only"  ON public.categories;

CREATE POLICY "categories_select_all"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_write_admin_only"
  ON public.categories
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- signal_entities ----------------------------------------------
ALTER TABLE public.signal_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signal_entities_select_all"        ON public.signal_entities;
DROP POLICY IF EXISTS "signal_entities_write_admin_only"  ON public.signal_entities;

CREATE POLICY "signal_entities_select_all"
  ON public.signal_entities
  FOR SELECT
  USING (true);

CREATE POLICY "signal_entities_write_admin_only"
  ON public.signal_entities
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================
-- GRUPO B — backend-only (sin policies)
-- =====================================

ALTER TABLE public.battle_instances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_aliases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relationships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_types          ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.battle_instances     IS 'Backend-only. RLS sin policies — acceso solo vía service_role y funciones SECURITY DEFINER.';
COMMENT ON TABLE public.entity_aliases       IS 'Backend-only. RLS sin policies — acceso solo vía service_role y funciones SECURITY DEFINER.';
COMMENT ON TABLE public.entity_relationships IS 'Backend-only. RLS sin policies — acceso solo vía service_role y funciones SECURITY DEFINER.';
COMMENT ON TABLE public.entity_types         IS 'Backend-only. RLS sin policies — acceso solo vía service_role y funciones SECURITY DEFINER.';
COMMENT ON TABLE public.signal_types         IS 'Backend-only. RLS sin policies — acceso solo vía service_role y funciones SECURITY DEFINER.';
