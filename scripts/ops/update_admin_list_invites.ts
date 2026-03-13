import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
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
  -- Viejos KPIs (los mantenemos por si acaso o para no romper interfaces de golpe)
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
      -- Búsqueda por término (código o alias)
      (p_search_term = '' OR ic.code ILIKE '%' || p_search_term || '%' OR COALESCE(ic.assigned_alias, '') ILIKE '%' || p_search_term || '%')
  ),
  -- Join principal con usuarios y métricas
  base_data AS (
    SELECT 
      fi.id, fi.code, fi.assigned_alias, fi.status, fi.expires_at, fi.used_at, fi.used_by_user_id,
      fi.created_at,
      fi.whatsapp_phone, fi.whatsapp_status, fi.whatsapp_sent_at, fi.whatsapp_error, fi.whatsapp_message_id, fi.whatsapp_last_sent_at,
      up.nickname as used_by_nickname,
      u.last_active_at,
      COALESCE(u.total_interactions, 0)::bigint as total_interactions,
      COALESCE(u.total_time_spent_seconds, 0)::bigint as total_time_spent_seconds,
      COALESCE(u.total_sessions, 0)::bigint as total_sessions,
      
      -- Retention days: (last_active - used_at) en días
      CASE 
        WHEN u.user_id IS NULL THEN 0
        WHEN u.last_active_at IS NOT NULL AND fi.used_at IS NOT NULL THEN
            GREATEST(1, EXTRACT(DAY FROM (u.last_active_at - fi.used_at))::int + 1)
        ELSE 1
      END as retention_days,

      -- Texto escrito en signal_events
      (SELECT COUNT(*) FROM public.signal_events se WHERE se.user_id = u.user_id AND se.value_text IS NOT NULL AND se.value_text != '')::bigint as written_feedback_count,
      
      -- Encuestas completadas (del user_activity)
      (SELECT COUNT(*) FROM public.user_activity ua WHERE ua.user_id = u.user_id AND ua.action_type = 'depth_completed')::bigint as surveys_completed

    FROM filtered_invites fi
    LEFT JOIN public.users u ON fi.used_by_user_id = u.user_id
    LEFT JOIN public.user_profiles up ON fi.used_by_user_id = up.user_id
  )
  SELECT * FROM base_data bd
  WHERE
    (p_status_filter = 'all')
    OR (p_status_filter = 'pending' AND bd.status = 'active' AND bd.used_at IS NULL)
    OR (p_status_filter = 'in_use' AND bd.used_at IS NOT NULL AND (bd.last_active_at IS NULL OR bd.last_active_at >= now() - interval '3 days'))
    OR (p_status_filter = 'abandoned' AND bd.used_at IS NOT NULL AND bd.last_active_at < now() - interval '3 days')
    OR (p_status_filter = 'revoked' AND bd.status != 'active' AND bd.used_at IS NULL)
  ORDER BY bd.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_invites(int, text, text) TO authenticated;
`;

// There is no easy way to send arbitrary SQL through supabase-js v2 unless it's a function.
// Oh wait, since this is a local project, we can just save it to a migration file and use npx supabase db push or npx supabase migration up, 
// OR just execute via psql.
console.log(sql);
