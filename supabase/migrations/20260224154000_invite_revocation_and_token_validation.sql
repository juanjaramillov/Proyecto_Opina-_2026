BEGIN;

-- 1) Valida si un invite_id sigue activo (para kick-out).
-- NO revisa current_uses/max_uses, porque eso rompería a usuarios ya aceptados.
CREATE OR REPLACE FUNCTION public.validate_invite_token(p_invite_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok boolean;
BEGIN
  SELECT (status = 'active') AND (expires_at IS NULL OR expires_at > now())
    INTO v_ok
  FROM public.invitation_codes
  WHERE id = p_invite_id
  LIMIT 1;

  RETURN COALESCE(v_ok, false);
END;
$$;

REVOKE ALL ON FUNCTION public.validate_invite_token(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_invite_token(uuid) TO anon, authenticated;

-- 2) Admin: set status (revocar/reactivar) aunque ya esté usado.
CREATE OR REPLACE FUNCTION public.admin_set_invitation_status(
  p_invite_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_status text := lower(trim(coalesce(p_status,'')));
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  IF v_status NOT IN ('active','revoked') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  UPDATE public.invitation_codes
     SET status = v_status
   WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_invitation_status(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_set_invitation_status(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
