BEGIN;

-- Indexes para rate limit (rápidos)
CREATE INDEX IF NOT EXISTS invite_redemptions_user_time_idx
  ON public.invite_redemptions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS invite_redemptions_code_time_idx
  ON public.invite_redemptions (invite_code_entered, created_at DESC);

-- Hardening bootstrap v2:
-- - Rate-limit: max 8 intentos / 10 min por user_id
-- - Rate-limit: max 20 intentos / 10 min por invite_code_entered
-- - Error ciego al usuario: INVITE_INVALID para invalid y already_used
CREATE OR REPLACE FUNCTION public.bootstrap_user_after_signup_v2(
  p_nickname text,
  p_invitation_code text,
  p_app_version text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_invitation_code));
  v_nick text := trim(p_nickname);

  v_invite_id uuid;
  v_alias text;
  v_anon text;

  v_user_attempts int := 0;
  v_code_attempts int := 0;
BEGIN
  -- Auth obligatorio
  IF v_uid IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (NULL, NULL, COALESCE(v_code,'(null)'), 'unauthorized', NULL, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- Rate limit por usuario (8 / 10 min)
  SELECT COUNT(*)::int INTO v_user_attempts
  FROM public.invite_redemptions r
  WHERE r.user_id = v_uid
    AND r.created_at > now() - interval '10 minutes';

  IF v_user_attempts >= 8 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  -- Validaciones input
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

  -- Rate limit por código (20 / 10 min) — evita adivinar códigos “calientes”
  SELECT COUNT(*)::int INTO v_code_attempts
  FROM public.invite_redemptions r
  WHERE r.invite_code_entered = v_code
    AND r.created_at > now() - interval '10 minutes';

  IF v_code_attempts >= 20 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  -- Expirar activos vencidos (best-effort)
  UPDATE public.invitation_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  -- Tomar código activo/no usado/no expirado
  SELECT ic.id, ic.assigned_alias
  INTO v_invite_id, v_alias
  FROM public.invitation_codes ic
  WHERE upper(ic.code) = v_code
    AND ic.status = 'active'
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND ic.used_by_user_id IS NULL
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'invite_invalid', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Marcar usado (atómico)
  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    -- Log interno específico, pero al usuario: INVITE_INVALID (ciegos)
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, v_invite_id, v_code, 'invite_already_used', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Asegurar users
  INSERT INTO public.users (user_id, invitation_code_id)
  VALUES (v_uid, v_invite_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  -- Asegurar perfil nickname (stage 0)
  INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
  VALUES (v_uid, v_nick, 0, 1.0)
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  v_anon := public.get_or_create_anon_id();

  -- Log éxito
  INSERT INTO public.invite_redemptions(user_id, anon_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (v_uid, v_anon, v_invite_id, v_code, 'success', v_nick, p_app_version, p_user_agent);

  RETURN jsonb_build_object('ok', true, 'invite_id', v_invite_id, 'assigned_alias', v_alias);

EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'unknown_error', v_nick, p_app_version, p_user_agent);

  RETURN jsonb_build_object('ok', false, 'error', 'UNKNOWN_ERROR');
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_user_after_signup_v2(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_after_signup_v2(text, text, text, text) TO authenticated;

COMMIT;
