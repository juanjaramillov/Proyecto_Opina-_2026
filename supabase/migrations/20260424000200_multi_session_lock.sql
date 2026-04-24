-- =====================================================================
-- Multi-session lock — #5 Media de la auditoría Drimo
-- ---------------------------------------------------------------------
-- Objetivo: garantizar "una sola sesión activa por usuario".
-- Al loguearse en un nuevo dispositivo, las sesiones anteriores del
-- mismo usuario quedan revocadas (revoked_at IS NOT NULL). El cliente
-- pingea periódicamente al servidor y, si recibe active=false, hace
-- signOut() local.
--
-- Esto NO depende del JWT ni de la rotación de refresh tokens — es una
-- capa de aplicación que se suma a la rotación nativa de Supabase.
--
-- Diseño:
--   - Tabla public.user_sessions (append-only; solo se marca revoked_at)
--   - RLS: cada usuario ve solo SUS sesiones; admins ven todo
--   - 5 RPCs: register / ping / revoke_others / list_active / revoke_one
--   - Integrado con admin_audit_log SOLO cuando un admin revoca a mano
--     una sesión ajena
--   - Se apoya en app_events como fallback para no romper si algo falla
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Tabla
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_seen_at    timestamptz NOT NULL DEFAULT now(),
    revoked_at      timestamptz NULL,
    revoked_reason  text        NULL,           -- superseded_by_new_login | manual_user | manual_admin | expired_idle
    device_label    text        NULL,
    user_agent      text        NULL,
    ip_addr         inet        NULL
);

COMMENT ON TABLE public.user_sessions IS
    'Registro de sesiones activas por usuario. Usado por useSessionGuard para cerrar sesión remota cuando se loguea otro dispositivo (#5 Media Drimo).';

CREATE INDEX IF NOT EXISTS user_sessions_user_active_idx
    ON public.user_sessions(user_id, created_at DESC)
    WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS user_sessions_last_seen_idx
    ON public.user_sessions(last_seen_at DESC);

-- ---------------------------------------------------------------------
-- 2) RLS
-- ---------------------------------------------------------------------
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: el propio user o admin
DROP POLICY IF EXISTS user_sessions_select_own_or_admin ON public.user_sessions;
CREATE POLICY user_sessions_select_own_or_admin
    ON public.user_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin_user());

-- Bloquear INSERT/UPDATE/DELETE directos — TODO pasa por RPCs SECURITY DEFINER
DROP POLICY IF EXISTS user_sessions_block_direct_writes ON public.user_sessions;
CREATE POLICY user_sessions_block_direct_writes
    ON public.user_sessions
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);

REVOKE ALL ON public.user_sessions FROM PUBLIC;
REVOKE ALL ON public.user_sessions FROM anon;
GRANT SELECT ON public.user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_sessions TO service_role;

-- ---------------------------------------------------------------------
-- 3) RPC: register_user_session
--    Registra una nueva sesión y REVOCA TODAS las anteriores activas
--    del mismo user. Idempotente via onAuthStateChange + localStorage
--    check del cliente (si ya hay session_id, el hook NO llama de vuelta).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_user_session(
    p_device_label text DEFAULT NULL,
    p_user_agent   text DEFAULT NULL
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

    -- Insertar nueva fila activa
    INSERT INTO public.user_sessions (user_id, device_label, user_agent)
    VALUES (v_uid, left(coalesce(p_device_label, ''), 120), left(coalesce(p_user_agent, ''), 500))
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
                'device_label', p_device_label
            )
        );
    EXCEPTION WHEN OTHERS THEN
        NULL; -- no romper el login si app_events no está disponible
    END;

    RETURN jsonb_build_object(
        'ok', true,
        'session_id', v_session_id,
        'superseded_count', v_revoked
    );
END;
$$;

