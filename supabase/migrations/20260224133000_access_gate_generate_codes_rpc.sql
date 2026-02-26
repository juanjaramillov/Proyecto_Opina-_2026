BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Genera N códigos y retorna el listado en claro (solo en respuesta RPC).
-- Guarda solo hash en la tabla.
-- Solo admin (por rol) puede ejecutar.
CREATE OR REPLACE FUNCTION public.generate_access_gate_codes(
  p_count int,
  p_prefix text DEFAULT 'OP',
  p_label_prefix text DEFAULT 'tester',
  p_expires_days int DEFAULT NULL
)
RETURNS TABLE(code text, token_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  i int;
  v_code text;
  v_hash text;
  v_id uuid;
  v_prefix text := upper(trim(coalesce(p_prefix, 'OP')));
  v_label_prefix text := trim(coalesce(p_label_prefix, 'tester'));
  v_role text;
BEGIN
  -- Validación básica
  IF p_count IS NULL OR p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'p_count inválido (1..500)';
  END IF;

  -- Autorización: solo admins (ajustado a user_id para esquema local)
  SELECT role INTO v_role
  FROM public.users
  WHERE user_id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin puede generar códigos';
  END IF;

  FOR i IN 1..p_count LOOP
    -- Código: PREFIX-XXXXXXXX
    v_code := v_prefix || '-' || substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
    v_hash := encode(digest(v_code, 'sha256'), 'hex');

    INSERT INTO public.access_gate_tokens(code_hash, label, is_active, expires_at)
    VALUES (
      v_hash,
      v_label_prefix || '_' || to_char(now(), 'YYYYMMDD') || '_' || i::text,
      true,
      CASE WHEN p_expires_days IS NULL THEN NULL ELSE now() + (p_expires_days || ' days')::interval END
    )
    ON CONFLICT (code_hash) DO NOTHING
    RETURNING id INTO v_id;

    -- Si chocó por conflicto (raro), reintenta una vez
    IF v_id IS NULL THEN
      v_code := v_prefix || '-' || substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
      v_hash := encode(digest(v_code, 'sha256'), 'hex');

      INSERT INTO public.access_gate_tokens(code_hash, label, is_active, expires_at)
      VALUES (
        v_hash,
        v_label_prefix || '_' || to_char(now(), 'YYYYMMDD') || '_' || i::text,
        true,
        CASE WHEN p_expires_days IS NULL THEN NULL ELSE now() + (p_expires_days || ' days')::interval END
      )
      ON CONFLICT (code_hash) DO NOTHING
      RETURNING id INTO v_id;
    END IF;

    IF v_id IS NOT NULL THEN
      code := v_code;
      token_id := v_id;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_access_gate_codes(int, text, text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.generate_access_gate_codes(int, text, text, int) TO authenticated;

COMMIT;
