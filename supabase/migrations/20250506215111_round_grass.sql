/*
  # Update chat logs policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper access control
    - Ensure authenticated users can view all chat logs
    - Ensure service role can create chat logs

  2. Security
    - Maintain RLS enabled
    - Simplify policies for better access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Service role can create chat logs" ON chat_logs;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for service role"
  ON chat_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);