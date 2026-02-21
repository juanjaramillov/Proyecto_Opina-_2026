-- Migración: Arquitectura Unificada de Señales
-- Fecha: 2026-02-20
-- 20260220220000_unify_signals_architecture.sql

-- 1. ADD POLYMORPHIC COLUMNS TO signal_events
ALTER TABLE public.signal_events
ADD COLUMN IF NOT EXISTS entity_id uuid,
ADD COLUMN IF NOT EXISTS entity_type text, -- 'brand', 'city', 'product', 'topic', 'candidate'
ADD COLUMN IF NOT EXISTS module_type text DEFAULT 'versus', -- 'versus', 'progressive', 'depth'
ADD COLUMN IF NOT EXISTS context_id text, -- string or uuid stored as text for flexiblity (e.g., question_key)
ADD COLUMN IF NOT EXISTS value_text text,
ADD COLUMN IF NOT EXISTS value_numeric numeric;

-- Drop conflicting FK if it exists (some environments might have it from previous versions)
-- Our architecture is polymorphic; entity_id can refer to multiple tables.
ALTER TABLE public.signal_events DROP CONSTRAINT IF EXISTS signal_events_entity_id_fkey;

-- 2. MIGRATE OLD DATA (source_type -> module_type)
UPDATE public.signal_events
SET module_type = source_type
WHERE source_type IS NOT NULL AND module_type = 'versus';

-- We need to drop dependent views before dropping source_type
DROP VIEW IF EXISTS public.v_signal_counts_daily;

ALTER TABLE public.signal_events DROP COLUMN IF EXISTS source_type;

-- Recreate view using module_type instead of the old source_type
CREATE OR REPLACE VIEW public.v_signal_counts_daily AS
SELECT 
  date_trunc('day', created_at) AS day,
  module_type,
  battle_id,
  battle_instance_id,
  option_id,
  COUNT(*) AS signals,
  SUM(signal_weight) AS weighted_signals
FROM public.signal_events
GROUP BY 1, 2, 3, 4, 5;

-- 3. MIGRATE DEPTH ANSWERS INTO signal_events
-- Ensure we migrate existing data from depth_answers_structured
INSERT INTO public.signal_events (
    anon_id,
    signal_id, -- Required NOT NULL
    option_id,
    entity_id,
    entity_type,
    module_type,
    context_id,
    value_text,
    value_numeric,
    gender,
    age_bucket,
    region,
    created_at
)
SELECT 
    anon_id,
    gen_random_uuid(), -- Generate unique signal_id for migrated records
    option_id,
    option_id,
    'topic',
    'depth',
    question_key,
    answer_value,
    CASE WHEN answer_value ~ '^[0-9]+$' THEN answer_value::numeric ELSE NULL END,
    gender,
    age_bucket,
    region,
    created_at
FROM public.depth_answers_structured;

-- 4. DROP LEGACY ISOLATED TABLES
DROP TABLE IF EXISTS public.depth_answers_structured CASCADE;
DROP TABLE IF EXISTS public.depth_answers CASCADE;
DROP TABLE IF EXISTS public.depth_questions CASCADE;
DROP TABLE IF EXISTS public.depth_surveys CASCADE;

-- 5. REWRITE RPC: insert_depth_answers
CREATE OR REPLACE FUNCTION public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anon_id text;
  v_gender text;
  v_age text;
  v_region text;
  v_tier text;
  v_completeness int;
  v_weight numeric;
  v_signal_id uuid; -- Consistent signal_id for the whole batch
  v_answer record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  v_anon_id := public.get_or_create_anon_id();
  v_signal_id := gen_random_uuid(); -- Generate once per survey submission


  -- Snapshot del perfil
  SELECT p.gender, p.age_bucket, p.region, p.tier, p.profile_completeness, COALESCE(us.signal_weight, 1.0)
  INTO v_gender, v_age, v_region, v_tier, v_completeness, v_weight
  FROM public.profiles p
  LEFT JOIN public.user_stats us ON us.user_id = p.id
  WHERE p.id = auth.uid() LIMIT 1;

  FOR v_answer IN SELECT * FROM jsonb_to_recordset(p_answers) AS x(question_key text, answer_value text)
  LOOP
    INSERT INTO public.signal_events (
      anon_id, 
      signal_id,
      option_id,
      entity_id,
      entity_type,
      module_type,
      context_id,
      value_text,
      value_numeric,
      signal_weight, 
      user_tier, 
      profile_completeness,
      gender, 
      age_bucket, 
      region, 
      created_at
    )
    VALUES (
      v_anon_id, 
      v_signal_id,
      p_option_id,
      p_option_id,
      'topic',
      'depth',
      v_answer.question_key, 
      v_answer.answer_value,
      CASE WHEN v_answer.answer_value ~ '^[0-9]+$' THEN v_answer.answer_value::numeric ELSE NULL END,
      v_weight, 
      v_tier, 
      v_completeness,
      v_gender, 
      v_age, 
      v_region, 
      now()
    );
  END LOOP;
