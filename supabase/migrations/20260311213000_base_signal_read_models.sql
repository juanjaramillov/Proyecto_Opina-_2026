-- Migration: Base Signal Read Models
-- Purpose: Crear la capa de lectura unificada (Views) sobre public.signal_events para Resultados e Inteligencia.
-- Modelos aditivos sin borrar ni mutar eventos crudos.

-- 1. Vista resumen general por entidad
CREATE OR REPLACE VIEW public.v_signal_entity_summary AS
SELECT
    se.id AS entity_id,
    se.name AS entity_name,
    se.entity_type_code,
    COUNT(s.id) AS total_signals,
    SUM(s.effective_weight) AS weighted_signals,
    -- Conteo único de usuarios (priorizando user_id y cayendo a anon_id)
    COUNT(DISTINCT COALESCE(s.user_id::text, s.anon_id)) AS unique_users_count,
    COUNT(DISTINCT s.context_id) AS unique_contexts_count,
    MAX(s.created_at) AS last_signal_at
FROM public.signal_entities se
LEFT JOIN public.signal_events s ON se.id = s.entity_id
WHERE s.is_valid = true AND se.is_active = true
GROUP BY
    se.id,
    se.name,
    se.entity_type_code;

-- 2. Vista resumen por entidad + tipo de señal
CREATE OR REPLACE VIEW public.v_signal_entity_type_summary AS
SELECT
    se.id AS entity_id,
    se.name AS entity_name,
    s.signal_type_code,
    COUNT(s.id) AS total_signals,
    SUM(s.effective_weight) AS weighted_signals,
    COUNT(DISTINCT COALESCE(s.user_id::text, s.anon_id)) AS unique_users_count,
    MAX(s.created_at) AS last_signal_at
FROM public.signal_entities se
JOIN public.signal_events s ON se.id = s.entity_id
WHERE s.is_valid = true AND se.is_active = true
GROUP BY
    se.id,
    se.name,
    s.signal_type_code;

-- 3. Vista resumen por entidad + período transaccional (Día/Semana)
CREATE OR REPLACE VIEW public.v_signal_entity_period_summary AS
SELECT
    se.id AS entity_id,
    se.name AS entity_name,
    date_trunc('day', s.created_at) AS period_day,
    date_trunc('week', s.created_at) AS period_week,
    COUNT(s.id) AS total_signals,
    SUM(s.effective_weight) AS weighted_signals,
    COUNT(DISTINCT COALESCE(s.user_id::text, s.anon_id)) AS unique_users_count
FROM public.signal_entities se
JOIN public.signal_events s ON se.id = s.entity_id
WHERE s.is_valid = true AND se.is_active = true
GROUP BY
    se.id,
    se.name,
    date_trunc('day', s.created_at),
    date_trunc('week', s.created_at);

-- 4. Vista comparativa cruzada (Específicamente para Versus y Progresivos)
-- Asume que la entidad principal (s.entity_id) es la elegida o "ganadora".
-- Extrae el perdedor desde value_json->>'loser_entity_id'.
CREATE OR REPLACE VIEW public.v_comparative_preference_summary AS
WITH wins AS (
    SELECT
        s.entity_id,
        COUNT(s.id) AS wins_count,
        SUM(s.effective_weight) AS weighted_wins
    FROM public.signal_events s
    WHERE s.signal_type_code IN ('VERSUS_SIGNAL', 'PROGRESSIVE_SIGNAL')
        AND s.is_valid = true
    GROUP BY s.entity_id
),
losses AS (
    SELECT
        -- Parseamos el uuid de loser desde dict string con casteo UUID
        NULLIF(s.value_json->>'loser_entity_id', '')::uuid AS entity_id,
        COUNT(s.id) AS losses_count,
        SUM(s.effective_weight) AS weighted_losses
    FROM public.signal_events s
    WHERE s.signal_type_code IN ('VERSUS_SIGNAL', 'PROGRESSIVE_SIGNAL')
        AND s.is_valid = true
        AND s.value_json->>'loser_entity_id' IS NOT NULL
        AND s.value_json->>'loser_entity_id' != ''
    GROUP BY NULLIF(s.value_json->>'loser_entity_id', '')::uuid
)
SELECT
    COALESCE(w.entity_id, l.entity_id) AS entity_id,
    se.name AS entity_name,
    COALESCE(w.wins_count, 0) AS wins_count,
    COALESCE(l.losses_count, 0) AS losses_count,
    COALESCE(w.weighted_wins, 0) AS weighted_wins,
    COALESCE(l.weighted_losses, 0) AS weighted_losses,
    COALESCE(w.wins_count, 0) + COALESCE(l.losses_count, 0) AS total_comparisons,
    -- Preference Share
    CASE WHEN (COALESCE(w.wins_count, 0) + COALESCE(l.losses_count, 0)) > 0 THEN
        ROUND(COALESCE(w.wins_count, 0)::numeric / (COALESCE(w.wins_count, 0) + COALESCE(l.losses_count, 0))::numeric * 100.0, 2)
    ELSE 0 END AS preference_share,
    -- Mantenemos un win_rate numérico normalizado de 0 a 1 para IA e Intelligence
    CASE WHEN (COALESCE(w.wins_count, 0) + COALESCE(l.losses_count, 0)) > 0 THEN
        (COALESCE(w.wins_count, 0)::numeric / (COALESCE(w.wins_count, 0) + COALESCE(l.losses_count, 0))::numeric)
    ELSE 0 END AS win_rate
