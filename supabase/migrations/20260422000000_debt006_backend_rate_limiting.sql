-- =========================================================================
-- OPINA+ · DEBT-006 BACKEND · Rate Limiting authoritative
-- =========================================================================
--
-- Cierra la mitad backend de DEBT-006. El cliente ya trae `signalRateLimiter.ts`
-- con token bucket per-módulo (MIN_INTERVAL_MS=250, caps 40/100 per min), pero
-- el backend seguía confiando en eso. Esta migración:
--
--   1. Introduce `public.enforce_signal_rate_limit(user_id, anon_id, module_type)`
--      que replica el cap por módulo usando `signal_events` (no hace falta tabla
--      nueva — ya está poblada por el RPC). Levanta `RATE_LIMITED`.
--
--   2. Introduce `public.pilot_access_attempts` + `enforce_pilot_access_rate_limit()`
--      para `grant_pilot_access`: máximo 5 intentos / 60 segundos por `auth.uid()`.
--      Anti brute-force de códigos de piloto.
--
--   3. Reescribe `insert_signal_event` para llamar a (1) y `grant_pilot_access`
--      para llamar a (2). Cambios conservadores: sólo agrego el check, no muevo
--      nada más.
--
-- Límites deliberados (mismos que cliente — *la UI ya se porta bien con ellos*):
--   - versus / progressive / pulse: 40 signals / 60s
--   - depth / news:                 100 signals / 60s
--   - default:                      60 signals / 60s
--
-- Idempotente: usa `CREATE OR REPLACE` para funciones y `IF NOT EXISTS` para
-- tablas/índices.
--
-- =========================================================================

BEGIN;

-- ---- 1. Tabla de intentos de pilot access (anti brute-force) -----------
CREATE TABLE IF NOT EXISTS public.pilot_access_attempts (
    id          bigserial PRIMARY KEY,
    user_id     uuid NOT NULL,
    attempted_at timestamptz NOT NULL DEFAULT now(),
    succeeded   boolean NOT NULL
);

-- Índice sobre (user_id, attempted_at DESC) para lookup barato de la ventana.
CREATE INDEX IF NOT EXISTS idx_pilot_access_attempts_user_time
    ON public.pilot_access_attempts (user_id, attempted_at DESC);

-- RLS: sólo admins/service_role pueden leer; anon/authenticated no deben ver
-- los intentos ajenos. El INSERT lo hace la función SECURITY DEFINER, no el
-- cliente directo, así que la policy es "no read for non-admin, no insert from
-- clients directamente".
ALTER TABLE public.pilot_access_attempts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'pilot_access_attempts' AND policyname = 'pilot_access_attempts_admin_read'
    ) THEN
        CREATE POLICY "pilot_access_attempts_admin_read" ON public.pilot_access_attempts
            FOR SELECT TO authenticated
            USING (EXISTS (SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.role = 'admin'));
    END IF;
END$$;

-- ---- 2. Helper: rate limit por módulo sobre signal_events --------------
CREATE OR REPLACE FUNCTION public.enforce_signal_rate_limit(
    p_user_id uuid,
    p_anon_id text,
    p_module_type text
) RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public, pg_temp'
AS $$
DECLARE
    v_cap       int;
    v_used      int;
    v_window    interval := interval '60 seconds';
BEGIN
    -- Mismos caps que el cliente (`signalRateLimiter.ts`). Mantener en sync:
    -- si alguien sube el cap aquí también debe subirlo en el cliente, o la UX
    -- se queda bloqueando sin motivo.
    v_cap := CASE lower(COALESCE(p_module_type, ''))
        WHEN 'versus'      THEN 40
        WHEN 'progressive' THEN 40
        WHEN 'pulse'       THEN 40
        WHEN 'depth'       THEN 100
        WHEN 'news'        THEN 100
        ELSE 60
    END;

    -- Contamos por (user_id OR anon_id), ambos porque el RPC escribe ambos
    -- pero el anon_id es más estable cuando el JWT expira.
    SELECT count(*)::int INTO v_used
    FROM public.signal_events se
    WHERE se.module_type = p_module_type
      AND se.created_at > now() - v_window
      AND (
           (p_user_id IS NOT NULL AND se.user_id = p_user_id)
        OR (p_anon_id IS NOT NULL AND se.anon_id = p_anon_id)
      );

    IF v_used >= v_cap THEN
        PERFORM public.raise_sanitized('RATE_LIMITED');
    END IF;
