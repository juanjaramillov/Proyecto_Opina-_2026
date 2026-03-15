-- =========================================================================
-- OPINA+ / MEJORA BLOQUE 2: ROBUSTEZ ESTADÍSTICA v2.1
-- Implementación endurecida con N_EFFECTIVE, parametrización explícita
-- y versión estadísca persistente en la salida.
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. FUNCIÓN INTERNA: CÁLCULO DE INTERVALO DE WILSON (USANDO P_HAT y N_EFF)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_wilson_interval_weighted(
    p_hat NUMERIC,
    n_eff NUMERIC,
    p_z NUMERIC DEFAULT 1.96
) RETURNS jsonb AS $$
DECLARE
    z_sq NUMERIC;
    denom NUMERIC;
    term_1 NUMERIC;
    term_2_base NUMERIC;
    term_2 NUMERIC;
    ci_lower NUMERIC := 0;
    ci_upper NUMERIC := 0;
BEGIN
    IF n_eff <= 0 THEN
        RETURN jsonb_build_object('ci_lower', 0, 'ci_upper', 0);
    END IF;

    z_sq := p_z * p_z;
    denom := 1 + (z_sq / n_eff);
    term_1 := p_hat + (z_sq / (2 * n_eff));
    term_2_base := (p_hat * (1 - p_hat) / n_eff) + (z_sq / (4 * n_eff * n_eff));
    
    IF term_2_base < 0 THEN term_2_base := 0; END IF;
    term_2 := p_z * sqrt(term_2_base);

    ci_lower := (term_1 - term_2) / denom;
    ci_upper := (term_1 + term_2) / denom;

    IF ci_lower < 0 THEN ci_lower := 0; END IF;
    IF ci_upper > 1 THEN ci_upper := 1; END IF;

    RETURN jsonb_build_object('ci_lower', round(ci_lower, 4), 'ci_upper', round(ci_upper, 4));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------------------------
-- 2. LEADERBOARD BAYESIANO PARAMETRIZABLE
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_b2b_bayesian_leaderboard(
    p_category VARCHAR DEFAULT NULL,
    p_m NUMERIC DEFAULT 20.0,
    p_prior NUMERIC DEFAULT NULL
) RETURNS TABLE (
    entity_id UUID,
    entity_name TEXT,
    raw_wins_weight NUMERIC,
    total_effective_weight NUMERIC,
    n_eff NUMERIC,
    raw_score_pct NUMERIC,
    bayesian_score_pct NUMERIC,
    bayesian_prior NUMERIC,
    bayesian_m NUMERIC,
    stats_version TEXT,
    bayesian_rank INT
) AS $$
DECLARE
    v_global_avg NUMERIC := 0.5;
    v_prior NUMERIC;
