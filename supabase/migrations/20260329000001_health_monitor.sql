-- Migración para Funciones de Monitoreo de Salud (Bloque 5)

-- Vista o RPC para obtener la frescura y estadísticas del sistema rápido.
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_event_age_seconds float;
    last_signal_age_seconds float;
    active_users_24h bigint;
    total_signals_24h bigint;
    health_status text;
BEGIN
    -- 1. Age del ultimo app_event
    SELECT extract(epoch from (now() - max(created_at)))
    INTO last_event_age_seconds
    FROM public.app_events;
    
    -- 2. Age de ultima señal v_signal_events_enriched (o directo a interactions)
    SELECT extract(epoch from (now() - max(created_at)))
    INTO last_signal_age_seconds
    FROM public.v_signal_events_enriched;

    -- 3. Usuarios activos ultimas 24h
    SELECT count(DISTINCT user_id)
    INTO active_users_24h
    FROM public.behavior_events
    WHERE created_at >= now() - interval '24 hours';
    
    -- 4. Señales en ultimas 24h
    SELECT count(*)
    INTO total_signals_24h
    FROM public.v_signal_events_enriched
    WHERE created_at >= now() - interval '24 hours';
    
    -- Diagnóstico basico
    IF last_event_age_seconds > 86400 THEN
        health_status := 'degraded';
    ELSE
        health_status := 'healthy';
    END IF;

    RETURN json_build_object(
        'last_event_age_seconds', COALESCE(last_event_age_seconds, -1),
        'last_signal_age_seconds', COALESCE(last_signal_age_seconds, -1),
        'active_users_24h', COALESCE(active_users_24h, 0),
        'total_signals_24h', COALESCE(total_signals_24h, 0),
        'system_status', health_status,
        'checked_at', now()
    );
END;
$$;
