/*
  # Fix authentication schema and policies

  1. Changes
    - Ensure auth schema exists
    - Add necessary auth policies
    - Fix user table constraints
    
  2. Security
    - Add proper RLS policies for auth tables
    - Ensure service role has correct permissions
*/

-- Ensure auth schema exists (if not already created by Supabase)
CREATE SCHEMA IF NOT EXISTS auth;

-- Update users table to ensure proper auth integration
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey,
ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Ensure proper RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update users policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure auth schema permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;