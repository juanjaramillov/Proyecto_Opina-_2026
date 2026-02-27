-- Migration: Permitir que admin_generate_invites reciba un assigned_alias opcional
-- Fecha: 2026-02-26

CREATE OR REPLACE FUNCTION public.admin_generate_invites(p_count int, p_prefix text, p_assigned_alias text DEFAULT NULL)
RETURNS SETOF public.invitation_codes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i int;
  v_code text;
  v_base_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_rand text;
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Solo administradores pueden generar invitaciones';
  END IF;

  FOR i IN 1..p_count LOOP
    -- Generar 6 caracteres aleatorios (para sumar 8 en total si prefix es de 2)
    v_rand := substr(
      string_agg(
        substr(v_base_chars, (random() * (length(v_base_chars) - 1))::int + 1, 1), 
        ''
      ), 1, 6
    ) FROM generate_series(1, 10);
    
    -- Código en MAYÚSCULAS (para pasar invitation_codes_code_upper_chk)
    v_code := upper(COALESCE(p_prefix, 'OP') || '-' || v_rand);
    
    -- Insert explícitamente sin "RETURNING *" sobre alias, sino con columnas definidas
    INSERT INTO public.invitation_codes (
      code, assigned_alias, status, created_at
    ) VALUES (
      v_code, p_assigned_alias, 'active', now()
    );
  END LOOP;

  -- Devolver los recién creados, ordenados por fecha
  RETURN QUERY
    SELECT 
      invitation_codes.id,
      invitation_codes.code,
      invitation_codes.assigned_alias,
      invitation_codes.status,
      invitation_codes.expires_at,
      invitation_codes.used_at,
      invitation_codes.used_by_user_id,
      invitation_codes.created_at
    FROM public.invitation_codes
    ORDER BY invitation_codes.created_at DESC
    LIMIT p_count;
END;
$$;
