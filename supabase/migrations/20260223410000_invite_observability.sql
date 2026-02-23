BEGIN;

-- 1) Tabla de auditoría (no PII)
CREATE TABLE IF NOT EXISTS public.invite_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  anon_id text NULL,
  invite_id uuid NULL REFERENCES public.invitation_codes(id) ON DELETE SET NULL,
  invite_code_entered text NOT NULL,
  result text NOT NULL, -- success | invite_invalid | invite_already_used | unauthorized | nickname_too_short | unknown_error
  nickname text NULL,
  app_version text NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.invite_redemptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invite_redemptions TO service_role;

-- 2) bootstrap v2 (mantiene v1 intacta)
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
BEGIN
  IF v_uid IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (NULL, NULL, COALESCE(v_code,'(null)'), 'unauthorized', NULL, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
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

  -- Marcar expirados (best-effort)
  UPDATE public.invitation_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  -- Tomar código válido (activo, no usado, no expirado)
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

  -- Marcar como usado (atómico)
  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, v_invite_id, v_code, 'invite_already_used', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_ALREADY_USED');
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

  -- Capturar anon_id (para cruzar luego con signal_events si necesitas)
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

-- 3) Admin list (usa helper is_admin_user() ya creado en P3.F)
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT r.id, r.created_at, r.invite_code_entered, r.result, r.nickname, r.user_id, r.anon_id, r.invite_id, r.app_version, r.user_agent
  FROM public.invite_redemptions r
  WHERE public.is_admin_user() = true
  ORDER BY r.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

REVOKE ALL ON FUNCTION public.admin_list_invite_redemptions(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_invite_redemptions(int) TO authenticated;

COMMIT;
