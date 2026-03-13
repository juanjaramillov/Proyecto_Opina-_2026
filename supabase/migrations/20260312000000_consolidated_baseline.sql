


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






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."admin_list_invites"("p_limit" integer DEFAULT 200, "p_status_filter" "text" DEFAULT 'all'::"text", "p_search_term" "text" DEFAULT ''::"text") RETURNS TABLE("id" "uuid", "code" "text", "assigned_alias" "text", "status" "text", "expires_at" timestamp with time zone, "used_at" timestamp with time zone, "used_by_user_id" "uuid", "used_by_nickname" "text", "created_at" timestamp with time zone, "total_interactions" bigint, "total_time_spent_seconds" bigint, "total_sessions" bigint, "last_active_at" timestamp with time zone, "whatsapp_phone" "text", "whatsapp_status" "text", "whatsapp_sent_at" timestamp with time zone, "whatsapp_error" "text", "whatsapp_message_id" "text", "whatsapp_last_sent_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH filtered_invites AS (
    SELECT ic.*
    FROM public.invitation_codes ic
    WHERE 
      -- Búsqueda por término (código, alias o teléfono)
      (p_search_term = '' 
        OR ic.code ILIKE '%' || p_search_term || '%' 
        OR COALESCE(ic.assigned_alias, '') ILIKE '%' || p_search_term || '%'
        OR COALESCE(ic.whatsapp_phone, '') ILIKE '%' || p_search_term || '%'
      )
  ),
  base_data AS (
    SELECT 
      fi.id, fi.code, fi.assigned_alias, fi.status, fi.expires_at, fi.used_at, fi.used_by_user_id,
      fi.created_at,
      fi.whatsapp_phone, fi.whatsapp_status, fi.whatsapp_sent_at, fi.whatsapp_error, fi.whatsapp_message_id, fi.whatsapp_last_sent_at,
      up.nickname as used_by_nickname,
      u.last_active_at,
      COALESCE(dm.interactions, 0)::bigint as total_interactions,
      COALESCE(dm.time_spent_seconds, 0)::bigint as total_time_spent_seconds,
      COALESCE(dm.sessions, 0)::bigint as total_sessions
    FROM filtered_invites fi
    LEFT JOIN public.users u ON fi.used_by_user_id = u.user_id
    LEFT JOIN public.user_profiles up ON fi.used_by_user_id = up.user_id
    LEFT JOIN (
        SELECT 
          user_id,
          SUM(interactions) as interactions,
          SUM(time_spent_seconds) as time_spent_seconds,
          SUM(sessions) as sessions
        FROM public.user_daily_metrics
        GROUP BY user_id
    ) dm ON fi.used_by_user_id = dm.user_id
  )
  SELECT bd.id, bd.code, bd.assigned_alias, bd.status, bd.expires_at, bd.used_at, bd.used_by_user_id, bd.used_by_nickname, bd.created_at,
         bd.total_interactions, bd.total_time_spent_seconds, bd.total_sessions, bd.last_active_at,
         bd.whatsapp_phone, bd.whatsapp_status, bd.whatsapp_sent_at, bd.whatsapp_error, bd.whatsapp_message_id, bd.whatsapp_last_sent_at
  FROM base_data bd
  WHERE
    (p_status_filter = 'all')
    OR (p_status_filter = 'pending' AND bd.status = 'active' AND bd.used_at IS NULL)
    OR (p_status_filter = 'in_use' AND bd.status = 'used' AND (bd.last_active_at IS NULL OR bd.last_active_at >= now() - interval '3 days') )
    OR (p_status_filter = 'abandoned' AND bd.status = 'used' AND bd.last_active_at < now() - interval '3 days')
    OR (p_status_filter = 'revoked' AND bd.status != 'active' AND bd.status != 'used')
  ORDER BY bd.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

END;
$$;


