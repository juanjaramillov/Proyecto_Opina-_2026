-- ============================================================
-- ROLLBACK — Fase 1 RLS hardening (contenido operacional)
-- ============================================================
-- NO APLICAR salvo que el deploy principal
-- (20260423000000_enable_rls_operational_content.sql) cause regresión.
--
-- Este archivo tiene prefijo `_` para que el CLI de Supabase no
-- lo ejecute automáticamente. Se corre manualmente si necesitas
-- revertir el cambio.
--
-- Uso manual:
--   psql $DATABASE_URL -f _rollback_20260423000000_enable_rls_operational_content.sql
-- o desde el SQL editor de Supabase Studio, pegando el contenido.
-- ============================================================

-- Grupo A: drop policies y deshabilitar RLS -------------------
DROP POLICY IF EXISTS "battles_select_all"                ON public.battles;
DROP POLICY IF EXISTS "battles_write_admin_only"          ON public.battles;
DROP POLICY IF EXISTS "battle_options_select_all"         ON public.battle_options;
DROP POLICY IF EXISTS "battle_options_write_admin_only"   ON public.battle_options;
DROP POLICY IF EXISTS "categories_select_all"             ON public.categories;
DROP POLICY IF EXISTS "categories_write_admin_only"       ON public.categories;
DROP POLICY IF EXISTS "signal_entities_select_all"        ON public.signal_entities;
DROP POLICY IF EXISTS "signal_entities_write_admin_only"  ON public.signal_entities;

ALTER TABLE public.battles         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_options  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_entities DISABLE ROW LEVEL SECURITY;

-- Grupo B: solo deshabilitar RLS (no había policies) ----------
ALTER TABLE public.battle_instances     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_aliases       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_types         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_types         DISABLE ROW LEVEL SECURITY;

-- Limpiar comments descriptivos del Grupo B --------------------
COMMENT ON TABLE public.battle_instances     IS NULL;
COMMENT ON TABLE public.entity_aliases       IS NULL;
COMMENT ON TABLE public.entity_relationships IS NULL;
COMMENT ON TABLE public.entity_types         IS NULL;
COMMENT ON TABLE public.signal_types         IS NULL;