BEGIN
    -- Permitir override del prior. Si no, calcular transversal (muy costoso pero preciso) o usar default
    IF p_prior IS NULL THEN
        SELECT COALESCE(
            SUM(case when winner = entity_id then effective_weight else 0 end) / NULLIF(SUM(effective_weight), 0), 
            0.5
        ) INTO v_global_avg
        FROM (
            SELECT option_id as winner, effective_weight, option_id as option_candidate FROM public.signal_events
            UNION ALL
            SELECT (value_json->>'loser_option_id')::uuid as loser, effective_weight, option_id as option_candidate FROM public.signal_events WHERE signal_type_code = 'VERSUS_SIGNAL'
        ) as stats;
        v_prior := v_global_avg;
    ELSE
        v_prior := p_prior;
    END IF;

    RETURN QUERY
    WITH base_stats AS (
        SELECT
            se.option_id as entity_uuid,
            SUM(se.effective_weight) as wins_weight,
            (SELECT SUM(se2.effective_weight) FROM public.signal_events se2 WHERE se2.option_id = se.option_id OR se2.value_json->>'loser_option_id' = se.option_id::text) as total_weight,
            
            -- Calculo aproximado de N efectivo absoluto para la entidad
            (SELECT SUM(se2.effective_weight)*SUM(se2.effective_weight) / NULLIF(SUM(se2.effective_weight * se2.effective_weight), 0) FROM public.signal_events se2 WHERE se2.option_id = se.option_id OR se2.value_json->>'loser_option_id' = se.option_id::text) as calc_n_eff
            
        FROM public.signal_events se
        WHERE se.signal_type_code = 'VERSUS_SIGNAL' 
        GROUP BY se.option_id
    )
    SELECT 
        bs.entity_uuid as entity_id,
        'Entidad ID ' || bs.entity_uuid::TEXT as entity_name,
        bs.wins_weight as raw_wins_weight,
        bs.total_weight as total_effective_weight,
        COALESCE(round(bs.calc_n_eff, 2), 0) as n_eff,
        round((bs.wins_weight / NULLIF(bs.total_weight, 0)), 4) as raw_score_pct,
        round(
            ((COALESCE(bs.calc_n_eff, 0) * (bs.wins_weight / NULLIF(bs.total_weight, 0))) + (p_m * v_prior)) / NULLIF((COALESCE(bs.calc_n_eff, 0) + p_m), 0), 4
        ) as bayesian_score_pct,
        round(v_prior, 4) as bayesian_prior,
        p_m as bayesian_m,
        'v2.2-Weighted'::TEXT as stats_version,
        row_number() over (order by (((COALESCE(bs.calc_n_eff, 0) * (bs.wins_weight / NULLIF(bs.total_weight, 0))) + (p_m * v_prior)) / NULLIF((COALESCE(bs.calc_n_eff, 0) + p_m), 0)) desc nulls last)::int as bayesian_rank
    FROM base_stats bs
    WHERE bs.total_weight > 0
    ORDER BY bayesian_score_pct DESC;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- 3. RESULTADOS BINARIOS ROBUSTOS ESTABILIDAD + WILSON N_EFF
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_robust_versus_stats(
    p_battle_id UUID
) RETURNS TABLE (
    battle_uuid UUID,
    option_id UUID,
    raw_effective_wins NUMERIC,
    total_effective_weight NUMERIC,
    n_eff NUMERIC,
    raw_win_rate NUMERIC,
    ci_lower NUMERIC,
    ci_upper NUMERIC,
    technical_tie_flag BOOLEAN,
    mass_to_revert NUMERIC,
    stability_label TEXT,
    stats_version TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH battle_totals AS (
        SELECT 
            SUM(effective_weight) as t_weight,
            SUM(effective_weight * effective_weight) as t_weight_sq
        FROM public.signal_events
        WHERE battle_id = p_battle_id
    ),
    option_stats as (
        SELECT 
            se.battle_id,
            se.option_id,
            SUM(se.effective_weight) as raw_effective_wins,
            (SELECT t_weight FROM battle_totals) as total_effective_weight,
            ROUND( (SELECT t_weight FROM battle_totals) * (SELECT t_weight FROM battle_totals) / NULLIF((SELECT t_weight_sq FROM battle_totals), 0), 2) as calc_n_eff
        FROM public.signal_events se
        WHERE se.battle_id = p_battle_id
        GROUP BY se.battle_id, se.option_id
    )
    SELECT 
        os.battle_id,
        os.option_id,
        os.raw_effective_wins,
        os.total_effective_weight,
        COALESCE(os.calc_n_eff, 0) as n_eff,
        ROUND(os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), 4) as raw_win_rate,
        
        (calculate_wilson_interval_weighted(
            os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), 
            COALESCE(os.calc_n_eff, 0)
        )->>'ci_lower')::NUMERIC as ci_lower,
        
        (calculate_wilson_interval_weighted(
            os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), 
            COALESCE(os.calc_n_eff, 0)
        )->>'ci_upper')::NUMERIC as ci_upper,

        -- Flag de empate técnico si las bandas cruzan 0.5
        ((calculate_wilson_interval_weighted(os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), COALESCE(os.calc_n_eff, 0))->>'ci_lower')::NUMERIC <= 0.5 AND 
         (calculate_wilson_interval_weighted(os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), COALESCE(os.calc_n_eff, 0))->>'ci_upper')::NUMERIC >= 0.5) as technical_tie_flag,
        
        -- Mass to revert
        CASE WHEN os.raw_effective_wins > (os.total_effective_weight / 2) 
             THEN os.raw_effective_wins - (os.total_effective_weight - os.raw_effective_wins)
             ELSE (os.total_effective_weight - os.raw_effective_wins) - os.raw_effective_wins 
        END as mass_to_revert,

        -- Etiquetado Compuesto (Tie + Inercia)
        CASE 
            WHEN ((calculate_wilson_interval_weighted(os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), COALESCE(os.calc_n_eff, 0))->>'ci_lower')::NUMERIC <= 0.5 AND 
                  (calculate_wilson_interval_weighted(os.raw_effective_wins / NULLIF(os.total_effective_weight, 0), COALESCE(os.calc_n_eff, 0))->>'ci_upper')::NUMERIC >= 0.5) THEN 'empate técnico'
            WHEN ((CASE WHEN os.raw_effective_wins > (os.total_effective_weight / 2) THEN os.raw_effective_wins - (os.total_effective_weight - os.raw_effective_wins) ELSE (os.total_effective_weight - os.raw_effective_wins) - os.raw_effective_wins END) / NULLIF(os.total_effective_weight, 0)) < 0.05 THEN 'frágil'
            WHEN ((CASE WHEN os.raw_effective_wins > (os.total_effective_weight / 2) THEN os.raw_effective_wins - (os.total_effective_weight - os.raw_effective_wins) ELSE (os.total_effective_weight - os.raw_effective_wins) - os.raw_effective_wins END) / NULLIF(os.total_effective_weight, 0)) < 0.15 THEN 'probable'
            ELSE 'robusto'
        END as stability_label,

        'v2.2-Weighted'::TEXT as stats_version

    FROM option_stats os;
END;
$$ LANGUAGE plpgsql;

COMMIT;
