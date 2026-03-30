-- ==============================================================================
-- Migration: Admin Entities and Storage RLS (Fase 3 / Paso 3 Final Hardening)
-- Configures strict Row Level Security for entities management and media.
-- Features: Centralized is_admin() function and restricted Storage Paths.
-- ==============================================================================

-- 1. Create centralized Secure Function
-- SECURITY DEFINER ensures it can read the users table even if RLS blocks normal reads
-- SET search_path = public prevents search_path hijacking attacks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE public.users.user_id = auth.uid() 
      AND public.users.role = 'admin'
  );
$$;

-- 2. Enable RLS on entities table (if not already enabled)
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- 3. Drop any conflicting generic policies that might have existed
DROP POLICY IF EXISTS "Allow public read access to entities" ON public.entities;
DROP POLICY IF EXISTS "Allow admin write access to entities" ON public.entities;
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.entities;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.entities;
DROP POLICY IF EXISTS "Allow all users to read entities" ON public.entities;
DROP POLICY IF EXISTS "Entities are viewable by everyone." ON public.entities;
DROP POLICY IF EXISTS "Entities are manageable by admins only" ON public.entities;

-- 4. Policy: Public Read Access
-- Everyone needs to read entities (game engine, catalog, results)
CREATE POLICY "Entities are viewable by everyone" 
ON public.entities FOR SELECT 
USING (true);

-- 5. Policy: Admin Write Access (Insert, Update, Delete)
-- Delegate check to public.is_admin()
CREATE POLICY "Entities are manageable by admins only" 
ON public.entities FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- Storage Bucket Security: "entities-media"
-- ==============================================================================

-- Ensure the bucket is public so image URLs resolve without token
UPDATE storage.buckets
SET public = true
WHERE id = 'entities-media';

-- If it doesn't exist, insert it (safe fallback)
INSERT INTO storage.buckets (id, name, public)
SELECT 'entities-media', 'entities-media', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'entities-media');

-- Drop existing policies on this bucket to recreate them cleanly
DROP POLICY IF EXISTS "Public Entity Media View" ON storage.objects;
DROP POLICY IF EXISTS "Admin Entity Media Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Entity Media Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Entity Media Update" ON storage.objects;

-- Storage Policy: Public Read
CREATE POLICY "Public Entity Media View"
ON storage.objects FOR SELECT
USING (bucket_id = 'entities-media');

-- Storage Policy: Admin Writes
-- Admins can INSERT files ONLY into 'logos/<slug>/<file>' path (No root insertions)
CREATE POLICY "Admin Entity Media Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'entities-media' AND
    (name SIMILAR TO 'logos/[^/]+/.+') AND
    public.is_admin()
);

-- Admins can UPDATE files ONLY into 'logos/<slug>/<file>' path
CREATE POLICY "Admin Entity Media Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'entities-media' AND
    (name SIMILAR TO 'logos/[^/]+/.+') AND
    public.is_admin()
)
WITH CHECK (
    bucket_id = 'entities-media' AND
    (name SIMILAR TO 'logos/[^/]+/.+') AND
    public.is_admin()
);

-- Admins can DELETE files ONLY into 'logos/<slug>/<file>' path
CREATE POLICY "Admin Entity Media Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'entities-media' AND
    (name SIMILAR TO 'logos/[^/]+/.+') AND
    public.is_admin()
);
