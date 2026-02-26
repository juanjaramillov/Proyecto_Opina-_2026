BEGIN;

-- ==========================================
-- 1) Tabla de Métricas Diarias (user_daily_metrics)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  anon_id uuid NULL REFERENCES public.anonymous_identities(user_id) ON DELETE CASCADE,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  interactions bigint NOT NULL DEFAULT 0,
  time_spent_seconds bigint NOT NULL DEFAULT 0,
  sessions bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_identity CHECK (user_id IS NOT NULL OR anon_id IS NOT NULL)
);

-- Índices únicos para poder hacer UPSERT fácilmente por día e identidad
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_daily_metrics_user_date ON public.user_daily_metrics (user_id, metric_date) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_daily_metrics_anon_date ON public.user_daily_metrics (anon_id, metric_date) WHERE anon_id IS NOT NULL;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_user_daily_metrics_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_daily_metrics_updated_at') THEN
    CREATE TRIGGER trg_user_daily_metrics_updated_at
    BEFORE UPDATE ON public.user_daily_metrics
    FOR EACH ROW EXECUTE FUNCTION public.set_user_daily_metrics_updated_at();
  END IF;
END $$;


-- ==========================================
-- 2) Actualizar Triggers para impactar la tabla diaria (Interacciones)
-- ==========================================

-- A) Para signal_events
CREATE OR REPLACE FUNCTION public.trg_increment_interactions_signals()
RETURNS trigger AS $$
BEGIN
  -- Si el voto viene de un usuario anónimo:
  IF NEW.anon_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE anon_id = NEW.anon_id;
     
    -- Acumulado diario (usando NEW.user_id temporalmente si es anon hasta que hagamos match, asumimos que viene en evento o buscamos su user_id si ya hay uno ligado)
    -- En la migración 20260218, anon_id en tabla event es text, pero PK real is user_id
    -- Como la FK the daily_metrics depende the la tabla (que usa user_id), necesitamos buscarlo
    -- Haremos que el trigger asocie mediante user_id subyacente de public.anonymous_identities
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, interactions)
    SELECT user_id, CURRENT_DATE, 1 FROM public.anonymous_identities WHERE anon_id = NEW.anon_id LIMIT 1
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  -- Si el voto viene de un usuario logueado:
  IF NEW.user_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE user_id = NEW.user_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, interactions)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- B) Para user_state_logs (Modulo personal)
CREATE OR REPLACE FUNCTION public.trg_increment_interactions_state()
RETURNS trigger AS $$
BEGIN
  IF NEW.anon_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE anon_id = NEW.anon_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, interactions)
    SELECT user_id, CURRENT_DATE, 1 FROM public.anonymous_identities WHERE anon_id = NEW.anon_id LIMIT 1
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    -- Acumulado histórico
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE user_id = NEW.user_id;

    -- Acumulado diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, interactions)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET interactions = public.user_daily_metrics.interactions + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 3) Actualizar track_user_session para impactar tabla diaria
-- ==========================================

CREATE OR REPLACE FUNCTION public.track_user_session(
  p_anon_id uuid DEFAULT NULL,
  p_seconds_spent integer DEFAULT 0,
  p_is_new_session boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session_increment integer := CASE WHEN p_is_new_session THEN 1 ELSE 0 END;
BEGIN
  -- Si no manda tiempo ni sesión nueva, no hacemos nada
  IF p_seconds_spent <= 0 AND NOT p_is_new_session THEN
    RETURN;
  END IF;

  -- 1) Prioridad: Si hay sesión iniciada
  IF v_uid IS NOT NULL THEN
    -- Histórico
    UPDATE public.users
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + v_session_increment,
           last_active_at = now()
     WHERE user_id = v_uid;

    -- Diario
    INSERT INTO public.user_daily_metrics (user_id, metric_date, time_spent_seconds, sessions)
    VALUES (v_uid, CURRENT_DATE, p_seconds_spent, v_session_increment)
    ON CONFLICT (user_id, metric_date) WHERE user_id IS NOT NULL
    DO UPDATE SET 
      time_spent_seconds = public.user_daily_metrics.time_spent_seconds + EXCLUDED.time_spent_seconds,
      sessions = public.user_daily_metrics.sessions + EXCLUDED.sessions;
      
    RETURN;
  END IF;

  -- 2) Secundario: Si manda un anon_id (texto) que convertimos a subquery, track in DB is mostly TEXT in frontend
  -- as anon_id UUID parameter passed by React was originally text anon_id
  -- We assume p_anon_id passed here is actually the frontend's anon_id text but cast as uuid due to our RPC interface,
  -- We will treat it as a lookup or direct user_id match if possible.
  -- To be safe, let's treat it as the user_id PK of anonymous_identities table if we can.
  IF p_anon_id IS NOT NULL THEN
    -- Histórico
    UPDATE public.anonymous_identities
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + v_session_increment,
           last_active_at = now()
     WHERE user_id = p_anon_id; -- changed to search by user_id

    -- Diario
    INSERT INTO public.user_daily_metrics (anon_id, metric_date, time_spent_seconds, sessions)
    VALUES (p_anon_id, CURRENT_DATE, p_seconds_spent, v_session_increment)
    ON CONFLICT (anon_id, metric_date) WHERE anon_id IS NOT NULL
    DO UPDATE SET 
      time_spent_seconds = public.user_daily_metrics.time_spent_seconds + EXCLUDED.time_spent_seconds,
      sessions = public.user_daily_metrics.sessions + EXCLUDED.sessions;
  END IF;
