


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."_touch_antifraud_flags_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."_touch_antifraud_flags_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activate_algorithm_version"("p_version_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Desactivar todas
  UPDATE public.algorithm_versions SET is_active = false;
  
  -- Activar la elegida
  UPDATE public.algorithm_versions SET is_active = true WHERE id = p_version_id;
  
  -- Nota: No levantamos error si no existe para evitar bloqueos en transacciones, 
  -- pero en producción se debería validar.
END;
$$;


ALTER FUNCTION "public"."activate_algorithm_version"("p_version_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  DELETE FROM public.invitation_codes
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;
END;
$$;


ALTER FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text" DEFAULT 'OP'::"text", "p_expires_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_assigned_aliases" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("id" "uuid", "code" "text", "assigned_alias" "text", "status" "text", "expires_at" timestamp with time zone, "used_at" timestamp with time zone, "used_by_user_id" "uuid", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
DECLARE
  i int;
  v_code text;
  v_alias text;
BEGIN
  -- Solo admin
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  IF p_count IS NULL OR p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'INVALID_COUNT';
  END IF;

  FOR i IN 1..p_count LOOP
    -- Código en MAYÚSCULAS (para pasar invitation_codes_code_upper_chk)
    v_code := upper(trim(p_prefix)) || '-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));

    v_alias := NULL;
    IF p_assigned_aliases IS NOT NULL AND array_length(p_assigned_aliases, 1) >= i THEN
      v_alias := p_assigned_aliases[i];
    END IF;

    -- Insert con tus columnas reales (max_uses/current_uses/status/etc)
    INSERT INTO public.invitation_codes (
      code,
      assigned_alias,
      expires_at,
      status,
      max_uses,
      current_uses,
      issued_to_label,
      created_by
    )
    VALUES (
      v_code,
      v_alias,
      p_expires_at,
      'active',
      1,
      0,
      'admin_generate_invites',
      auth.uid()
    )
    RETURNING
      invitation_codes.id,
      invitation_codes.code,
      invitation_codes.assigned_alias,
      invitation_codes.status,
      invitation_codes.expires_at,
      invitation_codes.used_at,
      invitation_codes.used_by_user_id,
      invitation_codes.created_at
    INTO
      id,
      code,
      assigned_alias,
      status,
      expires_at,
      used_at,
      used_by_user_id,
      created_at;

    RETURN NEXT;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text", "p_expires_at" timestamp with time zone, "p_assigned_aliases" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_get_analytics_mode"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN 'UNAUTHORIZED_ADMIN';
  END IF;

  RETURN public.get_analytics_mode();
END;
$$;


ALTER FUNCTION "public"."admin_get_analytics_mode"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_get_device_summary"("p_device_hash" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_hash text := trim(p_device_hash);
  v_last_signal timestamptz;
  v_signals_24h int;
  v_signals_10m int;
  v_distinct_users_24h int;
  v_distinct_battles_24h int;
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_hash IS NULL OR length(v_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE_HASH');
  END IF;

  SELECT MAX(se.created_at) INTO v_last_signal
  FROM public.signal_events se
  WHERE se.device_hash = v_hash;

  SELECT COUNT(*)::int INTO v_signals_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.created_at > now() - interval '24 hours';

  SELECT COUNT(*)::int INTO v_signals_10m
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.created_at > now() - interval '10 minutes';

  SELECT COUNT(DISTINCT se.user_id)::int INTO v_distinct_users_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.user_id IS NOT NULL
    AND se.created_at > now() - interval '24 hours';

  SELECT COUNT(DISTINCT se.battle_id)::int INTO v_distinct_battles_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.battle_id IS NOT NULL
    AND se.created_at > now() - interval '24 hours';

  RETURN jsonb_build_object(
    'ok', true,
    'device_hash', v_hash,
    'last_signal_at', v_last_signal,
    'signals_24h', COALESCE(v_signals_24h, 0),
    'signals_10m', COALESCE(v_signals_10m, 0),
    'distinct_users_24h', COALESCE(v_distinct_users_24h, 0),
    'distinct_battles_24h', COALESCE(v_distinct_battles_24h, 0)
  );
END;
$$;


ALTER FUNCTION "public"."admin_get_device_summary"("p_device_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_antifraud_flags"("p_limit" integer DEFAULT 200) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "device_hash" "text", "flag_type" "text", "severity" "text", "is_active" boolean, "banned" boolean, "banned_at" timestamp with time zone, "banned_reason" "text", "details" "jsonb")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT f.id, f.created_at, f.updated_at, f.device_hash, f.flag_type, f.severity, f.is_active, f.banned, f.banned_at, f.banned_reason, f.details
  FROM public.antifraud_flags f
  WHERE public.is_admin_user() = true
  ORDER BY f.updated_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;


ALTER FUNCTION "public"."admin_list_antifraud_flags"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_app_events"("p_limit" integer DEFAULT 200) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "event_name" "text", "severity" "text", "user_id" "uuid", "anon_id" "text", "client_event_id" "uuid", "app_version" "text", "context" "jsonb")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT e.id, e.created_at, e.event_name, e.severity, e.user_id, e.anon_id, e.client_event_id, e.app_version, e.context
  FROM public.app_events e
  WHERE public.is_admin_user() = true
  ORDER BY e.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;


ALTER FUNCTION "public"."admin_list_app_events"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_invite_redemptions"("p_limit" integer DEFAULT 200) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "invite_code_entered" "text", "result" "text", "nickname" "text", "user_id" "uuid", "anon_id" "text", "invite_id" "uuid", "app_version" "text", "user_agent" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  RETURN QUERY
  SELECT r.id, r.created_at, r.invite_code_entered, r.result, r.nickname, r.user_id, r.anon_id, r.invite_id, r.app_version, r.user_agent
  FROM public.invite_redemptions r
  ORDER BY r.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('ADMIN_RPC_FAILED');
END;
$$;


ALTER FUNCTION "public"."admin_list_invite_redemptions"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_invites"("p_limit" integer DEFAULT 200) RETURNS TABLE("id" "uuid", "code" "text", "assigned_alias" "text", "status" "text", "expires_at" timestamp with time zone, "used_at" timestamp with time zone, "used_by_user_id" "uuid", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  RETURN QUERY
  SELECT ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at
  FROM public.invitation_codes ic
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

EXCEPTION WHEN OTHERS THEN
  PERFORM public.raise_sanitized('ADMIN_RPC_FAILED');
END;
$$;


ALTER FUNCTION "public"."admin_list_invites"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_revoke_invite"("p_code" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_updated int;
BEGIN
  IF public.is_admin_user() = false THEN
    PERFORM public.raise_sanitized('UNAUTHORIZED_ADMIN');
  END IF;

  UPDATE public.invitation_codes
  SET status = 'revoked'
  WHERE code = p_code
    AND status = 'active'
    AND used_by_user_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_ALREADY_USED');
  END IF;

  RETURN jsonb_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', 'ADMIN_RPC_FAILED');
END;
$$;


ALTER FUNCTION "public"."admin_revoke_invite"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_analytics_mode"("p_mode" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_mode text := lower(trim(p_mode));
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_mode NOT IN ('all','clean') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_MODE');
  END IF;

  INSERT INTO public.app_config(key, value, updated_at)
  VALUES ('analytics_mode', v_mode, now())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;

  RETURN jsonb_build_object('ok', true, 'mode', v_mode);
END;
$$;


ALTER FUNCTION "public"."admin_set_analytics_mode"("p_mode" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_device_ban"("p_device_hash" "text", "p_banned" boolean, "p_reason" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_hash text := trim(p_device_hash);
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_hash IS NULL OR length(v_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE_HASH');
  END IF;

  -- Upsert general ban record
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details, banned, banned_at, banned_reason, is_active)
  VALUES (v_hash, 'manual_ban', 'critical', '{}'::jsonb, p_banned, CASE WHEN p_banned THEN now() ELSE NULL END, p_reason, true)
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET banned = EXCLUDED.banned,
        banned_at = EXCLUDED.banned_at,
        banned_reason = EXCLUDED.banned_reason,
        is_active = true;

  RETURN jsonb_build_object('ok', true);
END;
$$;


ALTER FUNCTION "public"."admin_set_device_ban"("p_device_hash" "text", "p_banned" boolean, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_status text := lower(trim(coalesce(p_status,'')));
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  IF v_status NOT IN ('active','revoked') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  UPDATE public.invitation_codes
     SET status = v_status
   WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;
END;
$$;


ALTER FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."antifraud_auto_decay"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- 1) many_accounts: desactivar si no hay señales del device en 7 días
  UPDATE public.antifraud_flags f
  SET is_active = false
  WHERE f.is_active = true
    AND f.banned = false
    AND f.flag_type = 'many_accounts'
    AND NOT EXISTS (
      SELECT 1
      FROM public.signal_events se
      WHERE se.device_hash = f.device_hash
        AND se.created_at > now() - interval '7 days'
      LIMIT 1
    );

  -- 2) high_velocity: desactivar si no hay señales del device en 48 horas
  UPDATE public.antifraud_flags f
  SET is_active = false
  WHERE f.is_active = true
    AND f.banned = false
    AND f.flag_type = 'high_velocity'
    AND NOT EXISTS (
      SELECT 1
      FROM public.signal_events se
      WHERE se.device_hash = f.device_hash
        AND se.created_at > now() - interval '48 hours'
      LIMIT 1
    );

  -- 3) manual_ban: nunca auto-desactivar (no hacer nada)
END;
$$;


ALTER FUNCTION "public"."antifraud_auto_decay"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."api_get_ranking"("p_api_key" "text", "p_battle_slug" "text") RETURNS TABLE("option_id" "uuid", "option_label" "text", "total_weight" numeric, "rank_position" integer, "snapshot_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_latest_ts TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 1. Validar llave y cuota
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Registrar consumo
  INSERT INTO public.api_usage_logs (
    client_id,
    endpoint
  )
  VALUES (
    v_client_id,
    'api_get_ranking'
  );

  -- 3. Obtener timestamp del snapshot más reciente para esta batalla
  SELECT MAX(rs.snapshot_at) INTO v_latest_ts
  FROM public.ranking_snapshots rs
  WHERE rs.battle_slug = p_battle_slug;

  -- 4. Retornar ranking
  RETURN QUERY
  SELECT 
    rs.option_id,
    bo.label AS option_label,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at
  FROM public.ranking_snapshots rs
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.battle_slug = p_battle_slug
    AND rs.snapshot_at = v_latest_ts
  ORDER BY rs.rank_position ASC;
END;
$$;


ALTER FUNCTION "public"."api_get_ranking"("p_api_key" "text", "p_battle_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."b2b_list_rankings"("p_module_type" "text", "p_segment_hash" "text" DEFAULT 'global'::"text", "p_limit" integer DEFAULT 100, "p_snapshot_bucket" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("snapshot_bucket" timestamp with time zone, "module_type" "text", "battle_id" "uuid", "battle_title" "text", "option_id" "uuid", "option_label" "text", "score" numeric, "signals_count" integer, "segment" "jsonb", "segment_hash" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_bucket timestamptz;
  v_limit int;
  v_mod text := lower(trim(p_module_type));
  v_seg text := COALESCE(trim(p_segment_hash), 'global');
BEGIN
  IF public.is_b2b_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_B2B' USING ERRCODE = 'P0001';
  END IF;

  IF v_mod NOT IN ('versus','progressive') THEN
    RAISE EXCEPTION 'INVALID_MODULE' USING ERRCODE = 'P0001';
  END IF;

  v_limit := GREATEST(1, LEAST(COALESCE(p_limit,100), 500));

  IF p_snapshot_bucket IS NULL THEN
    SELECT MAX(s.snapshot_bucket) INTO v_bucket
    FROM public.public_rank_snapshots s;
  ELSE
    v_bucket := p_snapshot_bucket;
  END IF;

  IF v_bucket IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.snapshot_bucket,
    s.module_type,
    s.battle_id,
    b.title AS battle_title,
    s.option_id,
    o.label AS option_label,
    s.score,
    s.signals_count,
    s.segment,
    s.segment_hash
  FROM public.public_rank_snapshots s
  LEFT JOIN public.battles b ON b.id = s.battle_id
  LEFT JOIN public.battle_options o ON o.id = s.option_id
  WHERE s.snapshot_bucket = v_bucket
    AND s.module_type = v_mod
    AND COALESCE(s.segment_hash,'global') = v_seg
  ORDER BY s.score DESC
  LIMIT v_limit;
END;
$$;


ALTER FUNCTION "public"."b2b_list_rankings"("p_module_type" "text", "p_segment_hash" "text", "p_limit" integer, "p_snapshot_bucket" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bootstrap_user_after_signup"("p_nickname" "text", "p_invitation_code" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_invitation_code));
  v_nick text := trim(p_nickname);

  v_invite_id uuid;
  v_alias text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  END IF;

  IF v_nick IS NULL OR length(v_nick) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NICKNAME_TOO_SHORT');
  END IF;

  IF v_code IS NULL OR length(v_code) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Marcar expirados (best-effort)
  UPDATE public.invitation_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  -- Tomar código válido (activo, no usado, no expirado)
  SELECT ic.id, ic.assigned_alias
  INTO v_invite_id, v_alias
  FROM public.invitation_codes ic
  WHERE upper(ic.code) = v_code
    AND ic.status = 'active'
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND ic.used_by_user_id IS NULL
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  -- Marcar como usado de forma atómica (evita carreras)
  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_ALREADY_USED');
  END IF;

  -- Asegurar fila en public.users (si no existe)
  INSERT INTO public.users (user_id, invitation_code_id)
  VALUES (v_uid, v_invite_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  -- Crear/actualizar perfil con nickname (NO tocar demographics acá)
  INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
  VALUES (v_uid, v_nick, 0, 1.0)
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  RETURN jsonb_build_object('ok', true, 'invite_id', v_invite_id, 'assigned_alias', v_alias);
END;
$$;


ALTER FUNCTION "public"."bootstrap_user_after_signup"("p_nickname" "text", "p_invitation_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bootstrap_user_after_signup_v2"("p_nickname" "text", "p_invitation_code" "text", "p_app_version" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_invitation_code));
  v_nick text := trim(p_nickname);

  v_invite_id uuid;
  v_alias text;
  v_anon text;

  v_user_attempts int := 0;
  v_code_attempts int := 0;
BEGIN
  IF v_uid IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (NULL, NULL, COALESCE(v_code,'(null)'), 'unauthorized', NULL, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  END IF;

  SELECT COUNT(*)::int INTO v_user_attempts
  FROM public.invite_redemptions r
  WHERE r.user_id = v_uid
    AND r.created_at > now() - interval '10 minutes';

  IF v_user_attempts >= 8 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  IF v_nick IS NULL OR length(v_nick) < 3 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'nickname_too_short', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'NICKNAME_TOO_SHORT');
  END IF;

  IF v_code IS NULL OR length(v_code) < 4 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, COALESCE(v_code,'(null)'), 'invite_invalid', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  SELECT COUNT(*)::int INTO v_code_attempts
  FROM public.invite_redemptions r
  WHERE r.invite_code_entered = v_code
    AND r.created_at > now() - interval '10 minutes';

  IF v_code_attempts >= 20 THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'rate_limited', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'RATE_LIMITED');
  END IF;

  UPDATE public.invitation_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  SELECT ic.id, ic.assigned_alias
  INTO v_invite_id, v_alias
  FROM public.invitation_codes ic
  WHERE upper(ic.code) = v_code
    AND ic.status = 'active'
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND ic.used_by_user_id IS NULL
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, NULL, v_code, 'invite_invalid', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  UPDATE public.invitation_codes
  SET used_by_user_id = v_uid,
      used_at = now(),
      status = 'used'
  WHERE id = v_invite_id
    AND used_by_user_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
    VALUES (v_uid, v_invite_id, v_code, 'invite_already_used', v_nick, p_app_version, p_user_agent);
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_INVALID');
  END IF;

  INSERT INTO public.users (user_id, invitation_code_id)
  VALUES (v_uid, v_invite_id)
  ON CONFLICT (user_id) DO UPDATE
    SET invitation_code_id = EXCLUDED.invitation_code_id;

  INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
  VALUES (v_uid, v_nick, 0, 1.0)
  ON CONFLICT (user_id) DO UPDATE
    SET nickname = EXCLUDED.nickname;

  v_anon := public.get_or_create_anon_id();

  INSERT INTO public.invite_redemptions(user_id, anon_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (v_uid, v_anon, v_invite_id, v_code, 'success', v_nick, p_app_version, p_user_agent);

  RETURN jsonb_build_object('ok', true, 'invite_id', v_invite_id, 'assigned_alias', v_alias);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.invite_redemptions(user_id, invite_id, invite_code_entered, result, nickname, app_version, user_agent)
  VALUES (auth.uid(), NULL, COALESCE(p_invitation_code,'(null)'), 'unknown_error', p_nickname, p_app_version, p_user_agent);
  RETURN jsonb_build_object('ok', false, 'error', 'UNKNOWN_ERROR');
END;
$$;


ALTER FUNCTION "public"."bootstrap_user_after_signup_v2"("p_nickname" "text", "p_invitation_code" "text", "p_app_version" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_profile_completeness"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_score int := 0;
BEGIN
  -- Basic Demographics (40%)
  IF NEW.age_range IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF NEW.gender IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.comuna IS NOT NULL THEN v_score := v_score + 15; END IF;
  
  -- Socioeconomic (30%)
  IF NEW.housing_status IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.education_level IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF NEW.employment_status IS NOT NULL THEN v_score := v_score + 10; END IF;
  
  -- Interests (30%)
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) >= 5 THEN
    v_score := v_score + 30;
  ELSIF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN
    v_score := v_score + (array_length(NEW.interests, 1) * 6); -- partial score up to 5 interests
  END IF;

  -- Cap at 100
  IF v_score > 100 THEN v_score := 100; END IF;

  NEW.profile_completion_percentage := v_score;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_profile_completeness"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_rank_snapshot"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_algo_id uuid;
BEGIN
    SELECT id INTO v_algo_id FROM public.algorithm_versions WHERE is_active = true LIMIT 1;

    INSERT INTO public.ranking_snapshots (option_id, total_signals, total_weight, period_type, algorithm_version_id)
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)),
        '3h',
        v_algo_id
    FROM public.signal_events
    WHERE created_at > now() - interval '3 hours'
    GROUP BY option_id;
END;
$$;


ALTER FUNCTION "public"."calculate_rank_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_recency_factor"("p_created_at" timestamp with time zone, "p_half_life_days" integer DEFAULT 7) RETURNS numeric
    LANGUAGE "sql"
    AS $$
  SELECT EXP(
    - EXTRACT(EPOCH FROM (now() - p_created_at)) / (p_half_life_days * 86400)
  );
$$;


ALTER FUNCTION "public"."calculate_recency_factor"("p_created_at" timestamp with time zone, "p_half_life_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_user_segment_comparison"("p_user_id" "uuid") RETURNS TABLE("entity_id" "uuid", "entity_name" "text", "user_score" double precision, "avg_age" double precision, "avg_gender" double precision, "avg_commune" double precision, "avg_global" double precision, "signals_count" integer, "coherence_level" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_gender text;
    v_age_bucket text;
    v_commune text;
    v_anon_ids uuid[];
BEGIN
    -- Obtener segmentación y anon_ids del usuario
    SELECT gender, age_bucket, commune INTO v_gender, v_age_bucket, v_commune
    FROM profiles WHERE id = p_user_id;

    SELECT array_agg(anon_id) INTO v_anon_ids
    FROM anonymous_identities WHERE user_id = p_user_id;

    RETURN QUERY
    WITH user_scores AS (
        SELECT se.option_id, AVG(se.value_numeric)::float as avg_score, COUNT(*)::int as signals
        FROM signal_events se
        WHERE se.anon_id = ANY(v_anon_ids) AND se.module_type = 'depth' AND se.value_numeric IS NOT NULL
        GROUP BY se.option_id
    ),
    user_prefs AS (
        SELECT se.option_id, COUNT(*)::int as v_count
        FROM signal_events se
        WHERE se.anon_id = ANY(v_anon_ids) AND se.module_type = 'versus'
        GROUP BY se.option_id
    ),
    all_depth AS (
        SELECT 
            se.option_id,
            se.value_numeric,
            p.gender,
            p.age_bucket,
            p.commune
        FROM signal_events se
        LEFT JOIN anonymous_identities ai ON se.anon_id = ai.anon_id
        LEFT JOIN profiles p ON ai.user_id = p.id
        WHERE se.module_type = 'depth' AND se.value_numeric IS NOT NULL
    )
    SELECT 
        e.id as entity_id,
        e.name as entity_name,
        us.avg_score as user_score,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.age_bucket = v_age_bucket)::float as avg_age,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.gender = v_gender)::float as avg_gender,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id AND ad.commune = v_commune)::float as avg_commune,
        (SELECT AVG(ad.value_numeric) FROM all_depth ad WHERE ad.option_id = e.id)::float as avg_global,
        COALESCE(up.v_count, 0) as signals_count,
        CASE 
            -- Coherencia: Si elige mucho (v_count > 5) y pone nota baja (< 4), coherencia Baja.
            -- Si elige mucho y pone nota alta (> 7), coherencia Alta.
            WHEN COALESCE(up.v_count, 0) > 5 AND us.avg_score < 4 THEN 'Baja'
            WHEN COALESCE(up.v_count, 0) > 5 AND us.avg_score > 7 THEN 'Alta'
            WHEN COALESCE(up.v_count, 0) > 2 THEN 'Media'
            ELSE 'Incipiente'
        END as coherence_level
    FROM user_scores us
    JOIN entities e ON us.option_id = e.id
    LEFT JOIN user_prefs up ON us.option_id = up.option_id;
END;
$$;


ALTER FUNCTION "public"."calculate_user_segment_comparison"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_guest_activity"("p_anon_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id uuid;
    v_guest_signals int;
BEGIN
    v_user_id := auth.uid();
    
    -- Validar que la petición venga de un usuario validado real
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Solo usuarios autenticados pueden reclamar perfiles de invitado.';
    END IF;

    -- Validar input
    IF p_anon_id IS NULL OR p_anon_id = '' THEN
        RETURN; -- Silently continue if no anon_id passed
    END IF;

    -- 1. Contar cuántas señales emitió el Guest con este anon_id
    SELECT COUNT(*) INTO v_guest_signals
    FROM public.signal_events
    WHERE anon_id = p_anon_id;

    -- 2. Si el Guest tuvo actividad, sumarla a las estadísticas del usuario ahora Verified
    IF v_guest_signals > 0 THEN
        INSERT INTO public.user_stats (
            user_id, 
            total_signals, 
            last_signal_at, 
            level, 
            signal_weight
        ) 
        VALUES (
            v_user_id, 
            v_guest_signals, 
            now(), 
            1, 
            1.0 -- default before any identity processing
        )
        ON CONFLICT (user_id) DO UPDATE SET 
            total_signals = public.user_stats.total_signals + v_guest_signals,
            updated_at = now();
            
        -- Opcional: Podríamos re-vincular esos signal_events antiguos explícitamente, 
        -- pero Opina+ V12 es Privacy First y separó intencionalmente user_id de signal_events.
        -- Consolidar las estadísticas de volumen es suficiente para mantener el Level y UX.
    END IF;

    -- 3. Si el usuario aún posee el tier 'guest', promoverlo
    UPDATE public.profiles
    SET tier = 'verified_basic' -- Baseline for newly signed-up users
    WHERE id = v_user_id AND tier = 'guest';

END;
$$;


ALTER FUNCTION "public"."claim_guest_activity"("p_anon_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."consume_access_gate_code"("p_code" "text") RETURNS TABLE("token_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_hash text;
begin
  if p_code is null or length(trim(p_code)) < 6 then
    raise exception 'Código inválido';
  end if;

  v_hash := encode(digest(trim(p_code), 'sha256'), 'hex');

  update public.access_gate_tokens
     set uses_count   = uses_count + 1,
         first_used_at = coalesce(first_used_at, now()),
         last_used_at  = now()
   where code_hash = v_hash
     and is_active = true
     and (expires_at is null or expires_at > now())
  returning id into token_id;

  if token_id is null then
    raise exception 'Código no válido, revocado o expirado';
  end if;

  return query select token_id;
end;
$$;


ALTER FUNCTION "public"."consume_access_gate_code"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."consume_invitation"("p_code" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text := upper(trim(p_code));
  invite record;
  v_email text;
BEGIN
  -- Se elimina el bloqueo inicial de v_uid IS NULL para permitir a usuarios anon 
  -- usar el Access Gate y consumir un código de invitación.

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

  -- Consumir + marcar claim (solo marca claim 1:1 si v_uid está presente)
  UPDATE public.invitation_codes
  SET
    current_uses = current_uses + 1,
    claimed_by   = CASE 
                     WHEN invite.max_uses = 1 AND v_uid IS NOT NULL THEN v_uid 
                     ELSE COALESCE(claimed_by, v_uid) 
                   END,
    claimed_at   = CASE 
                     WHEN invite.max_uses = 1 AND v_uid IS NOT NULL THEN now() 
                     ELSE COALESCE(claimed_at, CASE WHEN v_uid IS NOT NULL THEN now() ELSE NULL END) 
                   END,
    status       = CASE WHEN current_uses + 1 >= max_uses THEN 'consumed' ELSE status END
  WHERE id = invite.id;

  -- Si hay sesión autenticada, amarramos el código a public.users
  IF v_uid IS NOT NULL THEN
    SELECT au.email INTO v_email FROM auth.users au WHERE au.id = v_uid;
    INSERT INTO public.users (id, email)
    VALUES (v_uid, coalesce(v_email, ''))
    ON CONFLICT (id) DO NOTHING;

    -- Bind del código al usuario (monitoreo)
    UPDATE public.users
    SET invitation_code_id = invite.id
    WHERE id = v_uid;
  END IF;
END;
$$;


ALTER FUNCTION "public"."consume_invitation"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_daily_signal_actions"("p_anon_id" "text") RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COUNT(DISTINCT signal_id)::int
  FROM public.signal_events
  WHERE anon_id = p_anon_id
    AND created_at >= date_trunc('day', now());
$$;


ALTER FUNCTION "public"."count_daily_signal_actions"("p_anon_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_my_versus_signals"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT COUNT(*)::int
  FROM public.signal_events se
  WHERE se.anon_id = public.get_or_create_anon_id()
    AND se.module_type IN ('versus','progressive');
$$;


ALTER FUNCTION "public"."count_my_versus_signals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_antifraud_high_velocity"("p_window" interval DEFAULT '00:10:00'::interval) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  WITH x AS (
    SELECT se.device_hash, COUNT(*) AS signals_window
    FROM public.signal_events se
    WHERE se.device_hash IS NOT NULL
      AND se.created_at > now() - p_window
    GROUP BY se.device_hash
    HAVING COUNT(*) >= 60
  )
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details)
  SELECT x.device_hash, 'high_velocity', 'critical',
         jsonb_build_object('signals_window', x.signals_window, 'window', p_window::text)
  FROM x
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET severity = EXCLUDED.severity,
        details = EXCLUDED.details,
        is_active = true;
END;
$$;


ALTER FUNCTION "public"."detect_antifraud_high_velocity"("p_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_antifraud_many_accounts"("p_window" interval DEFAULT '24:00:00'::interval) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Solo considera señales con device_hash no null
  WITH x AS (
    SELECT se.device_hash, COUNT(DISTINCT se.user_id) AS users_24h
    FROM public.signal_events se
    WHERE se.device_hash IS NOT NULL
      AND se.created_at > now() - p_window
      AND se.user_id IS NOT NULL
    GROUP BY se.device_hash
    HAVING COUNT(DISTINCT se.user_id) >= 4
  )
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details)
  SELECT x.device_hash, 'many_accounts', 'warn',
         jsonb_build_object('users_24h', x.users_24h, 'window', p_window::text)
  FROM x
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET severity = EXCLUDED.severity,
        details = EXCLUDED.details,
        is_active = true;
END;
$$;


ALTER FUNCTION "public"."detect_antifraud_many_accounts"("p_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_early_signal"("p_battle_slug" "text", "p_hours_window" integer DEFAULT 6) RETURNS TABLE("option_id" "uuid", "option_label" "text", "recent_score" numeric, "historical_avg" numeric, "momentum_ratio" numeric, "classification" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH recent_data AS (
    SELECT 
      se.option_id,
      SUM(se.opinascore) AS score
    FROM public.signal_events se
    JOIN public.battle_instances bi ON bi.id = se.battle_instance_id
    JOIN public.battles b ON b.id = bi.battle_id
    WHERE b.slug = p_battle_slug
      AND se.created_at >= now() - (p_hours_window || ' hours')::interval
    GROUP BY se.option_id
  ),
  historical_data AS (
    SELECT 
      rs.option_id,
      AVG(rs.total_weight) AS avg_score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at >= now() - interval '30 days'
    GROUP BY rs.option_id
  )
  SELECT
    bo.id AS option_id,
    bo.label AS option_label,
    COALESCE(r.score, 0)::NUMERIC AS recent_score,
    COALESCE(h.avg_score, 0)::NUMERIC AS historical_avg,
    CASE
      WHEN COALESCE(h.avg_score, 0) <= 0 THEN 
        CASE WHEN COALESCE(r.score, 0) > 0 THEN 2.0 ELSE 1.0 END
      ELSE (COALESCE(r.score, 0) / h.avg_score)
    END::NUMERIC AS momentum_ratio,
    CASE
      WHEN (COALESCE(r.score, 0) / NULLIF(h.avg_score, 0)) > 1.5 THEN 'emerging'
      WHEN (COALESCE(r.score, 0) / NULLIF(h.avg_score, 0)) < 0.7 AND COALESCE(h.avg_score, 0) > 10 THEN 'cooling'
      ELSE 'stable'
    END::TEXT AS classification
  FROM public.battle_options bo
  JOIN public.battles b ON b.id = bo.battle_id
  LEFT JOIN recent_data r ON r.option_id = bo.id
  LEFT JOIN historical_data h ON h.option_id = bo.id
  WHERE b.slug = p_battle_slug;
END;
$$;


ALTER FUNCTION "public"."detect_early_signal"("p_battle_slug" "text", "p_hours_window" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_signal_spike"("p_user" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COUNT(*) > 20
  FROM public.signal_events
  WHERE user_id = p_user
  AND created_at >= now() - interval '1 hour';
$$;


ALTER FUNCTION "public"."detect_signal_spike"("p_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_demographics_cooldown"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_changed boolean := false;
  v_last timestamptz;
BEGIN
  -- Si el perfil aún no está completo (stage < 4), permitir cambios libres (wizard)
  IF COALESCE(OLD.profile_stage, 0) < 4 THEN
    RETURN NEW;
  END IF;

  -- Detectar cambios en TODOS los campos demográficos relevantes
  IF (NEW.gender IS DISTINCT FROM OLD.gender) THEN v_changed := true; END IF;

  -- edad: soporta age_bucket y/o birth_year (según tu modelo)
  IF (NEW.age_bucket IS DISTINCT FROM OLD.age_bucket) THEN v_changed := true; END IF;
  IF (NEW.birth_year IS DISTINCT FROM OLD.birth_year) THEN v_changed := true; END IF;

  IF (NEW.region IS DISTINCT FROM OLD.region) THEN v_changed := true; END IF;
  IF (NEW.comuna IS DISTINCT FROM OLD.comuna) THEN v_changed := true; END IF;

  -- educación: soporta education y/o education_level
  IF (NEW.education IS DISTINCT FROM OLD.education) THEN v_changed := true; END IF;
  IF (NEW.education_level IS DISTINCT FROM OLD.education_level) THEN v_changed := true; END IF;

  IF (NEW.employment_status IS DISTINCT FROM OLD.employment_status) THEN v_changed := true; END IF;
  IF (NEW.income_range IS DISTINCT FROM OLD.income_range) THEN v_changed := true; END IF;
  IF (NEW.housing_type IS DISTINCT FROM OLD.housing_type) THEN v_changed := true; END IF;
  IF (NEW.purchase_behavior IS DISTINCT FROM OLD.purchase_behavior) THEN v_changed := true; END IF;
  IF (NEW.influence_level IS DISTINCT FROM OLD.influence_level) THEN v_changed := true; END IF;

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


ALTER FUNCTION "public"."enforce_demographics_cooldown"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."explain_opinascore"("p_user_id" "uuid") RETURNS TABLE("version_name" "text", "base_weight" numeric, "is_verified" boolean, "verification_multiplier" numeric, "current_recency_factor" numeric, "estimated_opinascore" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    av.version_name,
    us.signal_weight as base_weight,
    u.identity_verified as is_verified,
    CASE WHEN u.identity_verified = true THEN av.verification_multiplier ELSE 1.0::numeric END as verification_multiplier,
    public.calculate_recency_factor(now(), av.recency_half_life_days) as current_recency_factor,
    (us.signal_weight * (CASE WHEN u.identity_verified = true THEN av.verification_multiplier ELSE 1.0::numeric END) * public.calculate_recency_factor(now(), av.recency_half_life_days) * COALESCE(us.trust_score, 1.0)) as estimated_opinascore
  FROM public.user_stats us
  JOIN public.profiles u ON u.id = us.user_id
  CROSS JOIN (SELECT version_name, verification_multiplier, recency_half_life_days FROM public.algorithm_versions WHERE is_active = true LIMIT 1) av
  WHERE us.user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."explain_opinascore"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_enrich_signal_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
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
  -- Bloque seguro no-bloqueante
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

      -- Extraer verification de users con la pk user_id
      SELECT COALESCE(u.is_identity_verified, false) INTO v_verified
      FROM public.users u
      WHERE u.user_id = v_uid
      LIMIT 1;

      SELECT COALESCE(us.trust_score, 1.0) INTO v_trust
      FROM public.user_stats us
      WHERE us.user_id = v_uid
      LIMIT 1;

      -- 4) Completar NEW solo si no vienen en null y hay backups
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
      v_verif_factor := CASE WHEN COALESCE(v_verified, false) THEN COALESCE(v_verify_mult, 1.3) ELSE 1.0 END;

      NEW.computed_weight := COALESCE(NEW.computed_weight, (NEW.signal_weight * v_verif_factor * COALESCE(v_trust, 1.0)));
      NEW.opinascore := COALESCE(NEW.opinascore, (NEW.signal_weight * v_recency * v_verif_factor * COALESCE(v_trust, 1.0)));
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fn_enrich_signal_event non-blocking catch: %', SQLERRM;
  END;
  -- Siempre retornamos NEW
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_enrich_signal_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_ensure_entity_depth"("p_entity_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_name text;
  v_cat text;
BEGIN
  SELECT name, category INTO v_name, v_cat FROM public.entities WHERE id = p_entity_id;
  
  -- Pregunta 1: Nota
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position)
  VALUES (p_entity_id, 'nota_general', '¿Qué nota le das a ' || v_name || ' del 0 al 10?', 'scale', 1)
  ON CONFLICT DO NOTHING;

  -- Preguntas 2-6 (Genéricas si no existen)
  INSERT INTO public.depth_definitions (entity_id, question_key, question_text, question_type, position, options)
  VALUES 
    (p_entity_id, 'frecuencia', '¿Con qué frecuencia eliges esta opción?', 'choice', 2, '["Diariamente", "Semanalmente", "Mensualmente", "Ocasionalmente"]'),
    (p_entity_id, 'recomendacion', '¿Qué tan probable es que recomiendes esta opción a un amigo?', 'scale', 3, '[]'),
    (p_entity_id, 'valor', '¿Cómo calificas la relación calidad-precio? (1-5)', 'scale', 4, '[]'),
    (p_entity_id, 'innovacion', '¿Qué tan innovadora consideras que es esta opción? (1-5)', 'scale', 5, '[]'),
    (p_entity_id, 'proposito', '¿Sientes que esta marca aporta un valor real a la sociedad?', 'choice', 6, '["Sí, totalmente", "Parcialmente", "Es indiferente", "No"]')
  ON CONFLICT DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."fn_ensure_entity_depth"("p_entity_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_validate_profile_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Si se cambian campos demográficos críticos
    IF (OLD.age IS DISTINCT FROM NEW.age OR 
        OLD.gender IS DISTINCT FROM NEW.gender OR 
        OLD.commune IS DISTINCT FROM NEW.commune OR 
        OLD.education IS DISTINCT FROM NEW.education) THEN
        
        -- Validar cooldown de 30 días (solo para no-admins)
        IF OLD.last_demographic_update > (now() - interval '30 days') AND OLD.role != 'admin' THEN
            RAISE EXCEPTION 'Solo puedes actualizar tus datos demográficos cada 30 días. Próximo cambio disponible en %', 
                (OLD.last_demographic_update + interval '30 days');
        END IF;

        -- Registrar historia
        IF OLD.age IS DISTINCT FROM NEW.age THEN
            INSERT INTO public.profile_history (user_id, field_changed, old_value, new_value)
            VALUES (NEW.id, 'age', OLD.age::text, NEW.age::text);
        END IF;
        IF OLD.gender IS DISTINCT FROM NEW.gender THEN
            INSERT INTO public.profile_history (user_id, field_changed, old_value, new_value)
            VALUES (NEW.id, 'gender', OLD.gender, NEW.gender);
        END IF;
        -- Repetir para otros campos si es necesario...
        
        NEW.last_demographic_update := now();
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_validate_profile_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text" DEFAULT 'OP'::"text", "p_label_prefix" "text" DEFAULT 'tester'::"text", "p_expires_days" integer DEFAULT NULL::integer) RETURNS TABLE("code" "text", "token_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  i int;
  v_code text;
  v_hash text;
  v_id uuid;
  v_prefix text := upper(trim(coalesce(p_prefix, 'OP')));
  v_label_prefix text := trim(coalesce(p_label_prefix, 'tester'));
  v_role text;
BEGIN
  -- Validación básica
  IF p_count IS NULL OR p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'p_count inválido (1..500)';
  END IF;

  -- Autorización: solo admins (ajustado a user_id para esquema local)
  SELECT role INTO v_role
  FROM public.users
  WHERE user_id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin puede generar códigos';
  END IF;

  FOR i IN 1..p_count LOOP
    -- Código: PREFIX-XXXXXXXX
    v_code := v_prefix || '-' || substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
    v_hash := encode(digest(v_code, 'sha256'), 'hex');

    INSERT INTO public.access_gate_tokens(code_hash, label, is_active, expires_at)
    VALUES (
      v_hash,
      v_label_prefix || '_' || to_char(now(), 'YYYYMMDD') || '_' || i::text,
      true,
      CASE WHEN p_expires_days IS NULL THEN NULL ELSE now() + (p_expires_days || ' days')::interval END
    )
    ON CONFLICT (code_hash) DO NOTHING
    RETURNING id INTO v_id;

    -- Si chocó por conflicto (raro), reintenta una vez
    IF v_id IS NULL THEN
      v_code := v_prefix || '-' || substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
      v_hash := encode(digest(v_code, 'sha256'), 'hex');

      INSERT INTO public.access_gate_tokens(code_hash, label, is_active, expires_at)
      VALUES (
        v_hash,
        v_label_prefix || '_' || to_char(now(), 'YYYYMMDD') || '_' || i::text,
        true,
        CASE WHEN p_expires_days IS NULL THEN NULL ELSE now() + (p_expires_days || ' days')::interval END
      )
      ON CONFLICT (code_hash) DO NOTHING
      RETURNING id INTO v_id;
    END IF;

    IF v_id IS NOT NULL THEN
      code := v_code;
      token_id := v_id;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text", "p_label_prefix" "text", "p_expires_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_benchmark_report"("p_api_key" "text", "p_days_back" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_active_battles TEXT[];
  v_global_volatility JSONB;
  v_top_momentum JSONB;
  v_segment_trends JSONB;
  v_final_benchmark JSONB;
BEGIN

  -- 1. Validar cliente (Consume cuota)
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Obtener lista de batallas activas con datos recientes
  -- (Simularemos la aggregación para Opina+ B2B Benchmark)
  SELECT array_agg(DISTINCT battle_slug)
  INTO v_active_battles
  FROM public.ranking_snapshots
  WHERE generated_at >= CURRENT_DATE - p_days_back * INTERVAL '1 day';

  -- Si no hay batallas recientes, retornar vacío
  IF v_active_battles IS NULL THEN
    RETURN jsonb_build_object('error', 'No active battles found for the period');
  END IF;

  -- 3. Agregación Global: Volatilidad Media del Mercado
  -- Calculamos el promedio de volatilidad de las batallas activas
  SELECT jsonb_build_object(
    'analyzed_battles', array_length(v_active_battles, 1),
    'market_stability_index', 
      ROUND((random() * 80 + 20)::numeric, 2), -- DEMO: Reemplazar con agregación real inter-batalla
    'most_volatile_battle', v_active_battles[1] -- DEMO
  )
  INTO v_global_volatility;

  -- 4. Agregación Global: Entidades con mayor Momentum Positivo (Across all battles)
  SELECT jsonb_agg(
    jsonb_build_object(
      'entity', 'Demo Entity ' || i,
      'battle', v_active_battles[1 + (i % array_length(v_active_battles, 1))],
      'growth_pct', ROUND((random() * 15 + 1)::numeric, 1)
    )
  )
  INTO v_top_momentum
  FROM generate_series(1, 3) i;

  -- 5. Agregación Segmentada: Tendencias por demografía en el mercado
  SELECT jsonb_agg(
    jsonb_build_object(
      'segment', 
      CASE i 
        WHEN 1 THEN 'Millennials (Urban)'
        WHEN 2 THEN 'Gen Z (Students)'
        ELSE 'Boomers (Rural)'
      END,
      'top_preference_shift', 'Tech Services'
    )
  )
  INTO v_segment_trends
  FROM generate_series(1, 3) i;

  -- 6. Construir objeto de Benchmark Consolidado
  v_final_benchmark :=
    jsonb_build_object(
      'report_type', 'benchmark',
      'period_days', p_days_back,
      'battles_included', v_active_battles,
      'global_volatility', v_global_volatility,
      'top_momentum', v_top_momentum,
      'segment_trends', v_segment_trends,
      'generated_at', now()
    );

  -- 7. Persistir Benchmark
  INSERT INTO public.executive_reports (
    report_type,
    battle_slug,
    report_period_days,
    generated_for,
    report_data
  )
  VALUES (
    'benchmark',
    NULL, -- Benchmark es global
    p_days_back,
    v_client_id,
    v_final_benchmark
  );

  RETURN v_final_benchmark;

END;
$$;


ALTER FUNCTION "public"."generate_benchmark_report"("p_api_key" "text", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_depth_snapshot"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insertamos la data segmentada
  -- module_type = 'depth' indica que es una encuesta de profundidad
  -- context_id suele guardar el ID de la pregunta o el atributo evaluado
  
  INSERT INTO public.depth_aggregates (
    battle_slug,
    option_id,
    question_id,
    average_score,
    total_responses,
    age_range,
    gender,
    commune,
    snapshot_at
  )
  SELECT
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'), -- question_id
    AVG(se.value_numeric),
    COUNT(*),
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all'),
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
  GROUP BY
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'),
    COALESCE(se.age_bucket, 'all'),
    COALESCE(se.gender, 'all'),
    COALESCE(se.commune, 'all');

  -- También insertamos el total GLOBAL por pregunta para rapidez
  INSERT INTO public.depth_aggregates (battle_slug, option_id, question_id, average_score, total_responses, age_range, gender, commune, snapshot_at)
  SELECT
    b.slug,
    se.option_id,
    COALESCE(se.context_id, 'general'),
    AVG(se.value_numeric),
    COUNT(*),
    'all',
    'all',
    'all',
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
  GROUP BY b.slug, se.option_id, COALESCE(se.context_id, 'general');

END;
$$;


ALTER FUNCTION "public"."generate_depth_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_entity_rank_snapshots"("p_segment_id" "text" DEFAULT 'global'::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_algo text;
BEGIN
  SELECT COALESCE(version_name, 'v1.0') INTO v_algo
  FROM public.algorithm_versions
  WHERE is_active = true
  LIMIT 1;

  -- Cleanup
  DELETE FROM public.entity_rank_snapshots
  WHERE snapshot_date < now() - interval '30 days';

  WITH seg AS (
    SELECT p_segment_id AS segment_id
  ),
  filtered AS (
    SELECT se.*
    FROM public.signal_events se, seg
    WHERE se.created_at > now() - interval '14 days'
      AND se.entity_id IS NOT NULL
      AND (
        seg.segment_id = 'global'
        OR (seg.segment_id = 'female' AND se.gender = 'female')
        OR (seg.segment_id = 'male' AND se.gender = 'male')
        OR (seg.segment_id = 'young' AND se.age_bucket IN ('-18','under_18','18-24','25-34'))
        OR (seg.segment_id = 'adult' AND se.age_bucket IN ('35-44','45+','45-54','55-64','65_plus'))
      )
  ),
  pref AS (
    SELECT
      se.entity_id,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS w_pref
    FROM filtered se
    WHERE se.module_type IN ('versus','progressive')
    GROUP BY se.entity_id
  ),
  qual AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS avg_nota
    FROM filtered se
    WHERE se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
    GROUP BY se.entity_id
  ),
  base AS (
    SELECT
      e.id AS entity_id,
      e.category AS category_slug,
      COALESCE(p.w_pref, 0) AS w_pref,
      COALESCE(q.avg_nota, 0) AS avg_nota
    FROM public.entities e
    LEFT JOIN pref p ON p.entity_id = e.id
    LEFT JOIN qual q ON q.entity_id = e.id
    WHERE e.category IS NOT NULL
  ),
  cat_tot AS (
    SELECT category_slug, NULLIF(SUM(w_pref), 0) AS tot_w
    FROM base
    GROUP BY category_slug
  ),
  scored AS (
    SELECT
      b.entity_id,
      b.category_slug,
      CASE WHEN ct.tot_w IS NULL THEN 0 ELSE ROUND((b.w_pref / ct.tot_w) * 100, 2) END AS preference_score,
      ROUND(b.avg_nota, 2) AS quality_score,
      ROUND(
        (CASE WHEN ct.tot_w IS NULL THEN 0 ELSE (b.w_pref / ct.tot_w) * 100 END) * 0.60
        + (b.avg_nota * 10.0) * 0.40
      , 2) AS composite_index
    FROM base b
    LEFT JOIN cat_tot ct ON ct.category_slug = b.category_slug
  )
  INSERT INTO public.entity_rank_snapshots (
    entity_id, category_slug, composite_index, preference_score, quality_score,
    snapshot_date, segment_id, algorithm_version
  )
  SELECT
    s.entity_id,
    s.category_slug,
    s.composite_index,
    s.preference_score,
    s.quality_score,
    now(),
    p_segment_id,
    v_algo
  FROM scored s
  WHERE s.category_slug IS NOT NULL;
END;
$$;


ALTER FUNCTION "public"."generate_entity_rank_snapshots"("p_segment_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_entity_rank_snapshots_all"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM public.generate_entity_rank_snapshots('global');
  PERFORM public.generate_entity_rank_snapshots('female');
  PERFORM public.generate_entity_rank_snapshots('male');
  PERFORM public.generate_entity_rank_snapshots('young');
  PERFORM public.generate_entity_rank_snapshots('adult');
END;
$$;


ALTER FUNCTION "public"."generate_entity_rank_snapshots_all"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_executive_report"("p_api_key" "text", "p_battle_slug" "text", "p_days_back" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_ranking_data JSONB;
  v_volatility_data JSONB;
  v_polarization_data JSONB;
  v_influence_data JSONB;
  v_final_report JSONB;
BEGIN

  -- 1. Validar cliente y descontar cuota
  v_client_id := public.validate_api_key(p_api_key);

  -- 2. Recopilar datos de rankings temporales (FIX 21)
  SELECT jsonb_agg(row_to_json(t))
  INTO v_ranking_data
  FROM public.get_temporal_comparison(p_battle_slug, p_days_back) t;

  -- 3. Recopilar datos de volatilidad (FIX 22)
  SELECT row_to_json(v)
  INTO v_volatility_data
  FROM public.get_battle_volatility(p_battle_slug, p_days_back) v;

  -- 4. Recopilar datos de polarización (FIX 23)
  SELECT row_to_json(p)
  INTO v_polarization_data
  FROM public.get_polarization_index(p_battle_slug) p;

  -- 5. Recopilar datos de influencia de segmentos (FIX 25)
  -- Nota: Usamos 7 días para influencia como estándar
  SELECT jsonb_agg(row_to_json(i))
  INTO v_influence_data
  FROM public.get_segment_influence(p_battle_slug, 7) i;

  -- 6. Construir objeto consolidado
  v_final_report :=
    jsonb_build_object(
      'battle', p_battle_slug,
      'period_days', p_days_back,
      'ranking', v_ranking_data,
      'volatility', v_volatility_data,
      'polarization', v_polarization_data,
      'segment_influence', v_influence_data,
      'generated_at', now()
    );

  -- 7. Persistir reporte
  INSERT INTO public.executive_reports (
    battle_slug,
    report_period_days,
    generated_for,
    report_data
  )
  VALUES (
    p_battle_slug,
    p_days_back,
    v_client_id,
    v_final_report
  );

  RETURN v_final_report;

END;
$$;


ALTER FUNCTION "public"."generate_executive_report"("p_api_key" "text", "p_battle_slug" "text", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_momentum_alerts"("p_battle_slug" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT *
    FROM detect_early_signal(p_battle_slug, 6)
    WHERE classification = 'emerging'
  LOOP
    -- Insertar alerta si no hay una alerta similar no resuelta en las últimas 24h
    IF NOT EXISTS (
      SELECT 1 FROM public.platform_alerts
      WHERE type = 'momentum'
        AND metadata->>'battle_slug' = p_battle_slug
        AND metadata->>'option_label' = rec.option_label
        AND is_read = false
        AND created_at > now() - interval '24 hours'
    ) THEN
      INSERT INTO public.platform_alerts (
        type,
        severity,
        title,
        message,
        metadata
      )
      VALUES (
        'momentum',
        'medium',
        'Tendencia Emergente: ' || rec.option_label,
        'Se detectó un momentum de ' || round(rec.momentum_ratio, 2) || 'x en las últimas 6 horas para la batalla ' || p_battle_slug || '.',
        jsonb_build_object(
          'battle_slug', p_battle_slug,
          'option_id', rec.option_id,
          'option_label', rec.option_label,
          'momentum_ratio', rec.momentum_ratio
        )
      );
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_momentum_alerts"("p_battle_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_ranking_snapshot"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_battle_slug text;
  v_v_score numeric;
  v_v_index numeric;
  v_v_class text;
  v_prev_class text;
BEGIN
  -- 1. Insertar snapshots de ranking
  INSERT INTO public.ranking_snapshots (
    battle_slug,
    option_id,
    total_weight,
    rank_position,
    snapshot_at
  )
  SELECT 
    b.slug as battle_slug,
    se.option_id,
    SUM(se.signal_weight) as total_weight,
    RANK() OVER (PARTITION BY b.slug ORDER BY SUM(se.signal_weight) DESC) as rank_position,
    now()
  FROM public.signal_events se
  JOIN public.battles b ON b.id = se.battle_id
  WHERE se.battle_id IS NOT NULL 
    AND se.option_id IS NOT NULL
  GROUP BY b.slug, se.option_id;

  -- 2. Procesar cada batalla activa para Volatilidad y Momentum
  FOR v_battle_slug IN SELECT DISTINCT slug FROM public.battles WHERE deleted_at IS NULL LOOP
    
    -- a) Alertas de Momentum (NUEVO FIX 27)
    PERFORM public.generate_momentum_alerts(v_battle_slug);

    -- b) Volatilidad (FIX 24)
    SELECT volatility_score, volatility_index, classification 
    INTO v_v_score, v_v_index, v_v_class
    FROM public.get_battle_volatility(v_battle_slug, 30);

    IF v_v_class IS NOT NULL THEN
      SELECT classification INTO v_prev_class
      FROM public.volatility_snapshots
      WHERE battle_slug = v_battle_slug
      ORDER BY snapshot_at DESC
      LIMIT 1;

      INSERT INTO public.volatility_snapshots (
        battle_slug,
        volatility_index,
        classification,
        snapshot_at
      ) VALUES (
        v_battle_slug,
        v_v_index,
        v_v_class,
        now()
      );

      IF v_prev_class IS NOT NULL AND v_prev_class <> v_v_class THEN
        INSERT INTO public.platform_alerts (
          type,
          severity,
          title,
          message,
          metadata
        ) VALUES (
          'volatility',
          CASE 
            WHEN v_v_class = 'volatile' AND v_prev_class = 'stable' THEN 'critical'
            WHEN v_v_class = 'volatile' THEN 'warning'
            ELSE 'info'
          END,
          'Cambio de Volatilidad: ' || v_battle_slug,
          'La batalla ha pasado de ' || v_prev_class || ' a ' || v_v_class || '.',
          jsonb_build_object(
            'battle_slug', v_battle_slug,
            'prev_class', v_prev_class,
            'new_class', v_v_class,
            'volatility_index', v_v_index
          )
        );
      END IF;
    END IF;
  END LOOP;
  
  -- 3. Limpiar snapshots antiguos
  DELETE FROM public.ranking_snapshots 
  WHERE snapshot_at < now() - interval '30 days';

  DELETE FROM public.volatility_snapshots
  WHERE snapshot_at < now() - interval '30 days';
END;
$$;


ALTER FUNCTION "public"."generate_ranking_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_segmented_snapshot"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_algo_id uuid;
BEGIN
    SELECT id INTO v_algo_id FROM public.algorithm_versions WHERE is_active = true LIMIT 1;

    INSERT INTO public.ranking_snapshots (
        option_id, total_signals, total_weight, period_type, 
        age_bucket, gender, region, algorithm_version_id
    )
    SELECT 
        option_id,
        COUNT(*),
        SUM(COALESCE(opinascore, signal_weight, 1.0)),
        'segmented',
        age_bucket,
        gender,
        region,
        (SELECT id FROM public.algorithm_versions WHERE is_active = true LIMIT 1)
    FROM public.signal_events
    WHERE created_at > now() - interval '24 hours'
    GROUP BY option_id, age_bucket, gender, region;
END;
$$;


ALTER FUNCTION "public"."generate_segmented_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_battles"() RETURNS TABLE("id" "uuid", "slug" "text", "title" "text", "description" "text", "created_at" timestamp with time zone, "category" "jsonb", "options" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id, b.slug, b.title, b.description, b.created_at,
        jsonb_build_object('slug', c.slug, 'name', c.name, 'emoji', c.emoji) AS category,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', bo.id, 
                    'label', bo.label, 
                    'image_url', bo.image_url,
                    'category', e.category -- Newly added to group options in frontend
                ) ORDER BY bo.sort_order
            )
            FROM public.battle_options bo 
            LEFT JOIN public.entities e ON bo.brand_id = e.id
            WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND NOT EXISTS (
        -- VALIDACIÓN CRÍTICA: La batalla NO se muestra si alguna de sus opciones (entidades) tiene menos de 6 preguntas
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 6
    )
    ORDER BY b.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_active_battles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("entity_id" "uuid", "entity_name" "text", "preference_rate" numeric, "avg_quality" numeric, "total_signals" bigint, "gap_score" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT *
    FROM public.signal_events se
    WHERE se.created_at > now() - interval '30 days'
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
  ),
  pref AS (
    SELECT
      se.entity_id,
      COUNT(*)::bigint AS votes,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS w
    FROM base se
    WHERE se.module_type IN ('versus','progressive')
      AND se.entity_id IS NOT NULL
    GROUP BY se.entity_id
  ),
  pref_cat AS (
    SELECT e.category, SUM(p.w) AS total_w
    FROM pref p
    JOIN public.entities e ON e.id = p.entity_id
    WHERE e.category IS NOT NULL
    GROUP BY e.category
  ),
  qual AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS avg_nota,
      COUNT(DISTINCT se.signal_id)::bigint AS responses
    FROM base se
    WHERE se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.entity_id IS NOT NULL
      AND se.value_numeric IS NOT NULL
    GROUP BY se.entity_id
  )
  SELECT
    e.id AS entity_id,
    e.name AS entity_name,
    CASE
      WHEN pc.total_w IS NULL OR pc.total_w = 0 THEN 0
      ELSE ROUND((COALESCE(p.w,0) / pc.total_w) * 100, 2)
    END AS preference_rate,
    COALESCE(ROUND(q.avg_nota, 2), 0) AS avg_quality,
    (COALESCE(p.votes,0) + COALESCE(q.responses,0))::bigint AS total_signals,
    ROUND(
      (
        CASE
          WHEN pc.total_w IS NULL OR pc.total_w = 0 THEN 0
          ELSE (COALESCE(p.w,0) / pc.total_w) * 100
        END
      ) - (COALESCE(q.avg_nota,0) * 10.0)
    , 2) AS gap_score
  FROM public.entities e
  LEFT JOIN pref p ON p.entity_id = e.id
  LEFT JOIN qual q ON q.entity_id = e.id
  LEFT JOIN pref_cat pc ON pc.category = e.category
  WHERE e.category = p_category_slug
  ORDER BY preference_rate DESC, avg_quality DESC;
END;
$$;


ALTER FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_age_bucket"("p_age" integer) RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    IF p_age < 18 THEN RETURN 'under_18';
    ELSIF p_age BETWEEN 18 AND 24 THEN RETURN '18-24';
    ELSIF p_age BETWEEN 25 AND 34 THEN RETURN '25-34';
    ELSIF p_age BETWEEN 35 AND 44 THEN RETURN '35-44';
    ELSIF p_age BETWEEN 45 AND 54 THEN RETURN '45-54';
    ELSIF p_age BETWEEN 55 AND 64 THEN RETURN '55-64';
    ELSE RETURN '65_plus';
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_age_bucket"("p_age" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_agg_last_refreshed_at"("p_category_slug" "text" DEFAULT NULL::"text") RETURNS timestamp with time zone
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT MAX(last_refreshed_at)
  FROM public.entity_daily_aggregates
  WHERE (p_category_slug IS NULL OR category_slug = p_category_slug);
$$;


ALTER FUNCTION "public"."get_agg_last_refreshed_at"("p_category_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_mode"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT COALESCE((SELECT value FROM public.app_config WHERE key='analytics_mode' LIMIT 1), 'all');
$$;


ALTER FUNCTION "public"."get_analytics_mode"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_b2b_dashboard_data"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_client_name TEXT;
  v_api_key TEXT;
  v_requests_used INTEGER;
  v_plan_name TEXT;
  v_request_limit INTEGER;
  v_monthly_price NUMERIC;
  v_features JSONB;
BEGIN
  -- Intentar buscar al cliente API asociado al UID actual
  SELECT 
    ac.id, ac.client_name, ac.api_key, ac.requests_used,
    sp.plan_name, sp.request_limit, sp.monthly_price, sp.features
  INTO 
    v_client_id, v_client_name, v_api_key, v_requests_used,
    v_plan_name, v_request_limit, v_monthly_price, v_features
  FROM public.api_clients ac
  LEFT JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.user_id = auth.uid()
    AND ac.active = true
  LIMIT 1;

  -- Si no existe cliente, retornamos un JSON nulo o de error controlado (depende del frontend).
  IF v_client_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'client_id', v_client_id,
    'client_name', v_client_name,
    'api_key', v_api_key,
    'requests_used', v_requests_used,
    'plan_name', v_plan_name,
    'request_limit', v_request_limit,
    'monthly_price', v_monthly_price,
    'features', v_features
  );
END;
$$;


ALTER FUNCTION "public"."get_b2b_dashboard_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_battle_momentum"("p_battle_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result JSONB;
  v_opt_a_id UUID;
  v_opt_b_id UUID;
  v_opt_a_total BIGINT := 0;
  v_opt_b_total BIGINT := 0;
  v_opt_a_24h BIGINT := 0;
  v_opt_b_24h BIGINT := 0;
  v_total_battle BIGINT := 0;
  v_total_24h BIGINT := 0;
  v_pct_a NUMERIC := 0;
  v_pct_b NUMERIC := 0;
  v_variant_a NUMERIC := 0;
  v_variant_b NUMERIC := 0;
  v_options RECORD;
BEGIN
  -- Obtain the two options for the battle (assumes a standard 1v1 battle)
  -- If more options exist, we take the primary two to maintain 1v1 UX momentum.
  SELECT array_agg(id) INTO v_options FROM (
    SELECT id FROM public.battle_options WHERE battle_id = p_battle_id ORDER BY sort_order LIMIT 2
  ) as sub;

  IF v_options IS NOT NULL AND array_length(v_options.array_agg, 1) >= 2 THEN
    v_opt_a_id := v_options.array_agg[1];
    v_opt_b_id := v_options.array_agg[2];

    -- Total signals per option
    SELECT COUNT(*) INTO v_opt_a_total FROM public.signal_events WHERE option_id = v_opt_a_id;
    SELECT COUNT(*) INTO v_opt_b_total FROM public.signal_events WHERE option_id = v_opt_b_id;

    -- Signals in the last 24h per option
    SELECT COUNT(*) INTO v_opt_a_24h FROM public.signal_events 
    WHERE option_id = v_opt_a_id AND created_at >= (now() - interval '24 hours');
    SELECT COUNT(*) INTO v_opt_b_24h FROM public.signal_events 
    WHERE option_id = v_opt_b_id AND created_at >= (now() - interval '24 hours');

    -- Calculations
    v_total_battle := v_opt_a_total + v_opt_b_total;
    v_total_24h := v_opt_a_24h + v_opt_b_24h;

    IF v_total_battle > 0 THEN
      v_pct_a := ROUND((v_opt_a_total::NUMERIC / v_total_battle) * 100, 1);
      v_pct_b := ROUND((v_opt_b_total::NUMERIC / v_total_battle) * 100, 1);
    ELSE
      v_pct_a := 50.0;
      v_pct_b := 50.0;
    END IF;

    -- Variant calculation (mocking a "momentum" percentage based on 24h flow vs historic flow)
    IF v_total_24h > 0 THEN
      v_variant_a := ROUND(((v_opt_a_24h::NUMERIC / v_total_24h) * 100) - v_pct_a, 1);
      v_variant_b := ROUND(((v_opt_b_24h::NUMERIC / v_total_24h) * 100) - v_pct_b, 1);
    END IF;
  ELSE
    -- Fallback if not exactly 2 options
    v_pct_a := 50.0; v_pct_b := 50.0;
  END IF;

  v_result := jsonb_build_object(
    'total_signals', v_total_battle,
    'options', jsonb_build_array(
       jsonb_build_object('id', v_opt_a_id, 'percentage', v_pct_a, 'variant_24h', v_variant_a, 'total', v_opt_a_total),
       jsonb_build_object('id', v_opt_b_id, 'percentage', v_pct_b, 'variant_24h', v_variant_b, 'total', v_opt_b_total)
    )
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_battle_momentum"("p_battle_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_battle_volatility"("p_battle_slug" "text", "p_days_back" integer DEFAULT 30) RETURNS TABLE("volatility_score" numeric, "volatility_index" numeric, "classification" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  std_dev NUMERIC;
  avg_score NUMERIC;
  normalized NUMERIC;
BEGIN

  WITH recent_data AS (
    SELECT total_weight
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND snapshot_at >= now() - (p_days_back || ' days')::interval
  )
  SELECT
    STDDEV(total_weight),
    AVG(total_weight)
  INTO std_dev, avg_score
  FROM recent_data;

  IF avg_score IS NULL OR avg_score = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 'stable'::TEXT;
    RETURN;
  END IF;

  normalized := (std_dev / avg_score) * 100;

  RETURN QUERY
  SELECT
    std_dev::NUMERIC,
    normalized::NUMERIC,
    CASE
      WHEN normalized < 5 THEN 'stable'
      WHEN normalized < 15 THEN 'moderate'
      ELSE 'volatile'
    END::TEXT;

END;
$$;


ALTER FUNCTION "public"."get_battle_volatility"("p_battle_slug" "text", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_overview_agg"("p_category_slug" "text", "p_days" integer DEFAULT 14, "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("entity_id" "uuid", "entity_name" "text", "image_url" "text", "signals_count" bigint, "unique_users" bigint, "preference_score" numeric, "depth_nota_avg" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  WITH w AS (
    SELECT *
    FROM public.entity_daily_aggregates a
    WHERE a.category_slug = p_category_slug
      AND a.day >= (now()::date - p_days)
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
  ),
  agg AS (
    SELECT
      entity_id,
      SUM(signals_count)::bigint AS signals_count,
      SUM(unique_users)::bigint AS unique_users,
      SUM(opinascore_sum)::numeric AS preference_score,
      CASE
        WHEN SUM(depth_nota_n) = 0 THEN NULL
        ELSE (SUM(COALESCE(depth_nota_avg,0) * depth_nota_n) / SUM(depth_nota_n))::numeric
      END AS depth_nota_avg
    FROM w
    GROUP BY entity_id
  )
  SELECT
    agg.entity_id,
    e.name AS entity_name,
    e.image_url,
    agg.signals_count,
    agg.unique_users,
    COALESCE(agg.preference_score, 0) AS preference_score,
    agg.depth_nota_avg
  FROM agg
  JOIN public.entities e ON e.id = agg.entity_id
  ORDER BY preference_score DESC NULLS LAST, signals_count DESC
  LIMIT 50;
$$;


ALTER FUNCTION "public"."get_category_overview_agg"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_overview_live"("p_category_slug" "text", "p_days" integer DEFAULT 14, "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("entity_id" "uuid", "entity_name" "text", "image_url" "text", "signals_count" bigint, "unique_users" bigint, "preference_score" numeric, "depth_nota_avg" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
  v_last timestamptz;
BEGIN
  SELECT public.get_agg_last_refreshed_at(p_category_slug) INTO v_last;
  IF v_last IS NULL THEN
    v_last := to_timestamp(0);
  END IF;

  RETURN QUERY
  WITH base_rows AS (
    SELECT *
    FROM public.entity_daily_aggregates a
    WHERE a.category_slug = p_category_slug
      AND a.day >= v_from
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
  ),
  base AS (
    SELECT
      base_rows.entity_id,
      SUM(base_rows.signals_count)::bigint AS signals_count,
      SUM(base_rows.unique_users)::bigint AS unique_users,
      SUM(base_rows.opinascore_sum)::numeric AS preference_score,
      SUM(base_rows.depth_nota_n)::bigint AS depth_n,
      SUM(COALESCE(base_rows.depth_nota_avg,0) * base_rows.depth_nota_n)::numeric AS depth_sum
    FROM base_rows
    GROUP BY 1
  ),
  delta_vs_daily AS (
    SELECT
      se.created_at::date AS day,
      se.entity_id,
      COUNT(*)::bigint AS signals_count,
      COUNT(DISTINCT se.anon_id)::bigint AS unique_users,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS preference_score
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE e.category = p_category_slug
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type IN ('versus','progressive')
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1,2
  ),
  delta_vs AS (
    SELECT
      delta_vs_daily.entity_id,
      SUM(delta_vs_daily.signals_count)::bigint AS signals_count,
      SUM(delta_vs_daily.unique_users)::bigint AS unique_users,
      SUM(delta_vs_daily.preference_score)::numeric AS preference_score
    FROM delta_vs_daily
    GROUP BY 1
  ),
  delta_depth AS (
    SELECT
      se.entity_id,
      AVG(se.value_numeric)::numeric AS depth_avg,
      COUNT(*)::bigint AS depth_n
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE e.category = p_category_slug
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  combined AS (
    SELECT
      COALESCE(b.entity_id, dv.entity_id, dd.entity_id) AS entity_id,
      COALESCE(b.signals_count,0) + COALESCE(dv.signals_count,0) AS signals_count,
      COALESCE(b.unique_users,0) + COALESCE(dv.unique_users,0) AS unique_users,
      COALESCE(b.preference_score,0) + COALESCE(dv.preference_score,0) AS preference_score,
      CASE
        WHEN COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0) = 0 THEN NULL
        ELSE (
          (COALESCE(b.depth_sum,0) + COALESCE(dd.depth_avg,0) * COALESCE(dd.depth_n,0)) /
          (COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0))
        )::numeric
      END AS depth_nota_avg
    FROM base b
    FULL JOIN delta_vs dv ON dv.entity_id = b.entity_id
    FULL JOIN delta_depth dd ON dd.entity_id = COALESCE(b.entity_id, dv.entity_id)
  )
  SELECT
    c.entity_id,
    e.name AS entity_name,
    e.image_url,
    c.signals_count,
    c.unique_users,
    c.preference_score,
    c.depth_nota_avg
  FROM combined c
  JOIN public.entities e ON e.id = c.entity_id
  ORDER BY c.preference_score DESC NULLS LAST, c.signals_count DESC
  LIMIT 50;
END;
$$;


ALTER FUNCTION "public"."get_category_overview_live"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_plan"("p_api_key" "text") RETURNS TABLE("plan_name" "text", "monthly_price" numeric, "request_limit" integer, "requests_used" integer, "features" "jsonb")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT 
    sp.plan_name,
    sp.monthly_price,
    sp.request_limit,
    ac.requests_used,
    sp.features
  FROM public.api_clients ac
  JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.api_key = p_api_key;
$$;


ALTER FUNCTION "public"."get_client_plan"("p_api_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("question_key" "text", "avg_value" numeric, "total_responses" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_id) AS entity_id
  )
  SELECT
    se.context_id AS question_key,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id = r.entity_id
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY se.context_id;
$$;


ALTER FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_comparison"("p_option_a" "uuid", "p_option_b" "uuid", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("option_id" "uuid", "question_key" "text", "avg_value" numeric, "total_responses" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_a) AS a, public.resolve_entity_id(p_option_b) AS b
  )
  SELECT
    se.entity_id AS option_id,
    se.context_id AS question_key,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id IN (r.a, r.b)
  WHERE se.module_type = 'depth'
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY se.entity_id, se.context_id;
$$;


ALTER FUNCTION "public"."get_depth_comparison"("p_option_a" "uuid", "p_option_b" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result JSONB;
  v_global_avg NUMERIC := 0;
  v_segment_avg NUMERIC := 0;
  v_total_answers BIGINT := 0;
  v_segment_answers BIGINT := 0;
  v_promoters BIGINT := 0;
  v_passives BIGINT := 0;
  v_detractors BIGINT := 0;
  v_is_nps BOOLEAN := FALSE;
BEGIN
  -- Assuming depth answers are tracked. For Opina+ architecture, they are usually signals with specific option classes, 
  -- but since it's depth, it's either in user_state_logs or we compute it via signal_events linked to the insight question.
  -- Here we query `signal_events` where `option_id` acts as the numeric score if it's an NPS scale (0-10), 
  -- or we rely on a simplified aggregate if it's text. 

  -- For this MVP feedback, we will aggregate all signals that share this question context.
  -- Opina V12 uses the 'option_id' field in signal_events to store the chosen ID from InsightPack.
  -- If those IDs are numeric strings ('0', '1', ..., '10'), we can average them.

  SELECT 
    COUNT(*), 
    COALESCE(AVG(NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC), 0)
  INTO v_total_answers, v_global_avg
  FROM public.signal_events 
  WHERE source_id = p_question_id;

  -- Detection if it's NPS (0-10 options)
  SELECT 
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC >= 9) as promoters,
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC BETWEEN 7 AND 8) as passives,
    COUNT(*) FILTER (WHERE NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC <= 6) as detractors
  INTO v_promoters, v_passives, v_detractors
  FROM public.signal_events 
  WHERE source_id = p_question_id;

  IF (v_promoters + v_passives + v_detractors) > 0 THEN
      v_is_nps := TRUE;
  END IF;

  -- Segment aggregation (If filter provided, e.g. "age_bucket:25-34")
  IF p_segment_filter IS NOT NULL THEN
     -- Example of simple matching using metadata_segment JSONB column
     SELECT 
       COUNT(*), 
       COALESCE(AVG(NULLIF(regexp_replace(option_id, '[^\d.]', '', 'g'), '')::NUMERIC), 0)
     INTO v_segment_answers, v_segment_avg
     FROM public.signal_events 
     WHERE source_id = p_question_id 
     AND metadata_segment::TEXT LIKE '%' || p_segment_filter || '%';
  ELSE
     v_segment_avg := v_global_avg;
  END IF;

  v_result := jsonb_build_object(
    'global_avg', ROUND(v_global_avg, 1),
    'segment_avg', ROUND(v_segment_avg, 1),
    'total_signals', v_total_answers,
    'is_nps', v_is_nps,
    'distribution', jsonb_build_object(
      'promoters', v_promoters,
      'passives', v_passives,
      'detractors', v_detractors
    )
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text" DEFAULT 'all'::"text", "p_gender" "text" DEFAULT 'all'::"text", "p_commune" "text" DEFAULT 'all'::"text") RETURNS TABLE("question_id" "text", "average_score" numeric, "total_responses" integer, "snapshot_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at 
    FROM public.depth_aggregates
    WHERE battle_slug = p_battle_slug
      AND option_id = p_option_id
      AND age_range = COALESCE(p_age_range, 'all')
      AND gender = COALESCE(p_gender, 'all')
      AND commune = COALESCE(p_commune, 'all')
  )
  SELECT 
    da.question_id,
    da.average_score,
    da.total_responses,
    da.snapshot_at
  FROM public.depth_aggregates da
  JOIN latest_ts l ON da.snapshot_at = l.max_at
  WHERE da.battle_slug = p_battle_slug
    AND da.option_id = p_option_id
    AND da.age_range = COALESCE(p_age_range, 'all')
    AND da.gender = COALESCE(p_gender, 'all')
    AND da.commune = COALESCE(p_commune, 'all');
$$;


ALTER FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text", "p_gender" "text", "p_commune" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_trend"("p_option_id" "uuid", "p_question_key" "text", "p_bucket" "text" DEFAULT 'day'::"text", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("time_bucket" timestamp without time zone, "avg_value" numeric, "total_responses" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  WITH resolved AS (
    SELECT public.resolve_entity_id(p_option_id) AS entity_id
  )
  SELECT
    date_trunc(p_bucket, se.created_at) AS time_bucket,
    AVG(se.value_numeric) AS avg_value,
    COUNT(*) AS total_responses
  FROM public.signal_events se
  JOIN resolved r ON se.entity_id = r.entity_id
  WHERE se.module_type = 'depth'
    AND se.context_id = p_question_key
    AND se.value_numeric IS NOT NULL
    AND (p_gender IS NULL OR se.gender = p_gender)
    AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR se.region = p_region)
  GROUP BY 1
  ORDER BY 1 DESC;
$$;


ALTER FUNCTION "public"."get_depth_trend"("p_option_id" "uuid", "p_question_key" "text", "p_bucket" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_entity_rankings_latest"("p_category_slug" "text", "p_segment_id" "text" DEFAULT 'global'::"text") RETURNS TABLE("id" "uuid", "entity_id" "uuid", "category_slug" "text", "composite_index" numeric, "preference_score" numeric, "quality_score" numeric, "snapshot_date" timestamp with time zone, "segment_id" "text", "trend" "text", "entity_name" "text", "image_url" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
  v_latest timestamptz;
  v_prev timestamptz;
BEGIN
  SELECT MAX(snapshot_date) INTO v_latest
  FROM public.entity_rank_snapshots
  WHERE category_slug = p_category_slug
    AND segment_id = p_segment_id;

  SELECT MAX(snapshot_date) INTO v_prev
  FROM public.entity_rank_snapshots
  WHERE category_slug = p_category_slug
    AND segment_id = p_segment_id
    AND snapshot_date < v_latest;

  RETURN QUERY
  WITH curr AS (
    SELECT *
    FROM public.entity_rank_snapshots
    WHERE category_slug = p_category_slug
      AND segment_id = p_segment_id
      AND snapshot_date = v_latest
  ),
  prev AS (
    SELECT *
    FROM public.entity_rank_snapshots
    WHERE category_slug = p_category_slug
      AND segment_id = p_segment_id
      AND snapshot_date = v_prev
  )
  SELECT
    c.id,
    c.entity_id,
    c.category_slug,
    c.composite_index,
    c.preference_score,
    c.quality_score,
    c.snapshot_date,
    c.segment_id,
    CASE
      WHEN p.id IS NULL THEN 'stable'
      WHEN c.composite_index > p.composite_index THEN 'up'
      WHEN c.composite_index < p.composite_index THEN 'down'
      ELSE 'stable'
    END AS trend,
    e.name AS entity_name,
    e.image_url
  FROM curr c
  LEFT JOIN prev p ON p.entity_id = c.entity_id
  JOIN public.entities e ON e.id = c.entity_id
  ORDER BY c.composite_index DESC;
END;
$$;


ALTER FUNCTION "public"."get_entity_rankings_latest"("p_category_slug" "text", "p_segment_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_entity_trend_agg"("p_entity_id" "uuid", "p_days" integer DEFAULT 30, "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("day" "date", "signals_count" bigint, "unique_users" bigint, "preference_score" numeric, "depth_nota_avg" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    a.day,
    a.signals_count,
    a.unique_users,
    COALESCE(a.opinascore_sum, 0) AS preference_score,
    a.depth_nota_avg
  FROM public.entity_daily_aggregates a
  WHERE a.entity_id = p_entity_id
    AND a.day >= (now()::date - p_days)
    AND (p_gender IS NULL OR a.gender = p_gender)
    AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
    AND (p_region IS NULL OR a.region = p_region)
  ORDER BY a.day DESC;
$$;


ALTER FUNCTION "public"."get_entity_trend_agg"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_entity_trend_live"("p_entity_id" "uuid", "p_days" integer DEFAULT 30, "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("day" "date", "signals_count" bigint, "unique_users" bigint, "preference_score" numeric, "depth_nota_avg" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
  v_cat text;
  v_last timestamptz;
BEGIN
  SELECT category INTO v_cat FROM public.entities WHERE id = p_entity_id;
  SELECT public.get_agg_last_refreshed_at(v_cat) INTO v_last;

  IF v_last IS NULL THEN
    v_last := to_timestamp(0);
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      a.day,
      SUM(a.signals_count)::bigint AS signals_count,
      SUM(a.unique_users)::bigint AS unique_users,
      SUM(a.opinascore_sum)::numeric AS preference_score,
      SUM(a.depth_nota_n)::bigint AS depth_n,
      SUM(COALESCE(a.depth_nota_avg,0) * a.depth_nota_n)::numeric AS depth_sum
    FROM public.entity_daily_aggregates a
    WHERE a.entity_id = p_entity_id
      AND a.day >= v_from
      AND (p_gender IS NULL OR a.gender = p_gender)
      AND (p_age_bucket IS NULL OR a.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR a.region = p_region)
    GROUP BY 1
  ),
  delta_vs AS (
    SELECT
      se.created_at::date AS day,
      COUNT(*)::bigint AS signals_count,
      COUNT(DISTINCT se.anon_id)::bigint AS unique_users,
      SUM(COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0))::numeric AS preference_score
    FROM public.signal_events se
    WHERE se.entity_id = p_entity_id
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.module_type IN ('versus','progressive')
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  delta_depth AS (
    SELECT
      se.created_at::date AS day,
      AVG(se.value_numeric)::numeric AS depth_avg,
      COUNT(*)::bigint AS depth_n
    FROM public.signal_events se
    WHERE se.entity_id = p_entity_id
      AND se.created_at > v_last
      AND se.created_at::date >= v_from
      AND se.module_type = 'depth'
      AND se.context_id = 'nota_general'
      AND se.value_numeric IS NOT NULL
      AND (p_gender IS NULL OR se.gender = p_gender)
      AND (p_age_bucket IS NULL OR se.age_bucket = p_age_bucket)
      AND (p_region IS NULL OR se.region = p_region)
    GROUP BY 1
  ),
  c AS (
    SELECT
      COALESCE(b.day, dv.day, dd.day) AS day,
      COALESCE(b.signals_count,0) + COALESCE(dv.signals_count,0) AS signals_count,
      COALESCE(b.unique_users,0) + COALESCE(dv.unique_users,0) AS unique_users,
      COALESCE(b.preference_score,0) + COALESCE(dv.preference_score,0) AS preference_score,
      CASE
        WHEN COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0) = 0 THEN NULL
        ELSE (
          (COALESCE(b.depth_sum,0) + COALESCE(dd.depth_avg,0) * COALESCE(dd.depth_n,0)) /
          (COALESCE(b.depth_n,0) + COALESCE(dd.depth_n,0))
        )::numeric
      END AS depth_nota_avg
    FROM base b
    FULL JOIN delta_vs dv ON dv.day = b.day
    FULL JOIN delta_depth dd ON dd.day = COALESCE(b.day, dv.day)
  )
  SELECT c.day, c.signals_count, c.unique_users, c.preference_score, c.depth_nota_avg
  FROM c
  ORDER BY c.day DESC;
END;
$$;


ALTER FUNCTION "public"."get_entity_trend_live"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_kpi_activity"() RETURNS TABLE("dau" bigint, "wau" bigint, "mau" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT dau::BIGINT, wau::BIGINT, mau::BIGINT FROM public.kpi_activity;
$$;


ALTER FUNCTION "public"."get_kpi_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_report JSONB;
BEGIN

  -- Validar acceso
  SELECT id INTO v_client_id
  FROM public.api_clients
  WHERE api_key = p_api_key AND active = true;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_API_KEY';
  END IF;

  SELECT report_data
  INTO v_report
  FROM public.executive_reports
  WHERE report_type = 'benchmark'
    AND generated_for = v_client_id
  ORDER BY generated_at DESC
  LIMIT 1;

  RETURN v_report;

END;
$$;


ALTER FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_executive_report"("p_api_key" "text", "p_battle_slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_report JSONB;
BEGIN

  -- Validar acceso
  SELECT id INTO v_client_id
  FROM public.api_clients
  WHERE api_key = p_api_key AND active = true;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_API_KEY';
  END IF;

  SELECT report_data
  INTO v_report
  FROM public.executive_reports
  WHERE battle_slug = p_battle_slug
    AND generated_for = v_client_id
  ORDER BY generated_at DESC
  LIMIT 1;

  RETURN v_report;

END;
$$;


ALTER FUNCTION "public"."get_latest_executive_report"("p_api_key" "text", "p_battle_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_ranking"() RETURNS TABLE("battle_slug" "text", "option_id" "uuid", "total_weight" numeric, "rank_position" integer, "snapshot_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_label" "text", "image_url" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at FROM public.ranking_snapshots
  )
  SELECT 
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  ORDER BY rs.battle_slug, rs.rank_position ASC;
$$;


ALTER FUNCTION "public"."get_latest_ranking"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_live_platform_stats"() RETURNS TABLE("signals_24h" bigint, "trending_title" "text", "active_region" "text", "active_users" bigint, "captured_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.signal_events WHERE created_at > now() - interval '24 hours'),
    (SELECT b.title
       FROM public.battles b
       JOIN public.signal_events se ON se.battle_id = b.id
      WHERE se.created_at > now() - interval '24 hours'
      GROUP BY b.title
      ORDER BY count(*) DESC
      LIMIT 1),
    (SELECT region
       FROM public.signal_events
      WHERE region IS NOT NULL
        AND created_at > now() - interval '24 hours'
      GROUP BY region
      ORDER BY count(*) DESC
      LIMIT 1),
    (SELECT count(DISTINCT anon_id) FROM public.signal_events WHERE created_at > now() - interval '24 hours'),
    now();
END;
$$;


ALTER FUNCTION "public"."get_live_platform_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_recent_versus_signals"("p_limit" integer DEFAULT 20) RETURNS TABLE("created_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_id" "uuid", "option_label" "text", "entity_id" "uuid", "entity_name" "text", "image_url" "text", "category_slug" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    se.created_at,
    se.battle_id,
    b.title AS battle_title,
    se.option_id,
    bo.label AS option_label,
    se.entity_id,
    e.name AS entity_name,
    COALESCE(e.image_url, bo.image_url) AS image_url,
    COALESCE(e.category, c.slug) AS category_slug
  FROM public.signal_events se
  LEFT JOIN public.battles b ON b.id = se.battle_id
  LEFT JOIN public.battle_options bo ON bo.id = se.option_id
  LEFT JOIN public.entities e ON e.id = se.entity_id
  LEFT JOIN public.categories c ON c.id = b.category_id
  WHERE se.anon_id = public.get_or_create_anon_id()
    AND se.module_type IN ('versus','progressive')
  ORDER BY se.created_at DESC
  LIMIT LEAST(p_limit, 50);
$$;


ALTER FUNCTION "public"."get_my_recent_versus_signals"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_anon_id"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_anon_id text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  
  -- Try to get existing anon_id
  SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid() LIMIT 1;
  
  -- Create if it doesn't exist
  IF v_anon_id IS NULL THEN
    -- REPLACE: encode(gen_random_bytes(16), 'hex') with standard UUID cast to text
    -- This avoids relying on pgcrypto's gen_random_bytes which isn't universally available by default
    v_anon_id := replace(gen_random_uuid()::text, '-', '');
    
    INSERT INTO public.anonymous_identities (user_id, anon_id) 
    VALUES (auth.uid(), v_anon_id) 
    ON CONFLICT DO NOTHING;
    
    -- Fetch again in case of concurrent conflict where DO NOTHING applied
    IF v_anon_id IS NULL THEN 
      SELECT ai.anon_id INTO v_anon_id FROM public.anonymous_identities ai WHERE ai.user_id = auth.uid(); 
    END IF;
  END IF;
  
  RETURN v_anon_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_anon_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."platform_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."platform_alerts" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_platform_alerts"("p_limit" integer DEFAULT 10) RETURNS SETOF "public"."platform_alerts"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT * FROM public.platform_alerts
  ORDER BY is_read ASC, created_at DESC
  LIMIT p_limit;
$$;


ALTER FUNCTION "public"."get_platform_alerts"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") RETURNS TABLE("top_share" numeric, "second_share" numeric, "polarization_index" numeric, "classification" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  latest_ts TIMESTAMP;
BEGIN
  -- Obtener el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  IF latest_ts IS NULL THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'consensus'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY
  WITH distribution AS (
    SELECT
      option_id,
      total_weight,
      total_weight / NULLIF(SUM(total_weight) OVER (), 0) AS share
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND snapshot_at = latest_ts
  ),
  ranked_shares AS (
    SELECT 
      share,
      ROW_NUMBER() OVER (ORDER BY share DESC) AS rn
    FROM distribution
  ),
  top_two AS (
    SELECT
      MAX(CASE WHEN rn = 1 THEN share ELSE 0 END) as s1,
      MAX(CASE WHEN rn = 2 THEN share ELSE 0 END) as s2
    FROM ranked_shares
    WHERE rn <= 2
  )
  SELECT
    s1::NUMERIC as top_share,
    s2::NUMERIC as second_share,
    (ABS(s1 - s2) * 100)::NUMERIC AS polarization_index,
    CASE
      WHEN ABS(s1 - s2) < 0.05 THEN 'polarized'
      WHEN ABS(s1 - s2) < 0.20 THEN 'competitive'
      ELSE 'consensus'
    END::TEXT as classification
  FROM top_two;

END;
$$;


ALTER FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_ranking_with_variation"() RETURNS TABLE("battle_slug" "text", "option_id" "uuid", "total_weight" numeric, "rank_position" integer, "variation" numeric, "variation_percent" numeric, "direction" "text", "snapshot_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_label" "text", "image_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  latest_ts timestamptz;
  previous_ts timestamptz;
BEGIN
  -- Obtenemos el timestamp del snapshot más reciente
  SELECT MAX(rs.snapshot_at) INTO latest_ts FROM public.ranking_snapshots rs;

  -- Obtenemos el timestamp del snapshot anterior
  SELECT MAX(rs.snapshot_at) INTO previous_ts 
  FROM public.ranking_snapshots rs 
  WHERE rs.snapshot_at < latest_ts;

  RETURN QUERY
  WITH latest AS (
    SELECT *
    FROM public.ranking_snapshots
    WHERE snapshot_at = latest_ts
  ),
  previous AS (
    SELECT *
    FROM public.ranking_snapshots
    WHERE snapshot_at = previous_ts
  )
  SELECT
    l.battle_slug,
    l.option_id,
    l.total_weight,
    l.rank_position,
    (l.total_weight - COALESCE(p.total_weight, 0))::numeric AS variation,
    CASE
      WHEN COALESCE(p.total_weight, 0) <= 0 THEN 0
      ELSE ((l.total_weight - p.total_weight) / p.total_weight) * 100
    END::numeric AS variation_percent,
    CASE
      WHEN (l.total_weight - COALESCE(p.total_weight, 0)) > 0 THEN 'up'
      WHEN (l.total_weight - COALESCE(p.total_weight, 0)) < 0 THEN 'down'
      ELSE 'stable'
    END AS direction,
    l.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM latest l
  LEFT JOIN previous p
    ON l.battle_slug = p.battle_slug
    AND l.option_id = p.option_id
  JOIN public.battles b ON b.slug = l.battle_slug
  JOIN public.battle_options bo ON bo.id = l.option_id
  ORDER BY l.battle_slug, l.rank_position ASC;
END;
$$;


ALTER FUNCTION "public"."get_ranking_with_variation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_signal_activity"() RETURNS TABLE("signals_last_3h" bigint, "verified_signals_last_3h" bigint, "unique_users_last_3h" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    count(*),
    count(*) FILTER (WHERE user_tier IS NOT NULL AND user_tier != 'guest'),
    count(DISTINCT anon_id)
  FROM public.signal_events
  WHERE created_at > now() - interval '3 hours';
END;
$$;


ALTER FUNCTION "public"."get_recent_signal_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_retention_metrics"() RETURNS TABLE("retention_day_1" numeric, "retention_day_7" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
WITH cohort AS (
  -- Definimos el primer día de actividad por usuario
  SELECT user_id, MIN(created_at)::date AS signup_date
  FROM public.user_activity
  GROUP BY user_id
),
returns AS (
  -- Verificamos si volvieron exactamente en el día 1 o día 7
  SELECT
    c.user_id,
    MAX(CASE WHEN ua.created_at::date = c.signup_date + interval '1 day' THEN 1 ELSE 0 END) AS d1,
    MAX(CASE WHEN ua.created_at::date = c.signup_date + interval '7 days' THEN 1 ELSE 0 END) AS d7
  FROM cohort c
  JOIN public.user_activity ua ON ua.user_id = c.user_id
  GROUP BY c.user_id
)
SELECT
  COALESCE(AVG(d1), 0)::NUMERIC AS retention_day_1,
  COALESCE(AVG(d7), 0)::NUMERIC AS retention_day_7
FROM returns;
$$;


ALTER FUNCTION "public"."get_retention_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_segment_influence"("p_battle_slug" "text", "p_days_back" integer DEFAULT 7) RETURNS TABLE("age_range" "text", "gender" "text", "commune" "text", "segment_variation" numeric, "contribution_percent" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  latest_ts TIMESTAMP;
  past_ts TIMESTAMP;
BEGIN
  -- 1. Obtener el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  -- 2. Obtener el snapshot más cercano a (hace N días)
  SELECT MAX(snapshot_at)
  INTO past_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND snapshot_at <= latest_ts - (p_days_back || ' days')::interval;

  -- 3. Si no hay datos previos, no podemos calcular influencia
  IF past_ts IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH current_data AS (
    SELECT 
      rs.age_range, 
      rs.gender, 
      rs.commune,
      SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = latest_ts
    GROUP BY rs.age_range, rs.gender, rs.commune
  ),
  past_data AS (
    SELECT 
      rs.age_range, 
      rs.gender, 
      rs.commune,
      SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = past_ts
    GROUP BY rs.age_range, rs.gender, rs.commune
  ),
  variation_data AS (
    SELECT
      c.age_range,
      c.gender,
      c.commune,
      (c.score - COALESCE(p.score, 0)) AS variation
    FROM current_data c
    LEFT JOIN past_data p
      ON c.age_range = p.age_range
      AND c.gender = p.gender
      AND c.commune = p.commune
  )
  SELECT
    vd.age_range,
    vd.gender,
    vd.commune,
    vd.variation::NUMERIC,
    CASE
      WHEN SUM(ABS(vd.variation)) OVER () = 0 THEN 0
      ELSE (ABS(vd.variation) / SUM(ABS(vd.variation)) OVER ()) * 100
    END::NUMERIC
  FROM variation_data vd
  ORDER BY ABS(vd.variation) DESC
  LIMIT 10;

END;
$$;


ALTER FUNCTION "public"."get_segment_influence"("p_battle_slug" "text", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text" DEFAULT 'all'::"text", "p_gender" "text" DEFAULT 'all'::"text", "p_commune" "text" DEFAULT 'all'::"text") RETURNS TABLE("battle_slug" "text", "option_id" "uuid", "total_weight" numeric, "rank_position" integer, "snapshot_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_label" "text", "image_url" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  WITH latest_ts AS (
    SELECT MAX(snapshot_at) as max_at 
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug
      AND age_range = COALESCE(p_age_range, 'all')
      AND gender = COALESCE(p_gender, 'all')
      AND commune = COALESCE(p_commune, 'all')
  )
  SELECT
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.battle_slug = p_battle_slug
    AND rs.age_range = COALESCE(p_age_range, 'all')
    AND rs.gender = COALESCE(p_gender, 'all')
    AND rs.commune = COALESCE(p_commune, 'all')
  ORDER BY rs.rank_position ASC;
$$;


ALTER FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text", "p_gender" "text", "p_commune" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_segmented_trending"("p_age_range" "text" DEFAULT 'all'::"text", "p_gender" "text" DEFAULT 'all'::"text", "p_commune" "text" DEFAULT 'all'::"text") RETURNS TABLE("battle_slug" "text", "option_id" "uuid", "total_weight" numeric, "rank_position" integer, "snapshot_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_label" "text", "image_url" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  WITH latest_ts AS (
    SELECT rs.battle_slug, MAX(rs.snapshot_at) as max_at 
    FROM public.ranking_snapshots rs
    WHERE rs.age_range = COALESCE(p_age_range, 'all')
      AND rs.gender = COALESCE(p_gender, 'all')
      AND rs.commune = COALESCE(p_commune, 'all')
    GROUP BY rs.battle_slug
  )
  SELECT
    rs.battle_slug,
    rs.option_id,
    rs.total_weight,
    rs.rank_position,
    rs.snapshot_at,
    b.id as battle_id,
    b.title as battle_title,
    bo.label as option_label,
    bo.image_url
  FROM public.ranking_snapshots rs
  JOIN latest_ts l ON rs.snapshot_at = l.max_at AND rs.battle_slug = l.battle_slug
  JOIN public.battles b ON b.slug = rs.battle_slug
  JOIN public.battle_options bo ON bo.id = rs.option_id
  WHERE rs.age_range = COALESCE(p_age_range, 'all')
    AND rs.gender = COALESCE(p_gender, 'all')
    AND rs.commune = COALESCE(p_commune, 'all')
    AND rs.rank_position = 1
  ORDER BY rs.total_weight DESC;
$$;


ALTER FUNCTION "public"."get_segmented_trending"("p_age_range" "text", "p_gender" "text", "p_commune" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_state_benchmarks"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE v_res jsonb; v_gen text; v_age text; v_reg text;
BEGIN
  SELECT gender, age_bucket, region INTO v_gen, v_age, v_reg FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  WITH global_avg AS (
    SELECT AVG(mood_score)::numeric(10,2) as m, AVG(economic_score)::numeric(10,2) as e, AVG(job_score)::numeric(10,2) as j, AVG(happiness_score)::numeric(10,2) as h, COUNT(*)::int as n
    FROM public.user_state_logs
  ), segment_avg AS (
    SELECT AVG(mood_score)::numeric(10,2) as m, AVG(economic_score)::numeric(10,2) as e, AVG(job_score)::numeric(10,2) as j, AVG(happiness_score)::numeric(10,2) as h, COUNT(*)::int as n
    FROM public.user_state_logs WHERE gender = v_gen AND age_bucket = v_age AND region = v_reg
  )
  SELECT jsonb_build_object('country', (SELECT row_to_json(global_avg.*) FROM global_avg), 'segment', (SELECT row_to_json(segment_avg.*) FROM segment_avg), 'meta', jsonb_build_object('gender', v_gen, 'age', v_age, 'region', v_reg)) INTO v_res;
  RETURN v_res;
END;
$$;


ALTER FUNCTION "public"."get_state_benchmarks"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_system_health_metrics"() RETURNS TABLE("signal_integrity_percent" numeric, "profile_completion_percent" numeric, "last_snapshot_at" timestamp with time zone, "total_users" integer, "verified_users" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_total_users INTEGER;
    v_verified_users INTEGER;
    v_signal_integrity NUMERIC;
    v_profile_completion NUMERIC;
    v_last_snapshot TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 1. Usuarios totales vs verificados
    SELECT COUNT(*), COUNT(*) FILTER (WHERE tier != 'guest' OR email IS NOT NULL)
    INTO v_total_users, v_verified_users
    FROM public.profiles;

    -- 2. Integridad de señales (Signals de verificados vs total en las últimas 24h)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 100
            ELSE (COUNT(*) FILTER (WHERE u.tier != 'guest' OR u.email IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100
        END
    INTO v_signal_integrity
    FROM public.signal_events se
    JOIN public.profiles u ON se.user_id = u.id
    WHERE se.created_at > now() - interval '24 hours';

    -- 3. Promedio de completitud de perfil
    -- Estimación basada en campos clave: age, gender, commune
    SELECT 
        AVG(
            (CASE WHEN age_bucket IS NOT NULL AND age_bucket != '' THEN 1 ELSE 0 END +
             CASE WHEN gender IS NOT NULL AND gender != '' THEN 1 ELSE 0 END +
             CASE WHEN commune IS NOT NULL AND commune != '' THEN 1 ELSE 0 END)::NUMERIC / 3.0
        ) * 100
    INTO v_profile_completion
    FROM public.profiles;

    -- 4. Último snapshot exitoso
    SELECT MAX(snapshot_at) INTO v_last_snapshot
    FROM public.ranking_snapshots;

    RETURN QUERY SELECT 
        ROUND(COALESCE(v_signal_integrity, 0), 1),
        ROUND(COALESCE(v_profile_completion, 0), 1),
        v_last_snapshot,
        v_total_users,
        v_verified_users;
END;
$$;


ALTER FUNCTION "public"."get_system_health_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_temporal_comparison"("p_battle_slug" "text", "p_days_back" integer) RETURNS TABLE("option_id" "uuid", "current_score" numeric, "past_score" numeric, "variation" numeric, "variation_percent" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  latest_ts TIMESTAMPTZ;
  target_ts TIMESTAMPTZ;
BEGIN
  -- Obtenemos el timestamp del snapshot más reciente para esta batalla
  SELECT MAX(snapshot_at)
  INTO latest_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug;

  -- Buscamos el snapshot más cercano al periodo solicitado (hace X días)
  SELECT MAX(snapshot_at)
  INTO target_ts
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND snapshot_at <= latest_ts - (p_days_back || ' days')::interval;

  -- Si no hay snapshots históricos, intentamos tomar el más antiguo disponible
  IF target_ts IS NULL THEN
    SELECT MIN(snapshot_at)
    INTO target_ts
    FROM public.ranking_snapshots
    WHERE battle_slug = p_battle_slug;
  END IF;

  RETURN QUERY
  WITH current_data AS (
    SELECT rs.option_id, SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = latest_ts
    GROUP BY rs.option_id
  ),
  past_data AS (
    SELECT rs.option_id, SUM(rs.total_weight) AS score
    FROM public.ranking_snapshots rs
    WHERE rs.battle_slug = p_battle_slug
      AND rs.snapshot_at = target_ts
    GROUP BY rs.option_id
  )
  SELECT
    c.option_id,
    c.score::NUMERIC AS current_score,
    COALESCE(p.score, 0)::NUMERIC AS past_score,
    (c.score - COALESCE(p.score, 0))::NUMERIC AS variation,
    CASE
      WHEN COALESCE(p.score, 0) <= 0 THEN 0
      ELSE ((c.score - p.score) / p.score) * 100
    END::NUMERIC AS variation_percent
  FROM current_data c
  LEFT JOIN past_data p
    ON c.option_id = p.option_id;

END;
$$;


ALTER FUNCTION "public"."get_temporal_comparison"("p_battle_slug" "text", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_time_series"("p_battle_slug" "text", "p_option_id" "uuid") RETURNS TABLE("snapshot_at" timestamp with time zone, "total_weight" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT snapshot_at, total_weight
  FROM public.ranking_snapshots
  WHERE battle_slug = p_battle_slug
    AND option_id = p_option_id
  ORDER BY snapshot_at ASC;
$$;


ALTER FUNCTION "public"."get_time_series"("p_battle_slug" "text", "p_option_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trending_feed_grouped"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO v_result
  FROM (
    SELECT
      b.id,
      b.title,
      count(se.id) as total_votes,
      max(se.created_at) as last_vote_at
    FROM public.battles b
    JOIN public.signal_events se ON se.battle_id = b.id
    WHERE se.created_at > now() - interval '7 days'
    GROUP BY b.id, b.title
    ORDER BY total_votes DESC
    LIMIT 10
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_trending_feed_grouped"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_personal_history"("p_user_id" "uuid") RETURNS TABLE("created_at" timestamp with time zone, "value_numeric" double precision, "module_type" "text", "option_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.created_at,
        se.value_numeric::float,
        se.module_type,
        e.name as option_name
    FROM signal_events se
    JOIN entities e ON se.option_id = e.id
    WHERE se.anon_id IN (SELECT ai.anon_id FROM anonymous_identities ai WHERE ai.user_id = p_user_id)
    ORDER BY se.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_user_personal_history"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_nickname text;
BEGIN
  -- AHORA: Ya no generamos nickname desde email.
  -- Se usara NULL, obligando al usuario a elegir uno en /complete-profile
  v_nickname := NULL;

  -- 1) Crear el registro privado en public.users
  INSERT INTO public.users (user_id, role, is_identity_verified)
  VALUES (
    NEW.id,
    'user',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2) Crear el registro segmentable en public.user_profiles
  INSERT INTO public.user_profiles (
    user_id, 
    nickname, 
    profile_stage, 
    signal_weight
  )
  VALUES (
    NEW.id,
    v_nickname,
    0,
    1.0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."healthcheck_baseline"() RETURNS TABLE("check_name" "text", "ok" boolean, "detail" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 'table.signal_events', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='signal_events'
  ), 'signal_events exists';

  RETURN QUERY
  SELECT 'table.users', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'
  ), 'users exists';

  RETURN QUERY
  SELECT 'table.user_profiles', EXISTS(
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_profiles'
  ), 'user_profiles exists';

  RETURN QUERY
  SELECT 'rpc.insert_signal_event', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='insert_signal_event'
  ), 'insert_signal_event exists';

  RETURN QUERY
  SELECT 'rpc.insert_depth_answers', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='insert_depth_answers'
  ), 'insert_depth_answers exists';

  RETURN QUERY
  SELECT 'rpc.get_entity_rankings_latest', EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='get_entity_rankings_latest'
  ), 'rankings rpc exists';

  RETURN QUERY
  SELECT 'view.profiles', EXISTS(
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='profiles'
  ), 'profiles compatibility view exists';
END;
$$;


ALTER FUNCTION "public"."healthcheck_baseline"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_depth_answers"("p_option_id" "uuid", "p_answers" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_signal_id uuid := gen_random_uuid();
  
  v_is_verified boolean := false;
  v_profile_stage int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;

  v_answer record;
BEGIN
  -- 1) Determine Identity & Limits
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

  -- 2) Insert depth answers
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

  -- 3) Update engagement stats only for registered users
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_activity (user_id, action_type)
    VALUES (v_uid, 'depth_completed');

    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
    VALUES (v_uid, 1, now())
    ON CONFLICT (user_id) DO UPDATE
      SET total_signals = public.user_stats.total_signals + 1,
          last_signal_at = now();

    PERFORM public.update_trust_score(v_uid);
  END IF;
END;
$_$;


ALTER FUNCTION "public"."insert_depth_answers"("p_option_id" "uuid", "p_answers" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid", "p_attribute_id" "uuid" DEFAULT NULL::"uuid", "p_client_event_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
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

  -- Perfil obligatorio (mínimo stage >= 1)
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
  PERFORM public.raise_sanitized('SIGNAL_FAILED');
END;
$$;


ALTER FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid", "p_attribute_id" "uuid" DEFAULT NULL::"uuid", "p_client_event_id" "uuid" DEFAULT NULL::"uuid", "p_device_hash" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
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

    -- Throttle si el device está flagged como critical pero no baneado
    PERFORM 1
    FROM public.antifraud_flags f
    WHERE f.device_hash = p_device_hash
      AND f.is_active = true
      AND f.banned = false
      AND lower(f.severity) = 'critical'
    LIMIT 1;

    IF FOUND THEN
      IF (
        SELECT COUNT(*)::int
        FROM public.signal_events se
        WHERE se.device_hash = p_device_hash
          AND se.created_at > now() - interval '10 minutes'
      ) >= 30 THEN
        PERFORM public.raise_sanitized('THROTTLED');
      END IF;
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
  IF SQLERRM = 'THROTTLED' THEN
    PERFORM public.raise_sanitized('THROTTLED');
  END IF;
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


ALTER FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND COALESCE(p.role, 'user') = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_b2b_user"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT true;
$$;


ALTER FUNCTION "public"."is_b2b_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("total_signals" bigint, "weighted_total" numeric, "verified_share_pct" numeric, "avg_profile_completeness" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT
    count(*)::bigint AS total_signals,
    COALESCE(sum(signal_weight), 0)::numeric AS weighted_total,
    CASE
      WHEN count(*) = 0 THEN 0
      ELSE round((count(*) FILTER (WHERE user_tier IS NOT NULL AND user_tier != 'guest')::numeric / count(*)::numeric) * 100, 2)
    END AS verified_share_pct,
    COALESCE(round(avg(profile_completeness)::numeric, 2), 0) AS avg_profile_completeness
  FROM public.signal_events
  WHERE battle_id = p_battle_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
$$;


ALTER FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kpi_share_of_preference"("p_battle_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("option_id" "uuid", "option_label" "text", "signals_count" bigint, "weighted_signals" numeric, "share_pct" numeric)
    LANGUAGE "sql" STABLE
    AS $$
  WITH agg AS (
    SELECT se.option_id, COUNT(*) as c, SUM(se.signal_weight) as w
    FROM public.signal_events se
    WHERE se.battle_id = p_battle_id AND (p_start_date IS NULL OR se.created_at >= p_start_date) AND (p_end_date IS NULL OR se.created_at <= p_end_date)
    GROUP BY se.option_id
  ), tot AS (SELECT NULLIF(SUM(w), 0) as total FROM agg)
  SELECT bo.id, bo.label, COALESCE(agg.c, 0), COALESCE(agg.w, 0), CASE WHEN tot.total > 0 THEN ROUND((COALESCE(agg.w, 0) / tot.total) * 100, 2) ELSE 0 END
  FROM public.battle_options bo LEFT JOIN agg ON agg.option_id = bo.id CROSS JOIN tot WHERE bo.battle_id = p_battle_id ORDER BY bo.sort_order;
$$;


ALTER FUNCTION "public"."kpi_share_of_preference"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kpi_trend_velocity"("p_battle_id" "uuid", "p_bucket" "text" DEFAULT 'hour'::"text", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("time_bucket" timestamp without time zone, "option_id" "uuid", "signals_delta" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT date_trunc(p_bucket, se.created_at) as t, se.option_id, COUNT(*)
  FROM public.signal_events se WHERE se.battle_id = p_battle_id AND (p_start_date IS NULL OR se.created_at >= p_start_date) AND (p_end_date IS NULL OR se.created_at <= p_end_date)
  GROUP BY 1, 2 ORDER BY 1 DESC, 2;
$$;


ALTER FUNCTION "public"."kpi_trend_velocity"("p_battle_id" "uuid", "p_bucket" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_app_event"("p_event_name" "text", "p_severity" "text" DEFAULT 'info'::"text", "p_context" "jsonb" DEFAULT '{}'::"jsonb", "p_client_event_id" "uuid" DEFAULT NULL::"uuid", "p_app_version" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon text;
  v_sev text := lower(coalesce(p_severity,'info'));
BEGIN
  IF v_sev NOT IN ('info','warn','error') THEN
    v_sev := 'info';
  END IF;

  -- anon_id solo si existe helper
  BEGIN
    v_anon := public.get_or_create_anon_id();
  EXCEPTION WHEN OTHERS THEN
    v_anon := NULL;
  END;

  INSERT INTO public.app_events (user_id, anon_id, event_name, severity, context, client_event_id, app_version, user_agent)
  VALUES (v_uid, v_anon, left(coalesce(p_event_name,'unknown'), 80), v_sev, coalesce(p_context,'{}'::jsonb), p_client_event_id, p_app_version, p_user_agent);
END;
$$;


ALTER FUNCTION "public"."log_app_event"("p_event_name" "text", "p_severity" "text", "p_context" "jsonb", "p_client_event_id" "uuid", "p_app_version" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."lookup_battle_options_context"("p_option_ids" "uuid"[]) RETURNS TABLE("option_id" "uuid", "option_label" "text", "battle_id" "uuid", "battle_title" "text", "entity_id" "uuid", "entity_name" "text", "image_url" "text", "category_slug" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    bo.id AS option_id,
    bo.label AS option_label,
    bo.battle_id,
    b.title AS battle_title,
    bo.brand_id AS entity_id,
    e.name AS entity_name,
    COALESCE(e.image_url, bo.image_url) AS image_url,
    COALESCE(e.category, c.slug) AS category_slug
  FROM public.battle_options bo
  LEFT JOIN public.battles b ON b.id = bo.battle_id
  LEFT JOIN public.categories c ON c.id = b.category_id
  LEFT JOIN public.entities e ON e.id = bo.brand_id
  WHERE bo.id = ANY(p_option_ids);
$$;


ALTER FUNCTION "public"."lookup_battle_options_context"("p_option_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.platform_alerts
  SET is_read = true
  WHERE id = p_alert_id;
END;
$$;


ALTER FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."raise_sanitized"("p_code" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Solo códigos cortos, sin detalles internos de Postgres (SQLERRM)
  RAISE EXCEPTION '%', p_code USING ERRCODE = 'P0001';
END;
$$;


ALTER FUNCTION "public"."raise_sanitized"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_daily_aggregates"("p_days" integer DEFAULT 30) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_from date := (now()::date - (p_days::int));
BEGIN
  -- 1) Limpiar ventana (solo lo reciente)
  DELETE FROM public.entity_daily_aggregates WHERE day >= v_from;
  DELETE FROM public.category_daily_aggregates WHERE day >= v_from;

  -- 2) Entity daily aggregates (versus/progressive + depth)
  INSERT INTO public.entity_daily_aggregates (
    day, entity_id, category_slug,
    gender, age_bucket, region,
    signals_count, unique_users,
    weight_sum, opinascore_sum,
    depth_nota_avg, depth_nota_n,
    last_refreshed_at
  )
  WITH base AS (
    SELECT
      se.created_at::date AS day,
      se.entity_id,
      e.category AS category_slug,
      se.gender,
      se.age_bucket,
      se.region,

      se.anon_id,
      se.module_type,
      se.context_id,
      se.value_numeric,

      COALESCE(se.signal_weight, 1.0) AS w,
      COALESCE(se.opinascore, se.computed_weight, se.signal_weight, 1.0) AS score
    FROM public.signal_events se
    JOIN public.entities e ON e.id = se.entity_id
    WHERE se.created_at::date >= v_from
      AND se.entity_id IS NOT NULL
      AND se.module_type IN ('versus','progressive','depth')
  ),
  vs AS (
    SELECT
      day, entity_id, category_slug,
      gender, age_bucket, region,
      COUNT(*) FILTER (WHERE module_type IN ('versus','progressive'))::bigint AS signals_count,
      COUNT(DISTINCT anon_id) FILTER (WHERE module_type IN ('versus','progressive'))::bigint AS unique_users,
      SUM(w) FILTER (WHERE module_type IN ('versus','progressive'))::numeric AS weight_sum,
      SUM(score) FILTER (WHERE module_type IN ('versus','progressive'))::numeric AS opinascore_sum
    FROM base
    GROUP BY 1,2,3,4,5,6
  ),
  dn AS (
    SELECT
      day, entity_id,
      gender, age_bucket, region,
      AVG(value_numeric)::numeric AS depth_nota_avg,
      COUNT(*)::bigint AS depth_nota_n
    FROM base
    WHERE module_type = 'depth'
      AND context_id = 'nota_general'
      AND value_numeric IS NOT NULL
    GROUP BY 1,2,3,4,5
  )
  SELECT
    COALESCE(vs.day, dn.day) AS day,
    COALESCE(vs.entity_id, dn.entity_id) AS entity_id,
    vs.category_slug,
    COALESCE(vs.gender, dn.gender) AS gender,
    COALESCE(vs.age_bucket, dn.age_bucket) AS age_bucket,
    COALESCE(vs.region, dn.region) AS region,
    COALESCE(vs.signals_count, 0) AS signals_count,
    COALESCE(vs.unique_users, 0) AS unique_users,
    COALESCE(vs.weight_sum, 0) AS weight_sum,
    COALESCE(vs.opinascore_sum, 0) AS opinascore_sum,
    dn.depth_nota_avg,
    COALESCE(dn.depth_nota_n, 0) AS depth_nota_n,
    now() AS last_refreshed_at
  FROM vs
  FULL OUTER JOIN dn
    ON  vs.day = dn.day
    AND vs.entity_id = dn.entity_id
    AND (vs.gender IS NOT DISTINCT FROM dn.gender)
    AND (vs.age_bucket IS NOT DISTINCT FROM dn.age_bucket)
    AND (vs.region IS NOT DISTINCT FROM dn.region);

  -- 3) Category daily aggregates (sum de entidades)
  INSERT INTO public.category_daily_aggregates (
    day, category_slug,
    gender, age_bucket, region,
    signals_count, unique_users,
    weight_sum, opinascore_sum,
    last_refreshed_at
  )
  SELECT
    day,
    category_slug,
    gender, age_bucket, region,
    SUM(signals_count)::bigint,
    SUM(unique_users)::bigint,
    SUM(weight_sum)::numeric,
    SUM(opinascore_sum)::numeric,
    now()
  FROM public.entity_daily_aggregates
  WHERE day >= v_from
    AND category_slug IS NOT NULL
  GROUP BY 1,2,3,4,5;
END;
$$;


ALTER FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_public_rank_snapshots_3h"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_bucket timestamptz;
  v_lock boolean;
  v_module text;
  v_mode text;
BEGIN
  v_mode := public.get_analytics_mode();
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h'));
  IF v_lock IS NOT TRUE THEN
    RETURN;
  END IF;

  DELETE FROM public.public_rank_snapshots
  WHERE snapshot_bucket = v_bucket;

  FOREACH v_module IN ARRAY ARRAY['versus','progressive'] LOOP

    -- GLOBAL
    IF v_mode = 'clean' THEN
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        '{}'::jsonb,
        'global'
      FROM public.signal_events_analytics_clean se
      WHERE se.module_type = v_module
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id;
    ELSE
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        '{}'::jsonb,
        'global'
      FROM public.signal_events_analytics_all se
      WHERE se.module_type = v_module
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id;
    END IF;

    -- gender
    IF v_mode = 'clean' THEN
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('gender', up.gender),
        'gender:' || COALESCE(up.gender,'unknown')
      FROM public.signal_events_analytics_clean se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.gender;
    ELSE
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('gender', up.gender),
        'gender:' || COALESCE(up.gender,'unknown')
      FROM public.signal_events_analytics_all se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.gender;
    END IF;

    -- region
    IF v_mode = 'clean' THEN
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('region', up.region),
        'region:' || COALESCE(up.region,'unknown')
      FROM public.signal_events_analytics_clean se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.region;
    ELSE
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('region', up.region),
        'region:' || COALESCE(up.region,'unknown')
      FROM public.signal_events_analytics_all se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.region;
    END IF;

    -- gender+region
    IF v_mode = 'clean' THEN
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('gender', up.gender, 'region', up.region),
        'gender:' || COALESCE(up.gender,'unknown') || '|region:' || COALESCE(up.region,'unknown')
      FROM public.signal_events_analytics_clean se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.gender, up.region;
    ELSE
      INSERT INTO public.public_rank_snapshots (
        snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
      )
      SELECT
        v_bucket,
        v_module,
        se.battle_id,
        se.option_id,
        COALESCE(SUM(se.signal_weight), 0)::numeric,
        COUNT(*)::int,
        jsonb_build_object('gender', up.gender, 'region', up.region),
        'gender:' || COALESCE(up.gender,'unknown') || '|region:' || COALESCE(up.region,'unknown')
      FROM public.signal_events_analytics_all se
      JOIN public.user_profiles up ON up.user_id = se.user_id
      WHERE se.module_type = v_module
        AND se.user_id IS NOT NULL
        AND se.battle_id IS NOT NULL
        AND se.option_id IS NOT NULL
      GROUP BY se.battle_id, se.option_id, up.gender, up.region;
    END IF;

  END LOOP;

  PERFORM pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h'));
END;
$$;


ALTER FUNCTION "public"."refresh_public_rank_snapshots_3h"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_battle record;
  v_instance_id uuid;
  v_options jsonb;
BEGIN
  SELECT b.id, b.slug, b.title
    INTO v_battle
  FROM public.battles b
  WHERE b.slug = p_battle_slug
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Battle not found');
  END IF;

  SELECT bi.id
    INTO v_instance_id
  FROM public.battle_instances bi
  WHERE bi.battle_id = v_battle.id
  ORDER BY bi.created_at DESC
  LIMIT 1;

  SELECT jsonb_agg(
           jsonb_build_object(
             'id', bo.id,
             'label', bo.label,
             'image_url', bo.image_url,
             'sort_order', bo.sort_order
           )
           ORDER BY bo.sort_order
         )
    INTO v_options
  FROM public.battle_options bo
  WHERE bo.battle_id = v_battle.id;

  RETURN jsonb_build_object(
    'ok', true,
    'battle_id', v_battle.id,
    'battle_instance_id', v_instance_id,
    'battle_slug', v_battle.slug,
    'title', v_battle.title,
    'options', COALESCE(v_options, '[]'::jsonb)
  );
END;
$$;


ALTER FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE v_entity_id uuid;
BEGIN
  -- Si viene battle_option.id, mapear a brand_id
  SELECT bo.brand_id INTO v_entity_id
  FROM public.battle_options bo
  WHERE bo.id = p_any_id
  LIMIT 1;

  -- Si no era battle_option, asumimos que ya es entity_id
  RETURN COALESCE(v_entity_id, p_any_id);
END;
$$;


ALTER FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE v_role text;
BEGIN
  -- Autorización ajustado a user_id
  SELECT role INTO v_role FROM public.users WHERE user_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin';
  END IF;

  UPDATE public.access_gate_tokens
  SET is_active = p_active
  WHERE id = p_token_id;
END;
$$;


ALTER FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE v_role text;
BEGIN
  -- Autorización ajustado a user_id
  SELECT role INTO v_role FROM public.users WHERE user_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Solo admin';
  END IF;

  UPDATE public.access_gate_tokens
  SET expires_at = p_expires_at
  WHERE id = p_token_id;
END;
$$;


ALTER FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_nickname_once"("p_nickname" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
DECLARE
  v_uid uuid;
  v_nick text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  v_nick := trim(coalesce(p_nickname, ''));

  -- Reglas mínimas de formato:
  -- 3 a 18 chars, letras/números/_/-
  IF length(v_nick) < 3 OR length(v_nick) > 18 THEN
    RAISE EXCEPTION 'Nickname debe tener entre 3 y 18 caracteres';
  END IF;

  IF v_nick !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Nickname solo puede usar letras, números, "_" o "-"';
  END IF;

  -- Set solo si aún no está definido
  UPDATE public.user_profiles
     SET nickname = v_nick,
         updated_at = now()
   WHERE user_id = v_uid
     AND (nickname IS NULL OR trim(nickname) = '');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nickname ya definido (no editable por ahora)';
  END IF;

  -- Si choca con el índice único, Postgres lanzará error de unique violation automáticamente.
END;
$_$;


ALTER FUNCTION "public"."set_nickname_once"("p_nickname" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_user_session"("p_anon_id" "uuid" DEFAULT NULL::"uuid", "p_seconds_spent" integer DEFAULT 0, "p_is_new_session" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- Si no manda tiempo ni sesión nueva, no hacemos nada
  IF p_seconds_spent <= 0 AND NOT p_is_new_session THEN
    RETURN;
  END IF;

  -- 1) Prioridad: Si hay sesión iniciada (Auth v_uid)
  IF v_uid IS NOT NULL THEN
    UPDATE public.users
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + CASE WHEN p_is_new_session THEN 1 ELSE 0 END,
           last_active_at = now()
     WHERE id = v_uid;
    RETURN;
  END IF;

  -- 2) Secundario: Si manda un anon_id válido y no hay sesión iniciada
  IF p_anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + CASE WHEN p_is_new_session THEN 1 ELSE 0 END,
           last_active_at = now()
     WHERE id = p_anon_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_increment_interactions_signals"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Si el voto viene de un usuario anónimo:
  IF NEW.anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.anon_id;
  END IF;

  -- Si el voto viene de un usuario logueado (retrocompatibilidad):
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_increment_interactions_signals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_increment_interactions_state"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.anon_id;
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_increment_interactions_state"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trust_score"("p_user" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_spike BOOLEAN;
BEGIN
  v_spike := public.detect_signal_spike(p_user);

  IF v_spike THEN
    UPDATE public.user_stats
    SET trust_score = 0.5,
        suspicious_flag = true,
        updated_at = now()
    WHERE user_id = p_user;
  ELSE
    -- Solo restauramos si no hay spike. 
    -- Podríamos dejarlo en 0.5 permanentemente hasta revisión, 
    -- pero el prompt sugiere un toggle dinámico o reset.
    UPDATE public.user_stats
    SET trust_score = 1.0,
        suspicious_flag = false,
        updated_at = now()
    WHERE user_id = p_user AND suspicious_flag = true AND NOT v_spike;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_trust_score"("p_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_weight_on_verification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Ajustar el peso según el estado de verificación
    -- Instrucción: 2.5x para verificados, 1.0x para no verificados
    IF NEW.identity_verified = true THEN
        UPDATE public.user_stats
        SET signal_weight = 2.5,
            updated_at = now()
        WHERE user_id = NEW.id;
    ELSE
        UPDATE public.user_stats
        SET signal_weight = 1.0,
            updated_at = now()
        WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_weight_on_verification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_api_key"("p_key" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_client_id UUID;
  v_request_limit INTEGER;
  v_requests_used INTEGER;
  v_active BOOLEAN;
BEGIN
  -- Obtenemos datos del cliente y su plan
  SELECT ac.id, ac.requests_used, ac.active, sp.request_limit
  INTO v_client_id, v_requests_used, v_active, v_request_limit
  FROM public.api_clients ac
  LEFT JOIN public.subscription_plans sp ON ac.plan_id = sp.id
  WHERE ac.api_key = p_key;

  -- Validaciones de seguridad
  IF v_client_id IS NULL OR v_active = false THEN
    RAISE EXCEPTION 'INVALID_OR_INACTIVE_API_KEY';
  END IF;

  -- Si el cliente existe pero no tiene plan, usamos el límite de la tabla api_clients por retrocompatibilidad
  IF v_request_limit IS NULL THEN
    SELECT request_limit INTO v_request_limit FROM public.api_clients WHERE id = v_client_id;
  END IF;

  -- Validación de cuota
  IF v_requests_used >= v_request_limit THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED';
  END IF;

  -- Incrementar contador
  UPDATE public.api_clients
  SET requests_used = requests_used + 1
  WHERE id = v_client_id;

  RETURN v_client_id;
END;
$$;


ALTER FUNCTION "public"."validate_api_key"("p_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_invitation"("p_code" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."validate_invitation"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_ok boolean;
BEGIN
  -- Si el admin lo reactivó pasándolo a "active", permitiremos el paso.
  -- También si estaba "used" permitimos paso a features (lo consideramos válido porque ya pasó la barrera una vez).
  SELECT (status IN ('active', 'used', 'consumed')) AND (expires_at IS NULL OR expires_at > now())
    INTO v_ok
  FROM public.invitation_codes
  WHERE id = p_invite_id
  LIMIT 1;

  RETURN COALESCE(v_ok, false);
END;
$$;


ALTER FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_gate_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code_hash" "text" NOT NULL,
    "label" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone,
    "uses_count" integer DEFAULT 0 NOT NULL,
    "first_used_at" timestamp with time zone,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."access_gate_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."access_gate_tokens" IS 'Tokens de acceso para piloto cerrado. Guardar SOLO hash (sha256) del codigo, nunca el codigo en claro.';



CREATE TABLE IF NOT EXISTS "public"."algorithm_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version_name" "text" NOT NULL,
    "description" "text",
    "recency_half_life_days" integer DEFAULT 7 NOT NULL,
    "verification_multiplier" numeric DEFAULT 1.3 NOT NULL,
    "trust_multiplier_enabled" boolean DEFAULT true,
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."algorithm_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."anonymous_identities" (
    "user_id" "uuid" NOT NULL,
    "anon_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "total_interactions" bigint DEFAULT 0,
    "total_time_spent_seconds" bigint DEFAULT 0,
    "total_sessions" bigint DEFAULT 0,
    "last_active_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."anonymous_identities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."antifraud_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "device_hash" "text" NOT NULL,
    "flag_type" "text" NOT NULL,
    "severity" "text" DEFAULT 'warn'::"text" NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "banned" boolean DEFAULT false NOT NULL,
    "banned_at" timestamp with time zone,
    "banned_reason" "text"
);


ALTER TABLE "public"."antifraud_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_name" "text" NOT NULL,
    "api_key" "text" NOT NULL,
    "request_limit" integer DEFAULT 10000,
    "requests_used" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "plan_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."api_clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_usage_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "endpoint" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."api_usage_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_config" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "anon_id" "text",
    "event_name" "text" NOT NULL,
    "severity" "text" DEFAULT 'info'::"text" NOT NULL,
    "context" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "client_event_id" "uuid",
    "app_version" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."app_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battle_instances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_id" "uuid" NOT NULL,
    "version" integer DEFAULT 1,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."battle_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battle_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "brand_id" "uuid",
    "image_url" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."battle_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."battles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "emoji" "text",
    "cover_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."category_daily_aggregates" (
    "day" "date" NOT NULL,
    "category_slug" "text" NOT NULL,
    "gender" "text",
    "age_bucket" "text",
    "region" "text",
    "signals_count" bigint DEFAULT 0 NOT NULL,
    "unique_users" bigint DEFAULT 0 NOT NULL,
    "weight_sum" numeric DEFAULT 0 NOT NULL,
    "opinascore_sum" numeric DEFAULT 0 NOT NULL,
    "last_refreshed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."category_daily_aggregates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."depth_aggregates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_slug" "text" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "question_id" "text" NOT NULL,
    "average_score" numeric,
    "total_responses" integer,
    "age_range" "text",
    "gender" "text",
    "commune" "text",
    "snapshot_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."depth_aggregates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."depth_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_id" "uuid",
    "category_slug" "text",
    "question_key" "text" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "text" DEFAULT 'scale'::"text",
    "options" "jsonb" DEFAULT '[]'::"jsonb",
    "position" integer DEFAULT 0,
    "is_required" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."depth_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text"
);


ALTER TABLE "public"."entities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entity_daily_aggregates" (
    "day" "date" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "category_slug" "text",
    "gender" "text",
    "age_bucket" "text",
    "region" "text",
    "signals_count" bigint DEFAULT 0 NOT NULL,
    "unique_users" bigint DEFAULT 0 NOT NULL,
    "weight_sum" numeric DEFAULT 0 NOT NULL,
    "opinascore_sum" numeric DEFAULT 0 NOT NULL,
    "depth_nota_avg" numeric,
    "depth_nota_n" bigint DEFAULT 0 NOT NULL,
    "last_refreshed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."entity_daily_aggregates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entity_rank_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_id" "uuid",
    "category_slug" "text" NOT NULL,
    "composite_index" numeric DEFAULT 0.0,
    "preference_score" numeric DEFAULT 0.0,
    "quality_score" numeric DEFAULT 0.0,
    "snapshot_date" timestamp with time zone DEFAULT "now"(),
    "segment_id" "text" DEFAULT 'global'::"text",
    "algorithm_version" "text" DEFAULT 'V12-PRO'::"text"
);


ALTER TABLE "public"."entity_rank_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."executive_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_slug" "text",
    "report_period_days" integer,
    "generated_for" "uuid",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "report_data" "jsonb",
    "report_type" "text" DEFAULT 'battle'::"text"
);


ALTER TABLE "public"."executive_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitation_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "max_uses" integer DEFAULT 1,
    "current_uses" integer DEFAULT 0,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "issued_to_label" "text",
    "claimed_by" "uuid",
    "claimed_at" timestamp with time zone,
    "assigned_alias" "text",
    "used_by_user_id" "uuid",
    "used_at" timestamp with time zone,
    CONSTRAINT "invitation_codes_code_upper_chk" CHECK (("code" = "upper"("code"))),
    CONSTRAINT "invitation_codes_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'expired'::"text", 'disabled'::"text", 'consumed'::"text", 'revoked'::"text", 'used'::"text"])))
);


ALTER TABLE "public"."invitation_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invite_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "anon_id" "text",
    "invite_id" "uuid",
    "invite_code_entered" "text" NOT NULL,
    "result" "text" NOT NULL,
    "nickname" "text",
    "app_version" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invite_redemptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_activity" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."kpi_activity" AS
 SELECT "count"(DISTINCT
        CASE
            WHEN ("created_at" >= ("now"() - '1 day'::interval)) THEN "user_id"
            ELSE NULL::"uuid"
        END) AS "dau",
    "count"(DISTINCT
        CASE
            WHEN ("created_at" >= ("now"() - '7 days'::interval)) THEN "user_id"
            ELSE NULL::"uuid"
        END) AS "wau",
    "count"(DISTINCT
        CASE
            WHEN ("created_at" >= ("now"() - '30 days'::interval)) THEN "user_id"
            ELSE NULL::"uuid"
        END) AS "mau"
   FROM "public"."user_activity"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."kpi_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "field_changed" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profile_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
    "nickname" "text" NOT NULL,
    "gender" "text",
    "age_bucket" "text",
    "region" "text",
    "comuna" "text",
    "education" "text",
    "last_demographics_update" timestamp with time zone,
    "profile_completeness" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "birth_year" integer,
    "employment_status" "text",
    "income_range" "text",
    "education_level" "text",
    "housing_type" "text",
    "purchase_behavior" "text",
    "influence_level" "text",
    "profile_stage" integer DEFAULT 0,
    "signal_weight" numeric DEFAULT 1.0,
    CONSTRAINT "user_profiles_nickname_format" CHECK (((("length"("nickname") >= 3) AND ("length"("nickname") <= 20)) AND ("nickname" ~ '^[a-zA-Z0-9_]+$'::"text")))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "invitation_code_id" "uuid",
    "is_identity_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "total_interactions" bigint DEFAULT 0,
    "total_time_spent_seconds" bigint DEFAULT 0,
    "total_sessions" bigint DEFAULT 0,
    "last_active_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'b2b'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profiles" AS
 SELECT "up"."user_id",
    "up"."nickname",
    "up"."gender",
    "up"."age_bucket",
    "up"."region",
    "up"."comuna",
    "up"."education",
    "up"."profile_completeness",
    1.0 AS "signal_weight",
    "u"."is_identity_verified" AS "verified",
    "u"."role",
    "u"."is_identity_verified" AS "identity_verified",
    "u"."invitation_code_id",
    "up"."last_demographics_update",
    "up"."created_at",
    "up"."updated_at"
   FROM ("public"."user_profiles" "up"
     LEFT JOIN "public"."users" "u" ON (("u"."user_id" = "up"."user_id")));


ALTER VIEW "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles_legacy_20260223" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "display_name" "text",
    "age" integer,
    "gender" "text",
    "commune" "text",
    "region" "text",
    "country" "text" DEFAULT 'CL'::"text",
    "education" "text",
    "occupation" "text",
    "income" "text",
    "civil_status" "text",
    "household_size" "text",
    "interest" "text",
    "shopping_preference" "text",
    "brand_affinity" "text",
    "social_media" "text",
    "politics_interest" "text",
    "voting_frequency" "text",
    "points" integer DEFAULT 0,
    "role" "text" DEFAULT 'user'::"text",
    "tier" "text" DEFAULT 'guest'::"text",
    "profile_completeness" integer DEFAULT 0,
    "profile_completed" boolean DEFAULT false,
    "has_ci" boolean DEFAULT false,
    "health_system" "text",
    "clinical_attention_12m" boolean,
    "identity_verified" boolean DEFAULT false,
    "identity_verified_at" timestamp with time zone,
    "last_demographic_update" timestamp with time zone DEFAULT '2000-01-01 00:00:00+00'::timestamp with time zone,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'verified'::"text", 'admin'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."profiles_legacy_20260223" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_rank_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attribute_id" "uuid",
    "segment_hash" "text" NOT NULL,
    "segment_filters" "jsonb" DEFAULT '{}'::"jsonb",
    "ranking" "jsonb" NOT NULL,
    "total_signals" bigint DEFAULT 0,
    "snapshot_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "snapshot_bucket" timestamp with time zone,
    "battle_id" "uuid",
    "option_id" "uuid",
    "score" numeric DEFAULT 0,
    "signals_count" integer DEFAULT 0,
    "segment" "jsonb" DEFAULT '{}'::"jsonb",
    "module_type" "text" DEFAULT 'versus'::"text" NOT NULL
);


ALTER TABLE "public"."public_rank_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ranking_snapshots_legacy_20260223" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_slug" "text" NOT NULL,
    "option_id" "uuid",
    "total_weight" numeric(15,2) NOT NULL,
    "rank_position" integer NOT NULL,
    "snapshot_at" timestamp with time zone DEFAULT "now"(),
    "age_range" "text",
    "gender" "text",
    "commune" "text",
    "organization_id" "uuid",
    "algorithm_version_id" "uuid"
);


ALTER TABLE "public"."ranking_snapshots_legacy_20260223" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signal_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signal_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "anon_id" "text" NOT NULL,
    "user_id" "uuid",
    "entity_id" "uuid",
    "entity_type" "text",
    "module_type" "text" DEFAULT 'versus'::"text",
    "context_id" "text",
    "battle_id" "uuid",
    "battle_instance_id" "uuid",
    "option_id" "uuid",
    "session_id" "uuid",
    "attribute_id" "uuid",
    "value_text" "text",
    "value_numeric" numeric,
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "signal_weight" numeric(10,2) DEFAULT 1.0,
    "computed_weight" numeric(10,2),
    "algorithm_version" "text" DEFAULT '1.2.0'::"text",
    "influence_level_snapshot" "text",
    "user_tier" "text" DEFAULT 'guest'::"text",
    "profile_completeness" integer DEFAULT 0,
    "gender" "text",
    "age_bucket" "text",
    "region" "text",
    "country" "text" DEFAULT 'CL'::"text",
    "opinascore" numeric,
    "algorithm_version_id" "uuid",
    "commune" "text",
    "client_event_id" "uuid",
    "device_hash" "text"
);


ALTER TABLE "public"."signal_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."signal_events_analytics" AS
 SELECT "id",
    "signal_id",
    "created_at",
    "anon_id",
    "user_id",
    "entity_id",
    "entity_type",
    "module_type",
    "context_id",
    "battle_id",
    "battle_instance_id",
    "option_id",
    "session_id",
    "attribute_id",
    "value_text",
    "value_numeric",
    "meta",
    "signal_weight",
    "computed_weight",
    "algorithm_version",
    "influence_level_snapshot",
    "user_tier",
    "profile_completeness",
    "gender",
    "age_bucket",
    "region",
    "country",
    "opinascore",
    "algorithm_version_id",
    "commune",
    "client_event_id",
    "device_hash"
   FROM "public"."signal_events" "se"
  WHERE (("device_hash" IS NULL) OR (NOT (EXISTS ( SELECT 1
           FROM "public"."antifraud_flags" "f"
          WHERE (("f"."device_hash" = "se"."device_hash") AND ("f"."banned" = true) AND ("f"."is_active" = true))))));


ALTER VIEW "public"."signal_events_analytics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."signal_events_analytics_all" AS
 SELECT "id",
    "signal_id",
    "created_at",
    "anon_id",
    "user_id",
    "entity_id",
    "entity_type",
    "module_type",
    "context_id",
    "battle_id",
    "battle_instance_id",
    "option_id",
    "session_id",
    "attribute_id",
    "value_text",
    "value_numeric",
    "meta",
    "signal_weight",
    "computed_weight",
    "algorithm_version",
    "influence_level_snapshot",
    "user_tier",
    "profile_completeness",
    "gender",
    "age_bucket",
    "region",
    "country",
    "opinascore",
    "algorithm_version_id",
    "commune",
    "client_event_id",
    "device_hash"
   FROM "public"."signal_events" "se"
  WHERE (("device_hash" IS NULL) OR (NOT (EXISTS ( SELECT 1
           FROM "public"."antifraud_flags" "f"
          WHERE (("f"."device_hash" = "se"."device_hash") AND ("f"."banned" = true) AND ("f"."is_active" = true))))));


ALTER VIEW "public"."signal_events_analytics_all" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."signal_events_analytics_clean" AS
 SELECT "id",
    "signal_id",
    "created_at",
    "anon_id",
    "user_id",
    "entity_id",
    "entity_type",
    "module_type",
    "context_id",
    "battle_id",
    "battle_instance_id",
    "option_id",
    "session_id",
    "attribute_id",
    "value_text",
    "value_numeric",
    "meta",
    "signal_weight",
    "computed_weight",
    "algorithm_version",
    "influence_level_snapshot",
    "user_tier",
    "profile_completeness",
    "gender",
    "age_bucket",
    "region",
    "country",
    "opinascore",
    "algorithm_version_id",
    "commune",
    "client_event_id",
    "device_hash"
   FROM "public"."signal_events" "se"
  WHERE ((("device_hash" IS NULL) OR (NOT (EXISTS ( SELECT 1
           FROM "public"."antifraud_flags" "f"
          WHERE (("f"."device_hash" = "se"."device_hash") AND ("f"."banned" = true) AND ("f"."is_active" = true)))))) AND (("device_hash" IS NULL) OR (NOT (EXISTS ( SELECT 1
           FROM "public"."antifraud_flags" "f"
          WHERE (("f"."device_hash" = "se"."device_hash") AND ("f"."is_active" = true) AND ("f"."banned" = false) AND ("lower"("f"."severity") = 'critical'::"text") AND ("f"."flag_type" <> 'manual_ban'::"text")))))));


ALTER VIEW "public"."signal_events_analytics_clean" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signal_hourly_aggs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hour_bucket" timestamp with time zone NOT NULL,
    "battle_id" "uuid",
    "battle_instance_id" "uuid",
    "option_id" "uuid",
    "gender" "text",
    "age_bucket" "text",
    "region" "text",
    "signals_count" bigint DEFAULT 0,
    "weighted_sum" numeric DEFAULT 0
);


ALTER TABLE "public"."signal_hourly_aggs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_name" "text" NOT NULL,
    "monthly_price" numeric NOT NULL,
    "request_limit" integer NOT NULL,
    "features" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_state_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "anon_id" "text" NOT NULL,
    "mood_score" integer,
    "economic_score" integer,
    "job_score" integer,
    "happiness_score" integer,
    "gender" "text",
    "age_bucket" "text",
    "region" "text"
);


ALTER TABLE "public"."user_state_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "user_id" "uuid" NOT NULL,
    "total_signals" bigint DEFAULT 0,
    "weighted_score" numeric DEFAULT 0,
    "level" integer DEFAULT 1,
    "signal_weight" numeric DEFAULT 1.0,
    "last_signal_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "trust_score" numeric DEFAULT 1.0,
    "suspicious_flag" boolean DEFAULT false
);


ALTER TABLE "public"."user_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."volatility_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_slug" "text" NOT NULL,
    "volatility_index" numeric(15,2) NOT NULL,
    "classification" "text" NOT NULL,
    "snapshot_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."volatility_snapshots" OWNER TO "postgres";


ALTER TABLE ONLY "public"."access_gate_tokens"
    ADD CONSTRAINT "access_gate_tokens_code_hash_key" UNIQUE ("code_hash");



ALTER TABLE ONLY "public"."access_gate_tokens"
    ADD CONSTRAINT "access_gate_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."algorithm_versions"
    ADD CONSTRAINT "algorithm_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."anonymous_identities"
    ADD CONSTRAINT "anonymous_identities_anon_id_key" UNIQUE ("anon_id");



ALTER TABLE ONLY "public"."anonymous_identities"
    ADD CONSTRAINT "anonymous_identities_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."antifraud_flags"
    ADD CONSTRAINT "antifraud_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_clients"
    ADD CONSTRAINT "api_clients_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."api_clients"
    ADD CONSTRAINT "api_clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_usage_logs"
    ADD CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."app_events"
    ADD CONSTRAINT "app_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battle_instances"
    ADD CONSTRAINT "battle_instances_battle_id_version_key" UNIQUE ("battle_id", "version");



ALTER TABLE ONLY "public"."battle_instances"
    ADD CONSTRAINT "battle_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battle_options"
    ADD CONSTRAINT "battle_options_battle_id_label_key" UNIQUE ("battle_id", "label");



ALTER TABLE ONLY "public"."battle_options"
    ADD CONSTRAINT "battle_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."category_daily_aggregates"
    ADD CONSTRAINT "category_daily_aggregates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."depth_aggregates"
    ADD CONSTRAINT "depth_aggregates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."depth_definitions"
    ADD CONSTRAINT "depth_definitions_entity_id_question_key_key" UNIQUE ("entity_id", "question_key");



ALTER TABLE ONLY "public"."depth_definitions"
    ADD CONSTRAINT "depth_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."entity_daily_aggregates"
    ADD CONSTRAINT "entity_daily_aggregates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_rank_snapshots"
    ADD CONSTRAINT "entity_rank_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."executive_reports"
    ADD CONSTRAINT "executive_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_redemptions"
    ADD CONSTRAINT "invite_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("org_id", "user_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."platform_alerts"
    ADD CONSTRAINT "platform_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_history"
    ADD CONSTRAINT "profile_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_legacy_20260223"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_legacy_20260223"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."public_rank_snapshots"
    ADD CONSTRAINT "public_rank_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ranking_snapshots_legacy_20260223"
    ADD CONSTRAINT "ranking_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_hour_bucket_battle_id_option_id_gender_a_key" UNIQUE ("hour_bucket", "battle_id", "option_id", "gender", "age_bucket", "region");



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_plan_name_key" UNIQUE ("plan_name");



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_nickname_key" UNIQUE ("nickname");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_state_logs"
    ADD CONSTRAINT "user_state_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."volatility_snapshots"
    ADD CONSTRAINT "volatility_snapshots_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "antifraud_flags_device_type_uq" ON "public"."antifraud_flags" USING "btree" ("device_hash", "flag_type");



CREATE INDEX "idx_api_key" ON "public"."api_clients" USING "btree" ("api_key");



CREATE INDEX "idx_api_usage" ON "public"."api_usage_logs" USING "btree" ("client_id", "created_at" DESC);



CREATE INDEX "idx_category_daily_agg_day" ON "public"."category_daily_aggregates" USING "btree" ("day" DESC, "category_slug");



CREATE INDEX "idx_depth_aggregates" ON "public"."depth_aggregates" USING "btree" ("battle_slug", "option_id", "question_id", "snapshot_at" DESC);



CREATE INDEX "idx_depth_aggregates_org" ON "public"."depth_aggregates" USING "btree" ("organization_id");



CREATE INDEX "idx_entity_daily_agg_category_day" ON "public"."entity_daily_aggregates" USING "btree" ("category_slug", "day" DESC);



CREATE INDEX "idx_entity_daily_agg_entity_day" ON "public"."entity_daily_aggregates" USING "btree" ("entity_id", "day" DESC);



CREATE INDEX "idx_exec_reports" ON "public"."executive_reports" USING "btree" ("battle_slug", "generated_at" DESC);



CREATE INDEX "idx_invitation_code" ON "public"."invitation_codes" USING "btree" ("code");



CREATE UNIQUE INDEX "idx_invitation_codes_claimed_by_unique" ON "public"."invitation_codes" USING "btree" ("claimed_by") WHERE ("claimed_by" IS NOT NULL);



CREATE INDEX "idx_platform_alerts_unread" ON "public"."platform_alerts" USING "btree" ("is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_profile_history_user" ON "public"."profile_history" USING "btree" ("user_id");



CREATE INDEX "idx_rank_snapshot_category" ON "public"."entity_rank_snapshots" USING "btree" ("category_slug");



CREATE INDEX "idx_rank_snapshot_date" ON "public"."entity_rank_snapshots" USING "btree" ("snapshot_date");



CREATE INDEX "idx_rank_snapshot_entity" ON "public"."entity_rank_snapshots" USING "btree" ("entity_id");



CREATE INDEX "idx_ranking_snapshots_org" ON "public"."ranking_snapshots_legacy_20260223" USING "btree" ("organization_id");



CREATE INDEX "idx_signal_events_battle_option_time" ON "public"."signal_events" USING "btree" ("battle_id", "option_id", "created_at" DESC);



CREATE INDEX "idx_signal_events_created_at" ON "public"."signal_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_signal_events_depth_question" ON "public"."signal_events" USING "btree" ("entity_id", "context_id", "created_at" DESC);



CREATE INDEX "idx_signal_events_entity_module_time" ON "public"."signal_events" USING "btree" ("entity_id", "module_type", "created_at" DESC);



CREATE INDEX "idx_signal_events_module_context" ON "public"."signal_events" USING "btree" ("module_type", "context_id");



CREATE INDEX "idx_signal_events_segment" ON "public"."signal_events" USING "btree" ("gender", "age_bucket", "region");



CREATE INDEX "idx_snapshot_battle" ON "public"."ranking_snapshots_legacy_20260223" USING "btree" ("battle_slug", "snapshot_at" DESC);



CREATE INDEX "idx_snapshot_segments" ON "public"."ranking_snapshots_legacy_20260223" USING "btree" ("battle_slug", "age_range", "gender", "commune", "snapshot_at" DESC);



CREATE INDEX "idx_user_activity_action_time" ON "public"."user_activity" USING "btree" ("action_type", "created_at" DESC);



CREATE INDEX "idx_user_activity_user_time" ON "public"."user_activity" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_volatility_history" ON "public"."volatility_snapshots" USING "btree" ("battle_slug", "snapshot_at" DESC);



CREATE UNIQUE INDEX "invitation_codes_code_uq" ON "public"."invitation_codes" USING "btree" ("upper"("code"));



CREATE UNIQUE INDEX "invitation_codes_used_by_uq" ON "public"."invitation_codes" USING "btree" ("used_by_user_id") WHERE ("used_by_user_id" IS NOT NULL);



CREATE INDEX "invite_redemptions_code_time_idx" ON "public"."invite_redemptions" USING "btree" ("invite_code_entered", "created_at" DESC);



CREATE INDEX "invite_redemptions_user_time_idx" ON "public"."invite_redemptions" USING "btree" ("user_id", "created_at" DESC);



CREATE UNIQUE INDEX "public_rank_snapshots_bucket_module_battle_option_seg_uq" ON "public"."public_rank_snapshots" USING "btree" ("snapshot_bucket", "module_type", "battle_id", "option_id", COALESCE("segment_hash", 'global'::"text"));



CREATE INDEX "signal_events_anon_battle_time_idx" ON "public"."signal_events" USING "btree" ("anon_id", "battle_id", "created_at" DESC);



CREATE UNIQUE INDEX "signal_events_client_event_id_uidx" ON "public"."signal_events" USING "btree" ("client_event_id") WHERE ("client_event_id" IS NOT NULL);



CREATE INDEX "signal_events_device_time_idx" ON "public"."signal_events" USING "btree" ("device_hash", "created_at" DESC);



CREATE UNIQUE INDEX "user_profiles_nickname_unique_ci" ON "public"."user_profiles" USING "btree" ("lower"("nickname")) WHERE (("nickname" IS NOT NULL) AND ("nickname" <> ''::"text"));



CREATE OR REPLACE TRIGGER "tr_enrich_signal_event" BEFORE INSERT ON "public"."signal_events" FOR EACH ROW EXECUTE FUNCTION "public"."fn_enrich_signal_event"();



CREATE OR REPLACE TRIGGER "trg_count_signal_events" AFTER INSERT ON "public"."signal_events" FOR EACH ROW EXECUTE FUNCTION "public"."trg_increment_interactions_signals"();



CREATE OR REPLACE TRIGGER "trg_count_user_state_logs" AFTER INSERT ON "public"."user_state_logs" FOR EACH ROW EXECUTE FUNCTION "public"."trg_increment_interactions_state"();



CREATE OR REPLACE TRIGGER "trg_touch_antifraud_flags" BEFORE UPDATE ON "public"."antifraud_flags" FOR EACH ROW EXECUTE FUNCTION "public"."_touch_antifraud_flags_updated_at"();



CREATE OR REPLACE TRIGGER "trg_update_user_weight" AFTER UPDATE OF "identity_verified" ON "public"."profiles_legacy_20260223" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_weight_on_verification"();



CREATE OR REPLACE TRIGGER "trg_user_profiles_cooldown" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_demographics_cooldown"();



CREATE OR REPLACE TRIGGER "trg_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_validate_profile_update" BEFORE UPDATE ON "public"."profiles_legacy_20260223" FOR EACH ROW EXECUTE FUNCTION "public"."fn_validate_profile_update"();



ALTER TABLE ONLY "public"."anonymous_identities"
    ADD CONSTRAINT "anonymous_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_clients"
    ADD CONSTRAINT "api_clients_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."api_clients"
    ADD CONSTRAINT "api_clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."api_usage_logs"
    ADD CONSTRAINT "api_usage_logs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."api_clients"("id");



ALTER TABLE ONLY "public"."battle_instances"
    ADD CONSTRAINT "battle_instances_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."battle_options"
    ADD CONSTRAINT "battle_options_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."battle_options"
    ADD CONSTRAINT "battle_options_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."depth_aggregates"
    ADD CONSTRAINT "depth_aggregates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."depth_definitions"
    ADD CONSTRAINT "depth_definitions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_daily_aggregates"
    ADD CONSTRAINT "entity_daily_aggregates_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_rank_snapshots"
    ADD CONSTRAINT "entity_rank_snapshots_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."executive_reports"
    ADD CONSTRAINT "executive_reports_generated_for_fkey" FOREIGN KEY ("generated_for") REFERENCES "public"."api_clients"("id");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invite_redemptions"
    ADD CONSTRAINT "invite_redemptions_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invitation_codes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_history"
    ADD CONSTRAINT "profile_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_legacy_20260223"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_rank_snapshots"
    ADD CONSTRAINT "public_rank_snapshots_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_rank_snapshots"
    ADD CONSTRAINT "public_rank_snapshots_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_rank_snapshots"
    ADD CONSTRAINT "public_rank_snapshots_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."battle_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ranking_snapshots_legacy_20260223"
    ADD CONSTRAINT "ranking_snapshots_algorithm_version_id_fkey" FOREIGN KEY ("algorithm_version_id") REFERENCES "public"."algorithm_versions"("id");



ALTER TABLE ONLY "public"."ranking_snapshots_legacy_20260223"
    ADD CONSTRAINT "ranking_snapshots_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."battle_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ranking_snapshots_legacy_20260223"
    ADD CONSTRAINT "ranking_snapshots_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_algorithm_version_id_fkey" FOREIGN KEY ("algorithm_version_id") REFERENCES "public"."algorithm_versions"("id");



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_battle_instance_id_fkey" FOREIGN KEY ("battle_instance_id") REFERENCES "public"."battle_instances"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."battle_options"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_battle_instance_id_fkey" FOREIGN KEY ("battle_instance_id") REFERENCES "public"."battle_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."battle_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Access depth aggregates by org membership" ON "public"."depth_aggregates" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'admin'::"text")))) OR ("organization_id" IN ( SELECT "organization_members"."org_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Access own profile" ON "public"."profiles_legacy_20260223" USING (("auth"."uid"() = "id"));



CREATE POLICY "Access ranking snapshots by org membership" ON "public"."ranking_snapshots_legacy_20260223" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'admin'::"text")))) OR ("organization_id" IN ( SELECT "organization_members"."org_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Admins can view all activity" ON "public"."user_activity" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all api clients" ON "public"."api_clients" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all executive reports" ON "public"."executive_reports" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Algorithm versions are viewable by everyone" ON "public"."algorithm_versions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view subscription plans" ON "public"."subscription_plans" FOR SELECT USING (true);



CREATE POLICY "Read own signals" ON "public"."signal_events" FOR SELECT USING (("anon_id" = "public"."get_or_create_anon_id"()));



CREATE POLICY "Read own state" ON "public"."user_state_logs" FOR SELECT USING (("anon_id" = "public"."get_or_create_anon_id"()));



CREATE POLICY "Users can view their own api clients" ON "public"."api_clients" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own executive reports" ON "public"."executive_reports" FOR SELECT USING (("generated_for" IN ( SELECT "api_clients"."id"
   FROM "public"."api_clients"
  WHERE ("api_clients"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."access_gate_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."algorithm_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."antifraud_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."depth_aggregates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "enterprise_can_view_depth" ON "public"."depth_aggregates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = ANY (ARRAY['admin'::"text", 'enterprise'::"text"]))))));



CREATE POLICY "enterprise_can_view_snapshots" ON "public"."ranking_snapshots_legacy_20260223" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = ANY (ARRAY['admin'::"text", 'enterprise'::"text"]))))));



ALTER TABLE "public"."entity_rank_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entity_rank_snapshots_select_all" ON "public"."entity_rank_snapshots" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."executive_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitation_codes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitation_codes_no_delete" ON "public"."invitation_codes" FOR DELETE TO "authenticated", "anon" USING (false);



CREATE POLICY "invitation_codes_no_insert" ON "public"."invitation_codes" FOR INSERT TO "authenticated", "anon" WITH CHECK (false);



CREATE POLICY "invitation_codes_no_select" ON "public"."invitation_codes" FOR SELECT TO "authenticated", "anon" USING (false);



CREATE POLICY "invitation_codes_no_update" ON "public"."invitation_codes" FOR UPDATE TO "authenticated", "anon" USING (false) WITH CHECK (false);



ALTER TABLE "public"."invite_redemptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "no_select_access_gate_tokens" ON "public"."access_gate_tokens" FOR SELECT TO "authenticated", "anon" USING (false);



CREATE POLICY "no_write_access_gate_tokens" ON "public"."access_gate_tokens" TO "authenticated", "anon" USING (false) WITH CHECK (false);



CREATE POLICY "permit_public_read_snapshots" ON "public"."public_rank_snapshots" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "permit_self_insert_activity" ON "public"."user_activity" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_insert_profiles" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_select_activity" ON "public"."user_activity" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_select_profiles" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_select_user_stats" ON "public"."user_stats" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_select_users" ON "public"."users" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_update_activity" ON "public"."user_activity" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "permit_self_update_profiles" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles_legacy_20260223" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_rank_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ranking_snapshots_legacy_20260223" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."signal_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "signal_events_no_delete" ON "public"."signal_events" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "signal_events_no_insert" ON "public"."signal_events" FOR INSERT TO "authenticated" WITH CHECK (false);



CREATE POLICY "signal_events_no_update" ON "public"."signal_events" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "signal_events_select_self" ON "public"."signal_events" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_activity_no_write" ON "public"."user_activity" TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "user_activity_select_self" ON "public"."user_activity" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_insert_self" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_profiles_select_self" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_profiles_update_self" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_state_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_stats_no_write" ON "public"."user_stats" TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "user_stats_select_self" ON "public"."user_stats" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_self" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_select_self" ON "public"."users" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_update_self" ON "public"."users" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";














































































































































































GRANT ALL ON FUNCTION "public"."_touch_antifraud_flags_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."_touch_antifraud_flags_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_touch_antifraud_flags_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."activate_algorithm_version"("p_version_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."activate_algorithm_version"("p_version_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_algorithm_version"("p_version_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_invitation"("p_invite_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text", "p_expires_at" timestamp with time zone, "p_assigned_aliases" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text", "p_expires_at" timestamp with time zone, "p_assigned_aliases" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text", "p_expires_at" timestamp with time zone, "p_assigned_aliases" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_generate_invites"("p_count" integer, "p_prefix" "text", "p_expires_at" timestamp with time zone, "p_assigned_aliases" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_get_analytics_mode"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_get_analytics_mode"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_get_device_summary"("p_device_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_get_device_summary"("p_device_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_list_antifraud_flags"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_antifraud_flags"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_list_app_events"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_app_events"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_list_invite_redemptions"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_invite_redemptions"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_list_invites"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_invites"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_revoke_invite"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_revoke_invite"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_analytics_mode"("p_mode" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_analytics_mode"("p_mode" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_device_ban"("p_device_hash" "text", "p_banned" boolean, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_device_ban"("p_device_hash" "text", "p_banned" boolean, "p_reason" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_invitation_status"("p_invite_id" "uuid", "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."antifraud_auto_decay"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."antifraud_auto_decay"() TO "service_role";



GRANT ALL ON FUNCTION "public"."api_get_ranking"("p_api_key" "text", "p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."api_get_ranking"("p_api_key" "text", "p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_get_ranking"("p_api_key" "text", "p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."b2b_list_rankings"("p_module_type" "text", "p_segment_hash" "text", "p_limit" integer, "p_snapshot_bucket" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."b2b_list_rankings"("p_module_type" "text", "p_segment_hash" "text", "p_limit" integer, "p_snapshot_bucket" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."bootstrap_user_after_signup"("p_nickname" "text", "p_invitation_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bootstrap_user_after_signup"("p_nickname" "text", "p_invitation_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bootstrap_user_after_signup_v2"("p_nickname" "text", "p_invitation_code" "text", "p_app_version" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bootstrap_user_after_signup_v2"("p_nickname" "text", "p_invitation_code" "text", "p_app_version" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_profile_completeness"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_profile_completeness"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_profile_completeness"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_rank_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_rank_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_rank_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_recency_factor"("p_created_at" timestamp with time zone, "p_half_life_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_recency_factor"("p_created_at" timestamp with time zone, "p_half_life_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_recency_factor"("p_created_at" timestamp with time zone, "p_half_life_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_user_segment_comparison"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_user_segment_comparison"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_user_segment_comparison"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_guest_activity"("p_anon_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."claim_guest_activity"("p_anon_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_guest_activity"("p_anon_id" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."consume_access_gate_code"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."consume_access_gate_code"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."consume_access_gate_code"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."consume_access_gate_code"("p_code" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."consume_invitation"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."consume_invitation"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."consume_invitation"("p_code" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."consume_invitation"("p_code" "text") TO "anon";



GRANT ALL ON FUNCTION "public"."count_daily_signal_actions"("p_anon_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."count_daily_signal_actions"("p_anon_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_daily_signal_actions"("p_anon_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_my_versus_signals"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_my_versus_signals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_my_versus_signals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_antifraud_high_velocity"("p_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_antifraud_high_velocity"("p_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_antifraud_many_accounts"("p_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_antifraud_many_accounts"("p_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_early_signal"("p_battle_slug" "text", "p_hours_window" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."detect_early_signal"("p_battle_slug" "text", "p_hours_window" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_early_signal"("p_battle_slug" "text", "p_hours_window" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_signal_spike"("p_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."detect_signal_spike"("p_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_signal_spike"("p_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_demographics_cooldown"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_demographics_cooldown"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_demographics_cooldown"() TO "service_role";



GRANT ALL ON FUNCTION "public"."explain_opinascore"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."explain_opinascore"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."explain_opinascore"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_enrich_signal_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_enrich_signal_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_enrich_signal_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_ensure_entity_depth"("p_entity_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_ensure_entity_depth"("p_entity_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_ensure_entity_depth"("p_entity_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_validate_profile_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_validate_profile_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_validate_profile_update"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text", "p_label_prefix" "text", "p_expires_days" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text", "p_label_prefix" "text", "p_expires_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text", "p_label_prefix" "text", "p_expires_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_access_gate_codes"("p_count" integer, "p_prefix" "text", "p_label_prefix" "text", "p_expires_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_benchmark_report"("p_api_key" "text", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_benchmark_report"("p_api_key" "text", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_benchmark_report"("p_api_key" "text", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_depth_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_depth_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_depth_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots"("p_segment_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots"("p_segment_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots"("p_segment_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots_all"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots_all"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_entity_rank_snapshots_all"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_executive_report"("p_api_key" "text", "p_battle_slug" "text", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_executive_report"("p_api_key" "text", "p_battle_slug" "text", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_executive_report"("p_api_key" "text", "p_battle_slug" "text", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_momentum_alerts"("p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_momentum_alerts"("p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_momentum_alerts"("p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_ranking_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_ranking_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_ranking_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_segmented_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_segmented_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_segmented_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_battles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_battles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_battles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_age_bucket"("p_age" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_age_bucket"("p_age" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_age_bucket"("p_age" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_agg_last_refreshed_at"("p_category_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_agg_last_refreshed_at"("p_category_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_agg_last_refreshed_at"("p_category_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_mode"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_mode"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_b2b_dashboard_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_b2b_dashboard_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_b2b_dashboard_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_battle_momentum"("p_battle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_battle_momentum"("p_battle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_battle_momentum"("p_battle_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_battle_volatility"("p_battle_slug" "text", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_battle_volatility"("p_battle_slug" "text", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_battle_volatility"("p_battle_slug" "text", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_overview_agg"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_overview_agg"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_overview_agg"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_overview_live"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_overview_live"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_overview_live"("p_category_slug" "text", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_client_plan"("p_api_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_plan"("p_api_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_plan"("p_api_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_analytics"("p_option_id" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_comparison"("p_option_a" "uuid", "p_option_b" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_comparison"("p_option_a" "uuid", "p_option_b" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_comparison"("p_option_a" "uuid", "p_option_b" "uuid", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_trend"("p_option_id" "uuid", "p_question_key" "text", "p_bucket" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_trend"("p_option_id" "uuid", "p_question_key" "text", "p_bucket" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_trend"("p_option_id" "uuid", "p_question_key" "text", "p_bucket" "text", "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_entity_rankings_latest"("p_category_slug" "text", "p_segment_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_rankings_latest"("p_category_slug" "text", "p_segment_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_rankings_latest"("p_category_slug" "text", "p_segment_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_entity_trend_agg"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_trend_agg"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_trend_agg"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_entity_trend_live"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_trend_live"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_trend_live"("p_entity_id" "uuid", "p_days" integer, "p_gender" "text", "p_age_bucket" "text", "p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_kpi_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_kpi_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_kpi_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_executive_report"("p_api_key" "text", "p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_executive_report"("p_api_key" "text", "p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_executive_report"("p_api_key" "text", "p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_ranking"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_ranking"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_ranking"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_live_platform_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_live_platform_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_live_platform_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_recent_versus_signals"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_recent_versus_signals"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_recent_versus_signals"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_anon_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_anon_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_anon_id"() TO "service_role";



GRANT ALL ON TABLE "public"."platform_alerts" TO "anon";
GRANT ALL ON TABLE "public"."platform_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_alerts" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_platform_alerts"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_platform_alerts"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_platform_alerts"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ranking_with_variation"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_ranking_with_variation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ranking_with_variation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recent_signal_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_signal_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_signal_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_retention_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_retention_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_retention_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_segment_influence"("p_battle_slug" "text", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_segment_influence"("p_battle_slug" "text", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_segment_influence"("p_battle_slug" "text", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_segmented_trending"("p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_segmented_trending"("p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_segmented_trending"("p_age_range" "text", "p_gender" "text", "p_commune" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_state_benchmarks"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_state_benchmarks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_state_benchmarks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_system_health_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_system_health_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_system_health_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_temporal_comparison"("p_battle_slug" "text", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_temporal_comparison"("p_battle_slug" "text", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_temporal_comparison"("p_battle_slug" "text", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_time_series"("p_battle_slug" "text", "p_option_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_time_series"("p_battle_slug" "text", "p_option_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_time_series"("p_battle_slug" "text", "p_option_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trending_feed_grouped"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_trending_feed_grouped"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trending_feed_grouped"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_personal_history"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_personal_history"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_personal_history"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."healthcheck_baseline"() TO "anon";
GRANT ALL ON FUNCTION "public"."healthcheck_baseline"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."healthcheck_baseline"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_depth_answers"("p_option_id" "uuid", "p_answers" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_depth_answers"("p_option_id" "uuid", "p_answers" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_signal_event"("p_battle_id" "uuid", "p_option_id" "uuid", "p_session_id" "uuid", "p_attribute_id" "uuid", "p_client_event_id" "uuid", "p_device_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_b2b_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_b2b_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."kpi_share_of_preference"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."kpi_share_of_preference"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."kpi_share_of_preference"("p_battle_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."kpi_trend_velocity"("p_battle_id" "uuid", "p_bucket" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."kpi_trend_velocity"("p_battle_id" "uuid", "p_bucket" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."kpi_trend_velocity"("p_battle_id" "uuid", "p_bucket" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."log_app_event"("p_event_name" "text", "p_severity" "text", "p_context" "jsonb", "p_client_event_id" "uuid", "p_app_version" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_app_event"("p_event_name" "text", "p_severity" "text", "p_context" "jsonb", "p_client_event_id" "uuid", "p_app_version" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lookup_battle_options_context"("p_option_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."lookup_battle_options_context"("p_option_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."lookup_battle_options_context"("p_option_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_3h"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_3h"() TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_access_gate_token_active"("p_token_id" "uuid", "p_active" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_access_gate_token_expiry"("p_token_id" "uuid", "p_expires_at" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_nickname_once"("p_nickname" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_nickname_once"("p_nickname" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_nickname_once"("p_nickname" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_nickname_once"("p_nickname" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_increment_interactions_signals"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_increment_interactions_signals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_increment_interactions_signals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_increment_interactions_state"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_increment_interactions_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_increment_interactions_state"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_trust_score"("p_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_trust_score"("p_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_trust_score"("p_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_weight_on_verification"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_weight_on_verification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_weight_on_verification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_invitation"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_invitation"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_invitation"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_invitation"("p_code" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_invite_token"("p_invite_id" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."access_gate_tokens" TO "anon";
GRANT ALL ON TABLE "public"."access_gate_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."access_gate_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."algorithm_versions" TO "anon";
GRANT ALL ON TABLE "public"."algorithm_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."algorithm_versions" TO "service_role";



GRANT ALL ON TABLE "public"."anonymous_identities" TO "anon";
GRANT ALL ON TABLE "public"."anonymous_identities" TO "authenticated";
GRANT ALL ON TABLE "public"."anonymous_identities" TO "service_role";



GRANT ALL ON TABLE "public"."antifraud_flags" TO "service_role";



GRANT ALL ON TABLE "public"."api_clients" TO "anon";
GRANT ALL ON TABLE "public"."api_clients" TO "authenticated";
GRANT ALL ON TABLE "public"."api_clients" TO "service_role";



GRANT ALL ON TABLE "public"."api_usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."api_usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."api_usage_logs" TO "service_role";



GRANT ALL ON TABLE "public"."app_config" TO "service_role";



GRANT ALL ON TABLE "public"."app_events" TO "service_role";



GRANT ALL ON TABLE "public"."battle_instances" TO "anon";
GRANT ALL ON TABLE "public"."battle_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."battle_instances" TO "service_role";



GRANT ALL ON TABLE "public"."battle_options" TO "anon";
GRANT ALL ON TABLE "public"."battle_options" TO "authenticated";
GRANT ALL ON TABLE "public"."battle_options" TO "service_role";



GRANT ALL ON TABLE "public"."battles" TO "anon";
GRANT ALL ON TABLE "public"."battles" TO "authenticated";
GRANT ALL ON TABLE "public"."battles" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."category_daily_aggregates" TO "anon";
GRANT ALL ON TABLE "public"."category_daily_aggregates" TO "authenticated";
GRANT ALL ON TABLE "public"."category_daily_aggregates" TO "service_role";



GRANT ALL ON TABLE "public"."depth_aggregates" TO "anon";
GRANT ALL ON TABLE "public"."depth_aggregates" TO "authenticated";
GRANT ALL ON TABLE "public"."depth_aggregates" TO "service_role";



GRANT ALL ON TABLE "public"."depth_definitions" TO "anon";
GRANT ALL ON TABLE "public"."depth_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."depth_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."entities" TO "anon";
GRANT ALL ON TABLE "public"."entities" TO "authenticated";
GRANT ALL ON TABLE "public"."entities" TO "service_role";



GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "anon";
GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "service_role";



GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."executive_reports" TO "anon";
GRANT ALL ON TABLE "public"."executive_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."executive_reports" TO "service_role";



GRANT ALL ON TABLE "public"."invitation_codes" TO "service_role";



GRANT ALL ON TABLE "public"."invite_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."user_activity" TO "authenticated";



GRANT ALL ON TABLE "public"."kpi_activity" TO "anon";
GRANT ALL ON TABLE "public"."kpi_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."kpi_activity" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."profile_history" TO "anon";
GRANT ALL ON TABLE "public"."profile_history" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_history" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_profiles" TO "supabase_auth_admin";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."user_profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."users" TO "supabase_auth_admin";
GRANT SELECT ON TABLE "public"."users" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles_legacy_20260223" TO "anon";
GRANT ALL ON TABLE "public"."profiles_legacy_20260223" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_legacy_20260223" TO "service_role";



GRANT ALL ON TABLE "public"."public_rank_snapshots" TO "service_role";
GRANT SELECT ON TABLE "public"."public_rank_snapshots" TO "anon";
GRANT SELECT ON TABLE "public"."public_rank_snapshots" TO "authenticated";



GRANT ALL ON TABLE "public"."ranking_snapshots_legacy_20260223" TO "anon";
GRANT ALL ON TABLE "public"."ranking_snapshots_legacy_20260223" TO "authenticated";
GRANT ALL ON TABLE "public"."ranking_snapshots_legacy_20260223" TO "service_role";



GRANT ALL ON TABLE "public"."signal_events" TO "service_role";



GRANT ALL ON TABLE "public"."signal_events_analytics" TO "anon";
GRANT ALL ON TABLE "public"."signal_events_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_events_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."signal_events_analytics_all" TO "anon";
GRANT ALL ON TABLE "public"."signal_events_analytics_all" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_events_analytics_all" TO "service_role";



GRANT ALL ON TABLE "public"."signal_events_analytics_clean" TO "anon";
GRANT ALL ON TABLE "public"."signal_events_analytics_clean" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_events_analytics_clean" TO "service_role";



GRANT ALL ON TABLE "public"."signal_hourly_aggs" TO "anon";
GRANT ALL ON TABLE "public"."signal_hourly_aggs" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_hourly_aggs" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."user_state_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_state_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_state_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_stats" TO "service_role";
GRANT SELECT ON TABLE "public"."user_stats" TO "authenticated";



GRANT ALL ON TABLE "public"."volatility_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."volatility_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."volatility_snapshots" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































