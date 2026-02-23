BEGIN;

-- 1) app_config simple (solo server-side)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.app_config FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_config TO service_role;

-- default
INSERT INTO public.app_config(key, value)
VALUES ('analytics_mode', 'all')
ON CONFLICT (key) DO NOTHING;

-- 2) Vistas
-- all: excluye solo baneados (igual que tu signal_events_analytics actual)
CREATE OR REPLACE VIEW public.signal_events_analytics_all AS
SELECT se.*
FROM public.signal_events se
WHERE
  se.device_hash IS NULL
  OR NOT EXISTS (
    SELECT 1
    FROM public.antifraud_flags f
    WHERE f.device_hash = se.device_hash
      AND f.banned = true
      AND f.is_active = true
  );

-- clean: excluye baneados + critical activos (aunque no baneados)
CREATE OR REPLACE VIEW public.signal_events_analytics_clean AS
SELECT se.*
FROM public.signal_events se
WHERE
  (
    se.device_hash IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM public.antifraud_flags f
      WHERE f.device_hash = se.device_hash
        AND f.banned = true
        AND f.is_active = true
    )
  )
  AND
  (
    se.device_hash IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM public.antifraud_flags f
      WHERE f.device_hash = se.device_hash
        AND f.is_active = true
        AND f.banned = false
        AND lower(f.severity) = 'critical'
        AND f.flag_type <> 'manual_ban'
    )
  );

-- helper: get analytics mode
CREATE OR REPLACE FUNCTION public.get_analytics_mode()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE((SELECT value FROM public.app_config WHERE key='analytics_mode' LIMIT 1), 'all');
$$;

REVOKE ALL ON FUNCTION public.get_analytics_mode() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_analytics_mode() TO authenticated;

-- 3) Actualizar refresh_public_rank_snapshots_3h()
CREATE OR REPLACE FUNCTION public.refresh_public_rank_snapshots_3h()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

REVOKE ALL ON FUNCTION public.refresh_public_rank_snapshots_3h() FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_public_rank_snapshots_3h() TO authenticated;

COMMIT;
