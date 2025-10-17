/*
  # Fix chat logs access permissions

  1. Changes
    - Update RLS policies to allow authenticated users to view all chat logs
    - Maintain user-specific access for personal logs
    - Ensure service role can manage all logs

  2. Security
    - Keep RLS enabled
    - Allow authenticated users to read all chat logs (for admin purposes)
    - Maintain service role full access
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read their own chat logs" ON chat_logs;

-- Create new policy that allows authenticated users to read all chat logs
CREATE POLICY "Authenticated users can read all chat logs"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure service role policy exists and is correct
DROP POLICY IF EXISTS "Service role can manage chat logs" ON chat_logs;

CREATE POLICY "Service role can manage chat logs"
  ON chat_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
