
-- ACTUALIZACIÓN DE RPC PARA SISTEMA DE NIVELES (FIX 05)
-- Objetivo: Recalcular nivel y peso de señal automáticamente en user_stats

CREATE OR REPLACE FUNCTION public.insert_signal_event(
  p_battle_id uuid,
  p_option_id uuid,
  p_session_id uuid DEFAULT NULL,
  p_attribute_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_instance_id uuid; v_anon_id text; v_total_signals_count bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  -- 1. Obtener IDs necesarios
  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  -- 2. Insertar evento de señal
  INSERT INTO public.signal_events (anon_id, signal_id, battle_id, battle_instance_id, option_id, entity_id, entity_type, module_type, session_id, attribute_id)
  VALUES (v_anon_id, gen_random_uuid(), p_battle_id, v_instance_id, p_option_id, p_option_id, 'topic', 'versus', p_session_id, p_attribute_id);

  -- 3. Actualizar estadísticas del usuario con lógica de niveles
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at, level, signal_weight) 
  VALUES (auth.uid(), 1, now(), 1, 1.0)
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1, 
    last_signal_at = now(),
    -- Recalcular nivel basado en el nuevo total
    level = CASE 
      WHEN (public.user_stats.total_signals + 1) >= 50 THEN 4
      WHEN (public.user_stats.total_signals + 1) >= 25 THEN 3
      WHEN (public.user_stats.total_signals + 1) >= 10 THEN 2
      ELSE 1
    END,
    -- Recalcular peso basado en el nuevo total
    signal_weight = CASE 
      WHEN (public.user_stats.total_signals + 1) >= 50 THEN 2.0
      WHEN (public.user_stats.total_signals + 1) >= 25 THEN 1.5
      WHEN (public.user_stats.total_signals + 1) >= 10 THEN 1.2
      ELSE 1.0
    END;
END;
$$;
