-- Migración: Vista de Tendencias Globales y RPC de Feed
-- Fecha: 2026-02-20
-- 20260220000600_create_trending_feed_view.sql

-- 1. Crear vista public_trending_feed
-- Obtiene el último snapshot global (sin filtros) por opción de cada batalla
CREATE OR REPLACE VIEW public.public_trending_feed AS
SELECT DISTINCT ON (attribute_id, option_id)
  attribute_id,
  option_id,
  total_weight,
  rank_position,
  delta_weight,
  delta_rank_position,
  trend_status,
  snapshot_at
FROM public.public_rank_snapshots
WHERE segment_filters IS NULL
   OR segment_filters = '{}'::jsonb
ORDER BY attribute_id, option_id, snapshot_at DESC;

-- 2. Crear RPC para obtener feed ordenado por impacto de tendencia
CREATE OR REPLACE FUNCTION public.get_trending_feed()
RETURNS TABLE (
  attribute_id UUID,
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
  FROM public.public_trending_feed
  ORDER BY
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
