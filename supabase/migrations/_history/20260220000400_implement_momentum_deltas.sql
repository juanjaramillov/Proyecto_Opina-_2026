-- Migración: Sistema de Momentum (Deltas de Ranking)
-- Fecha: 2026-02-20
-- 20260220000400_implement_momentum_deltas.sql

-- 1. EXTENDER Y REFINAR TABLA public_rank_snapshots
-- Agregamos columnas de delta
ALTER TABLE public.public_rank_snapshots
ADD COLUMN IF NOT EXISTS option_id UUID, -- Crucial para el modelo fila-por-opción
ADD COLUMN IF NOT EXISTS total_weight NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delta_weight NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delta_rank_position INTEGER DEFAULT 0;

-- Hacer ranking opcional si vamos a transicionar (mantenemos compatibilidad por ahora)
ALTER TABLE public.public_rank_snapshots
ALTER COLUMN ranking DROP NOT NULL;

-- 2. AJUSTAR FUNCIÓN calculate_rank_snapshot
-- Ahora itera por cada opción y genera una fila independiente con deltas
CREATE OR REPLACE FUNCTION public.calculate_rank_snapshot(
    p_attribute_id UUID,
    p_filters JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$ -- Ya no retorna JSONB completo por defecto
DECLARE
    v_segment_hash TEXT;
    v_rec RECORD;
    v_prev_weight NUMERIC;
    v_prev_rank INTEGER;
    v_delta_weight NUMERIC;
    v_delta_rank INTEGER;
    v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
    -- 1. Hash Consistente del segmento
    v_segment_hash := md5(p_attribute_id::text || (p_filters::text));

    -- 2. Calcular Ranking Actual (CTE similar a la anterior)
    -- Recorremos cada opción que tenga señales para este atributo/segmento
    FOR v_rec IN (
        WITH raw_signals AS (
            SELECT 
                option_id,
                influence_weight,
                created_at,
                (EXTRACT(EPOCH FROM (v_now - created_at)) / 86400)::INT as age_days
            FROM public.signal_events
            WHERE attribute_id = p_attribute_id
            AND (p_filters->>'gender' IS NULL OR gender_segment = p_filters->>'gender')
            AND (p_filters->>'age_bracket' IS NULL OR age_segment = p_filters->>'age_bracket')
            AND (p_filters->>'health_system' IS NULL OR health_segment = p_filters->>'health_system')
            AND (p_filters->>'region' IS NULL OR region_segment = p_filters->>'region')
            AND (p_filters->>'attention_12m' IS NULL OR attention_segment = (p_filters->>'attention_12m')::BOOLEAN)
        ),
        weighted_stats AS (
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
                )) as current_weight
            FROM raw_signals
            GROUP BY option_id
        ),
        final_ranking AS (
            SELECT 
                option_id,
                current_weight,
                ROW_NUMBER() OVER (ORDER BY current_weight DESC) as current_pos
            FROM weighted_stats
        )
        SELECT * FROM final_ranking
    ) LOOP
        -- 3. Buscar Momentum (Snapshot anterior)
        SELECT total_weight, rank_position
        INTO v_prev_weight, v_prev_rank
        FROM public.public_rank_snapshots
        WHERE attribute_id = p_attribute_id
          AND segment_hash = v_segment_hash
          AND option_id = v_rec.option_id
        ORDER BY snapshot_at DESC
        LIMIT 1;

        -- 4. Calcular deltas
        IF FOUND THEN
            v_delta_weight := v_rec.current_weight - COALESCE(v_prev_weight, 0);
            v_delta_rank := v_prev_rank - v_rec.current_pos; -- Positivo si subió (ej: era 5, ahora 3 = +2)
        ELSE
            v_delta_weight := 0;
            v_delta_rank := 0;
        END IF;

        -- 5. Insertar Snapshot Individual
        INSERT INTO public.public_rank_snapshots (
            attribute_id,
            option_id,
            segment_hash,
            segment_filters,
            total_weight,
            rank_position,
            delta_weight,
            delta_rank_position,
            snapshot_at
        ) VALUES (
            p_attribute_id,
            v_rec.option_id,
            v_segment_hash,
            p_filters,
            v_rec.current_weight,
            v_rec.current_pos,
            v_delta_weight,
            v_delta_rank,
            v_now
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
