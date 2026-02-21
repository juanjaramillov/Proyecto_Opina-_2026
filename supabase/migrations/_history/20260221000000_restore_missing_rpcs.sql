-- Migration: RESTORE MISSION CRITICAL RPCS AND FIX PROFILE FIELDS
-- Date: 2026-02-21
-- Description: Restores KPIs and feed RPCs broken during signals unification, and ensures profile columns are present.

BEGIN;

-- 1. Ensure Profile columns exist (Idempotent)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_system text,
ADD COLUMN IF NOT EXISTS clinical_attention_12m boolean,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- 2. Restore get_live_platform_stats
CREATE OR REPLACE FUNCTION public.get_live_platform_stats()
RETURNS TABLE (
  signals_24h bigint,
  trending_title text,
  active_region text,
  active_users bigint,
  captured_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM public.signal_events WHERE created_at > now() - interval '24 hours'),
    (SELECT b.title FROM public.battles b JOIN public.signal_events se ON se.battle_id = b.id GROUP BY b.title ORDER BY count(*) DESC LIMIT 1),
    (SELECT region FROM public.signal_events WHERE region IS NOT NULL GROUP BY region ORDER BY count(*) DESC LIMIT 1),
    (SELECT count(DISTINCT anon_id) FROM public.signal_events WHERE created_at > now() - interval '24 hours'),
    now();
END;
$$;

-- 3. Restore get_recent_signal_activity
CREATE OR REPLACE FUNCTION public.get_recent_signal_activity()
RETURNS TABLE (
  signals_last_3h bigint,
  verified_signals_last_3h bigint,
  unique_users_last_3h bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    count(*),
    count(*) FILTER (WHERE user_tier != 'guest'),
    count(DISTINCT anon_id)
  FROM public.signal_events
  WHERE created_at > now() - interval '3 hours';
END;
$$;

-- 4. Restore get_trending_feed_grouped
CREATE OR REPLACE FUNCTION public.get_trending_feed_grouped()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO v_result
  FROM (
    SELECT 
      b.id,
      b.title,
      b.category,
      count(se.id) as total_votes,
      max(se.created_at) as last_vote_at
    FROM public.battles b
    JOIN public.signal_events se ON se.battle_id = b.id
    WHERE se.created_at > now() - interval '7 days'
    GROUP BY b.id, b.title, b.category
    ORDER BY total_votes DESC
    LIMIT 10
  ) t;
  
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

COMMIT;
