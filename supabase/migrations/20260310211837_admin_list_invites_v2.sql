-- ==========================================
-- Update admin_list_invites with new KPIs and Filters
-- ==========================================

DROP FUNCTION IF EXISTS public.admin_list_invites(integer, text);
DROP FUNCTION IF EXISTS public.admin_list_invites(integer, text, text);

CREATE OR REPLACE FUNCTION public.admin_list_invites(
    p_limit int DEFAULT 200,
    p_status_filter text DEFAULT 'all', -- 'all', 'pending', 'in_use', 'abandoned', 'revoked'
    p_search_term text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  used_by_nickname text,
  created_at timestamptz,
  -- Viejos KPIs
  total_interactions bigint,
  total_time_spent_seconds bigint,
  total_sessions bigint,
  last_active_at timestamptz,
  -- WA
  whatsapp_phone text,
  whatsapp_status text,
  whatsapp_sent_at timestamptz,
  whatsapp_error text,
  whatsapp_message_id text,
  whatsapp_last_sent_at timestamptz,
  -- Nuevos KPIs
  retention_days int,
  written_feedback_count bigint,
  surveys_completed bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
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
      COALESCE(dm.sessions, 0)::bigint as total_sessions,
      
      -- Retention days: (last_active - used_at) in days. Minimun 1.
      CASE 
        WHEN u.user_id IS NULL THEN 0
        WHEN u.last_active_at IS NOT NULL AND fi.used_at IS NOT NULL THEN
            GREATEST(1, EXTRACT(DAY FROM (u.last_active_at - fi.used_at))::int + 1)
        ELSE 1
      END as retention_days,

      -- Texto escrito en signal_events
      (SELECT COUNT(*) FROM public.signal_events se WHERE se.user_id = u.user_id AND se.value_text IS NOT NULL AND btrim(se.value_text) != '') as written_feedback_count,
      
      -- Encuestas completadas (del user_activity)
      (SELECT COUNT(*) FROM public.user_activity ua WHERE ua.user_id = u.user_id AND ua.action_type = 'depth_completed') as surveys_completed

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
         bd.whatsapp_phone, bd.whatsapp_status, bd.whatsapp_sent_at, bd.whatsapp_error, bd.whatsapp_message_id, bd.whatsapp_last_sent_at,
         bd.retention_days, bd.written_feedback_count, bd.surveys_completed
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

GRANT EXECUTE ON FUNCTION public.admin_list_invites(int, text, text) TO authenticated;
