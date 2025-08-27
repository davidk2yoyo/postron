import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up logos storage bucket...');

    // Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Existing buckets:', buckets?.map(b => b.name));
    
    const logosBucketExists = buckets?.some(bucket => bucket.name === 'logos');

    if (!logosBucketExists) {
      console.log('Creating logos bucket...');
      const { data: bucket, error: bucketError } = await supabase.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']
      });
      
      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        if (!bucketError.message.includes('already exists')) {
          throw bucketError;
        }
      }
      console.log('Logos bucket created successfully:', bucket);
    } else {
      console.log('Logos bucket already exists');
    }

    // Verify bucket was created
    const { data: updatedBuckets } = await supabase.storage.listBuckets();
    const finalCheck = updatedBuckets?.some(bucket => bucket.name === 'logos');
    
    console.log('Setup completed. Logos bucket exists:', finalCheck);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket setup completed successfully',
      bucket_exists: finalCheck,
      buckets: updatedBuckets?.map(b => b.name) || []
    });

  } catch (error) {
    console.error('Bucket setup failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup storage bucket',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}