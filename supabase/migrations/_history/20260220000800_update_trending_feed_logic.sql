-- Migración: Trending Feed con Cerradas Dinámicas
-- Fecha: 2026-02-20
-- 20260220000800_update_trending_feed_logic.sql

-- 1. Reemplazar vista public_trending_feed_grouped
-- Incluye 'status' y filtra batallas cerradas con impacto reciente (24h)
CREATE OR REPLACE VIEW public.public_trending_feed_grouped AS
SELECT DISTINCT ON (s.battle_id, s.option_id)
  b.category,
  b.title AS battle_title,
  b.status, -- Nueva columna
  o.name AS option_name,
  s.battle_id,
  s.option_id,
  s.total_weight,
  s.rank_position,
  s.delta_weight,
  s.delta_rank_position,
  s.trend_status,
  s.snapshot_at
FROM public.public_rank_snapshots s
JOIN public.battles b ON b.id = s.battle_id
JOIN public.options o ON o.id = s.option_id
WHERE
  (
    (b.status = 'active')
    OR
    (
      b.status = 'closed'
      AND s.snapshot_at >= now() - INTERVAL '24 hours'
      AND s.trend_status IN ('strong_rise', 'strong_drop')
    )
  )
  AND (s.segment_filters IS NULL OR s.segment_filters = '{}'::JSONB)
ORDER BY s.battle_id, s.option_id, s.snapshot_at DESC;

-- 2. Actualizar RPC get_trending_feed_grouped
-- Retorna la columna status y mantiene el ordenamiento por impacto
CREATE OR REPLACE FUNCTION public.get_trending_feed_grouped()
RETURNS TABLE (
  category TEXT,
  battle_title TEXT,
  status TEXT, -- Nueva columna
  option_name TEXT,
  battle_id UUID,
  option_id UUID,
  total_weight NUMERIC,
  rank_position INTEGER,
  delta_weight NUMERIC,
  delta_rank_position INTEGER,
  trend_status TEXT,
  snapshot_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.public_trending_feed_grouped
  ORDER BY
    category,
    CASE trend_status
      WHEN 'strong_rise' THEN 1
      WHEN 'rise' THEN 2
      WHEN 'stable' THEN 3
      WHEN 'drop' THEN 4
      WHEN 'strong_drop' THEN 5
      ELSE 6
    END,
    ABS(delta_weight) DESC;
$$;
