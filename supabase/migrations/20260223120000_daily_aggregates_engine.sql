BEGIN;

-- =========================================================
-- A) TABLAS DE AGREGADOS
-- =========================================================

-- 1) Agregado por entidad y día (con segmentación ligera)
CREATE TABLE IF NOT EXISTS public.entity_daily_aggregates (
  day date NOT NULL,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  category_slug text NULL,

  -- Segmentos (NULL = global)
  gender text NULL,
  age_bucket text NULL,
  region text NULL,

  -- Métricas core
  signals_count bigint NOT NULL DEFAULT 0,
  unique_users bigint NOT NULL DEFAULT 0,

  -- Sumas (para score)
  weight_sum numeric NOT NULL DEFAULT 0,
  opinascore_sum numeric NOT NULL DEFAULT 0,

  -- Depth: nota general (context_id = 'nota_general'), promedio y n
  depth_nota_avg numeric NULL,
  depth_nota_n bigint NOT NULL DEFAULT 0,

  last_refreshed_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (day, entity_id, gender, age_bucket, region)
);

CREATE INDEX IF NOT EXISTS idx_entity_daily_agg_category_day
  ON public.entity_daily_aggregates (category_slug, day DESC);

CREATE INDEX IF NOT EXISTS idx_entity_daily_agg_entity_day
  ON public.entity_daily_aggregates (entity_id, day DESC);


-- 2) Agregado por categoría y día (para dashboards rápidos)
CREATE TABLE IF NOT EXISTS public.category_daily_aggregates (
  day date NOT NULL,
  category_slug text NOT NULL,

  -- Segmentos (NULL = global)
  gender text NULL,
  age_bucket text NULL,
  region text NULL,

  signals_count bigint NOT NULL DEFAULT 0,
  unique_users bigint NOT NULL DEFAULT 0,

  weight_sum numeric NOT NULL DEFAULT 0,
  opinascore_sum numeric NOT NULL DEFAULT 0,

  last_refreshed_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (day, category_slug, gender, age_bucket, region)
);

CREATE INDEX IF NOT EXISTS idx_category_daily_agg_day
  ON public.category_daily_aggregates (day DESC, category_slug);


-- =========================================================
-- B) FUNCIÓN REFRESH (recalcula últimos N días)
-- =========================================================
CREATE OR REPLACE FUNCTION public.refresh_daily_aggregates(p_days int DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
BEGIN
  -- 1) Limpiar ventana (solo lo reciente)
  DELETE FROM public.entity_daily_aggregates WHERE day >= v_from;
  DELETE FROM public.category_daily_aggregates WHERE day >= v_from;

  -- 2) Entity daily aggregates (versus/progressive + depth)
  INSERT INTO public.entity_daily_aggregates (
    day, entity_id, category_slug,
    gender, age_bucket, region,
    signals_count, unique_users,
    weight_sum, opinascore_sum,
    depth_nota_avg, depth_nota_n,
    last_refreshed_at
  )
  WITH base AS (
    SELECT
      se.created_at::date AS day,
      se.entity_id,
      e.category AS category_slug,
      se.gender,
      se.age_bucket,
      se.region,

      se.anon_id,
      se.module_type,
      se.context_id,
      se.value_numeric,

      COALESCE(se.signal_weight, 1.0) AS w,
      COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0) AS score
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type IN ('versus','progressive','depth')
  ),
  vs AS (
    SELECT
      day, entity_id, category_slug,
      gender, age_bucket, region,
      COUNT(*) FILTER (WHERE module_type IN ('versus','progressive'))::bigint AS signals_count,
      COUNT(DISTINCT anon_id) FILTER (WHERE module_type IN ('versus','progressive'))::bigint AS unique_users,
      SUM(w) FILTER (WHERE module_type IN ('versus','progressive'))::numeric AS weight_sum,
      SUM(score) FILTER (WHERE module_type IN ('versus','progressive'))::numeric AS opinascore_sum
    FROM base
    GROUP BY 1,2,3,4,5,6
  ),
  dn AS (
    SELECT
      day, entity_id,
      gender, age_bucket, region,
      AVG(value_numeric)::numeric AS depth_nota_avg,
      COUNT(*)::bigint AS depth_nota_n
    FROM base
    WHERE module_type = 'depth'
      AND context_id = 'nota_general'
      AND value_numeric IS NOT NULL
    GROUP BY 1,2,3,4,5
  )
  SELECT
    COALESCE(vs.day, dn.day) AS day,
    COALESCE(vs.entity_id, dn.entity_id) AS entity_id,
    vs.category_slug,
    COALESCE(vs.gender, dn.gender) AS gender,
    COALESCE(vs.age_bucket, dn.age_bucket) AS age_bucket,
    COALESCE(vs.region, dn.region) AS region,
    COALESCE(vs.signals_count, 0) AS signals_count,
    COALESCE(vs.unique_users, 0) AS unique_users,
    COALESCE(vs.weight_sum, 0) AS weight_sum,
    COALESCE(vs.opinascore_sum, 0) AS opinascore_sum,
    dn.depth_nota_avg,
    COALESCE(dn.depth_nota_n, 0) AS depth_nota_n,
    now() AS last_refreshed_at
  FROM vs
  FULL OUTER JOIN dn
    ON  vs.day = dn.day
    AND vs.entity_id = dn.entity_id
    AND (vs.gender IS NOT DISTINCT FROM dn.gender)
    AND (vs.age_bucket IS NOT DISTINCT FROM dn.age_bucket)
    AND (vs.region IS NOT DISTINCT FROM dn.region);

  -- 3) Category daily aggregates (sum de entidades)
  INSERT INTO public.category_daily_aggregates (
    day, category_slug,
    gender, age_bucket, region,
    signals_count, unique_users,
    weight_sum, opinascore_sum,
    last_refreshed_at
  )
  SELECT
    day,
    category_slug,
    gender, age_bucket, region,
    SUM(signals_count)::bigint,
    SUM(unique_users)::bigint,
    SUM(weight_sum)::numeric,
    SUM(opinascore_sum)::numeric,
    now()
  FROM public.entity_daily_aggregates
  WHERE day >= v_from
    AND category_slug IS NOT NULL
  GROUP BY 1,2,3,4,5;
