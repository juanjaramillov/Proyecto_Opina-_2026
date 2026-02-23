BEGIN;

-- =========================================================
-- A) LOCKDOWN DE PERMISOS (NO writes directos desde cliente)
-- =========================================================

-- 1) signal_events: cliente NO inserta/edita/borra
REVOKE ALL ON TABLE public.signal_events FROM anon, authenticated;

-- 2) user_activity: cliente NO inserta/edita/borra
REVOKE ALL ON TABLE public.user_activity FROM anon, authenticated;

-- 3) user_stats: cliente NO inserta/edita/borra
REVOKE ALL ON TABLE public.user_stats FROM anon, authenticated;

-- 4) user_profiles: el usuario sí puede leer/editar su propio perfil (por RLS)
-- (no tocamos grants aquí, RLS manda; pero aseguramos que al menos SELECT/UPDATE existan)
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_profiles TO authenticated;

-- 5) users: NO editable desde cliente (solo self-select; updates por RPC si lo necesitas)
GRANT SELECT ON TABLE public.users TO authenticated;

-- =========================================================
-- B) RLS ESTRICTO EN TABLAS SENSIBLES
-- =========================================================

-- signal_events
ALTER TABLE public.signal_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS signal_events_select_self ON public.signal_events;
CREATE POLICY signal_events_select_self
ON public.signal_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Bloqueos explícitos (defensa extra)
DROP POLICY IF EXISTS signal_events_no_insert ON public.signal_events;
CREATE POLICY signal_events_no_insert
ON public.signal_events
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS signal_events_no_update ON public.signal_events;
CREATE POLICY signal_events_no_update
ON public.signal_events
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS signal_events_no_delete ON public.signal_events;
CREATE POLICY signal_events_no_delete
ON public.signal_events
FOR DELETE
TO authenticated
USING (false);


-- user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_activity_select_self ON public.user_activity;
CREATE POLICY user_activity_select_self
ON public.user_activity
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_activity_no_write ON public.user_activity;
CREATE POLICY user_activity_no_write
ON public.user_activity
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);


-- user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_stats_select_self ON public.user_stats;
CREATE POLICY user_stats_select_self
ON public.user_stats
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_stats_no_write ON public.user_stats;
CREATE POLICY user_stats_no_write
ON public.user_stats
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Ahora que RLS existe, devolvemos SOLO SELECT a cliente (sin writes)
GRANT SELECT ON TABLE public.user_activity TO authenticated;
GRANT SELECT ON TABLE public.user_stats TO authenticated;

-- signal_events: si quieres permitir "mi historial", damos SELECT (ya protegido por RLS)
GRANT SELECT ON TABLE public.signal_events TO authenticated;


-- =========================================================
-- C) HARDENING: RPCs DE WRITE deben ser SECURITY DEFINER + search_path seguro
-- =========================================================

-- Nota: esto evita ataques de "search_path hijack" en SECURITY DEFINER.

-- 1) insert_signal_event: asegurar SECURITY DEFINER + search_path
-- (redefine firma actual del proyecto; si tu firma difiere, Antigravity debe ajustar exacto)
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_instance_id uuid;

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_completion int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Invite gate (1:1)
  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  -- Profile gate (mínimo)
  SELECT COALESCE(profile_completion_percentage, 0), COALESCE(signal_weight, 1.0)
  INTO v_profile_completion, v_user_weight
  FROM public.user_profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_profile_completion IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_completion < 40 THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  -- Resolver battle_instance
  SELECT id INTO v_instance_id
  FROM public.battle_instances
  WHERE battle_id = p_battle_id
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO public.signal_events (
    anon_id, signal_id, battle_id, battle_instance_id, option_id,
    entity_id, entity_type, module_type, session_id, attribute_id,
    signal_weight
  )
  VALUES (
    v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id,
    public.resolve_entity_id(p_option_id), 'topic', 'versus', p_session_id, p_attribute_id,
    COALESCE(v_user_weight, 1.0)
  );

  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (v_uid, 'signal_emitted');

  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (v_uid, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_signals = public.user_stats.total_signals + 1,
        last_signal_at = now();

  PERFORM public.update_trust_score(v_uid);
END;
$$;

-- 2) insert_depth_answers: asegurar SECURITY DEFINER + search_path
CREATE OR REPLACE FUNCTION public.insert_depth_answers(
  p_option_id uuid,
  p_answers jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_anon_id text;
  v_signal_id uuid := gen_random_uuid();

  v_invite_id uuid;
  v_is_verified boolean;

  v_profile_completion int;
  v_user_weight numeric;

  v_daily_actions int;
  v_daily_cap int := 20;

  v_answer record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT invitation_code_id, COALESCE(is_identity_verified, false)
  INTO v_invite_id, v_is_verified
  FROM public.users
  WHERE id = v_uid
  LIMIT 1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_REQUIRED';
  END IF;

  SELECT COALESCE(profile_completion_percentage, 0), COALESCE(signal_weight, 1.0)
  INTO v_profile_completion, v_user_weight
  FROM public.user_profiles
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_profile_completion IS NULL THEN
    RAISE EXCEPTION 'PROFILE_MISSING';
  END IF;

  IF v_profile_completion < 40 THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;

  v_anon_id := public.get_or_create_anon_id();

  IF v_is_verified = false THEN
    v_daily_actions := public.count_daily_signal_actions(v_anon_id);
    IF v_daily_actions >= v_daily_cap THEN
      RAISE EXCEPTION 'SIGNAL_LIMIT_REACHED';
    END IF;
  END IF;

  FOR v_answer IN
    SELECT * FROM jsonb_to_recordset(p_answers) AS x(question_key text, answer_value text)
  LOOP
    INSERT INTO public.signal_events (
      anon_id, signal_id, option_id, entity_id, entity_type,
      module_type, context_id, value_text, value_numeric,
      signal_weight
    )
    VALUES (
      v_anon_id, v_signal_id, p_option_id, public.resolve_entity_id(p_option_id), 'topic',
      'depth', v_answer.question_key, v_answer.answer_value,
      CASE WHEN v_answer.answer_value ~ '^[0-9]+(\.[0-9]+)?$' THEN v_answer.answer_value::numeric ELSE NULL END,
      COALESCE(v_user_weight, 1.0)
    );
  END LOOP;

  INSERT INTO public.user_activity (user_id, action_type)
  VALUES (v_uid, 'depth_completed');

  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at)
  VALUES (v_uid, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_signals = public.user_stats.total_signals + 1,
        last_signal_at = now();

  PERFORM public.update_trust_score(v_uid);
END;
$$;

-- 3) Ejecutables: SOLO authenticated
REVOKE EXECUTE ON FUNCTION public.insert_signal_event(uuid, uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.insert_depth_answers(uuid, jsonb) FROM anon;

GRANT EXECUTE ON FUNCTION public.insert_signal_event(uuid, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_depth_answers(uuid, jsonb) TO authenticated;

COMMIT;
