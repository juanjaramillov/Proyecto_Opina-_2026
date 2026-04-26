-- ============================================================
-- 20260424000000_invite_atomic_lock_and_cleanup
-- ============================================================
-- Cierre del ítem #4 Alta de la auditoría técnica Drimo:
-- "Transacción + cleanup en invitaciones".
--
-- Antes de esta migración existía una ventana de inconsistencia:
--   1. User A ingresa un código en AccessGate → grant_pilot_access
--      setea access_granted=true en auth.users.raw_app_meta_data PERO
--      NO reserva el código (validate_invitation solo leía).
--   2. User A abandona el onboarding (nunca llega a bootstrap_user_after_signup_v2).
--   3. User B ingresa el mismo código → también recibe access_granted=true.
--   4. Uno solo de los dos consume el código al completar el perfil;
--      el otro queda con JWT de acceso pero sin perfil — "huésped fantasma".
--
-- Esta migración:
--   A) Reescribe `grant_pilot_access` con SELECT ... FOR UPDATE sobre
--      invitation_codes y hace un *claim tentativo* atómico usando
--      las columnas existentes `claimed_by` / `claimed_at`. El índice
--      `idx_invitation_codes_claimed_by_unique` (ya creado en baseline)
--      garantiza que un mismo usuario no pueda tener dos códigos 1:1
--      reclamados y que un código 1:1 no pueda ser reclamado por dos
--      usuarios distintos dentro del TTL.
--
--   B) Refuerza `bootstrap_user_after_signup_v2` con SELECT ... FOR UPDATE
--      al buscar el código y verifica consistencia del claim
--      (`claimed_by` debe ser NULL o igual a auth.uid()).
--
--   C) Agrega `release_stale_invite_claims(p_ttl_minutes int)`:
--      - Libera `claimed_by` / `claimed_at` de códigos 1:1 con claim
--        más viejo que el TTL y sin consumir (status='active').
--      - Revoca `access_granted` del JWT de esos usuarios si todavía
--        no tienen fila en public.user_profiles (es decir, el claim
--        fue abandonado).
--
--   D) GRANTs: `grant_pilot_access` y `bootstrap_user_after_signup_v2`
--      ya tienen GRANTs en baseline. `release_stale_invite_claims`
--      queda expuesta solo a `service_role` (se invoca desde la Edge
--      Function `cleanup-orphan-users` o desde el cron).
-- ============================================================

-- ------------------------------------------------------------
-- A) grant_pilot_access con reserva atómica
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."grant_pilot_access"("p_code" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
DECLARE
  v_code     text := upper(trim(p_code));
  v_uid      uuid := auth.uid();
  v_invite   record;
  v_ttl      interval := interval '30 minutes';
BEGIN
  -- Requiere sesión (anónima o registrada). AccessGate.tsx llama
  -- supabase.auth.signInAnonymously() antes de esta RPC.
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  IF v_code IS NULL OR length(v_code) < 4 THEN
    RETURN false;
  END IF;

  -- Lock serializador sobre la fila del código. Otras sesiones
  -- que quieran claimear el mismo código esperan acá.
  SELECT *
    INTO v_invite
    FROM public.invitation_codes
   WHERE code = v_code
   FOR UPDATE;

  IF v_invite IS NULL THEN
    RETURN false;
  END IF;

  -- Código debe estar activo.
  IF v_invite.status IS NULL OR v_invite.status <> 'active' THEN
    RETURN false;
  END IF;

  -- Expiración hard.
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    UPDATE public.invitation_codes
       SET status = 'expired'
     WHERE id = v_invite.id;
    RETURN false;
  END IF;

  -- Saturación de usos (para max_uses > 1).
  IF v_invite.current_uses >= v_invite.max_uses THEN
    RETURN false;
  END IF;

  -- Caso 1:1 — la parte sensible al race.
  IF v_invite.max_uses = 1 THEN
    -- Si ya está reclamado por alguien más Y el claim es fresco (< TTL),
    -- lo rechazamos. Si el claim es viejo (> TTL) o somos el mismo uid,
    -- lo sobreescribimos (idempotente para el mismo user, roll-over
    -- para un claim abandonado).
    IF v_invite.claimed_by IS NOT NULL
       AND v_invite.claimed_by <> v_uid
       AND v_invite.claimed_at IS NOT NULL
       AND v_invite.claimed_at > now() - v_ttl
    THEN
      RETURN false;
    END IF;

    -- Marcar claim tentativo.
    UPDATE public.invitation_codes
       SET claimed_by = v_uid,
           claimed_at = now()
     WHERE id = v_invite.id;
  END IF;

  -- Conceder el custom claim sobre el JWT del usuario.
  UPDATE auth.users
     SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('access_granted', true)
   WHERE id = v_uid;

  RETURN true;
END;
$$;

ALTER FUNCTION "public"."grant_pilot_access"("p_code" "text") OWNER TO "postgres";
REVOKE ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_pilot_access"("p_code" "text") TO "service_role";


-- ------------------------------------------------------------
-- B) bootstrap_user_after_signup_v2 con SELECT FOR UPDATE y
--    verificación de claim consistente.
--
-- Se replica el cuerpo original y solo se modifica la sección
-- que busca/consume el código, agregando lock y validación de
-- claimed_by. El resto (rate-limits, inserts de perfil, etc.)
-- queda idéntico para minimizar riesgo.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."bootstrap_user_after_signup_v2"(
  "p_nickname"         "text",
  "p_invitation_code"  "text",
  "p_app_version"      "text" DEFAULT NULL::"text",
  "p_user_agent"       "text" DEFAULT NULL::"text"
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_invitation_code));
  v_nick text := trim(p_nickname);

  v_invite_id uuid;
  v_alias text;
  v_anon text;
  v_claimed_by uuid;

  v_user_attempts int := 0;
  v_code_attempts int := 0;
