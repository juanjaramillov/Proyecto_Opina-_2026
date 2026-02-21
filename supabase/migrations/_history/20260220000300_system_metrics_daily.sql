-- Migración: Métricas Diarias del Sistema y Refuerzo de Trazabilidad
-- Fecha: 2026-02-20
-- 20260220000300_system_metrics_daily.sql

-- 1. Refuerzo de signal_events para métricas precisas
-- Agregamos is_verified para poder contar señales de usuarios validados sin romper el anonimato (sin user_id)
ALTER TABLE public.signal_events
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Actualizar RPC insert_signal_event para persistir el estado de verificación
CREATE OR REPLACE FUNCTION public.insert_signal_event(
    p_battle_id UUID,
    p_option_id UUID,
    p_session_id UUID DEFAULT NULL,
    p_attribute_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_anon_id UUID;
    v_battle_instance_id UUID;
    v_gender TEXT;
    v_age_bucket TEXT;
    v_region TEXT;
    v_health_system TEXT;
    v_attention_12m BOOLEAN;
    v_is_verified BOOLEAN; -- Nuevo
    v_influence_weight NUMERIC;
BEGIN
    -- 1. Identificar Usuario
    v_user_id := auth.uid();
    
    -- 2. Obtener o crear anon_id (Irreversible)
    SELECT public.get_or_create_anon_id() INTO v_anon_id;

    -- 3. Resolver Battle Instance
    SELECT id INTO v_battle_instance_id 
    FROM public.battle_instances 
    WHERE battle_id = p_battle_id 
    AND status = 'active'
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 4. Obtener Segmentación e Is_Verified
    IF v_user_id IS NOT NULL THEN
        SELECT 
            gender_identity, 
            age_bracket, 
            comuna, 
            health_system, 
            clinical_attention_12m,
            is_verified -- Capturamos el flag
        INTO 
            v_gender, 
            v_age_bucket, 
            v_region, 
            v_health_system, 
            v_attention_12m,
            v_is_verified -- Llenamos la variable
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;

    -- 5. DETERMINAR PESO (CENTRALIZADO EN BACKEND)
    v_influence_weight := public.calculate_user_influence_weight(v_user_id);

    -- 6. Insertar Señal incluyendo is_verified (anonimizado pero filtrable)
    INSERT INTO public.signal_events (
        anon_id,
        battle_id,
        battle_instance_id,
        option_id,
        session_id,
        attribute_id,
        gender_segment,
        age_segment,
        region_segment,
        health_segment,
        attention_segment,
        influence_weight,
        is_verified, -- Persistido
        algorithm_version
    ) VALUES (
        v_anon_id,
        p_battle_id,
        v_battle_instance_id,
        p_option_id,
        p_session_id,
        p_attribute_id,
        v_gender,
        v_age_bucket,
        v_region,
        v_health_system,
        v_attention_12m,
        v_influence_weight,
        COALESCE(v_is_verified, FALSE), -- Default false
        'V12-Metrics-R1'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear tabla system_metrics_daily
CREATE TABLE IF NOT EXISTS public.system_metrics_daily (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,

  total_signals BIGINT NOT NULL,
  total_verified_signals BIGINT NOT NULL,
  total_unique_users BIGINT NOT NULL, -- Medido via anon_id
  total_active_battles BIGINT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear función refresh_system_metrics_daily()
CREATE OR REPLACE FUNCTION public.refresh_system_metrics_daily()
RETURNS VOID AS $$
DECLARE
  v_total_signals BIGINT;
  v_total_verified_signals BIGINT;
  v_total_unique_users BIGINT;
  v_total_active_battles BIGINT;
BEGIN

  -- Conteos agregados
  SELECT COUNT(*) INTO v_total_signals FROM public.signal_events;
  
  -- Filtrado por el nuevo flag persistido
  SELECT COUNT(*) INTO v_total_verified_signals FROM public.signal_events WHERE is_verified = TRUE;

  -- Usuarios únicos vía anon_id (preserva anonimato)
  SELECT COUNT(DISTINCT anon_id) INTO v_total_unique_users FROM public.signal_events;

  -- Batallas activas
  SELECT COUNT(*) INTO v_total_active_battles FROM public.battles WHERE status = 'active';

  -- Upsert (por si se corre más de una vez el mismo día)
  INSERT INTO public.system_metrics_daily (
    metric_date,
    total_signals,
    total_verified_signals,
    total_unique_users,
    total_active_battles
  )
  VALUES (
    CURRENT_DATE,
    v_total_signals,
    v_total_verified_signals,
    v_total_unique_users,
    v_total_active_battles
  )
  ON CONFLICT (id) DO UPDATE SET
    total_signals = EXCLUDED.total_signals,
    total_verified_signals = EXCLUDED.total_verified_signals,
    total_unique_users = EXCLUDED.total_unique_users,
    total_active_battles = EXCLUDED.total_active_battles;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Automatizar con pg_cron (02:00 AM)
SELECT cron.schedule(
  'refresh_system_metrics_daily',
  '0 2 * * *',
  $$ SELECT public.refresh_system_metrics_daily(); $$
);
