-- =====================================================
-- OPINA+ V12 — FIX 13: IDENTITY VERIFICATION SYSTEM
-- =====================================================

-- 1. Modificar tabla users para incluir campos de verificación
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Asegurar que user_stats tenga la columna signal_weight
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS signal_weight NUMERIC DEFAULT 1.0;

-- 3. Función para actualizar el peso del usuario automáticamente al verificar identidad
CREATE OR REPLACE FUNCTION public.update_user_weight_on_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ajustar el peso según el estado de verificación
    -- Instrucción: 2.5x para verificados, 1.0x para no verificados
    IF NEW.identity_verified = true THEN
        UPDATE public.user_stats
        SET signal_weight = 2.5,
            updated_at = now()
        WHERE user_id = NEW.id;
    ELSE
        UPDATE public.user_stats
        SET signal_weight = 1.0,
            updated_at = now()
        WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Trigger para detectar cambios en identity_verified
DROP TRIGGER IF EXISTS trg_update_user_weight ON public.profiles;
CREATE TRIGGER trg_update_user_weight
AFTER UPDATE OF identity_verified ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_weight_on_verification();

-- 5. Actualizar insert_signal_event para usar el peso persistido en user_stats
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
    v_user_weight numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  -- 1. Obtener IDs necesarios
  v_anon_id := public.get_or_create_anon_id();
  SELECT id INTO v_instance_id FROM public.battle_instances WHERE battle_id = p_battle_id ORDER BY created_at DESC LIMIT 1;
  
  -- 2. Obtener el peso actual del usuario desde user_stats
  -- Si no existe, usamos 1.0 por defecto
  SELECT COALESCE(signal_weight, 1.0) INTO v_user_weight
  FROM public.user_stats
  WHERE user_id = auth.uid();

  -- 3. Insertar evento de señal con el peso capturado
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

  -- 4. Actualizar estadísticas del usuario (mantener incremento de total_signals)
  INSERT INTO public.user_stats (user_id, total_signals, last_signal_at, level, signal_weight) 
  VALUES (auth.uid(), 1, now(), 1, COALESCE(v_user_weight, 1.0))
  ON CONFLICT (user_id) DO UPDATE SET 
    total_signals = public.user_stats.total_signals + 1, 
    last_signal_at = now();
    -- Nota: El nivel y el peso basado en nivel se omiten aquí para dar prioridad 
    -- al sistema de verificación de identidad solicitado por el usuario.
END;
$$;