END;
$$;

-- Solo backend/cron debe ejecutar refresh
GRANT EXECUTE ON FUNCTION public.refresh_daily_aggregates(int) TO postgres;


-- =========================================================
-- C) RPCs de lectura (para Results/B2B) - SOLO lectura agregada
-- =========================================================

-- 1) Trend por entidad (últimos N días)
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
AS $$
  SELECT
    a.day,
    a.signals_count,
    a.unique_users,
    CASE
      WHEN a.opinascore_sum IS NULL THEN 0
      ELSE a.opinascore_sum
    END AS preference_score,
    a.depth_nota_avg
  FROM public.entity_daily_aggregates a
  WHERE a.entity_id = p_entity_id
    AND a.day >= (now()::date - p_days)
    AND (p_gender IS NULL AND a.gender IS NULL OR a.gender = p_gender)
    AND (p_age_bucket IS NULL AND a.age_bucket IS NULL OR a.age_bucket = p_age_bucket)
    AND (p_region IS NULL AND a.region IS NULL OR a.region = p_region)
  ORDER BY a.day DESC;
$$;

-- 2) Overview por categoría (ranking “rápido” sin tocar signal_events)
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
AS $$
  WITH w AS (
    SELECT *
    FROM public.entity_daily_aggregates a
    WHERE a.category_slug = p_category_slug
      AND a.day >= (now()::date - p_days)
      AND (p_gender IS NULL AND a.gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL AND a.age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL AND a.region IS NULL OR a.region = p_region)
  ),
  agg AS (
    SELECT
      entity_id,
      SUM(signals_count)::bigint AS signals_count,
      SUM(unique_users)::bigint AS unique_users,
      SUM(opinascore_sum)::numeric AS preference_score,
      -- promedio ponderado simple por n
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

GRANT EXECUTE ON FUNCTION public.get_entity_trend_agg(uuid, int, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_overview_agg(text, int, text, text, text) TO authenticated;


-- =========================================================
-- D) CRON (cada 3 horas) - si pg_cron existe
-- =========================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('refresh-daily-aggregates');
    EXCEPTION WHEN others THEN
      -- noop
    END;

    PERFORM cron.schedule(
      'refresh-daily-aggregates',
      '10 */3 * * *',
      'SELECT public.refresh_daily_aggregates(30);'
    );
  END IF;
END $$;

COMMIT;