FROM wins w
FULL OUTER JOIN losses l ON w.entity_id = l.entity_id
JOIN public.signal_entities se ON COALESCE(w.entity_id, l.entity_id) = se.id
WHERE se.is_active = true;

-- 5. Vista evaluativa para Depth / NPS / Preguntas parametrizadas
-- Segmenta métricas por la pregunta específica dentro del value_json.
CREATE OR REPLACE VIEW public.v_depth_entity_question_summary AS
SELECT
    se.id AS entity_id,
    se.name AS entity_name,
    s.value_json->>'question_code' AS question_code,
    s.value_json->>'question_label' AS question_label,
    s.value_json->>'response_type' AS response_type,
    
    -- Métricas de Volumen General en esta pregunta
    COUNT(s.id) AS total_responses,
    
    -- Scales / Number
    COUNT(s.value_numeric) AS numeric_response_count,
    ROUND(AVG(s.value_numeric)::numeric, 2) AS average_score,
    
    -- Booleans
    COUNT(CASE WHEN s.value_boolean = true THEN 1 END) AS boolean_true_count,
    COUNT(CASE WHEN s.value_boolean = false THEN 1 END) AS boolean_false_count,
    
    -- NPS (Net Promoter Score) deducido de las escalas 0-10 comunes o marcado en el format
    -- NPS Clásico de 0 a 10: Promotores (9-10), Pasivos (7-8), Detractores (0-6)
    CASE WHEN MAX(s.value_json->>'response_type') = 'scale_0_10' THEN
         ROUND(
            (
                (COUNT(CASE WHEN s.value_numeric >= 9 THEN 1 END)::numeric / NULLIF(COUNT(s.value_numeric), 0)) -
                (COUNT(CASE WHEN s.value_numeric <= 6 THEN 1 END)::numeric / NULLIF(COUNT(s.value_numeric), 0))
            ) * 100.0, 
         2)
    ELSE NULL END AS nps_score,

    MAX(s.created_at) AS last_signal_at
FROM public.signal_entities se
JOIN public.signal_events s ON se.id = s.entity_id
WHERE s.signal_type_code = 'DEPTH_SIGNAL'
  AND s.is_valid = true 
  AND se.is_active = true
  AND s.value_json->>'question_code' IS NOT NULL
GROUP BY
    se.id,
    se.name,
    s.value_json->>'question_code',
    s.value_json->>'question_label',
    s.value_json->>'response_type';

-- Garantizar permisos de lectura universal en supabase para vistas publicas
GRANT SELECT ON public.v_signal_entity_summary TO authenticated, anon;
GRANT SELECT ON public.v_signal_entity_type_summary TO authenticated, anon;
GRANT SELECT ON public.v_signal_entity_period_summary TO authenticated, anon;
GRANT SELECT ON public.v_comparative_preference_summary TO authenticated, anon;
GRANT SELECT ON public.v_depth_entity_question_summary TO authenticated, anon;
