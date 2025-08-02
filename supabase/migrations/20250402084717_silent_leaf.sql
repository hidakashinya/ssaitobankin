/*
  # Add is_favorite column to conversations table

  1. Changes
    - Add is_favorite column to conversations table with default value false
    - Update existing rows to have is_favorite set to false

  2. Security
    - No changes to RLS policies needed as the column inherits existing row-level security
*/

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;