END;
$$;


-- ==========================================
-- 4) Actualizar admin_list_invites para leer métricas dinámicas
-- ==========================================

DROP FUNCTION IF EXISTS public.admin_list_invites(integer);
DROP FUNCTION IF EXISTS public.admin_list_invites(integer, text);

CREATE OR REPLACE FUNCTION public.admin_list_invites(
    p_limit int DEFAULT 200,
    p_timeframe text DEFAULT 'total' -- 'total', 'today', 'yesterday', '7d', '30d'
)
RETURNS TABLE (
  id uuid,
  code text,
  assigned_alias text,
  status text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by_user_id uuid,
  created_at timestamptz,
  total_interactions bigint,
  total_time_spent_seconds bigint,
  total_sessions bigint,
  last_active_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_date_threshold date;
  v_end_date date;
BEGIN
  IF public.is_admin_user() IS NOT TRUE THEN
    RETURN;
  END IF;

  -- Determinar el rango de fechas basado en the timeframe
  IF p_timeframe = 'today' THEN
    v_date_threshold := CURRENT_DATE;
    v_end_date := CURRENT_DATE;
  ELSIF p_timeframe = 'yesterday' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '1 day';
    v_end_date := CURRENT_DATE - INTERVAL '1 day';
  ELSIF p_timeframe = '7d' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '6 days';
    v_end_date := CURRENT_DATE;
  ELSIF p_timeframe = '30d' THEN
    v_date_threshold := CURRENT_DATE - INTERVAL '29 days';
    v_end_date := CURRENT_DATE;
  ELSE
    -- 'total' will be handled natively by doing a left join on users (precomputed total)
    RETURN QUERY
    SELECT 
      ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at,
      u.total_interactions, u.total_time_spent_seconds, u.total_sessions, u.last_active_at
    FROM public.invitation_codes ic
    LEFT JOIN public.users u ON ic.used_by_user_id = u.user_id
    ORDER BY ic.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));
    RETURN;
  END IF;

  -- Si es un timeframe específico, usamos un JOIN LATERAL GROUP BY sobre user_daily_metrics
  RETURN QUERY
  SELECT 
    ic.id, ic.code, ic.assigned_alias, ic.status, ic.expires_at, ic.used_at, ic.used_by_user_id, ic.created_at,
    COALESCE(dm.interactions, 0)::bigint as total_interactions,
    COALESCE(dm.time_spent_seconds, 0)::bigint as total_time_spent_seconds,
    COALESCE(dm.sessions, 0)::bigint as total_sessions,
    u.last_active_at
  FROM public.invitation_codes ic
  LEFT JOIN public.users u ON ic.used_by_user_id = u.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      SUM(interactions) as interactions,
      SUM(time_spent_seconds) as time_spent_seconds,
      SUM(sessions) as sessions
    FROM public.user_daily_metrics
    WHERE metric_date >= v_date_threshold AND metric_date <= v_end_date
    GROUP BY user_id
  ) dm ON ic.used_by_user_id = dm.user_id
  ORDER BY ic.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000));

END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_invites(int, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_invites(int, text) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
