-- =====================================================
-- OPINA+ V12 — FIX 18: OPINASCORE ALGORITHM
-- =====================================================

-- 1. AGREGAR COLUMNA OPINASCORE A SIGNAL_EVENTS
ALTER TABLE public.signal_events
ADD COLUMN IF NOT EXISTS opinascore NUMERIC;

-- 2. FUNCION CALCULAR RECENCY FACTOR
-- Decay exponencial semanal (7 días = 604800 segundos)
CREATE OR REPLACE FUNCTION public.calculate_recency_factor(p_created_at TIMESTAMP)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT EXP(
    - EXTRACT(EPOCH FROM (now() - p_created_at)) / 604800
  );
$$;

-- 3. ACTUALIZAR TRIGGER DE ENRIQUECIMIENTO PARA CALCULAR OPINASCORE
-- Esto asegura que tanto versus como depth y topics usen la misma lógica
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
  v_verification_factor numeric;
  v_recency_factor numeric;
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
      COALESCE(us.signal_weight, 1.0),
      COALESCE(u.identity_verified, false)
    INTO 
      v_gender, 
      v_age, 
      v_region, 
      v_tier, 
      v_completeness, 
      v_weight,
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
    
    -- CALCULAR OPINASCORE
    NEW.opinascore := COALESCE(NEW.signal_weight, v_weight) * v_recency_factor * v_verification_factor;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ACTUALIZAR SNAPSHOT ENGINES (Global y Segmentado)
-- Reemplazar SUM(signal_weight) por SUM(opinascore)

CREATE OR REPLACE FUNCTION public.calculate_rank_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.ranking_snapshots (option_id, total_signals, total_weight, period_type)
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)), -- Usar opinascore si existe
        '3h'
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
BEGIN
    INSERT INTO public.ranking_snapshots (
        option_id, 
        total_signals, 
        total_weight, 
        period_type,
        age_bucket,
        gender,
        region
    )
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)),
        'segmented',
        age_bucket,
        gender,
        region
    FROM public.signal_events
    WHERE created_at > now() - interval '24 hours'
    GROUP BY option_id, age_bucket, gender, region;
END;
$$;

-- 5. RPC EXPLICATIVO (OPCIONAL PERO RECOMENDADO)
CREATE OR REPLACE FUNCTION public.explain_opinascore(
  p_user_id UUID
)
RETURNS TABLE (
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
    us.signal_weight as base_weight,
    u.identity_verified as is_verified,
    CASE WHEN u.identity_verified = true THEN 1.3::numeric ELSE 1.0::numeric END as verification_multiplier,
    public.calculate_recency_factor(now()) as current_recency_factor,
    (us.signal_weight * (CASE WHEN u.identity_verified = true THEN 1.3 ELSE 1.0 END) * public.calculate_recency_factor(now())) as estimated_opinascore
  FROM public.user_stats us
  JOIN public.profiles u ON u.user_id = us.user_id
  WHERE us.user_id = p_user_id;
END;
$$;
