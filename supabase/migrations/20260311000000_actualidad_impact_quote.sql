-- Migration: Add impact_quote to current_topics
-- Description: Adds a new column to store the AI-generated impactful quote for each topic to increase engagement.

ALTER TABLE public.current_topics
ADD COLUMN IF NOT EXISTS impact_quote TEXT;
