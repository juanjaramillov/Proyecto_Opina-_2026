-- =========================================================================
-- OPINA+ / BLOQUE 4: CAPA DE CONSUMO ANALÍTICO PREMIUM (GOLDEN ENDPOINTS)
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. GOLDEN ENDPOINT: BATTLE ANALYTICS (VERSUS)
-- -------------------------------------------------------------------------
-- Proporciona un output estructurado (Raw, Corrected, Interpreted) uniendo
-- promedios bayesianos, wilson score (con flag de empate) y entropía.
CREATE OR REPLACE FUNCTION get_b2b_battle_analytics(p_battle_id UUID)
RETURNS TABLE (
    -- Metadata
    battle_id UUID,
    stats_version TEXT,
    -- Raw
    total_effective_weight NUMERIC,
    n_eff NUMERIC,
    options_count INT,
    -- Corrected & Interpreted (agrupados en JSON para facilidad de consumo en tablas pivot extendidas si 3 o más opciones)
    analytics_payload JSONB,
    -- Global Interpreted (basado en la entropía general)
    global_entropy_normalized NUMERIC,
    global_fragmentation_label TEXT
) AS $$
DECLARE
    v_total_weight NUMERIC;
    v_n_eff NUMERIC;
    v_options_count INT := 0;
    v_entropy_norm NUMERIC := 0;
    v_entropy_label TEXT := 'desconocido';
    v_payload JSONB := '[]'::jsonb;
    v_stats_version TEXT := 'v3.0';
    v_option_record RECORD;
    
    -- Variables para Wilson
    v_lower NUMERIC;
    v_upper NUMERIC;
    v_tie_flag BOOLEAN;
    v_margin NUMERIC;
    v_is_fragile BOOLEAN;
    v_mass_to_revert NUMERIC;
    v_stability TEXT;
BEGIN
    -- Obteniendo Totales y n_eff
    SELECT 
        SUM(effective_weight),
        COUNT(DISTINCT user_id),
        -- Approx n_eff = sum(w)^2 / sum(w^2)
        COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
    INTO v_total_weight, v_options_count, v_n_eff
    FROM public.signal_events 
    WHERE public.signal_events.battle_id = p_battle_id AND option_id IS NOT NULL;

    -- Obteniendo Entropía Global
    SELECT entropy_normalized, opinion_fragmentation_label INTO v_entropy_norm, v_entropy_label
    FROM get_opinion_entropy_stats(p_battle_id, TRUE);

    IF v_total_weight > 0 THEN
        -- Iterar por cada opción para generar el payload enriquecido
        FOR v_option_record IN 
            SELECT option_id, SUM(effective_weight) as opt_weight 
            FROM public.signal_events 
            WHERE public.signal_events.battle_id = p_battle_id AND option_id IS NOT NULL
            GROUP BY option_id
        LOOP
            -- 1. Wilson Interval & Technical Tie
            SELECT lower_bound, upper_bound, technical_tie_flag, current_margin, is_fragile, mass_to_revert
            INTO v_lower, v_upper, v_tie_flag, v_margin, v_is_fragile, v_mass_to_revert
            FROM calculate_wilson_interval_weighted(v_total_weight, v_n_eff, v_option_record.opt_weight);

            -- 3. Stability Label
            v_stability := stability_label(v_mass_to_revert, v_tie_flag, v_is_fragile);

            -- Agregar al payload
            v_payload := v_payload || jsonb_build_object(
                'option_id', v_option_record.option_id,
                'raw_score_pct', ROUND(v_option_record.opt_weight / NULLIF(v_total_weight, 0), 4),
                'n_eff_share', ROUND(v_n_eff * (v_option_record.opt_weight / NULLIF(v_total_weight, 0)), 2),
                'ci_lower', v_lower,
                'ci_upper', v_upper,
                'technical_tie_flag', v_tie_flag,
                'stability_label', v_stability,
                'mass_to_revert', v_mass_to_revert
            );
        END LOOP;
    END IF;

    RETURN QUERY SELECT 
        p_battle_id,
        v_stats_version,
        COALESCE(v_total_weight, 0),
        COALESCE(v_n_eff, 0),
        v_options_count,
        v_payload,
        COALESCE(v_entropy_norm, 0),
        v_entropy_label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- 2. GOLDEN ENDPOINT: ACTUALIDAD TOPIC ANALYTICS (NEWS)
-- -------------------------------------------------------------------------
-- Proporciona entropía y breakdown canónico del modulo actuality
CREATE OR REPLACE FUNCTION get_b2b_actualidad_topic_analytics(p_topic_id UUID)
RETURNS TABLE (
    entity_id UUID,
    stats_version TEXT,
    total_effective_weight NUMERIC,
    options_count INT,
    analytics_payload JSONB,
    entropy_normalized NUMERIC,
    fragmentation_label TEXT
) AS $$
DECLARE
    v_total_weight NUMERIC;
    v_options_count INT;
    v_entropy_norm NUMERIC := 0;
    v_entropy_label TEXT := 'desconocido';
    v_payload JSONB := '[]'::jsonb;
    v_stats_version TEXT := 'v3.0';
