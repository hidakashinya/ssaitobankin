/*
  # Add user roles and permissions

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `name` (text) - Role name (e.g., admin, manager, user)
      - `created_at` (timestamp)

    - `user_role_assignments`
      - `user_id` (uuid, references users)
      - `role_id` (uuid, references user_roles)
      - `assigned_by` (uuid, references users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for role management
    - Only admins can assign roles
*/

-- Create user_roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create user_role_assignments table
CREATE TABLE user_role_assignments (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO user_roles (name) VALUES
  ('admin'),
  ('manager'),
  ('user');

-- Create policies for user_roles
CREATE POLICY "Everyone can read roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = auth.uid()
      AND ura.role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    )
  );

-- Create policies for user_role_assignments
CREATE POLICY "Users can view role assignments"
  ON user_role_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage role assignments"
  ON user_role_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = auth.uid()
      AND ura.role_id = (SELECT id FROM user_roles WHERE name = 'admin')
    )
  );