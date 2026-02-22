-- =====================================================
-- OPINA+ V12 — FIX 09: DEPTH INTELLIGENCE ENGINE
-- =====================================================

-- 1. CREAR TABLA DEPTH_AGGREGATES
CREATE TABLE IF NOT EXISTS public.depth_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_slug TEXT NOT NULL,
  option_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  average_score NUMERIC,
  total_responses INTEGER,
  age_range TEXT,
  gender TEXT,
  commune TEXT,
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_depth_aggregates
ON public.depth_aggregates (battle_slug, option_id, question_id, snapshot_at DESC);

-- 2. FUNCION GENERAR SNAPSHOT PROFUNDIDAD
CREATE OR REPLACE FUNCTION public.generate_depth_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertamos la data segmentada
  -- module_type = 'depth' indica que es una encuesta de profundidad
  -- context_id suele guardar el ID de la pregunta o el atributo evaluado
  
  INSERT INTO public.depth_aggregates (
    battle_slug,
    option_id,
    question_id,
    average_score,
    total_responses,
    age_range,
    gender,
    commune,
    snapshot_at
  )
  SELECT
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'), -- question_id
    AVG(se.value_numeric),
    COUNT(*),
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all'),
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
  GROUP BY
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'),
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all');

  -- También insertamos el total GLOBAL por pregunta para rapidez
  INSERT INTO public.depth_aggregates (battle_slug, option_id, question_id, average_score, total_responses, age_range, gender, commune, snapshot_at)
  SELECT
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'),
    AVG(se.value_numeric),
    COUNT(*),
    'all',
    'all',
    'all',
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
  GROUP BY b.slug, se.option_id, COALESCE(se.context_id, 'general');

END;
$$;

-- 3. PROGRAMAR CRON PROFUNDIDAD
-- Se ejecuta cada 3 horas, igual que los rankings
SELECT cron.schedule(
  'generate-depth-snapshot',
  '0 */3 * * *',
  $$ SELECT public.generate_depth_snapshot(); $$
);

-- 4. RPC CONSULTA PROFUNDIDAD (Optimizado para V12)
CREATE OR REPLACE FUNCTION public.get_depth_insights(
  p_battle_slug TEXT,
  p_option_id UUID,
  p_age_range TEXT DEFAULT 'all',
  p_gender TEXT DEFAULT 'all',
  p_commune TEXT DEFAULT 'all'
)
RETURNS TABLE (
  question_id TEXT,
  average_score NUMERIC,
  total_responses INTEGER,
  snapshot_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at 
    FROM public.depth_aggregates
    WHERE battle_slug = p_battle_slug
      AND option_id = p_option_id
      AND age_range = COALESCE(p_age_range, 'all')
      AND gender = COALESCE(p_gender, 'all')
      AND commune = COALESCE(p_commune, 'all')
  )
  SELECT 
    da.question_id,
    da.average_score,
    da.total_responses,
    da.snapshot_at
  FROM public.depth_aggregates da
  JOIN latest_ts l ON da.snapshot_at = l.max_at
  WHERE da.battle_slug = p_battle_slug
    AND da.option_id = p_option_id
    AND da.age_range = COALESCE(p_age_range, 'all')
    AND da.gender = COALESCE(p_gender, 'all')
    AND da.commune = COALESCE(p_commune, 'all');
$$;
