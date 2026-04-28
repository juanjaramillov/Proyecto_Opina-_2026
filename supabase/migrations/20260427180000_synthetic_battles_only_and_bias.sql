-- =====================================================================
-- Migration: 20260427180000_synthetic_battles_only_and_bias.sql
-- Purpose:
--   Corrige tres bugs del sistema sintético verificados con datos reales:
--
--   1. ensure_synthetic_battles_exist tenía un early-return cuando ya
--      existían battles reales, lo que evitaba que se crearan los 3
--      synthetic battles. Resultado: synthetic entities tampoco se
--      creaban (la función iteraba sobre is_synthetic=true → 0 filas).
--      Fix: la función siempre crea los 3 synthetic battles
--      idempotentemente, sin importar cuántos reales haya.
--
--   2. regenerate_synthetic_signals_for_rollups elegía battles activos
--      sin filtrar por is_synthetic, así que mezclaba synthetic con los
--      80 battles reales del seed_battles_from_entities. Spread de 2450
--      signals entre 160 entities reales → ~14 comparisons/entity, todas
--      debajo del minSample=50. Fix: filtrar a is_synthetic=true.
--
--   3. Sin winner bias, todas las entities terminan con win_rate ~50%.
--      Fix: cada synthetic option tiene un win_bias en sort_order
--      (sort_order=0 gana 65% del tiempo, sort_order=1 gana 35%) para
--      que el leaderboard tenga líder claro y no empate plano.
--
-- También limpia rollups corruptos: borra filas del rollup que tengan
-- entity_id apuntando a entities reales pero con datos generados por
-- los signals sintéticos (window últimos 7 días).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. ensure_synthetic_battles_exist (fix early-return)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_synthetic_battles_exist()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_battle_id uuid;
    v_seeded int := 0;
    v_entities_seeded int := 0;
    v_total_active int;
    v_specs jsonb := jsonb_build_array(
        jsonb_build_object(
            'slug', 'synthetic_reyes_del_bajon',
            'title', 'Reyes del Bajón',
            'description', 'Bebida favorita para el bajón de la noche.',
            'options', jsonb_build_array(
                jsonb_build_object('label', 'Coca-Cola', 'sort_order', 0),
                jsonb_build_object('label', 'Pepsi', 'sort_order', 1)
            )
        ),
        jsonb_build_object(
            'slug', 'synthetic_guerra_de_la_plata',
            'title', 'Guerra de la Plata',
            'description', 'Banco que prefieres para tu día a día.',
            'options', jsonb_build_array(
                jsonb_build_object('label', 'Banco de Chile', 'sort_order', 0),
                jsonb_build_object('label', 'BancoEstado', 'sort_order', 1)
            )
        ),
        jsonb_build_object(
            'slug', 'synthetic_guerra_del_internet',
            'title', 'Guerra del Internet',
            'description', 'ISP con el mejor servicio para ti.',
            'options', jsonb_build_array(
                jsonb_build_object('label', 'Movistar', 'sort_order', 0),
                jsonb_build_object('label', 'VTR', 'sort_order', 1)
            )
        )
    );
    v_spec jsonb;
    v_opt jsonb;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Crear/asegurar los 3 synthetic battles SIEMPRE, sin early-return
    FOR v_spec IN SELECT * FROM jsonb_array_elements(v_specs) LOOP
        SELECT id INTO v_battle_id FROM public.battles WHERE slug = v_spec->>'slug' LIMIT 1;

        IF v_battle_id IS NULL THEN
            INSERT INTO public.battles (slug, title, description, status, is_synthetic, created_at)
            VALUES (
                v_spec->>'slug', v_spec->>'title', v_spec->>'description',
                'active', true, now()
            )
            RETURNING id INTO v_battle_id;
            v_seeded := v_seeded + 1;
        ELSE
            -- Asegurar que estén marcados sintéticos y activos sin condición frágil
            UPDATE public.battles
            SET status = 'active', is_synthetic = true
            WHERE id = v_battle_id;
        END IF;

        -- Asegurar las 2 opciones (idempotente por sort_order)
        FOR v_opt IN SELECT * FROM jsonb_array_elements(v_spec->'options') LOOP
            IF NOT EXISTS (
                SELECT 1 FROM public.battle_options
                WHERE battle_id = v_battle_id
                  AND sort_order = (v_opt->>'sort_order')::int
            ) THEN
                INSERT INTO public.battle_options (battle_id, label, sort_order, is_synthetic, created_at)
                VALUES (
                    v_battle_id, v_opt->>'label', (v_opt->>'sort_order')::int, true, now()
                );
            ELSE
                UPDATE public.battle_options
                SET is_synthetic = true, label = v_opt->>'label'
                WHERE battle_id = v_battle_id
                  AND sort_order = (v_opt->>'sort_order')::int;
            END IF;
        END LOOP;
    END LOOP;

    -- Crear/linkear synthetic entities (siempre)
    SELECT public._seed_synthetic_entities() INTO v_entities_seeded;

    PERFORM public.log_admin_action(
        'ensure_synthetic_battles_exist',
        'battles',
        NULL,
        jsonb_build_object('battles_seeded', v_seeded, 'entities_seeded', v_entities_seeded)
    );

    SELECT COUNT(*) INTO v_total_active FROM public.battles WHERE status = 'active';
    RETURN v_total_active;