BEGIN
  IF v_uid IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (NULL, NULL, COALESCE(v_code,'(null)'), 'unauthorized', NULL, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  END IF;

  SELECT COUNT(*)::int INTO v_user_attempts
  FROM public.invite_redemptions r
  WHERE r.user_id = v_uid
    AND r.created_at > now() - interval '10 minutes';

  IF v_user_attempts >= 8 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  IF v_nick IS NULL OR length(v_nick) < 3 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'nickname_too_short', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'NICKNAME_TOO_SHORT');
  END IF;

  IF v_code IS NULL OR length(v_code) < 4 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'invite_invalid', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  SELECT COUNT(*)::int INTO v_code_attempts
  FROM public.invite_redemptions r
  WHERE r.invite_code_entered = v_code
    AND r.created_at > now() - interval '10 minutes';

  IF v_code_attempts >= 20 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  UPDATE public.invitation_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  -- LOCK explícito + lectura del claim tentativo.
  SELECT ic.id, ic.assigned_alias, ic.claimed_by
  INTO v_invite_id, v_alias, v_claimed_by
  FROM public.invitation_codes ic
  WHERE upper(ic.code) = v_code
    AND ic.status = 'active'
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND ic.used_by_user_id IS NULL
  LIMIT 1
  FOR UPDATE;

  IF v_invite_id IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'invite_invalid', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Si el código ya fue claimeado por OTRO usuario en el Gate, respetamos
  -- el claim aunque la sesión actual traiga access_granted=true: solo el
  -- claimed_by original puede completar el perfil. Esto cierra la ventana
  -- de "dos usuarios con access_granted para el mismo código".
  IF v_claimed_by IS NOT NULL AND v_claimed_by <> v_uid THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, v_invite_id, v_code, 'invite_claimed_by_other', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used',
      claimed_by = v_uid,
      claimed_at = COALESCE(claimed_at, now()),
      current_uses = current_uses + 1
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, v_invite_id, v_code, 'invite_already_used', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  INSERT INTO public.users (user_id, invitation_code_id)
  VALUES (v_uid, v_invite_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
  VALUES (v_uid, v_nick, 0, 1.0)
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  v_anon := public.get_or_create_anon_id();

  INSERT INTO public.invite_redemptions(user_id, anon_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (v_uid, v_anon, v_invite_id, v_code, 'success', v_nick, p_app_version, p_user_agent);

  RETURN jsonb_build_object('ok', true, 'invite_id', v_invite_id, 'assigned_alias', v_alias);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (auth.uid(), NULL, COALESCE(p_invitation_code,'(null)'), 'unknown_error', p_nickname, p_app_version, p_user_agent);
  RETURN jsonb_build_object('ok', false, 'error', 'UNKNOWN_ERROR');
END;
$$;

ALTER FUNCTION "public"."bootstrap_user_after_signup_v2"("p_nickname" "text", "p_invitation_code" "text", "p_app_version" "text", "p_user_agent" "text") OWNER TO "postgres";


-- ------------------------------------------------------------
-- C) release_stale_invite_claims(p_ttl_minutes int)
--    Libera claims abandonados y revoca access_granted en JWT
--    de usuarios que nunca completaron perfil.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."release_stale_invite_claims"(
  "p_ttl_minutes" integer DEFAULT 30
) RETURNS jsonb
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
DECLARE
  v_ttl interval;
  v_released_claims int := 0;
  v_revoked_grants  int := 0;
  v_uid uuid;
  r record;
BEGIN
  -- Reglas:
  --   - Default 30 min, piso 5 min, techo 7 días para evitar valores absurdos.
  IF p_ttl_minutes IS NULL OR p_ttl_minutes < 5 THEN
    p_ttl_minutes := 30;
  ELSIF p_ttl_minutes > 10080 THEN
    p_ttl_minutes := 10080;
  END IF;

  v_ttl := make_interval(mins => p_ttl_minutes);

  -- 1. Identificar códigos con claim abandonado (> TTL, status active,
  --    sin consumir), y para cada uno revisar si el claimed_by ya
  --    completó perfil. Si NO lo completó, también revocamos su
  --    access_granted del JWT.
  FOR r IN
    SELECT ic.id, ic.claimed_by
      FROM public.invitation_codes ic
     WHERE ic.status = 'active'
       AND ic.used_by_user_id IS NULL
       AND ic.claimed_by IS NOT NULL
       AND ic.claimed_at IS NOT NULL
       AND ic.claimed_at < (now() - v_ttl)
  LOOP
    v_uid := r.claimed_by;

    -- ¿Ya tiene perfil? Si sí, el claim no está abandonado,
    -- solo expiró la marca tentativa; no tocamos auth.users.
    IF NOT EXISTS (
      SELECT 1 FROM public.user_profiles up WHERE up.user_id = v_uid
    ) THEN
      UPDATE auth.users
         SET raw_app_meta_data = (COALESCE(raw_app_meta_data, '{}'::jsonb)
                                  - 'access_granted')
       WHERE id = v_uid
         AND COALESCE(raw_app_meta_data ->> 'access_granted', 'false') = 'true';
      IF FOUND THEN
        v_revoked_grants := v_revoked_grants + 1;
      END IF;
    END IF;

    -- 2. Liberar el claim.
    UPDATE public.invitation_codes
       SET claimed_by = NULL,
           claimed_at = NULL
     WHERE id = r.id;
    v_released_claims := v_released_claims + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'ttl_minutes', p_ttl_minutes,
    'released_claims', v_released_claims,
    'revoked_access_grants', v_revoked_grants
  );
END;
$$;

ALTER FUNCTION "public"."release_stale_invite_claims"("p_ttl_minutes" integer) OWNER TO "postgres";
REVOKE ALL ON FUNCTION "public"."release_stale_invite_claims"("p_ttl_minutes" integer) FROM PUBLIC;
-- Solo service_role puede llamarla (Edge Function o cron SQL con service key).
GRANT ALL ON FUNCTION "public"."release_stale_invite_claims"("p_ttl_minutes" integer) TO "service_role";


-- ------------------------------------------------------------
-- Notas de operación
-- ------------------------------------------------------------
-- * `release_stale_invite_claims` se invoca al inicio de la Edge
--   Function `cleanup-orphan-users` (ver supabase/functions/cleanup-orphan-users/index.ts).
--   Si se activa el cron diario (docs/ACTIVAR_CRON_CLEANUP.md) el
--   saneo queda incluido sin pasos extra.
--
-- * Para correrla ad-hoc desde el SQL Editor con service_role:
--     SELECT public.release_stale_invite_claims(30);
-- ============================================================
