-- Migration: Add health fields to profiles table
-- Date: 2026-02-20
-- Description: Adds health_system and clinical_attention_12m to allow full profile persistence.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_system text,
ADD COLUMN IF NOT EXISTS clinical_attention_12m boolean;

-- Optional: Update comment for clarity
COMMENT ON COLUMN public.profiles.health_system IS 'User health system (e.g. Fonasa, Isapre)';
COMMENT ON COLUMN public.profiles.clinical_attention_12m IS 'Whether the user had clinical attention in the last 12 months';
