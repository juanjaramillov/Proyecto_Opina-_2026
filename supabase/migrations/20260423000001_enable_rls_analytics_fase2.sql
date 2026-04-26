-- ============================================================
-- Hardening RLS: tablas analíticas (Fase 2 del audit RLS)
-- ============================================================
-- Contexto: 7 tablas de agregados y control interno quedaron sin
-- RLS en el baseline. Incluye user_daily_metrics que contiene
-- user_id + comportamiento (riesgo alto, hoy expuesto).
--
-- Patrón: todas cerradas a backend-only (RLS sin policies).
-- Solo service_role y funciones SECURITY DEFINER pueden acceder.
-- Ninguna de estas tablas se consume hoy desde el front.
--
-- Pendiente documentado (no se resuelve aquí):
--   - depth_aggregates tiene RLS con policies que referencian
--     profiles_legacy_20260223. Funciona pero está acoplado a
--     estructura legacy. Limpiar en una fase futura.
-- ============================================================

-- CRÍTICO: contiene user_id -----------------------------------
ALTER TABLE public.user_daily_metrics       ENABLE ROW LEVEL SECURITY;

-- Agregados sin user_id (ya anonimizados) ---------------------
ALTER TABLE public.signal_hourly_aggs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_rollups_hourly    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_daily_aggregates  ENABLE ROW LEVEL SECURITY;

-- Control interno y snapshots ---------------------------------
ALTER TABLE public.rollup_state             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volatility_snapshots     ENABLE ROW LEVEL SECURITY;

-- Documentación de intención ----------------------------------
COMMENT ON TABLE public.user_daily_metrics        IS 'Backend-only. Contiene user_id — acceso solo vía service_role y RPCs SECURITY DEFINER.';
COMMENT ON TABLE public.signal_hourly_aggs        IS 'Backend-only. Agregado horario — acceso solo vía service_role y RPCs SECURITY DEFINER.';
COMMENT ON TABLE public.signal_rollups_hourly     IS 'Backend-only. Rollup horario — acceso solo vía service_role y RPCs SECURITY DEFINER.';
COMMENT ON TABLE public.category_daily_aggregates IS 'Backend-only. Agregado diario de categorías — acceso solo vía service_role y RPCs SECURITY DEFINER.';
COMMENT ON TABLE public.entity_daily_aggregates   IS 'Backend-only. Agregado diario de entidades — acceso solo vía service_role y RPCs SECURITY DEFINER.';
COMMENT ON TABLE public.rollup_state              IS 'Backend-only. Control de estado de rollups — acceso solo vía service_role.';
COMMENT ON TABLE public.volatility_snapshots      IS 'Backend-only. Snapshots de volatilidad — acceso solo vía service_role y RPCs SECURITY DEFINER.';