END;
$$;

-- ---------------------------------------------------------------------
-- 2. regenerate_synthetic_signals_for_rollups (fix filter + winner bias)
-- ---------------------------------------------------------------------

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
    v_option_a_sort_order int;
    v_winner_option_id uuid;
    v_loser_option_id uuid;
    v_winner_entity_id uuid;
    v_loser_entity_id uuid;
    v_rounds_per_user int;
    v_round_idx int;
    v_random_signal_at timestamptz;
    v_random_threshold numeric;
    v_a_wins_threshold numeric;
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

    -- Asegurar synthetic battles + entities (idempotente)
    PERFORM public.ensure_synthetic_battles_exist();

    -- Verificar que tenemos al menos un synthetic battle con opciones linkeadas
    SELECT COUNT(*) INTO v_active_synthetic_battles
    FROM public.battles b
    WHERE b.status = 'active'
      AND b.is_synthetic = true
      AND EXISTS (
        SELECT 1 FROM public.battle_options bo
        WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
      );

    IF v_active_synthetic_battles = 0 THEN
        RAISE EXCEPTION 'NO_SYNTHETIC_BATTLES_WITH_ENTITIES — _seed_synthetic_entities falló' USING ERRCODE = 'P0002';
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

    -- 2) Limpiar rollups corruptos (filas del rollup en la ventana cuyo
    --    entity_id no tendrá ya respaldo en signal_events después del DELETE).
    --    Borra filas con summary_date dentro del window que apunten a
    --    entities NO sintéticas (donde nuestros signals viejos pegaron mal).
    DELETE FROM public.analytics_daily_entity_rollup
    WHERE summary_date >= (CURRENT_DATE - (p_days_window || ' days')::interval)
      AND entity_id IN (
        SELECT id FROM public.entities WHERE is_synthetic = false
      );
    GET DIAGNOSTICS v_polluted_rollups = ROW_COUNT;

    -- 3) Regenerar signals SOLO contra synthetic battles
    FOR v_user_record IN
        SELECT u.user_id, u.created_at AS user_created_at
        FROM public.users u
        WHERE u.synthetic_batch_label = p_label
          AND u.is_synthetic = true
    LOOP
        v_users_processed := v_users_processed + 1;
        v_rounds_per_user := 5 + floor(random() * 16)::int;

        FOR v_round_idx IN 1..v_rounds_per_user LOOP
            -- Pick aleatorio: synthetic battle activo + sus 2 opciones
            -- (option A = sort_order 0, option B = sort_order 1)
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
                (SELECT entity_id FROM ordered_options OFFSET 1 LIMIT 1),
                (SELECT sort_order FROM ordered_options LIMIT 1)
            INTO v_battle_id, v_option_a_id, v_option_b_id,
                 v_option_a_entity_id, v_option_b_entity_id, v_option_a_sort_order;

            EXIT WHEN v_battle_id IS NULL OR v_option_a_id IS NULL OR v_option_b_id IS NULL;

            -- Winner bias: A (sort_order=0) gana 65% del tiempo. Esto produce
            -- líderes claros en el leaderboard (60-65% vs 35-40%).
            v_a_wins_threshold := 0.65;
            v_random_threshold := random();

            IF v_random_threshold < v_a_wins_threshold THEN
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

            -- Signal del GANADOR
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

            -- Signal del PERDEDOR
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
            v_battle_id := NULL; v_option_a_id := NULL; v_option_b_id := NULL;
        END LOOP;
    END LOOP;

    UPDATE public.synthetic_seed_batches
    SET signal_count = v_signals_added
    WHERE id = v_batch_id;

    -- 4) Refrescar todos los rollups
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
        'rollup_result', v_rollup_result
    );
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
