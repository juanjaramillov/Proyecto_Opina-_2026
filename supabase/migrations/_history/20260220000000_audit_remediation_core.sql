-- Migración: Auditoría y Remediación Core
-- Fecha: 2026-02-20
-- 20260220000000_audit_remediation_core.sql

-- 1. LIMPIEZA DE LEGADO (Punto 1 Auditoría)
DROP TABLE IF EXISTS public.signals_events_backup;
DROP TABLE IF EXISTS public.signals; -- Si existiese como residuo

-- 2. CENTRALIZACIÓN DE PESO DE SEÑAL (Punto 5 y 7 - Crítico)
-- Función para calcular el peso de influencia de un usuario basado en su perfil
CREATE OR REPLACE FUNCTION public.calculate_user_influence_weight(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_completeness INT;
    v_is_verified BOOLEAN;
    v_base_weight NUMERIC := 1.0;
BEGIN
    -- Si es anónimo, peso base
    IF p_user_id IS NULL THEN
        RETURN 1.0;
    END IF;

    -- Obtener datos del perfil
    SELECT 
        profile_completeness,
        is_verified
    INTO 
        v_completeness,
        v_is_verified
    FROM public.profiles
    WHERE id = p_user_id;

    -- Lógica de ponderación (esto es el "corazón" del peso en el backend)
    -- + 0.5 si está verificado
    -- + proporcional a la completitud del perfil (max +0.5)
    IF v_is_verified THEN
        v_base_weight := v_base_weight + 0.5;
    END IF;

    v_base_weight := v_base_weight + (COALESCE(v_completeness, 0)::NUMERIC / 100.0) * 0.5;

    RETURN ROUND(v_base_weight, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. AUTOMATIZACIÓN Y SEGMENTACIÓN DE RANKINGS (Punto 2 y 3 - Crítico)
-- Función maestra para refrescar rankings de todas las batallas activas
CREATE OR REPLACE FUNCTION public.refresh_all_active_rankings()
RETURNS VOID AS $$
DECLARE
    v_battle RECORD;
    v_attr RECORD;
    v_segment RECORD;
BEGIN
    -- 1. Iterar por cada batalla activa
    FOR v_battle IN (SELECT id FROM public.battles WHERE status = 'active') LOOP
        
        -- 2. Iterar por cada atributo vinculado a esa batalla (vía signal_events)
        FOR v_attr IN (
            SELECT DISTINCT attribute_id 
            FROM public.signal_events 
            WHERE battle_id = v_battle.id 
            AND attribute_id IS NOT NULL
        ) LOOP
            
            -- Generar Snapshot Global del Atributo
            PERFORM public.calculate_rank_snapshot(v_attr.attribute_id, '{}'::JSONB);

            -- Generar Snapshots por Segmentos Clave (Punto 3 Auditoría: Comuna/Región)
            -- Nota: Aquí podrías iterar por regiones más comunes o segmentos estratégicos
            FOR v_segment IN (
                SELECT DISTINCT region_segment 
                FROM public.signal_events 
                WHERE attribute_id = v_attr.attribute_id 
                AND region_segment IS NOT NULL
            ) LOOP
                PERFORM public.calculate_rank_snapshot(
                    v_attr.attribute_id, 
                    jsonb_build_object('region', v_segment.region_segment)
                );
            END LOOP;

        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ACTUALIZACIÓN DE RPC DE INSERCIÓN PARA USAR NUEVO CÁLCULO DE PESO
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

    -- 4. Obtener Segmentación (Demográficos)
    IF v_user_id IS NOT NULL THEN
        SELECT 
            gender_identity, 
            age_bracket, 
            comuna, 
            health_system, 
            clinical_attention_12m
        INTO 
            v_gender, 
            v_age_bucket, 
            v_region, 
            v_health_system, 
            v_attention_12m
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;

    -- 5. DETERMINAR PESO (CENTRALIZADO EN BACKEND)
    v_influence_weight := public.calculate_user_influence_weight(v_user_id);

    -- 6. Insertar Señal
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
        'V12-Audit-R1'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
