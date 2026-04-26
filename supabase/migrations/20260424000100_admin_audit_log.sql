-- ============================================================
-- 20260424000100_admin_audit_log
-- ============================================================
-- Cierre del ítem #8 Media de la auditoría técnica Drimo:
-- "Tabla admin_audit_log + triggers en operaciones admin".
--
-- Diseño:
--   - Tabla inmutable: RLS solo permite SELECT a admins; INSERT
--     únicamente vía función SECURITY DEFINER log_admin_action();
--     UPDATE/DELETE totalmente prohibidos (policy + revoke).
--   - Cada operación admin de ESCRITURA ya existente se instrumenta
--     para llamar a log_admin_action al final del camino exitoso.
--   - Las operaciones de LECTURA (admin_get_*, admin_list_*,
--     admin_modules_*) NO se loggean para evitar ruido; un acceso
--     anómalo queda capturado por app_events si se escala.
--
-- Operaciones instrumentadas (6):
--   - admin_delete_invitation       → action 'delete_invitation'
--   - admin_generate_invites        → action 'generate_invites'
--   - admin_revoke_invite           → action 'revoke_invite'
--   - admin_set_analytics_mode      → action 'set_analytics_mode'
--   - admin_set_device_ban          → action 'set_device_ban'
--   - admin_set_invitation_status   → action 'set_invitation_status'
-- ============================================================

-- ------------------------------------------------------------
-- 1) Tabla admin_audit_log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id"               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at"       timestamptz NOT NULL DEFAULT now(),
    "actor_user_id"    uuid,
    "actor_email"      text,
    "action"           text        NOT NULL,
    "target_type"      text,
    "target_id"        text,
    "payload"          jsonb       NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT "admin_audit_log_actor_fk"
      FOREIGN KEY ("actor_user_id") REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT "admin_audit_log_action_nonempty_chk"
      CHECK (length(trim(action)) > 0)
);

