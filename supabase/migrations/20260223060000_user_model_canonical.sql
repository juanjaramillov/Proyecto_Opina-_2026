-- =========================================================
-- FIX 02 — Canonical User Model: public.users + public.user_profiles
-- - public.users: privado (control / RBAC / invitación / verificación)
-- - public.user_profiles: segmentable (nickname + demografía, sin identidad real)
-- =========================================================
BEGIN;

-- Drop legacy/conflicting schemas if they exist previously
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions to avoid return type change errors
DROP FUNCTION IF EXISTS public.consume_invitation(text) CASCADE;
DROP FUNCTION IF EXISTS public.bootstrap_user_after_signup(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_demographics_cooldown() CASCADE;

-- 0) Extensiones útiles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------
-- 1) Tabla: public.users (PRIVADA)
-- ---------------------------------------------------------
CREATE TABLE public.users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  invitation_code_id uuid NULL,
  is_identity_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Role básico (evitar basura)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check CHECK (role IN ('user','admin','b2b'));
  END IF;
END $$;

-- ---------------------------------------------------------
-- 2) Tabla: public.user_profiles (SEGMENTABLE / ANÓNIMA)
-- ---------------------------------------------------------
CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identidad pública anónima (obligatoria)
  nickname text NOT NULL UNIQUE,

  -- Demografía mínima (segmentación)
  gender text NULL,
  age_bucket text NULL,
  region text NULL,
  comuna text NULL,
  education text NULL,

  -- Control cambios demográficos (cooldown)
  last_demographics_update timestamptz NULL,

  -- Métrica opcional (si ya la usas en signal_events)
  profile_completeness numeric NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Nickname: formato mínimo (evitar emails / espacios raros)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_nickname_format'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_nickname_format
      CHECK (
        length(nickname) BETWEEN 3 AND 20
        AND nickname ~ '^[a-zA-Z0-9_]+$'
      );
  END IF;
END $$;

-- ---------------------------------------------------------
-- 3) updated_at automático
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profiles_updated_at') THEN
    CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ---------------------------------------------------------
-- 4) Cooldown demográfico: 30 días
--    (solo aplica si cambian campos demográficos)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_demographics_cooldown()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed boolean := false;
  v_last timestamptz;
BEGIN
  -- Detectar cambio en campos demográficos
  IF (NEW.gender IS DISTINCT FROM OLD.gender) THEN v_changed := true; END IF;
  IF (NEW.age_bucket IS DISTINCT FROM OLD.age_bucket) THEN v_changed := true; END IF;
  IF (NEW.region IS DISTINCT FROM OLD.region) THEN v_changed := true; END IF;
  IF (NEW.comuna IS DISTINCT FROM OLD.comuna) THEN v_changed := true; END IF;
  IF (NEW.education IS DISTINCT FROM OLD.education) THEN v_changed := true; END IF;

  IF v_changed THEN
    v_last := COALESCE(OLD.last_demographics_update, OLD.created_at);

    IF v_last IS NOT NULL AND v_last > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Demographics can only be updated every 30 days'
      USING ERRCODE = 'P0001';
    END IF;

    NEW.last_demographics_update := now();
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profiles_cooldown') THEN
    CREATE TRIGGER trg_user_profiles_cooldown
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_demographics_cooldown();
  END IF;
END $$;

-- ---------------------------------------------------------
-- 5) Invitaciones 1:1 (si ya existe la tabla, solo la endurecemos)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  max_uses int NOT NULL DEFAULT 1,
  used_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- active | expired | disabled | consumed
  expires_at timestamptz NULL,

  -- monitoreo 1:1
  issued_to_label text NULL,   -- etiqueta interna (ej: "Juan-Pedro-001")
  claimed_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validación + consumo atómico (solo authenticated)
