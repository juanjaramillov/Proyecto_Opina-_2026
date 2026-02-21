-- Migración: Feed de Tendencias Agrupado por Categoría
-- Fecha: 2026-02-20
-- 20260220000700_create_grouped_trending_feed.sql

-- 1. Asegurar que public_rank_snapshots tenga battle_id para el join
ALTER TABLE public.public_rank_snapshots
ADD COLUMN IF NOT EXISTS battle_id UUID;

-- 2. Actualizar función calculate_rank_snapshot para capturar battle_id
-- Esto es necesario porque el feed agrupado necesita el battle_id para saber la categoría
CREATE OR REPLACE FUNCTION public.calculate_rank_snapshot(
    p_attribute_id UUID,
    p_filters JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
DECLARE
    v_segment_hash TEXT;
    v_rec RECORD;
    v_prev_weight NUMERIC;
    v_prev_rank INTEGER;
    v_delta_weight NUMERIC;
    v_delta_rank INTEGER;
    v_trend_status TEXT;
    v_abs_delta NUMERIC;
    v_battle_id UUID;
    v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
    -- 0. Identificar Battle ID asociado al atributo (desde la señal más reciente o similar)
    -- En este modelo, asumimos que un snapshot de atributo está vinculado a una batalla específica
    SELECT battle_id INTO v_battle_id 
    FROM public.signal_events 
    WHERE attribute_id = p_attribute_id 
    LIMIT 1;

    -- 1. Hash Consistente del segmento
    v_segment_hash := md5(p_attribute_id::text || (p_filters::text));

    -- 2. Calcular Ranking Actual
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
            v_delta_rank := v_prev_rank - v_rec.current_pos;
        ELSE
            v_delta_weight := 0;
            v_delta_rank := 0;
        END IF;

        -- 5. Clasificar Tendencia (5 Niveles)
        v_abs_delta := ABS(COALESCE(v_delta_weight, 0));
        
        IF v_abs_delta < 1 THEN
            v_trend_status := 'stable';
        ELSE
            IF v_delta_weight > 0 THEN
                IF v_abs_delta >= 5 OR COALESCE(v_delta_rank, 0) >= 3 THEN
                    v_trend_status := 'strong_rise';
                ELSE
                    v_trend_status := 'rise';
                END IF;
            ELSIF v_delta_weight < 0 THEN
                IF v_abs_delta >= 5 OR COALESCE(v_delta_rank, 0) <= -3 THEN
                    v_trend_status := 'strong_drop';
                ELSE
                    v_trend_status := 'drop';
                END IF;
            ELSE
                v_trend_status := 'stable';
            END IF;
        END IF;

        -- 6. Insertar Snapshot Individual con Battle_ID
        INSERT INTO public.public_rank_snapshots (
            battle_id,
            attribute_id,
            option_id,
            segment_hash,
            segment_filters,
            total_weight,
            rank_position,
            delta_weight,
            delta_rank_position,
            trend_status,
            snapshot_at
        ) VALUES (
            v_battle_id,
            p_attribute_id,
            v_rec.option_id,
            v_segment_hash,
            p_filters,
            v_rec.current_weight,
            v_rec.current_pos,
            v_delta_weight,
            v_delta_rank,
            v_trend_status,
            v_now
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear vista enriquecida public_trending_feed_grouped
CREATE OR REPLACE VIEW public.public_trending_feed_grouped AS
SELECT DISTINCT ON (s.battle_id, s.option_id)
  b.category,
  b.title as battle_title,
  o.name as option_name,
  s.battle_id,
  s.option_id,
  s.total_weight,
  s.rank_position,
  s.delta_weight,
  s.delta_rank_position,
  s.trend_status,
  s.snapshot_at
FROM public.public_rank_snapshots s
JOIN public.battles b ON b.id = s.battle_id
JOIN public.options o ON o.id = s.option_id
WHERE s.segment_filters IS NULL
   OR s.segment_filters = '{}'::jsonb
ORDER BY s.battle_id, s.option_id, s.snapshot_at DESC;

-- 4. RPC ordenado por categoría y tendencia
CREATE OR REPLACE FUNCTION public.get_trending_feed_grouped()
RETURNS TABLE (
  category TEXT,
  battle_title TEXT,
  option_name TEXT,
  battle_id UUID,
  option_id UUID,
  total_weight NUMERIC,
  rank_position INTEGER,
  delta_weight NUMERIC,
  delta_rank_position INTEGER,
  trend_status TEXT,
  snapshot_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.public_trending_feed_grouped
  ORDER BY
    category,
    CASE trend_status
      WHEN 'strong_rise' THEN 1
      WHEN 'rise' THEN 2
      WHEN 'stable' THEN 3
      WHEN 'drop' THEN 4
      WHEN 'strong_drop' THEN 5
      ELSE 6
    END,
    ABS(delta_weight) DESC;
$$;
