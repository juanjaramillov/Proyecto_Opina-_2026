-- ==============================================================================
-- Migration: Admin Entities Slug Governance and Logo Traceability
-- Purpose: Hardens the slug definition and provides a native storage path
-- column for historical traceability and cleanup.
-- ==============================================================================

-- 1. Add canonical storage path column
-- This stores EXACTLY 'logos/<slug>/<timestamp_hash>.<ext>'
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS logo_storage_path TEXT;

-- 2. Restrict slug format to canonical rules:
-- only lowercase letters, numbers, and hyphens allowed. Must start and end with alnum.
ALTER TABLE public.entities 
  ADD CONSTRAINT chk_entities_slug_format 
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Ensure the slug is truly UNIQUE across the table (this should already exist, but we reinforce it)
-- We will use IF NOT EXISTS workaround by checking pg_class if we were doing pure SQL,
-- but standard Supabase migrations just use standard DDL.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'entities_slug_key'
    ) THEN
        ALTER TABLE public.entities ADD CONSTRAINT entities_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3. Lock slug updates if a logo is already bound to it
-- We create a trigger function to block UDPATE of 'slug' if 'logo_storage_path' IS NOT NULL
CREATE OR REPLACE FUNCTION public.trg_protect_entity_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If attempting to change the slug...
  IF NEW.slug IS DISTINCT FROM OLD.slug THEN
    -- And there is already a storage path bound to the old slug...
    IF OLD.logo_storage_path IS NOT NULL THEN
      -- Abort transaction to prevent breaking the storage convention and leaving orphans
      RAISE EXCEPTION 'Cannot change slug of an entity that already has a logo in Storage. Disassociate the logo first or preserve the slug.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to entities
DROP TRIGGER IF EXISTS trg_protect_entity_slug_trigger ON public.entities;
CREATE TRIGGER trg_protect_entity_slug_trigger
  BEFORE UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_protect_entity_slug();
