-- FIX: Allow NULL demographics in daily aggregates
-- PostgreSQL forces NOT NULL on all columns participating in a PRIMARY KEY constraint.
-- Because guest voters have NULL demographics, the refresh_daily_aggregates function 
-- was crashing. We replace the compound primary key with a surrogate UUID key.

-- 1. entity_daily_aggregates
ALTER TABLE public.entity_daily_aggregates DROP CONSTRAINT IF EXISTS entity_daily_aggregates_pkey;
ALTER TABLE public.entity_daily_aggregates ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE public.entity_daily_aggregates ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE public.entity_daily_aggregates ALTER COLUMN age_bucket DROP NOT NULL;
ALTER TABLE public.entity_daily_aggregates ALTER COLUMN region DROP NOT NULL;

-- 2. category_daily_aggregates
ALTER TABLE public.category_daily_aggregates DROP CONSTRAINT IF EXISTS category_daily_aggregates_pkey;
ALTER TABLE public.category_daily_aggregates ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE public.category_daily_aggregates ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE public.category_daily_aggregates ALTER COLUMN age_bucket DROP NOT NULL;
ALTER TABLE public.category_daily_aggregates ALTER COLUMN region DROP NOT NULL;
