-- =====================================================================
-- Persistir device_hash en user_sessions — #9 Media de la auditoría Drimo
-- ---------------------------------------------------------------------
-- Objetivo: capturar el device fingerprint determinístico al loguearse,
-- para detectar abuso multi-cuenta (1 device → N usuarios distintos).
--
-- Esto se suma — NO reemplaza — al sistema antifraude existente
-- (`admin_antifraud_flags` + `admin_set_device_ban`) que usa el hash
-- legacy de `signal_events`. La migración agrega una capa nueva sobre
-- `user_sessions` con un hash determinístico (SHA-256 puro, sin
-- randomUUID) generado por `src/lib/deviceFingerprint.ts`.
--
-- Diseño:
--   - Nueva columna user_sessions.device_hash (text)
--   - Índice compuesto (device_hash, created_at DESC) para queries
--     de "qué usuarios usaron este device en los últimos N días"
--   - register_user_session ahora acepta p_device_hash
--   - 2 RPCs admin nuevas:
--       * admin_find_multi_account_devices(min_users, since_days)
--       * admin_list_device_users(device_hash, since_days)
--   - Ambas loguean en admin_audit_log
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Columna y índice
-- ---------------------------------------------------------------------
ALTER TABLE public.user_sessions
    ADD COLUMN IF NOT EXISTS device_hash text NULL;

COMMENT ON COLUMN public.user_sessions.device_hash IS
    'SHA-256 hex truncado a 32 chars del fingerprint determinístico del navegador (ver src/lib/deviceFingerprint.ts). Usado para detección de abuso multi-cuenta. NULL para sesiones registradas antes de #9 Media.';

CREATE INDEX IF NOT EXISTS user_sessions_device_hash_idx
    ON public.user_sessions(device_hash, created_at DESC)
    WHERE device_hash IS NOT NULL;

-- ---------------------------------------------------------------------
-- 2) Reemplazar register_user_session para aceptar p_device_hash
--    Mantiene firma backwards-compatible (default NULL) por si alguna
--    pestaña vieja sigue corriendo el código sin device_hash.
--    Postgres no permite CREATE OR REPLACE cuando cambian los DEFAULTs
--    de una función existente → dropeamos ambas versiones primero.
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.register_user_session(text, text);
DROP FUNCTION IF EXISTS public.register_user_session(text, text, text);

