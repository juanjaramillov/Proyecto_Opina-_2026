-- =====================================================
-- OPINA+ V12 — FIX 19: SIGNAL INTEGRITY ENGINE
-- =====================================================

-- 1. EXTENDER user_stats
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS trust_score NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS suspicious_flag BOOLEAN DEFAULT false;

-- 2. FUNCION DETECTAR EXCESO DE ACTIVIDAD (Spike detection)
-- Detecta si el usuario ha enviado más de 20 señales en la última hora
CREATE OR REPLACE FUNCTION public.detect_signal_spike(p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) > 20
  FROM public.signal_events
  WHERE user_id = p_user
  AND created_at >= now() - interval '1 hour';
$$;

-- 3. FUNCION ACTUALIZAR TRUST SCORE
CREATE OR REPLACE FUNCTION public.update_trust_score(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_spike BOOLEAN;
BEGIN
  v_spike := public.detect_signal_spike(p_user);

  IF v_spike THEN
    UPDATE public.user_stats
    SET trust_score = 0.5,
        suspicious_flag = true,
        updated_at = now()
    WHERE user_id = p_user;
  ELSE
    -- Solo restauramos si no hay spike. 
    -- Podríamos dejarlo en 0.5 permanentemente hasta revisión, 
    -- pero el prompt sugiere un toggle dinámico o reset.
    UPDATE public.user_stats
    SET trust_score = 1.0,
        suspicious_flag = false,
        updated_at = now()
    WHERE user_id = p_user AND suspicious_flag = true AND NOT v_spike;
  END IF;
END;
$$;

-- 4. ACTUALIZAR TRIGGER DE ENRIQUECIMIENTO PARA INCLUIR TRUST_SCORE EN OPINASCORE
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
  v_verification_factor numeric;
  v_recency_factor numeric;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    -- Fetch profile, stats and verification status
    SELECT 
      p.gender, 
      p.age_bucket, 
      p.region, 
      p.tier, 
      p.profile_completeness, 
      COALESCE(us.signal_weight, 1.0),
      COALESCE(us.trust_score, 1.0),
      COALESCE(u.identity_verified, false)
    INTO 
      v_gender, 
      v_age, 
      v_region, 
      v_tier, 
      v_completeness, 
      v_weight,
      v_trust_score,
      v_verified
    FROM public.profiles p
    LEFT JOIN public.user_stats us ON us.user_id = p.id
    LEFT JOIN public.profiles u ON u.user_id = p.id
    WHERE p.id = v_user_id 
    LIMIT 1;

    -- Calcular Factores
    v_recency_factor := public.calculate_recency_factor(now());
    v_verification_factor := CASE WHEN v_verified = true THEN 1.3 ELSE 1.0 END;

    -- Apply enriched data to the NEW record
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);
    NEW.user_tier := COALESCE(NEW.user_tier, v_tier);
    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completeness);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
    
    -- CALCULAR OPINASCORE (Incluyendo factor de confianza)
    NEW.opinascore := (v_weight * v_recency_factor * v_verification_factor * v_trust_score);
    
    -- Alerta si el usuario está marcado
    IF v_trust_score < 1.0 THEN
       RAISE NOTICE 'User flagged for suspicious activity. Signal weight reduced.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ACTUALIZAR insert_signal_event PARA DISPARAR VALIDACION DE INTEGRIDAD
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
  
  -- Hard block si el usuario es extremadamente sospechoso (opcional, implementamos aviso)
  -- IF (SELECT suspicious_flag FROM public.user_stats WHERE user_id = auth.uid()) THEN
  --   RAISE EXCEPTION 'Account restricted due to suspicious activity. Please contact support.';
  -- END IF;

  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(signal_weight, 1.0) INTO v_user_weight
  FROM public.user_stats
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
