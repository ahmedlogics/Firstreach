-- ============================================================================
-- RAABTA — Role-Based Access Control & Staff Identity Migration
-- ============================================================================
-- Additive migration for authoritative staff role-based access control.
-- Supports: 'coordinator', 'rescue_team', 'volunteer'.
-- Links authenticated users directly to rescue teams or volunteer identity.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coordinator', 'rescue_team', 'volunteer')),
  team_id UUID REFERENCES rescue_teams(id) ON DELETE SET NULL,
  volunteer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for rapid authoritative server lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read only their own role assignment
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System / Service Role has full administrative authority
CREATE POLICY "Service role full access on user_roles"
  ON user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
