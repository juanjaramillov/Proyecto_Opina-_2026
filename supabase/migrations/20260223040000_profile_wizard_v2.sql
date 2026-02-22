-- =====================================================
-- OPINA+ V12.3 — PROFILE WIZARD V2 & DYNAMIC WEIGHTS
-- =====================================================

-- 1. ADD COLUMNS TO user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS birth_year INTEGER,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS income_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS housing_type TEXT,
ADD COLUMN IF NOT EXISTS purchase_behavior TEXT,
ADD COLUMN IF NOT EXISTS influence_level TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS profile_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS signal_weight NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. UPDATE INSERT_SIGNAL_EVENT TO READ WEIGHT FROM user_profiles
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
    v_instance_id uuid; 
    v_anon_id text; 
    v_user_weight numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  -- Leemos signal_weight desde user_profiles en lugar de user_stats
  SELECT COALESCE(signal_weight, 1.0) INTO v_user_weight
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id, 
    entity_id, entity_type, module_type, session_id, attribute_id,
    signal_weight
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id, 
    p_option_id, 'topic', 'versus', p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0)
  );

  -- Registrar actividad (Requerido para detect_signal_spike)
  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (auth.uid(), 'signal_emitted');

  -- Actualizar estadísticas y RECALIBRAR CONFIANZA
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at) 
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1, 
    last_signal_at = now();

  PERFORM public.update_trust_score(auth.uid());
END;
$$;

-- 3. UPDATE fn_enrich_signal_event TO MAP TO user_profiles
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
  v_verified boolean;
  v_trust_score numeric;
  
  -- Parámetros del Algoritmo
  v_algo_id uuid;
  v_algo_half_life integer;
  v_algo_verify_mult numeric;
  
  v_verification_factor numeric;
  v_recency_factor numeric;
BEGIN
  v_user_id := auth.uid();
  
  -- Obtener versión activa del algoritmo
  SELECT id, recency_half_life_days, verification_multiplier
  INTO v_algo_id, v_algo_half_life, v_algo_verify_mult
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Fetch profile from user_profiles, stats and verification status from users/stats
    SELECT 
      up.gender, up.age_range, up.region, 'registered' as tier, up.profile_completion_percentage, 
      COALESCE(up.signal_weight, 1.0),
      COALESCE(us.trust_score, 1.0),
      COALESCE(up.verified, false)
    INTO 
      v_gender, v_age, v_region, v_tier, v_completeness, 
      v_weight, v_trust_score, v_verified
    FROM public.user_profiles up
    LEFT JOIN public.user_stats us ON us.user_id = up.user_id
    WHERE up.user_id = v_user_id 
    LIMIT 1;

    -- Calcular Factores usando parámetros DINÁMICOS
    v_recency_factor := public.calculate_recency_factor(now(), v_algo_half_life);
    v_verification_factor := CASE WHEN v_verified = true THEN v_algo_verify_mult ELSE 1.0 END;

    -- Enriquecer registro (NEW object from trigger context)
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);
    NEW.user_tier := COALESCE(NEW.user_tier, v_tier);
    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completeness);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
    
    -- Trazabilidad de Versión
    NEW.algorithm_version_id := v_algo_id;
    
    -- CALCULAR OPINASCORE
    NEW.opinascore := (v_weight * v_recency_factor * v_verification_factor * v_trust_score);
    
    IF v_trust_score < 1.0 THEN
       RAISE NOTICE 'User flagged. Integrity factor applied under algorithm %.', v_algo_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
