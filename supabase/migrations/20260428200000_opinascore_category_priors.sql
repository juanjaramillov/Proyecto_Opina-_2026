-- =========================================================================
-- _proposed_opinascore_category_priors.sql
-- =========================================================================
-- Propuesta · 2026-04-28 · ronda Gemini Deep Research sobre OpinaScore.
--
-- ESTADO: NO APLICAR AUTOMÁTICAMENTE.
--   Este archivo usa el prefijo `_proposed_` siguiendo la convención de
--   `_rollback_*` y `_optional_*`. Supabase CLI lo ignora en `db push`
--   porque no comienza con timestamp.
--
-- CÓMO APLICAR (cuando estés listo):
--   1. Renombrá este archivo a `<TIMESTAMP>_opinascore_category_priors.sql`
--      con un timestamp posterior al último (ej: 20260429000000).
--   2. Ejecutá `supabase db push` desde la raíz del repo.
--   3. Después: `NOTIFY pgrst, 'reload schema';` en SQL Editor para
--      refrescar el cache de PostgREST (regla de proyecto).
--   4. Ejecutá `SELECT public.recompute_category_priors();` para sembrar
--      los priors iniciales desde el histórico.
--
-- QUÉ HACE:
--   - Crea tabla `opinascore_category_priors`.
--   - Crea función `recompute_category_priors()` que pobla la tabla.
--   - Crea función `get_category_prior(category_id)` que devuelve el prior
--     a usar, con fallback a 0.5/m=10 si la categoría no tiene prior.
--   - Crea función `calculate_opinascore_v1_2(...)` idéntica a v1.1 pero
--     usando prior por categoría. La v1.1 sigue funcionando intacta.
--   - Agrega comentario sobre cómo migrar consumidores a v1.2.
--
-- NO HACE:
--   - NO toca `calculate_opinascore_v1_1`. La función original queda
--     intacta para garantizar rollback trivial.
--   - NO modifica vistas ni RPCs que ya consumen v1.1.
--   - NO reemplaza la integration en frontend. El switchover lo decidís
--     vos cambiando los call sites de `calculate_opinascore_v1_1` →
--     `calculate_opinascore_v1_2` cuando estés conforme con los priors.
--
-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.calculate_opinascore_v1_2(uuid, text, uuid);
--   DROP FUNCTION IF EXISTS public.get_category_prior(uuid);
--   DROP FUNCTION IF EXISTS public.recompute_category_priors();
--   DROP TABLE IF EXISTS public.opinascore_category_priors;
-- =========================================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) Tabla opinascore_category_priors
-- ------------------------------------------------------------
-- Un row por categoría con su prior bayesiano y el peso m.
-- Historizable: cada recálculo updatea el row vía UPSERT, sin perder
-- trazabilidad si se quiere agregar tabla de historial después.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opinascore_category_priors (
    category_id        uuid PRIMARY KEY REFERENCES public.categories(id) ON DELETE CASCADE,
    prior_score        numeric NOT NULL CHECK (prior_score >= 0 AND prior_score <= 1),
    prior_weight_m     numeric NOT NULL CHECK (prior_weight_m > 0),
    sample_size        integer NOT NULL CHECK (sample_size >= 0),
    -- 'historical': computado desde signal_events del último período (default).
    -- 'manual':     editado manualmente por admin (futuro).
    -- 'fallback':   no había datos suficientes; se asignó prior=0.5/m=10.
    source             text    NOT NULL DEFAULT 'historical' CHECK (source IN ('historical','manual','fallback')),
    last_computed_at   timestamptz NOT NULL DEFAULT now(),
    notes              text
);

ALTER TABLE public.opinascore_category_priors OWNER TO postgres;

COMMENT ON TABLE public.opinascore_category_priors IS
'Prior bayesiano por categoría usado por calculate_opinascore_v1_2. Reemplaza el prior universal 0.5 + m=10 hardcoded en v1.1.';

COMMENT ON COLUMN public.opinascore_category_priors.prior_score IS
'Promedio histórico de WPS para esta categoría (0-1). Sirve como ancla bayesiana para entidades nuevas.';

COMMENT ON COLUMN public.opinascore_category_priors.prior_weight_m IS
'Peso del prior. Más alto = el prior pesa más vs. la observación. Default histórico=10.';