ALTER FUNCTION "public"."admin_list_invites"("p_limit" integer, "p_status_filter" "text", "p_search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_modules_demand_segmented"("p_range_days" integer, "p_segment_dim" "text") RETURNS TABLE("module_slug" "text", "segment_value" "text", "views" bigint, "clicks" bigint, "ctr" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Seguridad: Solo administradores
  IF public.is_admin_user() IS NOT TRUE THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  RETURN QUERY
  WITH event_data AS (
    SELECT 
      (meta->>'module_slug')::text as m_slug,
      event_type,
      CASE 
        WHEN p_segment_dim = 'comuna' THEN up.comuna
        WHEN p_segment_dim = 'gender' THEN up.gender
        WHEN p_segment_dim = 'age_range' THEN up.age_range
        ELSE 'Desconocido'
      END as s_value
    FROM public.signal_events se
    INNER JOIN public.user_profiles up ON se.user_id = up.user_id
    WHERE se.created_at >= (now() - (p_range_days || ' days')::interval)
      AND se.event_type IN ('module_preview_viewed', 'module_interest_clicked')
      AND se.meta->>'source' = 'coming_soon'
  ),
  aggregated AS (
    SELECT 
      m_slug,
      s_value,
      count(*) FILTER (WHERE event_type = 'module_preview_viewed') as views_count,
      count(*) FILTER (WHERE event_type = 'module_interest_clicked') as clicks_count
    FROM event_data
    GROUP BY m_slug, s_value
  )
  SELECT 
    m_slug as module_slug,
    COALESCE(s_value, 'No especificado') as segment_value,
    views_count::bigint as views,
    clicks_count::bigint as clicks,
    ROUND(
      CASE 
        WHEN views_count > 0 THEN (clicks_count::numeric / views_count::numeric) * 100
        ELSE 0
      END, 
      2
    ) as ctr
  FROM aggregated
  WHERE m_slug IS NOT NULL
  ORDER BY m_slug ASC, clicks_count DESC;
END;
$$;


ALTER FUNCTION "public"."admin_modules_demand_segmented"("p_range_days" integer, "p_segment_dim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_modules_demand_summary"("p_range_days" integer) RETURNS TABLE("module_slug" "text", "preview_type" "text", "views" bigint, "clicks" bigint, "ctr" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    -- Security check
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    RETURN QUERY
    WITH event_counts AS (
        SELECT 
            meta->>'module_slug' as m_slug,
            meta->>'previewType' as p_type,
            COUNT(*) FILTER (WHERE event_type = 'module_preview_viewed') as v_count,
            COUNT(*) FILTER (WHERE event_type = 'module_interest_clicked') as c_count
        FROM public.signal_events
        WHERE created_at >= now() - (p_range_days || ' days')::interval
          AND event_type IN ('module_preview_viewed', 'module_interest_clicked')
          AND meta->>'source' = 'coming_soon'
        GROUP BY 1, 2
    )
    SELECT 
        m_slug,
        p_type,
        v_count,
        c_count,
        ROUND((c_count::numeric / NULLIF(v_count, 0)::numeric) * 100, 2) as calculated_ctr
    FROM event_counts
    ORDER BY c_count DESC, v_count DESC;
END;
$$;


ALTER FUNCTION "public"."admin_modules_demand_summary"("p_range_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_modules_top_filters"("p_range_days" integer) RETURNS TABLE("module_slug" "text", "filter_key" "text", "filter_value" "text", "usage_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    -- Security check
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    RETURN QUERY
    SELECT 
        meta->>'module_slug' as m_slug,
        meta->>'filter' as f_key,
        meta->>'value' as f_value,
        COUNT(*) as u_count
    FROM public.signal_events
    WHERE created_at >= now() - (p_range_days || ' days')::interval
      AND event_type = 'module_preview_filter_used'
      AND meta->>'source' = 'coming_soon'
      AND meta->>'filter' IS NOT NULL
    GROUP BY 1, 2, 3
    ORDER BY u_count DESC
    LIMIT 100;
END;
$$;


ALTER FUNCTION "public"."admin_modules_top_filters"("p_range_days" integer) OWNER TO "postgres";


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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    -- Obtener segmentación y anon_ids del usuario desde user_profiles
    SELECT gender, age_bucket, comuna INTO v_gender, v_age_bucket, v_commune
    FROM user_profiles WHERE user_id = p_user_id;

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
            p.comuna as commune
        FROM signal_events se
        LEFT JOIN anonymous_identities ai ON se.anon_id = ai.anon_id
        LEFT JOIN user_profiles p ON ai.user_id = p.user_id
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."fn_process_elo_on_signal"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_winner_id uuid;
  v_loser_id uuid;
  v_winner_elo numeric;
  v_loser_elo numeric;
  v_k_factor numeric := 32.0;
  v_expected_win numeric;
  v_expected_loss numeric;
BEGIN
  -- Solo nos importan los votos de tipo 'versus'
  IF NEW.module_type != 'versus' THEN
    RETURN NEW;
  END IF;

  -- El ganador es la opcion elegida. Necesitamos sacar su brand_id
  SELECT brand_id INTO v_winner_id
  FROM public.battle_options 
  WHERE id = NEW.option_id AND battle_id = NEW.battle_id;

  IF v_winner_id IS NULL THEN RETURN NEW; END IF;

  -- El perdedor es la OTRA opcion en la misma batalla
  SELECT brand_id INTO v_loser_id
  FROM public.battle_options 
  WHERE battle_id = NEW.battle_id AND id != NEW.option_id
  LIMIT 1;

  IF v_loser_id IS NULL THEN RETURN NEW; END IF;

  -- Bloquear ambas filas para evitar Race Conditions (High Concurrency)
  SELECT elo_score INTO v_winner_elo FROM public.entities WHERE id = v_winner_id FOR UPDATE;
  SELECT elo_score INTO v_loser_elo FROM public.entities WHERE id = v_loser_id FOR UPDATE;

  IF v_winner_elo IS NULL OR v_loser_elo IS NULL THEN RETURN NEW; END IF;

  -- Calcular Expected Scores
  v_expected_win := 1.0 / (1.0 + power(10.0, (v_loser_elo - v_winner_elo) / 400.0));
  v_expected_loss := 1.0 / (1.0 + power(10.0, (v_winner_elo - v_loser_elo) / 400.0));

  -- Actualizar ELOs
  UPDATE public.entities 
  SET 
    elo_score = v_winner_elo + v_k_factor * (1.0 - v_expected_win),
    battles_played = battles_played + 1,
    battles_won = battles_won + 1
  WHERE id = v_winner_id;

  UPDATE public.entities 
  SET 
    elo_score = v_loser_elo + v_k_factor * (0.0 - v_expected_loss),
    battles_played = battles_played + 1
  WHERE id = v_loser_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_process_elo_on_signal"() OWNER TO "postgres";


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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
                    'brand_domain', bo.brand_domain,
                    'category', e.category
                ) ORDER BY bo.sort_order
            )
            FROM public.battle_options bo 
            LEFT JOIN public.entities e ON bo.brand_id = e.id
            WHERE bo.battle_id = b.id
        ) AS options
    FROM public.battles b
    JOIN public.categories c ON b.category_id = c.id
    WHERE b.status = 'active'
    AND EXISTS (
        SELECT 1 
        FROM public.battle_options bo2 
        WHERE bo2.battle_id = b.id 
        HAVING count(bo2.id) >= 2
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM public.battle_options bo
        LEFT JOIN public.depth_definitions dd ON bo.brand_id = dd.entity_id
        WHERE bo.battle_id = b.id
        GROUP BY bo.id
        HAVING count(dd.id) < 10
    );
END;
$$;


ALTER FUNCTION "public"."get_active_battles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_advanced_results"("p_category_slug" "text", "p_gender" "text" DEFAULT NULL::"text", "p_age_bucket" "text" DEFAULT NULL::"text", "p_region" "text" DEFAULT NULL::"text") RETURNS TABLE("entity_id" "uuid", "entity_name" "text", "preference_rate" numeric, "avg_quality" numeric, "total_signals" bigint, "gap_score" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."get_depth_distribution_values"("p_option_id" "uuid", "p_context_id" "text" DEFAULT 'nota_general'::"text") RETURNS TABLE("value_numeric" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select se.value_numeric
  from public.signal_events se
  where se.module_type = 'depth'
    and se.option_id = p_option_id
    and se.context_id = p_context_id
    and se.value_numeric is not null;
$$;


ALTER FUNCTION "public"."get_depth_distribution_values"("p_option_id" "uuid", "p_context_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."get_depth_insights"("p_entity_id" "uuid") RETURNS TABLE("question_key" "text", "question_type" "text", "question_text" "text", "q_position" integer, "total_answers" bigint, "avg_score" numeric, "distribution" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    WITH options_list AS (
        SELECT id FROM public.battle_options WHERE brand_id = p_entity_id
    ),
    depths AS (
        SELECT d.question_key, d.question_text, d.question_type, d.position
        FROM public.depth_definitions d
        WHERE d.entity_id = p_entity_id
    ),
    raw_signals AS (
        SELECT s.context_id as q_key, s.context_value
        FROM public.signal_events s
        JOIN options_list o ON s.option_id = o.id
        WHERE s.signal_type = 'depth'
          AND s.context_id IS NOT NULL
          AND s.context_value IS NOT NULL
          AND s.context_value NOT IN ('ignore', 'skip', '')
    )
    SELECT 
        d.question_key,
        d.question_type,
        d.question_text,
        d.position AS q_position,
        COUNT(rs.context_value)::bigint AS total_answers,
        CASE 
            WHEN d.question_type LIKE 'scale%' THEN 
                COALESCE(AVG(NULLIF(regexp_replace(rs.context_value, '[A-Za-z]', '', 'g'), '')::numeric), 0)
            ELSE 0 
        END AS avg_score,
        jsonb_object_agg(v.val, v.ct) AS distribution
    FROM depths d
    LEFT JOIN raw_signals rs ON rs.q_key = d.question_key
    LEFT JOIN (
        SELECT context_id, context_value AS val, COUNT(*) AS ct
        FROM raw_signals
        GROUP BY context_id, context_value
    ) v ON v.context_id = d.question_key
    GROUP BY d.question_key, d.question_type, d.question_text, d.position
    ORDER BY d.position ASC;
END;
$$;


ALTER FUNCTION "public"."get_depth_insights"("p_entity_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_depth_insights"("p_battle_slug" "text", "p_option_id" "uuid", "p_age_range" "text" DEFAULT 'all'::"text", "p_gender" "text" DEFAULT 'all'::"text", "p_commune" "text" DEFAULT 'all'::"text") RETURNS TABLE("question_id" "text", "average_score" numeric, "total_responses" integer, "snapshot_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."get_hub_live_stats_24h"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  WITH windowed AS (
    SELECT *
    FROM public.signal_events
    WHERE created_at >= now() - interval '24 hours'
  ),
  active_users AS (
    SELECT count(DISTINCT anon_id) AS n
    FROM windowed
    WHERE anon_id IS NOT NULL
  ),
  signals AS (
    SELECT count(*) AS n
    FROM windowed
    WHERE coalesce(module_type, '') <> 'depth'
  ),
  depth AS (
    SELECT count(*) AS n
    FROM windowed
    WHERE coalesce(module_type, '') = 'depth'
  ),
  battles AS (
    SELECT count(*) AS n
    FROM public.battles
    WHERE status = 'active'
  ),
  entities_elo AS (
    SELECT count(*) AS n
    FROM public.entities
    WHERE elo_score IS NOT NULL AND type = 'brand'
  )
  SELECT jsonb_build_object(
    'active_users_24h', (SELECT n FROM active_users),
    'signals_24h', (SELECT n FROM signals),
    'depth_answers_24h', (SELECT n FROM depth),
    'active_battles', (SELECT n FROM battles),
    'entities_elo', (SELECT n FROM entities_elo)
  );
$$;


ALTER FUNCTION "public"."get_hub_live_stats_24h"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_hub_signal_timeseries_24h"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
  WITH hours AS (
    SELECT generate_series(
      date_trunc('hour', now()) - interval '23 hours',
      date_trunc('hour', now()),
      interval '1 hour'
    ) AS bucket_start
  ),
  agg AS (
    SELECT
      date_trunc('hour', se.created_at) AS bucket_start,
      count(*) FILTER (WHERE coalesce(se.module_type, '') <> 'depth') AS signals,
      count(*) FILTER (WHERE se.module_type = 'depth') AS depth
    FROM public.signal_events se
    WHERE se.created_at >= now() - interval '24 hours'
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'bucket_start', h.bucket_start,
      'label', to_char(h.bucket_start, 'HH24'),
      'signals', coalesce(a.signals, 0),
      'depth', coalesce(a.depth, 0)
    )
    ORDER BY h.bucket_start
  )
  FROM hours h
  LEFT JOIN agg a USING (bucket_start);
$$;


ALTER FUNCTION "public"."get_hub_signal_timeseries_24h"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_hub_top_now_24h"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
  WITH windowed AS (
    SELECT
      se.battle_id,
      count(*) AS signals_24h
    FROM public.signal_events se
    WHERE se.created_at >= now() - interval '24 hours'
      AND se.battle_id IS NOT NULL
      AND coalesce(se.module_type, '') <> 'depth'
    GROUP BY se.battle_id
  ),
  ranked AS (
    SELECT
      b.id,
      b.slug,
      b.title,
      b.status,
      w.signals_24h,
      CASE
        WHEN b.slug LIKE 'versus-%' THEN 'versus'
        WHEN b.slug LIKE 'tournament-%' THEN 'tournament'
        ELSE 'other'
      END AS kind
    FROM windowed w
    JOIN public.battles b ON b.id::text = w.battle_id::text
    WHERE b.status = 'active'
  ),
  top_versus AS (
    SELECT slug, title, signals_24h
    FROM ranked
    WHERE kind = 'versus'
    ORDER BY signals_24h DESC
    LIMIT 1
  ),
  top_tournament AS (
    SELECT slug, title, signals_24h
    FROM ranked
    WHERE kind = 'tournament'
    ORDER BY signals_24h DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'top_versus', COALESCE((SELECT to_jsonb(top_versus) FROM top_versus), NULL),
    'top_tournament', COALESCE((SELECT to_jsonb(top_tournament) FROM top_tournament), NULL)
  );
$$;


ALTER FUNCTION "public"."get_hub_top_now_24h"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_kpi_activity"() RETURNS TABLE("dau" bigint, "wau" bigint, "mau" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
  SELECT dau::BIGINT, wau::BIGINT, mau::BIGINT FROM public.kpi_activity;
$$;


ALTER FUNCTION "public"."get_kpi_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_benchmark_report"("p_api_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."get_my_activity_history"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "text", "created_at" timestamp with time zone, "module_type" "text", "option_id" "uuid", "battle_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  with latest as (
    select distinct on (signal_id)
      signal_id::text as id,
      created_at,
      module_type,
      option_id,
      battle_id
    from public.signal_events
    where user_id = auth.uid()
    order by signal_id, created_at desc
  )
  select *
  from latest
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;


ALTER FUNCTION "public"."get_my_activity_history"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_participation_summary"() RETURNS TABLE("versus_count" integer, "progressive_count" integer, "depth_count" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    count(distinct signal_id) filter (where module_type = 'versus')::int      as versus_count,
    count(distinct signal_id) filter (where module_type = 'progressive')::int as progressive_count,
    count(distinct signal_id) filter (where module_type = 'depth')::int       as depth_count
  from public.signal_events
  where user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_participation_summary"() OWNER TO "postgres";


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
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
  SELECT * FROM public.platform_alerts
  ORDER BY is_read ASC, created_at DESC
  LIMIT p_limit;
$$;


ALTER FUNCTION "public"."get_platform_alerts"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_polarization_index"("p_battle_slug" "text") RETURNS TABLE("top_share" numeric, "second_share" numeric, "polarization_index" numeric, "classification" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  WITH current_scores AS (
    SELECT
      b.id as b_id,
      b.title as b_title,
      b.slug as b_slug,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
    GROUP BY b.id, b.title, b.slug, se.option_id
  ),
  ranked AS (
    SELECT
      cs.b_slug,
      cs.o_id,
      cs.t_weight,
      RANK() OVER (PARTITION BY cs.b_slug ORDER BY cs.t_weight DESC)::int as r_pos,
      cs.b_id,
      cs.b_title
    FROM current_scores cs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    0.0::numeric as variation,
    0.0::numeric as variation_percent,
    'stable'::text as direction,
    now() as snapshot_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url as image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  WHERE r.r_pos = 1
  ORDER BY r.t_weight DESC
  LIMIT 50;
END;
$$;


ALTER FUNCTION "public"."get_ranking_with_variation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_signal_activity"() RETURNS TABLE("signals_last_3h" bigint, "verified_signals_last_3h" bigint, "unique_users_last_3h" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  WITH battle_scores AS (
    SELECT
      b.slug as b_slug,
      b.id as b_id,
      b.title as b_title,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
      AND b.slug = p_battle_slug
      AND (p_age_range = 'all' OR se.age_bucket = p_age_range)
      AND (p_gender = 'all' OR se.gender = p_gender)
      AND (p_commune = 'all' OR se.commune = p_commune)
    GROUP BY b.slug, b.id, b.title, se.option_id
  ),
  ranked AS (
    SELECT
      bs.b_slug,
      bs.o_id,
      bs.t_weight,
      RANK() OVER (PARTITION BY bs.b_slug ORDER BY bs.t_weight DESC)::int as r_pos,
      now() as snap_at,
      bs.b_id,
      bs.b_title
    FROM battle_scores bs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    r.snap_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  ORDER BY r.r_pos ASC;
END;
$$;


ALTER FUNCTION "public"."get_segmented_ranking"("p_battle_slug" "text", "p_age_range" "text", "p_gender" "text", "p_commune" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_segmented_trending"("p_age_range" "text" DEFAULT 'all'::"text", "p_gender" "text" DEFAULT 'all'::"text", "p_commune" "text" DEFAULT 'all'::"text") RETURNS TABLE("battle_slug" "text", "option_id" "uuid", "total_weight" numeric, "rank_position" integer, "snapshot_at" timestamp with time zone, "battle_id" "uuid", "battle_title" "text", "option_label" "text", "image_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  WITH battle_scores AS (
    SELECT
      b.slug as b_slug,
      b.id as b_id,
      b.title as b_title,
      se.option_id as o_id,
      SUM(COALESCE(se.signal_weight, 1.0))::numeric as t_weight
    FROM public.signal_events_analytics_clean se
    JOIN public.battles b ON b.id = se.battle_id
    WHERE se.module_type IN ('versus', 'progressive')
      AND (p_age_range = 'all' OR se.age_bucket = p_age_range)
      AND (p_gender = 'all' OR se.gender = p_gender)
      AND (p_commune = 'all' OR se.commune = p_commune)
    GROUP BY b.slug, b.id, b.title, se.option_id
  ),
  ranked AS (
    SELECT
      bs.b_slug,
      bs.o_id,
      bs.t_weight,
      RANK() OVER (PARTITION BY bs.b_slug ORDER BY bs.t_weight DESC)::int as r_pos,
      now() as snap_at,
      bs.b_id,
      bs.b_title
    FROM battle_scores bs
  )
  SELECT
    r.b_slug,
    r.o_id,
    r.t_weight,
    r.r_pos,
    r.snap_at,
    r.b_id,
    r.b_title,
    bo.label as option_label,
    bo.image_url
  FROM ranked r
  JOIN public.battle_options bo ON bo.id = r.o_id
  WHERE r.r_pos = 1
  ORDER BY r.t_weight DESC
  LIMIT 50;
END;
$$;


ALTER FUNCTION "public"."get_segmented_trending"("p_age_range" "text", "p_gender" "text", "p_commune" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_session_vote_counts"("p_session_id" "uuid") RETURNS TABLE("option_id" "uuid", "votes_count" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    option_id,
    count(*)::int as votes_count
  from public.signal_events
  where user_id = auth.uid()
    and session_id = p_session_id
    and option_id is not null
  group by option_id;
$$;


ALTER FUNCTION "public"."get_session_vote_counts"("p_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_state_benchmarks"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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


CREATE OR REPLACE FUNCTION "public"."get_user_ranking"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user_id uuid;
    v_total_users int;
    v_user_stats record;
    v_ranking_data record;
BEGIN
    -- Get current authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get total count of users with stats
    SELECT count(*) INTO v_total_users FROM user_stats;

    -- If no users exist, return defaults
    IF v_total_users = 0 THEN
        RETURN json_build_object(
            'position', 1,
            'total_users', 1,
            'percentile', 100.0,
            'reputation_score', 0,
            'signals', 0,
            'weight', 1.0
        );
    END IF;

    -- Make sure user_stats exists for current user
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = v_user_id;

    -- If no user_stats yet, they are unranked (treat as last)
    IF v_user_stats IS NULL THEN
        RETURN json_build_object(
            'position', v_total_users + 1,
            'total_users', v_total_users,
            'percentile', 100.0,
            'reputation_score', 0,
            'signals', 0,
            'weight', 1.0
        );
    END IF;

    -- Calculate ranking using a window function on reputation (signals * weight)
    -- We use a CTE to rank everyone, then select the user's rank
    WITH RankedUsers AS (
        SELECT 
            user_id,
            total_signals,
            signal_weight,
            (total_signals * signal_weight) as reputation_score,
            RANK() OVER (ORDER BY (total_signals * signal_weight) DESC, total_signals DESC, updated_at ASC) as position
        FROM user_stats
    )
    SELECT 
        position,
        total_signals as signals,
        signal_weight as weight,
        reputation_score
    INTO v_ranking_data
    FROM RankedUsers
    WHERE user_id = v_user_id;

    -- Return the compiled record
    RETURN json_build_object(
        'position', v_ranking_data.position,
        'total_users', v_total_users,
        'percentile', ROUND(((v_ranking_data.position::numeric) / v_total_users::numeric) * 100, 1),
        'reputation_score', v_ranking_data.reputation_score,
        'signals', v_ranking_data.signals,
        'weight', v_ranking_data.weight
    );
END;
$$;


ALTER FUNCTION "public"."get_user_ranking"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
DECLARE
  v_nickname text;
BEGIN
  -- AHORA: Generamos un nickname temporal anónimo que no exponga el email
  -- Se usara este 'anon_xyz' hasta que el usuario lo cambie en /complete-profile
  v_nickname := 'anon_' || substr(regexp_replace(NEW.id::text, '-', '', 'g'), 1, 8);

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
    SET "search_path" TO 'public, extensions, pg_temp'
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

  -- 🛡️ Exclusión de señales de Administradores
  -- Evitar que las pruebas del usuario administrador contaminen las métricas
  IF public.is_admin_user() = true THEN
    RETURN;
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
  v_role text;

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

  -- Chequeo de Rol, Invite y Estado de Verificación
  SELECT u.invitation_code_id, COALESCE(u.is_identity_verified, false), COALESCE(u.role, 'user')
  INTO v_invite_id, v_is_verified, v_role
  FROM public.users u
  WHERE u.user_id = v_uid
  LIMIT 1;

  -- Exentamos a los administradores del requerimiento de invitación
  IF v_role != 'admin' AND v_invite_id IS NULL THEN
    PERFORM public.raise_sanitized('INVITE_REQUIRED');
  END IF;

  -- Perfil
  SELECT COALESCE(up.profile_stage, 0), COALESCE(up.signal_weight, 1.0)
  INTO v_profile_stage, v_user_weight
  FROM public.user_profiles up
  WHERE up.user_id = v_uid
  LIMIT 1;

  -- Exentamos a los administradores del checkeo de perfil
  IF v_role != 'admin' THEN
      IF NOT FOUND THEN
        PERFORM public.raise_sanitized('PROFILE_MISSING');
      END IF;

      IF v_profile_stage < 1 THEN
        PERFORM public.raise_sanitized('PROFILE_INCOMPLETE');
      END IF;
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

  -- Límite diario SOLO para no verificados y no administradores
  IF v_is_verified = false AND v_role != 'admin' THEN
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
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.users u
    where u.user_id = auth.uid()
      and u.role in ('admin', 'b2b')
  );
$$;


ALTER FUNCTION "public"."is_b2b_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kpi_engagement_quality"("p_battle_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("total_signals" bigint, "weighted_total" numeric, "verified_share_pct" numeric, "avg_profile_completeness" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  UPDATE public.platform_alerts
  SET is_read = true
  WHERE id = p_alert_id;
END;
$$;


ALTER FUNCTION "public"."mark_platform_alert_read"("p_alert_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_entity_name"("p_input" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select nullif(
    regexp_replace(
      lower(trim(coalesce(p_input, ''))),
      '[^a-z0-9]+',
      '',
      'g'
    ),
    ''
  );
$$;


ALTER FUNCTION "public"."normalize_entity_name"("p_input" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."normalize_entity_name"("p_input" "text") IS 'Normaliza nombres de entidades para matching básico y deduplicación asistida';



CREATE OR REPLACE FUNCTION "public"."raise_sanitized"("p_code" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Solo códigos cortos, sin detalles internos de Postgres (SQLERRM)
  RAISE EXCEPTION '%', p_code USING ERRCODE = 'P0001';
END;
$$;


ALTER FUNCTION "public"."raise_sanitized"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_context_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_numeric" numeric DEFAULT NULL::numeric, "p_value_text" "text" DEFAULT NULL::"text", "p_value_boolean" boolean DEFAULT NULL::boolean, "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'CONTEXT_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'news',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;


ALTER FUNCTION "public"."record_context_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_depth_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_numeric" numeric DEFAULT NULL::numeric, "p_value_text" "text" DEFAULT NULL::"text", "p_value_boolean" boolean DEFAULT NULL::boolean, "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'DEPTH_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'depth',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;


ALTER FUNCTION "public"."record_depth_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_personal_pulse_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_numeric" numeric DEFAULT NULL::numeric, "p_value_text" "text" DEFAULT NULL::"text", "p_value_boolean" boolean DEFAULT NULL::boolean, "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'PERSONAL_PULSE_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'pulse',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;


ALTER FUNCTION "public"."record_personal_pulse_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_progressive_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'PROGRESSIVE_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    null,
    null,
    null,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'progressive',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;


ALTER FUNCTION "public"."record_progressive_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_numeric" numeric DEFAULT NULL::numeric, "p_value_text" "text" DEFAULT NULL::"text", "p_value_boolean" boolean DEFAULT NULL::boolean, "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_raw_weight" numeric DEFAULT 1.0, "p_effective_weight" numeric DEFAULT NULL::numeric, "p_source_module" "text" DEFAULT NULL::"text", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"(), "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_signal_type_id bigint;
  v_verification_level_id bigint;
  v_effective_weight numeric;
  v_id uuid;
  v_multiplier numeric := 1.0;
begin
  if p_user_id is null and p_anon_id is null then
    raise exception 'record_signal_event requires p_user_id or p_anon_id';
  end if;

  select id
    into v_signal_type_id
  from public.signal_types
  where code = p_signal_type_code
    and is_active = true
  limit 1;

  if v_signal_type_id is null then
    raise exception 'Unknown signal type code: %', p_signal_type_code;
  end if;

  if p_verification_level_code is not null then
    select id, weight_multiplier
      into v_verification_level_id, v_multiplier
    from public.verification_levels
    where code = p_verification_level_code
      and is_active = true
    limit 1;
  end if;

  v_effective_weight := coalesce(p_effective_weight, p_raw_weight * coalesce(v_multiplier, 1.0));

  insert into public.signal_events (
    user_id,
    anon_id,
    signal_type_id,
    entity_id,
    context_id,
    verification_level_id,
    value_numeric,
    value_text,
    value_boolean,
    value_json,
    raw_weight,
    effective_weight,
    source_module,
    source_record_id,
    occurred_at,
    metadata
  )
  values (
    p_user_id,
    p_anon_id,
    v_signal_type_id,
    p_entity_id,
    p_context_id,
    v_verification_level_id,
    p_value_numeric,
    p_value_text,
    p_value_boolean,
    coalesce(p_value_json, '{}'::jsonb),
    coalesce(p_raw_weight, 1.0),
    coalesce(v_effective_weight, 1.0),
    p_source_module,
    p_source_record_id,
    coalesce(p_occurred_at, now()),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;


ALTER FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_raw_weight" numeric, "p_effective_weight" numeric, "p_source_module" "text", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone, "p_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_raw_weight" numeric, "p_effective_weight" numeric, "p_source_module" "text", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone, "p_metadata" "jsonb") IS 'Función base centralizada para registrar señales en signal_events';



CREATE OR REPLACE FUNCTION "public"."record_versus_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid" DEFAULT NULL::"uuid", "p_verification_level_code" "text" DEFAULT NULL::"text", "p_value_json" "jsonb" DEFAULT '{}'::"jsonb", "p_source_record_id" "text" DEFAULT NULL::"text", "p_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select public.record_signal_event(
    p_user_id,
    p_anon_id,
    'VERSUS_SIGNAL',
    p_entity_id,
    p_context_id,
    p_verification_level_code,
    null,
    null,
    null,
    coalesce(p_value_json, '{}'::jsonb),
    1.0,
    null,
    'versus',
    p_source_record_id,
    p_occurred_at,
    '{}'::jsonb
  );
$$;


ALTER FUNCTION "public"."record_versus_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."refresh_public_rank_snapshots_from_rollups"("p_window_days" integer DEFAULT 30) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_bucket timestamptz;
  v_lock boolean;
begin
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h_v2'));
  if v_lock is not true then
    return;
  end if;

  delete from public.public_rank_snapshots
  where snapshot_bucket = v_bucket;

  -- Para aislar los datos dentro de la ventana de tiempo (ej. últimos 30 días)
  create temp table tmp_window_rollups as
  select *
  from public.signal_rollups_hourly
  where bucket_ts >= now() - (p_window_days || ' days')::interval;

  -- 1. GLOBAL
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    '{}'::jsonb,
    'global'
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id;

  -- 2. GENDER
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('gender', gender),
    'gender:' || coalesce(gender,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, gender;

  -- 3. REGION
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('region', region),
    'region:' || coalesce(region,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, region;

  -- 4. GENDER + REGION
  insert into public.public_rank_snapshots (
    snapshot_bucket, module_type, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  select
    v_bucket,
    module_type,
    battle_id,
    option_id,
    coalesce(sum(weight_sum), 0)::numeric,
    coalesce(sum(signals_count), 0)::int,
    jsonb_build_object('gender', gender, 'region', region),
    'gender:' || coalesce(gender,'unknown') || '|region:' || coalesce(region,'unknown')
  from tmp_window_rollups
  where battle_id is not null and option_id is not null
  group by module_type, battle_id, option_id, gender, region;

  drop table tmp_window_rollups;
  perform pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h_v2'));
end;
$$;


ALTER FUNCTION "public"."refresh_public_rank_snapshots_from_rollups"("p_window_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
DECLARE
    v_battle_id uuid;
    v_title text;
    v_options jsonb;
BEGIN
    SELECT id, title INTO v_battle_id, v_title
    FROM public.battles
    WHERE slug = p_battle_slug AND status = 'active';

    IF v_battle_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Battle not found or inactive');
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'label', label,
            'image_url', image_url,
            'brand_domain', brand_domain,
            'sort_order', sort_order
        ) ORDER BY sort_order
    ) INTO v_options
    FROM public.battle_options
    WHERE battle_id = v_battle_id;

    RETURN jsonb_build_object(
        'ok', true,
        'battle_id', v_battle_id,
        'battle_slug', p_battle_slug,
        'title', v_title,
        'options', v_options
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


CREATE OR REPLACE FUNCTION "public"."rollup_signal_events_incremental"("p_max_lag_minutes" integer DEFAULT 2) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_from timestamptz;
  v_to timestamptz;
begin
  select last_event_ts into v_from
  from public.rollup_state
  where id = 'signal_events';

  v_to := now() - make_interval(mins => p_max_lag_minutes);

  if v_to <= v_from then
    return;
  end if;

  insert into public.signal_rollups_hourly (
    bucket_ts,
    module_type,
    battle_id,
    option_id,
    region,
    gender,
    age_bucket,
    signals_count,
    weight_sum,
    updated_at
  )
  select
    date_trunc('hour', se.created_at) as bucket_ts,
    se.module_type,
    se.battle_id,
    se.option_id,
    se.region,
    se.gender,
    se.age_bucket,
    count(*)::bigint as signals_count,
    coalesce(sum(se.signal_weight),0)::numeric as weight_sum,
    now() as updated_at
  from public.signal_events se
  where se.created_at > v_from
    and se.created_at <= v_to
  group by 1,2,3,4,5,6,7
  on conflict (bucket_ts, module_type, battle_id, option_id, region, gender, age_bucket)
  do update set
    signals_count = public.signal_rollups_hourly.signals_count + excluded.signals_count,
    weight_sum = public.signal_rollups_hourly.weight_sum + excluded.weight_sum,
    updated_at = now();

  update public.rollup_state
  set last_event_ts = v_to,
      updated_at = now()
  where id = 'signal_events';
end;
$$;


ALTER FUNCTION "public"."rollup_signal_events_incremental"("p_max_lag_minutes" integer) OWNER TO "postgres";


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
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_daily_metrics_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_user_daily_metrics_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text" DEFAULT 'open'::"text", "p_client_event_id" "uuid" DEFAULT "gen_random_uuid"(), "p_device_hash" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_user_id uuid;
  v_anon_id uuid;
BEGIN
  v_user_id := auth.uid();

  -- If you already have a helper function, prefer it:
  -- v_anon_id := public.get_or_create_anon_id(p_device_hash);
  -- If not, keep anon_id NULL (still valuable for telemetry).
  BEGIN
    v_anon_id := public.get_or_create_anon_id(p_device_hash);
  EXCEPTION WHEN undefined_function THEN
    v_anon_id := NULL;
  END;

  INSERT INTO public.module_interest_events (
    user_id,
    anon_id,
    device_hash,
    module_key,
    event_type,
    client_event_id,
    metadata
  )
  VALUES (
    v_user_id,
    v_anon_id,
    p_device_hash,
    p_module_key,
    p_event_type,
    p_client_event_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (client_event_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text", "p_client_event_id" "uuid", "p_device_hash" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_user_session"("p_anon_id" "uuid" DEFAULT NULL::"uuid", "p_seconds_spent" integer DEFAULT 0, "p_is_new_session" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session_increment integer := CASE WHEN p_is_new_session THEN 1 ELSE 0 END;
BEGIN
  -- Si no manda tiempo ni sesión nueva, no hacemos nada
  IF p_seconds_spent <= 0 AND NOT p_is_new_session THEN
    RETURN;
  END IF;

  -- 1) Prioridad: Si hay sesión iniciada
  IF v_uid IS NOT NULL THEN
    -- Histórico
    UPDATE public.users
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + v_session_increment,
           last_active_at = now()
     WHERE user_id = v_uid;

    -- Diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, time_spent_seconds, sessions)
    VALUES (v_uid, CURRENT_DATE, p_seconds_spent, v_session_increment)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET 
      time_spent_seconds = public.user_daily_metrics.time_spent_seconds + EXCLUDED.time_spent_seconds,
      sessions = public.user_daily_metrics.sessions + EXCLUDED.sessions;
      
    RETURN;
  END IF;

  -- 2) Secundario: Si manda un anon_id (texto) que convertimos a subquery, track in DB is mostly TEXT in frontend
  -- as anon_id UUID parameter passed by React was originally text anon_id
  -- We assume p_anon_id passed here is actually the frontend's anon_id text but cast as uuid due to our RPC interface,
  -- We will treat it as a lookup or direct user_id match if possible.
  -- To be safe, let's treat it as the user_id PK of anonymous_identities table if we can.
  IF p_anon_id IS NOT NULL THEN
    -- Histórico
    UPDATE public.anonymous_identities
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + v_session_increment,
           last_active_at = now()
     WHERE user_id = p_anon_id; -- changed to search by user_id

    -- Diario
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, time_spent_seconds, sessions)
    VALUES (p_anon_id, CURRENT_DATE, p_seconds_spent, v_session_increment)
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET 
      time_spent_seconds = public.user_daily_metrics.time_spent_seconds + EXCLUDED.time_spent_seconds,
      sessions = public.user_daily_metrics.sessions + EXCLUDED.sessions;
  END IF;
END;
$$;


ALTER FUNCTION "public"."track_user_session"("p_anon_id" "uuid", "p_seconds_spent" integer, "p_is_new_session" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_increment_interactions_signals"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  -- Si el voto viene de un usuario anónimo:
  IF NEW.anon_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE anon_id = NEW.anon_id;
     
    -- Acumulado diario (usando NEW.user_id temporalmente si es anon hasta que hagamos match, asumimos que viene en evento o buscamos su user_id si ya hay uno ligado)
    -- En la migración 20260218, anon_id en tabla event es text, pero PK real is user_id
    -- Como la FK the daily_metrics depende the la tabla (que usa user_id), necesitamos buscarlo
    -- Haremos que el trigger asocie mediante user_id subyacente de public.anonymous_identities
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, interactions)
    SELECT user_id, CURRENT_DATE, 1 FROM public.anonymous_identities WHERE anon_id = NEW.anon_id LIMIT 1
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  -- Si el voto viene de un usuario logueado:
  IF NEW.user_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE user_id = NEW.user_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, interactions)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_increment_interactions_signals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_increment_interactions_state"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
    AS $$
BEGIN
  IF NEW.anon_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE anon_id = NEW.anon_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, interactions)
    SELECT user_id, CURRENT_DATE, 1 FROM public.anonymous_identities WHERE anon_id = NEW.anon_id LIMIT 1
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE user_id = NEW.user_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, interactions)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_increment_interactions_state"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trust_score"("p_user" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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
    SET "search_path" TO 'public, extensions, pg_temp'
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



CREATE TABLE IF NOT EXISTS "public"."current_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "short_summary" "text" NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "is_active" boolean DEFAULT false,
    "event_date" timestamp with time zone,
    "published_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "impact_quote" "text",
    "tags" "text"[],
    "actors" "text"[],
    "intensity" integer,
    "relevance_chile" integer,
    "confidence_score" integer,
    "event_stage" "text",
    "topic_duration" "text",
    "opinion_maturity" "text",
    "source_domain" "text",
    "source_title" "text",
    "source_published_at" timestamp with time zone,
    "cluster_id" "text",
    "created_by_ai" boolean DEFAULT true,
    "admin_edited" boolean DEFAULT false
);


ALTER TABLE "public"."current_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topic_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid",
    "question_id" "uuid",
    "user_id" "uuid",
    "answer_value" "text" NOT NULL,
    "temporal_mode" "text" DEFAULT 'live'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."topic_answers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."actualidad_stats_view" AS
 SELECT "t"."id" AS "topic_id",
    "count"(DISTINCT "a"."user_id") AS "total_participants",
    "count"("a"."id") AS "total_signals"
   FROM ("public"."current_topics" "t"
     LEFT JOIN "public"."topic_answers" "a" ON (("t"."id" = "a"."topic_id")))
  GROUP BY "t"."id";


ALTER VIEW "public"."actualidad_stats_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."actualidad_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo" "text" NOT NULL,
    "contexto_corto" "text" NOT NULL,
    "categoria" "text" NOT NULL,
    "pregunta_postura" "jsonb" NOT NULL,
    "pregunta_impacto" "jsonb" NOT NULL,
    "fecha_inicio" timestamp with time zone DEFAULT "now"(),
    "fecha_fin" timestamp with time zone,
    "estado" "text" DEFAULT 'activo'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "actualidad_topics_estado_check" CHECK (("estado" = ANY (ARRAY['activo'::"text", 'cerrado'::"text", 'archivado'::"text"])))
);


ALTER TABLE "public"."actualidad_topics" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."b2b_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "company" "text",
    "role" "text",
    "email" "text" NOT NULL,
    "interest" "text",
    "status" "text" DEFAULT 'new'::"text"
);


ALTER TABLE "public"."b2b_leads" OWNER TO "postgres";


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
    "created_at" timestamp with time zone DEFAULT "now"(),
    "brand_domain" "text"
);


ALTER TABLE "public"."battle_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ai_summary" "text",
    "ai_summary_generated_at" timestamp with time zone
);


ALTER TABLE "public"."battles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."battles"."ai_summary" IS 'Resumen corporativo generado por IA sobre el desempeño y polarización de esta batalla.';



COMMENT ON COLUMN "public"."battles"."ai_summary_generated_at" IS 'Fecha y hora en que la IA de OpenAI generó el resumen mágico.';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "emoji" "text",
    "cover_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "comparison_family" "text",
    "entity_type" "text",
    "generation_mode" "text" DEFAULT 'ai_curated_pairs'::"text",
    "pairing_rules" "text",
    "review_required" boolean DEFAULT true,
    "active" boolean DEFAULT true
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."categories"."comparison_family" IS 'Familia comparativa general: brand_service, physical_place, destination, product, personal_state';



COMMENT ON COLUMN "public"."categories"."entity_type" IS 'Entidad específica comparada dentro de la familia. Ej: bank_brand, health_insurance, tv_channel';



COMMENT ON COLUMN "public"."categories"."generation_mode" IS 'Modos: ai_curated_pairs, manual_curated, ai_open_generation, trend_reactive, personal_pulse';



COMMENT ON COLUMN "public"."categories"."pairing_rules" IS 'Instrucción o restricción para la IA sobre con quién se puede emparejar. Ej: same_entity_type_only';



CREATE TABLE IF NOT EXISTS "public"."category_attributes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vertical" "text" NOT NULL,
    "category" "text" NOT NULL,
    "key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "scale_min" integer DEFAULT 1 NOT NULL,
    "scale_max" integer DEFAULT 5 NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."category_attributes" OWNER TO "postgres";


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
    "image_url" "text",
    "vertical" "text",
    "city" "text" DEFAULT 'Santiago'::"text",
    "country_code" "text" DEFAULT 'CL'::"text",
    "logo_path" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 100,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tier" integer DEFAULT 2,
    "elo_score" numeric DEFAULT 1500.00,
    "battles_played" integer DEFAULT 0,
    "battles_won" integer DEFAULT 0
);


ALTER TABLE "public"."entities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entity_aliases" (
    "id" bigint NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "alias" "text" NOT NULL,
    "normalized_alias" "text",
    "alias_kind" "text" DEFAULT 'alternate_name'::"text",
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."entity_aliases" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_aliases" IS 'Alias o variantes de nombre asociadas a una entidad maestra';



COMMENT ON COLUMN "public"."entity_aliases"."alias_kind" IS 'Ejemplos: alternate_name, typo, short_name, legacy_name';



CREATE SEQUENCE IF NOT EXISTS "public"."entity_aliases_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entity_aliases_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entity_aliases_id_seq" OWNED BY "public"."entity_aliases"."id";



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


CREATE TABLE IF NOT EXISTS "public"."entity_legacy_mappings" (
    "id" bigint NOT NULL,
    "source_table" "text" NOT NULL,
    "source_id" "text" NOT NULL,
    "source_label" "text",
    "entity_id" "uuid" NOT NULL,
    "mapping_status" "text" DEFAULT 'mapped'::"text" NOT NULL,
    "confidence_score" numeric(5,4),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."entity_legacy_mappings" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_legacy_mappings" IS 'Relación entre registros legacy del proyecto y entidad maestra signal_entities';



COMMENT ON COLUMN "public"."entity_legacy_mappings"."mapping_status" IS 'mapped, pending_review, rejected, deprecated';



COMMENT ON COLUMN "public"."entity_legacy_mappings"."confidence_score" IS 'Confianza del matching o mapeo';



CREATE SEQUENCE IF NOT EXISTS "public"."entity_legacy_mappings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entity_legacy_mappings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entity_legacy_mappings_id_seq" OWNED BY "public"."entity_legacy_mappings"."id";



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


CREATE TABLE IF NOT EXISTS "public"."entity_relationships" (
    "id" bigint NOT NULL,
    "parent_entity_id" "uuid" NOT NULL,
    "child_entity_id" "uuid" NOT NULL,
    "relationship_type" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "entity_relationships_not_same_chk" CHECK (("parent_entity_id" <> "child_entity_id"))
);


ALTER TABLE "public"."entity_relationships" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_relationships" IS 'Relaciones jerárquicas o semánticas entre entidades maestras';



COMMENT ON COLUMN "public"."entity_relationships"."relationship_type" IS 'Ejemplos: owns_brand, offers_service, has_product, related_to, belongs_to';



CREATE SEQUENCE IF NOT EXISTS "public"."entity_relationships_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entity_relationships_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entity_relationships_id_seq" OWNED BY "public"."entity_relationships"."id";



CREATE TABLE IF NOT EXISTS "public"."entity_types" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."entity_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_types" IS 'Tipos de entidades que pueden recibir señales';



CREATE SEQUENCE IF NOT EXISTS "public"."entity_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entity_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entity_types_id_seq" OWNED BY "public"."entity_types"."id";



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
    "whatsapp_phone" "text",
    "whatsapp_status" "text" DEFAULT 'pending'::"text",
    "whatsapp_sent_at" timestamp with time zone,
    "whatsapp_error" "text",
    "whatsapp_message_id" "text",
    "whatsapp_last_sent_at" timestamp with time zone,
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


CREATE TABLE IF NOT EXISTS "public"."module_interest_events" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "anon_id" "uuid",
    "device_hash" "text",
    "module_key" "text" NOT NULL,
    "event_type" "text" DEFAULT 'open'::"text" NOT NULL,
    "client_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."module_interest_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."module_interest_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."module_interest_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."module_interest_events_id_seq" OWNED BY "public"."module_interest_events"."id";



CREATE TABLE IF NOT EXISTS "public"."news_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid",
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "published_at" timestamp with time zone,
    "raw_content" "text",
    "language" "text" DEFAULT 'es'::"text",
    "fetched_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."news_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "country" "text",
    "source_type" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."news_sources" OWNER TO "postgres";


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
    "household_size" "text",
    "children_count" "text",
    "car_count" "text",
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


CREATE TABLE IF NOT EXISTS "public"."rollup_state" (
    "id" "text" DEFAULT 'signal_events'::"text" NOT NULL,
    "last_event_ts" timestamp with time zone DEFAULT '1970-01-01 00:00:00+00'::timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rollup_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signal_contexts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text",
    "name" "text" NOT NULL,
    "context_kind" "text" NOT NULL,
    "source_module" "text",
    "external_ref" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signal_contexts" OWNER TO "postgres";


COMMENT ON TABLE "public"."signal_contexts" IS 'Contexto o contenedor en el que se emite una señal';



COMMENT ON COLUMN "public"."signal_contexts"."context_kind" IS 'Ejemplos: versus, progressive, depth, news, pulse';



COMMENT ON COLUMN "public"."signal_contexts"."source_module" IS 'Módulo actual del producto desde donde provino la señal';



CREATE TABLE IF NOT EXISTS "public"."signal_entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type_id" bigint NOT NULL,
    "slug" "text",
    "display_name" "text" NOT NULL,
    "legal_name" "text",
    "external_ref" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "normalized_name" "text",
    "canonical_code" "text",
    "country_code" "text",
    "primary_category" "text",
    "primary_subcategory" "text"
);


ALTER TABLE "public"."signal_entities" OWNER TO "postgres";


COMMENT ON TABLE "public"."signal_entities" IS 'Entidad universal sobre la que se pueden emitir señales';



COMMENT ON COLUMN "public"."signal_entities"."external_ref" IS 'Referencia opcional a catálogos o tablas existentes';



COMMENT ON COLUMN "public"."signal_entities"."metadata" IS 'Atributos adicionales flexibles de la entidad';



COMMENT ON COLUMN "public"."signal_entities"."normalized_name" IS 'Nombre normalizado para deduplicación y matching';



COMMENT ON COLUMN "public"."signal_entities"."canonical_code" IS 'Código canónico interno estable';



COMMENT ON COLUMN "public"."signal_entities"."country_code" IS 'País principal asociado a la entidad si aplica';



COMMENT ON COLUMN "public"."signal_entities"."primary_category" IS 'Categoría principal del negocio o dominio';



COMMENT ON COLUMN "public"."signal_entities"."primary_subcategory" IS 'Subcategoría principal del negocio o dominio';



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
    "device_hash" "text",
    "signal_type_id" bigint,
    "verification_level_id" bigint,
    "value_boolean" boolean,
    "value_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "raw_weight" numeric(14,4) DEFAULT 1.0 NOT NULL,
    "effective_weight" numeric(14,4) DEFAULT 1.0 NOT NULL,
    "source_module" "text",
    "source_record_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signal_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."signal_events" IS 'Tabla madre del motor de señales de Opina+';



COMMENT ON COLUMN "public"."signal_events"."anon_id" IS 'Identificador anónimo si no existe user_id';



COMMENT ON COLUMN "public"."signal_events"."user_id" IS 'Usuario autenticado si existe';



COMMENT ON COLUMN "public"."signal_events"."value_json" IS 'Payload estructurado específico según el tipo de señal';



COMMENT ON COLUMN "public"."signal_events"."raw_weight" IS 'Peso base de la señal antes de aplicar multiplicadores';



COMMENT ON COLUMN "public"."signal_events"."effective_weight" IS 'Peso final utilizable para agregaciones';



COMMENT ON COLUMN "public"."signal_events"."source_module" IS 'Módulo de origen: versus, progressive, depth, news, pulse';



COMMENT ON COLUMN "public"."signal_events"."source_record_id" IS 'ID del registro original en tablas legacy o actuales';



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


CREATE TABLE IF NOT EXISTS "public"."signal_rollups_hourly" (
    "bucket_ts" timestamp with time zone NOT NULL,
    "module_type" "text" NOT NULL,
    "battle_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "region" "text" NOT NULL,
    "gender" "text" NOT NULL,
    "age_bucket" "text" NOT NULL,
    "signals_count" bigint DEFAULT 0 NOT NULL,
    "weight_sum" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signal_rollups_hourly" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signal_types" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."signal_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."signal_types" IS 'Catálogo oficial de tipos de señal de Opina+';



COMMENT ON COLUMN "public"."signal_types"."code" IS 'Código estable interno, por ejemplo VERSUS_SIGNAL';



CREATE SEQUENCE IF NOT EXISTS "public"."signal_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."signal_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."signal_types_id_seq" OWNED BY "public"."signal_types"."id";



CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_name" "text" NOT NULL,
    "monthly_price" numeric NOT NULL,
    "request_limit" integer NOT NULL,
    "features" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topic_articles" (
    "topic_id" "uuid" NOT NULL,
    "article_id" "uuid" NOT NULL,
    "relevance_score" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."topic_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topic_question_sets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."topic_question_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topic_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "set_id" "uuid",
    "question_order" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "answer_type" "text" NOT NULL,
    "options_json" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."topic_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_actualidad_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "signal_type" "text" DEFAULT 'actualidad'::"text",
    "tema_id" "uuid" NOT NULL,
    "categoria_tema" "text" NOT NULL,
    "respuesta_postura" "text" NOT NULL,
    "respuesta_impacto" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_actualidad_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_daily_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "anon_id" "uuid",
    "metric_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "interactions" bigint DEFAULT 0 NOT NULL,
    "time_spent_seconds" bigint DEFAULT 0 NOT NULL,
    "sessions" bigint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_identity" CHECK ((("user_id" IS NOT NULL) OR ("anon_id" IS NOT NULL)))
);


ALTER TABLE "public"."user_daily_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_pulses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "signal_type" "text" DEFAULT 'tu_pulso'::"text",
    "sub_category" "text" NOT NULL,
    "question_identifier" "text" NOT NULL,
    "response_value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_pulses_sub_category_check" CHECK (("sub_category" = ANY (ARRAY['sobre_mi'::"text", 'mi_semana'::"text", 'mi_entorno'::"text"])))
);


ALTER TABLE "public"."user_pulses" OWNER TO "postgres";


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


CREATE OR REPLACE VIEW "public"."v_comparative_preference_summary" AS
 WITH "wins" AS (
         SELECT "s"."entity_id",
            "count"("s"."id") AS "wins_count",
            "sum"("s"."effective_weight") AS "weighted_wins"
           FROM ("public"."signal_events" "s"
             JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
          WHERE ("st"."code" = ANY (ARRAY['VERSUS_SIGNAL'::"text", 'PROGRESSIVE_SIGNAL'::"text"]))
          GROUP BY "s"."entity_id"
        ), "losses" AS (
         SELECT (NULLIF(("s"."value_json" ->> 'loser_entity_id'::"text"), ''::"text"))::"uuid" AS "entity_id",
            "count"("s"."id") AS "losses_count",
            "sum"("s"."effective_weight") AS "weighted_losses"
           FROM ("public"."signal_events" "s"
             JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
          WHERE (("st"."code" = ANY (ARRAY['VERSUS_SIGNAL'::"text", 'PROGRESSIVE_SIGNAL'::"text"])) AND (("s"."value_json" ->> 'loser_entity_id'::"text") IS NOT NULL) AND (("s"."value_json" ->> 'loser_entity_id'::"text") <> ''::"text"))
          GROUP BY (NULLIF(("s"."value_json" ->> 'loser_entity_id'::"text"), ''::"text"))::"uuid"
        )
 SELECT COALESCE("w"."entity_id", "l"."entity_id") AS "entity_id",
    "se"."display_name" AS "entity_name",
    COALESCE("w"."wins_count", (0)::bigint) AS "wins_count",
    COALESCE("l"."losses_count", (0)::bigint) AS "losses_count",
    COALESCE("w"."weighted_wins", (0)::numeric) AS "weighted_wins",
    COALESCE("l"."weighted_losses", (0)::numeric) AS "weighted_losses",
    (COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) AS "total_comparisons",
        CASE
            WHEN ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) > 0) THEN "round"((((COALESCE("w"."wins_count", (0)::bigint))::numeric / ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)))::numeric) * 100.0), 2)
            ELSE (0)::numeric
        END AS "preference_share",
        CASE
            WHEN ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)) > 0) THEN ((COALESCE("w"."wins_count", (0)::bigint))::numeric / ((COALESCE("w"."wins_count", (0)::bigint) + COALESCE("l"."losses_count", (0)::bigint)))::numeric)
            ELSE (0)::numeric
        END AS "win_rate"
   FROM (("wins" "w"
     FULL JOIN "losses" "l" ON (("w"."entity_id" = "l"."entity_id")))
     JOIN "public"."signal_entities" "se" ON ((COALESCE("w"."entity_id", "l"."entity_id") = "se"."id")))
  WHERE ("se"."is_active" = true);


ALTER VIEW "public"."v_comparative_preference_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_depth_entity_question_summary" AS
 SELECT "se"."id" AS "entity_id",
    "se"."display_name" AS "entity_name",
    ("s"."value_json" ->> 'question_code'::"text") AS "question_code",
    ("s"."value_json" ->> 'question_label'::"text") AS "question_label",
    ("s"."value_json" ->> 'response_type'::"text") AS "response_type",
    "count"("s"."id") AS "total_responses",
    "count"("s"."value_numeric") AS "numeric_response_count",
    "round"("avg"("s"."value_numeric"), 2) AS "average_score",
    "count"(
        CASE
            WHEN ("s"."value_boolean" = true) THEN 1
            ELSE NULL::integer
        END) AS "boolean_true_count",
    "count"(
        CASE
            WHEN ("s"."value_boolean" = false) THEN 1
            ELSE NULL::integer
        END) AS "boolean_false_count",
        CASE
            WHEN ("max"(("s"."value_json" ->> 'response_type'::"text")) = 'scale_0_10'::"text") THEN "round"((((("count"(
            CASE
                WHEN ("s"."value_numeric" >= (9)::numeric) THEN 1
                ELSE NULL::integer
            END))::numeric / (NULLIF("count"("s"."value_numeric"), 0))::numeric) - (("count"(
            CASE
                WHEN ("s"."value_numeric" <= (6)::numeric) THEN 1
                ELSE NULL::integer
            END))::numeric / (NULLIF("count"("s"."value_numeric"), 0))::numeric)) * 100.0), 2)
            ELSE NULL::numeric
        END AS "nps_score",
    "max"("s"."created_at") AS "last_signal_at"
   FROM (("public"."signal_entities" "se"
     JOIN "public"."signal_events" "s" ON (("se"."id" = "s"."entity_id")))
     JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
  WHERE (("st"."code" = 'DEPTH_SIGNAL'::"text") AND ("se"."is_active" = true) AND (("s"."value_json" ->> 'question_code'::"text") IS NOT NULL))
  GROUP BY "se"."id", "se"."display_name", ("s"."value_json" ->> 'question_code'::"text"), ("s"."value_json" ->> 'question_label'::"text"), ("s"."value_json" ->> 'response_type'::"text");


ALTER VIEW "public"."v_depth_entity_question_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_signal_entity_period_summary" AS
 SELECT "se"."id" AS "entity_id",
    "se"."display_name" AS "entity_name",
    "date_trunc"('day'::"text", "s"."created_at") AS "period_day",
    "date_trunc"('week'::"text", "s"."created_at") AS "period_week",
    "count"("s"."id") AS "total_signals",
    "sum"("s"."effective_weight") AS "weighted_signals",
    "count"(DISTINCT COALESCE(("s"."user_id")::"text", "s"."anon_id")) AS "unique_users_count"
   FROM ("public"."signal_entities" "se"
     JOIN "public"."signal_events" "s" ON (("se"."id" = "s"."entity_id")))
  WHERE ("se"."is_active" = true)
  GROUP BY "se"."id", "se"."display_name", ("date_trunc"('day'::"text", "s"."created_at")), ("date_trunc"('week'::"text", "s"."created_at"));


ALTER VIEW "public"."v_signal_entity_period_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_signal_entity_summary" AS
 SELECT "se"."id" AS "entity_id",
    "se"."display_name" AS "entity_name",
    "et"."code" AS "entity_type_code",
    "count"("s"."id") AS "total_signals",
    "sum"("s"."effective_weight") AS "weighted_signals",
    "count"(DISTINCT COALESCE(("s"."user_id")::"text", "s"."anon_id")) AS "unique_users_count",
    "count"(DISTINCT "s"."context_id") AS "unique_contexts_count",
    "max"("s"."created_at") AS "last_signal_at"
   FROM (("public"."signal_entities" "se"
     JOIN "public"."entity_types" "et" ON (("et"."id" = "se"."entity_type_id")))
     LEFT JOIN "public"."signal_events" "s" ON (("se"."id" = "s"."entity_id")))
  WHERE ("se"."is_active" = true)
  GROUP BY "se"."id", "se"."display_name", "et"."code";


ALTER VIEW "public"."v_signal_entity_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_signal_entity_type_summary" AS
 SELECT "se"."id" AS "entity_id",
    "se"."display_name" AS "entity_name",
    "st"."code" AS "signal_type_code",
    "count"("s"."id") AS "total_signals",
    "sum"("s"."effective_weight") AS "weighted_signals",
    "count"(DISTINCT COALESCE(("s"."user_id")::"text", "s"."anon_id")) AS "unique_users_count",
    "max"("s"."created_at") AS "last_signal_at"
   FROM (("public"."signal_entities" "se"
     JOIN "public"."signal_events" "s" ON (("se"."id" = "s"."entity_id")))
     JOIN "public"."signal_types" "st" ON (("st"."id" = "s"."signal_type_id")))
  WHERE ("se"."is_active" = true)
  GROUP BY "se"."id", "se"."display_name", "st"."code";


ALTER VIEW "public"."v_signal_entity_type_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_levels" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "weight_multiplier" numeric(8,4) DEFAULT 1.0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verification_levels" OWNER TO "postgres";


COMMENT ON TABLE "public"."verification_levels" IS 'Nivel de verificación/calidad del usuario para ponderar señales';



CREATE OR REPLACE VIEW "public"."v_signal_events_enriched" AS
 SELECT "se"."id",
    "se"."user_id",
    "se"."anon_id",
    "st"."code" AS "signal_type_code",
    "st"."name" AS "signal_type_name",
    "ent"."id" AS "entity_id",
    "ent"."display_name" AS "entity_name",
    "et"."code" AS "entity_type_code",
    "ctx"."id" AS "context_id",
    "ctx"."name" AS "context_name",
    "ctx"."context_kind",
    "vl"."code" AS "verification_level_code",
    "vl"."weight_multiplier",
    "se"."value_numeric",
    "se"."value_text",
    "se"."value_boolean",
    "se"."value_json",
    "se"."raw_weight",
    "se"."effective_weight",
    "se"."source_module",
    "se"."source_record_id",
    "se"."occurred_at",
    "se"."created_at",
    "se"."metadata"
   FROM ((((("public"."signal_events" "se"
     JOIN "public"."signal_types" "st" ON (("st"."id" = "se"."signal_type_id")))
     JOIN "public"."signal_entities" "ent" ON ((("ent"."id")::"text" = ("se"."entity_id")::"text")))
     JOIN "public"."entity_types" "et" ON (("et"."id" = "ent"."entity_type_id")))
     LEFT JOIN "public"."signal_contexts" "ctx" ON ((("ctx"."id")::"text" = "se"."context_id")))
     LEFT JOIN "public"."verification_levels" "vl" ON (("vl"."id" = "se"."verification_level_id")));


ALTER VIEW "public"."v_signal_events_enriched" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_signal_events_enriched" IS 'Vista enriquecida para explorar señales y acelerar integraciones futuras';



CREATE OR REPLACE VIEW "public"."v_trend_week_over_week" AS
 WITH "current_week" AS (
         SELECT "signal_events"."entity_id",
            "count"(*) AS "current_signal_count"
           FROM "public"."signal_events"
          WHERE (("signal_events"."created_at" >= ("now"() - '7 days'::interval)) AND ("signal_events"."entity_id" IS NOT NULL))
          GROUP BY "signal_events"."entity_id"
        ), "previous_week" AS (
         SELECT "signal_events"."entity_id",
            "count"(*) AS "previous_signal_count"
           FROM "public"."signal_events"
          WHERE (("signal_events"."created_at" >= ("now"() - '14 days'::interval)) AND ("signal_events"."created_at" < ("now"() - '7 days'::interval)) AND ("signal_events"."entity_id" IS NOT NULL))
          GROUP BY "signal_events"."entity_id"
        )
 SELECT "e"."id" AS "entity_id",
    "e"."normalized_name" AS "entity_name",
    COALESCE("cw"."current_signal_count", (0)::bigint) AS "current_signal_count",
    COALESCE("pw"."previous_signal_count", (0)::bigint) AS "previous_signal_count",
        CASE
            WHEN (COALESCE("pw"."previous_signal_count", (0)::bigint) = 0) THEN (100)::numeric
            ELSE "round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / ("pw"."previous_signal_count")::numeric) * (100)::numeric), 2)
        END AS "delta_percentage",
        CASE
            WHEN (COALESCE("cw"."current_signal_count", (0)::bigint) < 10) THEN 'insuficiente'::"text"
            WHEN ((COALESCE("pw"."previous_signal_count", (0)::bigint) = 0) AND (COALESCE("cw"."current_signal_count", (0)::bigint) >= 10)) THEN 'acelerando'::"text"
            WHEN ("round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / (NULLIF("pw"."previous_signal_count", 0))::numeric) * (100)::numeric), 2) >= (15)::numeric) THEN 'acelerando'::"text"
            WHEN ("round"(((((COALESCE("cw"."current_signal_count", (0)::bigint) - "pw"."previous_signal_count"))::numeric / (NULLIF("pw"."previous_signal_count", 0))::numeric) * (100)::numeric), 2) <= ('-15'::integer)::numeric) THEN 'bajando'::"text"
            ELSE 'estable'::"text"
        END AS "trend_status"
   FROM (("public"."signal_entities" "e"
     LEFT JOIN "current_week" "cw" ON (("e"."id" = "cw"."entity_id")))
     LEFT JOIN "previous_week" "pw" ON (("e"."id" = "pw"."entity_id")))
  WHERE (("cw"."current_signal_count" > 0) OR ("pw"."previous_signal_count" > 0));


ALTER VIEW "public"."v_trend_week_over_week" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."verification_levels_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."verification_levels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."verification_levels_id_seq" OWNED BY "public"."verification_levels"."id";



CREATE TABLE IF NOT EXISTS "public"."volatility_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "battle_slug" "text" NOT NULL,
    "volatility_index" numeric(15,2) NOT NULL,
    "classification" "text" NOT NULL,
    "snapshot_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."volatility_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_inbound_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wa_message_id" "text",
    "wa_from" "text",
    "wa_from_hash" "text",
    "message_type" "text",
    "body" "text",
    "token_text" "text",
    "invite_id" "uuid",
    "raw" "jsonb"
);


ALTER TABLE "public"."whatsapp_inbound_messages" OWNER TO "postgres";


ALTER TABLE ONLY "public"."entity_aliases" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entity_aliases_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entity_legacy_mappings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entity_legacy_mappings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entity_relationships" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entity_relationships_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entity_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entity_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."module_interest_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."module_interest_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."signal_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."signal_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."verification_levels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."verification_levels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."access_gate_tokens"
    ADD CONSTRAINT "access_gate_tokens_code_hash_key" UNIQUE ("code_hash");



ALTER TABLE ONLY "public"."access_gate_tokens"
    ADD CONSTRAINT "access_gate_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."actualidad_topics"
    ADD CONSTRAINT "actualidad_topics_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."b2b_leads"
    ADD CONSTRAINT "b2b_leads_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."category_attributes"
    ADD CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."category_daily_aggregates"
    ADD CONSTRAINT "category_daily_aggregates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."current_topics"
    ADD CONSTRAINT "current_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."current_topics"
    ADD CONSTRAINT "current_topics_slug_key" UNIQUE ("slug");



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



ALTER TABLE ONLY "public"."entity_aliases"
    ADD CONSTRAINT "entity_aliases_entity_id_alias_key" UNIQUE ("entity_id", "alias");



ALTER TABLE ONLY "public"."entity_aliases"
    ADD CONSTRAINT "entity_aliases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_daily_aggregates"
    ADD CONSTRAINT "entity_daily_aggregates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_legacy_mappings"
    ADD CONSTRAINT "entity_legacy_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_legacy_mappings"
    ADD CONSTRAINT "entity_legacy_mappings_source_table_source_id_key" UNIQUE ("source_table", "source_id");



ALTER TABLE ONLY "public"."entity_rank_snapshots"
    ADD CONSTRAINT "entity_rank_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_relationships"
    ADD CONSTRAINT "entity_relationships_parent_entity_id_child_entity_id_relat_key" UNIQUE ("parent_entity_id", "child_entity_id", "relationship_type");



ALTER TABLE ONLY "public"."entity_relationships"
    ADD CONSTRAINT "entity_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_types"
    ADD CONSTRAINT "entity_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."entity_types"
    ADD CONSTRAINT "entity_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."executive_reports"
    ADD CONSTRAINT "executive_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_redemptions"
    ADD CONSTRAINT "invite_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_interest_events"
    ADD CONSTRAINT "module_interest_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_url_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."news_sources"
    ADD CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."rollup_state"
    ADD CONSTRAINT "rollup_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_contexts"
    ADD CONSTRAINT "signal_contexts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_entities"
    ADD CONSTRAINT "signal_entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_events"
    ADD CONSTRAINT "signal_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_hour_bucket_battle_id_option_id_gender_a_key" UNIQUE ("hour_bucket", "battle_id", "option_id", "gender", "age_bucket", "region");



ALTER TABLE ONLY "public"."signal_hourly_aggs"
    ADD CONSTRAINT "signal_hourly_aggs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signal_rollups_hourly"
    ADD CONSTRAINT "signal_rollups_hourly_pkey" PRIMARY KEY ("bucket_ts", "module_type", "battle_id", "option_id", "region", "gender", "age_bucket");



ALTER TABLE ONLY "public"."signal_types"
    ADD CONSTRAINT "signal_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."signal_types"
    ADD CONSTRAINT "signal_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_plan_name_key" UNIQUE ("plan_name");



ALTER TABLE ONLY "public"."topic_answers"
    ADD CONSTRAINT "topic_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topic_answers"
    ADD CONSTRAINT "topic_answers_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."topic_articles"
    ADD CONSTRAINT "topic_articles_pkey" PRIMARY KEY ("topic_id", "article_id");



ALTER TABLE ONLY "public"."topic_question_sets"
    ADD CONSTRAINT "topic_question_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topic_question_sets"
    ADD CONSTRAINT "topic_question_sets_topic_id_key" UNIQUE ("topic_id");



ALTER TABLE ONLY "public"."topic_questions"
    ADD CONSTRAINT "topic_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_actualidad_responses"
    ADD CONSTRAINT "user_actualidad_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_daily_metrics"
    ADD CONSTRAINT "user_daily_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_nickname_key" UNIQUE ("nickname");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_pulses"
    ADD CONSTRAINT "user_pulses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_state_logs"
    ADD CONSTRAINT "user_state_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."verification_levels"
    ADD CONSTRAINT "verification_levels_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."verification_levels"
    ADD CONSTRAINT "verification_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."volatility_snapshots"
    ADD CONSTRAINT "volatility_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_inbound_messages"
    ADD CONSTRAINT "whatsapp_inbound_messages_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "antifraud_flags_device_type_uq" ON "public"."antifraud_flags" USING "btree" ("device_hash", "flag_type");



CREATE INDEX "category_attributes_idx_category_active" ON "public"."category_attributes" USING "btree" ("category", "is_active");



CREATE UNIQUE INDEX "category_attributes_unique" ON "public"."category_attributes" USING "btree" ("category", "key");



CREATE INDEX "entities_idx_vertical_category_active" ON "public"."entities" USING "btree" ("vertical", "category", "is_active");



CREATE UNIQUE INDEX "entities_unique_category_slug" ON "public"."entities" USING "btree" ("category", "slug");



CREATE INDEX "entity_aliases_entity_id_idx" ON "public"."entity_aliases" USING "btree" ("entity_id");



CREATE INDEX "entity_aliases_normalized_alias_idx" ON "public"."entity_aliases" USING "btree" ("normalized_alias");



CREATE INDEX "entity_legacy_mappings_entity_id_idx" ON "public"."entity_legacy_mappings" USING "btree" ("entity_id");



CREATE INDEX "entity_legacy_mappings_source_table_idx" ON "public"."entity_legacy_mappings" USING "btree" ("source_table");



CREATE INDEX "entity_relationships_child_idx" ON "public"."entity_relationships" USING "btree" ("child_entity_id");



CREATE INDEX "entity_relationships_parent_idx" ON "public"."entity_relationships" USING "btree" ("parent_entity_id");



CREATE INDEX "idx_actualidad_topics_estado" ON "public"."actualidad_topics" USING "btree" ("estado");



CREATE INDEX "idx_api_key" ON "public"."api_clients" USING "btree" ("api_key");



CREATE INDEX "idx_api_usage" ON "public"."api_usage_logs" USING "btree" ("client_id", "created_at" DESC);



CREATE INDEX "idx_category_daily_agg_day" ON "public"."category_daily_aggregates" USING "btree" ("day" DESC, "category_slug");



CREATE INDEX "idx_depth_aggregates" ON "public"."depth_aggregates" USING "btree" ("battle_slug", "option_id", "question_id", "snapshot_at" DESC);



CREATE INDEX "idx_depth_aggregates_org" ON "public"."depth_aggregates" USING "btree" ("organization_id");



CREATE INDEX "idx_entities_category_tier" ON "public"."entities" USING "btree" ("type", "category", "tier");



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



CREATE INDEX "idx_rollups_hourly_bucket" ON "public"."signal_rollups_hourly" USING "btree" ("bucket_ts" DESC);



CREATE INDEX "idx_rollups_hourly_module" ON "public"."signal_rollups_hourly" USING "btree" ("module_type");



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



CREATE INDEX "idx_user_actualidad_responses_tema_id" ON "public"."user_actualidad_responses" USING "btree" ("tema_id");



CREATE INDEX "idx_user_actualidad_responses_user_id" ON "public"."user_actualidad_responses" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_daily_metrics_anon_date" ON "public"."user_daily_metrics" USING "btree" ("anon_id", "metric_date") WHERE ("anon_id" IS NOT NULL);



CREATE UNIQUE INDEX "idx_user_daily_metrics_user_date" ON "public"."user_daily_metrics" USING "btree" ("user_id", "metric_date") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_user_pulses_created_at" ON "public"."user_pulses" USING "btree" ("created_at");



CREATE INDEX "idx_user_pulses_sub_category" ON "public"."user_pulses" USING "btree" ("sub_category");



CREATE INDEX "idx_user_pulses_user_id" ON "public"."user_pulses" USING "btree" ("user_id");



CREATE INDEX "idx_volatility_history" ON "public"."volatility_snapshots" USING "btree" ("battle_slug", "snapshot_at" DESC);



CREATE UNIQUE INDEX "invitation_codes_code_uq" ON "public"."invitation_codes" USING "btree" ("upper"("code"));



CREATE UNIQUE INDEX "invitation_codes_used_by_uq" ON "public"."invitation_codes" USING "btree" ("used_by_user_id") WHERE ("used_by_user_id" IS NOT NULL);



CREATE INDEX "invite_redemptions_code_time_idx" ON "public"."invite_redemptions" USING "btree" ("invite_code_entered", "created_at" DESC);



CREATE INDEX "invite_redemptions_user_time_idx" ON "public"."invite_redemptions" USING "btree" ("user_id", "created_at" DESC);



CREATE UNIQUE INDEX "module_interest_events_client_event_id_uidx" ON "public"."module_interest_events" USING "btree" ("client_event_id");



CREATE INDEX "module_interest_events_created_at_idx" ON "public"."module_interest_events" USING "btree" ("created_at" DESC);



CREATE INDEX "module_interest_events_module_key_idx" ON "public"."module_interest_events" USING "btree" ("module_key");



CREATE UNIQUE INDEX "public_rank_snapshots_bucket_module_battle_option_seg_uq" ON "public"."public_rank_snapshots" USING "btree" ("snapshot_bucket", "module_type", "battle_id", "option_id", COALESCE("segment_hash", 'global'::"text"));



CREATE UNIQUE INDEX "signal_contexts_code_unique_idx" ON "public"."signal_contexts" USING "btree" ("code") WHERE ("code" IS NOT NULL);



CREATE INDEX "signal_contexts_context_kind_idx" ON "public"."signal_contexts" USING "btree" ("context_kind");



CREATE UNIQUE INDEX "signal_entities_canonical_code_unique_idx" ON "public"."signal_entities" USING "btree" ("canonical_code") WHERE ("canonical_code" IS NOT NULL);



CREATE INDEX "signal_entities_entity_type_id_idx" ON "public"."signal_entities" USING "btree" ("entity_type_id");



CREATE INDEX "signal_entities_normalized_name_idx" ON "public"."signal_entities" USING "btree" ("normalized_name");



CREATE INDEX "signal_entities_primary_category_idx" ON "public"."signal_entities" USING "btree" ("primary_category");



CREATE INDEX "signal_entities_primary_subcategory_idx" ON "public"."signal_entities" USING "btree" ("primary_subcategory");



CREATE UNIQUE INDEX "signal_entities_slug_unique_idx" ON "public"."signal_entities" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE INDEX "signal_events_anon_battle_time_idx" ON "public"."signal_events" USING "btree" ("anon_id", "battle_id", "created_at" DESC);



CREATE INDEX "signal_events_anon_id_idx" ON "public"."signal_events" USING "btree" ("anon_id");



CREATE UNIQUE INDEX "signal_events_client_event_id_uidx" ON "public"."signal_events" USING "btree" ("client_event_id") WHERE ("client_event_id" IS NOT NULL);



CREATE INDEX "signal_events_context_id_idx" ON "public"."signal_events" USING "btree" ("context_id");



CREATE INDEX "signal_events_device_time_idx" ON "public"."signal_events" USING "btree" ("device_hash", "created_at" DESC);



CREATE INDEX "signal_events_entity_id_idx" ON "public"."signal_events" USING "btree" ("entity_id");



CREATE INDEX "signal_events_metadata_gin_idx" ON "public"."signal_events" USING "gin" ("metadata");



CREATE INDEX "signal_events_occurred_at_idx" ON "public"."signal_events" USING "btree" ("occurred_at" DESC);



CREATE INDEX "signal_events_signal_type_id_idx" ON "public"."signal_events" USING "btree" ("signal_type_id");



CREATE INDEX "signal_events_source_module_idx" ON "public"."signal_events" USING "btree" ("source_module");



CREATE INDEX "signal_events_user_id_idx" ON "public"."signal_events" USING "btree" ("user_id");



CREATE INDEX "signal_events_value_json_gin_idx" ON "public"."signal_events" USING "gin" ("value_json");



CREATE INDEX "signal_events_verification_level_id_idx" ON "public"."signal_events" USING "btree" ("verification_level_id");



CREATE UNIQUE INDEX "user_profiles_nickname_unique_ci" ON "public"."user_profiles" USING "btree" ("lower"("nickname")) WHERE (("nickname" IS NOT NULL) AND ("nickname" <> ''::"text"));



CREATE INDEX "whatsapp_inbound_created_at_idx" ON "public"."whatsapp_inbound_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "whatsapp_inbound_from_hash_idx" ON "public"."whatsapp_inbound_messages" USING "btree" ("wa_from_hash");



CREATE INDEX "whatsapp_inbound_invite_id_idx" ON "public"."whatsapp_inbound_messages" USING "btree" ("invite_id");



CREATE OR REPLACE TRIGGER "tr_enrich_signal_event" BEFORE INSERT ON "public"."signal_events" FOR EACH ROW EXECUTE FUNCTION "public"."fn_enrich_signal_event"();



CREATE OR REPLACE TRIGGER "tr_process_elo_on_signal" AFTER INSERT ON "public"."signal_events" FOR EACH ROW EXECUTE FUNCTION "public"."fn_process_elo_on_signal"();



CREATE OR REPLACE TRIGGER "trg_count_signal_events" AFTER INSERT ON "public"."signal_events" FOR EACH ROW EXECUTE FUNCTION "public"."trg_increment_interactions_signals"();



CREATE OR REPLACE TRIGGER "trg_count_user_state_logs" AFTER INSERT ON "public"."user_state_logs" FOR EACH ROW EXECUTE FUNCTION "public"."trg_increment_interactions_state"();



CREATE OR REPLACE TRIGGER "trg_entities_set_updated_at" BEFORE UPDATE ON "public"."entities" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_entity_legacy_mappings_updated_at" BEFORE UPDATE ON "public"."entity_legacy_mappings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_signal_contexts_updated_at" BEFORE UPDATE ON "public"."signal_contexts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_signal_entities_updated_at" BEFORE UPDATE ON "public"."signal_entities" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_touch_antifraud_flags" BEFORE UPDATE ON "public"."antifraud_flags" FOR EACH ROW EXECUTE FUNCTION "public"."_touch_antifraud_flags_updated_at"();



CREATE OR REPLACE TRIGGER "trg_update_user_weight" AFTER UPDATE OF "identity_verified" ON "public"."profiles_legacy_20260223" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_weight_on_verification"();



CREATE OR REPLACE TRIGGER "trg_user_daily_metrics_updated_at" BEFORE UPDATE ON "public"."user_daily_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_daily_metrics_updated_at"();



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



ALTER TABLE ONLY "public"."entity_aliases"
    ADD CONSTRAINT "entity_aliases_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."signal_entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_daily_aggregates"
    ADD CONSTRAINT "entity_daily_aggregates_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_legacy_mappings"
    ADD CONSTRAINT "entity_legacy_mappings_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."signal_entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_rank_snapshots"
    ADD CONSTRAINT "entity_rank_snapshots_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_relationships"
    ADD CONSTRAINT "entity_relationships_child_entity_id_fkey" FOREIGN KEY ("child_entity_id") REFERENCES "public"."signal_entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_relationships"
    ADD CONSTRAINT "entity_relationships_parent_entity_id_fkey" FOREIGN KEY ("parent_entity_id") REFERENCES "public"."signal_entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."executive_reports"
    ADD CONSTRAINT "executive_reports_generated_for_fkey" FOREIGN KEY ("generated_for") REFERENCES "public"."api_clients"("id");



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invitation_codes"
    ADD CONSTRAINT "invitation_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invite_redemptions"
    ADD CONSTRAINT "invite_redemptions_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invitation_codes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."signal_entities"
    ADD CONSTRAINT "signal_entities_entity_type_id_fkey" FOREIGN KEY ("entity_type_id") REFERENCES "public"."entity_types"("id");



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



ALTER TABLE ONLY "public"."topic_answers"
    ADD CONSTRAINT "topic_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."topic_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_answers"
    ADD CONSTRAINT "topic_answers_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."current_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_answers"
    ADD CONSTRAINT "topic_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_articles"
    ADD CONSTRAINT "topic_articles_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_articles"
    ADD CONSTRAINT "topic_articles_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."current_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_question_sets"
    ADD CONSTRAINT "topic_question_sets_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."current_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_questions"
    ADD CONSTRAINT "topic_questions_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."topic_question_sets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_actualidad_responses"
    ADD CONSTRAINT "user_actualidad_responses_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "public"."actualidad_topics"("id");



ALTER TABLE ONLY "public"."user_actualidad_responses"
    ADD CONSTRAINT "user_actualidad_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_daily_metrics"
    ADD CONSTRAINT "user_daily_metrics_anon_id_fkey" FOREIGN KEY ("anon_id") REFERENCES "public"."anonymous_identities"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_daily_metrics"
    ADD CONSTRAINT "user_daily_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_pulses"
    ADD CONSTRAINT "user_pulses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



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



CREATE POLICY "Admins can read all answers" ON "public"."topic_answers" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins can view all activity" ON "public"."user_activity" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all api clients" ON "public"."api_clients" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all executive reports" ON "public"."executive_reports" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all pulses" ON "public"."user_pulses" FOR SELECT USING (("auth"."uid"() IN ( SELECT "user_pulses"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Admins can view all topics" ON "public"."current_topics" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on current_topics" ON "public"."current_topics" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on news_articles" ON "public"."news_articles" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on news_sources" ON "public"."news_sources" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on topic_articles" ON "public"."topic_articles" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on topic_question_sets" ON "public"."topic_question_sets" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins full access on topic_questions" ON "public"."topic_questions" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Algorithm versions are viewable by everyone" ON "public"."algorithm_versions" FOR SELECT USING (true);



CREATE POLICY "Allow admins to select b2b_leads" ON "public"."b2b_leads" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Allow anonymous inserts to b2b_leads" ON "public"."b2b_leads" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read active actualidad topics" ON "public"."actualidad_topics" FOR SELECT USING (("estado" = 'activo'::"text"));



CREATE POLICY "Anyone can view subscription plans" ON "public"."subscription_plans" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can read all topics" ON "public"."actualidad_topics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Published topics are public" ON "public"."current_topics" FOR SELECT TO "authenticated" USING (("status" = ANY (ARRAY['published'::"text", 'archived'::"text"])));



CREATE POLICY "Question sets are viewable by authenticated users" ON "public"."topic_question_sets" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Questions are viewable by authenticated users" ON "public"."topic_questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read own signals" ON "public"."signal_events" FOR SELECT USING (("anon_id" = "public"."get_or_create_anon_id"()));



CREATE POLICY "Read own state" ON "public"."user_state_logs" FOR SELECT USING (("anon_id" = "public"."get_or_create_anon_id"()));



CREATE POLICY "Users can insert their own actualidad responses" ON "public"."user_actualidad_responses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own answers" ON "public"."topic_answers" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own pulses" ON "public"."user_pulses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own answers" ON "public"."topic_answers" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own actualidad responses" ON "public"."user_actualidad_responses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own api clients" ON "public"."api_clients" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own executive reports" ON "public"."executive_reports" FOR SELECT USING (("generated_for" IN ( SELECT "api_clients"."id"
   FROM "public"."api_clients"
  WHERE ("api_clients"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own pulses" ON "public"."user_pulses" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."access_gate_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."actualidad_topics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_read_whatsapp_inbound" ON "public"."whatsapp_inbound_messages" FOR SELECT TO "authenticated" USING (("public"."is_admin_user"() IS TRUE));



ALTER TABLE "public"."algorithm_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."antifraud_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2b_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category_attributes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "category_attributes_read_all" ON "public"."category_attributes" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."current_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."depth_aggregates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "enterprise_can_view_depth" ON "public"."depth_aggregates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = ANY (ARRAY['admin'::"text", 'enterprise'::"text"]))))));



CREATE POLICY "enterprise_can_view_snapshots" ON "public"."ranking_snapshots_legacy_20260223" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_legacy_20260223"
  WHERE (("profiles_legacy_20260223"."id" = "auth"."uid"()) AND ("profiles_legacy_20260223"."role" = ANY (ARRAY['admin'::"text", 'enterprise'::"text"]))))));



ALTER TABLE "public"."entities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entities_read_all" ON "public"."entities" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."entity_rank_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entity_rank_snapshots_select_all" ON "public"."entity_rank_snapshots" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."executive_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitation_codes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitation_codes_no_delete" ON "public"."invitation_codes" FOR DELETE TO "authenticated", "anon" USING (false);



CREATE POLICY "invitation_codes_no_insert" ON "public"."invitation_codes" FOR INSERT TO "authenticated", "anon" WITH CHECK (false);



CREATE POLICY "invitation_codes_no_select" ON "public"."invitation_codes" FOR SELECT TO "authenticated", "anon" USING (false);



CREATE POLICY "invitation_codes_no_update" ON "public"."invitation_codes" FOR UPDATE TO "authenticated", "anon" USING (false) WITH CHECK (false);



ALTER TABLE "public"."invite_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_interest_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "no_client_read_module_interest_events" ON "public"."module_interest_events" FOR SELECT TO "authenticated", "anon" USING (false);



CREATE POLICY "no_client_write_module_interest_events" ON "public"."module_interest_events" FOR INSERT TO "authenticated", "anon" WITH CHECK (false);



CREATE POLICY "no_client_write_whatsapp_inbound" ON "public"."whatsapp_inbound_messages" TO "authenticated", "anon" USING (false) WITH CHECK (false);



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


ALTER TABLE "public"."topic_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topic_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topic_question_sets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topic_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_activity_no_write" ON "public"."user_activity" TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "user_activity_select_self" ON "public"."user_activity" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_actualidad_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_insert_self" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_profiles_select_self" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_profiles_update_self" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_pulses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_state_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_stats_no_write" ON "public"."user_stats" TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "user_stats_select_self" ON "public"."user_stats" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_self" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_select_self" ON "public"."users" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_update_self" ON "public"."users" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."whatsapp_inbound_messages" ENABLE ROW LEVEL SECURITY;




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



GRANT ALL ON FUNCTION "public"."admin_list_invites"("p_limit" integer, "p_status_filter" "text", "p_search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_list_invites"("p_limit" integer, "p_status_filter" "text", "p_search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_invites"("p_limit" integer, "p_status_filter" "text", "p_search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_modules_demand_segmented"("p_range_days" integer, "p_segment_dim" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."admin_modules_demand_segmented"("p_range_days" integer, "p_segment_dim" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."admin_modules_demand_summary"("p_range_days" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."admin_modules_demand_summary"("p_range_days" integer) TO "authenticated";



GRANT ALL ON FUNCTION "public"."admin_modules_top_filters"("p_range_days" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."admin_modules_top_filters"("p_range_days" integer) TO "authenticated";



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



GRANT ALL ON FUNCTION "public"."fn_process_elo_on_signal"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_process_elo_on_signal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_process_elo_on_signal"() TO "service_role";



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



REVOKE ALL ON FUNCTION "public"."get_depth_distribution_values"("p_option_id" "uuid", "p_context_id" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_depth_distribution_values"("p_option_id" "uuid", "p_context_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_distribution_values"("p_option_id" "uuid", "p_context_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_immediate_comparison"("p_question_id" "text", "p_segment_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_entity_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_entity_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_depth_insights"("p_entity_id" "uuid") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_hub_live_stats_24h"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_hub_live_stats_24h"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_hub_live_stats_24h"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_hub_signal_timeseries_24h"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_hub_signal_timeseries_24h"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_hub_signal_timeseries_24h"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_hub_top_now_24h"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_hub_top_now_24h"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_hub_top_now_24h"() TO "service_role";



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



REVOKE ALL ON FUNCTION "public"."get_my_activity_history"("p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_activity_history"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_activity_history"("p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_participation_summary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_participation_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_participation_summary"() TO "service_role";



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



REVOKE ALL ON FUNCTION "public"."get_session_vote_counts"("p_session_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_session_vote_counts"("p_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_session_vote_counts"("p_session_id" "uuid") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_user_ranking"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_ranking"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_ranking"() TO "service_role";



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



REVOKE ALL ON FUNCTION "public"."is_b2b_user"() FROM PUBLIC;
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



GRANT ALL ON FUNCTION "public"."normalize_entity_name"("p_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_entity_name"("p_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_entity_name"("p_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."raise_sanitized"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_context_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_context_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_context_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_depth_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_depth_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_depth_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_personal_pulse_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_personal_pulse_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_personal_pulse_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_progressive_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_progressive_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_progressive_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_raw_weight" numeric, "p_effective_weight" numeric, "p_source_module" "text", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone, "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_raw_weight" numeric, "p_effective_weight" numeric, "p_source_module" "text", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone, "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_signal_event"("p_user_id" "uuid", "p_anon_id" "text", "p_signal_type_code" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_numeric" numeric, "p_value_text" "text", "p_value_boolean" boolean, "p_value_json" "jsonb", "p_raw_weight" numeric, "p_effective_weight" numeric, "p_source_module" "text", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone, "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_versus_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_versus_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_versus_signal"("p_user_id" "uuid", "p_anon_id" "text", "p_entity_id" "uuid", "p_context_id" "uuid", "p_verification_level_code" "text", "p_value_json" "jsonb", "p_source_record_id" "text", "p_occurred_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_daily_aggregates"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_3h"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_3h"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_from_rollups"("p_window_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_from_rollups"("p_window_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_public_rank_snapshots_from_rollups"("p_window_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_battle_context"("p_battle_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_entity_id"("p_any_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rollup_signal_events_incremental"("p_max_lag_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."rollup_signal_events_incremental"("p_max_lag_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."rollup_signal_events_incremental"("p_max_lag_minutes" integer) TO "service_role";



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



GRANT ALL ON FUNCTION "public"."set_user_daily_metrics_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_daily_metrics_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_daily_metrics_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text", "p_client_event_id" "uuid", "p_device_hash" "text", "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text", "p_client_event_id" "uuid", "p_device_hash" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text", "p_client_event_id" "uuid", "p_device_hash" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_module_interest"("p_module_key" "text", "p_event_type" "text", "p_client_event_id" "uuid", "p_device_hash" "text", "p_metadata" "jsonb") TO "service_role";



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



GRANT ALL ON TABLE "public"."current_topics" TO "anon";
GRANT ALL ON TABLE "public"."current_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."current_topics" TO "service_role";



GRANT ALL ON TABLE "public"."topic_answers" TO "anon";
GRANT ALL ON TABLE "public"."topic_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_answers" TO "service_role";



GRANT ALL ON TABLE "public"."actualidad_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."actualidad_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."actualidad_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."actualidad_topics" TO "anon";
GRANT ALL ON TABLE "public"."actualidad_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."actualidad_topics" TO "service_role";



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



GRANT ALL ON TABLE "public"."b2b_leads" TO "anon";
GRANT ALL ON TABLE "public"."b2b_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_leads" TO "service_role";



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



GRANT ALL ON TABLE "public"."category_attributes" TO "anon";
GRANT ALL ON TABLE "public"."category_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."category_attributes" TO "service_role";



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



GRANT ALL ON TABLE "public"."entity_aliases" TO "anon";
GRANT ALL ON TABLE "public"."entity_aliases" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_aliases" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entity_aliases_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entity_aliases_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entity_aliases_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "anon";
GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_daily_aggregates" TO "service_role";



GRANT ALL ON TABLE "public"."entity_legacy_mappings" TO "anon";
GRANT ALL ON TABLE "public"."entity_legacy_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_legacy_mappings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entity_legacy_mappings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entity_legacy_mappings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entity_legacy_mappings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_rank_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."entity_relationships" TO "anon";
GRANT ALL ON TABLE "public"."entity_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_relationships" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entity_relationships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entity_relationships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entity_relationships_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entity_types" TO "anon";
GRANT ALL ON TABLE "public"."entity_types" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entity_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entity_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entity_types_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."module_interest_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."module_interest_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."module_interest_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."module_interest_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."news_articles" TO "anon";
GRANT ALL ON TABLE "public"."news_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."news_articles" TO "service_role";



GRANT ALL ON TABLE "public"."news_sources" TO "anon";
GRANT ALL ON TABLE "public"."news_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."news_sources" TO "service_role";



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



GRANT ALL ON TABLE "public"."rollup_state" TO "anon";
GRANT ALL ON TABLE "public"."rollup_state" TO "authenticated";
GRANT ALL ON TABLE "public"."rollup_state" TO "service_role";



GRANT ALL ON TABLE "public"."signal_contexts" TO "anon";
GRANT ALL ON TABLE "public"."signal_contexts" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_contexts" TO "service_role";



GRANT ALL ON TABLE "public"."signal_entities" TO "anon";
GRANT ALL ON TABLE "public"."signal_entities" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_entities" TO "service_role";



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



GRANT ALL ON TABLE "public"."signal_rollups_hourly" TO "anon";
GRANT ALL ON TABLE "public"."signal_rollups_hourly" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_rollups_hourly" TO "service_role";



GRANT ALL ON TABLE "public"."signal_types" TO "anon";
GRANT ALL ON TABLE "public"."signal_types" TO "authenticated";
GRANT ALL ON TABLE "public"."signal_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."signal_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."signal_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."signal_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."topic_articles" TO "anon";
GRANT ALL ON TABLE "public"."topic_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_articles" TO "service_role";



GRANT ALL ON TABLE "public"."topic_question_sets" TO "anon";
GRANT ALL ON TABLE "public"."topic_question_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_question_sets" TO "service_role";



GRANT ALL ON TABLE "public"."topic_questions" TO "anon";
GRANT ALL ON TABLE "public"."topic_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_questions" TO "service_role";



GRANT ALL ON TABLE "public"."user_actualidad_responses" TO "anon";
GRANT ALL ON TABLE "public"."user_actualidad_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_actualidad_responses" TO "service_role";



GRANT ALL ON TABLE "public"."user_daily_metrics" TO "anon";
GRANT ALL ON TABLE "public"."user_daily_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."user_daily_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."user_pulses" TO "anon";
GRANT ALL ON TABLE "public"."user_pulses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_pulses" TO "service_role";



GRANT ALL ON TABLE "public"."user_state_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_state_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_state_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_stats" TO "service_role";
GRANT SELECT ON TABLE "public"."user_stats" TO "authenticated";



GRANT ALL ON TABLE "public"."v_comparative_preference_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_comparative_preference_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_comparative_preference_summary" TO "service_role";



GRANT ALL ON TABLE "public"."v_depth_entity_question_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_depth_entity_question_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_depth_entity_question_summary" TO "service_role";



GRANT ALL ON TABLE "public"."v_signal_entity_period_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_signal_entity_period_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_signal_entity_period_summary" TO "service_role";



GRANT ALL ON TABLE "public"."v_signal_entity_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_signal_entity_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_signal_entity_summary" TO "service_role";



GRANT ALL ON TABLE "public"."v_signal_entity_type_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_signal_entity_type_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_signal_entity_type_summary" TO "service_role";



GRANT ALL ON TABLE "public"."verification_levels" TO "anon";
GRANT ALL ON TABLE "public"."verification_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_levels" TO "service_role";



GRANT ALL ON TABLE "public"."v_signal_events_enriched" TO "anon";
GRANT ALL ON TABLE "public"."v_signal_events_enriched" TO "authenticated";
GRANT ALL ON TABLE "public"."v_signal_events_enriched" TO "service_role";



GRANT ALL ON TABLE "public"."v_trend_week_over_week" TO "anon";
GRANT ALL ON TABLE "public"."v_trend_week_over_week" TO "authenticated";
GRANT ALL ON TABLE "public"."v_trend_week_over_week" TO "service_role";



GRANT ALL ON SEQUENCE "public"."verification_levels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."verification_levels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."verification_levels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."volatility_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."volatility_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."volatility_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_inbound_messages" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_inbound_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_inbound_messages" TO "service_role";









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































