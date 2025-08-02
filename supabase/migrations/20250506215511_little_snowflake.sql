/*
  # Update chat logs permissions

  1. Changes
    - Drop existing policies
    - Create new policies with broader access
    - Add anonymous access for testing

  2. Security
    - Enable read access for all authenticated users
    - Enable read access for anonymous users (temporary for testing)
    - Maintain insert access for service role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON chat_logs;
DROP POLICY IF EXISTS "Enable insert access for service role" ON chat_logs;

-- Create new policies with broader access
CREATE POLICY "Enable read access for all users"
  ON chat_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert access for service role"
  ON chat_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;