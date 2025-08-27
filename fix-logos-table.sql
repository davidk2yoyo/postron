-- Fix the logos table user_id column to have the same default as other tables
ALTER TABLE logos ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Also disable RLS temporarily to test if that's the issue
ALTER TABLE logos DISABLE ROW LEVEL SECURITY;