-- Migration script to update storage paths in logos table
-- This updates the storage_path column to use the new user ID

UPDATE logos 
SET storage_path = REPLACE(
  storage_path, 
  '00000000-0000-0000-0000-000000000000', 
  '01d499fc-c3c4-4b5d-8928-e21389b548d8'
)
WHERE storage_path LIKE '%00000000-0000-0000-0000-000000000000%';

-- Verify the update
SELECT storage_path 
FROM logos 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8';