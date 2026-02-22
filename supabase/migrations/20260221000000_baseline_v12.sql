-- =========================================================
-- Opina+ Baseline Master Schema V12.1 (EXTENDED & SYNCED)
-- Fecha: 2026-02-21
-- Objetivo: Consolidación total + Analytics + Sync con Frontend.
-- =========================================================

-- 0) EXTENSIONES
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 1) IDENTIDAD Y PERFIL
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  display_name text,
  age int,
  gender text,
  commune text,
  region text,
  country text DEFAULT 'CL',
  education text,
  occupation text,
  income text,
  civil_status text,
  household_size text,
  interest text,
  shopping_preference text,
  brand_affinity text,
  social_media text,
  politics_interest text,
  voting_frequency text,
  points int DEFAULT 0,
  role text DEFAULT 'user',
  tier text DEFAULT 'guest',
  profile_completeness int DEFAULT 0,
  profile_completed boolean DEFAULT false,
  has_ci boolean DEFAULT false,
  health_system text,
  clinical_attention_12m boolean
);

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_signals bigint DEFAULT 0,
  weighted_score numeric DEFAULT 0,
  level int DEFAULT 1,
  signal_weight numeric DEFAULT 1.0,
  last_signal_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anonymous_identities (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2) DOMINIO Y CONTENIDO
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  emoji text,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.battle_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  label text NOT NULL,
  brand_id uuid REFERENCES public.entities(id) ON DELETE SET NULL,
  image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, label)
);

CREATE TABLE IF NOT EXISTS public.battle_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  version int DEFAULT 1,
  starts_at timestamptz,
  ends_at timestamptz,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, version)
);

-- 3) FACT TABLE & ANALYTICS
CREATE TABLE IF NOT EXISTS public.signal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  anon_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  entity_id uuid,
  entity_type text,
  module_type text DEFAULT 'versus',
  context_id text,
  
  battle_id uuid REFERENCES public.battles(id) ON DELETE SET NULL,
  battle_instance_id uuid REFERENCES public.battle_instances(id) ON DELETE SET NULL,
  option_id uuid REFERENCES public.battle_options(id) ON DELETE SET NULL,
  
  session_id uuid,
  attribute_id uuid,
  
  value_text text,
  value_numeric numeric,
  meta jsonb DEFAULT '{}'::jsonb,
  
  signal_weight numeric(10,2) DEFAULT 1.0,
  computed_weight numeric(10,2),
  algorithm_version text DEFAULT '1.2.0',
  influence_level_snapshot text,
  user_tier text DEFAULT 'guest',
  profile_completeness int DEFAULT 0,
  gender text, age_bucket text, region text,
  country text DEFAULT 'CL'
);

CREATE TABLE IF NOT EXISTS public.user_state_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  anon_id text NOT NULL,
  mood_score int, economic_score int, job_score int, happiness_score int,
  gender text, age_bucket text, region text
);

-- B2B & AGGREGATIONS
CREATE TABLE IF NOT EXISTS public.signal_hourly_aggs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_bucket timestamptz NOT NULL,
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  battle_instance_id uuid REFERENCES public.battle_instances(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.battle_options(id) ON DELETE CASCADE,
  gender text, age_bucket text, region text,
  signals_count bigint DEFAULT 0,
  weighted_sum numeric DEFAULT 0,
  UNIQUE(hour_bucket, battle_id, option_id, gender, age_bucket, region)
);

CREATE TABLE IF NOT EXISTS public.public_rank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id uuid REFERENCES public.entities(id) ON DELETE CASCADE,
  segment_hash text NOT NULL,
  segment_filters jsonb DEFAULT '{}'::jsonb,
  ranking jsonb NOT NULL, -- Array of RankingItem
  total_signals bigint DEFAULT 0,
  snapshot_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =========================================================
-- 4) FUNCIONES CORE (RPCS)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_or_create_anon_id()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_anon_id text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid() LIMIT 1;
  IF v_anon_id IS NULL THEN
    v_anon_id := encode(gen_random_bytes(16), 'hex');
    INSERT INTO public.anonymous_identities (user_id, anon_id) VALUES (auth.uid(), v_anon_id) ON CONFLICT DO NOTHING;
    IF v_anon_id IS NULL THEN SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid(); END IF;
  END IF;
  RETURN v_anon_id;
END;
$$;

