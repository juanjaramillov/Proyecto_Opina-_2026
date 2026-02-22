-- =====================================================
-- OPINA+ V12 — FIX 21: ADVANCED TEMPORAL COMPARISON
-- =====================================================

-- 1. AMPLIAR RETENCION DE SNAPSHOTS A 120 DIAS
CREATE OR REPLACE FUNCTION public.generate_ranking_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertamos el snapshot calculado
  INSERT INTO public.ranking_snapshots (
    battle_slug,
    option_id,
    total_weight,
    rank_position,
    snapshot_at
  )
  SELECT 
    b.slug as battle_slug,
    se.option_id,
    SUM(se.signal_weight) as total_weight,
    RANK() OVER (PARTITION BY b.slug ORDER BY SUM(se.signal_weight) DESC) as rank_position,
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.battle_id IS NOT NULL 
    AND se.option_id IS NOT NULL
  GROUP BY b.slug, se.option_id;
  
  -- LIMPIEZA AMPLIADA: 120 días para soportar comparaciones trimestrales
  DELETE FROM public.ranking_snapshots 
  WHERE snapshot_at < now() - interval '120 days';
END;
$$;

-- 2. RPC COMPARACION TEMPORAL AVANZADA
CREATE OR REPLACE FUNCTION public.get_temporal_comparison(
  p_battle_slug TEXT,
  p_days_back INTEGER
)
RETURNS TABLE (
  option_id UUID,
  current_score NUMERIC,
  past_score NUMERIC,
  variation NUMERIC,
  variation_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_ts TIMESTAMPTZ;
  target_ts TIMESTAMPTZ;
BEGIN
  -- Obtenemos el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  -- Buscamos el snapshot más cercano al periodo solicitado (hace X días)
  SELECT MAX(snapshot_at)
  INTO target_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND snapshot_at <= latest_ts - (p_days_back || ' days')::interval;

  -- Si no hay snapshots históricos, intentamos tomar el más antiguo disponible
  IF target_ts IS NULL THEN
    SELECT MIN(snapshot_at)
    INTO target_ts
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug;
  END IF;

  RETURN QUERY
  WITH current_data AS (
    SELECT rs.option_id, SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = latest_ts
    GROUP BY rs.option_id
  ),
  past_data AS (
    SELECT rs.option_id, SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = target_ts
    GROUP BY rs.option_id
  )
  SELECT
    c.option_id,
    c.score::NUMERIC AS current_score,
    COALESCE(p.score, 0)::NUMERIC AS past_score,
    (c.score - COALESCE(p.score, 0))::NUMERIC AS variation,
    CASE
      WHEN COALESCE(p.score, 0) <= 0 THEN 0
      ELSE ((c.score - p.score) / p.score) * 100
    END::NUMERIC AS variation_percent
  FROM current_data c
  LEFT JOIN past_data p
    ON c.option_id = p.option_id;

END;
$$;

-- 3. RPC PARA SERIE TEMPORAL (GRÁFICOS)
CREATE OR REPLACE FUNCTION public.get_time_series(
  p_battle_slug TEXT,
  p_option_id UUID
)
RETURNS TABLE (
  snapshot_at TIMESTAMPTZ,
  total_weight NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT snapshot_at, total_weight
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND option_id = p_option_id
  ORDER BY snapshot_at ASC;
$$;
