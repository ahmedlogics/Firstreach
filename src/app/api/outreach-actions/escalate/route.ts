import { outreachRepository } from '@/lib/outreach/repository';

export async function POST() {
  try {
    const result = await outreachRepository.escalateNoResponseHouseholds();

    return Response.json({
      success: true,
      message: `Escalated ${result.escalatedCount} uncontacted vulnerable household(s) to volunteer verification patrol queue. Silence treated as unknown welfare status (NO false rescue emergency declared).`,
      data: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API POST /api/outreach-actions/escalate] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to execute escalation',
      },
      { status: 500 }
    );
  }
}