COMMENT ON COLUMN public.opinascore_category_priors.sample_size IS
'Cantidad de batallas o señales que respaldan este prior. Si <30, source debería ser fallback.';

-- RLS: tabla read-only para authenticated; escritura solo service_role.
ALTER TABLE public.opinascore_category_priors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "category_priors_select" ON public.opinascore_category_priors;
CREATE POLICY "category_priors_select"
    ON public.opinascore_category_priors
    FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "category_priors_no_write" ON public.opinascore_category_priors;
CREATE POLICY "category_priors_no_write"
    ON public.opinascore_category_priors
    FOR ALL
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

REVOKE ALL ON TABLE public.opinascore_category_priors FROM PUBLIC;
GRANT  SELECT ON TABLE public.opinascore_category_priors TO authenticated, anon;
GRANT  SELECT, INSERT, UPDATE, DELETE ON TABLE public.opinascore_category_priors TO service_role;


-- ------------------------------------------------------------
-- 2) Función: recompute_category_priors
-- ------------------------------------------------------------
-- Recalcula los priors históricos por categoría desde signal_events.
-- Invocar manualmente o vía cron mensual.
--
-- Estrategia:
--   - Para cada categoría, calcular el promedio ponderado de WPS de
--     todas las opciones ganadoras de las batallas de esa categoría
--     (módulo versus, últimos 90 días).
--   - Si la categoría tiene < 30 muestras: source='fallback' con
--     prior=0.5, m=10.
--   - Si tiene >= 30 muestras: source='historical' con prior calculado
--     y m proporcional (sqrt de la muestra capeado a 50).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_category_priors(
    p_lookback_days integer DEFAULT 90
) RETURNS TABLE(
    category_id uuid,
    new_prior_score numeric,
    new_prior_weight_m numeric,
    sample_size integer,
    source text
)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_lookback timestamptz := now() - (p_lookback_days || ' days')::interval;
BEGIN
    -- Cálculo: por cada categoría, el promedio del WPS de la opción ganadora
    -- en cada batalla (la opción con mayor effective_weight) sobre el total
    -- de la batalla. Ese WPS ganador, promediado entre batallas, da el prior.
    --
    -- Esto refleja "qué tan dominante suele ser el ganador" en la categoría.
    -- En categorías muy reñidas (delivery, telcos) el prior será bajo (~0.4).
    -- En categorías polarizadas (rivalidades clásicas) será alto (~0.7).

    WITH battle_winners AS (
        SELECT
            b.category_id,
            b.id AS battle_id,
            -- WPS de la opción más votada en cada batalla
            MAX(SUM(se.effective_weight)) OVER (PARTITION BY b.id) /
                NULLIF(SUM(se.effective_weight) OVER (PARTITION BY b.id), 0) AS winner_wps
        FROM public.battles b
        JOIN public.signal_events se ON se.battle_id = b.id
        WHERE b.category_id IS NOT NULL
          AND se.created_at >= v_lookback
          AND se.option_id IS NOT NULL
        GROUP BY b.category_id, b.id, se.option_id, se.effective_weight
    ),
    cat_stats AS (
        SELECT
            bw.category_id,
            AVG(DISTINCT bw.winner_wps)::numeric AS avg_wps,
            COUNT(DISTINCT bw.battle_id)::integer AS n_battles
        FROM battle_winners bw
        WHERE bw.winner_wps IS NOT NULL
        GROUP BY bw.category_id
    ),
    upsert_data AS (
        SELECT
            c.id AS category_id,
            CASE
                WHEN cs.n_battles >= 30 THEN cs.avg_wps
                ELSE 0.5
            END AS prior_score,
            CASE
                WHEN cs.n_battles >= 30 THEN LEAST(50.0, GREATEST(10.0, sqrt(cs.n_battles)::numeric))
                ELSE 10.0
            END AS prior_weight_m,
            COALESCE(cs.n_battles, 0) AS sample_size,
            CASE
                WHEN cs.n_battles >= 30 THEN 'historical'
                ELSE 'fallback'
            END AS source
        FROM public.categories c
        LEFT JOIN cat_stats cs ON cs.category_id = c.id
    )
    INSERT INTO public.opinascore_category_priors AS p (
        category_id, prior_score, prior_weight_m, sample_size, source, last_computed_at
    )
    SELECT
        ud.category_id,
        ROUND(ud.prior_score, 4),
        ROUND(ud.prior_weight_m, 2),
        ud.sample_size,
        ud.source,
        now()
    FROM upsert_data ud
    ON CONFLICT (category_id) DO UPDATE SET
        prior_score = EXCLUDED.prior_score,
        prior_weight_m = EXCLUDED.prior_weight_m,
        sample_size = EXCLUDED.sample_size,
        source = EXCLUDED.source,
        last_computed_at = EXCLUDED.last_computed_at;

    -- Devolver el resultado para auditoría
    RETURN QUERY
    SELECT
        p.category_id,
        p.prior_score,
        p.prior_weight_m,
        p.sample_size,
        p.source
    FROM public.opinascore_category_priors p
    ORDER BY p.last_computed_at DESC, p.category_id;
