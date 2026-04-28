-- =====================================================================
-- Migration: 20260427200000_fix_synthetic_signal_view_contract.sql
-- Purpose:
--   El seeder generaba 2 signals por ronda (winner + loser), pero la
--   vista v_comparative_preference_summary cuenta TODO signal_event con
--   VERSUS_SIGNAL como "win" para su entity_id, y solo cuenta "losses"
--   cuando value_json.loser_entity_id está presente. Resultado: con la
--   forma vieja todas las entities terminan con win_rate=1.0.
--
-- Fix verificado contra la definición real de la vista
-- (20260313220000_fix_results_views.sql líneas 7-22):
--   1 signal por ronda con:
--     - entity_id = winner_entity_id
--     - value_numeric = 1
--     - value_json.loser_entity_id = loser_entity_id_uuid
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.regenerate_synthetic_signals_for_rollups(
    p_label text,
    p_days_window int DEFAULT 7
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_batch_id uuid;
    v_versus_signal_type_id bigint;
    v_user_record record;
    v_battle_id uuid;
    v_option_a_id uuid;
    v_option_b_id uuid;
    v_option_a_entity_id uuid;
    v_option_b_entity_id uuid;
    v_winner_option_id uuid;
    v_loser_option_id uuid;
    v_winner_entity_id uuid;
    v_loser_entity_id uuid;
    v_rounds_per_user int;
    v_round_idx int;
    v_random_signal_at timestamptz;
    v_a_wins_threshold numeric := 0.65;
    v_signals_added int := 0;
    v_signals_deleted int := 0;
    v_users_processed int := 0;
    v_active_synthetic_battles int;
    v_rollup_result jsonb;
    v_polluted_rollups int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    IF p_days_window < 1 OR p_days_window > 90 THEN
        RAISE EXCEPTION 'INVALID_DAYS_WINDOW: rango 1..90' USING ERRCODE = '22023';
    END IF;

    SELECT id INTO v_batch_id
    FROM public.synthetic_seed_batches
    WHERE label = p_label AND deleted_at IS NULL;

    IF v_batch_id IS NULL THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND_OR_DELETED: %', p_label USING ERRCODE = 'P0002';
    END IF;

    PERFORM public.ensure_synthetic_battles_exist();

    SELECT COUNT(*) INTO v_active_synthetic_battles
    FROM public.battles b
    WHERE b.status = 'active'
      AND b.is_synthetic = true
      AND EXISTS (
        SELECT 1 FROM public.battle_options bo
        WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
      );

    IF v_active_synthetic_battles = 0 THEN
        RAISE EXCEPTION 'NO_SYNTHETIC_BATTLES_WITH_ENTITIES' USING ERRCODE = 'P0002';
    END IF;

    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado' USING ERRCODE = 'P0002';
    END IF;

    -- 1) Borrar signals viejas del batch
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
      AND meta->>'batch' = p_label;
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Limpiar rollups corruptos en la ventana
    DELETE FROM public.analytics_daily_entity_rollup
    WHERE summary_date >= (CURRENT_DATE - (p_days_window || ' days')::interval)
      AND entity_id IN (
        SELECT id FROM public.entities WHERE is_synthetic = false
      );
    GET DIAGNOSTICS v_polluted_rollups = ROW_COUNT;

    -- 3) Regenerar signals: 1 signal por ronda con loser_entity_id en value_json
    FOR v_user_record IN
        SELECT u.user_id, u.created_at AS user_created_at
        FROM public.users u
        WHERE u.synthetic_batch_label = p_label
          AND u.is_synthetic = true
    LOOP
        v_users_processed := v_users_processed + 1;
        v_rounds_per_user := 5 + floor(random() * 16)::int;

        FOR v_round_idx IN 1..v_rounds_per_user LOOP
            -- Pick: synthetic battle activo + sus 2 opciones (sort_order 0 y 1)
            WITH chosen_battle AS (
                SELECT b.id AS battle_id
                FROM public.battles b
                WHERE b.status = 'active'
                  AND b.is_synthetic = true
                  AND EXISTS (
                    SELECT 1 FROM public.battle_options bo
                    WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
                  )
                ORDER BY random() LIMIT 1
            ),
            ordered_options AS (
                SELECT bo.id AS option_id, bo.brand_id AS entity_id, bo.sort_order
                FROM public.battle_options bo
                JOIN chosen_battle cb ON cb.battle_id = bo.battle_id
                WHERE bo.brand_id IS NOT NULL
                ORDER BY bo.sort_order
            )
            SELECT
                (SELECT battle_id FROM chosen_battle),
                (SELECT option_id FROM ordered_options LIMIT 1),
                (SELECT option_id FROM ordered_options OFFSET 1 LIMIT 1),
                (SELECT entity_id FROM ordered_options LIMIT 1),
                (SELECT entity_id FROM ordered_options OFFSET 1 LIMIT 1)
            INTO v_battle_id, v_option_a_id, v_option_b_id,
                 v_option_a_entity_id, v_option_b_entity_id;

            EXIT WHEN v_battle_id IS NULL OR v_option_a_id IS NULL OR v_option_b_id IS NULL;

            -- Bias: A (sort_order=0) gana 65% del tiempo
            IF random() < v_a_wins_threshold THEN
                v_winner_option_id := v_option_a_id;
                v_winner_entity_id := v_option_a_entity_id;
                v_loser_option_id := v_option_b_id;
                v_loser_entity_id := v_option_b_entity_id;
            ELSE
                v_winner_option_id := v_option_b_id;
                v_winner_entity_id := v_option_b_entity_id;
                v_loser_option_id := v_option_a_id;
                v_loser_entity_id := v_option_a_entity_id;
            END IF;

            v_random_signal_at := now() - (random() * (p_days_window || ' days')::interval);

            -- 1 SOLO signal: entity_id=winner, value_numeric=1, loser_entity_id en value_json
            INSERT INTO public.signal_events (
                anon_id, user_id, signal_id,
                battle_id, option_id, entity_id, entity_type,
                module_type, signal_type_id,
                signal_weight, value_json, value_numeric, value_text,
                meta, occurred_at, created_at,
                country, source_module
            ) VALUES (
                'synthetic-' || gen_random_uuid()::text,
                v_user_record.user_id, gen_random_uuid(),
                v_battle_id, v_winner_option_id, v_winner_entity_id, 'brand',
                'versus', v_versus_signal_type_id,
                1.0,
                jsonb_build_object(
                    'option_id', v_winner_option_id,
                    'outcome', 'win',
                    'loser_entity_id', v_loser_entity_id::text,
                    'loser_option_id', v_loser_option_id::text
                ),
                1, v_winner_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', p_label),
                v_random_signal_at, v_random_signal_at,
                'CL', 'versus'
            );

            v_signals_added := v_signals_added + 1;
            v_battle_id := NULL; v_option_a_id := NULL; v_option_b_id := NULL;
        END LOOP;
    END LOOP;

    UPDATE public.synthetic_seed_batches
    SET signal_count = v_signals_added
    WHERE id = v_batch_id;

    SELECT public.refresh_analytics_all_rollups(p_days_window + 1) INTO v_rollup_result;

    PERFORM public.log_admin_action(
        'regenerate_synthetic_signals_for_rollups',
        'synthetic_seed_batches',
        v_batch_id::text,
        jsonb_build_object(
            'label', p_label,
            'days_window', p_days_window,
            'users_processed', v_users_processed,
            'signals_deleted', v_signals_deleted,
            'signals_added', v_signals_added,
            'polluted_rollups_cleaned', v_polluted_rollups,
            'active_synthetic_battles', v_active_synthetic_battles,
            'rollup_result', v_rollup_result
        )
    );

    RETURN jsonb_build_object(
        'batch_id', v_batch_id,
        'label', p_label,
        'days_window', p_days_window,
        'users_processed', v_users_processed,
        'signals_deleted', v_signals_deleted,
        'signals_added', v_signals_added,
        'polluted_rollups_cleaned', v_polluted_rollups,
        'active_synthetic_battles', v_active_synthetic_battles,
        'rollup_result', v_rollup_result,
        'note', '1 signal por ronda con loser_entity_id en value_json (contrato de v_comparative_preference_summary)'
    );
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