END;
$$;

-- 5.5 REWRITE RPC: insert_signal_event (Standard Versus votes)
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id text DEFAULT NULL,
  p_attribute_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instance_id uuid;
  v_anon_id text;
  v_weight numeric;
  v_tier text;
  v_completeness int;
  v_gender text;
  v_age text;
  v_region text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  v_anon_id := public.get_or_create_anon_id();

  -- Resolver instancia activa
  SELECT id INTO v_instance_id FROM public.battle_instances 
  WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;

  -- Snapshot del perfil
  SELECT p.gender, p.age_bucket, p.region, p.tier, p.profile_completeness, COALESCE(us.signal_weight, 1.0)
  INTO v_gender, v_age, v_region, v_tier, v_completeness, v_weight
  FROM public.profiles p
  LEFT JOIN public.user_stats us ON us.user_id = p.id
  WHERE p.id = auth.uid() LIMIT 1;

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id, 
    entity_id, entity_type, module_type,
    signal_weight, user_tier, profile_completeness,
    gender, age_bucket, region, created_at
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    p_option_id, 'topic', 'versus', -- Polymorphic fields defaults for Versus module
    v_weight, v_tier, v_completeness,
    v_gender, v_age, v_region, now()
  );

  -- Actualizar stats (simple increment)
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1,
    last_signal_at = now();
END;
$$;

-- 6. REWRITE ANALYTICS RPCS TO READ FROM signal_events (module_type = 'depth')

-- Depth Analytics: Global
DROP FUNCTION IF EXISTS public.get_depth_analytics(uuid, text, text, text);
CREATE OR REPLACE FUNCTION public.get_depth_analytics(
  p_option_id uuid,
  p_gender text DEFAULT NULL, 
  p_age_bucket text DEFAULT NULL, 
  p_region text DEFAULT NULL
)
RETURNS table (question_key text, avg_value numeric, total_responses bigint)
LANGUAGE sql STABLE AS $$
  SELECT 
    context_id AS question_key,
    AVG(value_numeric),
    COUNT(*)
  FROM public.signal_events
  WHERE module_type = 'depth'
    AND option_id = p_option_id
    AND (p_gender IS NULL OR gender = p_gender)
    AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket)
    AND (p_region IS NULL OR region = p_region)
  GROUP BY context_id;
$$;

-- Depth Comparison: Head-to-Head
DROP FUNCTION IF EXISTS public.get_depth_comparison(uuid, uuid, text, text, text);
CREATE OR REPLACE FUNCTION public.get_depth_comparison(
  p_option_a uuid, 
  p_option_b uuid,
  p_gender text DEFAULT NULL, 
  p_age_bucket text DEFAULT NULL, 
  p_region text DEFAULT NULL
)
RETURNS table (option_id uuid, question_key text, avg_value numeric, total_responses bigint)
LANGUAGE sql STABLE AS $$
  SELECT 
    option_id, 
    context_id AS question_key,
    AVG(value_numeric),
    COUNT(*)
  FROM public.signal_events
  WHERE module_type = 'depth'
    AND option_id IN (p_option_a, p_option_b)
    AND (p_gender IS NULL OR gender = p_gender)
    AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket)
    AND (p_region IS NULL OR region = p_region)
  GROUP BY 1, 2;
$$;

-- Depth Trend: Temporal Evolution
DROP FUNCTION IF EXISTS public.get_depth_trend(uuid, text, text, text, text, text);
CREATE OR REPLACE FUNCTION public.get_depth_trend(
  p_option_id uuid, 
  p_question_key text, 
  p_bucket text DEFAULT 'day',
  p_gender text DEFAULT NULL, 
  p_age_bucket text DEFAULT NULL, 
  p_region text DEFAULT NULL
)
RETURNS table (time_bucket timestamp, avg_value numeric, total_responses bigint)
LANGUAGE sql STABLE AS $$
  SELECT 
    date_trunc(p_bucket, created_at) AS t,
    AVG(value_numeric),
    COUNT(*)
  FROM public.signal_events
  WHERE module_type = 'depth'
    AND option_id = p_option_id 
    AND context_id = p_question_key
    AND (p_gender IS NULL OR gender = p_gender)
    AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket)
    AND (p_region IS NULL OR region = p_region)
  GROUP BY 1
  ORDER BY 1 DESC;
$$;

-- 7. RECREATE INDEXES FOR NEW POLYMORPHIC COLUMNS
CREATE INDEX IF NOT EXISTS idx_se_module_context ON public.signal_events(module_type, context_id);
CREATE INDEX IF NOT EXISTS idx_se_entity ON public.signal_events(entity_type, entity_id);
