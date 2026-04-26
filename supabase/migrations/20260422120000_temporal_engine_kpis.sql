-- Migration: Motor Temporal (Fase 2)
-- Agrega las funciones para leer "Película" de la preferencia (Tendencia, Aceleración, Volatilidad)

CREATE OR REPLACE FUNCTION "public"."calculate_temporal_movie"(
    "p_battle_id" "uuid",
    "p_bucket_type" "text" DEFAULT 'day' -- 'day', 'week', 'month'
)
RETURNS TABLE (
    "time_bucket" timestamp with time zone,
    "option_id" uuid,
    "option_label" text,
    "n_eff" bigint,
    "share_pct" numeric,
    "tendencia" numeric,
    "aceleracion" numeric,
    "volatilidad" numeric,
    "persistencia" integer
)
LANGUAGE "sql" STABLE
AS $$

WITH buckets AS (
    -- 1. Agrupar señales por ventana de tiempo y opción
    SELECT 
        date_trunc(p_bucket_type, se.created_at) AS t_bucket,
        se.option_id,
        COUNT(*) AS n_eff,
        SUM(COALESCE(se.signal_weight, 1.0)) AS w_signals
    FROM public.signal_events se
    WHERE se.battle_id = p_battle_id
    GROUP BY 1, 2
),
bucket_totals AS (
    -- 2. Calcular el total ponderado por cada ventana temporal (para sacar shares)
    SELECT 
        t_bucket,
        SUM(w_signals) AS total_w
    FROM buckets
    GROUP BY 1
),
shares AS (
    -- 3. Calcular Share of Preference por ventana temporal
    SELECT 
        b.t_bucket,
        b.option_id,
        bo.label AS option_label,
        b.n_eff,
        CASE WHEN bt.total_w > 0 THEN ROUND((b.w_signals / bt.total_w) * 100, 2) ELSE 0 END AS share_pct
    FROM buckets b
    JOIN bucket_totals bt ON b.t_bucket = bt.t_bucket
    JOIN public.battle_options bo ON b.option_id = bo.id
),
tendencies AS (
    -- 4. Funciones de ventana para la Tendencia y Volatilidad
    SELECT
        t_bucket,
        option_id,
        option_label,
        n_eff,
        share_pct,
        -- Tendencia: Diferencia con el share del periodo anterior
        share_pct - LAG(share_pct, 1) OVER (PARTITION BY option_id ORDER BY t_bucket) AS tendencia,
        -- Volatilidad: Desviación estándar del share en los últimos 4 periodos
        COALESCE(ROUND(STDDEV_POP(share_pct) OVER (PARTITION BY option_id ORDER BY t_bucket ROWS BETWEEN 3 PRECEDING AND CURRENT ROW), 2), 0) AS volatilidad
    FROM shares
),
accelerations AS (
    -- 5. Calcular Aceleración (Delta de Tendencia) y valores previos para Persistencia
    SELECT
        t_bucket,
        option_id,
        option_label,
        n_eff,
        share_pct,
        tendencia,
        tendencia - LAG(tendencia, 1) OVER (PARTITION BY option_id ORDER BY t_bucket) AS aceleracion,
        volatilidad,
        LAG(tendencia, 1) OVER (PARTITION BY option_id ORDER BY t_bucket) AS t_1,
        LAG(tendencia, 2) OVER (PARTITION BY option_id ORDER BY t_bucket) AS t_2,
        LAG(tendencia, 3) OVER (PARTITION BY option_id ORDER BY t_bucket) AS t_3
    FROM tendencies
)
-- 6. Calcular Persistencia (Rachas simples de hasta 4 periodos) y armar tabla final
SELECT
    t_bucket AS time_bucket,
    option_id,
    option_label,
    n_eff,
    share_pct,
    COALESCE(tendencia, 0) AS tendencia,
    COALESCE(aceleracion, 0) AS aceleracion,
    volatilidad,
    -- Persistencia simplificada: Cuántos periodos consecutivos lleva con el mismo signo
    CASE 
        WHEN tendencia > 0 THEN
            1 + CASE WHEN COALESCE(t_1, 0) > 0 THEN 
                    1 + CASE WHEN COALESCE(t_2, 0) > 0 THEN 
                            1 + CASE WHEN COALESCE(t_3, 0) > 0 THEN 1 ELSE 0 END
                        ELSE 0 END
                ELSE 0 END
        WHEN tendencia < 0 THEN
            1 + CASE WHEN COALESCE(t_1, 0) < 0 THEN 
                    1 + CASE WHEN COALESCE(t_2, 0) < 0 THEN 
                            1 + CASE WHEN COALESCE(t_3, 0) < 0 THEN 1 ELSE 0 END
                        ELSE 0 END
                ELSE 0 END
        ELSE 0 
    END AS persistencia
FROM accelerations
ORDER BY time_bucket DESC, share_pct DESC;

$$;
