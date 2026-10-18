import { outreachRepository } from '@/lib/outreach/repository';

export async function GET() {
  try {
    const metrics = await outreachRepository.getOverviewMetrics();

    return Response.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API GET /api/outreach-metrics] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to fetch outreach metrics',
      },
      { status: 500 }
    );
  }
}
