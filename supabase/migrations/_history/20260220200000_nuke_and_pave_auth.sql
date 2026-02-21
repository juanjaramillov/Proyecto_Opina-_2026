-- ==========================================
-- Nuke and Pave Authentication System
-- DANGER: This script is destructive. It wipes `user_profiles` and `profiles` to solve the 42P17 Infinite Recursion error.
-- ==========================================

BEGIN;

-- 1. NUKE: Destroy all conflicting tables, functions, triggers, and views
-- Drop views that depend on profiles or user_profiles first
DROP VIEW IF EXISTS public.v_user_influence_card CASCADE;
DROP VIEW IF EXISTS public.v_public_state_summary CASCADE;

-- Drop all triggers that might be firing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trg_sync_user_power_profile ON public.profiles CASCADE;

-- Drop the functions attached to those triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.fn_sync_user_power() CASCADE;

-- Nuke the tables
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Optional: Wipe all users to force everyone to register again and guarantee a perfect sync
-- WARNING: This deletes ALL users in the project! Remove this line if you want to keep auth identities (though their profiles will be gone).
DELETE FROM auth.users;

-- 2. PAVE: Create a clean, definitive profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  display_name text,
  avatar_url text,
  age int,
  gender text,
  commune text,
  education text,
  occupation text,
  income text,
  civil_status text,
  household_size text,
  interest text,
  shopping_preference text,
  brand_affinity text,
  social_media text,
  politics_interest text,
  voting_frequency text,
  points int DEFAULT 0,
  role text DEFAULT 'user',
  tier text DEFAULT 'guest',
  profile_completeness int DEFAULT 0,
  profile_completed boolean DEFAULT false,
  verification_level text DEFAULT 'basic',
  signal_weight numeric DEFAULT 1.0,
  has_ci boolean DEFAULT false
);

-- 3. SECURE: Add standard, non-recursive RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all profiles (Standard for rankings/social apps)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- 4. AUTOMATE: Recreate the trigger identically to only target the new table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
