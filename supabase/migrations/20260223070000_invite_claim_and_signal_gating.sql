BEGIN;

-- =========================================================
-- A) INVITATION CODES: 1:1 claim + bind to public.users.invitation_code_id
-- =========================================================

-- 1) Extender invitation_codes sin romper schema existente
ALTER TABLE public.invitation_codes
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS issued_to_label text,
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitation_codes_status_check'
  ) THEN
    ALTER TABLE public.invitation_codes
      ADD CONSTRAINT invitation_codes_status_check
      CHECK (status IN ('active','expired','disabled','consumed'));
  END IF;
END $$;

-- 1 usuario no puede “reclamar” 2 códigos (monitoreo 1:1)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitation_codes_claimed_by_unique
  ON public.invitation_codes (claimed_by)
  WHERE claimed_by IS NOT NULL;

-- Endurecer tabla: el cliente NO la lee directo
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invitation_codes_no_select ON public.invitation_codes;
DROP POLICY IF EXISTS invitation_codes_no_insert ON public.invitation_codes;
DROP POLICY IF EXISTS invitation_codes_no_update ON public.invitation_codes;
DROP POLICY IF EXISTS invitation_codes_no_delete ON public.invitation_codes;

CREATE POLICY invitation_codes_no_select
ON public.invitation_codes FOR SELECT TO anon, authenticated
USING (false);

CREATE POLICY invitation_codes_no_insert
ON public.invitation_codes FOR INSERT TO anon, authenticated
WITH CHECK (false);

CREATE POLICY invitation_codes_no_update
ON public.invitation_codes FOR UPDATE TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY invitation_codes_no_delete
ON public.invitation_codes FOR DELETE TO anon, authenticated
USING (false);

-- 2) validate_invitation: funciona en modo ANON (antes de registrarse)
CREATE OR REPLACE FUNCTION public.validate_invitation(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite record;
  v_code text := upper(trim(p_code));
BEGIN
  SELECT * INTO invite
  FROM public.invitation_codes
  WHERE code = v_code
  LIMIT 1;

  IF invite IS NULL THEN
    RETURN false;
  END IF;

  IF invite.status IS NOT NULL AND invite.status <> 'active' THEN
    RETURN false;
  END IF;

  IF invite.expires_at IS NOT NULL AND invite.expires_at < now() THEN
    RETURN false;
  END IF;

  IF invite.current_uses >= invite.max_uses THEN
    RETURN false;
  END IF;

  -- Si es 1:1 (max_uses = 1) no puede estar ya reclamado
  IF invite.max_uses = 1 AND invite.claimed_by IS NOT NULL THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invitation(text) TO anon, authenticated;

-- Drop function because return type changes to void
DROP FUNCTION IF EXISTS public.consume_invitation(text) CASCADE;

-- 3) consume_invitation: ahora además “amarra” el código al usuario en public.users
CREATE OR REPLACE FUNCTION public.consume_invitation(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_code));
  invite record;
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Lock del código
  SELECT * INTO invite
  FROM public.invitation_codes
  WHERE code = v_code
  FOR UPDATE;

  IF invite IS NULL THEN
    RAISE EXCEPTION 'INVITE_INVALID';
  END IF;

  IF invite.status IS NOT NULL AND invite.status <> 'active' THEN
    RAISE EXCEPTION 'INVITE_INACTIVE';
  END IF;

  IF invite.expires_at IS NOT NULL AND invite.expires_at < now() THEN
    UPDATE public.invitation_codes SET status = 'expired' WHERE id = invite.id;
    RAISE EXCEPTION 'INVITE_EXPIRED';
  END IF;

  IF invite.current_uses >= invite.max_uses THEN
    UPDATE public.invitation_codes SET status = 'consumed' WHERE id = invite.id;
    RAISE EXCEPTION 'INVITE_CONSUMED';
  END IF;

  IF invite.max_uses = 1 AND invite.claimed_by IS NOT NULL THEN
    RAISE EXCEPTION 'INVITE_ALREADY_CLAIMED';
  END IF;

  -- Asegurar fila en public.users (por si el trigger faltó en algún entorno)
  SELECT au.email INTO v_email FROM auth.users au WHERE au.id = v_uid;
  INSERT INTO public.users (id, email)
  VALUES (v_uid, coalesce(v_email, ''))
  ON CONFLICT (id) DO NOTHING;

  -- Consumir + marcar claim 1:1
  UPDATE public.invitation_codes
  SET
    current_uses = current_uses + 1,
    claimed_by   = CASE WHEN invite.max_uses = 1 THEN v_uid ELSE COALESCE(claimed_by, v_uid) END,
    claimed_at   = CASE WHEN invite.max_uses = 1 THEN now() ELSE COALESCE(claimed_at, now()) END,
    status       = CASE WHEN current_uses + 1 >= max_uses THEN 'consumed' ELSE status END
  WHERE id = invite.id;

  -- Bind del código al usuario (esto es lo que te permite monitorear 1:1)
  UPDATE public.users
  SET invitation_code_id = invite.id
  WHERE id = v_uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_invitation(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.consume_invitation(text) TO authenticated;


-- =========================================================
-- B) USERS: agregar role (porque tu frontend consulta users.role)
-- =========================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check CHECK (role IN ('user','admin','b2b'));
  END IF;
END $$;

-- Seguridad: el cliente NO debería poder mutar public.users directamente
REVOKE UPDATE ON public.users FROM authenticated;


-- =========================================================
-- C) USER_ACTIVITY: corregir mismatch activity_type vs action_type
-- =========================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_activity' AND column_name='activity_type'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_activity' AND column_name='action_type'
  )
  THEN
    ALTER TABLE public.user_activity RENAME COLUMN activity_type TO action_type;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_user_activity_type_time;
