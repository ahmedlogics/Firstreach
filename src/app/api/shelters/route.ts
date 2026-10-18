import { outreachRepository } from '@/lib/outreach/repository';

export async function GET() {
  try {
    const shelters = await outreachRepository.listShelters();

    return Response.json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API GET /api/shelters] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to list shelters',
      },
      { status: 500 }
    );
  }
}
