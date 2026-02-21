-- Migración: RPC de Actividad Reciente de Señales
-- Fecha: 2026-02-20
-- 20260220000900_recent_activity_rpc.sql

-- 1. Crear función get_recent_signal_activity()
-- Proporciona métricas de los últimos 180 minutos para indicadores live
CREATE OR REPLACE FUNCTION public.get_recent_signal_activity()
RETURNS TABLE (
  signals_last_3h BIGINT,
  verified_signals_last_3h BIGINT,
  unique_users_last_3h BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*) AS signals_last_3h,
    COUNT(*) FILTER (WHERE is_verified = TRUE) AS verified_signals_last_3h,
    COUNT(DISTINCT anon_id) AS unique_users_last_3h
  FROM public.signal_events
  WHERE created_at >= now() - INTERVAL '3 hours';
$$;
