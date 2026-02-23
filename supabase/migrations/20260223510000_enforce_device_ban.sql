BEGIN;

-- =========================================================================
-- Re-crear insert_signal_event para incluir el enforcement de baneos
-- =========================================================================
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL,
  p_client_event_id uuid DEFAULT NULL,
  p_device_hash text DEFAULT NULL
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
  v_is_verified boolean := false;

  v_profile_stage int := 0;
  v_user_weight numeric := 1.0;

  v_daily_actions int := 0;
  v_daily_cap int := 20;

  v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());
BEGIN
  -- Anti-spam: Ban check por device_hash
  IF p_device_hash IS NOT NULL THEN
    PERFORM 1
    FROM public.antifraud_flags f
    WHERE f.device_hash = p_device_hash
      AND f.banned = true
      AND f.is_active = true
    LIMIT 1;

    IF FOUND THEN
      PERFORM public.raise_sanitized('DEVICE_BANNED');
    END IF;
  END IF;

  -- Auth obligatorio
  IF v_uid IS NULL THEN
    PERFORM public.raise_sanitized('Unauthorized');
  END IF;

  -- Invite obligatorio (1:1)
  SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users u
  WHERE u.user_id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    PERFORM public.raise_sanitized('INVITE_REQUIRED');
  END IF;

  -- Perfil obligatorio (minimo stage >= 1)
  SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles up
  WHERE up.user_id = v_uid
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('PROFILE_MISSING');
  END IF;

  IF v_profile_stage < 1 THEN
    PERFORM public.raise_sanitized('PROFILE_INCOMPLETE');
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  -- Anti-spam: Cooldown por battle_id (5 minutos)
  PERFORM 1 FROM public.signal_events
  WHERE anon_id = v_anon_id AND battle_id = p_battle_id
    AND created_at > now() - interval '5 minutes'
  LIMIT 1;

  IF FOUND THEN
    PERFORM public.raise_sanitized('COOLDOWN_ACTIVE');
  END IF;

  -- Límite diario SOLO para no verificados
  IF v_is_verified = false THEN
    IF v_profile_stage = 1 THEN
      v_daily_cap := 10;
    ELSE
      v_daily_cap := 20;
    END IF;

    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED');
    END IF;
  END IF;

  -- Battle debe estar activa
  PERFORM 1
  FROM public.battles b
  WHERE b.id = p_battle_id
    AND COALESCE(b.status, 'active') = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE');
  END IF;

  -- option debe pertenecer al battle
  PERFORM 1
  FROM public.battle_options bo
  WHERE bo.id = p_option_id
    AND bo.battle_id = p_battle_id
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_sanitized('INVALID SIGNAL PAYLOAD');
  END IF;

  -- Resolver battle_instance
  SELECT bi.id INTO v_instance_id
  FROM public.battle_instances bi
  WHERE bi.battle_id = p_battle_id
  ORDER BY bi.created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    -- Fallback safety si no hay instancia creada
    PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE');
  END IF;

  -- Insert idempotente por client_event_id
  INSERT INTO public.signal_events (
    anon_id, user_id,
    signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type,
    session_id, attribute_id,
    signal_weight,
    client_event_id,
    device_hash
  )
  VALUES (
    v_anon_id, v_uid,
    gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus',
    p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0),
    v_client_event_id,
    p_device_hash
  )
  ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

  -- Actulizar metricas
  IF FOUND THEN
    INSERT INTO public.user_activity (user_id, action_type)
    VALUES (v_uid, 'signal_emitted');

    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
    VALUES (v_uid, 1, now())
    ON CONFLICT (user_id) DO UPDATE
      SET total_signals = public.user_stats.total_signals + 1,
          last_signal_at = now();

    PERFORM public.update_trust_score(v_uid);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Mapeo error o relanzado
  IF SQLERRM = 'DEVICE_BANNED' THEN
    PERFORM public.raise_sanitized('DEVICE_BANNED');
  END IF;
  IF SQLERRM = 'COOLDOWN_ACTIVE' THEN
    PERFORM public.raise_sanitized('COOLDOWN_ACTIVE');
  END IF;
  IF SQLERRM = 'SIGNAL_LIMIT_REACHED' THEN
    PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED');
  END IF;
  IF SQLERRM = 'INVITE_REQUIRED' THEN
    PERFORM public.raise_sanitized('INVITE_REQUIRED');
  END IF;
  IF SQLERRM = 'PROFILE_INCOMPLETE' THEN
    PERFORM public.raise_sanitized('PROFILE_INCOMPLETE');
  END IF;
  
  PERFORM public.raise_sanitized('SIGNAL_FAILED');
END;
$$;

COMMIT;
