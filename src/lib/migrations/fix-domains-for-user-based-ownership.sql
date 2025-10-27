-- Fix domains table to work without workspaces implementation
-- This migration allows domains to work with user.id temporarily

-- Step 1: Drop the foreign key constraint to workspaces
ALTER TABLE domains 
DROP CONSTRAINT IF EXISTS domains_workspace_id_workspaces_id_fk;

-- Step 2: Rename workspace_id to user_id for clarity (optional but recommended)
-- This makes it clear we're using user IDs temporarily
ALTER TABLE domains 
RENAME COLUMN workspace_id TO user_id;

-- Step 3: Add comment explaining temporary setup
COMMENT ON COLUMN domains.user_id IS 'Temporarily stores user ID. Will be changed to workspace_id when workspaces are implemented.';

-- Step 4: Set up Row-Level Security (RLS) policies
-- Enable RLS if not already enabled
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own domains" ON domains;
DROP POLICY IF EXISTS "Users can insert their own domains" ON domains;
DROP POLICY IF EXISTS "Users can update their own domains" ON domains;
DROP POLICY IF EXISTS "Users can delete their own domains" ON domains;

-- Policy 1: Users can view their own domains
CREATE POLICY "Users can view their own domains"
ON domains
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own domains
CREATE POLICY "Users can insert their own domains"
ON domains
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own domains
CREATE POLICY "Users can update their own domains"
ON domains
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own domains
CREATE POLICY "Users can delete their own domains"
ON domains
FOR DELETE
USING (auth.uid() = user_id);

-- Step 5: Create index on user_id for performance
DROP INDEX IF EXISTS domains_workspace_idx;
CREATE INDEX IF NOT EXISTS domains_user_idx ON domains(user_id);

-- Verification query (optional - comment out in production)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'domains';


