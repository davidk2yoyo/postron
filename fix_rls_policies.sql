-- Fix RLS policies to work with API routes for single-user app
-- This allows your specific user ID to work in both client and API contexts

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own logos" ON logos;
DROP POLICY IF EXISTS "Users can insert own logos" ON logos;
DROP POLICY IF EXISTS "Users can update own logos" ON logos;
DROP POLICY IF EXISTS "Users can delete own logos" ON logos;

-- Recreate policies that work with your specific user ID
CREATE POLICY "Users can view own logos" ON logos
FOR SELECT USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can insert own logos" ON logos
FOR INSERT WITH CHECK (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can update own logos" ON logos
FOR UPDATE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can delete own logos" ON logos
FOR DELETE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

-- Do the same for other tables that might have similar issues
-- Posts table
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Users can view own posts" ON posts
FOR SELECT USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can insert own posts" ON posts
FOR INSERT WITH CHECK (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can update own posts" ON posts
FOR UPDATE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

-- Settings table
DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;

CREATE POLICY "Users can view own settings" ON settings
FOR SELECT USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can insert own settings" ON settings
FOR INSERT WITH CHECK (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can update own settings" ON settings
FOR UPDATE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

-- Assets table
DROP POLICY IF EXISTS "Users can view own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON assets;
DROP POLICY IF EXISTS "Users can update own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON assets;

CREATE POLICY "Users can view own assets" ON assets
FOR SELECT USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can insert own assets" ON assets
FOR INSERT WITH CHECK (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can update own assets" ON assets
FOR UPDATE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

CREATE POLICY "Users can delete own assets" ON assets
FOR DELETE USING (
  user_id = COALESCE(auth.uid(), '01d499fc-c3c4-4b5d-8928-e21389b548d8'::uuid)
);

-- Verification: Check if policies are applied correctly
SELECT tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('logos', 'posts', 'settings', 'assets')
ORDER BY tablename, cmd;