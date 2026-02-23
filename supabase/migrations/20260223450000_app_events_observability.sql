BEGIN;

-- 1) Tabla app_events (sin PII)
CREATE TABLE IF NOT EXISTS public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  anon_id text NULL,
  event_name text NOT NULL,         -- ej: 'auth_bootstrap_failed', 'signal_emit_error', 'page_view'
  severity text NOT NULL DEFAULT 'info', -- info | warn | error
  context jsonb NOT NULL DEFAULT '{}'::jsonb, -- payload pequeño, sin PII
  client_event_id uuid NULL,        -- para correlación con outbox / signal_events.client_event_id
  app_version text NULL,
  user_agent text NULL
);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.app_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_events TO service_role;

-- 2) RPC: log_app_event (authenticated)
CREATE OR REPLACE FUNCTION public.log_app_event(
  p_event_name text,
  p_severity text DEFAULT 'info',
  p_context jsonb DEFAULT '{}'::jsonb,
  p_client_event_id uuid DEFAULT NULL,
  p_app_version text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon text;
  v_sev text := lower(coalesce(p_severity,'info'));
BEGIN
  IF v_sev NOT IN ('info','warn','error') THEN
    v_sev := 'info';
  END IF;

  -- anon_id solo si existe helper
  BEGIN
    v_anon := public.get_or_create_anon_id();
  EXCEPTION WHEN OTHERS THEN
    v_anon := NULL;
  END;

  INSERT INTO public.app_events (user_id, anon_id, event_name, severity, context, client_event_id, app_version, user_agent)
  VALUES (v_uid, v_anon, left(coalesce(p_event_name,'unknown'), 80), v_sev, coalesce(p_context,'{}'::jsonb), p_client_event_id, p_app_version, p_user_agent);
END;
$$;

REVOKE ALL ON FUNCTION public.log_app_event(text, text, jsonb, uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_app_event(text, text, jsonb, uuid, text, text) TO authenticated;

-- 3) Admin list (usa public.is_admin_user() ya existente)
CREATE OR REPLACE FUNCTION public.admin_list_app_events(p_limit int DEFAULT 200)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  event_name text,
  severity text,
  user_id uuid,
  anon_id text,
  client_event_id uuid,
  app_version text,
  context jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT e.id, e.created_at, e.event_name, e.severity, e.user_id, e.anon_id, e.client_event_id, e.app_version, e.context
  FROM public.app_events e
  WHERE public.is_admin_user() = true
  ORDER BY e.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
$$;

REVOKE ALL ON FUNCTION public.admin_list_app_events(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_app_events(int) TO authenticated;

COMMIT;
