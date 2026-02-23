BEGIN;

-- =========================================================
-- A) Entities: agregar image_url (tu frontend lo usa)
-- =========================================================
ALTER TABLE public.entities
ADD COLUMN IF NOT EXISTS image_url text;

-- Backfill: primero desde battle_options.image_url, luego desde metadata->'source_image'
UPDATE public.entities e
SET image_url = bo.image_url
FROM public.battle_options bo
WHERE bo.brand_id = e.id
  AND bo.image_url IS NOT NULL
  AND (e.image_url IS NULL OR e.image_url = '');

UPDATE public.entities
SET image_url = COALESCE(image_url, metadata->>'source_image')
WHERE image_url IS NULL OR image_url = '';


-- =========================================================
-- B) signal_events: asegurar columna commune (migraciones antiguas la usan)
-- =========================================================
ALTER TABLE public.signal_events
ADD COLUMN IF NOT EXISTS commune text;

CREATE INDEX IF NOT EXISTS idx_signal_events_entity_module_time
ON public.signal_events(entity_id, module_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signal_events_depth_question
ON public.signal_events(entity_id, context_id, created_at DESC);


-- =========================================================
-- C) Helper: resolver entity_id desde cualquier id (battle_option_id o entity_id)
-- =========================================================
CREATE OR REPLACE FUNCTION public.resolve_entity_id(p_any_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE v_entity_id uuid;
BEGIN
  -- Si viene battle_option.id, mapear a brand_id
  SELECT bo.brand_id INTO v_entity_id
  FROM public.battle_options bo
  WHERE bo.id = p_any_id
  LIMIT 1;

  -- Si no era battle_option, asumimos que ya es entity_id
  RETURN COALESCE(v_entity_id, p_any_id);
END;
$$;


-- =========================================================
-- D) Backfill data: si hay eventos con entity_id = option_id, corregirlos a brand_id
-- =========================================================
UPDATE public.signal_events se
SET entity_id = bo.brand_id,
    entity_type = COALESCE(se.entity_type, e.type)
FROM public.battle_options bo
LEFT JOIN public.entities e ON e.id = bo.brand_id
WHERE se.option_id = bo.id
  AND bo.brand_id IS NOT NULL
  AND (se.entity_id IS NULL OR se.entity_id = se.option_id);


-- =========================================================
-- E) Enrichment final: user_profiles + users + entity_id correcto + commune
-- (sobrescribe versiones anteriores inconsistentes)
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();

  -- Segment snapshot
  v_gender text;
  v_age text;
  v_region text;
  v_commune text;

  -- Quality snapshot
  v_completion int;
  v_weight numeric;

  -- Verification / trust
  v_verified boolean;
  v_trust numeric;

  -- Algorithm
  v_algo_id uuid;
  v_half_life int;
  v_verify_mult numeric;
  v_recency numeric;
  v_verif_factor numeric;

  -- Entity mapping
  v_entity_id uuid;
  v_entity_type text;
