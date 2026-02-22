-- =====================================================
-- OPINA+ V12 — FIX 08: SNAPSHOT SEGMENTATION ENGINE
-- =====================================================

-- 1. MODIFICAR TABLA SNAPSHOTS
ALTER TABLE public.ranking_snapshots
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS commune TEXT;

CREATE INDEX IF NOT EXISTS idx_snapshot_segments
ON public.ranking_snapshots (battle_slug, age_range, gender, commune, snapshot_at DESC);

-- 2. FUNCIÓN PARA BUCKETS DE EDAD (HELPER)
CREATE OR REPLACE FUNCTION public.get_age_bucket(p_age int)
RETURNS text AS $$
BEGIN
    IF p_age < 18 THEN RETURN 'under_18';
    ELSIF p_age BETWEEN 18 AND 24 THEN RETURN '18-24';
    ELSIF p_age BETWEEN 25 AND 34 THEN RETURN '25-34';
    ELSIF p_age BETWEEN 35 AND 44 THEN RETURN '35-44';
    ELSIF p_age BETWEEN 45 AND 54 THEN RETURN '45-54';
    ELSIF p_age BETWEEN 55 AND 64 THEN RETURN '55-64';
    ELSE RETURN '65_plus';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. ACTUALIZAR TRIGGER DE ENRIQUECIMIENTO (Para asegurar que signal_events tenga commune y age_bucket)
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS trigger AS $$
DECLARE
  v_gender text; v_age int; v_age_bucket text; v_region text; v_commune text;
  v_tier text; v_comp int; v_base_weight numeric; v_final_weight numeric;
BEGIN
  -- Obtener data del perfil
  SELECT p.gender, p.age, p.region, p.commune, COALESCE(p.tier, 'guest'), COALESCE(p.profile_completeness, 0)
  INTO v_gender, v_age, v_region, v_commune, v_tier, v_comp
  FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1;

  -- Calcular bucket de edad
  IF v_age IS NOT NULL THEN
     v_age_bucket := public.get_age_bucket(v_age);
  END IF;

  -- Pesos basados en Tier
  CASE v_tier
    WHEN 'verified_full_ci' THEN v_base_weight := 2.0;
    WHEN 'verified_basic' THEN v_base_weight := 1.5;
    WHEN 'registered' THEN v_base_weight := 1.2;
    ELSE v_base_weight := 1.0;
  END CASE;

  -- Bonus por completitud
  v_final_weight := v_base_weight * (1 + (v_comp::numeric / 100.0));
  
  -- Enriquecer el evento
  NEW.gender := COALESCE(NEW.gender, v_gender);
  NEW.age_bucket := COALESCE(NEW.age_bucket, v_age_bucket);
  NEW.region := COALESCE(NEW.region, v_region);
  NEW.commune := COALESCE(NEW.commune, v_commune);
  NEW.user_tier := v_tier;
  NEW.profile_completeness := v_comp;
  NEW.signal_weight := v_final_weight;
  NEW.computed_weight := v_final_weight;
  NEW.algorithm_version := '1.2.2';
  NEW.user_id := auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCION SNAPSHOT SEGMENTADO
CREATE OR REPLACE FUNCTION public.generate_segmented_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertamos la data segmentada (incluyendo el segmento 'all' para cuando no hay filtro)
  -- Esto genera todas las combinaciones presentes en los datos
  
  -- Nota: Usamos COALESCE para manejar valores nulos en la agrupación
  INSERT INTO public.ranking_snapshots (
    battle_slug,
    option_id,
    total_weight,
    rank_position,
    age_range,
    gender,
    commune,
    snapshot_at
  )
  SELECT
    b.slug,
    se.option_id,
    SUM(se.signal_weight) as total_weight,
    RANK() OVER (
      PARTITION BY b.slug, COALESCE(se.age_bucket, 'all'), COALESCE(se.gender, 'all'), COALESCE(se.commune, 'all')
      ORDER BY SUM(se.signal_weight) DESC
    ),
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all'),
    now()
  FROM public.signal_events se
  JOIN public.battle_instances bi ON bi.id = se.battle_instance_id
  JOIN public.battles b ON b.id = bi.battle_id
  GROUP BY
    b.slug,
    se.option_id,
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all');

  -- También insertamos el total GLOBAL (sin segmentación) para rapidez
  INSERT INTO public.ranking_snapshots (battle_slug, option_id, total_weight, rank_position, age_range, gender, commune, snapshot_at)
  SELECT
    b.slug,
    se.option_id,
    SUM(se.signal_weight),
    RANK() OVER (PARTITION BY b.slug ORDER BY SUM(se.signal_weight) DESC),
    'all',
    'all',
    'all',
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  GROUP BY b.slug, se.option_id;

END;
$$;

-- 5. RPC PARA CONSULTA SEGMENTADA
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
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at 
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND age_range = COALESCE(p_age_range, 'all')
      AND gender = COALESCE(p_gender, 'all')
      AND commune = COALESCE(p_commune, 'all')
  )
  SELECT
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.battle_slug = p_battle_slug
    AND rs.age_range = COALESCE(p_age_range, 'all')
    AND rs.gender = COALESCE(p_gender, 'all')
    AND rs.commune = COALESCE(p_commune, 'all')
  ORDER BY rs.rank_position ASC;
$$;

-- 6. RPC PARA TRENDING FEED SEGMENTADO (Global Feed)
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
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH latest_ts AS (
    SELECT rs.battle_slug, MAX(rs.snapshot_at) as max_at 
    FROM public.ranking_snapshots rs
    WHERE rs.age_range = COALESCE(p_age_range, 'all')
      AND rs.gender = COALESCE(p_gender, 'all')
      AND rs.commune = COALESCE(p_commune, 'all')
    GROUP BY rs.battle_slug
  )
  SELECT
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at AND rs.battle_slug = l.battle_slug
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.age_range = COALESCE(p_age_range, 'all')
    AND rs.gender = COALESCE(p_gender, 'all')
    AND rs.commune = COALESCE(p_commune, 'all')
    AND rs.rank_position = 1
  ORDER BY rs.total_weight DESC;
$$;

-- 7. REPROGRAMAR CRON (Usar el segmentado)
SELECT cron.unschedule('generate-ranking-snapshot');

SELECT cron.schedule(
  'generate-segmented-snapshot',
  '0 */3 * * *',
  $$ SELECT generate_segmented_snapshot(); $$
);
