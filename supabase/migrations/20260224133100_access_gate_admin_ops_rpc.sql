BEGIN;

CREATE OR REPLACE FUNCTION public.set_access_gate_token_active(
  p_token_id uuid,
  p_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_role text;
BEGIN
  -- Autorización ajustado a user_id
  SELECT role INTO v_role FROM public.users WHERE user_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin';
  END IF;

  UPDATE public.access_gate_tokens
  SET is_active = p_active
  WHERE id = p_token_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_access_gate_token_active(uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.set_access_gate_token_active(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_access_gate_token_expiry(
  p_token_id uuid,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_role text;
BEGIN
  -- Autorización ajustado a user_id
  SELECT role INTO v_role FROM public.users WHERE user_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin';
  END IF;

  UPDATE public.access_gate_tokens
  SET expires_at = p_expires_at
  WHERE id = p_token_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_access_gate_token_expiry(uuid, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.set_access_gate_token_expiry(uuid, timestamptz) TO authenticated;

COMMIT;
