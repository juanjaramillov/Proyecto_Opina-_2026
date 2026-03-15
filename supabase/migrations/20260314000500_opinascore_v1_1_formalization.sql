-- =========================================================================
-- OPINA+ / BLOQUE 5.1: Cierre Matemático OpinaScore v1.1
-- =========================================================================

BEGIN;

-- 1. Nuevos Tipos
DROP TYPE IF EXISTS opinascore_breakdown CASCADE;
CREATE TYPE opinascore_breakdown AS (
    opinascore_base NUMERIC,
    integrity_multiplier NUMERIC,
    opinascore_final NUMERIC,
    context TEXT,
    version TEXT
);

DROP TYPE IF EXISTS b2b_premium_output CASCADE;
CREATE TYPE b2b_premium_output AS (
    entity_id UUID,
    opinascore_value NUMERIC,
    opinascore_base NUMERIC,
    integrity_multiplier NUMERIC,
    opinascore_version TEXT,
    opinascore_context TEXT,
    eligibility_status TEXT,
    eligibility_reasons TEXT[],
    integrity_score NUMERIC,
    integrity_flags TEXT[],
    n_eff NUMERIC,
    technical_tie_flag BOOLEAN,
    stability_label TEXT,
    entropy_normalized NUMERIC,
    decay_applied BOOLEAN,
    stats_version TEXT
);

-- 2. Reescribir calculate_opinascore_v1
DROP FUNCTION IF EXISTS calculate_opinascore_v1(UUID, TEXT, UUID);

CREATE OR REPLACE FUNCTION calculate_opinascore_v1_1(
    p_entity_id UUID,
    p_module_type TEXT,
    p_option_id UUID DEFAULT NULL
)
RETURNS opinascore_breakdown AS $$
DECLARE
    v_total_weight NUMERIC;
    v_n_eff NUMERIC;
    v_opt_weight NUMERIC;
    
    v_bayesian_prior NUMERIC := 0.5;
    v_bayesian_m NUMERIC := 10.0;
    v_score_b NUMERIC;
    
    v_lower NUMERIC;
    v_upper NUMERIC;
    v_w_width NUMERIC;
    v_tie_flag BOOLEAN;
    v_fragile BOOLEAN;
    v_mass NUMERIC;
    
    v_entropy_norm NUMERIC;
    v_integrity NUMERIC;
    
    -- Variables para el breakdown
    v_base_score NUMERIC := 0;
    v_multiplier NUMERIC := 1.0;
    v_final NUMERIC := 0;
    
    v_breakdown opinascore_breakdown;
