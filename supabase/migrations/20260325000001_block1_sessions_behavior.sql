-- =========================================================================
-- BLOQUE 1: SESIONES, COMPORTAMIENTO Y FORTALECIMIENTO DE SIGNAL_EVENTS
-- =========================================================================

-- 1. Tabla de Sesiones (app_sessions)
CREATE TABLE IF NOT EXISTS public.app_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid, -- Referencia simbólica a auth.users o public.users
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    entry_point text,
    platform text,
    device_type text,
    os text,
    browser text,
    app_version text,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Tabla de Eventos de Comportamiento (behavior_events)
CREATE TABLE IF NOT EXISTS public.behavior_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    session_id uuid REFERENCES public.app_sessions(id) ON DELETE CASCADE,
    user_id uuid,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    event_type text NOT NULL,
    module_type text,
    screen_name text,
    source_module text,
    source_element text,
    entity_id uuid,
    context_id uuid,
    status text,
    duration_ms integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Fortalecimiento Aditivo de signal_events
ALTER TABLE public.signal_events
  ADD COLUMN IF NOT EXISTS event_status text,
  ADD COLUMN IF NOT EXISTS origin_element text,
  ADD COLUMN IF NOT EXISTS question_id uuid,
  ADD COLUMN IF NOT EXISTS question_version integer,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS response_time_ms integer,
  ADD COLUMN IF NOT EXISTS sequence_id uuid,
  ADD COLUMN IF NOT EXISTS sequence_order integer,
  ADD COLUMN IF NOT EXISTS content_snapshot_id uuid,
  ADD COLUMN IF NOT EXISTS left_entity_id uuid,
  ADD COLUMN IF NOT EXISTS right_entity_id uuid,
  ADD COLUMN IF NOT EXISTS selected_entity_id uuid,
  ADD COLUMN IF NOT EXISTS interaction_outcome text;

-- 4. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_behavior_session_id ON public.behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_user_id ON public.behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_occurred_at ON public.behavior_events(occurred_at);
