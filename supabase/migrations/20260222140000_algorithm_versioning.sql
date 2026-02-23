-- =====================================================
-- OPINA+ V12 — FIX 20: ALGORITHM VERSION CONTROL
-- =====================================================

-- 1. CREAR TABLA algorithm_versions
CREATE TABLE IF NOT EXISTS public.algorithm_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name TEXT NOT NULL,
  description TEXT,
  recency_half_life_days INTEGER NOT NULL DEFAULT 7,
  verification_multiplier NUMERIC NOT NULL DEFAULT 1.3,
  trust_multiplier_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Solo lectura para usuarios, admin puede todo)
ALTER TABLE public.algorithm_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Algorithm versions are viewable by everyone" ON public.algorithm_versions FOR SELECT USING (true);

-- 2. INSERTAR VERSION INICIAL v1.0
INSERT INTO public.algorithm_versions (
  version_name,
  description,
  recency_half_life_days,
  verification_multiplier,
  is_active
)
VALUES (
  'v1.0',
  'Initial OpinaScore with weekly decay and 30% verification bonus',
  7,
  1.3,
  true
)
ON CONFLICT DO NOTHING;

-- 3. AGREGAR trazabilidad A signal_events Y ranking_snapshots
ALTER TABLE public.signal_events
ADD COLUMN IF NOT EXISTS algorithm_version_id UUID REFERENCES public.algorithm_versions(id);

ALTER TABLE public.ranking_snapshots
ADD COLUMN IF NOT EXISTS algorithm_version_id UUID REFERENCES public.algorithm_versions(id);

-- 4. ACTUALIZAR FUNCION calculate_recency_factor (Ahora acepta half_life dinámico)
CREATE OR REPLACE FUNCTION public.calculate_recency_factor(
  p_created_at TIMESTAMP,
  p_half_life_days INTEGER DEFAULT 7
)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT EXP(
    - EXTRACT(EPOCH FROM (now() - p_created_at)) / (p_half_life_days * 86400)
  );
$$;

-- 5. DINAMIZAR fn_enrich_signal_event
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
    -- Fetch profile, stats and verification status
    SELECT 
      p.gender, p.age_bucket, p.region, p.tier, p.profile_completeness, 
      COALESCE(us.signal_weight, 1.0),
      COALESCE(us.trust_score, 1.0),
      COALESCE(u.identity_verified, false)
    INTO 
      v_gender, v_age, v_region, v_tier, v_completeness, 
      v_weight, v_trust_score, v_verified
    FROM public.profiles p
    LEFT JOIN public.user_stats us ON us.user_id = p.id
    LEFT JOIN public.profiles u ON u.user_id = p.id
    WHERE p.id = v_user_id 
    LIMIT 1;

    -- Calcular Factores usando parámetros DINÁMICOS
    v_recency_factor := public.calculate_recency_factor(now(), v_algo_half_life);
    v_verification_factor := CASE WHEN v_verified = true THEN v_algo_verify_mult ELSE 1.0 END;

    -- Enriquecer registro
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

-- 6. ACTUALIZAR SNAPSHOT ENGINES PARA INCLUIR VERSION_ID
CREATE OR REPLACE FUNCTION public.calculate_rank_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_algo_id uuid;
BEGIN
    SELECT id INTO v_algo_id FROM public.algorithm_versions WHERE is_active = true LIMIT 1;

    INSERT INTO public.ranking_snapshots (option_id, total_signals, total_weight, period_type, algorithm_version_id)
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)),
        '3h',
        v_algo_id
    FROM public.signal_events
    WHERE created_at > now() - interval '3 hours'
    GROUP BY option_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_segmented_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_algo_id uuid;
BEGIN
    SELECT id INTO v_algo_id FROM public.algorithm_versions WHERE is_active = true LIMIT 1;

    INSERT INTO public.ranking_snapshots (
        option_id, total_signals, total_weight, period_type, 
        age_bucket, gender, region, algorithm_version_id
    )
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)),
        'segmented',
        age_bucket,
        gender,
        region,
        (SELECT id FROM public.algorithm_versions WHERE is_active = true LIMIT 1)
    FROM public.signal_events
    WHERE created_at > now() - interval '24 hours'
    GROUP BY option_id, age_bucket, gender, region;
END;
$$;

-- 7. ACTUALIZAR RPC EXPLICATIVO
DROP FUNCTION IF EXISTS public.explain_opinascore(UUID);
CREATE OR REPLACE FUNCTION public.explain_opinascore(
  p_user_id UUID
)
RETURNS TABLE (
  version_name TEXT,
  base_weight NUMERIC,
  is_verified BOOLEAN,
  verification_multiplier NUMERIC,
  current_recency_factor NUMERIC,
  estimated_opinascore NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    av.version_name,
    us.signal_weight as base_weight,
    u.identity_verified as is_verified,
    CASE WHEN u.identity_verified = true THEN av.verification_multiplier ELSE 1.0::numeric END as verification_multiplier,
    public.calculate_recency_factor(now(), av.recency_half_life_days) as current_recency_factor,
    (us.signal_weight * (CASE WHEN u.identity_verified = true THEN av.verification_multiplier ELSE 1.0::numeric END) * public.calculate_recency_factor(now(), av.recency_half_life_days) * COALESCE(us.trust_score, 1.0)) as estimated_opinascore
  FROM public.user_stats us
  JOIN public.profiles u ON u.user_id = us.user_id
  CROSS JOIN (SELECT version_name, verification_multiplier, recency_half_life_days FROM public.algorithm_versions WHERE is_active = true LIMIT 1) av
  WHERE us.user_id = p_user_id;
END;
$$;

-- 8. RPC PARA CAMBIAR VERSION ACTIVA
CREATE OR REPLACE FUNCTION public.activate_algorithm_version(p_version_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desactivar todas
  UPDATE public.algorithm_versions SET is_active = false;
  
  -- Activar la elegida
  UPDATE public.algorithm_versions SET is_active = true WHERE id = p_version_id;
  
  -- Nota: No levantamos error si no existe para evitar bloqueos en transacciones, 
  -- pero en producción se debería validar.
END;
$$;
