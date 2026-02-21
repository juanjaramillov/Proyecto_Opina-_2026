-- Migración: Lógica de Ranking con Decay Temporal y Estabilidad
-- Fecha: 2026-02-19
-- 20260219114000_ranking_logic_rpc.sql

CREATE OR REPLACE FUNCTION public.calculate_rank_snapshot(
    p_attribute_id UUID,
    p_filters JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_segment_hash TEXT;
    v_total_signals INT;
    v_ranking JSONB;
    v_prev_ranking JSONB;
    v_decay_rules JSONB := '[
        {"days": 7, "weight": 1.0},
        {"days": 14, "weight": 0.8},
        {"days": 21, "weight": 0.6},
        {"days": 30, "weight": 0.4},
        {"days": 9999, "weight": 0.2}
    ]'::JSONB;
BEGIN
    -- 1. Generar Hash de Segmento (Consistente: llaves ordenadas)
    v_segment_hash := md5(p_attribute_id::text || (p_filters::text));

    -- 2. Obtener Snapshot previo para calcular tendencias
    SELECT ranking INTO v_prev_ranking 
    FROM public.public_rank_snapshots 
    WHERE attribute_id = p_attribute_id 
    AND segment_hash = v_segment_hash
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 3. Calcular Ranking Ponderado
    WITH raw_signals AS (
        SELECT 
            option_id,
            influence_weight,
            created_at,
            (EXTRACT(EPOCH FROM (now() - created_at)) / 86400)::INT as age_days
        FROM public.signal_events
        WHERE attribute_id = p_attribute_id
        -- Aplicar filtros dinámicos (si existen en el JSONB)
        AND (p_filters->>'gender' IS NULL OR gender_segment = p_filters->>'gender')
        AND (p_filters->>'age_bracket' IS NULL OR age_segment = p_filters->>'age_bracket')
        AND (p_filters->>'health_system' IS NULL OR health_segment = p_filters->>'health_system')
        AND (p_filters->>'attention_12m' IS NULL OR attention_segment = (p_filters->>'attention_12m')::BOOLEAN)
    ),
    weighted_signals AS (
        SELECT 
            option_id,
            SUM(influence_weight * (
                CASE 
                    WHEN age_days <= 7 THEN 1.0
                    WHEN age_days <= 14 THEN 0.8
                    WHEN age_days <= 21 THEN 0.6
                    WHEN age_days <= 30 THEN 0.4
                    ELSE 0.2
                END
            )) as weighted_score,
            COUNT(*) as raw_count
        FROM raw_signals
        GROUP BY option_id
    ),
    final_ranking AS (
        SELECT 
            option_id,
            weighted_score,
            raw_count,
            ROW_NUMBER() OVER (ORDER BY weighted_score DESC) as current_pos
        FROM weighted_signals
    )
    SELECT 
        jsonb_agg(jsonb_build_object(
            'option_id', r.option_id,
            'score', r.weighted_score,
            'signals', r.raw_count,
            'position', r.current_pos,
            'trend', 'stable' -- Por defecto, luego comparamos
        )),
        SUM(r.raw_count)
    INTO v_ranking, v_total_signals
    FROM final_ranking r;

    -- 4. Protección de Estabilidad y Cálculo de Tendencia (↑ ↓ →)
    -- Si diferencia ponderada entre dos clínicas < 0.5%, mantener orden anterior si es posible.
    -- Para este MVP, comparamos posiciones simples del snapshot previo.
    
    WITH ranked_with_trends AS (
        SELECT 
            r.*,
            (SELECT (val->>'position')::INT FROM jsonb_array_elements(v_prev_ranking) val WHERE val->>'option_id' = r.option_id::text) as prev_pos,
            (SELECT (val->>'score')::FLOAT FROM jsonb_array_elements(v_prev_ranking) val WHERE val->>'option_id' = r.option_id::text) as prev_score
        FROM final_ranking r
    )
    SELECT 
        jsonb_agg(jsonb_build_object(
            'option_id', rt.option_id,
            'score', rt.weighted_score,
            'signals', rt.raw_count,
            'position', rt.current_pos,
            'trend', CASE 
                WHEN rt.prev_pos IS NULL THEN 'stable'
                WHEN rt.current_pos < rt.prev_pos THEN 'up'
                WHEN rt.current_pos > rt.prev_pos THEN 'down'
                ELSE 'stable'
            END
        )),
        SUM(rt.raw_count)
    INTO v_ranking, v_total_signals
    FROM ranked_with_trends rt;

    -- 5. Insertar Snapshot
    INSERT INTO public.public_rank_snapshots (
        attribute_id,
        segment_hash,
        ranking,
        total_signals
    ) VALUES (
        p_attribute_id,
        v_segment_hash,
        v_ranking,
        COALESCE(v_total_signals, 0)
    );

    RETURN v_ranking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
