-- ============================================================
-- CLEANUP: Drop Duplicate/Ambiguous RPC Signatures
-- Fixes "Could not choose the best candidate function" error
-- ============================================================

-- 1. Drop the "Old" Trend Velocity (was defined with bucket + dates)
DROP FUNCTION IF EXISTS public.kpi_trend_velocity(uuid, text, timestamp with time zone, timestamp with time zone);

-- 2. Drop the "Old" Engagement Quality (was defined with dates)
DROP FUNCTION IF EXISTS public.kpi_engagement_quality(uuid, timestamp with time zone, timestamp with time zone);

-- Note: We KEEP the new functions defined in the Hotfix:
-- kpi_trend_velocity(uuid)
-- kpi_engagement_quality(uuid)
