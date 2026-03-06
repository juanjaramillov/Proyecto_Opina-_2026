-- =====================================================
-- AGREGAR CAMPOS PARA WHATSAPP EN INVITATION_CODES
-- =====================================================

BEGIN;

-- 1. Agregar campos a la tabla invitation_codes
ALTER TABLE public.invitation_codes
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS whatsapp_error TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_last_sent_at TIMESTAMPTZ;

-- 2. Actualizar la función admin_list_invites para incluir los nuevos campos
DROP FUNCTION IF EXISTS public.admin_list_invites(integer, text);

CREATE OR REPLACE FUNCTION public.admin_list_invites(
    p_limit int DEFAULT 200,
    p_timeframe text DEFAULT 'total' -- 'total', 'today', 'yesterday', '7d', '30d'
)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz,
  total_interactions bigint,
  total_time_spent_seconds bigint,
  total_sessions bigint,
  last_active_at timestamptz,
  whatsapp_phone text,
  whatsapp_status text,
  whatsapp_sent_at timestamptz,
  whatsapp_error text,
  whatsapp_message_id text,
  whatsapp_last_sent_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_date_threshold date;
  v_end_date date;
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN;
  END IF;

  -- Determinar el rango de fechas basado en the timeframe
  IF p_timeframe = 'today' THEN
    v_date_threshold := CURRENT_DATE;
    v_end_date := CURRENT_DATE;
  ELSIF p_timeframe = 'yesterday' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '1 day';
    v_end_date := CURRENT_DATE - INTERVAL '1 day';
  ELSIF p_timeframe = '7d' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '6 days';
    v_end_date := CURRENT_DATE;
  ELSIF p_timeframe = '30d' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '29 days';
    v_end_date := CURRENT_DATE;
  ELSE
    -- 'total'
    RETURN QUERY
    SELECT 
      ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at,
      u.total_interactions, u.total_time_spent_seconds, u.total_sessions, u.last_active_at,
      ic.whatsapp_phone, ic.whatsapp_status, ic.whatsapp_sent_at, ic.whatsapp_error, ic.whatsapp_message_id, ic.whatsapp_last_sent_at
    FROM public.invitation_codes ic
    LEFT JOIN public.users u ON ic.used_by_user_id = u.user_id
    ORDER BY ic.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
    RETURN;
  END IF;

  -- Si es un timeframe específico
  RETURN QUERY
  SELECT 
    ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at,
    COALESCE(dm.interactions, 0)::bigint as total_interactions,
    COALESCE(dm.time_spent_seconds, 0)::bigint as total_time_spent_seconds,
    COALESCE(dm.sessions, 0)::bigint as total_sessions,
    u.last_active_at,
    ic.whatsapp_phone, ic.whatsapp_status, ic.whatsapp_sent_at, ic.whatsapp_error, ic.whatsapp_message_id, ic.whatsapp_last_sent_at
  FROM public.invitation_codes ic
  LEFT JOIN public.users u ON ic.used_by_user_id = u.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      SUM(interactions) as interactions,
      SUM(time_spent_seconds) as time_spent_seconds,
      SUM(sessions) as sessions
    FROM public.user_daily_metrics
    WHERE metric_date >= v_date_threshold AND metric_date <= v_end_date
    GROUP BY user_id
  ) dm ON ic.used_by_user_id = dm.user_id
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_invites(int, text) TO authenticated;

COMMIT;
