BEGIN;

-- Admin read
CREATE OR REPLACE FUNCTION public.admin_get_analytics_mode()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN 'UNAUTHORIZED_ADMIN';
  END IF;

  RETURN public.get_analytics_mode();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_analytics_mode() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_analytics_mode() TO authenticated;

-- Admin write
CREATE OR REPLACE FUNCTION public.admin_set_analytics_mode(p_mode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_mode text := lower(trim(p_mode));
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ADMIN');
  END IF;

  IF v_mode NOT IN ('all','clean') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_MODE');
  END IF;

  INSERT INTO public.app_config(key, value, updated_at)
  VALUES ('analytics_mode', v_mode, now())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;

  RETURN jsonb_build_object('ok', true, 'mode', v_mode);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_analytics_mode(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_analytics_mode(text) TO authenticated;

COMMIT;
