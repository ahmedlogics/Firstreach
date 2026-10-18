import { NextRequest } from 'next/server';
import { outreachRepository } from '@/lib/outreach/repository';
import { PatchHouseholdSchema } from '@/lib/outreach/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json(
        { success: false, error: 'Household ID is required' },
        { status: 400 }
      );
    }

    const household = await outreachRepository.getHouseholdById(id);
    if (!household) {
      return Response.json(
        { success: false, error: `Household with ID ${id} not found` },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: household,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API GET /api/households/[id]] Error:`, error);
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
        { success: false, error: 'Household ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = PatchHouseholdSchema.safeParse(body);

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

    const updated = await outreachRepository.updateHousehold(id, parseResult.data);

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API PATCH /api/households/[id]] Error:`, error);
    return Response.json(
      { success: false, error: msg || 'Failed to update household' },
      { status: 400 }
    );
  }
}
