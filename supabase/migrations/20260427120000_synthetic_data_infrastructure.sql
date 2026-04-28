-- =====================================================================
-- Migration: 20260427120000_synthetic_data_infrastructure.sql
-- Purpose:   Infraestructura para sembrar y borrar datos sinteticos
--            de forma trazable y auditada. Uso INTERNO, no producción.
--
-- Resumen:
--   1. Marca trazable triple: email pattern *@opina.test +
--      raw_user_meta_data.synthetic + columnas mirror is_synthetic /
--      synthetic_batch_label en public.users y public.user_profiles.
--   2. Tabla maestra synthetic_seed_batches para tracking por batch.
--   3. RPCs SECURITY DEFINER (admin-only, audit-logged) para
--      crear/borrar batches y limpieza total.
--
-- IMPORTANTE: esta migración solo añade infraestructura. NO inserta
-- datos sintéticos por sí misma. Los datos se generan invocando
-- explícitamente seed_synthetic_batch().
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Columnas de marca en tablas base
-- ---------------------------------------------------------------------

ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS synthetic_batch_label text;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS synthetic_batch_label text;

CREATE INDEX IF NOT EXISTS user_profiles_is_synthetic_idx
    ON public.user_profiles (is_synthetic)
    WHERE is_synthetic = true;

CREATE INDEX IF NOT EXISTS users_is_synthetic_idx
    ON public.users (is_synthetic)
    WHERE is_synthetic = true;

CREATE INDEX IF NOT EXISTS user_profiles_synthetic_batch_idx
    ON public.user_profiles (synthetic_batch_label)
    WHERE synthetic_batch_label IS NOT NULL;

CREATE INDEX IF NOT EXISTS users_synthetic_batch_idx
    ON public.users (synthetic_batch_label)
    WHERE synthetic_batch_label IS NOT NULL;

CREATE INDEX IF NOT EXISTS signal_events_synthetic_idx
    ON public.signal_events ((meta->>'synthetic'))
    WHERE meta->>'synthetic' = 'true';

-- ---------------------------------------------------------------------
-- 2. Vista profiles (recreada para exponer is_synthetic)
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW public.profiles AS
SELECT
    up.user_id,
    up.nickname,
    up.gender,
    up.age_bucket,
    up.region,
    up.comuna,
    up.education,
    up.profile_completeness,
    1.0 AS signal_weight,
    u.is_identity_verified AS verified,
    u.role,
    u.is_identity_verified AS identity_verified,
    u.invitation_code_id,
    up.last_demographics_update,
    up.created_at,
    up.updated_at,
    COALESCE(up.is_synthetic, false) OR COALESCE(u.is_synthetic, false) AS is_synthetic,
    COALESCE(up.synthetic_batch_label, u.synthetic_batch_label) AS synthetic_batch_label
FROM public.user_profiles up
LEFT JOIN public.users u ON u.user_id = up.user_id;

ALTER VIEW public.profiles OWNER TO postgres;

-- ---------------------------------------------------------------------
-- 3. Tabla maestra de batches
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.synthetic_seed_batches (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label           text NOT NULL UNIQUE,
    notes           text,
    user_count      int NOT NULL DEFAULT 0,
    signal_count    int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at      timestamptz,
    deleted_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT synthetic_seed_batches_label_format
        CHECK (label ~ '^[a-zA-Z0-9_-]{2,40}$')
);

COMMENT ON TABLE public.synthetic_seed_batches IS
    'Registro maestro de cada inyección de datos sintéticos. Los batches con deleted_at = NULL están vivos en la base.';

ALTER TABLE public.synthetic_seed_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS synthetic_seed_batches_admin_only ON public.synthetic_seed_batches;
CREATE POLICY synthetic_seed_batches_admin_only
    ON public.synthetic_seed_batches
    FOR ALL
    TO authenticated
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());

GRANT SELECT ON public.synthetic_seed_batches TO authenticated;

