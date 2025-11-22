-- Fix RLS Policies for Kandhan Karunai
-- Run this if you're getting 406 errors

-- First, disable RLS if it's causing issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use these permissive policies:

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all conversations" ON conversations;
DROP POLICY IF EXISTS "Enable insert access for all conversations" ON conversations;
DROP POLICY IF EXISTS "Enable update access for all conversations" ON conversations;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations
CREATE POLICY "Allow all operations on users"
ON users
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on conversations"
ON conversations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