-- Trigger: Global Enrichment & Ponderación
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS trigger AS $$
DECLARE
  v_gender text; v_age text; v_region text; v_tier text; v_comp int; v_base_weight numeric; v_final_weight numeric;
BEGIN
  SELECT p.gender, p.age_bucket, p.region, COALESCE(p.tier, 'guest'), COALESCE(p.profile_completeness, 0)
  INTO v_gender, v_age, v_region, v_tier, v_comp
  FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1;

  CASE v_tier
    WHEN 'verified_full_ci' THEN v_base_weight := 2.0;
    WHEN 'verified_basic' THEN v_base_weight := 1.5;
    WHEN 'registered' THEN v_base_weight := 1.2;
    ELSE v_base_weight := 1.0;
  END CASE;

  v_final_weight := v_base_weight * (1 + (v_comp::numeric / 100.0));
  NEW.gender := COALESCE(NEW.gender, v_gender);
  NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
  NEW.region := COALESCE(NEW.region, v_region);
  NEW.user_tier := v_tier;
  NEW.profile_completeness := v_comp;
  NEW.signal_weight := v_final_weight;
  NEW.computed_weight := v_final_weight;
  NEW.algorithm_version := '1.2.0';
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_enrich_signal_event BEFORE INSERT ON public.signal_events FOR EACH ROW EXECUTE FUNCTION public.fn_enrich_signal_event();

-- RPC: Inserción Sincronizada con Frontend
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_instance_id uuid; v_anon_id text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO public.signal_events (anon_id, signal_id, battle_id, battle_instance_id, option_id, entity_id, entity_type, module_type, session_id, attribute_id)
  VALUES (v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id, p_option_id, 'topic', 'versus', p_session_id, p_attribute_id);

  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at) VALUES (auth.uid(), 1, now())
  ON CONFLICT (user_id) DO UPDATE SET total_signals = public.user_stats.total_signals + 1, last_signal_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_depth_answers(p_option_id uuid, p_answers jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_anon_id text; v_signal_id uuid; v_answer record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  v_anon_id := public.get_or_create_anon_id();
  v_signal_id := gen_random_uuid();
  FOR v_answer IN SELECT * FROM jsonb_to_recordset(p_answers) AS x(question_key text, answer_value text)
  LOOP
    INSERT INTO public.signal_events (anon_id, signal_id, option_id, entity_id, entity_type, module_type, context_id, value_text, value_numeric)
    VALUES (v_anon_id, v_signal_id, p_option_id, p_option_id, 'topic', 'depth', v_answer.question_key, v_answer.answer_value, 
            CASE WHEN v_answer.answer_value ~ '^[0-9]+$' THEN v_answer.answer_value::numeric ELSE NULL END);
  END LOOP;
END;
$$;

-- =========================================================
-- 5) ANALYTICS RPCS (MODERNIZED)
-- =========================================================

CREATE OR REPLACE FUNCTION public.kpi_share_of_preference(p_battle_id uuid, p_start_date timestamptz DEFAULT NULL, p_end_date timestamptz DEFAULT NULL)
RETURNS table (option_id uuid, option_label text, signals_count bigint, weighted_signals numeric, share_pct numeric) LANGUAGE sql STABLE AS $$
  WITH agg AS (
    SELECT se.option_id, COUNT(*) as c, SUM(se.signal_weight) as w
    FROM public.signal_events se
    WHERE se.battle_id = p_battle_id AND (p_start_date IS NULL OR se.created_at >= p_start_date) AND (p_end_date IS NULL OR se.created_at <= p_end_date)
    GROUP BY se.option_id
  ), tot AS (SELECT NULLIF(SUM(w), 0) as total FROM agg)
  SELECT bo.id, bo.label, COALESCE(agg.c, 0), COALESCE(agg.w, 0), CASE WHEN tot.total > 0 THEN ROUND((COALESCE(agg.w, 0) / tot.total) * 100, 2) ELSE 0 END
  FROM public.battle_options bo LEFT JOIN agg ON agg.option_id = bo.id CROSS JOIN tot WHERE bo.battle_id = p_battle_id ORDER BY bo.sort_order;
$$;

