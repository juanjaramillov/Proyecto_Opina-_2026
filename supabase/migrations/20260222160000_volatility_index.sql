-- =====================================================
-- OPINA+ V12 — FIX 22: VOLATILITY INDEX ENGINE
-- =====================================================

-- 1. RPC CALCULAR VOLATILIDAD
CREATE OR REPLACE FUNCTION public.get_battle_volatility(
  p_battle_slug TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  volatility_score NUMERIC,
  volatility_index NUMERIC,
  classification TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  std_dev NUMERIC;
  avg_score NUMERIC;
  normalized NUMERIC;
BEGIN

  WITH recent_data AS (
    SELECT total_weight
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND snapshot_at >= now() - (p_days_back || ' days')::interval
  )
  SELECT
    STDDEV(total_weight),
    AVG(total_weight)
  INTO std_dev, avg_score
  FROM recent_data;

  IF avg_score IS NULL OR avg_score = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 'stable'::TEXT;
    RETURN;
  END IF;

  normalized := (std_dev / avg_score) * 100;

  RETURN QUERY
  SELECT
    std_dev::NUMERIC,
    normalized::NUMERIC,
    CASE
      WHEN normalized < 5 THEN 'stable'
      WHEN normalized < 15 THEN 'moderate'
      ELSE 'volatile'
    END::TEXT;

END;
$$;
