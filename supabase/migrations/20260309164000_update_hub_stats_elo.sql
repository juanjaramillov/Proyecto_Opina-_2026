-- =========================================================
-- Fix get_hub_live_stats_24h to include ELO & AI metrics
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_hub_live_stats_24h()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
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
