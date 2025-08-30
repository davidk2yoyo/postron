-- Fix the URL field in logos table to match the updated storage paths

UPDATE logos 
SET url = REPLACE(
  url, 
  '00000000-0000-0000-0000-000000000000', 
  '01d499fc-c3c4-4b5d-8928-e21389b548d8'
)
WHERE url LIKE '%00000000-0000-0000-0000-000000000000%';

-- Verify the update
SELECT id, name, url, storage_path 
FROM logos 
WHERE user_id = '01d499fc-c3c4-4b5d-8928-e21389b548d8';