CREATE OR REPLACE FUNCTION public.kpi_trend_velocity(p_battle_id uuid, p_bucket text DEFAULT 'hour', p_start_date timestamptz DEFAULT NULL, p_end_date timestamptz DEFAULT NULL)
RETURNS table (time_bucket timestamp, option_id uuid, signals_delta bigint) LANGUAGE sql STABLE AS $$
  SELECT date_trunc(p_bucket, se.created_at) as t, se.option_id, COUNT(*)
  FROM public.signal_events se WHERE se.battle_id = p_battle_id AND (p_start_date IS NULL OR se.created_at >= p_start_date) AND (p_end_date IS NULL OR se.created_at <= p_end_date)
  GROUP BY 1, 2 ORDER BY 1 DESC, 2;
$$;

CREATE OR REPLACE FUNCTION public.get_depth_analytics(p_option_id uuid, p_gender text DEFAULT NULL, p_age_bucket text DEFAULT NULL, p_region text DEFAULT NULL)
RETURNS table (question_key text, avg_value numeric, total_responses bigint) LANGUAGE sql STABLE AS $$
  SELECT context_id, AVG(value_numeric), COUNT(*)
  FROM public.signal_events WHERE option_id = p_option_id AND module_type = 'depth'
    AND (p_gender IS NULL OR gender = p_gender) AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket) AND (p_region IS NULL OR region = p_region)
  GROUP BY context_id;
$$;

CREATE OR REPLACE FUNCTION public.get_depth_comparison(p_option_a uuid, p_option_b uuid, p_gender text DEFAULT NULL, p_age_bucket text DEFAULT NULL, p_region text DEFAULT NULL)
RETURNS table (option_id uuid, question_key text, avg_value numeric, total_responses bigint) LANGUAGE sql STABLE AS $$
  SELECT option_id, context_id, AVG(value_numeric), COUNT(*)
  FROM public.signal_events WHERE option_id IN (p_option_a, p_option_b) AND module_type = 'depth'
    AND (p_gender IS NULL OR gender = p_gender) AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket) AND (p_region IS NULL OR region = p_region)
  GROUP BY 1, 2;
$$;

CREATE OR REPLACE FUNCTION public.get_depth_trend(p_option_id uuid, p_question_key text, p_bucket text DEFAULT 'day', p_gender text DEFAULT NULL, p_age_bucket text DEFAULT NULL, p_region text DEFAULT NULL)
RETURNS table (time_bucket timestamp, avg_value numeric, total_responses bigint) LANGUAGE sql STABLE AS $$
  SELECT date_trunc(p_bucket, created_at) as t, AVG(value_numeric), COUNT(*)
  FROM public.signal_events WHERE option_id = p_option_id AND context_id = p_question_key AND module_type = 'depth'
    AND (p_gender IS NULL OR gender = p_gender) AND (p_age_bucket IS NULL OR age_bucket = p_age_bucket) AND (p_region IS NULL OR region = p_region)
  GROUP BY 1 ORDER BY 1 DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_state_benchmarks()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_res jsonb; v_gen text; v_age text; v_reg text;
BEGIN
  SELECT gender, age_bucket, region INTO v_gen, v_age, v_reg FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  WITH global_avg AS (
    SELECT AVG(mood_score)::numeric(10,2) as m, AVG(economic_score)::numeric(10,2) as e, AVG(job_score)::numeric(10,2) as j, AVG(happiness_score)::numeric(10,2) as h, COUNT(*)::int as n
    FROM public.user_state_logs
  ), segment_avg AS (
    SELECT AVG(mood_score)::numeric(10,2) as m, AVG(economic_score)::numeric(10,2) as e, AVG(job_score)::numeric(10,2) as j, AVG(happiness_score)::numeric(10,2) as h, COUNT(*)::int as n
    FROM public.user_state_logs WHERE gender = v_gen AND age_bucket = v_age AND region = v_reg
  )
  SELECT jsonb_build_object('country', (SELECT row_to_json(global_avg.*) FROM global_avg), 'segment', (SELECT row_to_json(segment_avg.*) FROM segment_avg), 'meta', jsonb_build_object('gender', v_gen, 'age', v_age, 'region', v_reg)) INTO v_res;
  RETURN v_res;
END;
$$;

-- 6) SECURITY
ALTER TABLE public.signal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_state_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Read own signals" ON public.signal_events FOR SELECT USING (anon_id = public.get_or_create_anon_id());
CREATE POLICY "Read own state" ON public.user_state_logs FOR SELECT USING (anon_id = public.get_or_create_anon_id());
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- AUTH TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name, tier, profile_completeness, profile_completed)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    'guest',
    0,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
