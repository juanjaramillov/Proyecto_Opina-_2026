-- 1. Create the 'versus-assets' bucket (public)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('versus-assets', 'versus-assets', true, false, null, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policy if any (to update cleanly)
DROP POLICY IF EXISTS "Allow public read access to versus-assets" ON storage.objects;

-- 3. Create Policy: Allow public read access (SELECT) for everyone (anon included)
CREATE POLICY "Allow public read access to versus-assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'versus-assets' );

-- NOTE: No write policy is created for public, so public writes are blocked by default.