BEGIN
  -- 1) Resolver entity_id desde option_id si viene vacío o mal seteado
  IF NEW.option_id IS NOT NULL THEN
    v_entity_id := public.resolve_entity_id(NEW.option_id);
    IF v_entity_id IS NOT NULL THEN
      SELECT e.type INTO v_entity_type FROM public.entities e WHERE e.id = v_entity_id LIMIT 1;
      NEW.entity_id := COALESCE(NEW.entity_id, v_entity_id);
      IF NEW.entity_id = NEW.option_id THEN
        NEW.entity_id := v_entity_id;
      END IF;
      NEW.entity_type := COALESCE(NEW.entity_type, v_entity_type);
    END IF;
  END IF;

  -- 2) Algoritmo activo
  SELECT id, recency_half_life_days, verification_multiplier
  INTO v_algo_id, v_half_life, v_verify_mult
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  IF v_uid IS NOT NULL THEN
    -- 3) Traer segmento + peso desde user_profiles (schema real del repo)
    SELECT
      up.gender,
      up.age_range,
      up.region,
      up.comuna,
      COALESCE(up.profile_completion_percentage, 0),
      COALESCE(up.signal_weight, 1.0),
      COALESCE(up.verified, false)
    INTO
      v_gender, v_age, v_region, v_commune, v_completion, v_weight, v_verified
    FROM public.user_profiles up
    WHERE up.user_id = v_uid
    LIMIT 1;

    SELECT COALESCE(us.trust_score, 1.0) INTO v_trust
    FROM public.user_stats us
    WHERE us.user_id = v_uid
    LIMIT 1;

    -- 4) Completar NEW
    NEW.user_id := v_uid;
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);
    NEW.commune := COALESCE(NEW.commune, v_commune);

    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completion);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
    NEW.algorithm_version_id := COALESCE(NEW.algorithm_version_id, v_algo_id);

    -- 5) OpinaScore
    v_recency := public.calculate_recency_factor(NEW.created_at, COALESCE(v_half_life, 7));
    v_verif_factor := CASE WHEN v_verified THEN COALESCE(v_verify_mult, 1.3) ELSE 1.0 END;

    NEW.computed_weight := COALESCE(NEW.computed_weight, (NEW.signal_weight * v_verif_factor * COALESCE(v_trust, 1.0)));
    NEW.opinascore := COALESCE(NEW.opinascore, (NEW.signal_weight * v_recency * v_verif_factor * COALESCE(v_trust, 1.0)));
  END IF;

  RETURN NEW;
END;
$$;

-- Asegurar trigger existe
DROP TRIGGER IF EXISTS tr_enrich_signal_event ON public.signal_events;
CREATE TRIGGER tr_enrich_signal_event
BEFORE INSERT ON public.signal_events
FOR EACH ROW EXECUTE FUNCTION public.fn_enrich_signal_event();


-- =========================================================
-- F) Depth RPCs: aceptar battle_option_id O entity_id (internamente trabajan por entity_id)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_depth_analytics(
  p_option_id uuid,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (question_key text, avg_value numeric, total_responses bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_id) AS entity_id
  )
  SELECT
    se.context_id AS question_key,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id = r.entity_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY se.context_id;
$$;

CREATE OR REPLACE FUNCTION public.get_depth_comparison(
  p_option_a uuid,
  p_option_b uuid,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (option_id uuid, question_key text, avg_value numeric, total_responses bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_a) AS a, public.resolve_entity_id(p_option_b) AS b
  )
  SELECT
    se.entity_id AS option_id,
    se.context_id AS question_key,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id IN (r.a, r.b)
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY se.entity_id, se.context_id;
$$;

CREATE OR REPLACE FUNCTION public.get_depth_trend(
  p_option_id uuid,
  p_question_key text,
  p_bucket text DEFAULT 'day',
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (time_bucket timestamp, avg_value numeric, total_responses bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_id) AS entity_id
  )
  SELECT
    date_trunc(p_bucket, se.created_at) AS time_bucket,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id = r.entity_id
  WHERE se.module_type = 'depth'
    AND se.context_id = p_question_key
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY 1
  ORDER BY 1 DESC;
$$;


