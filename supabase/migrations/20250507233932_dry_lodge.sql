/*
  # Fix user creation trigger

  1. Changes
    - Drop existing trigger and function
    - Create new function with better error handling
    - Create new trigger with proper timing
    - Add email confirmation handling

  2. Security
    - Maintain existing RLS policies
    - Keep user data secure
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    updated_at = now();

  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create new trigger that runs after insert OR update
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();