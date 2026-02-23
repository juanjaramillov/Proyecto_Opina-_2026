BEGIN;

-- 0) Proteger tabla: nadie (auth) debe leerla directo
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.invitation_codes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invitation_codes TO service_role;

-- 1) Helper admin (usa RBAC real: public.profiles.role)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.role, 'user') = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- 2) Generar códigos (p_count) con prefijo y alias opcional
CREATE OR REPLACE FUNCTION public.admin_generate_invites(
  p_count int,
  p_prefix text DEFAULT 'OP',
  p_expires_at timestamptz DEFAULT NULL,
  p_assigned_aliases text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  i int;
  v_code text;
  v_alias text;
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

    INSERT INTO public.invitation_codes (code, assigned_alias, expires_at, status)
    VALUES (v_code, v_alias, p_expires_at, 'active')
    RETURNING invitation_codes.id, invitation_codes.code, invitation_codes.assigned_alias,
              invitation_codes.status, invitation_codes.expires_at, invitation_codes.created_at
    INTO id, code, assigned_alias, status, expires_at, created_at;

    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_generate_invites(int, text, timestamptz, text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_generate_invites(int, text, timestamptz, text[]) TO authenticated;

-- 3) Listar invitaciones (solo admin)
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at
  FROM public.invitation_codes ic
  WHERE public.is_admin_user() = true
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

REVOKE ALL ON FUNCTION public.admin_list_invites(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_invites(int) TO authenticated;

-- 4) Revocar invitación (solo admin)
CREATE OR REPLACE FUNCTION public.admin_revoke_invite(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code text := upper(trim(p_code));
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  UPDATE public.invitation_codes
  SET status = 'revoked'
  WHERE upper(code) = v_code
    AND status = 'active'
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_ALREADY_USED');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_invite(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_invite(text) TO authenticated;

COMMIT;
