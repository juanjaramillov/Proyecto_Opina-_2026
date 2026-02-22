-- =====================================================
-- OPINA+ V12 — FIX 25: SEGMENT INFLUENCE ENGINE
-- =====================================================

CREATE OR REPLACE FUNCTION get_segment_influence(
  p_battle_slug TEXT,
  p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  age_range TEXT,
  gender TEXT,
  commune TEXT,
  segment_variation NUMERIC,
  contribution_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_ts TIMESTAMP;
  past_ts TIMESTAMP;
BEGIN
  -- 1. Obtener el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  -- 2. Obtener el snapshot más cercano a (hace N días)
  SELECT MAX(snapshot_at)
  INTO past_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND snapshot_at <= latest_ts - (p_days_back || ' days')::interval;

  -- 3. Si no hay datos previos, no podemos calcular influencia
  IF past_ts IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH current_data AS (
    SELECT 
      rs.age_range, 
      rs.gender, 
      rs.commune,
      SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = latest_ts
    GROUP BY rs.age_range, rs.gender, rs.commune
  ),
  past_data AS (
    SELECT 
      rs.age_range, 
      rs.gender, 
      rs.commune,
      SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = past_ts
    GROUP BY rs.age_range, rs.gender, rs.commune
  ),
  variation_data AS (
    SELECT
      c.age_range,
      c.gender,
      c.commune,
      (c.score - COALESCE(p.score, 0)) AS variation
    FROM current_data c
    LEFT JOIN past_data p
      ON c.age_range = p.age_range
      AND c.gender = p.gender
      AND c.commune = p.commune
  )
  SELECT
    vd.age_range,
    vd.gender,
    vd.commune,
    vd.variation::NUMERIC,
    CASE
      WHEN SUM(ABS(vd.variation)) OVER () = 0 THEN 0
      ELSE (ABS(vd.variation) / SUM(ABS(vd.variation)) OVER ()) * 100
    END::NUMERIC
  FROM variation_data vd
  ORDER BY ABS(vd.variation) DESC
  LIMIT 10;

END;
$$;
