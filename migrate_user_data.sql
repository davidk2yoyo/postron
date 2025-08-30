-- Migration script to update existing data with real user ID
-- Replace placeholder UUID with your actual user ID

-- Your real user ID
-- 01d499fc-c3c4-4b5d-8928-e21389b548d8

-- Update posts table
UPDATE posts 
SET user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Update logos table
UPDATE logos 
SET user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Update settings table
UPDATE settings 
SET user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Update assets table
UPDATE assets 
SET user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Verify the migration by counting records
SELECT 'posts' as table_name, COUNT(*) as migrated_records
FROM posts 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'

UNION ALL

SELECT 'logos' as table_name, COUNT(*) as migrated_records
FROM logos 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'

UNION ALL

SELECT 'settings' as table_name, COUNT(*) as migrated_records
FROM settings 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8'

UNION ALL

SELECT 'assets' as table_name, COUNT(*) as migrated_records
FROM assets 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8';