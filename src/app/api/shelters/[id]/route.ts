import { NextRequest } from 'next/server';
import { outreachRepository } from '@/lib/outreach/repository';
import { PatchShelterSchema } from '@/lib/outreach/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json(
        { success: false, error: 'Shelter ID is required' },
        { status: 400 }
      );
    }

    const shelter = await outreachRepository.getShelterById(id);
    if (!shelter) {
      return Response.json(
        { success: false, error: `Shelter with ID ${id} not found` },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: shelter,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API GET /api/shelters/[id]] Error:`, error);
    return Response.json(
      { success: false, error: msg || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json(
        { success: false, error: 'Shelter ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = PatchShelterSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await outreachRepository.updateShelterOccupancy(
      id,
      parseResult.data.occupied
    );

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API PATCH /api/shelters/[id]] Error:`, error);
    return Response.json(
      { success: false, error: msg || 'Failed to update shelter' },
      { status: 400 }
    );
  }
}
