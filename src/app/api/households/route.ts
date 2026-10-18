import { NextRequest } from 'next/server';
import { outreachRepository } from '@/lib/outreach/repository';
import {
  ContactStatusType,
  ReachabilityType,
  REACHABILITY_VALUES,
  CONTACT_STATUS_VALUES,
} from '@/lib/outreach/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const zone_id = searchParams.get('zone_id') || undefined;
    const reachabilityRaw = searchParams.get('reachability') || undefined;
    const contactStatusRaw = searchParams.get('contact_status') || undefined;

    let reachability: ReachabilityType | undefined = undefined;
    if (reachabilityRaw && REACHABILITY_VALUES.includes(reachabilityRaw as ReachabilityType)) {
      reachability = reachabilityRaw as ReachabilityType;
    }

    let contact_status: ContactStatusType | undefined = undefined;
    if (contactStatusRaw && CONTACT_STATUS_VALUES.includes(contactStatusRaw as ContactStatusType)) {
      contact_status = contactStatusRaw as ContactStatusType;
    }

    const households = await outreachRepository.listHouseholds({
      search,
      zone_id,
      reachability,
      contact_status,
    });

    return Response.json({
      success: true,
      count: households.length,
      data: households,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API GET /api/households] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to list households',
      },
      { status: 500 }
    );
  }
}
