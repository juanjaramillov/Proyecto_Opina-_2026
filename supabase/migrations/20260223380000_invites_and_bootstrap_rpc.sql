BEGIN;

-- 1) Tabla invitation_codes (1:1)
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  assigned_alias text NULL, -- etiqueta para ti (ej "amigo_pedro_01"). Evitar PII si puedes.
  status text NOT NULL DEFAULT 'active', -- active | used | expired | revoked
  expires_at timestamptz NULL,
  used_by_user_id uuid NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- code único (case-insensitive básico)
CREATE UNIQUE INDEX IF NOT EXISTS invitation_codes_code_uq
  ON public.invitation_codes ((upper(code)));

-- Un código no puede ser usado por más de 1 usuario
CREATE UNIQUE INDEX IF NOT EXISTS invitation_codes_used_by_uq
  ON public.invitation_codes (used_by_user_id)
  WHERE used_by_user_id IS NOT NULL;

-- Mantener el código en mayúsculas (consistencia)
ALTER TABLE public.invitation_codes
  DROP CONSTRAINT IF EXISTS invitation_codes_code_upper_chk;
ALTER TABLE public.invitation_codes
  ADD CONSTRAINT invitation_codes_code_upper_chk CHECK (code = upper(code));

-- 2) RPC: bootstrap_user_after_signup
-- Retorna JSON: { ok: true, invite_id: "...", assigned_alias: "..." } o { ok:false, error:"..." }
CREATE OR REPLACE FUNCTION public.bootstrap_user_after_signup(
  p_nickname text,
  p_invitation_code text
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
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  END IF;

  IF v_nick IS NULL OR length(v_nick) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NICKNAME_TOO_SHORT');
  END IF;

  IF v_code IS NULL OR length(v_code) < 4 THEN
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
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Marcar como usado de forma atómica (evita carreras)
  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_ALREADY_USED');
  END IF;

  -- Asegurar fila en public.users (si no existe)
  INSERT INTO public.users (user_id, invitation_code_id)
  VALUES (v_uid, v_invite_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  -- Crear/actualizar perfil con nickname (NO tocar demographics acá)
  INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
  VALUES (v_uid, v_nick, 0, 1.0)
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  RETURN jsonb_build_object('ok', true, 'invite_id', v_invite_id, 'assigned_alias', v_alias);
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_user_after_signup(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_after_signup(text, text) TO authenticated;

COMMIT;
