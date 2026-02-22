-- =====================================================
-- OPINA+ V12 — FIX 26: EARLY SIGNAL DETECTION
-- =====================================================

CREATE OR REPLACE FUNCTION detect_early_signal(
  p_battle_slug TEXT,
  p_hours_window INTEGER DEFAULT 6
)
RETURNS TABLE (
  option_id UUID,
  option_label TEXT,
  recent_score NUMERIC,
  historical_avg NUMERIC,
  momentum_ratio NUMERIC,
  classification TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH recent_data AS (
    SELECT 
      se.option_id,
      SUM(se.opinascore) AS score
    FROM public.signal_events se
    JOIN public.battle_instances bi ON bi.id = se.battle_instance_id
    JOIN public.battles b ON b.id = bi.battle_id
    WHERE b.slug = p_battle_slug
      AND se.created_at >= now() - (p_hours_window || ' hours')::interval
    GROUP BY se.option_id
  ),
  historical_data AS (
    SELECT 
      rs.option_id,
      AVG(rs.total_weight) AS avg_score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at >= now() - interval '30 days'
    GROUP BY rs.option_id
  )
  SELECT
    bo.id AS option_id,
    bo.label AS option_label,
    COALESCE(r.score, 0)::NUMERIC AS recent_score,
    COALESCE(h.avg_score, 0)::NUMERIC AS historical_avg,
    CASE
      WHEN COALESCE(h.avg_score, 0) <= 0 THEN 
        CASE WHEN COALESCE(r.score, 0) > 0 THEN 2.0 ELSE 1.0 END
      ELSE (COALESCE(r.score, 0) / h.avg_score)
    END::NUMERIC AS momentum_ratio,
    CASE
      WHEN (COALESCE(r.score, 0) / NULLIF(h.avg_score, 0)) > 1.5 THEN 'emerging'
      WHEN (COALESCE(r.score, 0) / NULLIF(h.avg_score, 0)) < 0.7 AND COALESCE(h.avg_score, 0) > 10 THEN 'cooling'
      ELSE 'stable'
    END::TEXT AS classification
  FROM public.battle_options bo
  JOIN public.battles b ON b.id = bo.battle_id
  LEFT JOIN recent_data r ON r.option_id = bo.id
  LEFT JOIN historical_data h ON h.option_id = bo.id
  WHERE b.slug = p_battle_slug;
END;
$$;
