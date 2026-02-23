-- FIX: Update calculate_recency_factor to accept TIMESTAMPTZ
-- This resolves the 42883 Postgres error where the trigger passes a timezone-aware
-- timestamp to a function expecting a timezone-naive timestamp.

-- 1. Drop the incorrect signature to clean up
DROP FUNCTION IF EXISTS public.calculate_recency_factor(TIMESTAMP);
DROP FUNCTION IF EXISTS public.calculate_recency_factor(TIMESTAMP, INTEGER);

-- 2. Create the correct version that accepts TIMESTAMPTZ
CREATE OR REPLACE FUNCTION public.calculate_recency_factor(
  p_created_at TIMESTAMPTZ,
  p_half_life_days INTEGER DEFAULT 7
)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT EXP(
    - EXTRACT(EPOCH FROM (now() - p_created_at)) / (p_half_life_days * 86400)
  );
$$;
