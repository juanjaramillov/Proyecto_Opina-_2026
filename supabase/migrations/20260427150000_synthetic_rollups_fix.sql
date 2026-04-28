-- =====================================================================
-- Migration: 20260427150000_synthetic_rollups_fix.sql
-- Purpose:
--   Hace que los signals sintéticos pueblen los analytics rollups,
--   permitiendo que la página /resultados muestre métricas reales en
--   lugar de "Masa crítica insuficiente".
--
-- Problemas que resuelve:
--   1. signals tenían entity_id = NULL → refresh_analytics_*_rollup()
--      los filtra (WHERE entity_id IS NOT NULL).
--   2. signals tenían value_numeric = NULL → mismo filtro
--      (WHERE value_numeric IS NOT NULL).
--   3. Por cada elección de versus, debe haber 2 signals: el ganador
--      (value_numeric=1) y el perdedor (value_numeric=0). El seeder
--      original generaba 1 sola.
--
-- Cambios:
--   - is_synthetic boolean en public.entities
--   - 6 entities sintéticos (uno por cada synthetic_battle_option)
--   - brand_id de los battle_options sintéticos apuntando a sus entities
--   - RPC regenerate_synthetic_signals_for_rollups(label) reemplaza
--     todas las signals del batch con la forma correcta y dispara
--     refresh_analytics_all_rollups
--   - delete_all_synthetic_data ahora también limpia entities sintéticos
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. is_synthetic en entities
-- ---------------------------------------------------------------------

ALTER TABLE public.entities
    ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS entities_is_synthetic_idx
    ON public.entities (is_synthetic)
    WHERE is_synthetic = true;

-- ---------------------------------------------------------------------
-- 2. Helper interno: crear entities sintéticos y linkear battle_options
-- ---------------------------------------------------------------------
-- Solo se llama desde otras RPCs (no expuesto a authenticated). No
-- audita por sí mismo — el caller audita.

CREATE OR REPLACE FUNCTION public._seed_synthetic_entities()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_battle_record record;
    v_option_record record;
    v_entity_id uuid;
    v_entity_slug text;
    v_seeded int := 0;
BEGIN
    -- Recorrer todos los battle_options de battles sintéticos
    FOR v_battle_record IN
        SELECT id, slug, title FROM public.battles WHERE is_synthetic = true
    LOOP
        FOR v_option_record IN
            SELECT id, label, brand_id, sort_order
            FROM public.battle_options
            WHERE battle_id = v_battle_record.id
        LOOP
            -- Si ya tiene brand_id válido a un entity, no hacer nada
            IF v_option_record.brand_id IS NOT NULL THEN
                CONTINUE;
            END IF;

            v_entity_slug := 'synthetic_' ||
                regexp_replace(lower(v_option_record.label), '[^a-z0-9]+', '_', 'g');

            -- Crear entity si no existe (idempotente por slug)
            SELECT id INTO v_entity_id
            FROM public.entities
            WHERE slug = v_entity_slug;

            IF v_entity_id IS NULL THEN
                INSERT INTO public.entities (
                    type, name, slug, category, vertical,
                    is_active, is_synthetic, sort_order, created_at, updated_at
                ) VALUES (
                    'brand',
                    v_option_record.label,
                    v_entity_slug,
                    v_battle_record.slug,
                    'synthetic',
                    true,
                    true,
                    100 + v_option_record.sort_order,
                    now(), now()
                )
                RETURNING id INTO v_entity_id;
                v_seeded := v_seeded + 1;
            ELSE
                -- Si existía sin marca, marcarlo
                UPDATE public.entities
                SET is_synthetic = true
                WHERE id = v_entity_id AND is_synthetic = false;
            END IF;

            -- Linkear battle_option al entity via brand_id
            UPDATE public.battle_options
            SET brand_id = v_entity_id
            WHERE id = v_option_record.id;
        END LOOP;
    END LOOP;

    RETURN v_seeded;
END;
$$;

REVOKE ALL ON FUNCTION public._seed_synthetic_entities() FROM PUBLIC;