CREATE OR REPLACE FUNCTION public.register_user_session(
    p_device_label text DEFAULT NULL,
    p_user_agent   text DEFAULT NULL,
    p_device_hash  text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid         uuid;
    v_session_id  uuid;
    v_revoked     int;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '28000';
    END IF;

    -- Revocar las sesiones anteriores activas del mismo user
    UPDATE public.user_sessions
       SET revoked_at     = now(),
           revoked_reason = 'superseded_by_new_login'
     WHERE user_id = v_uid
       AND revoked_at IS NULL;
    GET DIAGNOSTICS v_revoked = ROW_COUNT;

    -- Insertar nueva fila activa con device_hash
    INSERT INTO public.user_sessions (user_id, device_label, user_agent, device_hash)
    VALUES (
        v_uid,
        left(coalesce(p_device_label, ''), 120),
        left(coalesce(p_user_agent, ''), 500),
        nullif(left(coalesce(p_device_hash, ''), 64), '')
    )
    RETURNING id INTO v_session_id;

    -- Log best-effort en app_events para observabilidad
    BEGIN
        INSERT INTO public.app_events (event_name, severity, user_id, context)
        VALUES (
            'user_session_registered',
            'info',
            v_uid,
            jsonb_build_object(
                'session_id', v_session_id,
                'superseded_count', v_revoked,
                'device_label', p_device_label,
                'has_device_hash', p_device_hash IS NOT NULL
            )
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN jsonb_build_object(
        'ok', true,
        'session_id', v_session_id,
        'superseded_count', v_revoked
    );
END;
$$;

REVOKE ALL ON FUNCTION public.register_user_session(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_user_session(text, text, text) TO authenticated;

-- Mantener la firma vieja (sin p_device_hash) como wrapper para que el
-- código viejo no rompa durante un deploy en transición.
CREATE OR REPLACE FUNCTION public.register_user_session(
    p_device_label text,
    p_user_agent   text
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.register_user_session(p_device_label, p_user_agent, NULL);
$$;

REVOKE ALL ON FUNCTION public.register_user_session(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_user_session(text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 3) RPC: admin_find_multi_account_devices
--    Lista device_hashes con N+ usuarios distintos en los últimos
--    `p_since_days` días. Núcleo de la detección de multi-cuenta.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_find_multi_account_devices(
    p_min_users   int DEFAULT 3,
    p_since_days  int DEFAULT 30
)
RETURNS TABLE (
    device_hash       text,
    distinct_users    int,
    total_sessions    int,
    first_seen_at     timestamptz,
    last_seen_at      timestamptz,
    has_active        boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    -- Audit log: el admin consultó multi-cuenta
    PERFORM public.log_admin_action(
        'find_multi_account_devices',
        'device_hash',
        'aggregate',
        jsonb_build_object('min_users', p_min_users, 'since_days', p_since_days)
    );

    RETURN QUERY
    SELECT
        s.device_hash,
        COUNT(DISTINCT s.user_id)::int             AS distinct_users,
        COUNT(*)::int                              AS total_sessions,
        MIN(s.created_at)                          AS first_seen_at,
        MAX(s.last_seen_at)                        AS last_seen_at,
        bool_or(s.revoked_at IS NULL)              AS has_active
      FROM public.user_sessions s
     WHERE s.device_hash IS NOT NULL
       AND s.created_at > now() - make_interval(days => greatest(p_since_days, 1))
     GROUP BY s.device_hash
    HAVING COUNT(DISTINCT s.user_id) >= greatest(p_min_users, 2)
     ORDER BY COUNT(DISTINCT s.user_id) DESC, MAX(s.last_seen_at) DESC
     LIMIT 200;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_find_multi_account_devices(int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_find_multi_account_devices(int, int) TO authenticated;

-- ---------------------------------------------------------------------
-- 4) RPC: admin_list_device_users
--    Detalle: dado un device_hash, lista los usuarios que se loguearon
--    desde ese device (con counts y fechas).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_device_users(
    p_device_hash text,
    p_since_days  int DEFAULT 30
)
RETURNS TABLE (
    user_id          uuid,
    user_email       text,
    sessions_count   int,
    first_seen_at    timestamptz,
    last_seen_at     timestamptz,
    has_active       boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    IF p_device_hash IS NULL OR length(trim(p_device_hash)) = 0 THEN
        RAISE EXCEPTION 'EMPTY_DEVICE_HASH' USING ERRCODE = '22023';
    END IF;

    -- Audit log: el admin consultó los users de un device
    PERFORM public.log_admin_action(
        'list_device_users',
        'device_hash',
        p_device_hash,
        jsonb_build_object('since_days', p_since_days)
    );

    RETURN QUERY
    SELECT
        s.user_id,
        u.email::text                              AS user_email,
        COUNT(*)::int                              AS sessions_count,
        MIN(s.created_at)                          AS first_seen_at,
        MAX(s.last_seen_at)                        AS last_seen_at,
        bool_or(s.revoked_at IS NULL)              AS has_active
      FROM public.user_sessions s
      LEFT JOIN auth.users u ON u.id = s.user_id
     WHERE s.device_hash = p_device_hash
       AND s.created_at > now() - make_interval(days => greatest(p_since_days, 1))
     GROUP BY s.user_id, u.email
     ORDER BY MAX(s.last_seen_at) DESC
     LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_device_users(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_device_users(text, int) TO authenticated;

COMMIT;