BEGIN
    IF p_module_type NOT IN ('versus', 'news', 'depth') THEN
        v_breakdown.opinascore_base := 0;
        v_breakdown.integrity_multiplier := 1.0;
        v_breakdown.opinascore_final := 0;
        v_breakdown.context := 'unknown';
        v_breakdown.version := 'v1.1';
        RETURN v_breakdown;
    END IF;

    -- Obtenemos Integridad
    SELECT integrity_score INTO v_integrity FROM get_analytical_integrity_flags(p_entity_id);
    v_multiplier := v_integrity / 100.0;
    
    v_breakdown.integrity_multiplier := ROUND(v_multiplier, 4);
    v_breakdown.context := p_module_type;
    v_breakdown.version := 'v1.1';

    IF p_module_type = 'versus' AND p_option_id IS NOT NULL THEN
        SELECT SUM(effective_weight),
               COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_total_weight, v_n_eff
        FROM public.signal_events 
        WHERE battle_id = p_entity_id AND option_id IS NOT NULL;
        
        SELECT COALESCE(SUM(effective_weight), 0) INTO v_opt_weight
        FROM public.signal_events
        WHERE battle_id = p_entity_id AND option_id = p_option_id;
        
        IF COALESCE(v_total_weight, 0) > 0 THEN
            v_score_b := ((v_n_eff * (v_opt_weight / v_total_weight)) + (v_bayesian_m * v_bayesian_prior)) / (v_n_eff + v_bayesian_m);
            
            SELECT lower_bound, upper_bound, technical_tie_flag, is_fragile, mass_to_revert
            INTO v_lower, v_upper, v_tie_flag, v_fragile, v_mass
            FROM calculate_wilson_interval_weighted(v_total_weight, v_n_eff, v_opt_weight);
            
            v_w_width := v_upper - v_lower;
            
            v_base_score := v_score_b * 1000.0;
            
            IF v_w_width > 0.1 THEN
                v_base_score := v_base_score - (300.0 * (v_w_width - 0.1));
            END IF;
            
            v_base_score := GREATEST(0.0, v_base_score);
        END IF;

    ELSIF p_module_type = 'news' THEN
        SELECT SUM(effective_weight) INTO v_opt_weight
        FROM public.signal_events
        WHERE (entity_id = p_entity_id OR battle_id = p_entity_id) AND module_type = 'news'
        GROUP BY value_text
        ORDER BY SUM(effective_weight) DESC LIMIT 1;
        
        SELECT SUM(effective_weight),
               COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_total_weight, v_n_eff
        FROM public.signal_events 
        WHERE (entity_id = p_entity_id OR battle_id = p_entity_id) AND module_type = 'news';
        
        IF COALESCE(v_total_weight, 0) > 0 THEN
            SELECT entropy_normalized INTO v_entropy_norm FROM get_opinion_entropy_stats(p_entity_id, FALSE);
            
            v_score_b := ((v_n_eff * (v_opt_weight / v_total_weight)) + (v_bayesian_m * v_bayesian_prior)) / (v_n_eff + v_bayesian_m);
            v_base_score := v_score_b * 1000.0;
            
            v_base_score := v_base_score - (400.0 * COALESCE(v_entropy_norm, 1.0));
            v_base_score := GREATEST(0.0, v_base_score);
        END IF;

    ELSIF p_module_type = 'depth' THEN
        SELECT SUM(effective_weight),
               AVG(value_numeric),
               COUNT(DISTINCT user_id)
        INTO v_total_weight, v_score_b, v_n_eff
        FROM public.signal_events 
        WHERE (entity_id = p_entity_id OR battle_id = p_entity_id) AND module_type = 'depth' AND value_numeric IS NOT NULL;
        
        IF COALESCE(v_total_weight, 0) > 0 AND v_score_b IS NOT NULL THEN
            v_base_score := ((v_n_eff * v_score_b) + (10.0 * 5.5)) / (v_n_eff + 10.0);
            v_base_score := ((v_base_score - 1.0) / 9.0) * 1000.0;
            v_base_score := GREATEST(0.0, v_base_score);
        END IF;
    END IF;
    
    v_final := v_base_score * v_multiplier;
    
    v_breakdown.opinascore_base := ROUND(v_base_score, 1);
    v_breakdown.opinascore_final := ROUND(v_final, 1);
    
    RETURN v_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Reescribir get_premium_eligibility para devolver b2b_premium_output
