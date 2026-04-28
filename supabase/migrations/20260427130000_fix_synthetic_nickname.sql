-- =====================================================================
-- Migration: 20260427130000_fix_synthetic_nickname.sql
-- Purpose:   Fix de seed_synthetic_batch — nickname basado en UUID para
--            cumplir con la UNIQUE constraint user_profiles_nickname_key
--            sin colisionar entre usuarios o entre batches.
--
-- Problema previo:
--   Generábamos `syn_<label_normalizado>_NNNN` y truncábamos a 20 chars.
--   Cuando el label era largo, la truncación cortaba el contador NNNN
--   y todos los usuarios del batch terminaban con el mismo nickname,
--   violando user_profiles.nickname_key (UNIQUE).
--
-- Solución:
--   nickname = 'syn_' + primeros 16 hex chars del user_id (uuid).
--   - 4 + 16 = 20 chars exactos (límite del check constraint).
--   - Cumple regex ^[a-zA-Z0-9_]+$ (hex es subset).
--   - Único por construcción (UUID v4 → 16^16 ≈ 1.8e19 combinaciones).
--   - La trazabilidad humana se conserva en email y synthetic_batch_label.
-- =====================================================================

BEGIN;

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

    -- Catálogos para diversidad demográfica (valores típicos chilenos)
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
    -- Guard: solo admin
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Validaciones
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

    -- Resolver signal_type_id de VERSUS_SIGNAL
    SELECT id INTO v_versus_signal_type_id
    FROM public.signal_types
    WHERE code = 'VERSUS_SIGNAL' AND is_active = true
    LIMIT 1;

    IF v_versus_signal_type_id IS NULL THEN
        RAISE EXCEPTION 'VERSUS_SIGNAL no encontrado en catálogo signal_types' USING ERRCODE = 'P0002';
    END IF;

    -- Crear batch row
    INSERT INTO public.synthetic_seed_batches (label, notes, user_count, created_by)
    VALUES (v_clean_label, p_notes, p_user_count, auth.uid())
    RETURNING id INTO v_batch_id;

    -- Generar usuarios
    FOR v_user_idx IN 1..p_user_count LOOP
        v_user_id := gen_random_uuid();
        v_email := 'synthetic+' || v_clean_label || '+' || lpad(v_user_idx::text, 4, '0') || '@opina.test';

        -- Nickname basado en UUID (4 + 16 = 20 chars, único por construcción).
        -- Cumple constraint user_profiles_nickname_format: ^[a-zA-Z0-9_]{3,20}$.
        v_nickname := 'syn_' || substring(replace(v_user_id::text, '-', ''), 1, 16);

        v_random_created_at := now() - (random() * interval '60 days');

        -- 1) auth.users (mínimo viable; Supabase rellena defaults para tokens, etc.)
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            v_email,
            -- Hash bcrypt inválido: el plaintext es único e inservible,
            -- así que el usuario sintético no puede loguearse.
            extensions.crypt('synthetic-no-login-' || gen_random_uuid()::text, extensions.gen_salt('bf')),
            v_random_created_at,
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[]),
            jsonb_build_object(
                'synthetic', true,
                'batch', v_clean_label,
                'seed_run_at', now()
            ),
            false,
            v_random_created_at,
            v_random_created_at
        );

        -- 2) public.users (mirror; ON CONFLICT defensivo por si handle_new_user trigger insertó)
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
            floor(random() * 50)::int,
            floor(random() * 10)::int,
            floor(random() * 7200)::int
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            is_identity_verified = EXCLUDED.is_identity_verified,
            is_synthetic = EXCLUDED.is_synthetic,
            synthetic_batch_label = EXCLUDED.synthetic_batch_label,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at,
            last_active_at = EXCLUDED.last_active_at,
            total_interactions = EXCLUDED.total_interactions,
            total_sessions = EXCLUDED.total_sessions,
            total_time_spent_seconds = EXCLUDED.total_time_spent_seconds;

        -- 3) public.user_profiles
        INSERT INTO public.user_profiles (
            user_id, nickname,
            gender, age_bucket, region, comuna,
            education, education_level, employment_status, income_range,
            housing_type, purchase_behavior, influence_level,
            household_size, children_count, car_count,
            birth_year,
            profile_stage, profile_completeness,
            is_synthetic, synthetic_batch_label,
            last_demographics_update,
            created_at, updated_at
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
            2,           -- profile_stage 2 = onboarding completo (puede emitir señales)
            0.85,        -- profile_completeness fija "razonable"
            true,
            v_clean_label,
            v_random_created_at,
            v_random_created_at,
            v_random_created_at
        )
        ON CONFLICT (user_id) DO UPDATE SET
            nickname = EXCLUDED.nickname,
            gender = EXCLUDED.gender,
            age_bucket = EXCLUDED.age_bucket,
            region = EXCLUDED.region,
            comuna = EXCLUDED.comuna,
            education = EXCLUDED.education,
            education_level = EXCLUDED.education_level,
            employment_status = EXCLUDED.employment_status,
            income_range = EXCLUDED.income_range,
            housing_type = EXCLUDED.housing_type,
            purchase_behavior = EXCLUDED.purchase_behavior,
            influence_level = EXCLUDED.influence_level,
            household_size = EXCLUDED.household_size,
            children_count = EXCLUDED.children_count,
            car_count = EXCLUDED.car_count,
            birth_year = EXCLUDED.birth_year,
            profile_stage = EXCLUDED.profile_stage,
            profile_completeness = EXCLUDED.profile_completeness,
            is_synthetic = EXCLUDED.is_synthetic,
            synthetic_batch_label = EXCLUDED.synthetic_batch_label,
            last_demographics_update = EXCLUDED.last_demographics_update,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at;

        -- 4) Señales versus (5..20 por usuario contra battles activos)
        v_signals_per_user := 5 + floor(random() * 16)::int;

        FOR v_signal_idx IN 1..v_signals_per_user LOOP
            -- Pick aleatorio de battle + option
            SELECT b.id, bo.id INTO v_battle_id, v_option_id
            FROM public.battles b
            JOIN public.battle_options bo ON bo.battle_id = b.id
            WHERE b.status = 'active'
            ORDER BY random()
            LIMIT 1;

            EXIT WHEN v_battle_id IS NULL;  -- no hay battles activos

            v_random_signal_at := v_random_created_at + (random() * (now() - v_random_created_at));

            INSERT INTO public.signal_events (
                anon_id, user_id, signal_id,
                battle_id, option_id,
                module_type, signal_type_id,
                signal_weight, value_json, value_text,
                meta, occurred_at, created_at,
                country, source_module
            ) VALUES (
                'synthetic-' || gen_random_uuid()::text,
                v_user_id,
                gen_random_uuid(),
                v_battle_id,
                v_option_id,
                'versus',
                v_versus_signal_type_id,
                1.0,
                jsonb_build_object('option_id', v_option_id),
                v_option_id::text,
                jsonb_build_object('synthetic', true, 'batch', v_clean_label),
                v_random_signal_at,
                v_random_signal_at,
                'CL',
                'versus'
            );

            v_signal_count := v_signal_count + 1;

            -- Reset para la siguiente iteración
            v_battle_id := NULL;
            v_option_id := NULL;
        END LOOP;
    END LOOP;

    -- Actualizar contadores del batch
    UPDATE public.synthetic_seed_batches
    SET signal_count = v_signal_count
    WHERE id = v_batch_id;

    -- Auditar
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

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
