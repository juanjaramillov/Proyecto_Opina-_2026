BEGIN;

-- 1) Vista de analíticas (excluye device_hash baneado)
CREATE OR REPLACE VIEW public.signal_events_analytics AS
SELECT se.*
FROM public.signal_events se
WHERE
  -- si no hay device_hash, no se excluye
  se.device_hash IS NULL
  OR NOT EXISTS (
    SELECT 1
    FROM public.antifraud_flags f
    WHERE f.device_hash = se.device_hash
      AND f.banned = true
      AND f.is_active = true
  );

-- 2) Re-crear refresh_public_rank_snapshots_3h() usando la vista
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
BEGIN
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h'));
  IF v_lock IS NOT TRUE THEN
    RETURN;
  END IF;

  DELETE FROM public.public_rank_snapshots
  WHERE snapshot_bucket = v_bucket;

  FOREACH v_module IN ARRAY ARRAY['versus','progressive'] LOOP

    -- GLOBAL
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
    FROM public.signal_events_analytics se
    WHERE se.module_type = v_module
      AND se.battle_id IS NOT NULL
      AND se.option_id IS NOT NULL
    GROUP BY se.battle_id, se.option_id;

    -- gender
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
    FROM public.signal_events_analytics se
    JOIN public.user_profiles up ON up.user_id = se.user_id
    WHERE se.module_type = v_module
      AND se.user_id IS NOT NULL
      AND se.battle_id IS NOT NULL
      AND se.option_id IS NOT NULL
    GROUP BY se.battle_id, se.option_id, up.gender;

    -- region
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
    FROM public.signal_events_analytics se
    JOIN public.user_profiles up ON up.user_id = se.user_id
    WHERE se.module_type = v_module
      AND se.user_id IS NOT NULL
      AND se.battle_id IS NOT NULL
      AND se.option_id IS NOT NULL
    GROUP BY se.battle_id, se.option_id, up.region;

    -- gender+region
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
    FROM public.signal_events_analytics se
    JOIN public.user_profiles up ON up.user_id = se.user_id
    WHERE se.module_type = v_module
      AND se.user_id IS NOT NULL
      AND se.battle_id IS NOT NULL
      AND se.option_id IS NOT NULL
    GROUP BY se.battle_id, se.option_id, up.gender, up.region;

  END LOOP;

  PERFORM pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h'));
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_public_rank_snapshots_3h() FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_public_rank_snapshots_3h() TO authenticated;

COMMIT;