END;
$$;

ALTER FUNCTION public.enforce_signal_rate_limit(uuid, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.enforce_signal_rate_limit(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_signal_rate_limit(uuid, text, text) TO authenticated, service_role;

-- ---- 3. Helper: rate limit para grant_pilot_access ----------------------
CREATE OR REPLACE FUNCTION public.enforce_pilot_access_rate_limit() RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public, pg_temp'
AS $$
DECLARE
    v_uid       uuid := auth.uid();
    v_attempts  int;
    v_window    interval := interval '60 seconds';
    v_cap       int := 5;   -- 5 intentos / minuto por usuario anónimo o autenticado
BEGIN
    IF v_uid IS NULL THEN
        -- Sin sesión (incluso anon) no hay cómo atribuir rate — rechazar.
        PERFORM public.raise_sanitized('Unauthorized');
    END IF;

    SELECT count(*)::int INTO v_attempts
    FROM public.pilot_access_attempts
    WHERE user_id = v_uid
      AND attempted_at > now() - v_window;

    IF v_attempts >= v_cap THEN
        PERFORM public.raise_sanitized('RATE_LIMITED');
    END IF;
END;
$$;

ALTER FUNCTION public.enforce_pilot_access_rate_limit() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.enforce_pilot_access_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_pilot_access_rate_limit() TO authenticated, anon, service_role;

-- ---- 4. grant_pilot_access: registrar intento + enforce rate limit ------
CREATE OR REPLACE FUNCTION public.grant_pilot_access(p_code text) RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public, extensions, pg_temp'
AS $$
DECLARE
    is_valid boolean;
    curr_uid uuid := auth.uid();
BEGIN
    -- 1. Rate limit primero (si exceden, ni siquiera validamos el código).
    PERFORM public.enforce_pilot_access_rate_limit();

    -- 2. Validación real.
    is_valid := public.validate_invitation(p_code);

    -- 3. Auditar el intento (sea éxito o fallo) para alimentar el rate limit
    --    de los próximos requests. Si no hay uid, igualmente `enforce_…`
    --    ya levantó Unauthorized antes, así que curr_uid no será NULL aquí.
    INSERT INTO public.pilot_access_attempts (user_id, succeeded)
    VALUES (curr_uid, COALESCE(is_valid, false));

    IF is_valid THEN
        IF curr_uid IS NOT NULL THEN
            UPDATE auth.users
            SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"access_granted": true}'::jsonb
            WHERE id = curr_uid;
            RETURN true;
        END IF;
    END IF;

    RETURN false;
END;
$$;

ALTER FUNCTION public.grant_pilot_access(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.grant_pilot_access(text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.grant_pilot_access(text) TO anon, authenticated, service_role;

-- ---- 5. insert_signal_event: llamar al rate limit por módulo -----------
-- Reescribimos el cuerpo pero mantenemos firma exacta (V14). Sólo añadimos
-- `PERFORM public.enforce_signal_rate_limit(...)` después de resolver anon_id
-- y ANTES del cooldown por battle, para que el error sea siempre RATE_LIMITED
-- cuando el usuario está abusando, y COOLDOWN_ACTIVE sólo cuando es spam en un
-- mismo battle.
CREATE OR REPLACE FUNCTION public.insert_signal_event(
    p_battle_id uuid DEFAULT NULL,
    p_option_id uuid DEFAULT NULL,
    p_session_id uuid DEFAULT NULL,
    p_attribute_id uuid DEFAULT NULL,
    p_client_event_id uuid DEFAULT NULL,
    p_device_hash text DEFAULT NULL,
    p_value_json jsonb DEFAULT '{}'::jsonb,
    p_signal_type_code text DEFAULT 'VERSUS_SIGNAL',
    p_module_type text DEFAULT 'versus',
    p_entity_id uuid DEFAULT NULL,
    p_entity_type text DEFAULT NULL,
    p_context_id text DEFAULT NULL,
    p_value_numeric numeric DEFAULT NULL,
    p_value_text text DEFAULT NULL,
    p_event_status text DEFAULT NULL,
    p_origin_module text DEFAULT NULL,
    p_origin_element text DEFAULT NULL,
    p_question_id uuid DEFAULT NULL,
    p_question_version int4 DEFAULT NULL,
    p_display_order int4 DEFAULT NULL,
    p_response_time_ms int4 DEFAULT NULL,
    p_sequence_id uuid DEFAULT NULL,
    p_sequence_order int4 DEFAULT NULL,
    p_content_snapshot_id uuid DEFAULT NULL,
    p_left_entity_id uuid DEFAULT NULL,
    p_right_entity_id uuid DEFAULT NULL,
    p_selected_entity_id uuid DEFAULT NULL,
    p_interaction_outcome text DEFAULT NULL
) RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_anon_id text;
    v_instance_id uuid := NULL;

    v_invite_id uuid;
    v_is_verified boolean := false;
    v_role text;

    v_profile_stage int := 0;
    v_user_weight numeric := 1.0;

    v_daily_actions int := 0;
    v_daily_cap int := 20;

    v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());

    v_signal_type_id bigint;
    v_final_value_json jsonb := p_value_json;
    v_final_entity_id uuid := p_entity_id;

BEGIN
    -- Anti-spam device-level (sin cambio)
    IF p_device_hash IS NOT NULL THEN
        PERFORM 1 FROM public.antifraud_flags f WHERE f.device_hash = p_device_hash AND f.banned = true AND f.is_active = true LIMIT 1;
        IF FOUND THEN PERFORM public.raise_sanitized('DEVICE_BANNED'); END IF;

        PERFORM 1 FROM public.antifraud_flags f WHERE f.device_hash = p_device_hash AND f.is_active = true AND f.banned = false AND lower(f.severity) = 'critical' LIMIT 1;
        IF FOUND THEN
            IF (SELECT COUNT(*)::int FROM public.signal_events se WHERE se.device_hash = p_device_hash AND se.created_at > now() - interval '10 minutes') >= 30 THEN
                PERFORM public.raise_sanitized('THROTTLED');
            END IF;
        END IF;
    END IF;

    IF v_uid IS NULL THEN
        PERFORM public.raise_sanitized('Unauthorized');
    END IF;

    SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false), COALESCE(u.role, 'user')
        INTO v_invite_id, v_is_verified, v_role
    FROM public.users u WHERE u.user_id = v_uid LIMIT 1;

    IF v_role != 'admin' AND v_invite_id IS NULL THEN PERFORM public.raise_sanitized('INVITE_REQUIRED'); END IF;

    SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0)
        INTO v_profile_stage, v_user_weight
    FROM public.user_profiles up WHERE up.user_id = v_uid LIMIT 1;

    IF v_role != 'admin' THEN
        IF NOT FOUND THEN PERFORM public.raise_sanitized('PROFILE_MISSING'); END IF;
        IF v_profile_stage < 1 THEN PERFORM public.raise_sanitized('PROFILE_INCOMPLETE'); END IF;
    END IF;

    v_anon_id := public.get_or_create_anon_id();

    -- ===== DEBT-006 BACKEND: rate limit per-módulo antes de otros cooldowns =====
    -- Ejecuta contra `signal_events` con ventana de 60s y caps iguales al cliente.
    -- Admins NO quedan exentos: si un admin dispara 200 señales/min algo huele mal.
    PERFORM public.enforce_signal_rate_limit(v_uid, v_anon_id, p_module_type);

    -- Límite diario para no verificados (sin cambio)
    IF v_is_verified = false AND v_role != 'admin' THEN
        IF v_profile_stage = 1 THEN v_daily_cap := 10; ELSE v_daily_cap := 20; END IF;
        v_daily_actions := public.count_daily_signal_actions(v_anon_id);
        IF v_daily_actions >= v_daily_cap THEN PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED'); END IF;
    END IF;

    -- Validaciones por módulo (sin cambio respecto a V14)
    IF p_module_type IN ('versus', 'progressive') THEN
        IF p_battle_id IS NULL OR p_option_id IS NULL THEN PERFORM public.raise_sanitized('MISSING_BATTLE_ARGS'); END IF;

        PERFORM 1 FROM public.battles b WHERE b.id = p_battle_id AND COALESCE(b.status, 'active') = 'active' LIMIT 1;
        IF NOT FOUND THEN PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE'); END IF;

        PERFORM 1 FROM public.battle_options bo WHERE bo.id = p_option_id AND bo.battle_id = p_battle_id LIMIT 1;
        IF NOT FOUND THEN PERFORM public.raise_sanitized('INVALID SIGNAL PAYLOAD'); END IF;

        SELECT bi.id INTO v_instance_id FROM public.battle_instances bi WHERE bi.battle_id = p_battle_id ORDER BY bi.created_at DESC LIMIT 1;
        IF v_instance_id IS NULL THEN PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE'); END IF;

        v_final_entity_id := public.resolve_entity_id(p_option_id);

        PERFORM 1 FROM public.signal_events
        WHERE anon_id = v_anon_id
          AND (battle_id = p_battle_id OR entity_id = p_battle_id)
          AND created_at > now() - interval '5 minutes'
        LIMIT 1;
        IF FOUND THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;

    ELSE
        IF p_entity_id IS NULL THEN
            v_final_entity_id := p_battle_id;
        END IF;

        IF v_final_entity_id IS NOT NULL THEN
            PERFORM 1 FROM public.signal_events
            WHERE anon_id = v_anon_id
              AND module_type = p_module_type
              AND (entity_id = v_final_entity_id OR battle_id = v_final_entity_id)
              AND COALESCE(context_id, '') = COALESCE(p_context_id, '')
              AND created_at > now() - interval '5 minutes'
            LIMIT 1;
            IF FOUND THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
        END IF;
    END IF;

    SELECT id INTO v_signal_type_id FROM public.signal_types WHERE code = p_signal_type_code LIMIT 1;

    IF v_final_value_json ? 'loser_option_id' AND (v_final_value_json->>'loser_option_id') IS NOT NULL THEN
        v_final_value_json := v_final_value_json || jsonb_build_object('loser_entity_id', public.resolve_entity_id((v_final_value_json->>'loser_option_id')::uuid));
    END IF;

    INSERT INTO public.signal_events (
        anon_id, user_id,
        signal_id, battle_id, battle_instance_id, option_id,
        entity_id, entity_type, module_type,
        context_id, session_id, attribute_id,
        signal_weight,
        client_event_id,
        device_hash,
        value_json,
        value_numeric,
        value_text,
        signal_type_id,
        event_status,
        origin_module,
        origin_element,
        question_id,
        question_version,
        display_order,
        response_time_ms,
        sequence_id,
        sequence_order,
        content_snapshot_id,
        left_entity_id,
        right_entity_id,
        selected_entity_id,
        interaction_outcome
    )
    VALUES (
        v_anon_id, v_uid,
        gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
        v_final_entity_id, p_entity_type, p_module_type,
        p_context_id, p_session_id, p_attribute_id,
        COALESCE(v_user_weight, 1.0),
        v_client_event_id,
        p_device_hash,
        v_final_value_json,
        p_value_numeric,
        COALESCE(p_value_text, p_option_id::text),
        v_signal_type_id,
        p_event_status,
        p_origin_module,
        p_origin_element,
        p_question_id,
        p_question_version,
        p_display_order,
        p_response_time_ms,
        p_sequence_id,
        p_sequence_order,
        p_content_snapshot_id,
        p_left_entity_id,
        p_right_entity_id,
        p_selected_entity_id,
        p_interaction_outcome
    )
    ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

    IF FOUND THEN
        INSERT INTO public.user_activity (user_id, action_type) VALUES (v_uid, 'signal_emitted');
        INSERT INTO public.user_stats (user_id, total_signals, last_signal_at) VALUES (v_uid, 1, now())
            ON CONFLICT (user_id) DO UPDATE SET total_signals = public.user_stats.total_signals + 1, last_signal_at = now();
        PERFORM public.update_trust_score(v_uid);
    END IF;
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'RATE_LIMITED' THEN PERFORM public.raise_sanitized('RATE_LIMITED'); END IF;
    IF SQLERRM = 'THROTTLED' THEN PERFORM public.raise_sanitized('THROTTLED'); END IF;
    IF SQLERRM = 'DEVICE_BANNED' THEN PERFORM public.raise_sanitized('DEVICE_BANNED'); END IF;
    IF SQLERRM = 'COOLDOWN_ACTIVE' THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
    IF SQLERRM = 'SIGNAL_LIMIT_REACHED' THEN PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED'); END IF;
    IF SQLERRM = 'INVITE_REQUIRED' THEN PERFORM public.raise_sanitized('INVITE_REQUIRED'); END IF;
    IF SQLERRM = 'PROFILE_INCOMPLETE' THEN PERFORM public.raise_sanitized('PROFILE_INCOMPLETE'); END IF;
    IF SQLERRM = 'MISSING_BATTLE_ARGS' THEN PERFORM public.raise_sanitized('MISSING_BATTLE_ARGS'); END IF;

    PERFORM public.raise_sanitized('SIGNAL_FAILED');
END;
$$;

COMMIT;
