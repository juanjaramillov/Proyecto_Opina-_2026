-- FIX: Re-align insert_signal_event parameter types with the underlying signal_events schema
-- The previous patching sequence accidentally altered the type signatures and column mappings
-- which produced Postgres 42804 "column is of type uuid but expression is of type text".

-- 1. Explicitly drop the corrupted signature variant to prevent PGRST203 ambiguity
DROP FUNCTION IF EXISTS public.insert_signal_event(uuid, uuid, text, uuid);

-- 2. Re-create the function with strict UUID typing matching `p_session_id` and `p_attribute_id`
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
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

  v_is_verified boolean;

  v_profile_stage int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get verification status safely from users table
  SELECT COALESCE(is_identity_verified, false)
  INTO v_is_verified
  FROM public.users
  WHERE user_id = v_uid
  LIMIT 1;

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

  -- Capping non-verified users (Guests and Unverified Registered Users)
  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  -- Resolver battle_instance correctly (is_active boolean does not exist here)
  SELECT id INTO v_instance_id
  FROM public.battle_instances
  WHERE battle_id = p_battle_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'BATTLE_NOT_ACTIVE';
  END IF;

  -- INSERT mapped strictly to native session_id and attribute_id (both UUIDs)
  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type, session_id, attribute_id,
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
