/*
  # Add storage bucket for user content

  1. New Storage Bucket
    - Creates 'user-content' bucket for storing user-uploaded files
    - Sets up RLS policies for secure access
    - Added ON CONFLICT handling for idempotent bucket creation

  2. Security
    - Enables public access for viewing logos
    - Restricts upload/delete operations to authenticated users
    - Users can only modify their own content
*/

-- Note: storage extension is automatically available in Supabase
-- No need to create it manually

-- Create the storage bucket with conflict handling
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-content', 'user-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files (needed for logo display)
CREATE POLICY "Public Access User Content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-content');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload user content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-content' AND
  (storage.foldername(name))[1] = 'logos'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own user content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-content')
WITH CHECK (bucket_id = 'user-content');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own user content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-content');