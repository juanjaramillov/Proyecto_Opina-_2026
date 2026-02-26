-- Fix: Ensure nickname is not null during user creation because the user_profiles table 
-- enforces a NOT NULL constraint and a format regex '^[a-zA-Z0-9_]+$'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_nickname text;
BEGIN
  -- AHORA: Generamos un nickname temporal anónimo que no exponga el email
  -- Se usara este 'anon_xyz' hasta que el usuario lo cambie en /complete-profile
  v_nickname := 'anon_' || substr(regexp_replace(NEW.id::text, '-', '', 'g'), 1, 8);

  -- 1) Crear el registro privado en public.users
  INSERT INTO public.users (user_id, role, is_identity_verified)
  VALUES (
    NEW.id,
    'user',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2) Crear el registro segmentable en public.user_profiles
  INSERT INTO public.user_profiles (
    user_id, 
    nickname, 
    profile_stage, 
    signal_weight
  )
  VALUES (
    NEW.id,
    v_nickname,
    0,
    1.0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
