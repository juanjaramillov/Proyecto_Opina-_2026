DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Create auth user (this fires the trigger that creates the profile)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@opina.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    '',
    '',
    '',
    ''
  );

  -- 2. Create identity
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, 'admin@opina.com')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- 3. We insert into public.users
  INSERT INTO public.users (
    user_id, role, is_identity_verified, created_at, updated_at
  )
  VALUES (
    new_user_id,
    'admin',
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  -- 4. We insert into public.user_profiles
  INSERT INTO public.user_profiles (
    user_id, nickname, created_at, updated_at
  )
  VALUES (
    new_user_id,
    'Admin',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

END $$;
