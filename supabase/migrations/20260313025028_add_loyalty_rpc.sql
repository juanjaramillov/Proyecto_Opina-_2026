-- Add RPC functions and triggers for the Loyalty Program

-- 1. Función General para Procesar una Acción de Lealtad (Voto)
-- Esta función será llamada por los triggers de inserción en otras tablas (ej. versus_answers)
CREATE OR REPLACE FUNCTION process_loyalty_action(
    p_user_id UUID,
    p_action_type VARCHAR
)
RETURNS void AS $$
DECLARE
    v_signal_reward INTEGER;
    v_mission_id INTEGER;
    v_week_start_date DATE;
    v_current_count INTEGER;
    v_target_count INTEGER;
BEGIN
    -- 1. Buscar cuánto vale esta acción en el diccionario
    SELECT signal_reward INTO v_signal_reward 
    FROM public.loyalty_actions 
    WHERE action_type = p_action_type;

    IF v_signal_reward IS NULL THEN
        -- Si la acción no existe en el diccionario, no hacemos nada.
        RETURN;
    END IF;

    -- 2. Incrementar señales históricas en user_loyalty_stats
    -- Si el registro no existe, intentamos crearlo (aunque el trigger de signup debería haberlo hecho)
    INSERT INTO public.user_loyalty_stats (user_id, total_historical_signals, current_level_id)
    VALUES (p_user_id, v_signal_reward, (SELECT id FROM public.loyalty_levels ORDER BY min_signals ASC LIMIT 1))
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_historical_signals = public.user_loyalty_stats.total_historical_signals + EXCLUDED.total_historical_signals,
        updated_at = timezone('utc'::text, now());

    -- Opcional: Aquí podríamos re-calcular el nivel del usuario basándonos en el nuevo total
    -- Pero para optimizar, podríamos hacerlo solo al llegar a ciertos umbrales locales o en un cron.
    -- Vamos a chequear si subió de nivel inmediatamente:
    UPDATE public.user_loyalty_stats s
    SET current_level_id = l.id
    FROM public.loyalty_levels l
    WHERE s.user_id = p_user_id
      AND s.total_historical_signals >= l.min_signals
      AND l.min_signals = (
          SELECT MAX(min_signals) 
          FROM public.loyalty_levels 
          WHERE min_signals <= s.total_historical_signals
      );

    -- 3. Actualizar la misión semanal correspondiente.
    -- La semana comienza el lunes.
    v_week_start_date := date_trunc('week', CURRENT_DATE)::DATE;

    -- Buscamos si hay una misión activa para este action_type
    -- Según la tabla: 'versus', 'tournament', 'actualidad'
    -- Mapeamos p_action_type a mission_type (quitamos el 'vote_')
    SELECT id, target_count INTO v_mission_id, v_target_count
    FROM public.weekly_missions
    WHERE is_active = true 
      AND mission_type = REPLACE(p_action_type, 'vote_', '');

    IF v_mission_id IS NOT NULL THEN
        -- Incrementamos la misión, asumiendo 1 voto = 1 paso en la misión.
        INSERT INTO public.user_weekly_mission_progress (user_id, mission_id, week_start_date, current_count, is_completed)
        VALUES (p_user_id, v_mission_id, v_week_start_date, 1, (1 >= v_target_count))
        ON CONFLICT (user_id, mission_id, week_start_date)
        DO UPDATE SET 
            current_count = CASE 
                WHEN public.user_weekly_mission_progress.is_completed THEN public.user_weekly_mission_progress.current_count
                ELSE public.user_weekly_mission_progress.current_count + 1
            END,
            is_completed = CASE 
                WHEN public.user_weekly_mission_progress.is_completed THEN true
                ELSE (public.user_weekly_mission_progress.current_count + 1) >= v_target_count
            END,
            updated_at = timezone('utc'::text, now());
    END IF;

    -- 4. Actualizar Misión "Hábito Ciudadano" (active_days)
    -- Contamos esto buscando si ya interactuó HOY en progreso.
    -- Para simplificar, asumimos que cualquier acción en process_loyalty_action cuenta como "día activo".
    -- Verificamos si ya hay un log hoy en una tabla temporal, o si su last_active_date es distinta de hoy (requiere campo extra o inferir).
    -- Mejor forma: el progress se incrementa solo 1 vez por día para esa misión.
    SELECT id, target_count INTO v_mission_id, v_target_count
    FROM public.weekly_missions
    WHERE is_active = true 
      AND mission_type = 'active_days';

    IF v_mission_id IS NOT NULL THEN
        -- Incrementamos solo si updated_at es menor a hoy (o sea, es su primera acción del día)
        -- Para manejar la concurrencia e idesnpotencia, podemos insertar y luego actualizar basándonos en date_trunc('day', updated_at)
        INSERT INTO public.user_weekly_mission_progress (user_id, mission_id, week_start_date, current_count, is_completed, updated_at)
        VALUES (p_user_id, v_mission_id, v_week_start_date, 1, (1 >= v_target_count), timezone('utc'::text, now()))
        ON CONFLICT (user_id, mission_id, week_start_date)
        DO UPDATE SET 
            current_count = CASE 
                WHEN public.user_weekly_mission_progress.is_completed THEN public.user_weekly_mission_progress.current_count
                WHEN date_trunc('day', public.user_weekly_mission_progress.updated_at) < date_trunc('day', timezone('utc'::text, now())) THEN public.user_weekly_mission_progress.current_count + 1
                ELSE public.user_weekly_mission_progress.current_count
            END,
            is_completed = CASE 
                WHEN public.user_weekly_mission_progress.is_completed THEN true
                WHEN date_trunc('day', public.user_weekly_mission_progress.updated_at) < date_trunc('day', timezone('utc'::text, now())) THEN (public.user_weekly_mission_progress.current_count + 1) >= v_target_count
                ELSE public.user_weekly_mission_progress.is_completed
            END,
            updated_at = timezone('utc'::text, now());
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Triggers sobre Tablas de Votos Existentes

-- Trigger para signal_events (Central de votos)
CREATE OR REPLACE FUNCTION trigger_loyalty_vote()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type VARCHAR;
BEGIN
    -- Solo procesamos si el evento tiene un usuario logueado
    IF NEW.user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Mapeamos el module_type (versus, tournament, actualidad) al action_type (vote_versus, etc.)
    -- Asumimos que module_type viene como 'versus', 'tournament', 'feed', 'actualidad', etc.
    IF NEW.module_type IS NOT NULL THEN
        v_action_type := 'vote_' || NEW.module_type;
        PERFORM public.process_loyalty_action(NEW.user_id, v_action_type);
    ELSE
        -- Fallback si no tiene module_type
        PERFORM public.process_loyalty_action(NEW.user_id, 'vote_feed');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_signal_event_loyalty ON public.signal_events;
CREATE TRIGGER on_signal_event_loyalty
AFTER INSERT ON public.signal_events
FOR EACH ROW
EXECUTE PROCEDURE trigger_loyalty_vote();

