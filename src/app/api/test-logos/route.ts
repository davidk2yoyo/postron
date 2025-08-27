import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing logos table connection...');
    
    // Test if logos table exists and we can query it
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying logos table:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        table_exists: false
      });
    }
    
    console.log('Logos table query successful:', data);
    
    // Test storage bucket access
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const logosBucket = buckets?.find(b => b.name === 'logos');
    
    console.log('Storage buckets:', buckets?.map(b => b.name));
    console.log('Logos bucket exists:', !!logosBucket);
    
    return NextResponse.json({
      success: true,
      table_exists: true,
      logos_count: data?.length || 0,
      buckets: buckets?.map(b => b.name) || [],
      logos_bucket_exists: !!logosBucket,
      message: 'Logos table and storage are accessible'
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}