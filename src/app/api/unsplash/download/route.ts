import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function POST(request: NextRequest) {
  const { id, download_location } = await request.json();

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 }
    );
  }

  if (!id || !download_location) {
    return NextResponse.json(
      { error: 'Both "id" and "download_location" are required' },
      { status: 400 }
    );
  }

  try {
    // Trigger download as required by Unsplash API
    const downloadResponse = await fetch(download_location, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download trigger failed: ${downloadResponse.status}`);
    }

    const downloadData = await downloadResponse.json();

    return NextResponse.json({
      success: true,
      download_url: downloadData.url,
    });
  } catch (error) {
    console.error('Unsplash download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}