-- =========================================================================
-- OPINA+ / BLOQUE 5: OPINASCORE V1, HEURÍSTICAS ANTIFRAUDE Y ELEGIBILIDAD PREMIUM
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. HEURÍSTICAS ANTIFRAUDE (ANALYTICAL INTEGRITY FLAGS)
-- -------------------------------------------------------------------------
-- Analiza la salud del dato para detectar posibles manipulaciones (bots, brigading)
CREATE OR REPLACE FUNCTION get_analytical_integrity_flags(p_entity_id UUID)
RETURNS TABLE (
    integrity_score NUMERIC,
    flag_device_concentration BOOLEAN,
    flag_velocity_burst BOOLEAN,
    flag_repetitive_pattern BOOLEAN,
    analysis_warning_label TEXT
) AS $$
DECLARE
    v_total_24h NUMERIC := 0;
    v_max_device_pct NUMERIC := 0;
    v_burst_detected BOOLEAN := false;
    v_repetitive_detected BOOLEAN := false;
    v_integrity NUMERIC := 100.0;
    v_label TEXT := 'CLEAN';
    
    -- Variables auxiliares para promedios de velocidad
    v_avg_signals_per_hour NUMERIC := 0;
    v_max_signals_15m NUMERIC := 0;
BEGIN
    -- Obtenemos el volumen total de las ultimas 24h para esta entidad (sea battle, topic o brand)
    SELECT COALESCE(SUM(effective_weight), 0) INTO v_total_24h
    FROM public.signal_events 
    WHERE (battle_id = p_entity_id OR entity_id = p_entity_id)
      AND created_at >= NOW() - INTERVAL '24 hours';

    IF v_total_24h > 0 THEN
        -- Heurística A: Concentración de Device/Sesión
        -- Revisamos si una sola sesión agrupa demasiado peso efectivo en las ultimas 24h
        SELECT (MAX(device_sum) / v_total_24h) INTO v_max_device_pct
        FROM (
            SELECT COALESCE(session_id, user_id::text, 'unknown') as actor, 
                   SUM(effective_weight) as device_sum
            FROM public.signal_events
            WHERE (battle_id = p_entity_id OR entity_id = p_entity_id)
              AND created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY actor
        ) sq;

        IF v_max_device_pct > 0.35 THEN
            -- Más del 35% de la masa en las últimas 24h vino de una sola sesión = Bandera Roja
            flag_device_concentration := true;
            v_integrity := v_integrity - 40.0;
        ELSE
            flag_device_concentration := false;
        END IF;

        -- Heurística B: Velocity Burst (Ráfagas inusuales)
        -- Promedio histórico por hora (simplificado a los últimos 7 días)
        SELECT COALESCE(COUNT(*)::numeric / 168.0, 0) INTO v_avg_signals_per_hour
        FROM public.signal_events
        WHERE (battle_id = p_entity_id OR entity_id = p_entity_id)
          AND created_at >= NOW() - INTERVAL '7 days';

        -- Máximo volumen en cualquier ventana de 15 minutos en las ultimas 2h
        SELECT COALESCE(MAX(c), 0) INTO v_max_signals_15m
        FROM (
            SELECT date_trunc('hour', created_at) + date_part('minute', created_at)::int / 15 * interval '15 min' AS window_15m,
                   COUNT(*) as c
            FROM public.signal_events
            WHERE (battle_id = p_entity_id OR entity_id = p_entity_id)
              AND created_at >= NOW() - INTERVAL '2 hours'
            GROUP BY window_15m
        ) sq;

        -- Si en 15 minutos tuvimos 5 veces el volumen de una hora normal (y el volumen no es trivial > 10)
        IF v_max_signals_15m > (v_avg_signals_per_hour * 5.0) AND v_max_signals_15m > 10 THEN
            v_burst_detected := true;
            v_integrity := v_integrity - 30.0;
        END IF;

        -- Heurística C: Repetitive Pattern (patrones en cuentas smurf)
        -- En este MVP penalizamos si notamos exactamente el mismo context_id o signal_type_code 
        -- ingresado mas de 20 veces en una hora por cuentas anónimas.
        SELECT EXISTS (
            SELECT 1 FROM public.signal_events
            WHERE (battle_id = p_entity_id OR entity_id = p_entity_id)
              AND created_at >= NOW() - INTERVAL '1 hour'
              AND user_id IS NULL
            GROUP BY session_id
            HAVING COUNT(*) > 20
        ) INTO v_repetitive_detected;

        IF v_repetitive_detected THEN
            v_integrity := v_integrity - 20.0;
        END IF;

    ELSE
        -- Si no hay volumen reciente, las banderas son falsas
        flag_device_concentration := false;
        v_burst_detected := false;
        v_repetitive_detected := false;
    END IF;

    -- Clamp de integridad (nunca negativo)
    IF v_integrity < 0 THEN v_integrity := 0; END IF;

    -- Asignación de Label
    IF v_integrity < 50 THEN
        v_label := 'CRITICAL_WARNING';
    ELSIF v_integrity < 90 THEN
        v_label := 'MODERATE_WARNING';
    ELSE
        v_label := 'CLEAN';
    END IF;

    RETURN QUERY SELECT 
        v_integrity,
        COALESCE(flag_device_concentration, false),
        COALESCE(v_burst_detected, false),
        COALESCE(v_repetitive_detected, false),
        v_label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- 2. CALCULO DEL OPINASCORE V1 (Índice Compuesto [0-1000])
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_opinascore_v1(
    p_entity_id UUID,
    p_module_type TEXT,
    p_option_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_weight NUMERIC;
    v_n_eff NUMERIC;
    v_opt_weight NUMERIC;
    
    -- Variables Bayesianas (Misma lógica que B4 pero mapeada a Base-1000)
    v_bayesian_prior NUMERIC := 0.5;
    v_bayesian_m NUMERIC := 5.0;
    v_score_b NUMERIC;
    
    -- Variables Wilson
    v_lower NUMERIC;
    v_upper NUMERIC;
    v_tie_flag BOOLEAN;
    v_fragile BOOLEAN;
    v_mass NUMERIC;
    
    -- Entropía
    v_entropy_norm NUMERIC;
    
    -- Integridad
    v_integrity NUMERIC;
    
    -- Score Final Compuesto
    v_opinascore NUMERIC;
BEGIN
    -- Validar que module_type sea manejado
    IF p_module_type NOT IN ('versus', 'news', 'depth') THEN
        RETURN 0.0;
    END IF;

    -- Verificar integridad
    SELECT integrity_score INTO v_integrity FROM get_analytical_integrity_flags(p_entity_id);

    IF p_module_type = 'versus' AND p_option_id IS NOT NULL THEN
        -- -----------------------------------------------------------
        -- COMPONENTE: VERSUS (COMPARATIVO SUMA-CERO)
        -- -----------------------------------------------------------
        
        -- Obtener totales de la batalla
        SELECT SUM(effective_weight),
               COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_total_weight, v_n_eff
        FROM public.signal_events 
        WHERE battle_id = p_entity_id AND option_id IS NOT NULL;
        
        -- Peso de la opción objetivo
        SELECT COALESCE(SUM(effective_weight), 0) INTO v_opt_weight
        FROM public.signal_events
        WHERE battle_id = p_entity_id AND option_id = p_option_id;
        
        IF COALESCE(v_total_weight, 0) = 0 THEN RETURN 0.0; END IF;

        -- 1. Promedio Bayesiano mapeado al rango 0-1 (Prioriza 50% si hay pocos datos)
        v_score_b := ((v_n_eff * (v_opt_weight / v_total_weight)) + (v_bayesian_m * v_bayesian_prior)) / (v_n_eff + v_bayesian_m);
        
        -- 2. Penalidad por Incerteza (Bandas Wilson)
        SELECT lower_bound, upper_bound, technical_tie_flag, is_fragile, mass_to_revert
        INTO v_lower, v_upper, v_tie_flag, v_fragile, v_mass
        FROM calculate_wilson_interval_weighted(v_total_weight, v_n_eff, v_opt_weight);
        
        -- Fórmula Compuesta para Versus
        -- Base 70% (Bayesiano) + Penalización por ancho de banda wilson (max -20%) + Bonus estabilidad (hasta +10%)
        -- Todo escalado a 1000
        
        v_opinascore := (v_score_b * 700.0); -- 70% Base
        
        -- Si las bandas son muy anchas (> 0.2 de diferencia), restamos proporcionalmente
        IF (v_upper - v_lower) > 0.2 THEN
            v_opinascore := v_opinascore - LEAST(200.0, ((v_upper - v_lower) * 200.0));
        END IF;

        -- Bonus Estabilidad: Si tiene masa firme de reversión
        v_opinascore := v_opinascore + LEAST(100.0, (v_mass * 1.5));

        -- Castigo Integridad
        v_opinascore := v_opinascore * (v_integrity / 100.0);

        RETURN ROUND(v_opinascore, 1);
        
    ELSIF p_module_type = 'news' THEN
        -- -----------------------------------------------------------
        -- COMPONENTE: ACTUALIDAD (MÓDULO REACTIVO - CONTEXTUAL)
        -- -----------------------------------------------------------
        -- Para 'news' el OpinaScore mide la fortaleza general del Tópico. No hay option_id.
        -- Medimos la fuerza de la opinión dominante y penalizamos por alta fragmentación (entropía)
        
        -- Obtenemos el líder (la opción más votada)
        SELECT SUM(effective_weight) INTO v_opt_weight
        FROM public.signal_events
        WHERE entity_id = p_entity_id OR battle_id = p_entity_id
        GROUP BY value_text
        ORDER BY SUM(effective_weight) DESC LIMIT 1;
        
        SELECT SUM(effective_weight),
               COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_total_weight, v_n_eff
        FROM public.signal_events 
        WHERE (entity_id = p_entity_id OR battle_id = p_entity_id) AND module_type = 'news';
        
        IF COALESCE(v_total_weight, 0) = 0 THEN RETURN 0.0; END IF;
        
        -- Extraer entropía de Shannon ($H_{norm}$)
        SELECT entropy_normalized INTO v_entropy_norm FROM get_opinion_entropy_stats(p_entity_id, FALSE);
        
        -- Bayesiano (60%)
        v_score_b := ((v_n_eff * (v_opt_weight / v_total_weight)) + (v_bayesian_m * v_bayesian_prior)) / (v_n_eff + v_bayesian_m);
        v_opinascore := (v_score_b * 600.0);
        
        -- Entropía Modifier (40%). 0 de Entropía suma los 400 puntos. 1 de entropía no suma nada.
        v_opinascore := v_opinascore + ((1.0 - COALESCE(v_entropy_norm, 1.0)) * 400.0);
        
        -- Castigo Integridad
        v_opinascore := v_opinascore * (v_integrity / 100.0);

        RETURN ROUND(v_opinascore, 1);
        
    ELSIF p_module_type = 'depth' THEN
        -- -----------------------------------------------------------
        -- COMPONENTE: DEPTH (PERCEPTUAL BRANDING SCORE)
        -- -----------------------------------------------------------
        -- Escala re-mapeada de 1-10 a 0-1000 usando promedios de sesgo de masa sobre n_eff
        
        SELECT SUM(effective_weight),
               AVG(value_numeric),
               COUNT(DISTINCT user_id)
        INTO v_total_weight, v_score_b, v_n_eff
        FROM public.signal_events 
        WHERE (entity_id = p_entity_id OR battle_id = p_entity_id) AND module_type = 'depth' AND value_numeric IS NOT NULL;
        
        IF COALESCE(v_total_weight, 0) = 0 THEN RETURN 0.0; END IF;
        
        -- El Score Base es el promedio de (1-10) remapeado a (100-1000). Prior: 5.5, m=10.0 (se necesita muestra más firme en encuestas)
        v_opinascore := ((v_n_eff * v_score_b) + (10.0 * 5.5)) / (v_n_eff + 10.0);
        v_opinascore := v_opinascore * 100.0; -- Escala de 10 a 1000
        
        -- Castigo Integridad
        v_opinascore := v_opinascore * (v_integrity / 100.0);

        RETURN ROUND(v_opinascore, 1);
    END IF;
    
    RETURN 0.0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- 3. MOTOR DE ELEGIBILIDAD PREMIUM B2B
-- -------------------------------------------------------------------------
-- Define oficialmente si una entidad puede ser consumida a nivel Enterprise.
CREATE OR REPLACE FUNCTION get_premium_eligibility(
    p_entity_id UUID, 
    p_module_type TEXT
)
RETURNS TABLE (
    eligibility_label TEXT,
    is_exportable BOOLEAN,
    reasons_blocked JSONB,
    opinascore_reference NUMERIC
) AS $$
DECLARE
    v_n_eff NUMERIC;
    v_total NUMERIC;
    v_integrity NUMERIC;
    v_tie_flag BOOLEAN := false;
    v_label TEXT := 'PUBLISHABLE';
    v_exportable BOOLEAN := true;
    v_reasons JSONB := '[]'::jsonb;
    v_opinascore NUMERIC := 0;
    
    -- Variables para Thresholds configurables
    v_min_n_eff_premium NUMERIC := 100.0;
    v_min_n_eff_exploratory NUMERIC := 30.0;
    v_min_integrity NUMERIC := 90.0;
    v_min_opinascore NUMERIC := 300.0;
BEGIN
    -- 1. Obtener Métricas Generales
    IF p_module_type = 'versus' THEN
        SELECT COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_n_eff FROM public.signal_events WHERE battle_id = p_entity_id AND option_id IS NOT NULL;
        
        -- Calculamos tie flag revisando cualquier opcion lider. Si hay empates, v_tie_flag se prende
        SELECT bool_or(technical_tie_flag) INTO v_tie_flag 
        FROM (
            SELECT b2b.technical_tie_flag 
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
            ) b2b
        ) sq;
        
        -- Intentar traer OpinaScore de la primera opcion sólo de referencia para la entidad general
        SELECT calculate_opinascore_v1(p_entity_id, 'versus', option_id) INTO v_opinascore
        FROM public.signal_events WHERE battle_id = p_entity_id AND option_id IS NOT NULL
        GROUP BY option_id ORDER BY SUM(effective_weight) DESC LIMIT 1;
    ELSE
        SELECT COALESCE(SUM(effective_weight)^2 / NULLIF(SUM(effective_weight^2), 0), COUNT(DISTINCT user_id))
        INTO v_n_eff FROM public.signal_events WHERE (battle_id = p_entity_id OR entity_id = p_entity_id);
        
        v_opinascore := calculate_opinascore_v1(p_entity_id, p_module_type);
    END IF;
    
    v_n_eff := COALESCE(v_n_eff, 0);
    
    -- 2. Obtener Integridad
    SELECT integrity_score INTO v_integrity FROM get_analytical_integrity_flags(p_entity_id);

    -- 3. Pipeline de Decisión Reversa
    IF v_integrity < v_min_integrity THEN
        v_reasons := v_reasons || jsonb_build_string('Low Integrity Score (<90)');
        v_label := 'INTERNAL_ONLY';
        v_exportable := false;
    END IF;

    IF v_n_eff < v_min_n_eff_exploratory THEN
        v_reasons := v_reasons || jsonb_build_string(FORMAT('Insufficient n_eff (v_n_eff=%s < %s)', ROUND(v_n_eff, 1), v_min_n_eff_exploratory));
        v_label := 'INTERNAL_ONLY';
        v_exportable := false;
    ELSIF v_n_eff < v_min_n_eff_premium THEN
        IF v_label = 'PUBLISHABLE' THEN
            v_reasons := v_reasons || jsonb_build_string(FORMAT('n_eff adequate for Exploratory but not Premium (v_n_eff=%s)', ROUND(v_n_eff, 1)));
            v_label := 'EXPLORATORY';
            -- Seguimos dejandolo como exportable, pero requerimos advertencia premium
        END IF;
    END IF;

    IF v_tie_flag AND v_label = 'PUBLISHABLE' THEN
        v_reasons := v_reasons || jsonb_build_string('Technical Tie Detected');
        v_label := 'EXPLORATORY';
    END IF;
    
    IF v_opinascore < v_min_opinascore AND v_label = 'PUBLISHABLE' THEN
         v_reasons := v_reasons || jsonb_build_string('OpinaScore below premium threshold');
         v_label := 'EXPLORATORY';
    END IF;

    RETURN QUERY SELECT 
        v_label,
        v_exportable,
        v_reasons,
        v_opinascore;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
