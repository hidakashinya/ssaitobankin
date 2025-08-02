/*
  # Create default test user

  1. Changes
    - Create test user in auth.users
    - Create corresponding identity in auth.identities
    - Handle all required fields including provider_id
    - Ensure idempotent execution
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  test_user_id uuid := uuid_generate_v4();
BEGIN
  -- Insert test user if not exists
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    instance_id
  )
  SELECT
    test_user_id,
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}',
    FALSE,
    '00000000-0000-0000-0000-000000000000'
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@example.com'
  );

  -- Insert into auth.identities if user was created
  IF FOUND THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      test_user_id,
      jsonb_build_object(
        'sub', test_user_id,
        'email', 'test@example.com'
      ),
      'email',
      'test@example.com',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;