-- =========================================================
-- G) Results RPC: get_advanced_results por entity_id (no option_id)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_advanced_results(
  p_category_slug text,
  p_gender text DEFAULT NULL,
  p_age_bucket text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (
  entity_id uuid,
  entity_name text,
  preference_rate numeric,
  avg_quality numeric,
  total_signals bigint,
  gap_score numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT *
    FROM public.signal_events se
    WHERE se.created_at > now() - interval '30 days'
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
  ),
  pref AS (
    SELECT
      se.entity_id,
      COUNT(*)::bigint AS votes,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS w
    FROM base se
    WHERE se.module_type IN ('versus','progressive')
      AND se.entity_id IS NOT NULL
    GROUP BY se.entity_id
  ),
  pref_cat AS (
    SELECT e.category, SUM(p.w) AS total_w
    FROM pref p
    JOIN public.entities e ON e.id = p.entity_id
    WHERE e.category IS NOT NULL
    GROUP BY e.category
  ),
  qual AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS avg_nota,
      COUNT(DISTINCT se.signal_id)::bigint AS responses
    FROM base se
    WHERE se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.entity_id IS NOT NULL
      AND se.value_numeric IS NOT NULL
    GROUP BY se.entity_id
  )
  SELECT
    e.id AS entity_id,
    e.name AS entity_name,
    CASE
      WHEN pc.total_w IS NULL OR pc.total_w = 0 THEN 0
      ELSE ROUND((COALESCE(p.w,0) / pc.total_w) * 100, 2)
    END AS preference_rate,
    COALESCE(ROUND(q.avg_nota, 2), 0) AS avg_quality,
    (COALESCE(p.votes,0) + COALESCE(q.responses,0))::bigint AS total_signals,
    ROUND(
      (
        CASE
          WHEN pc.total_w IS NULL OR pc.total_w = 0 THEN 0
          ELSE (COALESCE(p.w,0) / pc.total_w) * 100
        END
      ) - (COALESCE(q.avg_nota,0) * 10.0)
    , 2) AS gap_score
  FROM public.entities e
  LEFT JOIN pref p ON p.entity_id = e.id
  LEFT JOIN qual q ON q.entity_id = e.id
  LEFT JOIN pref_cat pc ON pc.category = e.category
  WHERE e.category = p_category_slug
  ORDER BY preference_rate DESC, avg_quality DESC;
END;
$$;


-- =========================================================
-- H) Rankings por entidad: generar entity_rank_snapshots cada 3 horas
-- =========================================================
ALTER TABLE public.entity_rank_snapshots ENABLE ROW LEVEL SECURITY;

-- Select público (Rankings se puede ver sin login si quieres; si no, quita anon)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'entity_rank_snapshots_select_all'
  ) THEN
    CREATE POLICY entity_rank_snapshots_select_all
    ON public.entity_rank_snapshots
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

-- Motor
CREATE OR REPLACE FUNCTION public.generate_entity_rank_snapshots(p_segment_id text DEFAULT 'global')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_algo text;
BEGIN
  SELECT COALESCE(version_name, 'v1.0') INTO v_algo
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  -- Cleanup
  DELETE FROM public.entity_rank_snapshots
  WHERE snapshot_date < now() - interval '30 days';

  WITH seg AS (
    SELECT p_segment_id AS segment_id
  ),
  filtered AS (
    SELECT se.*
    FROM public.signal_events se, seg
    WHERE se.created_at > now() - interval '14 days'
      AND se.entity_id IS NOT NULL
      AND (
        seg.segment_id = 'global'
        OR (seg.segment_id = 'female' AND se.gender = 'female')
        OR (seg.segment_id = 'male' AND se.gender = 'male')
        OR (seg.segment_id = 'young' AND se.age_bucket IN ('-18','under_18','18-24','25-34'))
        OR (seg.segment_id = 'adult' AND se.age_bucket IN ('35-44','45+','45-54','55-64','65_plus'))
      )
  ),
  pref AS (
    SELECT
      se.entity_id,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS w_pref
    FROM filtered se
    WHERE se.module_type IN ('versus','progressive')
    GROUP BY se.entity_id
  ),
  qual AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS avg_nota
    FROM filtered se
    WHERE se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
    GROUP BY se.entity_id
  ),
  base AS (
    SELECT
      e.id AS entity_id,
      e.category AS category_slug,
      COALESCE(p.w_pref, 0) AS w_pref,
      COALESCE(q.avg_nota, 0) AS avg_nota
    FROM public.entities e
    LEFT JOIN pref p ON p.entity_id = e.id
    LEFT JOIN qual q ON q.entity_id = e.id
    WHERE e.category IS NOT NULL
  ),
  cat_tot AS (
    SELECT category_slug, NULLIF(SUM(w_pref), 0) AS tot_w
    FROM base
    GROUP BY category_slug
  ),
  scored AS (
    SELECT
      b.entity_id,
      b.category_slug,
      CASE WHEN ct.tot_w IS NULL THEN 0 ELSE ROUND((b.w_pref / ct.tot_w) * 100, 2) END AS preference_score,
      ROUND(b.avg_nota, 2) AS quality_score,
      ROUND(
        (CASE WHEN ct.tot_w IS NULL THEN 0 ELSE (b.w_pref / ct.tot_w) * 100 END) * 0.60
        + (b.avg_nota * 10.0) * 0.40
      , 2) AS composite_index
    FROM base b
    LEFT JOIN cat_tot ct ON ct.category_slug = b.category_slug
  )
  INSERT INTO public.entity_rank_snapshots (
    entity_id, category_slug, composite_index, preference_score, quality_score,
    snapshot_date, segment_id, algorithm_version
  )
  SELECT
    s.entity_id,
    s.category_slug,
    s.composite_index,
    s.preference_score,
    s.quality_score,
    now(),
    p_segment_id,
    v_algo
  FROM scored s
  WHERE s.category_slug IS NOT NULL;
