BEGIN;

ALTER TABLE public.public_rank_snapshots
  ADD COLUMN IF NOT EXISTS module_type text NOT NULL DEFAULT 'versus';

-- Reemplazar índice único anterior por uno que incluya module_type
DROP INDEX IF EXISTS public_rank_snapshots_bucket_battle_option_seg_uq;

CREATE UNIQUE INDEX IF NOT EXISTS public_rank_snapshots_bucket_module_battle_option_seg_uq
  ON public.public_rank_snapshots (snapshot_bucket, module_type, battle_id, option_id, COALESCE(segment_hash,'global'));

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
    FROM public.signal_events se
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
    FROM public.signal_events se
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
    FROM public.signal_events se
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
    FROM public.signal_events se
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
