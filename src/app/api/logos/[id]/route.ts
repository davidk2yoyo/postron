import { NextRequest, NextResponse } from 'next/server';
import { LogosService } from '@/services/database';

// PUT /api/logos/[id] - Update logo name
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Logo name is required' },
        { status: 400 }
      );
    }

    const logo = await LogosService.updateLogo(params.id, { name });
    
    return NextResponse.json({ logo });
  } catch (error) {
    console.error('API Error updating logo:', error);
    return NextResponse.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

// DELETE /api/logos/[id] - Delete logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await LogosService.deleteLogo(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}