ALTER TABLE "public"."admin_audit_log" OWNER TO postgres;

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_created_at_desc"
    ON "public"."admin_audit_log" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_actor_created"
    ON "public"."admin_audit_log" ("actor_user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_action_created"
    ON "public"."admin_audit_log" ("action", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_admin_audit_log_target"
    ON "public"."admin_audit_log" ("target_type", "target_id")
    WHERE "target_id" IS NOT NULL;

-- RLS: la tabla es inmutable para usuarios normales.
ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;

-- SELECT solo para admins (se accede vía RPC admin_list_audit_log
-- que es SECURITY DEFINER, pero permitimos también SELECT directo
-- con RLS para queries ad-hoc con service_role).
DROP POLICY IF EXISTS "admin_audit_log_admin_select" ON "public"."admin_audit_log";
CREATE POLICY "admin_audit_log_admin_select"
    ON "public"."admin_audit_log"
    FOR SELECT
    TO authenticated
    USING ( public.is_admin_user() = true );

-- Nunca se permite INSERT directo (pasa solo vía log_admin_action).
-- Nunca se permite UPDATE ni DELETE desde roles no-superuser.
DROP POLICY IF EXISTS "admin_audit_log_deny_write" ON "public"."admin_audit_log";
CREATE POLICY "admin_audit_log_deny_write"
    ON "public"."admin_audit_log"
    FOR ALL
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

REVOKE ALL ON TABLE "public"."admin_audit_log" FROM PUBLIC;
GRANT  SELECT  ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT  SELECT, INSERT ON TABLE "public"."admin_audit_log" TO "service_role";


-- ------------------------------------------------------------
-- 2) Helper: log_admin_action
--    Inserta una entrada normalizada usando auth.uid() como actor.
--    Tolerante a fallas (jamás debe romper la RPC que la invoca):
--    si falla, registra en app_events y sigue. Defensa en profundidad.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."log_admin_action"(
    "p_action"       text,
    "p_target_type"  text DEFAULT NULL,
    "p_target_id"    text DEFAULT NULL,
    "p_payload"      jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions', 'pg_temp'
    AS $$
DECLARE
    v_uid    uuid := auth.uid();
    v_email  text;
    v_id     uuid;
BEGIN
    IF p_action IS NULL OR length(trim(p_action)) = 0 THEN
        RETURN NULL;
    END IF;

    BEGIN
        SELECT au.email INTO v_email FROM auth.users au WHERE au.id = v_uid;
    EXCEPTION WHEN OTHERS THEN
        v_email := NULL;
    END;

    BEGIN
        INSERT INTO public.admin_audit_log (
            actor_user_id,
            actor_email,
            action,
            target_type,
            target_id,
            payload
        ) VALUES (
            v_uid,
            v_email,
            trim(p_action),
            NULLIF(trim(COALESCE(p_target_type, '')), ''),
            NULLIF(trim(COALESCE(p_target_id, '')), ''),
            COALESCE(p_payload, '{}'::jsonb)
        )
        RETURNING id INTO v_id;
    EXCEPTION WHEN OTHERS THEN
        -- Fallback: intentamos dejar un rastro en app_events aunque
        -- la tabla audit falle por alguna razón (permisos, lock, etc.).
        BEGIN
            INSERT INTO public.app_events (event_name, severity, user_id, context)
            VALUES ('admin_audit_log_insert_failed', 'error', v_uid,
                    jsonb_build_object(
                      'action', p_action,
                      'target_type', p_target_type,
                      'target_id', p_target_id,
                      'payload', p_payload,
                      'error_sqlerrm', SQLERRM
                    ));
        EXCEPTION WHEN OTHERS THEN
            NULL; -- last resort: ignorar en silencio
        END;
        RETURN NULL;
    END;

    RETURN v_id;
END;
$$;

ALTER FUNCTION "public"."log_admin_action"(text, text, text, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION "public"."log_admin_action"(text, text, text, jsonb) FROM PUBLIC;
-- Solo service_role la invoca desde otras SECURITY DEFINER; nunca desde cliente.
GRANT ALL ON FUNCTION "public"."log_admin_action"(text, text, text, jsonb) TO service_role;


-- ------------------------------------------------------------
-- 3) Instrumentación de las 6 RPCs admin de escritura
-- ------------------------------------------------------------

-- 3.1 admin_delete_invitation
CREATE OR REPLACE FUNCTION "public"."admin_delete_invitation"("p_invite_id" uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_code text;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    SELECT code INTO v_code FROM public.invitation_codes WHERE id = p_invite_id;

    DELETE FROM public.invitation_codes WHERE id = p_invite_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVITE_NOT_FOUND';
    END IF;

    PERFORM public.log_admin_action(
        'delete_invitation',
        'invitation_code',
        p_invite_id::text,
        jsonb_build_object('code', v_code)
    );
END;
$$;

ALTER FUNCTION "public"."admin_delete_invitation"(uuid) OWNER TO postgres;


-- 3.2 admin_generate_invites
CREATE OR REPLACE FUNCTION "public"."admin_generate_invites"(
    "p_count"             integer,
    "p_prefix"            text DEFAULT 'OP'::text,
    "p_expires_at"        timestamptz DEFAULT NULL,
    "p_assigned_aliases"  text[] DEFAULT NULL
) RETURNS TABLE(
    "id" uuid,
    "code" text,
    "assigned_alias" text,
    "status" text,
    "expires_at" timestamptz,
    "used_at" timestamptz,
    "used_by_user_id" uuid,
    "created_at" timestamptz
)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions', 'pg_temp'
    AS $$
DECLARE
    i int;
    v_code text;
    v_alias text;
    v_generated_ids uuid[] := ARRAY[]::uuid[];
    v_first_id uuid;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF p_count IS NULL OR p_count < 1 OR p_count > 500 THEN
        RAISE EXCEPTION 'INVALID_COUNT';
    END IF;

    FOR i IN 1..p_count LOOP
        v_code := upper(trim(p_prefix)) || '-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));

        v_alias := NULL;
        IF p_assigned_aliases IS NOT NULL AND array_length(p_assigned_aliases, 1) >= i THEN
            v_alias := p_assigned_aliases[i];
        END IF;

        INSERT INTO public.invitation_codes (
            code, assigned_alias, expires_at, status, max_uses, current_uses, issued_to_label, created_by
        )
        VALUES (
            v_code, v_alias, p_expires_at, 'active', 1, 0, 'admin_generate_invites', auth.uid()
        )
        RETURNING
            invitation_codes.id,
            invitation_codes.code,
            invitation_codes.assigned_alias,
            invitation_codes.status,
            invitation_codes.expires_at,
            invitation_codes.used_at,
            invitation_codes.used_by_user_id,
            invitation_codes.created_at
        INTO
            id, code, assigned_alias, status, expires_at, used_at, used_by_user_id, created_at;

        v_generated_ids := v_generated_ids || id;
        IF v_first_id IS NULL THEN v_first_id := id; END IF;

        RETURN NEXT;
    END LOOP;

    -- Log al final: un único registro por batch con el count + lista de ids.
    PERFORM public.log_admin_action(
        'generate_invites',
        'invitation_code',
        CASE WHEN array_length(v_generated_ids, 1) = 1 THEN v_first_id::text ELSE NULL END,
        jsonb_build_object(
            'count', COALESCE(array_length(v_generated_ids, 1), 0),
            'prefix', upper(trim(COALESCE(p_prefix, 'OP'))),
            'expires_at', p_expires_at,
            'has_aliases', p_assigned_aliases IS NOT NULL,
            'invite_ids', to_jsonb(v_generated_ids)
        )
    );
END;
$$;

ALTER FUNCTION "public"."admin_generate_invites"(integer, text, timestamptz, text[]) OWNER TO postgres;


-- 3.3 admin_revoke_invite
CREATE OR REPLACE FUNCTION "public"."admin_revoke_invite"("p_code" text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_updated int;
    v_invite_id uuid;
BEGIN
    IF public.is_admin_user() = false THEN
        PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
    END IF;

    SELECT id INTO v_invite_id
      FROM public.invitation_codes
     WHERE code = p_code
     LIMIT 1;

    UPDATE public.invitation_codes
       SET status = 'revoked'
     WHERE code = p_code
       AND status = 'active'
       AND used_by_user_id IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_ALREADY_USED');
    END IF;

    PERFORM public.log_admin_action(
        'revoke_invite',
        'invitation_code',
        COALESCE(v_invite_id::text, p_code),
        jsonb_build_object('code', p_code, 'invite_id', v_invite_id)
    );

    RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ADMIN_RPC_FAILED');
END;
$$;

ALTER FUNCTION "public"."admin_revoke_invite"(text) OWNER TO postgres;


-- 3.4 admin_set_analytics_mode
CREATE OR REPLACE FUNCTION "public"."admin_set_analytics_mode"("p_mode" text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_mode text := lower(trim(p_mode));
    v_previous text;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
    END IF;

    IF v_mode NOT IN ('all','clean') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'INVALID_MODE');
    END IF;

    SELECT value INTO v_previous FROM public.app_config WHERE key = 'analytics_mode';

    INSERT INTO public.app_config(key, value, updated_at)
    VALUES ('analytics_mode', v_mode, now())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at;

    PERFORM public.log_admin_action(
        'set_analytics_mode',
        'app_config',
        'analytics_mode',
        jsonb_build_object('previous', v_previous, 'next', v_mode)
    );

    RETURN jsonb_build_object('ok', true, 'mode', v_mode);
END;
$$;

ALTER FUNCTION "public"."admin_set_analytics_mode"(text) OWNER TO postgres;


-- 3.5 admin_set_device_ban
CREATE OR REPLACE FUNCTION "public"."admin_set_device_ban"(
    "p_device_hash" text,
    "p_banned"      boolean,
    "p_reason"      text DEFAULT NULL
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_hash text := trim(p_device_hash);
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
    END IF;

    IF v_hash IS NULL OR length(v_hash) < 8 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE_HASH');
    END IF;

    INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details, banned, banned_at, banned_reason, is_active)
    VALUES (v_hash, 'manual_ban', 'critical', '{}'::jsonb, p_banned, CASE WHEN p_banned THEN now() ELSE NULL END, p_reason, true)
    ON CONFLICT (device_hash, flag_type) DO UPDATE
      SET banned = EXCLUDED.banned,
          banned_at = EXCLUDED.banned_at,
          banned_reason = EXCLUDED.banned_reason,
          is_active = true;

    PERFORM public.log_admin_action(
        'set_device_ban',
        'device_hash',
        v_hash,
        jsonb_build_object('banned', p_banned, 'reason', p_reason)
    );

    RETURN jsonb_build_object('ok', true);
END;
$$;

ALTER FUNCTION "public"."admin_set_device_ban"(text, boolean, text) OWNER TO postgres;


-- 3.6 admin_set_invitation_status
CREATE OR REPLACE FUNCTION "public"."admin_set_invitation_status"(
    "p_invite_id" uuid,
    "p_status"    text
) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    v_status   text := lower(trim(coalesce(p_status,'')));
    v_previous text;
BEGIN
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    IF v_status NOT IN ('active','revoked') THEN
        RAISE EXCEPTION 'INVALID_STATUS';
    END IF;

    SELECT status INTO v_previous FROM public.invitation_codes WHERE id = p_invite_id;

    UPDATE public.invitation_codes
       SET status = v_status
     WHERE id = p_invite_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVITE_NOT_FOUND';
    END IF;

    PERFORM public.log_admin_action(
        'set_invitation_status',
        'invitation_code',
        p_invite_id::text,
        jsonb_build_object('previous', v_previous, 'next', v_status)
    );
END;
$$;

ALTER FUNCTION "public"."admin_set_invitation_status"(uuid, text) OWNER TO postgres;


-- ------------------------------------------------------------
-- 4) Consulta: admin_list_audit_log
--    Para que el dashboard admin pueda mostrar el trail.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."admin_list_audit_log"(
    "p_limit"  integer DEFAULT 200,
    "p_action" text    DEFAULT NULL
) RETURNS TABLE(
    "id"            uuid,
    "created_at"    timestamptz,
    "actor_user_id" uuid,
    "actor_email"   text,
    "action"        text,
    "target_type"   text,
    "target_id"     text,
    "payload"       jsonb
)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
    SELECT l.id, l.created_at, l.actor_user_id, l.actor_email,
           l.action, l.target_type, l.target_id, l.payload
      FROM public.admin_audit_log l
     WHERE public.is_admin_user() = true
       AND (p_action IS NULL OR l.action = p_action)
     ORDER BY l.created_at DESC
     LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

ALTER FUNCTION "public"."admin_list_audit_log"(integer, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION "public"."admin_list_audit_log"(integer, text) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_list_audit_log"(integer, text) TO authenticated;
GRANT ALL ON FUNCTION "public"."admin_list_audit_log"(integer, text) TO service_role;


-- ------------------------------------------------------------
-- Notas de operación
-- ------------------------------------------------------------
-- Ver últimas 50 acciones admin:
--   SELECT * FROM public.admin_list_audit_log(50, NULL);
--
-- Ver solo revocaciones de invite:
--   SELECT * FROM public.admin_list_audit_log(200, 'revoke_invite');
--
-- Ver acciones de un admin específico (RLS requerirá is_admin_user()=true):
--   SELECT * FROM public.admin_audit_log
--   WHERE actor_email = 'admin@opina.com'
--   ORDER BY created_at DESC LIMIT 100;
-- ============================================================