BEGIN
    SELECT 
        SUM(effective_weight),
        COUNT(DISTINCT value_text)
    INTO v_total_weight, v_options_count
    FROM public.signal_events 
    WHERE (public.signal_events.entity_id = p_topic_id OR public.signal_events.battle_id = p_topic_id) 
      AND public.signal_events.module_type = 'news' 
      AND value_text IS NOT NULL;

    -- Entropía no-battle flag
    SELECT entropy_normalized, opinion_fragmentation_label INTO v_entropy_norm, v_entropy_label
    FROM get_opinion_entropy_stats(p_topic_id, FALSE);

    IF v_total_weight > 0 THEN
        WITH agg AS (
            SELECT value_text AS answer, SUM(effective_weight) as opt_weight 
            FROM public.signal_events 
            WHERE (public.signal_events.entity_id = p_topic_id OR public.signal_events.battle_id = p_topic_id) 
              AND public.signal_events.module_type = 'news'
            GROUP BY value_text
        )
        SELECT jsonb_agg(jsonb_build_object(
            'answer_text', answer,
            'raw_score_pct', ROUND(opt_weight / NULLIF(v_total_weight, 0), 4),
            'raw_weight', opt_weight
        ))
        INTO v_payload
        FROM agg;
    END IF;

    RETURN QUERY SELECT 
        p_topic_id,
        v_stats_version,
        COALESCE(v_total_weight, 0),
        COALESCE(v_options_count, 0),
        COALESCE(v_payload, '[]'::jsonb),
        COALESCE(v_entropy_norm, 0),
        v_entropy_label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- 3. GOLDEN ENDPOINT: DEPTH BRAND ANALYTICS
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_b2b_depth_brand_analytics(p_entity_id UUID)
RETURNS TABLE (
    entity_id UUID,
    stats_version TEXT,
    total_effective_weight NUMERIC,
    analytics_payload JSONB
) AS $$
DECLARE
    v_total_weight NUMERIC;
    v_payload JSONB := '[]'::jsonb;
    v_stats_version TEXT := 'v3.0';
    v_resolved_id UUID;
BEGIN
    -- Usar el id si hay hacks viejos
    SELECT public.resolve_entity_id(p_entity_id) INTO v_resolved_id;

    SELECT SUM(effective_weight) INTO v_total_weight
    FROM public.signal_events 
    WHERE (public.signal_events.entity_id = v_resolved_id OR public.signal_events.battle_id = v_resolved_id) 
      AND public.signal_events.module_type = 'depth'
      AND public.signal_events.value_numeric IS NOT NULL;

    IF v_total_weight > 0 THEN
        WITH agg AS (
            SELECT 
                COALESCE(context_id, attribute_id::text) AS dimension,
                COUNT(*) as count_responses,
                AVG(value_numeric) as avg_score_raw,
                -- Bayesian average simple: (n * avg + m * 5.0) / (n + m)  -- asumiendo escala de 10, prior=5.0, m=3
                ROUND((COUNT(*) * AVG(value_numeric) + 3.0 * 5.0) / (COUNT(*) + 3.0), 3) AS bayesian_score_corrected
            FROM public.signal_events 
            WHERE (public.signal_events.entity_id = v_resolved_id OR public.signal_events.battle_id = v_resolved_id) 
              AND public.signal_events.module_type = 'depth'
              AND public.signal_events.value_numeric IS NOT NULL
            GROUP BY COALESCE(context_id, attribute_id::text)
        )
        SELECT jsonb_agg(jsonb_build_object(
            'dimension', dimension,
            'n_raw', count_responses,
            'avg_score_raw', ROUND(avg_score_raw, 3),
            'bayesian_score_corrected', bayesian_score_corrected
        ))
        INTO v_payload
        FROM agg;
    END IF;

    RETURN QUERY SELECT 
        p_entity_id,
        v_stats_version,
        COALESCE(v_total_weight, 0),
        COALESCE(v_payload, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- 4. GOLDEN ENDPOINT: TRENDING WITH DECAY LEADERBOARD
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_b2b_trending_decay_leaderboard(
    p_half_life_days NUMERIC DEFAULT 7.0,
    p_category VARCHAR DEFAULT NULL,
    p_limit INT DEFAULT 50
) RETURNS TABLE (
    stats_version TEXT,
    entity_id UUID,
    entity_name TEXT,
    raw_wins_weight NUMERIC,
    decayed_wins_weight NUMERIC,
    temporal_decay_applied BOOLEAN,
    decay_rank INT,
    -- Estabilidad / Robustez
    n_eff NUMERIC,
    bayesian_score_corrected NUMERIC
) AS $$
DECLARE
    v_stats_version TEXT := 'v3.0';
BEGIN
    RETURN QUERY
    WITH base_decay AS (
        SELECT * FROM get_trending_leaderboard_decay(p_half_life_days, p_category)
    ),
    -- Joinea con n_eff y bayesian para blindar ranking (castigar los de voto único por más frescos que sean)
    n_eff_agg AS (
        SELECT 
            se.option_id,
            COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id)) as Entity_N_Eff
        FROM public.signal_events se
        WHERE se.signal_type_code = 'VERSUS_SIGNAL' AND se.option_id IS NOT NULL
        GROUP BY se.option_id
    )
    SELECT 
        v_stats_version as stats_version,
        b.entity_id,
        b.entity_name,
        b.raw_wins_weight,
        b.decayed_wins_weight,
        b.temporal_decay_applied,
        b.decay_rank,
        ROUND(COALESCE(n.Entity_N_Eff, 0), 2) as n_eff,
        -- Bayesian sobre decay mass asumiendo prior 0.5 y m=5
        ROUND(((COALESCE(n.Entity_N_Eff, 0) * (b.decayed_wins_weight / NULLIF(b.raw_wins_weight,0))) + (5.0 * 0.5)) / (COALESCE(n.Entity_N_Eff, 0) + 5.0), 4) as bayesian_score_corrected
    FROM base_decay b
    LEFT JOIN n_eff_agg n ON b.entity_id = n.option_id
    ORDER BY b.decayed_wins_weight DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
