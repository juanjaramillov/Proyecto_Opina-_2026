BEGIN;

-- 1) Backfill entities.category desde battles/categories (por si quedaron NULL)
UPDATE public.entities e
SET category = c.slug
FROM public.battle_options bo
JOIN public.battles b ON b.id = bo.battle_id
JOIN public.categories c ON c.id = b.category_id
WHERE bo.brand_id = e.id
  AND (e.category IS NULL OR e.category = '');

-- 2) FIX: NULL = wildcard (no filtra)
CREATE OR REPLACE FUNCTION public.get_entity_trend_agg(
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    a.day,
    a.signals_count,
    a.unique_users,
    COALESCE(a.opinascore_sum, 0) AS preference_score,
    a.depth_nota_avg
  FROM public.entity_daily_aggregates a
  WHERE a.entity_id = p_entity_id
    AND a.day >= (now()::date - p_days)
    AND (p_gender IS NULL OR a.gender = p_gender)
    AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR a.region = p_region)
  ORDER BY a.day DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_category_overview_agg(
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH w AS (
    SELECT *
    FROM public.entity_daily_aggregates a
    WHERE a.category_slug = p_category_slug
      AND a.day >= (now()::date - p_days)
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
  ),
  agg AS (
    SELECT
      entity_id,
      SUM(signals_count)::bigint AS signals_count,
      SUM(unique_users)::bigint AS unique_users,
      SUM(opinascore_sum)::numeric AS preference_score,
      CASE
        WHEN SUM(depth_nota_n) = 0 THEN NULL
        ELSE (SUM(COALESCE(depth_nota_avg,0) * depth_nota_n) / SUM(depth_nota_n))::numeric
      END AS depth_nota_avg
    FROM w
    GROUP BY entity_id
  )
  SELECT
    agg.entity_id,
    e.name AS entity_name,
    e.image_url,
    agg.signals_count,
    agg.unique_users,
    COALESCE(agg.preference_score, 0) AS preference_score,
    agg.depth_nota_avg
  FROM agg
  JOIN public.entities e ON e.id = agg.entity_id
  ORDER BY preference_score DESC NULLS LAST, signals_count DESC
  LIMIT 50;
$$;

-- 3) Re-asegurar permisos (por seguridad)
GRANT EXECUTE ON FUNCTION public.get_entity_trend_agg(uuid, int, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_overview_agg(text, int, text, text, text) TO anon, authenticated;

-- 4) Refrescar agregados si existe la función (para que se vea al tiro)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'refresh_daily_aggregates'
  ) THEN
    PERFORM public.refresh_daily_aggregates(30);
  END IF;
END $$;

COMMIT;
