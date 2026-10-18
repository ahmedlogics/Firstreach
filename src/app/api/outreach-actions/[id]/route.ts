import { NextRequest } from 'next/server';
import { outreachRepository } from '@/lib/outreach/repository';
import { PatchOutreachActionSchema } from '@/lib/outreach/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json(
        { success: false, error: 'Outreach Action ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = PatchOutreachActionSchema.safeParse(body);

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

    const updated = await outreachRepository.updateOutreachAction(id, parseResult.data);

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API PATCH /api/outreach-actions/[id]] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to update outreach action',
      },
      { status: 400 }
    );
  }
}
