BEGIN;

CREATE OR REPLACE FUNCTION public.antifraud_auto_decay()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1) many_accounts: desactivar si no hay señales del device en 7 días
  UPDATE public.antifraud_flags f
  SET is_active = false
  WHERE f.is_active = true
    AND f.banned = false
    AND f.flag_type = 'many_accounts'
    AND NOT EXISTS (
      SELECT 1
      FROM public.signal_events se
      WHERE se.device_hash = f.device_hash
        AND se.created_at > now() - interval '7 days'
      LIMIT 1
    );

  -- 2) high_velocity: desactivar si no hay señales del device en 48 horas
  UPDATE public.antifraud_flags f
  SET is_active = false
  WHERE f.is_active = true
    AND f.banned = false
    AND f.flag_type = 'high_velocity'
    AND NOT EXISTS (
      SELECT 1
      FROM public.signal_events se
      WHERE se.device_hash = f.device_hash
        AND se.created_at > now() - interval '48 hours'
      LIMIT 1
    );

  -- 3) manual_ban: nunca auto-desactivar (no hacer nada)
END;
$$;

REVOKE ALL ON FUNCTION public.antifraud_auto_decay() FROM anon;
GRANT EXECUTE ON FUNCTION public.antifraud_auto_decay() TO authenticated;

-- Cron diario 03:30
DO $$
DECLARE
  jid int;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'antifraud_auto_decay_daily';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;

  PERFORM cron.schedule(
    'antifraud_auto_decay_daily',
    '30 3 * * *',
    'SELECT public.antifraud_auto_decay()'
  );
END $$;

COMMIT;
