-- =========================================================================
-- OPINA+ / BLOQUE 1: CORRECCIÓN CONTRATO NO-BATTLE Y MULTIRESPUESTA
-- =========================================================================

BEGIN;

-- Reemplazamos la función para ajustar la lógica de throttle/cooldown
CREATE OR REPLACE FUNCTION "public"."insert_signal_event"(
  "p_battle_id" "uuid" DEFAULT NULL,
  "p_option_id" "uuid" DEFAULT NULL,
  "p_session_id" "uuid" DEFAULT NULL::"uuid",
  "p_attribute_id" "uuid" DEFAULT NULL::"uuid",
  "p_client_event_id" "uuid" DEFAULT NULL::"uuid",
  "p_device_hash" "text" DEFAULT NULL::"text",
  "p_value_json" "jsonb" DEFAULT '{}'::jsonb,
  "p_signal_type_code" "text" DEFAULT 'VERSUS_SIGNAL'::text,
  "p_module_type" "text" DEFAULT 'versus'::text,
  "p_entity_id" "uuid" DEFAULT NULL,
  "p_entity_type" "text" DEFAULT NULL,
  "p_context_id" "text" DEFAULT NULL,
  "p_value_numeric" numeric DEFAULT NULL,
  "p_value_text" "text" DEFAULT NULL
) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_instance_id uuid := NULL;

  v_invite_id uuid;
  v_is_verified boolean := false;
  v_role text;

  v_profile_stage int := 0;
  v_user_weight numeric := 1.0;

  v_daily_actions int := 0;
  v_daily_cap int := 20;

  v_client_event_id uuid := COALESCE(p_client_event_id, gen_random_uuid());
  
  v_signal_type_id bigint;
  v_final_value_json jsonb := p_value_json;
  v_final_entity_id uuid := p_entity_id;
  
