-- Actualización de RPC insert_signal_event para Bloque 2
-- 20260219080001_update_insert_signal_rpc.sql

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
    v_influence_weight NUMERIC;
BEGIN
    -- 1. Identificar Usuario
    v_user_id := auth.uid();
    
    -- 2. Obtener o crear anon_id (Irreversible)
    SELECT public.get_or_create_anon_id() INTO v_anon_id;

    -- 3. Resolver Battle Instance (Si aplica)
    SELECT id INTO v_battle_instance_id 
    FROM public.battle_instances 
    WHERE battle_id = p_battle_id 
    AND status = 'active'
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 4. Obtener Segmentación (Demográficos)
    IF v_user_id IS NOT NULL THEN
        SELECT gender, age_bucket, region, influence_score 
        INTO v_gender, v_age_bucket, v_region, v_influence_weight
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;

    -- 5. Insertar Señal con Referencia de Sesión y Atributo
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
        influence_weight,
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
        COALESCE(v_influence_weight, 1.0),
        'V12-Bloque2-Sessions'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
