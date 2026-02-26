BEGIN;

-- ==========================================
-- 1) Agregar columnas de métricas a public.users
-- ==========================================
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS total_interactions bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_time_spent_seconds bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sessions bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- ==========================================
-- 2) Agregar columnas de métricas a public.anonymous_identities
-- ==========================================
ALTER TABLE public.anonymous_identities 
  ADD COLUMN IF NOT EXISTS total_interactions bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_time_spent_seconds bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sessions bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- ==========================================
-- 3) Triggers para incrementar interacciones (VOTOS)
-- ==========================================

CREATE OR REPLACE FUNCTION public.trg_increment_interactions_signals()
RETURNS trigger AS $$
BEGIN
  -- Si el voto viene de un usuario anónimo:
  IF NEW.anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.anon_id;
  END IF;

  -- Si el voto viene de un usuario logueado (retrocompatibilidad):
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_count_signal_events ON public.signal_events;
CREATE TRIGGER trg_count_signal_events
  AFTER INSERT ON public.signal_events
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_increment_interactions_signals();


-- ==========================================
-- 4) Triggers para incrementar interacciones (MODULO PERSONAL)
-- ==========================================

CREATE OR REPLACE FUNCTION public.trg_increment_interactions_state()
RETURNS trigger AS $$
BEGIN
  IF NEW.anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.anon_id;
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.users
       SET total_interactions = total_interactions + 1,
           last_active_at = now()
     WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_count_user_state_logs ON public.user_state_logs;
CREATE TRIGGER trg_count_user_state_logs
  AFTER INSERT ON public.user_state_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_increment_interactions_state();


-- ==========================================
-- 5) RPC para traquear tiempo en pantalla desde React
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
BEGIN
  -- Si no manda tiempo ni sesión nueva, no hacemos nada
  IF p_seconds_spent <= 0 AND NOT p_is_new_session THEN
    RETURN;
  END IF;

  -- 1) Prioridad: Si hay sesión iniciada (Auth v_uid)
  IF v_uid IS NOT NULL THEN
    UPDATE public.users
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + CASE WHEN p_is_new_session THEN 1 ELSE 0 END,
           last_active_at = now()
     WHERE id = v_uid;
    RETURN;
  END IF;

  -- 2) Secundario: Si manda un anon_id válido y no hay sesión iniciada
  IF p_anon_id IS NOT NULL THEN
    UPDATE public.anonymous_identities
       SET total_time_spent_seconds = total_time_spent_seconds + p_seconds_spent,
           total_sessions = total_sessions + CASE WHEN p_is_new_session THEN 1 ELSE 0 END,
           last_active_at = now()
     WHERE id = p_anon_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.track_user_session(uuid, integer, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.track_user_session(uuid, integer, boolean) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
