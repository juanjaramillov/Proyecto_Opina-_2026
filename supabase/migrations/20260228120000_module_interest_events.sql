-- DG-B02: Separate module interest telemetry from signal_events

BEGIN;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.module_interest_events (
  id                bigserial PRIMARY KEY,
  created_at        timestamptz NOT NULL DEFAULT now(),

  -- Who (optional)
  user_id           uuid NULL,
  anon_id           uuid NULL,
  device_hash       text NULL,

  -- What
  module_key        text NOT NULL,
  event_type        text NOT NULL DEFAULT 'open',

  -- Idempotency (client-side)
  client_event_id   uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Optional context
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS module_interest_events_client_event_id_uidx
  ON public.module_interest_events (client_event_id);

CREATE INDEX IF NOT EXISTS module_interest_events_created_at_idx
  ON public.module_interest_events (created_at DESC);

CREATE INDEX IF NOT EXISTS module_interest_events_module_key_idx
  ON public.module_interest_events (module_key);

-- 2) Lock down table access (force RPC path)
REVOKE ALL ON TABLE public.module_interest_events FROM anon, authenticated;
GRANT SELECT ON TABLE public.module_interest_events TO service_role;

ALTER TABLE public.module_interest_events ENABLE ROW LEVEL SECURITY;

-- No direct client writes/reads
DROP POLICY IF EXISTS "no_client_read_module_interest_events" ON public.module_interest_events;
CREATE POLICY "no_client_read_module_interest_events"
ON public.module_interest_events
FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "no_client_write_module_interest_events" ON public.module_interest_events;
CREATE POLICY "no_client_write_module_interest_events"
ON public.module_interest_events
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 3) RPC to track interest (allowed to anon/authenticated)
CREATE OR REPLACE FUNCTION public.track_module_interest(
  p_module_key text,
  p_event_type text DEFAULT 'open',
  p_client_event_id uuid DEFAULT gen_random_uuid(),
  p_device_hash text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_anon_id uuid;
BEGIN
  v_user_id := auth.uid();

  -- If you already have a helper function, prefer it:
  -- v_anon_id := public.get_or_create_anon_id(p_device_hash);
  -- If not, keep anon_id NULL (still valuable for telemetry).
  BEGIN
    v_anon_id := public.get_or_create_anon_id(p_device_hash);
  EXCEPTION WHEN undefined_function THEN
    v_anon_id := NULL;
  END;

  INSERT INTO public.module_interest_events (
    user_id,
    anon_id,
    device_hash,
    module_key,
    event_type,
    client_event_id,
    metadata
  )
  VALUES (
    v_user_id,
    v_anon_id,
    p_device_hash,
    p_module_key,
    p_event_type,
    p_client_event_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (client_event_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.track_module_interest(text, text, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_module_interest(text, text, uuid, text, jsonb) TO anon, authenticated;

COMMIT;
