-- =====================================================
-- OPINA+ V12 — FIX 12: SYSTEM HEALTH METRICS
-- =====================================================

-- RPC para obtener KPIs de salud del sistema
CREATE OR REPLACE FUNCTION public.get_system_health_metrics()
RETURNS TABLE (
  signal_integrity_percent NUMERIC,
  profile_completion_percent NUMERIC,
  last_snapshot_at TIMESTAMP WITH TIME ZONE,
  total_users INTEGER,
  verified_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_users INTEGER;
    v_verified_users INTEGER;
    v_signal_integrity NUMERIC;
    v_profile_completion NUMERIC;
    v_last_snapshot TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 1. Usuarios totales vs verificados
    SELECT COUNT(*), COUNT(*) FILTER (WHERE tier != 'guest' OR email IS NOT NULL)
    INTO v_total_users, v_verified_users
    FROM public.profiles;

    -- 2. Integridad de señales (Signals de verificados vs total en las últimas 24h)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 100
            ELSE (COUNT(*) FILTER (WHERE u.tier != 'guest' OR u.email IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100
        END
    INTO v_signal_integrity
    FROM public.signal_events se
    JOIN public.profiles u ON se.user_id = u.id
    WHERE se.created_at > now() - interval '24 hours';

    -- 3. Promedio de completitud de perfil
    -- Estimación basada en campos clave: age, gender, commune
    SELECT 
        AVG(
            (CASE WHEN age_bucket IS NOT NULL AND age_bucket != '' THEN 1 ELSE 0 END +
             CASE WHEN gender IS NOT NULL AND gender != '' THEN 1 ELSE 0 END +
             CASE WHEN commune IS NOT NULL AND commune != '' THEN 1 ELSE 0 END)::NUMERIC / 3.0
        ) * 100
    INTO v_profile_completion
    FROM public.profiles;

    -- 4. Último snapshot exitoso
    SELECT MAX(snapshot_at) INTO v_last_snapshot
    FROM public.ranking_snapshots;

    RETURN QUERY SELECT 
        ROUND(COALESCE(v_signal_integrity, 0), 1),
        ROUND(COALESCE(v_profile_completion, 0), 1),
        v_last_snapshot,
        v_total_users,
        v_verified_users;
END;
$$;
