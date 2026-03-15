-- Migration to add demographic insights and KPI functions for Results page

-- 1. Create Demographic Insights View
-- This view aggregates signals by battle, option, gender and age bucket
-- It calculates the preference percentage within each demographic segment
CREATE OR REPLACE VIEW "public"."v_demographic_preference_insights" AS
WITH segment_totals AS (
    -- Total signals per battle and demographic segment
    SELECT 
        battle_id,
        gender,
        age_bucket,
        COUNT(*) as segment_total
    FROM public.signal_events
    WHERE gender IS NOT NULL OR age_bucket IS NOT NULL
    GROUP BY battle_id, gender, age_bucket
),
option_stats AS (
    -- Signals per option within each demographic segment
    SELECT 
        s.battle_id,
        s.entity_id,
        s.gender,
        s.age_bucket,
        COUNT(*) as option_count
    FROM public.signal_events s
    WHERE s.gender IS NOT NULL OR s.age_bucket IS NOT NULL
    GROUP BY s.battle_id, s.entity_id, s.gender, s.age_bucket
)
SELECT 
    b.id as battle_id,
    b.title as battle_title,
    e.id as entity_id,
    e.name as entity_name,
    os.gender,
    os.age_bucket,
    os.option_count,
    st.segment_total,
    CASE 
        WHEN st.segment_total > 0 THEN ROUND((os.option_count::numeric / st.segment_total::numeric) * 100, 2)
        ELSE 0 
    END as preference_percentage
FROM option_stats os
JOIN segment_totals st ON os.battle_id = st.battle_id 
    AND (os.gender = st.gender OR (os.gender IS NULL AND st.gender IS NULL))
    AND (os.age_bucket = st.age_bucket OR (os.age_bucket IS NULL AND st.age_bucket IS NULL))
JOIN public.battles b ON os.battle_id = b.id
JOIN public.entities e ON os.entity_id = e.id
WHERE b.status = 'active';

-- 2. Create RPC for Results KPIs
CREATE OR REPLACE FUNCTION "public"."get_results_kpis"() 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_signals bigint;
    active_users_24h bigint;
    top_segment text;
    growth_pct numeric;
    result jsonb;
BEGIN
    -- Total signals
    SELECT COUNT(*) INTO total_signals FROM public.signal_events;
    
    -- Active users 24h
    SELECT COUNT(DISTINCT user_id) INTO active_users_24h 
    FROM public.signal_events 
    WHERE created_at >= NOW() - INTERVAL '24 hours' AND user_id IS NOT NULL;
    
    -- Top Segment (by volume)
    SELECT 
        CASE 
            WHEN gender = 'male' THEN 'Hombres'
            WHEN gender = 'female' THEN 'Mujeres'
            ELSE 'Otros'
        END INTO top_segment
    FROM public.signal_events
    WHERE gender IS NOT NULL
    GROUP BY gender
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Growth percentage (Signals last 7 days vs previous 7 days)
    WITH stats AS (
        SELECT
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as current_7d,
            COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '7 days' AND created_at >= NOW() - INTERVAL '14 days') as prev_7d
        FROM public.signal_events
    )
    SELECT 
        CASE 
            WHEN prev_7d = 0 THEN 100
            ELSE ROUND(((current_7d::numeric - prev_7d::numeric) / prev_7d::numeric) * 100, 2)
        END INTO growth_pct
    FROM stats;

    result := jsonb_build_object(
        'total_signals', total_signals,
        'active_users_24h', active_users_24h,
        'top_segment', COALESCE(top_segment, 'N/A'),
        'growth_percentage', COALESCE(growth_pct, 0)
    );
    
    RETURN result;
END;
$$;
