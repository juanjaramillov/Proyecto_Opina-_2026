-- Migración: Estructura de Snapshots Trazable
-- Fecha: 2026-02-20
-- 20260220000200_enhance_rank_snapshots_structure.sql

-- 1. MODIFICACIÓN DE TABLA public_rank_snapshots
ALTER TABLE public.public_rank_snapshots
ADD COLUMN IF NOT EXISTS segment_filters JSONB;

-- 2. RENOMBRAR created_at A snapshot_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'public_rank_snapshots'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.public_rank_snapshots
    RENAME COLUMN created_at TO snapshot_at;
  END IF;
END $$;

-- 3. ASEGURAR DEFAULT now()
ALTER TABLE public.public_rank_snapshots
ALTER COLUMN snapshot_at SET DEFAULT now();

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_rank_snapshots_segment_filters
ON public.public_rank_snapshots
USING GIN (segment_filters);

CREATE INDEX IF NOT EXISTS idx_rank_snapshots_segment_hash
ON public.public_rank_snapshots (segment_hash);

-- 5. ACTUALIZAR FUNCIÓN calculate_rank_snapshot
-- Reemplaza la versión anterior para incluir segment_filters y snapshot_at explícito
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
BEGIN
    -- 1. Generar Hash de Segmento (Consistente)
    v_segment_hash := md5(p_attribute_id::text || (p_filters::text));

    -- 2. Obtener Snapshot previo para calcular tendencias
    SELECT ranking INTO v_prev_ranking 
    FROM public.public_rank_snapshots 
    WHERE attribute_id = p_attribute_id 
    AND segment_hash = v_segment_hash
    ORDER BY snapshot_at DESC 
    LIMIT 1;

    -- 3. Calcular Ranking Ponderado con Decay Temporal
    WITH raw_signals AS (
        SELECT 
            option_id,
            influence_weight,
            created_at,
            (EXTRACT(EPOCH FROM (now() - created_at)) / 86400)::INT as age_days
        FROM public.signal_events
        WHERE attribute_id = p_attribute_id
        -- Aplicar filtros dinámicos
        AND (p_filters->>'gender' IS NULL OR gender_segment = p_filters->>'gender')
        AND (p_filters->>'age_bracket' IS NULL OR age_segment = p_filters->>'age_bracket')
        AND (p_filters->>'health_system' IS NULL OR health_segment = p_filters->>'health_system')
        AND (p_filters->>'region' IS NULL OR region_segment = p_filters->>'region')
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
    FROM (
        SELECT 
            r.*,
            (SELECT (val->>'position')::INT FROM jsonb_array_elements(v_prev_ranking) val WHERE val->>'option_id' = r.option_id::text) as prev_pos
        FROM final_ranking r
    ) rt;

    -- 4. INSERTAR SNAPSHOT CON TRAZABILIDAD
    INSERT INTO public.public_rank_snapshots (
        attribute_id,
        segment_hash,
        segment_filters,
        ranking,
        total_signals,
        snapshot_at
    ) VALUES (
        p_attribute_id,
        v_segment_hash,
        p_filters,
        v_ranking,
        COALESCE(v_total_signals, 0),
        now()
    );

    RETURN v_ranking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
