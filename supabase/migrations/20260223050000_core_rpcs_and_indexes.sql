-- =========================================================
-- FIX 01 — Core RPCs + Indexes (required by frontend)
-- =========================================================
BEGIN;

-- ---------------------------------------------------------
-- 1) Indexes críticos para signal_events (performance real)
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_signal_events_created_at
  ON public.signal_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signal_events_battle_option_time
  ON public.signal_events(battle_id, option_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signal_events_module_context
  ON public.signal_events(module_type, context_id);

CREATE INDEX IF NOT EXISTS idx_signal_events_segment
  ON public.signal_events(gender, age_bucket, region);

-- ---------------------------------------------------------
-- 2) RPC: resolve_battle_context (Experience / Versus)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_battle_context(p_battle_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- ---------------------------------------------------------
-- 3) RPC: get_live_platform_stats (Home)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 4) RPC: get_recent_signal_activity (Home hero counter)
-- ---------------------------------------------------------
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
    count(*) FILTER (WHERE user_tier IS NOT NULL AND user_tier != 'guest'),
    count(DISTINCT anon_id)
  FROM public.signal_events
  WHERE created_at > now() - interval '3 hours';
END;
$$;

-- ---------------------------------------------------------
-- 5) RPC: get_trending_feed_grouped (compat)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_trending_feed_grouped()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- ---------------------------------------------------------
-- 6) KPI faltante: kpi_engagement_quality (Results)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.kpi_engagement_quality(
  p_battle_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  total_signals bigint,
  weighted_total numeric,
  verified_share_pct numeric,
  avg_profile_completeness numeric
)
LANGUAGE sql
SECURITY DEFINER
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

-- ---------------------------------------------------------
-- 7) Grants mínimos para que el frontend funcione
-- (anon necesita leer Home stats; authenticated necesita el resto)
-- ---------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_live_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_signal_activity() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_feed_grouped() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_battle_context(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kpi_engagement_quality(uuid, timestamptz, timestamptz) TO authenticated;

COMMIT;
