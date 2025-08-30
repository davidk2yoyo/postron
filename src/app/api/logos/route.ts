import { NextRequest, NextResponse } from 'next/server';
import { LogosService } from '@/services/database';

// GET /api/logos - Get all user logos
export async function GET() {
  try {
    const logos = await LogosService.getUserLogos();
    return NextResponse.json({ logos });
  } catch (error) {
    console.error('API Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/logos - Upload new logo
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/logos - Starting logo upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    console.log('Received file:', file?.name, 'size:', file?.size, 'type:', file?.type);
    console.log('Received name:', name);

    if (!file) {
      console.log('Error: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!name) {
      console.log('Error: Logo name is required');
      return NextResponse.json(
        { error: 'Logo name is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Error: Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, GIF, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('Error: File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('Starting upload and create process...');
    const logo = await LogosService.uploadAndCreateLogo(file, name);
    console.log('Logo created successfully:', logo.id);
    
    return NextResponse.json({ logo });
  } catch (error) {
    console.error('API Error uploading logo:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to upload logo',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}