END;
$$;

ALTER FUNCTION public.recompute_category_priors(integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.recompute_category_priors(integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.recompute_category_priors(integer) TO service_role;

COMMENT ON FUNCTION public.recompute_category_priors(integer) IS
'Recalcula priors bayesianos por categoría desde signal_events (últimos N días). Invocar manualmente o vía cron mensual. Solo service_role.';


-- ------------------------------------------------------------
-- 3) Helper: get_category_prior
-- ------------------------------------------------------------
-- Devuelve el (prior_score, prior_weight_m) a usar para una categoría.
-- Si no hay row en opinascore_category_priors, fallback a 0.5/10 (estado
-- actual de v1.1).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_prior(
    p_category_id uuid
) RETURNS TABLE(
    prior_score numeric,
    prior_weight_m numeric,
    source text
)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
    SELECT
        COALESCE(p.prior_score, 0.5)       AS prior_score,
        COALESCE(p.prior_weight_m, 10.0)   AS prior_weight_m,
        COALESCE(p.source, 'fallback')     AS source
    FROM (SELECT 1) AS dummy
    LEFT JOIN public.opinascore_category_priors p
      ON p.category_id = p_category_id;
$$;

ALTER FUNCTION public.get_category_prior(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_category_prior(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_category_prior(uuid) TO authenticated, anon, service_role;


-- ------------------------------------------------------------
-- 4) calculate_opinascore_v1_2
-- ------------------------------------------------------------
-- Idéntica a v1.1 pero usa prior por categoría. v1.1 queda intacta.
-- El switchover en producción lo controla el frontend cambiando el
-- nombre de la función llamada vía RPC.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_opinascore_v1_2(
    p_entity_id UUID,
    p_module_type TEXT,
    p_option_id UUID DEFAULT NULL
)
RETURNS opinascore_breakdown AS $$
DECLARE
    v_total_weight NUMERIC;
    v_n_eff NUMERIC;
    v_opt_weight NUMERIC;

    v_bayesian_prior NUMERIC;
    v_bayesian_m NUMERIC;
    v_prior_source TEXT;
    v_score_b NUMERIC;

    v_lower NUMERIC;
    v_upper NUMERIC;
    v_w_width NUMERIC;
    v_tie_flag BOOLEAN;
    v_fragile BOOLEAN;
    v_mass NUMERIC;

    v_entropy_norm NUMERIC;
    v_integrity NUMERIC;

    v_base_score NUMERIC := 0;
    v_multiplier NUMERIC := 1.0;
    v_final NUMERIC := 0;

    v_breakdown opinascore_breakdown;
    v_category_id UUID;
BEGIN
    IF p_module_type NOT IN ('versus', 'news', 'depth') THEN
        v_breakdown.opinascore_base := 0;
        v_breakdown.integrity_multiplier := 1.0;
        v_breakdown.opinascore_final := 0;
        v_breakdown.context := 'unknown';
        v_breakdown.version := 'v1.2';
        RETURN v_breakdown;
    END IF;

    -- Resolver category_id según el tipo de módulo.
    IF p_module_type = 'versus' THEN
        SELECT category_id INTO v_category_id FROM public.battles WHERE id = p_entity_id;
    ELSE
        -- Para news/depth, el p_entity_id puede ser battle o entity.
        -- Intentamos primero battle; si no, entities.category (text) → mapping
        -- queda fuera de scope acá; usamos NULL como fallback (→ prior 0.5/10).
        SELECT category_id INTO v_category_id FROM public.battles WHERE id = p_entity_id;
    END IF;

    -- Resolver prior bayesiano según categoría
    IF p_module_type IN ('versus', 'news') THEN
        SELECT prior_score, prior_weight_m, source
        INTO v_bayesian_prior, v_bayesian_m, v_prior_source
        FROM public.get_category_prior(v_category_id);
    ELSE
        -- Depth usa prior fijo 5.5 (centro de escala 1-10)
        v_bayesian_prior := 5.5;
        v_bayesian_m := 10.0;
        v_prior_source := 'depth_fixed';
    END IF;

    -- Integridad
    SELECT integrity_score INTO v_integrity FROM get_analytical_integrity_flags(p_entity_id);
    v_multiplier := v_integrity / 100.0;

    v_breakdown.integrity_multiplier := ROUND(v_multiplier, 4);
    v_breakdown.context := p_module_type || ':prior=' || v_prior_source;
    v_breakdown.version := 'v1.2';

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
            v_base_score := ((v_n_eff * v_score_b) + (v_bayesian_m * v_bayesian_prior)) / (v_n_eff + v_bayesian_m);
            v_base_score := ((v_base_score - 1.0) / 9.0) * 1000.0;
            v_base_score := GREATEST(0.0, v_base_score);
        END IF;
    END IF;

    v_final := v_base_score * v_multiplier;

    v_breakdown.opinascore_base := ROUND(v_base_score, 1);
    v_breakdown.opinascore_final := ROUND(v_final, 1);

    RETURN v_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path TO 'public', 'pg_temp';

ALTER FUNCTION public.calculate_opinascore_v1_2(uuid, text, uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.calculate_opinascore_v1_2(uuid, text, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.calculate_opinascore_v1_2(uuid, text, uuid) TO authenticated, anon, service_role;

COMMENT ON FUNCTION public.calculate_opinascore_v1_2(uuid, text, uuid) IS
'OpinaScore v1.2: idéntica a v1.1 excepto que usa prior bayesiano por categoría (vía get_category_prior) en lugar de 0.5 fijo. v1.1 sigue funcionando intacta.';


-- ------------------------------------------------------------
-- 5) Sembrar priors iniciales con fallback
-- ------------------------------------------------------------
-- Insertar un row por cada categoría existente con source='fallback' y
-- prior=0.5/m=10. La primera ejecución de recompute_category_priors()
-- los sobrescribirá con valores históricos cuando haya >=30 batallas.
-- ------------------------------------------------------------
INSERT INTO public.opinascore_category_priors (category_id, prior_score, prior_weight_m, sample_size, source)
SELECT id, 0.5, 10.0, 0, 'fallback'
FROM public.categories
ON CONFLICT (category_id) DO NOTHING;


COMMIT;


-- ------------------------------------------------------------
-- POST-DEPLOYMENT (ejecutar manualmente en SQL Editor):
-- ------------------------------------------------------------
-- 1. NOTIFY pgrst, 'reload schema';
--    -- Refresca cache de PostgREST (regla de proyecto Opina+).
--
-- 2. SELECT * FROM public.recompute_category_priors(90);
--    -- Pobla los priors con datos históricos. Inspeccionar el output:
--    -- categorías con sample_size >= 30 deberían tener source='historical'
--    -- y un prior_score distinto de 0.5.
--
-- 3. (Opcional) crear cron mensual en _optional_cron_recompute_priors.sql:
--    SELECT cron.schedule('recompute_category_priors_monthly',
--                         '0 3 1 * *',
--                         $$ SELECT public.recompute_category_priors(90); $$);
--
-- 4. SWITCHOVER frontend:
--    -- En el código frontend que llame a calculate_opinascore_v1_1,
--    -- reemplazar por calculate_opinascore_v1_2 archivo por archivo,
--    -- validando visualmente que los scores nuevos sean razonables.
--    -- Si algún score sale muy distinto al de v1.1, investigar el prior
--    -- de su categoría (puede estar mal calculado).
-- ------------------------------------------------------------