BEGIN
  -- Anti-spam: Ban check por device_hash
  IF p_device_hash IS NOT NULL THEN
    PERFORM 1 FROM public.antifraud_flags f WHERE f.device_hash = p_device_hash AND f.banned = true AND f.is_active = true LIMIT 1;
    IF FOUND THEN PERFORM public.raise_sanitized('DEVICE_BANNED'); END IF;

    -- Throttle si el device está flagged como critical pero no baneado
    PERFORM 1 FROM public.antifraud_flags f WHERE f.device_hash = p_device_hash AND f.is_active = true AND f.banned = false AND lower(f.severity) = 'critical' LIMIT 1;
    IF FOUND THEN
      IF (SELECT COUNT(*)::int FROM public.signal_events se WHERE se.device_hash = p_device_hash AND se.created_at > now() - interval '10 minutes') >= 30 THEN
        PERFORM public.raise_sanitized('THROTTLED');
      END IF;
    END IF;
  END IF;

  -- Auth obligatorio
  IF v_uid IS NULL THEN
    PERFORM public.raise_sanitized('Unauthorized');
  END IF;

  -- Chequeo de Rol, Invite y Estado de Verificación
  SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false), COALESCE(u.role, 'user') INTO v_invite_id, v_is_verified, v_role FROM public.users u WHERE u.user_id = v_uid LIMIT 1;

  -- Exentamos a los administradores del requerimiento de invitación
  IF v_role != 'admin' AND v_invite_id IS NULL THEN PERFORM public.raise_sanitized('INVITE_REQUIRED'); END IF;

  -- Perfil
  SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0) INTO v_profile_stage, v_user_weight FROM public.user_profiles up WHERE up.user_id = v_uid LIMIT 1;

  IF v_role != 'admin' THEN
      IF NOT FOUND THEN PERFORM public.raise_sanitized('PROFILE_MISSING'); END IF;
      IF v_profile_stage < 1 THEN PERFORM public.raise_sanitized('PROFILE_INCOMPLETE'); END IF;
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  -- Límite diario SOLO para no verificados y no administradores
  IF v_is_verified = false AND v_role != 'admin' THEN
    IF v_profile_stage = 1 THEN v_daily_cap := 10; ELSE v_daily_cap := 20; END IF;
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED'); END IF;
  END IF;

  -- ========== LÓGICA DE VALIDACIÓN POR MÓDULOS ==========
  -- Y resolución del v_final_entity_id de forma explícita ANTES del cooldown
  
  IF p_module_type IN ('versus', 'progressive') THEN
      IF p_battle_id IS NULL OR p_option_id IS NULL THEN PERFORM public.raise_sanitized('MISSING_BATTLE_ARGS'); END IF;

      -- Battle debe estar activa
      PERFORM 1 FROM public.battles b WHERE b.id = p_battle_id AND COALESCE(b.status, 'active') = 'active' LIMIT 1;
      IF NOT FOUND THEN PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE'); END IF;

      -- option debe pertenecer al battle
      PERFORM 1 FROM public.battle_options bo WHERE bo.id = p_option_id AND bo.battle_id = p_battle_id LIMIT 1;
      IF NOT FOUND THEN PERFORM public.raise_sanitized('INVALID SIGNAL PAYLOAD'); END IF;

      -- Resolver battle_instance
      SELECT bi.id INTO v_instance_id FROM public.battle_instances bi WHERE bi.battle_id = p_battle_id ORDER BY bi.created_at DESC LIMIT 1;
      IF v_instance_id IS NULL THEN PERFORM public.raise_sanitized('BATTLE_NOT_ACTIVE'); END IF;
      
      -- Entity ID fallback for versus
      v_final_entity_id := public.resolve_entity_id(p_option_id);
      
      -- Anti-spam: Cooldown (5 minutos) PARA VERSUS / PROGRESSIVE (Global por Battle)
      PERFORM 1 FROM public.signal_events
      WHERE anon_id = v_anon_id 
        AND (battle_id = p_battle_id OR entity_id = p_battle_id)
        AND created_at > now() - interval '5 minutes'
      LIMIT 1;
      IF FOUND THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
      
  ELSE
      -- Es news, depth, pulse u otro contexto nativo
      -- Validacion flexible
      IF p_entity_id IS NULL THEN 
          -- Retrocompatibilidad: extraer entidad del battle_id que mandaban hackeado
          v_final_entity_id := p_battle_id; 
      END IF;
      
      -- Ignorar cooldown si no hay entidad mapeable
      IF v_final_entity_id IS NOT NULL THEN
          -- Anti-spam: Cooldown (5 minutos) PARA NO-BATTLE (Granular por module + entity + context)
          PERFORM 1 FROM public.signal_events
          WHERE anon_id = v_anon_id 
            AND module_type = p_module_type
            AND (entity_id = v_final_entity_id OR battle_id = v_final_entity_id) -- battle_id check por retrocompatibilidad
            AND COALESCE(context_id, '') = COALESCE(p_context_id, '') -- Si context_id es nulo, lo unimos
            AND created_at > now() - interval '5 minutes'
          LIMIT 1;
          IF FOUND THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
      END IF;
  END IF;

  -- Resolve signal type
  SELECT id INTO v_signal_type_id FROM public.signal_types WHERE code = p_signal_type_code LIMIT 1;

  -- Resolve loser_entity_id if loser_option_id is provided in meta value_json
  IF v_final_value_json ? 'loser_option_id' AND (v_final_value_json->>'loser_option_id') IS NOT NULL THEN
     v_final_value_json := v_final_value_json || jsonb_build_object('loser_entity_id', public.resolve_entity_id((v_final_value_json->>'loser_option_id')::uuid));
  END IF;

  -- Insert idempotente por client_event_id
  INSERT INTO public.signal_events (
    anon_id, user_id,
    signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type,
    context_id, session_id, attribute_id,
    signal_weight,
    client_event_id,
    device_hash,
    value_json,
    value_numeric,
    value_text,
    signal_type_id
  )
  VALUES (
    v_anon_id, v_uid,
    gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    v_final_entity_id, p_entity_type, p_module_type,
    p_context_id, p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0),
    v_client_event_id,
    p_device_hash,
    v_final_value_json,
    p_value_numeric,
    COALESCE(p_value_text, p_option_id::text), -- fallback text if null
    v_signal_type_id
  )
  ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING;

  -- Actualizar metricas
  IF FOUND THEN
    INSERT INTO public.user_activity (user_id, action_type) VALUES (v_uid, 'signal_emitted');
    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at) VALUES (v_uid, 1, now()) ON CONFLICT (user_id) DO UPDATE SET total_signals = public.user_stats.total_signals + 1, last_signal_at = now();
    PERFORM public.update_trust_score(v_uid);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Mapeo error o relanzado
  IF SQLERRM = 'THROTTLED' THEN PERFORM public.raise_sanitized('THROTTLED'); END IF;
  IF SQLERRM = 'DEVICE_BANNED' THEN PERFORM public.raise_sanitized('DEVICE_BANNED'); END IF;
  IF SQLERRM = 'COOLDOWN_ACTIVE' THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
  IF SQLERRM = 'SIGNAL_LIMIT_REACHED' THEN PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED'); END IF;
  IF SQLERRM = 'INVITE_REQUIRED' THEN PERFORM public.raise_sanitized('INVITE_REQUIRED'); END IF;
  IF SQLERRM = 'PROFILE_INCOMPLETE' THEN PERFORM public.raise_sanitized('PROFILE_INCOMPLETE'); END IF;
  IF SQLERRM = 'MISSING_BATTLE_ARGS' THEN PERFORM public.raise_sanitized('MISSING_BATTLE_ARGS'); END IF;
  
  PERFORM public.raise_sanitized('SIGNAL_FAILED');
END;
$$;

COMMIT;
