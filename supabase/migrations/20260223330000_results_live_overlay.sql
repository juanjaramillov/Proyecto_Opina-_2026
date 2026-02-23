BEGIN;

-- 0) Helper (por si no existe todavía)
CREATE OR REPLACE FUNCTION public.get_agg_last_refreshed_at(
  p_category_slug text DEFAULT NULL
)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT MAX(last_refreshed_at)
  FROM public.entity_daily_aggregates
  WHERE (p_category_slug IS NULL OR category_slug = p_category_slug);
$$;

GRANT EXECUTE ON FUNCTION public.get_agg_last_refreshed_at(text) TO anon, authenticated;

-- 1) LIVE: Category overview (agregado + delta desde signal_events posterior al último refresh)
CREATE OR REPLACE FUNCTION public.get_category_overview_live(
  p_category_slug text,
  p_days int DEFAULT 14,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE(
  entity_id uuid,
  entity_name text,
  image_url text,
  signals_count bigint,
  unique_users bigint,
  preference_score numeric,
  depth_nota_avg numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
  v_last timestamptz;
BEGIN
  SELECT public.get_agg_last_refreshed_at(p_category_slug) INTO v_last;
  IF v_last IS NULL THEN
    v_last := to_timestamp(0);
  END IF;

  RETURN QUERY
  WITH base_rows AS (
    SELECT *
    FROM public.entity_daily_aggregates a
    WHERE a.category_slug = p_category_slug
      AND a.day >= v_from
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
  ),
  base AS (
    SELECT
      base_rows.entity_id,
      SUM(base_rows.signals_count)::bigint AS signals_count,
      SUM(base_rows.unique_users)::bigint AS unique_users,
      SUM(base_rows.opinascore_sum)::numeric AS preference_score,
      SUM(base_rows.depth_nota_n)::bigint AS depth_n,
      SUM(COALESCE(base_rows.depth_nota_avg,0) * base_rows.depth_nota_n)::numeric AS depth_sum
    FROM base_rows
    GROUP BY 1
  ),
  delta_vs_daily AS (
    SELECT
      se.created_at::date AS day,
      se.entity_id,
      COUNT(*)::bigint AS signals_count,
      COUNT(DISTINCT se.anon_id)::bigint AS unique_users,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS preference_score
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE e.category = p_category_slug
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type IN ('versus','progressive')
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1,2
  ),
  delta_vs AS (
    SELECT
      delta_vs_daily.entity_id,
      SUM(delta_vs_daily.signals_count)::bigint AS signals_count,
      SUM(delta_vs_daily.unique_users)::bigint AS unique_users,
      SUM(delta_vs_daily.preference_score)::numeric AS preference_score
    FROM delta_vs_daily
    GROUP BY 1
  ),
  delta_depth AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS depth_avg,
      COUNT(*)::bigint AS depth_n
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE e.category = p_category_slug
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  combined AS (
    SELECT
      COALESCE(b.entity_id, dv.entity_id, dd.entity_id) AS entity_id,
      COALESCE(b.signals_count,0) + COALESCE(dv.signals_count,0) AS signals_count,
      COALESCE(b.unique_users,0) + COALESCE(dv.unique_users,0) AS unique_users,
      COALESCE(b.preference_score,0) + COALESCE(dv.preference_score,0) AS preference_score,
      CASE
        WHEN COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0) = 0 THEN NULL
        ELSE (
          (COALESCE(b.depth_sum,0) + COALESCE(dd.depth_avg,0) * COALESCE(dd.depth_n,0)) /
          (COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0))
        )::numeric
      END AS depth_nota_avg
    FROM base b
    FULL JOIN delta_vs dv ON dv.entity_id = b.entity_id
    FULL JOIN delta_depth dd ON dd.entity_id = COALESCE(b.entity_id, dv.entity_id)
  )
  SELECT
    c.entity_id,
    e.name AS entity_name,
    e.image_url,
    c.signals_count,
    c.unique_users,
    c.preference_score,
    c.depth_nota_avg
  FROM combined c
  JOIN public.entities e ON e.id = c.entity_id
  ORDER BY c.preference_score DESC NULLS LAST, c.signals_count DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_category_overview_live(text,int,text,text,text) TO anon, authenticated;

-- 2) LIVE: Entity trend (agregado + delta por día)
CREATE OR REPLACE FUNCTION public.get_entity_trend_live(
  p_entity_id uuid,
  p_days int DEFAULT 30,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE(
  day date,
  signals_count bigint,
  unique_users bigint,
  preference_score numeric,
  depth_nota_avg numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
  v_cat text;
  v_last timestamptz;
BEGIN
  SELECT category INTO v_cat FROM public.entities WHERE id = p_entity_id;
  SELECT public.get_agg_last_refreshed_at(v_cat) INTO v_last;

  IF v_last IS NULL THEN
    v_last := to_timestamp(0);
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      a.day,
      SUM(a.signals_count)::bigint AS signals_count,
      SUM(a.unique_users)::bigint AS unique_users,
      SUM(a.opinascore_sum)::numeric AS preference_score,
      SUM(a.depth_nota_n)::bigint AS depth_n,
      SUM(COALESCE(a.depth_nota_avg,0) * a.depth_nota_n)::numeric AS depth_sum
    FROM public.entity_daily_aggregates a
    WHERE a.entity_id = p_entity_id
      AND a.day >= v_from
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
    GROUP BY 1
  ),
  delta_vs AS (
    SELECT
      se.created_at::date AS day,
      COUNT(*)::bigint AS signals_count,
      COUNT(DISTINCT se.anon_id)::bigint AS unique_users,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS preference_score
    FROM public.signal_events se
    WHERE se.entity_id = p_entity_id
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.module_type IN ('versus','progressive')
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  delta_depth AS (
    SELECT
      se.created_at::date AS day,
      AVG(se.value_numeric)::numeric AS depth_avg,
      COUNT(*)::bigint AS depth_n
    FROM public.signal_events se
    WHERE se.entity_id = p_entity_id
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  c AS (
    SELECT
      COALESCE(b.day, dv.day, dd.day) AS day,
      COALESCE(b.signals_count,0) + COALESCE(dv.signals_count,0) AS signals_count,
      COALESCE(b.unique_users,0) + COALESCE(dv.unique_users,0) AS unique_users,
      COALESCE(b.preference_score,0) + COALESCE(dv.preference_score,0) AS preference_score,
      CASE
        WHEN COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0) = 0 THEN NULL
        ELSE (
          (COALESCE(b.depth_sum,0) + COALESCE(dd.depth_avg,0) * COALESCE(dd.depth_n,0)) /
          (COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0))
        )::numeric
      END AS depth_nota_avg
    FROM base b
    FULL JOIN delta_vs dv ON dv.day = b.day
    FULL JOIN delta_depth dd ON dd.day = COALESCE(b.day, dv.day)
  )
  SELECT c.day, c.signals_count, c.unique_users, c.preference_score, c.depth_nota_avg
  FROM c
  ORDER BY c.day DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_entity_trend_live(uuid,int,text,text,text) TO anon, authenticated;

COMMIT;
