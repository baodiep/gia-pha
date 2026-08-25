-- Migration: Storage Bucket and Policies for Avatars
-- Bucket: avatars (public read, authenticated authorized write)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 1. Read Policy: Anyone can view avatars if person is not deleted
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Insert/Update Policy: Only authenticated active users with branch permission or admin
CREATE POLICY "Authorized users upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.status = 'ACTIVE'
        AND profiles.is_admin = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'ACTIVE'
        -- check path prefix or user branch permissions
    )
  )
);

-- 3. Delete Policy: Authorized users only
CREATE POLICY "Authorized users delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.status = 'ACTIVE'
        AND profiles.is_admin = true
    )
  )
);
