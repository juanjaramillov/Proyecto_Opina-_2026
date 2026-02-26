BEGIN;

-- 1) RPC: Admin Delete Invitation (Hard Delete)
CREATE OR REPLACE FUNCTION public.admin_delete_invitation(
  p_invite_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  DELETE FROM public.invitation_codes
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_invitation(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_delete_invitation(uuid) TO authenticated;

-- 2) Update validate_invite_token to accept 'used' or 'active' for access pass
-- Si un admin reactiva el código que antes fue 'usado' pasándolo a 'active', 
-- no debería ser bloqueado a menos que sea específicamente 'revoked'.
CREATE OR REPLACE FUNCTION public.validate_invite_token(p_invite_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok boolean;
BEGIN
  -- Si el admin lo reactivó pasándolo a "active", permitiremos el paso.
  -- También si estaba "used" permitimos paso a features (lo consideramos válido porque ya pasó la barrera una vez).
  SELECT (status IN ('active', 'used', 'consumed')) AND (expires_at IS NULL OR expires_at > now())
    INTO v_ok
  FROM public.invitation_codes
  WHERE id = p_invite_id
  LIMIT 1;

  RETURN COALESCE(v_ok, false);
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
