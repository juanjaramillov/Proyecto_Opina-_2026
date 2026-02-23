BEGIN;

-- 1) Tabla de flags antifraude (sin PII)
CREATE TABLE IF NOT EXISTS public.antifraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  device_hash text NOT NULL,
  flag_type text NOT NULL,         -- many_accounts | high_velocity | other
  severity text NOT NULL DEFAULT 'warn', -- info | warn | critical
  details jsonb NOT NULL DEFAULT '{}'::jsonb,

  is_active boolean NOT NULL DEFAULT true,
  banned boolean NOT NULL DEFAULT false,
  banned_at timestamptz NULL,
  banned_reason text NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS antifraud_flags_device_type_uq
  ON public.antifraud_flags (device_hash, flag_type);

ALTER TABLE public.antifraud_flags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.antifraud_flags FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.antifraud_flags TO service_role;

-- updated_at helper
CREATE OR REPLACE FUNCTION public._touch_antifraud_flags_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_antifraud_flags ON public.antifraud_flags;
CREATE TRIGGER trg_touch_antifraud_flags
BEFORE UPDATE ON public.antifraud_flags
FOR EACH ROW
EXECUTE FUNCTION public._touch_antifraud_flags_updated_at();

-- 2) Detector: device_hash con muchas cuentas (N user_id distintos en 24h)
-- Regla v1: >= 4 user_id distintos en 24h => flag many_accounts warn
CREATE OR REPLACE FUNCTION public.detect_antifraud_many_accounts(p_window interval DEFAULT interval '24 hours')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Solo considera señales con device_hash no null
  WITH x AS (
    SELECT se.device_hash, COUNT(DISTINCT se.user_id) AS users_24h
    FROM public.signal_events se
    WHERE se.device_hash IS NOT NULL
      AND se.created_at > now() - p_window
      AND se.user_id IS NOT NULL
    GROUP BY se.device_hash
    HAVING COUNT(DISTINCT se.user_id) >= 4
  )
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details)
  SELECT x.device_hash, 'many_accounts', 'warn',
         jsonb_build_object('users_24h', x.users_24h, 'window', p_window::text)
  FROM x
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET severity = EXCLUDED.severity,
        details = EXCLUDED.details,
        is_active = true;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_antifraud_many_accounts(interval) FROM anon;
GRANT EXECUTE ON FUNCTION public.detect_antifraud_many_accounts(interval) TO authenticated;

-- 3) Detector: high velocity (demasiadas señales en 10 min)
-- Regla v1: >= 60 señales en 10 min por device_hash => critical
CREATE OR REPLACE FUNCTION public.detect_antifraud_high_velocity(p_window interval DEFAULT interval '10 minutes')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  WITH x AS (
    SELECT se.device_hash, COUNT(*) AS signals_window
    FROM public.signal_events se
    WHERE se.device_hash IS NOT NULL
      AND se.created_at > now() - p_window
    GROUP BY se.device_hash
    HAVING COUNT(*) >= 60
  )
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details)
  SELECT x.device_hash, 'high_velocity', 'critical',
         jsonb_build_object('signals_window', x.signals_window, 'window', p_window::text)
  FROM x
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET severity = EXCLUDED.severity,
        details = EXCLUDED.details,
        is_active = true;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_antifraud_high_velocity(interval) FROM anon;
GRANT EXECUTE ON FUNCTION public.detect_antifraud_high_velocity(interval) TO authenticated;

-- 4) Cron: correr detección cada 3 horas (aprovecha pg_cron ya habilitado)
DO $$
DECLARE
  jid int;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'detect_antifraud_flags_3h';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;

  PERFORM cron.schedule(
    'detect_antifraud_flags_3h',
    '15 */3 * * *',
    $sql$SELECT public.detect_antifraud_many_accounts(); SELECT public.detect_antifraud_high_velocity();$sql$
  );
END $$;

-- 5) Admin RPCs
-- List flags
CREATE OR REPLACE FUNCTION public.admin_list_antifraud_flags(p_limit int DEFAULT 200)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  device_hash text,
  flag_type text,
  severity text,
  is_active boolean,
  banned boolean,
  banned_at timestamptz,
  banned_reason text,
  details jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT f.id, f.created_at, f.updated_at, f.device_hash, f.flag_type, f.severity, f.is_active, f.banned, f.banned_at, f.banned_reason, f.details
  FROM public.antifraud_flags f
  WHERE public.is_admin_user() = true
  ORDER BY f.updated_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

REVOKE ALL ON FUNCTION public.admin_list_antifraud_flags(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_antifraud_flags(int) TO authenticated;

-- Ban / Unban device (solo admin)
CREATE OR REPLACE FUNCTION public.admin_set_device_ban(p_device_hash text, p_banned boolean, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash text := trim(p_device_hash);
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_hash IS NULL OR length(v_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE_HASH');
  END IF;

  -- Upsert general ban record
  INSERT INTO public.antifraud_flags (device_hash, flag_type, severity, details, banned, banned_at, banned_reason, is_active)
  VALUES (v_hash, 'manual_ban', 'critical', '{}'::jsonb, p_banned, CASE WHEN p_banned THEN now() ELSE NULL END, p_reason, true)
  ON CONFLICT (device_hash, flag_type) DO UPDATE
    SET banned = EXCLUDED.banned,
        banned_at = EXCLUDED.banned_at,
        banned_reason = EXCLUDED.banned_reason,
        is_active = true;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_device_ban(text, boolean, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_device_ban(text, boolean, text) TO authenticated;

COMMIT;