-- ---------------------------------------------------------------------
-- 3. ensure_synthetic_battles_exist también pobla entities
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_synthetic_battles_exist()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_active int;
    v_battle_id uuid;
    v_seeded int := 0;
    v_entities_seeded int := 0;
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

    SELECT COUNT(*) INTO v_existing_active
    FROM public.battles WHERE status = 'active';

    -- Si ya hay battles activos pero NO sintéticos, igual aseguramos que
    -- los sintéticos tengan sus entities (para que los rollups funcionen).
    IF v_existing_active > 0 AND
       NOT EXISTS (SELECT 1 FROM public.battles WHERE is_synthetic = true) THEN
        RETURN v_existing_active;
    END IF;

    -- Crear battles sintéticos si no existen
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
            UPDATE public.battles
            SET status = 'active', is_synthetic = true
            WHERE id = v_battle_id AND status <> 'active';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.battle_options WHERE battle_id = v_battle_id) THEN
            FOR v_opt IN SELECT * FROM jsonb_array_elements(v_spec->'options') LOOP
                INSERT INTO public.battle_options (battle_id, label, sort_order, is_synthetic, created_at)
                VALUES (
                    v_battle_id, v_opt->>'label', (v_opt->>'sort_order')::int, true, now()
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Crear entities y linkear battle_options
    SELECT public._seed_synthetic_entities() INTO v_entities_seeded;

    PERFORM public.log_admin_action(
        'ensure_synthetic_battles_exist',
        'battles',
        NULL,
        jsonb_build_object('battles_seeded', v_seeded, 'entities_seeded', v_entities_seeded)
    );

    SELECT COUNT(*) INTO v_existing_active FROM public.battles WHERE status = 'active';
    RETURN v_existing_active;
END;
$$;

-- ---------------------------------------------------------------------
-- 4. RPC: regenerate_synthetic_signals_for_rollups(label)
-- ---------------------------------------------------------------------
-- Reemplaza TODAS las signals sintéticas del batch con la forma correcta:
--   - Cada elección genera 2 signal_events: ganador (value_numeric=1) y
--     perdedor (value_numeric=0).
--   - entity_id se setea en ambos (resuelto desde battle_option.brand_id).
--   - Al final, llama refresh_analytics_all_rollups(60).

CREATE OR REPLACE FUNCTION public.regenerate_synthetic_signals_for_rollups(
    p_label text
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
    v_rollup_rows int;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Verificar batch
    SELECT id INTO v_batch_id
    FROM public.synthetic_seed_batches
    WHERE label = p_label AND deleted_at IS NULL;

    IF v_batch_id IS NULL THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND_OR_DELETED: %', p_label USING ERRCODE = 'P0002';
    END IF;

    -- Asegurar entities sintéticos linkeados (no-op si ya están)
    PERFORM public._seed_synthetic_entities();

    -- Verificar battles activos con entities resolved
    SELECT COUNT(*) INTO v_active_battles
    FROM public.battles b
    WHERE b.status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.battle_options bo
        WHERE bo.battle_id = b.id AND bo.brand_id IS NOT NULL
      );

    IF v_active_battles = 0 THEN
        RAISE EXCEPTION 'NO_ACTIVE_BATTLES_WITH_ENTITIES: corré ensure_synthetic_battles_exist() primero' USING ERRCODE = 'P0002';
    END IF;

    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado en signal_types' USING ERRCODE = 'P0002';
    END IF;

    -- 1) Borrar signals existentes del batch (mal formadas)
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
      AND meta->>'batch' = p_label;
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Regenerar signals para cada usuario del batch
    FOR v_user_record IN
        SELECT u.user_id, u.created_at AS user_created_at
        FROM public.users u
        WHERE u.synthetic_batch_label = p_label
          AND u.is_synthetic = true
    LOOP
        v_users_processed := v_users_processed + 1;
        v_rounds_per_user := 5 + floor(random() * 16)::int;

        FOR v_round_idx IN 1..v_rounds_per_user LOOP
            -- Pick aleatorio: battle activo + sus 2 opciones (con entity_id)
            -- Asignamos winner/loser al azar entre los 2.
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

            v_random_signal_at := v_user_record.user_created_at + (random() * (now() - v_user_record.user_created_at));

            -- Signal del GANADOR (value_numeric = 1)
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

            -- Signal del PERDEDOR (value_numeric = 0)
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

    -- 3) Actualizar contador del batch (reemplazar, no sumar)
    UPDATE public.synthetic_seed_batches
    SET signal_count = v_signals_added
    WHERE id = v_batch_id;

    -- 4) Refrescar todos los rollups analíticos
    SELECT public.refresh_analytics_all_rollups(90) INTO v_rollup_rows;

    -- 5) Auditar
    PERFORM public.log_admin_action(
        'regenerate_synthetic_signals_for_rollups',
        'synthetic_seed_batches',
        v_batch_id::text,
        jsonb_build_object(
            'label', p_label,
            'users_processed', v_users_processed,
            'signals_deleted', v_signals_deleted,
            'signals_added', v_signals_added,
            'rollup_rows_affected', v_rollup_rows
        )
    );

    RETURN jsonb_build_object(
        'batch_id', v_batch_id,
        'label', p_label,
        'users_processed', v_users_processed,
        'signals_deleted', v_signals_deleted,
        'signals_added', v_signals_added,
        'rollup_rows_affected', v_rollup_rows
    );
