BEGIN;

-- 0) Eliminar variantes viejas/ambiguas (evita PGRST203)
DROP FUNCTION IF EXISTS public.insert_signal_event(uuid, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.insert_signal_event(uuid, uuid, uuid, uuid);
DROP FUNCTION IF EXISTS public.insert_signal_event(uuid, uuid, uuid, uuid, uuid);

-- 1) Versión FINAL (estable + idempotente + reglas correctas)
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

  v_invite_id uuid;
  v_is_verified boolean := false;

  v_profile_stage int := 0;
  v_user_weight numeric := 1.0;

  v_daily_actions int := 0;
  v_daily_cap int := 20;

  v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());
BEGIN
  -- Auth obligatorio
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Invite obligatorio (1:1)
  SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users u
  WHERE u.user_id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  -- Perfil obligatorio (mínimo stage >= 1)
  SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles up
  WHERE up.user_id = v_uid
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_stage < 1 THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  -- Límite diario SOLO para no verificados (más estricto en stage 1)
  IF v_is_verified = false THEN
    IF v_profile_stage = 1 THEN
      v_daily_cap := 10;
    ELSE
      v_daily_cap := 20;
    END IF;

    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  -- Battle debe estar activa
  PERFORM 1
  FROM public.battles b
  WHERE b.id = p_battle_id
    AND COALESCE(b.status, 'active') = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BATTLE_NOT_ACTIVE';
  END IF;

  -- option debe pertenecer al battle (si no, payload inválido)
  PERFORM 1
  FROM public.battle_options bo
  WHERE bo.id = p_option_id
    AND bo.battle_id = p_battle_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID SIGNAL PAYLOAD';
  END IF;

  -- Resolver battle_instance (NO existe is_active: usar latest)
  SELECT bi.id INTO v_instance_id
  FROM public.battle_instances bi
  WHERE bi.battle_id = p_battle_id
  ORDER BY bi.created_at DESC
  LIMIT 1;

  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'BATTLE_NOT_ACTIVE';
  END IF;

  -- Insert idempotente por client_event_id
  INSERT INTO public.signal_events (
    anon_id, user_id,
    signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type,
    session_id, attribute_id,
    signal_weight,
    client_event_id
  )
  VALUES (
    v_anon_id, v_uid,
    gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus',
    p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0),
    v_client_event_id
  )
  ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

  -- Solo si insertó de verdad, actualiza stats (evita doble conteo en retries)
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
END;
$$;

-- 2) Permisos: solo authenticated ejecuta
REVOKE ALL ON FUNCTION public.insert_signal_event(uuid, uuid, uuid, uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.insert_signal_event(uuid, uuid, uuid, uuid, uuid) TO authenticated;

COMMIT;
