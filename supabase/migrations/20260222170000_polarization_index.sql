-- FIX 23: Polarization Index Engine
-- Calcula la brecha entre las dos opciones principales para determinar el nivel de polarización.

CREATE OR REPLACE FUNCTION public.get_polarization_index(
  p_battle_slug TEXT
)
RETURNS TABLE (
  top_share NUMERIC,
  second_share NUMERIC,
  polarization_index NUMERIC,
  classification TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_ts TIMESTAMP;
BEGIN
  -- Obtener el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  IF latest_ts IS NULL THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'consensus'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY
  WITH distribution AS (
    SELECT
      option_id,
      total_weight,
      total_weight / NULLIF(SUM(total_weight) OVER (), 0) AS share
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND snapshot_at = latest_ts
  ),
  ranked_shares AS (
    SELECT 
      share,
      ROW_NUMBER() OVER (ORDER BY share DESC) AS rn
    FROM distribution
  ),
  top_two AS (
    SELECT
      MAX(CASE WHEN rn = 1 THEN share ELSE 0 END) as s1,
      MAX(CASE WHEN rn = 2 THEN share ELSE 0 END) as s2
    FROM ranked_shares
    WHERE rn <= 2
  )
  SELECT
    s1::NUMERIC as top_share,
    s2::NUMERIC as second_share,
    (ABS(s1 - s2) * 100)::NUMERIC AS polarization_index,
    CASE
      WHEN ABS(s1 - s2) < 0.05 THEN 'polarized'
      WHEN ABS(s1 - s2) < 0.20 THEN 'competitive'
      ELSE 'consensus'
    END::TEXT as classification
  FROM top_two;

END;
$$;
