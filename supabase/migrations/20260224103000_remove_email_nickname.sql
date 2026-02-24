-- P9: Eliminar generación de nickname a partir de email para proteger anonimato

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_nickname text;
BEGIN
  -- AHORA: Ya no generamos nickname desde email.
  -- Se usara NULL, obligando al usuario a elegir uno en /complete-profile
  v_nickname := NULL;

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
