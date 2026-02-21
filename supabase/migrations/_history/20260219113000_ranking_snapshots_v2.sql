-- Migración: Snapshots de Ranking y Segmentación B2C
-- Fecha: 2026-02-19
-- 20260219113000_ranking_snapshots_v2.sql

-- 1. Tabla de Snapshots
CREATE TABLE IF NOT EXISTS public.public_rank_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL, -- Siempre vinculado a un atributo (o NULL para global si se desea)
  segment_hash TEXT NOT NULL, -- Hash de la combinación de filtros
  ranking JSONB NOT NULL,     -- Arreglo de {clinic_id, score, trend, total_signals}
  total_signals INT NOT NULL,  -- Señales totales en este segmento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_rank_snapshots_hash ON public.public_rank_snapshots(segment_hash);
CREATE INDEX IF NOT EXISTS idx_rank_snapshots_attr ON public.public_rank_snapshots(attribute_id);

-- 2. Extender signal_events con dimensiones demográficas anonimizadas
-- Estos campos se llenarán al momento del insert para permitir rankings segmentados sin joins costosos
ALTER TABLE public.signal_events 
  ADD COLUMN IF NOT EXISTS health_segment TEXT,        -- 'isapre', 'fonasa'
  ADD COLUMN IF NOT EXISTS attention_segment BOOLEAN;  -- true = < 12m, false = > 12m

-- 3. Actualizar RPC insert_signal_event para capturar nuevos segmentos
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

    -- 3. Resolver Battle Instance (Si aplica)
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
            clinical_attention_12m,
            influence_score 
        INTO 
            v_gender, 
            v_age_bucket, 
            v_region, 
            v_health_system, 
            v_attention_12m,
            v_influence_weight
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;

    -- 5. Insertar Señal con Referencia de Sesión y Atributo + Segmentos B2C
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
        COALESCE(v_influence_weight, 1.0),
        'V12-Bloque3-Ranking'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
