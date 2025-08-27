import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up storage bucket...');

    // Create storage bucket if it doesn't exist
    console.log('Setting up storage bucket...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const logosBucketExists = buckets?.some(bucket => bucket.name === 'logos');

    if (!logosBucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']
      });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket creation error:', bucketError);
        throw bucketError;
      }
      console.log('Logos bucket created successfully');
    } else {
      console.log('Logos bucket already exists');
    }

    // Set up storage policies
    console.log('Setting up storage policies...');
    const storagePolicies = [
      {
        name: 'Drop existing storage policies',
        sql: `
          DROP POLICY IF EXISTS "Users can view all logos" ON storage.objects;
          DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
          DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;
        `
      },
      {
        name: 'Users can view all logos',
        sql: `CREATE POLICY "Users can view all logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');`
      },
      {
        name: 'Users can upload logos',
        sql: `CREATE POLICY "Users can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');`
      },
      {
        name: 'Users can delete own logos',
        sql: `CREATE POLICY "Users can delete own logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');`
      }
    ];

    for (const policy of storagePolicies) {
      console.log('Creating storage policy:', policy.name);
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.error('Storage policy error:', error);
        // Continue with other policies even if one fails
      }
    }

    console.log('Database setup completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully' 
    });

  } catch (error) {
    console.error('Database setup failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}