-- =====================================================
-- OPINA+ V12 — FIX 34: GUEST TO VERIFIED CONVERSION
-- =====================================================

-- 1. MODIFY INSERT_SIGNAL_EVENT TO SUPPORT GUESTS
-- We need to remove the strict `auth.uid() IS NULL` block to allow guests to vote
-- before they create a verified account. Guests will rely on `anon_id`.
CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
    v_instance_id uuid; 
    v_anon_id text; 
    v_user_weight numeric := 1.0;
    v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    SELECT COALESCE(signal_weight, 1.0) INTO v_user_weight
    FROM public.user_stats
    WHERE user_id = v_user_id;
  END IF;

  INSERT INTO public.signal_events (
    anon_id, 
    signal_id, 
    battle_id, 
    battle_instance_id, 
    option_id, 
    entity_id, 
    entity_type, 
    module_type, 
    session_id, 
    attribute_id,
    signal_weight
  )
  VALUES (
    v_anon_id, 
    gen_random_uuid(), 
    p_battle_id, 
    v_instance_id, 
    p_option_id, 
    p_option_id, 
    'topic', 
    'versus', 
    p_session_id, 
    p_attribute_id,
    COALESCE(v_user_weight, 1.0)
  );

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_stats (user_id, total_signals, last_signal_at, level, signal_weight) 
    VALUES (v_user_id, 1, now(), 1, COALESCE(v_user_weight, 1.0))
    ON CONFLICT (user_id) DO UPDATE SET 
      total_signals = public.user_stats.total_signals + 1, 
      last_signal_at = now();
  END IF;
  
END;
$$;


-- 2. ADD RPC TO CLAIM GUEST ACTIVITY
-- Cuando el usuario se registre exitosamente (vía authService), debe invocar
-- esta función enviando el anon_id que traía localmente.
CREATE OR REPLACE FUNCTION public.claim_guest_activity(p_anon_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_guest_signals int;
BEGIN
    v_user_id := auth.uid();
    
    -- Validar que la petición venga de un usuario validado real
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Solo usuarios autenticados pueden reclamar perfiles de invitado.';
    END IF;

    -- Validar input
    IF p_anon_id IS NULL OR p_anon_id = '' THEN
        RETURN; -- Silently continue if no anon_id passed
    END IF;

    -- 1. Contar cuántas señales emitió el Guest con este anon_id
    SELECT COUNT(*) INTO v_guest_signals
    FROM public.signal_events
    WHERE anon_id = p_anon_id;

    -- 2. Si el Guest tuvo actividad, sumarla a las estadísticas del usuario ahora Verified
    IF v_guest_signals > 0 THEN
        INSERT INTO public.user_stats (
            user_id, 
            total_signals, 
            last_signal_at, 
            level, 
            signal_weight
        ) 
        VALUES (
            v_user_id, 
            v_guest_signals, 
            now(), 
            1, 
            1.0 -- default before any identity processing
        )
        ON CONFLICT (user_id) DO UPDATE SET 
            total_signals = public.user_stats.total_signals + v_guest_signals,
            updated_at = now();
            
        -- Opcional: Podríamos re-vincular esos signal_events antiguos explícitamente, 
        -- pero Opina+ V12 es Privacy First y separó intencionalmente user_id de signal_events.
        -- Consolidar las estadísticas de volumen es suficiente para mantener el Level y UX.
    END IF;

    -- 3. Si el usuario aún posee el tier 'guest', promoverlo
    UPDATE public.profiles
    SET tier = 'verified_basic' -- Baseline for newly signed-up users
    WHERE id = v_user_id AND tier = 'guest';

END;
$$;
