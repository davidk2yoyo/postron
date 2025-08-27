-- Create logos table
CREATE TABLE IF NOT EXISTS logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can view own logos" ON logos;
DROP POLICY IF EXISTS "Users can insert own logos" ON logos;
DROP POLICY IF EXISTS "Users can update own logos" ON logos;
DROP POLICY IF EXISTS "Users can delete own logos" ON logos;

-- Create RLS policies for logos table
CREATE POLICY "Users can view own logos" ON logos
FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert own logos" ON logos
FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update own logos" ON logos
FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete own logos" ON logos
FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_logos_updated_at ON logos;
CREATE TRIGGER update_logos_updated_at
  BEFORE UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket (run this in Supabase Dashboard > Storage)
-- You'll need to manually create a bucket named 'logos' with:
-- - Public: true
-- - File size limit: 5MB
-- - Allowed MIME types: image/png, image/jpeg, image/gif, image/svg+xml

-- Storage RLS policies (these might need to be created manually in the Dashboard)
-- CREATE POLICY IF NOT EXISTS "Users can view all logos" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'logos');

-- CREATE POLICY IF NOT EXISTS "Users can upload logos" ON storage.objects 
-- FOR INSERT WITH CHECK (bucket_id = 'logos');

-- CREATE POLICY IF NOT EXISTS "Users can delete own logos" ON storage.objects 
-- FOR DELETE USING (bucket_id = 'logos');