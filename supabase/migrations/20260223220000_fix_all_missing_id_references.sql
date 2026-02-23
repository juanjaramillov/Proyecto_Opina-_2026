-- FIX: Update all signal and enrichment functions to query public.users by 'user_id' instead of 'id'
-- This resolves the persistent 'column "id" does not exist' PGRST error (42703).

CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_attribute_id text DEFAULT NULL,
  p_session_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_instance_id uuid;

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_stage int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Invite gate (1:1) - CORRECTED COLUMN to user_id
  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  -- Profile data fetching
  SELECT COALESCE(profile_stage, 0), COALESCE(signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_profile_stage IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  -- Capping non-verified users
  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  -- Resolver battle_instance
  SELECT id INTO v_instance_id
  FROM public.battle_instances
  WHERE battle_id = p_battle_id AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'BATTLE_NOT_ACTIVE';
  END IF;

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type, context_id, attribute_id,
    signal_weight
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus', p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0)
  );

  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (v_uid, 'signal_emitted');

  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (v_uid, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_signals = public.user_stats.total_signals + 1,
        last_signal_at = now();

  PERFORM public.update_trust_score(v_uid);
END;
$$;


CREATE OR REPLACE FUNCTION public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_signal_id uuid := gen_random_uuid();

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_stage int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;

  v_answer record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- CORRECTED COLUMN to user_id
  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  SELECT COALESCE(profile_stage, 0), COALESCE(signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_profile_stage IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_stage < 2 THEN
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
      v_anon_id, v_signal_id, p_option_id, public.resolve_entity_id(p_option_id), 'topic',
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


CREATE OR REPLACE FUNCTION public.fn_enrich_signal_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_gender text;
  v_age text;
  v_region text;
  v_commune text;
  v_completion int;
  v_weight numeric;

  -- Verification / trust
  v_verified boolean;
  v_trust numeric;

  -- Algorithm
  v_algo_id uuid;
  v_half_life int;
  v_verify_mult numeric;
  v_recency numeric;
  v_verif_factor numeric;

  -- Entity mapping
  v_entity_id uuid;
  v_entity_type text;
BEGIN
  -- 1) Resolver entity_id desde option_id si viene vacío o mal seteado
  IF NEW.option_id IS NOT NULL THEN
    v_entity_id := public.resolve_entity_id(NEW.option_id);
    IF v_entity_id IS NOT NULL THEN
      SELECT e.type INTO v_entity_type FROM public.entities e WHERE e.id = v_entity_id LIMIT 1;
      NEW.entity_id := COALESCE(NEW.entity_id, v_entity_id);
      IF NEW.entity_id = NEW.option_id THEN
        NEW.entity_id := v_entity_id;
      END IF;
      NEW.entity_type := COALESCE(NEW.entity_type, v_entity_type);
    END IF;
  END IF;

  -- 2) Algoritmo activo
  SELECT id, recency_half_life_days, verification_multiplier
  INTO v_algo_id, v_half_life, v_verify_mult
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  IF v_uid IS NOT NULL THEN
    -- 3) Traer segmento + peso desde user_profiles (schema real del repo)
    SELECT
      up.gender,
      up.age_bucket,
      up.region,
      up.comuna,
      COALESCE(up.profile_stage, 0),
      COALESCE(up.signal_weight, 1.0)
    INTO
      v_gender, v_age, v_region, v_commune, v_completion, v_weight
    FROM public.user_profiles up
    WHERE up.user_id = v_uid
    LIMIT 1;

    -- Extraer verification de users (CORRECTED COLUMN to user_id)
    SELECT COALESCE(u.is_identity_verified, false) INTO v_verified
    FROM public.users u
    WHERE u.user_id = v_uid
    LIMIT 1;

    SELECT COALESCE(us.trust_score, 1.0) INTO v_trust
    FROM public.user_stats us
    WHERE us.user_id = v_uid
    LIMIT 1;

    -- 4) Completar NEW
    NEW.user_id := v_uid;
    NEW.gender := COALESCE(NEW.gender, v_gender);
    NEW.age_bucket := COALESCE(NEW.age_bucket, v_age);
    NEW.region := COALESCE(NEW.region, v_region);
    NEW.commune := COALESCE(NEW.commune, v_commune);

    NEW.profile_completeness := COALESCE(NEW.profile_completeness, v_completion);
    NEW.signal_weight := COALESCE(NEW.signal_weight, v_weight);
    NEW.algorithm_version_id := COALESCE(NEW.algorithm_version_id, v_algo_id);

    -- 5) OpinaScore
    v_recency := public.calculate_recency_factor(NEW.created_at, COALESCE(v_half_life, 7));
    v_verif_factor := CASE WHEN v_verified THEN COALESCE(v_verify_mult, 1.3) ELSE 1.0 END;

    NEW.computed_weight := COALESCE(NEW.computed_weight, (NEW.signal_weight * v_verif_factor * COALESCE(v_trust, 1.0)));
    NEW.opinascore := COALESCE(NEW.opinascore, (NEW.signal_weight * v_recency * v_verif_factor * COALESCE(v_trust, 1.0)));
  END IF;

  RETURN NEW;
END;
$$;