-- ---------------------------------------------------------------------
-- 4. RPC: seed_synthetic_batch
-- ---------------------------------------------------------------------
-- Crea un batch + N usuarios sintéticos + sus perfiles + sus señales
-- versus contra battles existentes activos.
--
-- Argumentos:
--   p_label       label del batch (único, [a-zA-Z0-9_-]{2,40})
--   p_user_count  cantidad de usuarios (1..1000)
--   p_notes       texto libre opcional
--
-- Devuelve: el batch_id (uuid).
--
-- Usuarios generados:
--   email:         synthetic+<label>+NNNN@opina.test
--   nickname:      syn_<label>_NNNN (truncado a 20 chars, regex-compliant)
--   raw_user_meta: { synthetic: true, batch: <label> }
--   profile_stage: 2 (onboarding completo, signals permitidas)
--   demografía:    region/comuna/edad/género/etc. aleatorios
--   created_at:    distribuido en últimos 60 días
--
-- Señales generadas:
--   por usuario:   5..20 señales versus
--   contra:        battles existentes con status='active'
--   meta:          { synthetic: true, batch: <label> }
--   timestamps:    distribuidos entre user.created_at y now()
-- ---------------------------------------------------------------------

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

        -- Nickname: prefijo seguro, recortado a 20 chars (regex ^[a-zA-Z0-9_]+$)
        v_nickname := substring(
            'syn_' || regexp_replace(v_clean_label, '[^a-zA-Z0-9]', '_', 'g') || '_' || lpad(v_user_idx::text, 4, '0')
            for 20
        );

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
            -- Hash bcrypt inválido para que el usuario no pueda loguearse
            -- (la sal se genera al vuelo, el plaintext es único e inservible)
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

        -- 2) public.users (mirror)
        -- ON CONFLICT defensivo: si existe un trigger handle_new_user en
        -- auth.users (creado por la baseline original de Supabase fuera
        -- de migraciones), ya habría insertado una fila con defaults.
        -- Hacemos UPDATE para sobrescribir con los valores sintéticos.
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

COMMENT ON FUNCTION public.seed_synthetic_batch(text, int, text) IS
    'Crea un batch sintético de N usuarios + perfiles + señales versus. Solo admin. Datos marcados con is_synthetic=true y meta.synthetic=true.';

REVOKE ALL ON FUNCTION public.seed_synthetic_batch(text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_synthetic_batch(text, int, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 5. RPC: delete_synthetic_batch
-- ---------------------------------------------------------------------
-- Borra todos los datos asociados a un batch específico.
-- Orden: signal_events → auth.users (cascade a public.users + user_profiles)
-- Marca el batch como deleted (deleted_at) para auditoría.
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_synthetic_batch(
    p_label text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_batch_id uuid;
    v_user_ids uuid[];
    v_signals_deleted int := 0;
    v_users_deleted int := 0;
    v_tmp_count int := 0;
BEGIN
    -- Guard
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Buscar batch (sin importar si ya está marcado como deleted)
    SELECT id INTO v_batch_id
    FROM public.synthetic_seed_batches
    WHERE label = p_label;

    IF v_batch_id IS NULL THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: %', p_label USING ERRCODE = 'P0002';
    END IF;

    -- Recolectar user_ids del batch
    SELECT array_agg(user_id) INTO v_user_ids
    FROM public.users
    WHERE synthetic_batch_label = p_label
      AND is_synthetic = true;

    -- 1) Borrar signal_events (FK is ON DELETE SET NULL, no cascadea)
    IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
        DELETE FROM public.signal_events
        WHERE user_id = ANY(v_user_ids);
        GET DIAGNOSTICS v_tmp_count = ROW_COUNT;
        v_signals_deleted := v_signals_deleted + v_tmp_count;
    END IF;

    -- También borrar señales que solo tengan la marca de batch en meta (defensivo)
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
      AND meta->>'batch' = p_label;
    GET DIAGNOSTICS v_tmp_count = ROW_COUNT;
    v_signals_deleted := v_signals_deleted + v_tmp_count;

    -- 2) Borrar de auth.users (cascadea a public.users y user_profiles)
    IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
        DELETE FROM auth.users
        WHERE id = ANY(v_user_ids);
        GET DIAGNOSTICS v_users_deleted = ROW_COUNT;
    END IF;

    -- 3) Marcar batch como borrado
    UPDATE public.synthetic_seed_batches
    SET deleted_at = now(),
        deleted_by = auth.uid()
    WHERE id = v_batch_id;

    -- Auditar
    PERFORM public.log_admin_action(
        'delete_synthetic_batch',
        'synthetic_seed_batches',
        v_batch_id::text,
        jsonb_build_object(
            'label', p_label,
            'users_deleted', v_users_deleted,
            'signals_deleted', v_signals_deleted
        )
    );

    RETURN jsonb_build_object(
        'batch_id', v_batch_id,
        'label', p_label,
        'users_deleted', v_users_deleted,
        'signals_deleted', v_signals_deleted
    );
