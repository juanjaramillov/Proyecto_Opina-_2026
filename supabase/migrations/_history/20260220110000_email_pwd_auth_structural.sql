-- ==========================================
-- Migration: Email + Password Auth Structural Changes
-- ==========================================

-- 1) Create or ensure the verification_level_type enum exists
DO $$ BEGIN
    CREATE TYPE verification_level_type AS ENUM ('basic', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2) Add structural columns to profiles if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_level verification_level_type DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS signal_weight numeric DEFAULT 1;

-- 3) Note about syncing existing rows
-- If we want existing users with completeness = 100 to be marked as completed
UPDATE public.profiles
SET profile_completed = true, verification_level = 'verified'
WHERE profile_completeness >= 100 AND profile_completed = false;
