-- Redefine analytical views to use the correct entities table
-- The original views were pointing to 'signal_entities' which is empty.
-- We redirect them to 'entities' which contains the active brand data.

-- 1. Update v_comparative_preference_summary
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
  WHERE ("e"."is_active" = true);


-- 2. Update v_depth_entity_question_summary
CREATE OR REPLACE VIEW "public"."v_depth_entity_question_summary" AS
 SELECT "e"."id" AS "entity_id",
    "e"."name" AS "entity_name",
    ("s"."value_json" ->> 'question_code'::"text") AS "question_code",
    ("s"."value_json" ->> 'question_label'::"text") AS "question_label",
    ("s"."value_json" ->> 'response_type'::"text") AS "response_type",
    "count"("s"."id") AS "total_responses",
    "count"("s"."value_numeric") AS "numeric_response_count",
    "round"("avg"("s"."value_numeric"), 2) AS "average_score",
    "count"(
        CASE
            WHEN ("s"."value_boolean" = true) THEN 1
            ELSE NULL::integer
        END) AS "boolean_true_count",
    "count"(
        CASE
            WHEN ("s"."value_boolean" = false) THEN 1
            ELSE NULL::integer
        END) AS "boolean_false_count",
        CASE
            WHEN ("max"(("s"."value_json" ->> 'response_type'::"text")) = 'scale_0_10'::"text") THEN "round"((((("count"(
            CASE
                WHEN ("s"."value_numeric" >= (9)::numeric) THEN 1
                ELSE NULL::integer
            END))::numeric / (NULLIF("count"("s"."value_numeric"), 0))::numeric) - (("count"(
            CASE
                WHEN ("s"."value_numeric" <= (6)::numeric) THEN 1
                ELSE NULL::integer
            END))::numeric / (NULLIF("count"("s"."value_numeric"), 0))::numeric)) * 100.0), 2)
            ELSE NULL::numeric
        END AS "nps_score",
    "max"("s"."created_at") AS "last_signal_at"
   FROM (("public"."entities" "e"
     JOIN "public"."signal_events" "s" ON (("e"."id" = "s"."entity_id")))
     JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
  WHERE (("st"."code" = 'DEPTH_SIGNAL'::"text") AND ("e"."is_active" = true) AND (("s"."value_json" ->> 'question_code'::"text") IS NOT NULL))
  GROUP BY "e"."id", "e"."name", ("s"."value_json" ->> 'question_code'::"text"), ("s"."value_json" ->> 'question_label'::"text"), ("s"."value_json" ->> 'response_type'::"text");


-- 3. Update v_trend_week_over_week
CREATE OR REPLACE VIEW "public"."v_trend_week_over_week" AS
 WITH "current_week" AS (
         SELECT "signal_events"."entity_id",
            "count"(*) AS "current_signal_count"
           FROM "public"."signal_events"
          WHERE (("signal_events"."created_at" >= ("now"() - '7 days'::interval)) AND ("signal_events"."entity_id" IS NOT NULL))
          GROUP BY "signal_events"."entity_id"
        ), "previous_week" AS (
         SELECT "signal_events"."entity_id",
            "count"(*) AS "previous_signal_count"
           FROM "public"."signal_events"
          WHERE (("signal_events"."created_at" >= ("now"() - '14 days'::interval)) AND ("signal_events"."created_at" < ("now"() - '7 days'::interval)) AND ("signal_events"."entity_id" IS NOT NULL))
          GROUP BY "signal_events"."entity_id"
        )
 SELECT "e"."id" AS "entity_id",
    "e"."name" AS "entity_name",
    COALESCE("cw"."current_signal_count", (0)::bigint) AS "current_signal_count",
    COALESCE("pw"."previous_signal_count", (0)::bigint) AS "previous_signal_count",
        CASE
            WHEN (COALESCE("pw"."previous_signal_count", (0)::bigint) = 0) THEN (100)::numeric
            ELSE "round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / ("pw"."previous_signal_count")::numeric) * (100)::numeric), 2)
        END AS "delta_percentage",
        CASE
            WHEN (COALESCE("cw"."current_signal_count", (0)::bigint) < 10) THEN 'insuficiente'::"text"
            WHEN ((COALESCE("pw"."previous_signal_count", (0)::bigint) = 0) AND (COALESCE("cw"."current_signal_count", (0)::bigint) >= 10)) THEN 'acelerando'::"text"
            WHEN ("round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / (NULLIF("pw"."previous_signal_count", 0))::numeric) * (100)::numeric), 2) >= (15)::numeric) THEN 'acelerando'::"text"
            WHEN ("round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / (NULLIF("pw"."previous_signal_count", 0))::numeric) * (100)::numeric), 2) <= ('-15'::integer)::numeric) THEN 'bajando'::"text"
            ELSE 'estable'::"text"
        END AS "trend_status"
   FROM (("public"."entities" "e"
     LEFT JOIN "current_week" "cw" ON (("e"."id" = "cw"."entity_id")))
     LEFT JOIN "previous_week" "pw" ON (("e"."id" = "pw"."entity_id")))
  WHERE (("cw"."current_signal_count" > 0) OR ("pw"."previous_signal_count" > 0));
