-- =========================================================================
-- OPINA+ / BLOQUE 3: CONTRATO NO-BATTLE, ENTROPÍA Y TIME-DECAY
-- =========================================================================

BEGIN;

-- 1. DROPS NECESARIOS PARA REEMPLAZAR FIRMAS
DROP FUNCTION IF EXISTS "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text", "p_value_json" "jsonb", "p_signal_type_code" "text", "p_module_type" "text");
DROP FUNCTION IF EXISTS "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text");
DROP FUNCTION IF EXISTS "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid");

-- 2. NUEVO CONTRATO DE ESCRITURA CANÓNICA (FLEXIBLE)
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
  
  -- Para abstracción
  v_throttle_threshold_context uuid;
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

  -- Throttle context_id unificado
  v_throttle_threshold_context := COALESCE(p_battle_id, p_entity_id);

  -- Anti-spam: Cooldown (5 minutos)
  IF v_throttle_threshold_context IS NOT NULL THEN
      PERFORM 1 FROM public.signal_events
      WHERE anon_id = v_anon_id 
        AND (battle_id = v_throttle_threshold_context OR entity_id = v_throttle_threshold_context)
        AND created_at > now() - interval '5 minutes'
      LIMIT 1;

      IF FOUND THEN PERFORM public.raise_sanitized('COOLDOWN_ACTIVE'); END IF;
  END IF;

  -- Límite diario SOLO para no verificados y no administradores
  IF v_is_verified = false AND v_role != 'admin' THEN
    IF v_profile_stage = 1 THEN v_daily_cap := 10; ELSE v_daily_cap := 20; END IF;
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN PERFORM public.raise_sanitized('SIGNAL_LIMIT_REACHED'); END IF;
  END IF;

  -- ========== LÓGICA DE VALIDACIÓN POR MÓDULOS ==========
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
  ELSE
      -- Es news, depth u otro contexto nativo
      -- Validacion flexible
      IF p_entity_id IS NULL THEN 
          -- Retrocompatibilidad: extraer entidad del battle_id que mandaban hackeado
          v_final_entity_id := p_battle_id; 
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

-- -------------------------------------------------------------------------
-- 3. ENTROPÍA DE OPINIÓN (Shannon Normalizada)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_opinion_entropy_stats(
    p_context_target UUID,
    p_is_battle BOOLEAN DEFAULT true
) RETURNS TABLE (
    total_effective_weight NUMERIC,
    options_count INT,
    entropy_raw NUMERIC,
    entropy_normalized NUMERIC,
    opinion_fragmentation_label TEXT
) AS $$
DECLARE
    v_total_weight NUMERIC;
    v_options_count INT;
    v_entropy_raw NUMERIC := 0;
    v_entropy_normalized NUMERIC := 0;
    v_label TEXT := 'desconocida';
BEGIN
    -- Determinar universo total
    IF p_is_battle THEN
        SELECT SUM(effective_weight), COUNT(DISTINCT option_id)
        INTO v_total_weight, v_options_count
        FROM public.signal_events WHERE battle_id = p_context_target AND option_id IS NOT NULL;
    ELSE
        SELECT SUM(effective_weight), COUNT(DISTINCT value_text)
        INTO v_total_weight, v_options_count
        FROM public.signal_events WHERE entity_id = p_context_target AND value_text IS NOT NULL;
    END IF;

    IF v_total_weight > 0 AND v_options_count > 1 THEN
        -- Calcular sumatorio p * log2(p)
        IF p_is_battle THEN
            SELECT SUM(-1.0 * (sum_w / v_total_weight) * (ln(sum_w / v_total_weight) / ln(2.0)))
            INTO v_entropy_raw
            FROM (SELECT option_id, SUM(effective_weight) as sum_w FROM public.signal_events WHERE battle_id = p_context_target GROUP BY option_id) as sq WHERE sum_w > 0;
        ELSE
            SELECT SUM(-1.0 * (sum_w / v_total_weight) * (ln(sum_w / v_total_weight) / ln(2.0)))
            INTO v_entropy_raw
            FROM (SELECT value_text, SUM(effective_weight) as sum_w FROM public.signal_events WHERE entity_id = p_context_target GROUP BY value_text) as sq WHERE sum_w > 0;
        END IF;

        -- Normalizar dividiendo por el maximo posible log2(k)
        v_entropy_normalized := v_entropy_raw / (ln(v_options_count) / ln(2.0));

        IF v_entropy_normalized < 0.4 THEN v_label := 'alta concentración';
        ELSIF v_entropy_normalized <= 0.8 THEN v_label := 'competencia abierta';
        ELSE v_label := 'alta fragmentación';
        END IF;
    ELSIF v_total_weight > 0 AND v_options_count = 1 THEN
        v_entropy_normalized := 0;
        v_label := 'alta concentración';
    END IF;

    RETURN QUERY SELECT 
        COALESCE(v_total_weight, 0), 
        COALESCE(v_options_count, 0), 
        ROUND(COALESCE(v_entropy_raw, 0), 4), 
        ROUND(COALESCE(v_entropy_normalized, 0), 4), 
        v_label;
