-- =====================================================================
-- Migration: 20260427210000_filter_comparative_view_min_sample.sql
-- Purpose:
--   La vista v_comparative_preference_summary incluía entities con
--   apenas 1 signal (ej. Similac, Banmédica) que terminaban en el
--   ranking con win_rate=1.0 y desplazaban a entities con sample real.
--
--   El resolver getTopLeaderFromLeaderboard hace
--   `.order('win_rate', desc).limit(2)` y se llevaba esos ruidos. Después
--   metricAvailability detectaba sampleSize=1 < minSample=50 y bloqueaba
--   la card con "Masa crítica insuficiente".
--
-- Fix:
--   Filtrar en la vista las entities con menos de 30 comparisons totales
--   (alineado con ANALYTICS_MINIMUM_COHORT en src/read-models/analytics/
--   metricPolicies.ts). Las entities ruido salen de la vista; el resolver
--   pasa a tomar entities con sample real (las sintéticas con 383+).
--
-- Nota: la definición es idéntica al archivo
-- 20260313220000_fix_results_views.sql líneas 6-42 (verificada antes de
-- recrear), excepto por el filtro adicional en la cláusula WHERE final.
-- =====================================================================

BEGIN;

CREATE OR REPLACE VIEW "public"."v_comparative_preference_summary" AS
 WITH "wins" AS (
         SELECT "s"."entity_id",
            "count"("s"."id") AS "wins_count",
            "sum"("s"."effective_weight") AS "weighted_wins"
           FROM ("public"."signal_events" "s"
             JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
          WHERE ("st"."code" = ANY (ARRAY['VERSUS_SIGNAL'::"text", 'PROGRESSIVE_SIGNAL'::"text"]))
          GROUP BY "s"."entity_id"
        ), "losses" AS (
         SELECT (NULLIF(("s"."value_json" ->> 'loser_entity_id'::"text"), ''::"text"))::"uuid" AS "entity_id",
            "count"("s"."id") AS "losses_count",
            "sum"("s"."effective_weight") AS "weighted_losses"
           FROM ("public"."signal_events" "s"
             JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
          WHERE (("st"."code" = ANY (ARRAY['VERSUS_SIGNAL'::"text", 'PROGRESSIVE_SIGNAL'::"text"])) AND (("s"."value_json" ->> 'loser_entity_id'::"text") IS NOT NULL) AND (("s"."value_json" ->> 'loser_entity_id'::"text") <> ''::"text"))
          GROUP BY (NULLIF(("s"."value_json" ->> 'loser_entity_id'::"text"), ''::"text"))::"uuid"
        )
 SELECT COALESCE("w"."entity_id", "l"."entity_id") AS "entity_id",
    "e"."name" AS "entity_name",
    COALESCE("w"."wins_count", (0)::bigint) AS "wins_count",
    COALESCE("l"."losses_count", (0)::bigint) AS "losses_count",
    COALESCE("w"."weighted_wins", (0)::numeric) AS "weighted_wins",
    COALESCE("l"."weighted_losses", (0)::numeric) AS "weighted_losses",
    (COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) AS "total_comparisons",
        CASE
            WHEN ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) > 0) THEN "round"((((COALESCE("w"."wins_count", (0)::bigint))::numeric / ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)))::numeric) * 100.0), 2)
            ELSE (0)::numeric
        END AS "preference_share",
        CASE
            WHEN ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) > 0) THEN ((COALESCE("w"."wins_count", (0)::bigint))::numeric / ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)))::numeric)
            ELSE (0)::numeric
        END AS "win_rate"
   FROM (("wins" "w"
     FULL JOIN "losses" "l" ON (("w"."entity_id" = "l"."entity_id")))
     JOIN "public"."entities" "e" ON ((COALESCE("w"."entity_id", "l"."entity_id") = "e"."id")))
  WHERE ("e"."is_active" = true)
    -- ÚNICO CAMBIO vs definición original: filtrar entities con sample
    -- insuficiente para evitar que ruido (1-2 comparisons) ocupe el
    -- ranking por encima de entities con datos reales.
    AND ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) >= 30);

NOTIFY pgrst, 'reload schema';

COMMIT;
