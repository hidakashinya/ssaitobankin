/*
  # Create storage bucket for logos

  1. Changes
    - Create a new storage bucket for logos
    - Set public access policy for the bucket
    - Enable RLS for the bucket

  2. Security
    - Enable public read access
    - Restrict write access to authenticated users
*/

-- Note: storage extension is automatically available in Supabase
-- No need to create it manually

-- Create the logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies with unique names
CREATE POLICY "Public Access Logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Authenticated users can update their logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Authenticated users can delete their logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');