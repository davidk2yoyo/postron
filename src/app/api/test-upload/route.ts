import { NextRequest, NextResponse } from 'next/server';
import { LogosService } from '@/services/database';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing direct upload to logos bucket...');

    // Create a simple test file
    const testData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const testFile = new File([testData], 'test.png', { type: 'image/png' });

    console.log('Test file created:', testFile.name, testFile.size, testFile.type);

    // Try to upload directly using LogosService
    const result = await LogosService.uploadAndCreateLogo(testFile, 'Test Logo Direct');
    console.log('Upload successful:', result);

    return NextResponse.json({
      success: true,
      message: 'Direct upload test successful',
      logo: result
    });

  } catch (error) {
    console.error('Direct upload test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}