BEGIN;

-- Función para obtener la distribución de respuestas a preguntas de profundidad
-- para un entity específico (agrupando por option_id en battle_options donde brand_id = p_entity_id)
CREATE OR REPLACE FUNCTION public.get_depth_insights(p_entity_id uuid)
RETURNS TABLE (
    question_key text,
    question_type text,
    question_text text,
    q_position int,
    total_answers bigint,
    avg_score numeric,
    distribution jsonb
) AS $$
BEGIN
    RETURN QUERY
    WITH options_list AS (
        -- Obtener los option_ids vinculados a esta entidad
        SELECT id FROM public.battle_options WHERE brand_id = p_entity_id
    ),
    depths AS (
        -- Obtener las preguntas de profundidad para esta entidad
        SELECT d.question_key, d.question_text, d.question_type, d.position
        FROM public.depth_definitions d
        WHERE d.entity_id = p_entity_id
    ),
    raw_signals AS (
        -- Obtener señales de profundidad, ignorando 'ignore'/'skip'
        SELECT s.context_id as q_key, s.context_value
        FROM public.signal_events s
        JOIN options_list o ON s.option_id = o.id
        WHERE s.signal_type = 'depth'
          AND s.context_id IS NOT NULL
          AND s.context_value IS NOT NULL
          AND s.context_value NOT IN ('ignore', 'skip', '')
    )
    SELECT 
        d.question_key,
        d.question_type,
        d.question_text,
        d.position AS q_position,
        COUNT(rs.context_value)::bigint AS total_answers,
        -- Promedio numérico para campos tipo scale o scale_1_5
        CASE 
            WHEN d.question_type LIKE 'scale%' THEN 
                COALESCE(AVG(NULLIF(regexp_replace(rs.context_value, '[A-Za-z]', '', 'g'), '')::numeric), 0)
            ELSE 0 
        END AS avg_score,
        -- Distribución agrupada (e.g {"El protagonista": 5, "El villano": 2})
        jsonb_object_agg(v.val, v.ct) AS distribution
    FROM depths d
    LEFT JOIN raw_signals rs ON rs.q_key = d.question_key
    LEFT JOIN (
        SELECT context_id, context_value AS val, COUNT(*) AS ct
        FROM raw_signals
        GROUP BY context_id, context_value
    ) v ON v.context_id = d.question_key
    GROUP BY d.question_key, d.question_type, d.question_text, d.position
    ORDER BY d.position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
