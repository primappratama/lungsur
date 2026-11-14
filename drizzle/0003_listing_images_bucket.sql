-- Tempat foto barang di Supabase Storage.
-- Publik buat dibaca (foto tampil di kartu barang), tapi cuma pemilik folder
-- yang boleh upload dan hapus. Folder pertama path = id user: <user id>/<draft id>/<n>.webp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listing-images', 'listing-images', true, 2097152, ARRAY['image/webp', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint
CREATE POLICY "listing_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
--> statement-breakpoint
CREATE POLICY "listing_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
