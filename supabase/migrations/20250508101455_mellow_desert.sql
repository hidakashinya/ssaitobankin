/*
  # Add user-specific chat support

  1. Changes
    - Add user_id column to chat_logs table
    - Add index for faster user-specific queries
    - Update RLS policies for better access control

  2. Security
    - Maintain RLS enabled
    - Update policies to ensure users can only access their own chat logs
*/

-- Add user_id column to chat_logs
ALTER TABLE chat_logs
ADD COLUMN user_id text;

-- Create index for faster queries
CREATE INDEX chat_logs_user_id_idx ON chat_logs(user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_logs;
DROP POLICY IF EXISTS "Enable insert access for service role" ON chat_logs;

-- Create new policies
CREATE POLICY "Users can read their own chat logs"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()::text) OR
    (auth.uid() IN (
      SELECT user_id FROM user_role_assignments
      WHERE role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    ))
  );

CREATE POLICY "Service role can manage chat logs"
  ON chat_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);