/*
  # Fix authentication schema and permissions

  1. Changes
    - Grant necessary permissions to authenticated and anon roles
    - Add missing auth schema references
  
  2. Security
    - Grant appropriate permissions to auth schema
    - Note: auth.users is managed by Supabase, do not modify manually
*/

-- Grant usage on auth schema (auth schema already exists in Supabase)
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to auth schema for service role
GRANT ALL ON SCHEMA auth TO service_role;

-- Note: auth.users is managed by Supabase, do not modify manually
-- The auth.users table already exists and is managed by Supabase
-- RLS and policies are also managed by Supabase

-- Ensure public.users foreign key constraint is valid
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_id_fkey,
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;