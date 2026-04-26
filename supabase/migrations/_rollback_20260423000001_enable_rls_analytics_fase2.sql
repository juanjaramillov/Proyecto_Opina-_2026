-- ============================================================
-- ROLLBACK — Fase 2 RLS hardening (tablas analíticas)
-- ============================================================
-- NO APLICAR salvo que el deploy principal
-- (20260423000001_enable_rls_analytics_fase2.sql) cause regresión.
--
-- Este archivo tiene prefijo `_` para que el CLI de Supabase no
-- lo ejecute automáticamente. Se corre manualmente si necesitas
-- revertir el cambio.
--
-- Uso manual:
--   Supabase SQL Editor → pegar contenido → Run.
-- ============================================================

-- Deshabilitar RLS en las 7 tablas ----------------------------
ALTER TABLE public.user_daily_metrics        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_hourly_aggs        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_rollups_hourly     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_daily_aggregates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_daily_aggregates   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollup_state              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.volatility_snapshots      DISABLE ROW LEVEL SECURITY;

-- Limpiar comments descriptivos -------------------------------
COMMENT ON TABLE public.user_daily_metrics        IS NULL;
COMMENT ON TABLE public.signal_hourly_aggs        IS NULL;
COMMENT ON TABLE public.signal_rollups_hourly     IS NULL;
COMMENT ON TABLE public.category_daily_aggregates IS NULL;
COMMENT ON TABLE public.entity_daily_aggregates   IS NULL;
COMMENT ON TABLE public.rollup_state              IS NULL;
COMMENT ON TABLE public.volatility_snapshots      IS NULL;