END;
$$ LANGUAGE plpgsql;


-- -------------------------------------------------------------------------
-- 4. TIME-DECAY RANKINGS B2B
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_trending_leaderboard_decay(
    p_half_life_days NUMERIC DEFAULT 7.0,
    p_category VARCHAR DEFAULT NULL
) RETURNS TABLE (
    entity_id UUID,
    entity_name TEXT,
    raw_wins_weight NUMERIC,
    decayed_wins_weight NUMERIC,
    temporal_decay_applied BOOLEAN,
    decay_rank INT
) AS $$
DECLARE
    v_lambda NUMERIC := ln(2.0) / NULLIF(p_half_life_days, 0); -- cte de decaimiento
BEGIN
    RETURN QUERY
    WITH decayed_signals AS (
        SELECT 
            se.option_id as entity_uuid,
            se.effective_weight,
            se.created_at,
            -- Aplicamos exponencial decay e^(-lambda * dias_pasados)
            se.effective_weight * exp(-v_lambda * EXTRACT(EPOCH FROM (now() - se.created_at))/86400.0) as decayed_weight
        FROM public.signal_events se
        WHERE se.signal_type_code = 'VERSUS_SIGNAL'
          AND se.option_id IS NOT NULL
    ),
    aggregated AS (
        SELECT 
            entity_uuid,
            SUM(effective_weight) as raw_wins_weight,
            SUM(decayed_weight) as decayed_wins_weight
        FROM decayed_signals
        GROUP BY entity_uuid
    )
    SELECT 
        a.entity_uuid as entity_id,
        'Entidad ID ' || a.entity_uuid::TEXT as entity_name,
        ROUND(a.raw_wins_weight, 4),
        ROUND(a.decayed_wins_weight, 4),
        TRUE as temporal_decay_applied,
        ROW_NUMBER() OVER (ORDER BY a.decayed_wins_weight DESC NULLS LAST)::INT as decay_rank
    FROM aggregated a
    WHERE a.raw_wins_weight > 0
    ORDER BY a.decayed_wins_weight DESC;
END;
$$ LANGUAGE plpgsql;


-- -------------------------------------------------------------------------
-- 5. REFACTOR READ MODELS: ACTUALIDAD (Nativo)
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW actualidad_stats_view AS
  SELECT 
    -- Si es signal pre-bloque 3 hereda de battle_id, sino hereda de entity_id
    COALESCE(se.entity_id, se.battle_id) AS topic_id,
    COUNT(DISTINCT se.user_id) AS total_participants,
    COUNT(*) AS total_signals
  FROM public.signal_events se
  WHERE se.module_type = 'news'
  GROUP BY COALESCE(se.entity_id, se.battle_id);

-- -------------------------------------------------------------------------
-- 6. REFACTOR READ MODELS: DEPTH (Nativo)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("question_key" "text", "avg_value" numeric, "total_responses" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
  -- Ahora agrupamos tanto para el esquema legacy (battle_id = entity, option_id = score) 
  -- como el esquema nuevo (entity_id = entity, context_id = pregunta, value_numeric = score)
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_id) AS target_entity_id
  )
  SELECT
    COALESCE(se.context_id, se.attribute_id::text) AS question_key,
    AVG(COALESCE(se.value_numeric, (se.value_json->>'score')::numeric, 0)) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON COALESCE(se.entity_id, se.battle_id) = r.target_entity_id
  WHERE se.module_type = 'depth'
    AND (se.value_numeric IS NOT NULL OR (se.value_json->>'score') IS NOT NULL)
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY COALESCE(se.context_id, se.attribute_id::text);
$$;

COMMIT;
