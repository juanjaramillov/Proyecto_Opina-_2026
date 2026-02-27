-- Migration: YYYYMMDDHHMMSS_admin_modules_demand_rpcs.sql
-- Description: RPCs for admin dashboard module demand aggregation

BEGIN;

-- 1. admin_modules_demand_summary
-- Aggregates views and clicks per module for a given range of days.
CREATE OR REPLACE FUNCTION public.admin_modules_demand_summary(p_range_days int)
RETURNS TABLE (
    module_slug text,
    preview_type text,
    views bigint,
    clicks bigint,
    ctr numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Security check
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    RETURN QUERY
    WITH event_counts AS (
        SELECT 
            meta->>'module_slug' as m_slug,
            meta->>'previewType' as p_type,
            COUNT(*) FILTER (WHERE event_type = 'module_preview_viewed') as v_count,
            COUNT(*) FILTER (WHERE event_type = 'module_interest_clicked') as c_count
        FROM public.signal_events
        WHERE created_at >= now() - (p_range_days || ' days')::interval
          AND event_type IN ('module_preview_viewed', 'module_interest_clicked')
          AND meta->>'source' = 'coming_soon'
        GROUP BY 1, 2
    )
    SELECT 
        m_slug,
        p_type,
        v_count,
        c_count,
        ROUND((c_count::numeric / NULLIF(v_count, 0)::numeric) * 100, 2) as calculated_ctr
    FROM event_counts
    ORDER BY c_count DESC, v_count DESC;
END;
$$;

-- 2. admin_modules_top_filters
-- Aggregates top filters used per module.
CREATE OR REPLACE FUNCTION public.admin_modules_top_filters(p_range_days int)
RETURNS TABLE (
    module_slug text,
    filter_key text,
    filter_value text,
    usage_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Security check
    IF public.is_admin_user() IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
    END IF;

    RETURN QUERY
    SELECT 
        meta->>'module_slug' as m_slug,
        meta->>'filter' as f_key,
        meta->>'value' as f_value,
        COUNT(*) as u_count
    FROM public.signal_events
    WHERE created_at >= now() - (p_range_days || ' days')::interval
      AND event_type = 'module_preview_filter_used'
      AND meta->>'source' = 'coming_soon'
      AND meta->>'filter' IS NOT NULL
    GROUP BY 1, 2, 3
    ORDER BY u_count DESC
    LIMIT 100;
END;
$$;

-- Revoke execute from public
REVOKE ALL ON FUNCTION public.admin_modules_demand_summary(int) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_modules_top_filters(int) FROM anon, authenticated;

-- Grant execute to authenticated (security check inside handles authorization)
GRANT EXECUTE ON FUNCTION public.admin_modules_demand_summary(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_modules_top_filters(int) TO authenticated;

COMMIT;