END;
$$;


CREATE OR REPLACE FUNCTION public.generate_entity_rank_snapshots_all()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.generate_entity_rank_snapshots('global');
  PERFORM public.generate_entity_rank_snapshots('female');
  PERFORM public.generate_entity_rank_snapshots('male');
  PERFORM public.generate_entity_rank_snapshots('young');
  PERFORM public.generate_entity_rank_snapshots('adult');
END;
$$;


-- RPC optimizada: devolver SOLO el último snapshot + trend (sin traer toda la tabla)
CREATE OR REPLACE FUNCTION public.get_entity_rankings_latest(
  p_category_slug text,
  p_segment_id text DEFAULT 'global'
)
RETURNS TABLE (
  id uuid,
  entity_id uuid,
  category_slug text,
  composite_index numeric,
  preference_score numeric,
  quality_score numeric,
  snapshot_date timestamptz,
  segment_id text,
  trend text,
  entity_name text,
  image_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_latest timestamptz;
  v_prev timestamptz;
BEGIN
  SELECT MAX(snapshot_date) INTO v_latest
  FROM public.entity_rank_snapshots
  WHERE category_slug = p_category_slug
    AND segment_id = p_segment_id;

  SELECT MAX(snapshot_date) INTO v_prev
  FROM public.entity_rank_snapshots
  WHERE category_slug = p_category_slug
    AND segment_id = p_segment_id
    AND snapshot_date < v_latest;

  RETURN QUERY
  WITH curr AS (
    SELECT *
    FROM public.entity_rank_snapshots
    WHERE category_slug = p_category_slug
      AND segment_id = p_segment_id
      AND snapshot_date = v_latest
  ),
  prev AS (
    SELECT *
    FROM public.entity_rank_snapshots
    WHERE category_slug = p_category_slug
      AND segment_id = p_segment_id
      AND snapshot_date = v_prev
  )
  SELECT
    c.id,
    c.entity_id,
    c.category_slug,
    c.composite_index,
    c.preference_score,
    c.quality_score,
    c.snapshot_date,
    c.segment_id,
    CASE
      WHEN p.id IS NULL THEN 'stable'
      WHEN c.composite_index > p.composite_index THEN 'up'
      WHEN c.composite_index < p.composite_index THEN 'down'
      ELSE 'stable'
    END AS trend,
    e.name AS entity_name,
    e.image_url
  FROM curr c
  LEFT JOIN prev p ON p.entity_id = c.entity_id
  JOIN public.entities e ON e.id = c.entity_id
  ORDER BY c.composite_index DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_entity_rankings_latest(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_entity_rank_snapshots_all() TO postgres;

-- Cron: solo si pg_cron existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('generate-entity-rank-snapshots');
    EXCEPTION WHEN others THEN
      -- noop
    END;

    PERFORM cron.schedule(
      'generate-entity-rank-snapshots',
      '0 */3 * * *',
      'SELECT public.generate_entity_rank_snapshots_all();'
    );
  END IF;
END $$;

COMMIT;
