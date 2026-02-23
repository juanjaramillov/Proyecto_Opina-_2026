BEGIN;

-- 0) Extensión pg_cron (Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Adaptación: La tabla public_rank_snapshots requiere agregar columnas de la especificación mínima
ALTER TABLE public.public_rank_snapshots
  ADD COLUMN IF NOT EXISTS snapshot_bucket timestamptz,
  ADD COLUMN IF NOT EXISTS battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS option_id uuid REFERENCES public.battle_options(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signals_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS segment jsonb DEFAULT '{}'::jsonb;

-- Índice para control de unique por snapshot_bucket
CREATE UNIQUE INDEX IF NOT EXISTS idx_rank_snapshots_bucket 
  ON public.public_rank_snapshots(snapshot_bucket, battle_id, option_id);

-- 1) Función refresh (idempotente por bucket y con lock para evitar concurrencia)
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
  -- bucket estable cada 3 horas (ej: 00:00, 03:00, 06:00...)
  v_bucket := date_trunc('hour', now()) - (extract(hour from now())::int % 3) * interval '1 hour';

  -- lock para evitar doble ejecución simultánea
  v_lock := pg_try_advisory_lock(hashtext('refresh_public_rank_snapshots_3h'));
  IF v_lock IS NOT TRUE THEN
    RETURN;
  END IF;

  -- 2) Borrar bucket existente (rebuild limpio)
  DELETE FROM public.public_rank_snapshots
  WHERE snapshot_bucket = v_bucket;

  -- 3) Insert snapshot GLOBAL (sin segmentación aún)
  INSERT INTO public.public_rank_snapshots (
    snapshot_bucket,
    battle_id,
    option_id,
    score,
    signals_count,
    segment
  )
  SELECT
    v_bucket as snapshot_bucket,
    se.battle_id,
    se.option_id,
    COALESCE(SUM(se.signal_weight), 0)::numeric as score,
    COUNT(*)::int as signals_count,
    '{}'::jsonb as segment
  FROM public.signal_events se
  WHERE se.module_type IN ('versus','progressive')
    AND se.battle_id IS NOT NULL
    AND se.option_id IS NOT NULL
  GROUP BY se.battle_id, se.option_id;

  PERFORM pg_advisory_unlock(hashtext('refresh_public_rank_snapshots_3h'));
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_public_rank_snapshots_3h() FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_public_rank_snapshots_3h() TO authenticated;

-- 4) Programar cada 3 horas (cron)
DO $$
DECLARE
  jid int;
BEGIN
  -- desprogramar si existe (por jobname)
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'refresh_rank_snapshots_3h';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;

  -- cada 3 horas al minuto 0
  PERFORM cron.schedule(
    'refresh_rank_snapshots_3h',
    '0 */3 * * *',
    $$SELECT public.refresh_public_rank_snapshots_3h();$$
  );
END $$;

COMMIT;
