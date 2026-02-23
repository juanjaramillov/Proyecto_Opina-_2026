BEGIN;

-- =========================================================================
-- 1) Helper raise_sanitized
-- =========================================================================
CREATE OR REPLACE FUNCTION public.raise_sanitized(p_code text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo códigos cortos, sin detalles internos de Postgres (SQLERRM)
  RAISE EXCEPTION '%', p_code USING ERRCODE = 'P0001';
END;
$$;

-- =========================================================================
-- 2) insert_signal_event (Mantiene códigos frontend, oculta others)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL,
  p_client_event_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_instance_id uuid;

  v_invite_id uuid;
  v_is_verified boolean := false;

  v_profile_stage int := 0;
  v_user_weight numeric := 1.0;

  v_daily_actions int := 0;
  v_daily_cap int := 20;

  v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());
BEGIN
  -- Auth obligatorio
  IF v_uid IS NULL THEN
    PERFORM public.raise_sanitized('Unauthorized');
  END IF;

  -- Invite obligatorio (1:1)
  SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users u
  WHERE u.user_id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    PERFORM public.raise_sanitized('INVITE_REQUIRED');
  END IF;

  -- Perfil obligatorio (mínimo stage >= 1)
  SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles up
  WHERE up.user_id = v_uid
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('PROFILE_MISSING');
  END IF;

  IF v_profile_stage < 1 THEN
    PERFORM public.raise_sanitized('PROFILE_INCOMPLETE');
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  -- Límite diario SOLO para no verificados
  IF v_is_verified = false THEN
    IF v_profile_stage = 1 THEN
      v_daily_cap := 10;
    ELSE
      v_daily_cap := 20;
    END IF;

    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED');
    END IF;
  END IF;

  -- Battle debe estar activa
  PERFORM 1
  FROM public.battles b
  WHERE b.id = p_battle_id
    AND COALESCE(b.status, 'active') = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE');
  END IF;

  -- option debe pertenecer al battle
  PERFORM 1
  FROM public.battle_options bo
  WHERE bo.id = p_option_id
    AND bo.battle_id = p_battle_id
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('INVALID SIGNAL PAYLOAD');
  END IF;

  -- Resolver battle_instance
  SELECT bi.id INTO v_instance_id
  FROM public.battle_instances bi
  WHERE bi.battle_id = p_battle_id
  ORDER BY bi.created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    -- Fallback safety si no hay instancia creada
    PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE');
  END IF;

  -- Insert idempotente por client_event_id
  INSERT INTO public.signal_events (
    anon_id, user_id,
    signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type,
    session_id, attribute_id,
    signal_weight,
    client_event_id
  )
  VALUES (
    v_anon_id, v_uid,
    gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus',
    p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0),
    v_client_event_id
  )
  ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

  -- Actulizar metricas
  IF FOUND THEN
    INSERT INTO public.user_activity (user_id, action_type)
    VALUES (v_uid, 'signal_emitted');

    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
    VALUES (v_uid, 1, now())
    ON CONFLICT (user_id) DO UPDATE
      SET total_signals = public.user_stats.total_signals + 1,
          last_signal_at = now();

    PERFORM public.update_trust_score(v_uid);
  END IF;
EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('SIGNAL_FAILED');
END;
$$;


-- =========================================================================
-- 3) bootstrap_user_after_signup_v2 (Uniformar JSON y exceptions ciegos)
-- =========================================================================
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

  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
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


-- =========================================================================
-- 4) admin_generate_invites (no filtrar)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_generate_invites(
  p_count int,
  p_prefix text DEFAULT 'OP'
)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  IF p_count <= 0 OR p_count > 100 THEN
    PERFORM public.raise_sanitized('INVALID_COUNT');
  END IF;

  RETURN QUERY
  INSERT INTO public.invitation_codes (
    code,
    assigned_alias,
    status
  )
  SELECT 
    upper(trim(p_prefix)) || '-' || upper(substr(md5(random()::text), 1, 6)),
    NULL,
    'active'
  FROM generate_series(1, p_count)
  RETURNING 
    public.invitation_codes.id,
    public.invitation_codes.code,
    public.invitation_codes.assigned_alias,
    public.invitation_codes.status,
    public.invitation_codes.expires_at,
    public.invitation_codes.used_at,
    public.invitation_codes.used_by_user_id,
    public.invitation_codes.created_at;

EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('ADMIN_RPC_FAILED');
END;
$$;


-- =========================================================================
-- 5) admin_list_invites (no filtrar)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_list_invites(p_limit int DEFAULT 200)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  RETURN QUERY
  SELECT ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at
  FROM public.invitation_codes ic
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('ADMIN_RPC_FAILED');
END;
$$;


-- =========================================================================
-- 6) admin_revoke_invite (no filtrar)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_revoke_invite(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated int;
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  UPDATE public.invitation_codes
  SET status = 'revoked'
  WHERE code = p_code
    AND status = 'active'
    AND used_by_user_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_ALREADY_USED');
  END IF;

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', 'ADMIN_RPC_FAILED');
END;
$$;


-- =========================================================================
-- 7) admin_list_invite_redemptions (no filtrar)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_list_invite_redemptions(p_limit int DEFAULT 200)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  invite_code_entered text,
  result text,
  nickname text,
  user_id uuid,
  anon_id text,
  invite_id uuid,
  app_version text,
  user_agent text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  RETURN QUERY
  SELECT r.id, r.created_at, r.invite_code_entered, r.result, r.nickname, r.user_id, r.anon_id, r.invite_id, r.app_version, r.user_agent
  FROM public.invite_redemptions r
  ORDER BY r.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('ADMIN_RPC_FAILED');
END;
$$;

COMMIT;
