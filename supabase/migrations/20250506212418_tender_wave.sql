/*
  # Add chat logs storage

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `query` (text) - ユーザーからの質問
      - `answer` (text) - ボットの回答
      - `user_info` (jsonb) - ユーザー情報（名前、メールアドレスなど）
      - `metadata` (jsonb) - メタデータ（会話ID、メッセージIDなど）
      - `created_at` (timestamp) - 作成日時

  2. Security
    - Enable RLS
    - Add policies for authenticated users to view logs
    - Add policies for the service role to create logs
*/

CREATE TABLE chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  answer text NOT NULL,
  user_info jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view logs
CREATE POLICY "Authenticated users can view chat logs"
  ON chat_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to create logs
CREATE POLICY "Service role can create chat logs"
  ON chat_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);