REVOKE ALL ON FUNCTION public.register_user_session(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_user_session(text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 4) RPC: ping_user_session
--    Verifica que la sesión del cliente sigue activa y actualiza
--    last_seen_at. Llamada cada 30s desde el hook. Si devuelve
--    active=false, el cliente hace signOut().
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ping_user_session(
    p_session_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid   uuid;
    v_row   public.user_sessions%ROWTYPE;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '28000';
    END IF;

    SELECT * INTO v_row
      FROM public.user_sessions
     WHERE id = p_session_id
       AND user_id = v_uid;

    -- No existe o no te pertenece → active=false (pero no filtramos info)
    IF v_row.id IS NULL THEN
        RETURN jsonb_build_object('active', false, 'reason', 'not_found');
    END IF;

    -- Revocada → active=false + motivo
    IF v_row.revoked_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'active', false,
            'reason', coalesce(v_row.revoked_reason, 'revoked')
        );
    END IF;

    -- Activa → update last_seen y responder ok
    UPDATE public.user_sessions
       SET last_seen_at = now()
     WHERE id = p_session_id;

    RETURN jsonb_build_object('active', true);
END;
$$;

REVOKE ALL ON FUNCTION public.ping_user_session(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ping_user_session(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 5) RPC: list_my_active_sessions
--    Lista las sesiones activas del usuario — para futura UI
--    "Mis dispositivos activos" (estilo Google).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_my_active_sessions()
RETURNS TABLE (
    session_id   uuid,
    created_at   timestamptz,
    last_seen_at timestamptz,
    device_label text,
    user_agent   text,
    is_current   boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT
        s.id,
        s.created_at,
        s.last_seen_at,
        s.device_label,
        s.user_agent,
        false  -- el cliente compara con su session_id local
      FROM public.user_sessions s
     WHERE s.user_id = auth.uid()
       AND s.revoked_at IS NULL
     ORDER BY s.last_seen_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_my_active_sessions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_active_sessions() TO authenticated;

-- ---------------------------------------------------------------------
-- 6) RPC: revoke_my_session
--    El usuario cierra una sesión puntual suya (desde "Mis dispositivos").
--    Si revoca la propia, el ping siguiente la cerrará local-side.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_my_session(
    p_session_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid uuid;
    v_rc  int;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '28000';
    END IF;

    UPDATE public.user_sessions
       SET revoked_at     = now(),
           revoked_reason = 'manual_user'
     WHERE id = p_session_id
       AND user_id = v_uid
       AND revoked_at IS NULL;
    GET DIAGNOSTICS v_rc = ROW_COUNT;

    RETURN jsonb_build_object('ok', v_rc > 0, 'revoked_count', v_rc);
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_my_session(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_my_session(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 7) RPC: admin_revoke_user_sessions
--    Admin herramienta: revocar TODAS las sesiones de un usuario
--    (útil si se detecta abuso o se pierde un device).
--    Loguea en admin_audit_log.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_revoke_user_sessions(
    p_user_id uuid,
    p_reason  text DEFAULT 'manual_admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rc int;
BEGIN
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN' USING ERRCODE = '42501';
    END IF;

    UPDATE public.user_sessions
       SET revoked_at     = now(),
           revoked_reason = coalesce(nullif(p_reason, ''), 'manual_admin')
     WHERE user_id = p_user_id
       AND revoked_at IS NULL;
    GET DIAGNOSTICS v_rc = ROW_COUNT;

    -- Bitácora admin (helper de la migración 20260424000100)
    PERFORM public.log_admin_action(
        'revoke_user_sessions',
        'user_id',
        p_user_id::text,
        jsonb_build_object('revoked_count', v_rc, 'reason', p_reason)
    );

    RETURN jsonb_build_object('ok', true, 'revoked_count', v_rc);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_user_sessions(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_revoke_user_sessions(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 8) Mantenimiento: revocar sesiones idle > N días
--    Llamada opcional desde la Edge Function cleanup-orphan-users.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_idle_user_sessions(
    p_idle_days int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rc int;
BEGIN
    UPDATE public.user_sessions
       SET revoked_at     = now(),
           revoked_reason = 'expired_idle'
     WHERE revoked_at IS NULL
       AND last_seen_at < now() - make_interval(days => greatest(p_idle_days, 1));
    GET DIAGNOSTICS v_rc = ROW_COUNT;

    RETURN jsonb_build_object('ok', true, 'revoked_count', v_rc, 'idle_days', p_idle_days);
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_idle_user_sessions(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_idle_user_sessions(int) TO service_role;

COMMIT;