END;
$$;

REVOKE ALL ON FUNCTION public.regenerate_synthetic_signals_for_rollups(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.regenerate_synthetic_signals_for_rollups(text) TO authenticated;

-- ---------------------------------------------------------------------
-- 5. delete_all_synthetic_data ahora también borra entities sintéticos
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_all_synthetic_data(
    p_confirm text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_signals_deleted int := 0;
    v_users_deleted int := 0;
    v_batches_marked int := 0;
    v_battle_options_deleted int := 0;
    v_battles_deleted int := 0;
    v_entities_deleted int := 0;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    IF p_confirm IS DISTINCT FROM 'YES_DELETE_ALL_SYNTHETIC' THEN
        RAISE EXCEPTION 'CONFIRM_REQUIRED: pasa p_confirm := ''YES_DELETE_ALL_SYNTHETIC'' para ejecutar' USING ERRCODE = '22023';
    END IF;

    -- 1) Borrar señales sintéticas
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
       OR user_id IN (SELECT user_id FROM public.users WHERE is_synthetic = true)
       OR battle_id IN (SELECT id FROM public.battles WHERE is_synthetic = true)
       OR entity_id IN (SELECT id FROM public.entities WHERE is_synthetic = true);
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Borrar usuarios sintéticos
    DELETE FROM auth.users
    WHERE id IN (SELECT user_id FROM public.users WHERE is_synthetic = true)
       OR raw_user_meta_data->>'synthetic' = 'true';
    GET DIAGNOSTICS v_users_deleted = ROW_COUNT;

    -- 3) Borrar battle_options sintéticas
    DELETE FROM public.battle_options
    WHERE is_synthetic = true
       OR battle_id IN (SELECT id FROM public.battles WHERE is_synthetic = true);
    GET DIAGNOSTICS v_battle_options_deleted = ROW_COUNT;

    -- 4) Borrar battles sintéticos
    DELETE FROM public.battles
    WHERE is_synthetic = true;
    GET DIAGNOSTICS v_battles_deleted = ROW_COUNT;

    -- 5) Borrar entities sintéticos (después de battles para evitar FK issues)
    DELETE FROM public.entities WHERE is_synthetic = true;
    GET DIAGNOSTICS v_entities_deleted = ROW_COUNT;

    -- 6) También limpiar rollups que podrían referenciar entities sintéticos
    DELETE FROM public.analytics_daily_entity_rollup
    WHERE entity_id NOT IN (SELECT id FROM public.entities);
    DELETE FROM public.analytics_daily_segment_rollup
    WHERE entity_id NOT IN (SELECT id FROM public.entities);

    -- 7) Marcar batches vivos como deleted
    UPDATE public.synthetic_seed_batches
    SET deleted_at = now(), deleted_by = auth.uid()
    WHERE deleted_at IS NULL;
    GET DIAGNOSTICS v_batches_marked = ROW_COUNT;

    PERFORM public.log_admin_action(
        'delete_all_synthetic_data',
        'synthetic_seed_batches',
        NULL,
        jsonb_build_object(
            'users_deleted', v_users_deleted,
            'signals_deleted', v_signals_deleted,
            'batches_marked', v_batches_marked,
            'battles_deleted', v_battles_deleted,
            'battle_options_deleted', v_battle_options_deleted,
            'entities_deleted', v_entities_deleted
        )
    );

    RETURN jsonb_build_object(
        'users_deleted', v_users_deleted,
        'signals_deleted', v_signals_deleted,
        'batches_marked', v_batches_marked,
        'battles_deleted', v_battles_deleted,
        'battle_options_deleted', v_battle_options_deleted,
        'entities_deleted', v_entities_deleted
    );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_all_synthetic_data(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_all_synthetic_data(text) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
