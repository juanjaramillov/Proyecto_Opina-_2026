BEGIN;

-- 1) Columna para idempotencia (solo se usará en module_type='versus')
ALTER TABLE public.signal_events
  ADD COLUMN IF NOT EXISTS client_event_id uuid;

-- 2) Backfill SOLO para eventos versus existentes (para no romper el índice)
UPDATE public.signal_events
SET client_event_id = gen_random_uuid()
WHERE client_event_id IS NULL
  AND module_type = 'versus';

-- 3) Único parcial: permite NULL (depth) pero hace único cuando hay valor (versus)
CREATE UNIQUE INDEX IF NOT EXISTS signal_events_client_event_id_uidx
ON public.signal_events (client_event_id)
WHERE client_event_id IS NOT NULL;

-- 4) Extender RPC (parámetro nuevo al final, backward-compatible)
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL,
  p_client_event_id uuid DEFAULT NULL
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

  v_is_verified boolean := false;
  v_profile_stage int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;

  v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());
BEGIN
  -- 1) Determine Identity & Limits based on auth
  v_anon_id := public.get_or_create_anon_id();

  IF v_uid IS NULL THEN
    -- GUEST PATH
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  ELSE
    -- REGISTERED PATH
    SELECT COALESCE(is_identity_verified, false)
    INTO v_is_verified
    FROM public.users
    WHERE user_id = v_uid
    LIMIT 1;

    SELECT COALESCE(profile_stage, 0), COALESCE(signal_weight, 1.0)
    INTO v_profile_stage, v_user_weight
    FROM public.user_profiles
    WHERE user_id = v_uid
    LIMIT 1;

    IF v_profile_stage IS NULL THEN
      RAISE EXCEPTION 'PROFILE_MISSING';
    END IF;
  END IF;

  -- 2) Resolve active battle instance
  SELECT id INTO v_instance_id
  FROM public.battle_instances
  WHERE battle_id = p_battle_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'BATTLE_NOT_ACTIVE';
  END IF;

  -- 3) Insert signal (IDEMPOTENTE por client_event_id)
  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type, session_id, attribute_id,
    signal_weight,
    client_event_id
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus', p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0),
    v_client_event_id
  )
  ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

  -- 4) Update engagement stats only for registered users
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_activity (user_id, action_type)
    VALUES (v_uid, 'signal_emitted');

    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
    VALUES (v_uid, 1, now())
    ON CONFLICT (user_id) DO UPDATE
      SET total_signals = public.user_stats.total_signals + 1,
          last_signal_at = now();

    PERFORM public.update_trust_score(v_uid);
  END IF;
END;
$$;

COMMIT;
