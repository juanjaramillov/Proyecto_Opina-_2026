BEGIN;

-- 0) Necesario para gen_random_bytes()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Eliminar overload corto (2 params) para evitar ambigüedad
DROP FUNCTION IF EXISTS public.admin_generate_invites(integer, text);
DROP FUNCTION IF EXISTS public.admin_generate_invites(int, text);

-- 2) IMPORTANTÍSIMO: eliminar overload largo (4 params) antes de recrearlo
-- (evita: "cannot change return type of existing function")
DROP FUNCTION IF EXISTS public.admin_generate_invites(integer, text, timestamptz, text[]);
DROP FUNCTION IF EXISTS public.admin_generate_invites(int, text, timestamptz, text[]);

-- 3) Crear UNA sola función (4 params) con defaults
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
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  i int;
  v_code text;
  v_alias text;
BEGIN
  -- Solo admin
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  IF p_count IS NULL OR p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'INVALID_COUNT';
  END IF;

  FOR i IN 1..p_count LOOP
    -- Código en MAYÚSCULAS (para pasar invitation_codes_code_upper_chk)
    v_code := upper(trim(p_prefix)) || '-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));

    v_alias := NULL;
    IF p_assigned_aliases IS NOT NULL AND array_length(p_assigned_aliases, 1) >= i THEN
      v_alias := p_assigned_aliases[i];
    END IF;

    -- Insert con tus columnas reales (max_uses/current_uses/status/etc)
    INSERT INTO public.invitation_codes (
      code,
      assigned_alias,
      expires_at,
      status,
      max_uses,
      current_uses,
      issued_to_label,
      created_by
    )
    VALUES (
      v_code,
      v_alias,
      p_expires_at,
      'active',
      1,
      0,
      'admin_generate_invites',
      auth.uid()
    )
    RETURNING
      invitation_codes.id,
      invitation_codes.code,
      invitation_codes.assigned_alias,
      invitation_codes.status,
      invitation_codes.expires_at,
      invitation_codes.used_at,
      invitation_codes.used_by_user_id,
      invitation_codes.created_at
    INTO
      id,
      code,
      assigned_alias,
      status,
      expires_at,
      used_at,
      used_by_user_id,
      created_at;

    RETURN NEXT;
  END LOOP;
END;
$$;

-- 4) Permisos
REVOKE ALL ON FUNCTION public.admin_generate_invites(int, text, timestamptz, text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_generate_invites(int, text, timestamptz, text[]) TO authenticated;

COMMIT;
