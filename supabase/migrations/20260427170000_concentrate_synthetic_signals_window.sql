-- =====================================================================
-- Migration: 20260427170000_concentrate_synthetic_signals_window.sql
-- Purpose:
--   Concentrar signals sintéticos en una ventana corta (default 7 días)
--   en vez de los 60 días originales. Los resolvers de métricas leen el
--   rollup del último día (LIMIT 1) y aplican un umbral mínimo de 30
--   battles. Con 60 días la densidad cae a ~7/día/entidad → "Masa
--   crítica insuficiente". Con 7 días sube a ~60/día/entidad → suficiente.
--
-- Cambio:
--   regenerate_synthetic_signals_for_rollups ahora acepta un parámetro
--   opcional p_days_window (default 7). Los timestamps de los signals
--   se generan como now() - random() * interval 'N days'.
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
    v_winner_option_id uuid;
    v_loser_option_id uuid;
    v_winner_entity_id uuid;
    v_loser_entity_id uuid;
    v_rounds_per_user int;
    v_round_idx int;
    v_random_signal_at timestamptz;
    v_signals_added int := 0;
    v_signals_deleted int := 0;
    v_users_processed int := 0;
    v_active_battles int;
    v_rollup_result jsonb;
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

    PERFORM public._seed_synthetic_entities();

    SELECT COUNT(*) INTO v_active_battles
    FROM public.battles b
    WHERE b.status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.battle_options bo
        WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
      );

    IF v_active_battles = 0 THEN
        RAISE EXCEPTION 'NO_ACTIVE_BATTLES_WITH_ENTITIES' USING ERRCODE = 'P0002';
    END IF;

    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado' USING ERRCODE = 'P0002';
    END IF;

    -- 1) Borrar signals existentes del batch
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
      AND meta->>'batch' = p_label;
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Regenerar signals concentrados en los últimos p_days_window días
    FOR v_user_record IN
        SELECT u.user_id, u.created_at AS user_created_at
        FROM public.users u
        WHERE u.synthetic_batch_label = p_label
          AND u.is_synthetic = true
    LOOP
        v_users_processed := v_users_processed + 1;
        v_rounds_per_user := 5 + floor(random() * 16)::int;

        FOR v_round_idx IN 1..v_rounds_per_user LOOP
            WITH chosen_battle AS (
                SELECT b.id AS battle_id
                FROM public.battles b
                WHERE b.status = 'active'
                  AND EXISTS (
                    SELECT 1 FROM public.battle_options bo
                    WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
                  )
                ORDER BY random() LIMIT 1
            ),
            shuffled_options AS (
                SELECT bo.id AS option_id, bo.brand_id AS entity_id, row_number() OVER (ORDER BY random()) AS rn
                FROM public.battle_options bo
                JOIN chosen_battle cb ON cb.battle_id = bo.battle_id
                WHERE bo.brand_id IS NOT NULL
            )
            SELECT
                (SELECT battle_id FROM chosen_battle),
                (SELECT option_id FROM shuffled_options WHERE rn = 1),
                (SELECT option_id FROM shuffled_options WHERE rn = 2),
                (SELECT entity_id FROM shuffled_options WHERE rn = 1),
                (SELECT entity_id FROM shuffled_options WHERE rn = 2)
            INTO v_battle_id, v_winner_option_id, v_loser_option_id, v_winner_entity_id, v_loser_entity_id;

            EXIT WHEN v_battle_id IS NULL OR v_winner_option_id IS NULL OR v_loser_option_id IS NULL;

            -- CAMBIO CLAVE: ventana corta (últimos p_days_window días) en
            -- lugar de el rango completo desde user_created_at.
            v_random_signal_at := now() - (random() * (p_days_window || ' days')::interval);

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
                jsonb_build_object('option_id', v_winner_option_id, 'outcome', 'win'),
                1, v_winner_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', p_label, 'role', 'winner'),
                v_random_signal_at, v_random_signal_at,
                'CL', 'versus'
            );

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
                v_battle_id, v_loser_option_id, v_loser_entity_id, 'brand',
                'versus', v_versus_signal_type_id,
                1.0,
                jsonb_build_object('option_id', v_loser_option_id, 'outcome', 'loss'),
                0, v_loser_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', p_label, 'role', 'loser'),
                v_random_signal_at, v_random_signal_at,
                'CL', 'versus'
            );

            v_signals_added := v_signals_added + 2;
            v_battle_id := NULL; v_winner_option_id := NULL; v_loser_option_id := NULL;
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
        'rollup_result', v_rollup_result
    );
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
