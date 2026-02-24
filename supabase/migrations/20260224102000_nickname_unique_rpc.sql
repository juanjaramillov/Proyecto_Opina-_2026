BEGIN;

-- 1) Índice único case-insensitive
-- Nota: permite NULL múltiples, pero si hay valor, debe ser único por lower(nickname)
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_nickname_unique_ci
ON public.user_profiles (lower(nickname))
WHERE nickname IS NOT NULL AND nickname <> '';

-- 2) RPC: set nickname una vez (solo si actualmente es NULL/vacío)
CREATE OR REPLACE FUNCTION public.set_nickname_once(p_nickname text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_nick text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  v_nick := trim(coalesce(p_nickname, ''));

  -- Reglas mínimas de formato:
  -- 3 a 18 chars, letras/números/_/-
  IF length(v_nick) < 3 OR length(v_nick) > 18 THEN
    RAISE EXCEPTION 'Nickname debe tener entre 3 y 18 caracteres';
  END IF;

  IF v_nick !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Nickname solo puede usar letras, números, "_" o "-"';
  END IF;

  -- Set solo si aún no está definido
  UPDATE public.user_profiles
     SET nickname = v_nick,
         updated_at = now()
   WHERE user_id = v_uid
     AND (nickname IS NULL OR trim(nickname) = '');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nickname ya definido (no editable por ahora)';
  END IF;

  -- Si choca con el índice único, Postgres lanzará error de unique violation automáticamente.
END;
$$;

REVOKE ALL ON FUNCTION public.set_nickname_once(text) FROM public;
GRANT EXECUTE ON FUNCTION public.set_nickname_once(text) TO authenticated;

COMMIT;