CREATE OR REPLACE FUNCTION public.consume_invitation(p_code text)
RETURNS TABLE(ok boolean, invitation_code_id uuid, error text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code record;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Not authenticated';
    RETURN;
  END IF;

  SELECT *
    INTO v_code
  FROM public.invitation_codes
  WHERE code = p_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Invalid code';
    RETURN;
  END IF;

  IF v_code.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Code not active';
    RETURN;
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN
    UPDATE public.invitation_codes SET status = 'expired' WHERE id = v_code.id;
    RETURN QUERY SELECT false, NULL::uuid, 'Code expired';
    RETURN;
  END IF;

  IF v_code.used_count >= v_code.max_uses THEN
    UPDATE public.invitation_codes SET status = 'consumed' WHERE id = v_code.id;
    RETURN QUERY SELECT false, NULL::uuid, 'Code already used';
    RETURN;
  END IF;

  -- Consumir atómico + 1:1 claim
  UPDATE public.invitation_codes
  SET used_count = used_count + 1,
      claimed_by = v_uid,
      claimed_at = now(),
      status = CASE WHEN used_count + 1 >= max_uses THEN 'consumed' ELSE status END
  WHERE id = v_code.id;

  RETURN QUERY SELECT true, v_code.id, NULL::text;
END;
$$;

-- ---------------------------------------------------------
-- 6) Upsert core al registrarse: users + user_profiles
--    (el frontend llama esto al finalizar signup)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_user_after_signup(
  p_nickname text,
  p_invitation_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_consume record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  -- Consumir invitación (1:1)
  SELECT * INTO v_consume
  FROM public.consume_invitation(p_invitation_code);

  IF v_consume.ok IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('ok', false, 'error', COALESCE(v_consume.error, 'Invitation error'));
  END IF;

  -- users (privado)
  INSERT INTO public.users(user_id, invitation_code_id)
  VALUES (v_uid, v_consume.invitation_code_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  -- user_profiles (segmentable)
  INSERT INTO public.user_profiles(user_id, nickname, last_demographics_update)
  VALUES (v_uid, p_nickname, now())
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ---------------------------------------------------------
-- 7) RLS: blindar identidad / permitir solo self
-- ---------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- users: solo self (select/update), insert solo self
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_select_self') THEN
    CREATE POLICY users_select_self ON public.users
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_update_self') THEN
    CREATE POLICY users_update_self ON public.users
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_insert_self') THEN
    CREATE POLICY users_insert_self ON public.users
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- user_profiles: solo self (select/update/insert)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_select_self') THEN
    CREATE POLICY user_profiles_select_self ON public.user_profiles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_update_self') THEN
    CREATE POLICY user_profiles_update_self ON public.user_profiles
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_insert_self') THEN
    CREATE POLICY user_profiles_insert_self ON public.user_profiles
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- invitation_codes: nadie puede leer tabla directo desde cliente
-- (solo se usa consume_invitation() / bootstrap_user_after_signup())
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invitation_codes_no_select') THEN
    CREATE POLICY invitation_codes_no_select ON public.invitation_codes
      FOR SELECT TO anon, authenticated
      USING (false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invitation_codes_no_insert') THEN
    CREATE POLICY invitation_codes_no_insert ON public.invitation_codes
      FOR INSERT TO anon, authenticated
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invitation_codes_no_update') THEN
    CREATE POLICY invitation_codes_no_update ON public.invitation_codes
      FOR UPDATE TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invitation_codes_no_delete') THEN
    CREATE POLICY invitation_codes_no_delete ON public.invitation_codes
      FOR DELETE TO anon, authenticated
      USING (false);
  END IF;
END $$;

-- ---------------------------------------------------------
-- 8) Grants: el frontend solo ejecuta bootstrap
-- ---------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.consume_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_after_signup(text, text) TO authenticated;

-- ---------------------------------------------------------
-- 9) Migración suave desde profiles (si existe)
--    (no rompe aunque profiles no exista)
-- ---------------------------------------------------------
DO $$
DECLARE
  v_has_profiles boolean;
  v_has_nickname boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='profiles'
  ) INTO v_has_profiles;

  IF v_has_profiles THEN
    -- users: crear filas faltantes
    INSERT INTO public.users(user_id)
    SELECT p.id
    FROM public.profiles p
    ON CONFLICT DO NOTHING;

    -- si profiles tiene nickname, migrarlo
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='profiles' AND column_name='nickname'
    ) INTO v_has_nickname;

    IF v_has_nickname THEN
      EXECUTE $sql$
        INSERT INTO public.user_profiles(user_id, nickname, gender, age_bucket, region, comuna, education, last_demographics_update)
        SELECT
          p.id,
          p.nickname,
          p.gender,
          p.age_bucket,
          p.region,
          p.comuna,
          p.education,
          COALESCE(p.last_demographics_update, now())
        FROM public.profiles p
        ON CONFLICT (user_id) DO UPDATE
          SET nickname = EXCLUDED.nickname
      $sql$;
    END IF;
  END IF;
END $$;

COMMIT;
