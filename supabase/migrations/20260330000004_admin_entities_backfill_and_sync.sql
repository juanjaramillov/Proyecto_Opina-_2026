-- Migration: 20260330000004_admin_entities_backfill_and_sync.sql
-- Description: Backfills logo_storage_path from legacy logo_path URLs and enforces strict synchronization.

BEGIN;

-- 1. BACKFILL: Extracts 'logos/<slug>/<file>' from Storage Public URLs and populates 'logo_storage_path' if null.
-- We use robust regex literal matching since we know exactly how Supabase structured them.
UPDATE public.entities
SET logo_storage_path = substring(logo_path from 'logos/[^/]+/[^/]+$')
WHERE logo_storage_path IS NULL 
  AND logo_path LIKE '%supabase.co/storage/v1/object/public/entities-media/logos/%';

-- 2. STRICT SYNCHRONIZATION FUNCTION (Source of Truth Governance)
-- Enforces that if 'logo_storage_path' is assigned, 'logo_path' MUST unequivocally reflect and contain it.
CREATE OR REPLACE FUNCTION public.trg_sync_entity_logos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If there's an active storage path, ensure logo_path converges to it (doesn't diverge)
  IF NEW.logo_storage_path IS NOT NULL THEN
    -- Strict check: Public URL MUST contain the storage path literally
    -- We allow Frontend to calculate the base URL (so as not to hardcode Supabase URLs in DB),
    -- but this DB constraint guarantees it isn't an arbitrary unrelated URL.
    IF NEW.logo_path IS NULL OR position(NEW.logo_storage_path IN NEW.logo_path) = 0 THEN
      RAISE EXCEPTION 'logo_path must be rigidly synchronized with logo_storage_path: expected string containing %', NEW.logo_storage_path;
    END IF;
  ELSE
    -- If there's NO logo_storage_path, it's either an entity without logo or an external manual URL.
    -- If the user clears the storage path, and the OLD logo_path was from Supabase, clear it too.
    IF OLD.logo_storage_path IS NOT NULL AND NEW.logo_path LIKE '%entities-media/logos/%' THEN
       NEW.logo_path = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. APPLY TRIGGER
DROP TRIGGER IF EXISTS trg_sync_entity_logos_trigger ON public.entities;
CREATE TRIGGER trg_sync_entity_logos_trigger
  BEFORE INSERT OR UPDATE OF logo_path, logo_storage_path
  ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_sync_entity_logos();

COMMIT;
