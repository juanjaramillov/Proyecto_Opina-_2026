BEGIN;


-- 1. Rewrite get_segmented_trending to query live signal_events_analytics_clean data
CREATE OR REPLACE FUNCTION public.get_segmented_trending(
  p_age_range TEXT DEFAULT 'all',
  p_gender TEXT DEFAULT 'all',
  p_commune TEXT DEFAULT 'all'
)
RETURNS TABLE (
  battle_slug TEXT,
  option_id uuid,
  total_weight NUMERIC,
  rank_position INTEGER,
  snapshot_at TIMESTAMP WITH TIME ZONE,
  battle_id uuid,
  battle_title TEXT,
  option_label TEXT,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH battle_scores AS (
    SELECT
      b.slug as b_slug,
      b.id as b_id,
      b.title as b_title,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
      AND (p_age_range = 'all' OR se.age_bucket = p_age_range)
      AND (p_gender = 'all' OR se.gender = p_gender)
      AND (p_commune = 'all' OR se.commune = p_commune)
    GROUP BY b.slug, b.id, b.title, se.option_id
  ),
  ranked AS (
    SELECT
      bs.b_slug,
      bs.o_id,
      bs.t_weight,
      RANK() OVER (PARTITION BY bs.b_slug ORDER BY bs.t_weight DESC)::int as r_pos,
      now() as snap_at,
      bs.b_id,
      bs.b_title
    FROM battle_scores bs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    r.snap_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  WHERE r.r_pos = 1
  ORDER BY r.t_weight DESC
  LIMIT 50;
END;
$$;

-- 2. Rewrite get_segmented_ranking
CREATE OR REPLACE FUNCTION public.get_segmented_ranking(
  p_battle_slug TEXT,
  p_age_range TEXT DEFAULT 'all',
  p_gender TEXT DEFAULT 'all',
  p_commune TEXT DEFAULT 'all'
)
RETURNS TABLE (
  battle_slug TEXT,
  option_id uuid,
  total_weight NUMERIC,
  rank_position INTEGER,
  snapshot_at TIMESTAMP WITH TIME ZONE,
  battle_id uuid,
  battle_title TEXT,
  option_label TEXT,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH battle_scores AS (
    SELECT
      b.slug as b_slug,
      b.id as b_id,
      b.title as b_title,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
      AND b.slug = p_battle_slug
      AND (p_age_range = 'all' OR se.age_bucket = p_age_range)
      AND (p_gender = 'all' OR se.gender = p_gender)
      AND (p_commune = 'all' OR se.commune = p_commune)
    GROUP BY b.slug, b.id, b.title, se.option_id
  ),
  ranked AS (
    SELECT
      bs.b_slug,
      bs.o_id,
      bs.t_weight,
      RANK() OVER (PARTITION BY bs.b_slug ORDER BY bs.t_weight DESC)::int as r_pos,
      now() as snap_at,
      bs.b_id,
      bs.b_title
    FROM battle_scores bs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    r.snap_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  ORDER BY r.r_pos ASC;
END;
$$;

-- 3. Rewrite get_ranking_with_variation
CREATE OR REPLACE FUNCTION public.get_ranking_with_variation()
RETURNS TABLE (
  battle_slug text,
  option_id uuid,
  total_weight numeric,
  rank_position integer,
  variation numeric,
  variation_percent numeric,
  direction text,
  snapshot_at timestamptz,
  battle_id uuid,
  battle_title text,
  option_label text,
  image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_scores AS (
    SELECT
      b.id as b_id,
      b.title as b_title,
      b.slug as b_slug,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
    GROUP BY b.id, b.title, b.slug, se.option_id
  ),
  ranked AS (
    SELECT
      cs.b_slug,
      cs.o_id,
      cs.t_weight,
      RANK() OVER (PARTITION BY cs.b_slug ORDER BY cs.t_weight DESC)::int as r_pos,
      cs.b_id,
      cs.b_title
    FROM current_scores cs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    0.0::numeric as variation,
    0.0::numeric as variation_percent,
    'stable'::text as direction,
    now() as snapshot_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url as image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  WHERE r.r_pos = 1
  ORDER BY r.t_weight DESC
  LIMIT 50;
END;
$$;

COMMIT;
