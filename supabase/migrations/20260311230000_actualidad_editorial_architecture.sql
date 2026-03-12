-- Migration: Actualidad Editorial Architecture
-- Description: Adds new editorial fields to current_topics table to support the AI generation and Admin review workflow.

ALTER TABLE public.current_topics
ADD COLUMN IF NOT EXISTS impact_quote TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS actors TEXT[],
ADD COLUMN IF NOT EXISTS intensity INTEGER,
ADD COLUMN IF NOT EXISTS relevance_chile INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS event_stage TEXT,
ADD COLUMN IF NOT EXISTS topic_duration TEXT,
ADD COLUMN IF NOT EXISTS opinion_maturity TEXT,
ADD COLUMN IF NOT EXISTS source_domain TEXT,
ADD COLUMN IF NOT EXISTS source_title TEXT,
ADD COLUMN IF NOT EXISTS source_published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cluster_id TEXT,
ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS admin_edited BOOLEAN DEFAULT false;