DROP FUNCTION IF EXISTS get_premium_eligibility(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_premium_eligibility_v1_1(
    p_entity_id UUID, 
    p_module_type TEXT
)
RETURNS SETOF b2b_premium_output AS $$
DECLARE
    v_n_eff NUMERIC;
    v_total NUMERIC;
    v_tie_flag BOOLEAN := false;
    
    v_integrity NUMERIC;
    v_flag_device_concentration BOOLEAN;
    v_flag_velocity_burst BOOLEAN;
    v_flag_repetitive_pattern BOOLEAN;
    
    v_breakdown opinascore_breakdown;
    
    v_out b2b_premium_output;
    v_reasons TEXT[] := ARRAY[]::TEXT[];
    v_flags TEXT[] := ARRAY[]::TEXT[];
    
    v_min_n_eff_premium NUMERIC := 100.0;
    v_min_n_eff_exploratory NUMERIC := 30.0;
    v_min_integrity NUMERIC := 90.0;
    v_min_opinascore NUMERIC := 300.0;
BEGIN
    v_out.entity_id := p_entity_id;
    v_out.stats_version := 'v1.1';
    
    -- 1. Obtener n_eff y Tie Flag
    IF p_module_type = 'versus' THEN
        SELECT COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_n_eff FROM public.signal_events WHERE battle_id = p_entity_id AND option_id IS NOT NULL;
        
        -- Verificar si alguna opción tiene flag
        IF v_n_eff > 0 THEN
            SELECT bool_or(b2b.technical_tie_flag) INTO v_tie_flag 
            FROM (
                SELECT option_id, SUM(effective_weight) as opt_weight
                FROM public.signal_events 
                WHERE battle_id = p_entity_id AND option_id IS NOT NULL
                GROUP BY option_id
            ) opt
            CROSS JOIN LATERAL calculate_wilson_interval_weighted(
                (SELECT SUM(effective_weight) FROM public.signal_events WHERE battle_id = p_entity_id AND option_id IS NOT NULL), 
                v_n_eff, 
                opt.opt_weight
            ) b2b;
            
            -- OpinaScore para versus: Tomamos la primera opción solo de referencia para la batalla global
            SELECT (calculate_opinascore_v1_1(p_entity_id, 'versus', option_id)).* INTO v_breakdown
            FROM public.signal_events WHERE battle_id = p_entity_id AND option_id IS NOT NULL
            GROUP BY option_id ORDER BY SUM(effective_weight) DESC LIMIT 1;
        ELSE
            SELECT (calculate_opinascore_v1_1(p_entity_id, 'versus', NULL)).* INTO v_breakdown;
        END IF;
    ELSE
        SELECT COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_n_eff FROM public.signal_events WHERE (battle_id = p_entity_id OR entity_id = p_entity_id);
        
        SELECT (calculate_opinascore_v1_1(p_entity_id, p_module_type)).* INTO v_breakdown;
    END IF;
    
    v_out.n_eff := COALESCE(v_n_eff, 0);
    v_out.technical_tie_flag := v_tie_flag;
    
    v_out.opinascore_value := v_breakdown.opinascore_final;
    v_out.opinascore_base := v_breakdown.opinascore_base;
    v_out.integrity_multiplier := v_breakdown.integrity_multiplier;
    v_out.opinascore_version := v_breakdown.version;
    v_out.opinascore_context := v_breakdown.context;

    -- 2. Integridad Analítica
    SELECT integrity_score, flag_device_concentration, flag_velocity_burst, flag_repetitive_pattern
    INTO v_integrity, v_flag_device_concentration, v_flag_velocity_burst, v_flag_repetitive_pattern
    FROM get_analytical_integrity_flags(p_entity_id);
    
    v_out.integrity_score := v_integrity;
    IF v_flag_device_concentration THEN v_flags := array_append(v_flags, 'DEVICE_CONCENTRATION_DETECTED'); END IF;
    IF v_flag_velocity_burst THEN v_flags := array_append(v_flags, 'VELOCITY_BURST_DETECTED'); END IF;
    IF v_flag_repetitive_pattern THEN v_flags := array_append(v_flags, 'REPETITIVE_PATTERN_DETECTED'); END IF;
    v_out.integrity_flags := v_flags;

    -- Entropía solo aplica a topics/news
    IF p_module_type = 'news' THEN
        SELECT entropy_normalized INTO v_out.entropy_normalized FROM get_opinion_entropy_stats(p_entity_id, FALSE);
    END IF;

    -- 3. Pipeline de Elegibilidad ("PUBLISHABLE", "EXPLORATORY", "INTERNAL_ONLY")
    v_out.eligibility_status := 'PUBLISHABLE';
    
    IF v_integrity < 50 THEN
        v_reasons := array_append(v_reasons, 'Low Integrity Score (<50)');
        v_out.eligibility_status := 'INTERNAL_ONLY';
    END IF;

    IF v_out.n_eff < v_min_n_eff_exploratory THEN
        v_reasons := array_append(v_reasons, FORMAT('Insufficient n_eff (%s < %s)', ROUND(v_out.n_eff, 1), v_min_n_eff_exploratory));
        v_out.eligibility_status := 'INTERNAL_ONLY';
    ELSIF v_out.n_eff < v_min_n_eff_premium THEN
        IF v_out.eligibility_status = 'PUBLISHABLE' THEN
            v_reasons := array_append(v_reasons, FORMAT('n_eff adequate for Exploratory but not Premium (%s < %s)', ROUND(v_out.n_eff, 1), v_min_n_eff_premium));
            v_out.eligibility_status := 'EXPLORATORY';
        END IF;
    END IF;
    
    IF v_tie_flag AND v_out.eligibility_status = 'PUBLISHABLE' THEN
        v_reasons := array_append(v_reasons, 'Technical Tie Detected');
        v_out.eligibility_status := 'EXPLORATORY';
    END IF;
    
    IF v_out.opinascore_value < v_min_opinascore AND v_out.eligibility_status = 'PUBLISHABLE' THEN
         v_reasons := array_append(v_reasons, 'OpinaScore below premium threshold');
         v_out.eligibility_status := 'EXPLORATORY';
    END IF;

    -- Validaciones Intermedias en caso de que Integrity esté entre 50 y 90 (no publicable)
    IF v_integrity >= 50 AND v_integrity < 90 AND v_out.eligibility_status = 'PUBLISHABLE' THEN
        v_reasons := array_append(v_reasons, 'Integrity Score below premium threshold (<90)');
        v_out.eligibility_status := 'EXPLORATORY';
    END IF;

    v_out.eligibility_reasons := v_reasons;
    
    RETURN NEXT v_out;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
