-- =====================================================================
-- Migration: 20260427140000_synthetic_battles_and_backfill.sql
-- Purpose:
--   1. Marcar battles y battle_options como sintéticos (columna is_synthetic)
--      para poder borrarlos con el resto de los datos sintéticos.
--   2. Helper ensure_synthetic_battles_exist() que crea 3 battles mínimos
--      con 2 opciones cada uno, si no hay battles activos en la base.
--      Pensado para entornos internos donde no se aplicó seed.sql canónico.
--   3. RPC backfill_synthetic_signals(label) que genera 5–20 señales por
--      usuario para un batch existente — útil si los usuarios se sembraron
--      antes de que existieran los battles.
--   4. Extender delete_all_synthetic_data para que también borre battles
--      sintéticos.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Columnas is_synthetic en battles y battle_options
-- ---------------------------------------------------------------------

ALTER TABLE public.battles
    ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;

ALTER TABLE public.battle_options
    ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS battles_is_synthetic_idx
    ON public.battles (is_synthetic)
    WHERE is_synthetic = true;

CREATE INDEX IF NOT EXISTS battle_options_is_synthetic_idx
    ON public.battle_options (is_synthetic)
    WHERE is_synthetic = true;

-- ---------------------------------------------------------------------
-- 2. Helper: crear battles sintéticos mínimos si no hay ninguno activo
-- ---------------------------------------------------------------------
-- Crea 3 battles ('Reyes del Bajón', 'Guerra de la Plata', 'Guerra del
-- Internet') idempotentemente, marcados is_synthetic=true. Si ya existe
-- un battle con el mismo slug, lo reutiliza. Si ya hay battles activos
-- (sintéticos o no) en la base, no crea nada y devuelve los existentes.
-- Devuelve la cantidad de battles activos disponibles.

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
    -- Solo admin puede invocarla
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    SELECT COUNT(*) INTO v_existing_active
    FROM public.battles WHERE status = 'active';

    -- Si ya hay battles activos, no creamos nada
    IF v_existing_active > 0 THEN
        RETURN v_existing_active;
    END IF;

    -- Crear cada battle si no existe ya
    FOR v_spec IN SELECT * FROM jsonb_array_elements(v_specs) LOOP
        SELECT id INTO v_battle_id
        FROM public.battles
        WHERE slug = v_spec->>'slug'
        LIMIT 1;

        IF v_battle_id IS NULL THEN
            INSERT INTO public.battles (slug, title, description, status, is_synthetic, created_at)
            VALUES (
                v_spec->>'slug',
                v_spec->>'title',
                v_spec->>'description',
                'active',
                true,
                now()
            )
            RETURNING id INTO v_battle_id;
            v_seeded := v_seeded + 1;
        ELSE
            -- Si existía pero estaba inactivo, lo reactivamos como sintético
            UPDATE public.battles
            SET status = 'active', is_synthetic = true
            WHERE id = v_battle_id AND status <> 'active';
        END IF;

        -- Crear las opciones del battle si no tiene aún
        IF NOT EXISTS (SELECT 1 FROM public.battle_options WHERE battle_id = v_battle_id) THEN
            FOR v_opt IN SELECT * FROM jsonb_array_elements(v_spec->'options') LOOP
                INSERT INTO public.battle_options (battle_id, label, sort_order, is_synthetic, created_at)
                VALUES (
                    v_battle_id,
                    v_opt->>'label',
                    (v_opt->>'sort_order')::int,
                    true,
                    now()
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Auditar la creación
    PERFORM public.log_admin_action(
        'ensure_synthetic_battles_exist',
        'battles',
        NULL,
        jsonb_build_object('battles_seeded', v_seeded)
    );

    -- Devolver el total de battles activos ahora disponibles
    SELECT COUNT(*) INTO v_existing_active
    FROM public.battles WHERE status = 'active';
    RETURN v_existing_active;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_synthetic_battles_exist() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_synthetic_battles_exist() TO authenticated;

-- ---------------------------------------------------------------------
-- 3. RPC: backfill_synthetic_signals(label)
-- ---------------------------------------------------------------------
-- Genera 5–20 señales versus por cada usuario sintético del batch dado,
-- contra los battles activos actuales. Útil si los usuarios se crearon
-- antes de que hubiera battles. Sumarios el contador del batch.

CREATE OR REPLACE FUNCTION public.backfill_synthetic_signals(
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
    v_signals_per_user int;
    v_signal_idx int;
    v_battle_id uuid;
    v_option_id uuid;
    v_random_signal_at timestamptz;
    v_signals_added int := 0;
    v_users_processed int := 0;
    v_active_battles int;
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

    -- Verificar que hay battles activos
    SELECT COUNT(*) INTO v_active_battles
    FROM public.battles WHERE status = 'active';

    IF v_active_battles = 0 THEN
        RAISE EXCEPTION 'NO_ACTIVE_BATTLES: corré ensure_synthetic_battles_exist() primero' USING ERRCODE = 'P0002';
    END IF;

    -- Resolver signal_type_id de VERSUS_SIGNAL
    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado en catálogo signal_types' USING ERRCODE = 'P0002';
    END IF;

    -- Iterar sobre los usuarios del batch
    FOR v_user_record IN
        SELECT u.user_id, u.created_at AS user_created_at
        FROM public.users u
        WHERE u.synthetic_batch_label = p_label
          AND u.is_synthetic = true
    LOOP
        v_users_processed := v_users_processed + 1;
        v_signals_per_user := 5 + floor(random() * 16)::int;

        FOR v_signal_idx IN 1..v_signals_per_user LOOP
            SELECT b.id, bo.id INTO v_battle_id, v_option_id
            FROM public.battles b
            JOIN public.battle_options bo ON bo.battle_id = b.id
            WHERE b.status = 'active'
            ORDER BY random()
            LIMIT 1;

            EXIT WHEN v_battle_id IS NULL;

            v_random_signal_at := v_user_record.user_created_at + (random() * (now() - v_user_record.user_created_at));

            INSERT INTO public.signal_events (
                anon_id, user_id, signal_id,
                battle_id, option_id,
                module_type, signal_type_id,
                signal_weight, value_json, value_text,
                meta, occurred_at, created_at,
                country, source_module
            ) VALUES (
                'synthetic-' || gen_random_uuid()::text,
                v_user_record.user_id,
                gen_random_uuid(),
                v_battle_id,
                v_option_id,
                'versus',
                v_versus_signal_type_id,
                1.0,
                jsonb_build_object('option_id', v_option_id),
                v_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', p_label),
                v_random_signal_at,
                v_random_signal_at,
                'CL',
                'versus'
            );

            v_signals_added := v_signals_added + 1;
            v_battle_id := NULL;
            v_option_id := NULL;
        END LOOP;
    END LOOP;

    -- Actualizar contador del batch (sumando, no reemplazando)
    UPDATE public.synthetic_seed_batches
    SET signal_count = signal_count + v_signals_added
    WHERE id = v_batch_id;

    -- Auditar
    PERFORM public.log_admin_action(
        'backfill_synthetic_signals',
        'synthetic_seed_batches',
        v_batch_id::text,
        jsonb_build_object(
            'label', p_label,
            'users_processed', v_users_processed,
            'signals_added', v_signals_added
        )
    );

    RETURN jsonb_build_object(
        'batch_id', v_batch_id,
        'label', p_label,
        'users_processed', v_users_processed,
        'signals_added', v_signals_added
    );
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_synthetic_signals(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_synthetic_signals(text) TO authenticated;

-- ---------------------------------------------------------------------
-- 4. seed_synthetic_batch ahora llama a ensure_synthetic_battles_exist
-- ---------------------------------------------------------------------
-- Para que invocaciones futuras sembren battles automáticamente si la
-- base no los tiene.

CREATE OR REPLACE FUNCTION public.seed_synthetic_batch(
    p_label text,
    p_user_count int DEFAULT 100,
    p_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_batch_id uuid;
    v_user_id uuid;
    v_email text;
    v_nickname text;
    v_signal_count int := 0;
    v_user_idx int;
    v_signal_idx int;
    v_signals_per_user int;
    v_versus_signal_type_id bigint;
    v_battle_id uuid;
    v_option_id uuid;
    v_random_created_at timestamptz;
    v_random_signal_at timestamptz;
    v_clean_label text;
    v_active_battles int;

    v_genders text[] := ARRAY['M', 'F', 'X'];
    v_age_buckets text[] := ARRAY['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    v_regions text[] := ARRAY[
        'Región Metropolitana', 'Valparaíso', 'Biobío', 'Maule',
        'La Araucanía', 'Coquimbo', 'Antofagasta', 'O''Higgins',
        'Los Lagos', 'Tarapacá', 'Atacama', 'Magallanes',
        'Aysén', 'Arica y Parinacota', 'Los Ríos', 'Ñuble'
    ];
    v_comunas text[] := ARRAY[
        'Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto',
        'Viña del Mar', 'Valparaíso', 'Concepción', 'Talcahuano',
        'Temuco', 'La Serena', 'Antofagasta', 'Rancagua', 'Talca',
        'Iquique', 'Punta Arenas', 'Valdivia', 'Osorno', 'Puerto Montt'
    ];
    v_education_levels text[] := ARRAY['básica', 'media', 'técnica', 'universitaria', 'postgrado'];
    v_employment_statuses text[] := ARRAY['empleado', 'independiente', 'estudiante', 'desempleado', 'jubilado'];
    v_income_ranges text[] := ARRAY['<500k', '500k-1M', '1M-2M', '2M-3M', '>3M'];
    v_housing_types text[] := ARRAY['propia', 'arrendada', 'familiar'];
    v_purchase_behaviors text[] := ARRAY['budget', 'value', 'premium', 'impulse'];
    v_influence_levels text[] := ARRAY['low', 'medium', 'high'];
    v_household_sizes text[] := ARRAY['1', '2', '3', '4', '5+'];
    v_children_counts text[] := ARRAY['0', '1', '2', '3+'];
    v_car_counts text[] := ARRAY['0', '1', '2', '3+'];
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    IF p_label IS NULL OR length(trim(p_label)) = 0 THEN
        RAISE EXCEPTION 'INVALID_LABEL: label vacío' USING ERRCODE = '22023';
    END IF;

    v_clean_label := regexp_replace(trim(p_label), '[^a-zA-Z0-9_-]', '_', 'g');
    IF v_clean_label !~ '^[a-zA-Z0-9_-]{2,40}$' THEN
        RAISE EXCEPTION 'INVALID_LABEL: debe matchear ^[a-zA-Z0-9_-]{2,40}$' USING ERRCODE = '22023';
    END IF;

    IF p_user_count < 1 OR p_user_count > 1000 THEN
        RAISE EXCEPTION 'INVALID_USER_COUNT: rango permitido 1..1000' USING ERRCODE = '22023';
    END IF;

    -- Asegurar que existan battles activos antes de empezar
    SELECT public.ensure_synthetic_battles_exist() INTO v_active_battles;

    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado en catálogo signal_types' USING ERRCODE = 'P0002';
    END IF;

    INSERT INTO public.synthetic_seed_batches (label, notes, user_count, created_by)
    VALUES (v_clean_label, p_notes, p_user_count, auth.uid())
    RETURNING id INTO v_batch_id;

    FOR v_user_idx IN 1..p_user_count LOOP
        v_user_id := gen_random_uuid();
        v_email := 'synthetic+' || v_clean_label || '+' || lpad(v_user_idx::text, 4, '0') || '@opina.test';
        v_nickname := 'syn_' || substring(replace(v_user_id::text, '-', ''), 1, 16);
        v_random_created_at := now() - (random() * interval '60 days');

        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, created_at, updated_at
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', v_email,
            extensions.crypt('synthetic-no-login-' || gen_random_uuid()::text, extensions.gen_salt('bf')),
            v_random_created_at,
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[]),
            jsonb_build_object('synthetic', true, 'batch', v_clean_label, 'seed_run_at', now()),
            false, v_random_created_at, v_random_created_at
        );

        INSERT INTO public.users (
            user_id, role, is_identity_verified,
            is_synthetic, synthetic_batch_label,
            created_at, updated_at, last_active_at,
            total_interactions, total_sessions, total_time_spent_seconds
        ) VALUES (
            v_user_id, 'user', true,
            true, v_clean_label,
            v_random_created_at, v_random_created_at,
            v_random_created_at + (random() * (now() - v_random_created_at)),
            floor(random() * 50)::int, floor(random() * 10)::int, floor(random() * 7200)::int
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role, is_identity_verified = EXCLUDED.is_identity_verified,
            is_synthetic = EXCLUDED.is_synthetic, synthetic_batch_label = EXCLUDED.synthetic_batch_label,
            created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at,
            last_active_at = EXCLUDED.last_active_at,
            total_interactions = EXCLUDED.total_interactions,
            total_sessions = EXCLUDED.total_sessions,
            total_time_spent_seconds = EXCLUDED.total_time_spent_seconds;

        INSERT INTO public.user_profiles (
            user_id, nickname, gender, age_bucket, region, comuna,
            education, education_level, employment_status, income_range,
            housing_type, purchase_behavior, influence_level,
            household_size, children_count, car_count, birth_year,
            profile_stage, profile_completeness,
            is_synthetic, synthetic_batch_label,
            last_demographics_update, created_at, updated_at
        ) VALUES (
            v_user_id, v_nickname,
            v_genders[1 + floor(random() * array_length(v_genders, 1))::int],
            v_age_buckets[1 + floor(random() * array_length(v_age_buckets, 1))::int],
            v_regions[1 + floor(random() * array_length(v_regions, 1))::int],
            v_comunas[1 + floor(random() * array_length(v_comunas, 1))::int],
            v_education_levels[1 + floor(random() * array_length(v_education_levels, 1))::int],
            v_education_levels[1 + floor(random() * array_length(v_education_levels, 1))::int],
            v_employment_statuses[1 + floor(random() * array_length(v_employment_statuses, 1))::int],
            v_income_ranges[1 + floor(random() * array_length(v_income_ranges, 1))::int],
            v_housing_types[1 + floor(random() * array_length(v_housing_types, 1))::int],
            v_purchase_behaviors[1 + floor(random() * array_length(v_purchase_behaviors, 1))::int],
            v_influence_levels[1 + floor(random() * array_length(v_influence_levels, 1))::int],
            v_household_sizes[1 + floor(random() * array_length(v_household_sizes, 1))::int],
            v_children_counts[1 + floor(random() * array_length(v_children_counts, 1))::int],
            v_car_counts[1 + floor(random() * array_length(v_car_counts, 1))::int],
            1960 + floor(random() * 50)::int,
            2, 0.85,
            true, v_clean_label,
            v_random_created_at, v_random_created_at, v_random_created_at
        )
        ON CONFLICT (user_id) DO UPDATE SET
            nickname = EXCLUDED.nickname, gender = EXCLUDED.gender,
            age_bucket = EXCLUDED.age_bucket, region = EXCLUDED.region,
            comuna = EXCLUDED.comuna, education = EXCLUDED.education,
            education_level = EXCLUDED.education_level,
            employment_status = EXCLUDED.employment_status,
            income_range = EXCLUDED.income_range, housing_type = EXCLUDED.housing_type,
            purchase_behavior = EXCLUDED.purchase_behavior,
            influence_level = EXCLUDED.influence_level,
            household_size = EXCLUDED.household_size,
            children_count = EXCLUDED.children_count,
            car_count = EXCLUDED.car_count, birth_year = EXCLUDED.birth_year,
            profile_stage = EXCLUDED.profile_stage,
            profile_completeness = EXCLUDED.profile_completeness,
            is_synthetic = EXCLUDED.is_synthetic,
            synthetic_batch_label = EXCLUDED.synthetic_batch_label,
            last_demographics_update = EXCLUDED.last_demographics_update,
            created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

        v_signals_per_user := 5 + floor(random() * 16)::int;
        FOR v_signal_idx IN 1..v_signals_per_user LOOP
            SELECT b.id, bo.id INTO v_battle_id, v_option_id
            FROM public.battles b
            JOIN public.battle_options bo ON bo.battle_id = b.id
            WHERE b.status = 'active'
            ORDER BY random()
            LIMIT 1;

            EXIT WHEN v_battle_id IS NULL;

            v_random_signal_at := v_random_created_at + (random() * (now() - v_random_created_at));

            INSERT INTO public.signal_events (
                anon_id, user_id, signal_id, battle_id, option_id,
                module_type, signal_type_id, signal_weight, value_json, value_text,
                meta, occurred_at, created_at, country, source_module
            ) VALUES (
                'synthetic-' || gen_random_uuid()::text, v_user_id,
                gen_random_uuid(), v_battle_id, v_option_id,
                'versus', v_versus_signal_type_id, 1.0,
                jsonb_build_object('option_id', v_option_id), v_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', v_clean_label),
                v_random_signal_at, v_random_signal_at, 'CL', 'versus'
            );

            v_signal_count := v_signal_count + 1;
            v_battle_id := NULL;
            v_option_id := NULL;
        END LOOP;
    END LOOP;

    UPDATE public.synthetic_seed_batches
    SET signal_count = v_signal_count
    WHERE id = v_batch_id;

    PERFORM public.log_admin_action(
        'seed_synthetic_batch',
        'synthetic_seed_batches',
        v_batch_id::text,
        jsonb_build_object(
            'label', v_clean_label,
            'user_count', p_user_count,
            'signal_count', v_signal_count,
            'notes', p_notes
        )
    );

    RETURN v_batch_id;
END;
$$;

-- ---------------------------------------------------------------------
-- 5. delete_all_synthetic_data ahora también borra battles sintéticos
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
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    IF p_confirm IS DISTINCT FROM 'YES_DELETE_ALL_SYNTHETIC' THEN
        RAISE EXCEPTION 'CONFIRM_REQUIRED: pasa p_confirm := ''YES_DELETE_ALL_SYNTHETIC'' para ejecutar' USING ERRCODE = '22023';
    END IF;

    -- 1) Borrar señales sintéticas (por meta o por user_id sintético o por battle sintético)
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
       OR user_id IN (SELECT user_id FROM public.users WHERE is_synthetic = true)
       OR battle_id IN (SELECT id FROM public.battles WHERE is_synthetic = true);
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Borrar usuarios sintéticos de auth.users (cascade a public.*)
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

    -- 5) Marcar todos los batches vivos como deleted
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
            'battle_options_deleted', v_battle_options_deleted
        )
    );

    RETURN jsonb_build_object(
        'users_deleted', v_users_deleted,
        'signals_deleted', v_signals_deleted,
        'batches_marked', v_batches_marked,
        'battles_deleted', v_battles_deleted,
        'battle_options_deleted', v_battle_options_deleted
    );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_all_synthetic_data(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_all_synthetic_data(text) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
