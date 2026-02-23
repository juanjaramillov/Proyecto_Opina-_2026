BEGIN;

-- 0) Asegurar columnas en snapshots
-- Nota: La tabla public_rank_snapshots en la baseline ya tiene segment_hash, pero nos aseguramos.
ALTER TABLE public.public_rank_snapshots
  ADD COLUMN IF NOT EXISTS segment_hash text,
  ADD COLUMN IF NOT EXISTS segment jsonb;

-- 1) Índice único recomendado (bucket + battle + option + segment_hash)
-- Eliminamos el anterior si existe para evitar conflictos de nombres o definiciones.
DROP INDEX IF EXISTS public.idx_rank_snapshots_bucket;

CREATE UNIQUE INDEX IF NOT EXISTS public_rank_snapshots_bucket_battle_option_seg_uq
  ON public.public_rank_snapshots (snapshot_bucket, battle_id, option_id, COALESCE(segment_hash,'global'));

-- 2) Refresh function: GLOBAL + segmentado (gender, region, gender+region)
CREATE OR REPLACE FUNCTION public.refresh_public_rank_snapshots_3h()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_bucket timestamptz;
  v_lock boolean;
BEGIN
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h'));
  IF v_lock IS NOT TRUE THEN
    RETURN;
  END IF;

  -- Rebuild bucket completo
  DELETE FROM public.public_rank_snapshots
  WHERE snapshot_bucket = v_bucket;

  -- A) GLOBAL
  INSERT INTO public.public_rank_snapshots (
    snapshot_bucket, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  SELECT
    v_bucket,
    se.battle_id,
    se.option_id,
    COALESCE(SUM(se.signal_weight), 0)::numeric as score,
    COUNT(*)::int as signals_count,
    '{}'::jsonb as segment,
    'global' as segment_hash
  FROM public.signal_events se
  WHERE se.module_type IN ('versus','progressive')
    AND se.battle_id IS NOT NULL
    AND se.option_id IS NOT NULL
  GROUP BY se.battle_id, se.option_id;

  -- B) SEGMENTADO (join a user_profiles por user_id)
  -- Nota: solo cuenta señales con user_id presente.
  INSERT INTO public.public_rank_snapshots (
    snapshot_bucket, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  SELECT
    v_bucket,
    se.battle_id,
    se.option_id,
    COALESCE(SUM(se.signal_weight), 0)::numeric as score,
    COUNT(*)::int as signals_count,
    jsonb_build_object('gender', up.gender) as segment,
    'gender:' || COALESCE(up.gender,'unknown') as segment_hash
  FROM public.signal_events se
  JOIN public.user_profiles up ON up.user_id = se.user_id
  WHERE se.module_type IN ('versus','progressive')
    AND se.user_id IS NOT NULL
    AND se.battle_id IS NOT NULL
    AND se.option_id IS NOT NULL
  GROUP BY se.battle_id, se.option_id, up.gender;

  INSERT INTO public.public_rank_snapshots (
    snapshot_bucket, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  SELECT
    v_bucket,
    se.battle_id,
    se.option_id,
    COALESCE(SUM(se.signal_weight), 0)::numeric as score,
    COUNT(*)::int as signals_count,
    jsonb_build_object('region', up.region) as segment,
    'region:' || COALESCE(up.region,'unknown') as segment_hash
  FROM public.signal_events se
  JOIN public.user_profiles up ON up.user_id = se.user_id
  WHERE se.module_type IN ('versus','progressive')
    AND se.user_id IS NOT NULL
    AND se.battle_id IS NOT NULL
    AND se.option_id IS NOT NULL
  GROUP BY se.battle_id, se.option_id, up.region;

  INSERT INTO public.public_rank_snapshots (
    snapshot_bucket, battle_id, option_id, score, signals_count, segment, segment_hash
  )
  SELECT
    v_bucket,
    se.battle_id,
    se.option_id,
    COALESCE(SUM(se.signal_weight), 0)::numeric as score,
    COUNT(*)::int as signals_count,
    jsonb_build_object('gender', up.gender, 'region', up.region) as segment,
    'gender:' || COALESCE(up.gender,'unknown') || '|region:' || COALESCE(up.region,'unknown') as segment_hash
  FROM public.signal_events se
  JOIN public.user_profiles up ON up.user_id = se.user_id
  WHERE se.module_type IN ('versus','progressive')
    AND se.user_id IS NOT NULL
    AND se.battle_id IS NOT NULL
    AND se.option_id IS NOT NULL
  GROUP BY se.battle_id, se.option_id, up.gender, up.region;

  PERFORM pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h'));
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_public_rank_snapshots_3h() FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_public_rank_snapshots_3h() TO authenticated;

COMMIT;
