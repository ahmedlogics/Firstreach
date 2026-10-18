import { NextResponse } from 'next/server';
import { reportRepository } from '@/lib/reports';

/**
 * GET /api/reports/zones
 * Returns id, name, flood_risk, reporting_coverage only.
 */
export async function GET() {
  try {
    const zones = await reportRepository.listZones();

    const sanitized = zones.map((z) => ({
      id: z.id,
      name: z.name,
      flood_risk: z.flood_risk,
      reporting_coverage: z.reporting_coverage,
    }));

    return NextResponse.json(sanitized);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not fetch zones' },
      { status: 500 }
    );
  }
}