END;
$$;

COMMENT ON FUNCTION public.delete_synthetic_batch(text) IS
    'Borra señales + usuarios sintéticos del batch dado. Solo admin. Marca el batch como deleted.';

REVOKE ALL ON FUNCTION public.delete_synthetic_batch(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_synthetic_batch(text) TO authenticated;

-- ---------------------------------------------------------------------
-- 6. RPC: delete_all_synthetic_data
-- ---------------------------------------------------------------------
-- Limpieza total: borra TODO lo marcado como sintético, ignorando batches.
-- Requiere parámetro de confirmación literal para prevenir accidentes.
-- Pensada para uso final antes de publicación pública.
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
BEGIN
    -- Guard
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Confirmación literal obligatoria
    IF p_confirm IS DISTINCT FROM 'YES_DELETE_ALL_SYNTHETIC' THEN
        RAISE EXCEPTION 'CONFIRM_REQUIRED: pasa p_confirm := ''YES_DELETE_ALL_SYNTHETIC'' para ejecutar' USING ERRCODE = '22023';
    END IF;

    -- 1) Borrar señales sintéticas (por meta o por user_id sintético)
    DELETE FROM public.signal_events
    WHERE meta->>'synthetic' = 'true'
       OR user_id IN (
            SELECT user_id FROM public.users WHERE is_synthetic = true
       );
    GET DIAGNOSTICS v_signals_deleted = ROW_COUNT;

    -- 2) Borrar usuarios sintéticos de auth.users (cascade a public.*)
    DELETE FROM auth.users
    WHERE id IN (
        SELECT user_id FROM public.users WHERE is_synthetic = true
    )
    OR raw_user_meta_data->>'synthetic' = 'true';
    GET DIAGNOSTICS v_users_deleted = ROW_COUNT;

    -- 3) Marcar todos los batches vivos como deleted
    UPDATE public.synthetic_seed_batches
    SET deleted_at = now(),
        deleted_by = auth.uid()
    WHERE deleted_at IS NULL;
    GET DIAGNOSTICS v_batches_marked = ROW_COUNT;

    -- Auditar
    PERFORM public.log_admin_action(
        'delete_all_synthetic_data',
        'synthetic_seed_batches',
        NULL,
        jsonb_build_object(
            'users_deleted', v_users_deleted,
            'signals_deleted', v_signals_deleted,
            'batches_marked', v_batches_marked
        )
    );

    RETURN jsonb_build_object(
        'users_deleted', v_users_deleted,
        'signals_deleted', v_signals_deleted,
        'batches_marked', v_batches_marked
    );
END;
$$;

COMMENT ON FUNCTION public.delete_all_synthetic_data(text) IS
    'Limpieza total de datos sintéticos. Requiere p_confirm = ''YES_DELETE_ALL_SYNTHETIC''. Solo admin.';

REVOKE ALL ON FUNCTION public.delete_all_synthetic_data(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_all_synthetic_data(text) TO authenticated;

-- ---------------------------------------------------------------------
-- 7. Vista de resumen para el panel admin
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW public.synthetic_seed_summary AS
SELECT
    b.id,
    b.label,
    b.notes,
    b.user_count AS user_count_planned,
    (SELECT COUNT(*) FROM public.users u WHERE u.synthetic_batch_label = b.label AND u.is_synthetic = true) AS user_count_alive,
    b.signal_count AS signal_count_recorded,
    (SELECT COUNT(*) FROM public.signal_events se WHERE se.meta->>'batch' = b.label AND se.meta->>'synthetic' = 'true') AS signal_count_alive,
    b.created_at,
    b.created_by,
    b.deleted_at,
    b.deleted_by,
    (b.deleted_at IS NOT NULL) AS is_deleted
FROM public.synthetic_seed_batches b
-- Defensa en profundidad: la vista corre como su owner (postgres) y por
-- defecto saltaría el RLS de synthetic_seed_batches. Con este filtro,
-- los no-admin reciben 0 filas aunque tengan SELECT en la vista.
WHERE public.is_admin_user()
ORDER BY b.created_at DESC;

ALTER VIEW public.synthetic_seed_summary OWNER TO postgres;
GRANT SELECT ON public.synthetic_seed_summary TO authenticated;

-- ---------------------------------------------------------------------
-- 8. Refresh PostgREST schema cache
-- ---------------------------------------------------------------------

NOTIFY pgrst, 'reload schema';

COMMIT;
