-- FIX: The on_auth_user_created trigger was still trying to insert into the dropped 'public.profiles' table.
-- We must update the handle_new_user() function to insert into the canonical 'public.users' and 'public.user_profiles' tables.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_nickname text;
BEGIN
  -- Generar un nickname por defecto
  v_nickname := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'usuario_' || substr(NEW.id::text, 1, 6)
  );

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

-- Re-create the trigger just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing users and profiles for any users that signed up while the trigger was broken
INSERT INTO public.users (user_id, role, is_identity_verified)
SELECT id, 'user', false FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
SELECT 
  id, 
  COALESCE(
    raw_user_meta_data->>'display_name',
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1),
    'usuario_' || substr(id::text, 1, 6)
  ),
  0,
  1.0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
