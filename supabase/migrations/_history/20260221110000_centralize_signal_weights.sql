-- Migración: Centralización de Lógica de Pesos y Enriquecimiento de Señales
-- Fecha: 2026-02-21
-- 20260221110000_centralize_signal_weights.sql

-- 1. FUNCTION TO ENRICH SIGNAL EVENTS
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_weight numeric;
  v_tier text;
  v_completeness int;
  v_gender text;
  v_age text;
  v_region text;
BEGIN
  -- We rely on auth.uid() since all signal insertions require authentication
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    -- Fetch profile and stats snapshot
    SELECT 
      p.gender, 
      p.age_bucket, 
      p.region, 
      p.tier, 
      p.profile_completeness, 
      COALESCE(us.signal_weight, 1.0)
    INTO 
      v_gender, 
      v_age, 
      v_region, 
      v_tier, 
      v_completeness, 
      v_weight
    FROM public.profiles p
    LEFT JOIN public.user_stats us ON us.user_id = p.id
    WHERE p.id = v_user_id 
    LIMIT 1;

    -- Apply enriched data to the NEW record
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);
    NEW.user_tier := COALESCE(NEW.user_tier, v_tier);
    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completeness);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CREATE TRIGGER
DROP TRIGGER IF EXISTS tr_enrich_signal_event ON public.signal_events;
CREATE TRIGGER tr_enrich_signal_event
BEFORE INSERT ON public.signal_events
FOR EACH ROW
EXECUTE FUNCTION public.fn_enrich_signal_event();

-- 3. SIMPLIFY insert_depth_answers
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
  v_signal_id uuid;
  v_answer record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  v_anon_id := public.get_or_create_anon_id();
  v_signal_id := gen_random_uuid();

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
      value_numeric
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
      CASE WHEN v_answer.answer_value ~ '^[0-9]+$' THEN v_answer.answer_value::numeric ELSE NULL END
    );
  END LOOP;
END;
$$;

-- 4. SIMPLIFY insert_signal_event
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
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  v_anon_id := public.get_or_create_anon_id();

  -- Resolver instancia activa
  SELECT id INTO v_instance_id FROM public.battle_instances 
  WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id, 
    entity_id, entity_type, module_type
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    p_option_id, 'topic', 'versus'
  );

  -- Actualizar stats (simple increment)
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1,
    last_signal_at = now();
END;
$$;
