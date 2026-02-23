BEGIN;

-- Retorna métricas útiles para decidir ban/unban
CREATE OR REPLACE FUNCTION public.admin_get_device_summary(p_device_hash text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash text := trim(p_device_hash);
  v_last_signal timestamptz;
  v_signals_24h int;
  v_signals_10m int;
  v_distinct_users_24h int;
  v_distinct_battles_24h int;
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_hash IS NULL OR length(v_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE_HASH');
  END IF;

  SELECT MAX(se.created_at) INTO v_last_signal
  FROM public.signal_events se
  WHERE se.device_hash = v_hash;

  SELECT COUNT(*)::int INTO v_signals_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.created_at > now() - interval '24 hours';

  SELECT COUNT(*)::int INTO v_signals_10m
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.created_at > now() - interval '10 minutes';

  SELECT COUNT(DISTINCT se.user_id)::int INTO v_distinct_users_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.user_id IS NOT NULL
    AND se.created_at > now() - interval '24 hours';

  SELECT COUNT(DISTINCT se.battle_id)::int INTO v_distinct_battles_24h
  FROM public.signal_events se
  WHERE se.device_hash = v_hash
    AND se.battle_id IS NOT NULL
    AND se.created_at > now() - interval '24 hours';

  RETURN jsonb_build_object(
    'ok', true,
    'device_hash', v_hash,
    'last_signal_at', v_last_signal,
    'signals_24h', COALESCE(v_signals_24h, 0),
    'signals_10m', COALESCE(v_signals_10m, 0),
    'distinct_users_24h', COALESCE(v_distinct_users_24h, 0),
    'distinct_battles_24h', COALESCE(v_distinct_battles_24h, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_device_summary(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_device_summary(text) TO authenticated;

COMMIT;
