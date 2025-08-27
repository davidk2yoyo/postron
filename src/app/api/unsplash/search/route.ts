import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&orientation=portrait`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!unsplashResponse.ok) {
      throw new Error(`Unsplash API error: ${unsplashResponse.status}`);
    }

    const data = await unsplashResponse.json();

    // Return trimmed payload to avoid exposing sensitive data
    const trimmedResults = {
      total: data.total,
      total_pages: data.total_pages,
      results: data.results.map((photo: any) => ({
        id: photo.id,
        urls: {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
        },
        width: photo.width,
        height: photo.height,
        alt_description: photo.alt_description,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          profile_url: `https://unsplash.com/@${photo.user.username}`,
        },
        download_location: photo.links.download_location,
      })),
    };

    return NextResponse.json(trimmedResults);
  } catch (error) {
    console.error('Unsplash search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}