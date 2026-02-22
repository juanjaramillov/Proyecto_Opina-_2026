-- Migración: Inteligencia Personal en Perfil (Comparación Segmentada y Coherencia)

-- 1. Función para calcular comparaciones de segmento y coherencia
CREATE OR REPLACE FUNCTION calculate_user_segment_comparison(p_user_id uuid)
RETURNS TABLE (
    entity_id uuid,
    entity_name text,
    user_score float,
    avg_age float,
    avg_gender float,
    avg_commune float,
    avg_global float,
    signals_count int,
    coherence_level text
) AS $$
DECLARE
    v_gender text;
    v_age_bucket text;
    v_commune text;
    v_anon_ids uuid[];
BEGIN
    -- Obtener segmentación y anon_ids del usuario
    SELECT gender, age_bucket, commune INTO v_gender, v_age_bucket, v_commune
    FROM profiles WHERE id = p_user_id;

    SELECT array_agg(anon_id) INTO v_anon_ids
    FROM anonymous_identities WHERE user_id = p_user_id;

    RETURN QUERY
    WITH user_scores AS (
        SELECT se.option_id, AVG(se.value_numeric)::float as avg_score, COUNT(*)::int as signals
        FROM signal_events se
        WHERE se.anon_id = ANY(v_anon_ids) AND se.module_type = 'depth' AND se.value_numeric IS NOT NULL
        GROUP BY se.option_id
    ),
    user_prefs AS (
        SELECT se.option_id, COUNT(*)::int as v_count
        FROM signal_events se
        WHERE se.anon_id = ANY(v_anon_ids) AND se.module_type = 'versus'
        GROUP BY se.option_id
    ),
    all_depth AS (
        SELECT 
            se.option_id,
            se.value_numeric,
            p.gender,
            p.age_bucket,
            p.commune
        FROM signal_events se
        LEFT JOIN anonymous_identities ai ON se.anon_id = ai.anon_id
        LEFT JOIN profiles p ON ai.user_id = p.id
        WHERE se.module_type = 'depth' AND se.value_numeric IS NOT NULL
    )
    SELECT 
        e.id as entity_id,
        e.name as entity_name,
        us.avg_score as user_score,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.age_bucket = v_age_bucket)::float as avg_age,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.gender = v_gender)::float as avg_gender,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.commune = v_commune)::float as avg_commune,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id)::float as avg_global,
        COALESCE(up.v_count, 0) as signals_count,
        CASE 
            -- Coherencia: Si elige mucho (v_count > 5) y pone nota baja (< 4), coherencia Baja.
            -- Si elige mucho y pone nota alta (> 7), coherencia Alta.
            WHEN COALESCE(up.v_count, 0) > 5 AND us.avg_score < 4 THEN 'Baja'
            WHEN COALESCE(up.v_count, 0) > 5 AND us.avg_score > 7 THEN 'Alta'
            WHEN COALESCE(up.v_count, 0) > 2 THEN 'Media'
            ELSE 'Incipiente'
        END as coherence_level
    FROM user_scores us
    JOIN entities e ON us.option_id = e.id
    LEFT JOIN user_prefs up ON us.option_id = up.option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_personal_history(p_user_id uuid)
RETURNS TABLE (
    created_at timestamptz,
    value_numeric float,
    module_type text,
    option_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.created_at,
        se.value_numeric::float,
        se.module_type,
        e.name as option_name
    FROM signal_events se
    JOIN entities e ON se.option_id = e.id
    WHERE se.anon_id IN (SELECT ai.anon_id FROM anonymous_identities ai WHERE ai.user_id = p_user_id)
    ORDER BY se.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