CREATE INDEX IF NOT EXISTS idx_user_activity_action_time
ON public.user_activity (action_type, created_at DESC);


-- =========================================================
-- D) MOTOR: fn_enrich_signal_event (usar user_profiles + users, y setear user_id)
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();

  v_gender text;
  v_age text;
  v_region text;
  v_completeness int;

  v_weight numeric;
  v_trust_score numeric;
  v_verified boolean;

  v_algo_id uuid;
  v_algo_half_life integer;
  v_algo_verify_mult numeric;

  v_verification_factor numeric;
  v_recency_factor numeric;
BEGIN
  -- Algoritmo activo
  SELECT id, recency_half_life_days, verification_multiplier
  INTO v_algo_id, v_algo_half_life, v_algo_verify_mult
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    SELECT
      up.gender,
      up.age_bucket,
      up.region,
      COALESCE(up.profile_completeness, 0),
      COALESCE(u.signal_weight, us.signal_weight, 1.0),
      COALESCE(us.trust_score, 1.0),
      COALESCE(u.is_identity_verified, false)
    INTO
      v_gender,
      v_age,
      v_region,
      v_completeness,
      v_weight,
      v_trust_score,
      v_verified
    FROM public.user_profiles up
    LEFT JOIN public.user_stats us ON us.user_id = up.user_id
    LEFT JOIN public.users u ON u.user_id = up.user_id
    WHERE up.user_id = v_user_id
    LIMIT 1;

    v_recency_factor := public.calculate_recency_factor(NEW.created_at, v_algo_half_life);
    v_verification_factor := CASE WHEN v_verified THEN v_algo_verify_mult ELSE 1.0 END;

    -- Enrichment
    NEW.user_id := v_user_id;                 -- necesario para integridad/trust_score
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);

    NEW.user_tier := CASE WHEN v_verified THEN 'verified' ELSE 'registered' END;
    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completeness);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);

    NEW.algorithm_version_id := v_algo_id;

    -- computed_weight / opinascore
    NEW.computed_weight := (NEW.signal_weight * v_verification_factor * v_trust_score);
    NEW.opinascore := (NEW.signal_weight * v_recency_factor * v_verification_factor * v_trust_score);
  END IF;

  RETURN NEW;
END;
$$;


-- =========================================================
-- E) GATE DE PERFIL + INVITE + LÍMITE DIARIO (NO verificados)
-- =========================================================

-- Helper: contar “acciones” del día (por signal_id distinto)
CREATE OR REPLACE FUNCTION public.count_daily_signal_actions(p_anon_id text)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT signal_id)::int
  FROM public.signal_events
  WHERE anon_id = p_anon_id
    AND created_at >= date_trunc('day', now());
$$;

-- insert_signal_event: ahora bloquea sin invite + sin perfil mínimo + cap diario si no verificado
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_instance_id uuid;

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_completion int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Invite gate (1:1)
  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  -- Profile gate (mínimo)
  SELECT COALESCE(profile_completeness, 0), COALESCE(u.signal_weight, 1.0)
  INTO v_profile_completion, v_user_weight
  FROM public.user_profiles p
  JOIN public.users u ON u.user_id = p.user_id
  WHERE p.user_id = v_uid
  LIMIT 1;

  IF v_profile_completion IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_completion < 40 THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;

  -- Daily cap para NO verificados
  v_anon_id := public.get_or_create_anon_id();

  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  -- Resolver battle_instance
  SELECT id INTO v_instance_id
  FROM public.battle_instances
  WHERE battle_id = p_battle_id
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type, session_id, attribute_id,
    signal_weight
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    p_option_id, 'topic', 'versus', p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0)
  );

  -- Log actividad (columna ya estandarizada)
  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (v_uid, 'signal_emitted');

  -- Stats + trust
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (v_uid, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_signals = public.user_stats.total_signals + 1,
        last_signal_at = now();

  PERFORM public.update_trust_score(v_uid);
END;
$$;

-- insert_depth_answers: mismo gate + cap, y cuenta como 1 acción diaria (1 signal_id para todo el pack)
CREATE OR REPLACE FUNCTION public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_signal_id uuid := gen_random_uuid();

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_completion int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;

  v_answer record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  SELECT COALESCE(profile_completeness, 0), COALESCE(u.signal_weight, 1.0)
  INTO v_profile_completion, v_user_weight
  FROM public.user_profiles p
  JOIN public.users u ON u.user_id = p.user_id
  WHERE p.user_id = v_uid
  LIMIT 1;

  IF v_profile_completion IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_completion < 40 THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  FOR v_answer IN
    SELECT * FROM jsonb_to_recordset(p_answers) AS x(question_key text, answer_value text)
  LOOP
    INSERT INTO public.signal_events (
      anon_id, signal_id, option_id, entity_id, entity_type,
      module_type, context_id, value_text, value_numeric,
      signal_weight
    )
    VALUES (
      v_anon_id, v_signal_id, p_option_id, p_option_id, 'topic',
      'depth', v_answer.question_key, v_answer.answer_value,
      CASE WHEN v_answer.answer_value ~ '^[0-9]+(\.[0-9]+)?$' THEN v_answer.answer_value::numeric ELSE NULL END,
      COALESCE(v_user_weight, 1.0)
    );
  END LOOP;

  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (v_uid, 'depth_completed');

  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (v_uid, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_signals = public.user_stats.total_signals + 1,
        last_signal_at = now();

  PERFORM public.update_trust_score(v_uid);
END;
$$;

COMMIT;
