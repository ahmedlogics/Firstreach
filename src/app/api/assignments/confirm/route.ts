import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';
import { DbIncident, DbRescueTeam } from '@/lib/dispatch/types';
import { checkCapabilitiesMatch } from '@/lib/dispatch/matching';
import {
  calculateDistanceKm,
  estimateArrivalMinutes,
  estimateDispatchCost,
} from '@/lib/dispatch/cost';

interface ConfirmRequestBody {
  incidentId: string;
  teamId: string;
  shelterId?: string | null;
  note?: string;
  overrideReason?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization Verification
    // Expect dispatcher role or verified demo coordinator flag
    const authHeader = req.headers.get('authorization');
    const dispatcherRole = req.headers.get('x-dispatcher-role');
    const demoMode = req.headers.get('x-demo-coordinator');

    const isAuthorized =
      (authHeader && authHeader.startsWith('Bearer ')) ||
      dispatcherRole === 'coordinator' ||
      dispatcherRole === 'operations_chief' ||
      demoMode === 'true';

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Dispatcher or Coordinator authorization required to commit rescue assets.',
        },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    let body: ConfirmRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { incidentId, teamId, shelterId = null, note, overrideReason } = body;

    if (!incidentId || !teamId) {
      return NextResponse.json(
        { error: 'Both incidentId and teamId are required UUID parameters' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceSupabaseClient();

    // 3. Re-fetch Incident from Supabase (authoritative state verification)
    const { data: incidentData, error: incError } = await supabaseAdmin
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (incError || !incidentData) {
      return NextResponse.json(
        { error: `Incident ${incidentId} not found in database`, details: incError?.message },
        { status: 404 }
      );
    }

    const incident = incidentData as DbIncident;

    // Check incident status
    if (incident.status !== 'open') {
      return NextResponse.json(
        {
          error: `Incident is already in status '${incident.status}'. Cannot dispatch to a non-open emergency.`,
          conflict: true,
        },
        { status: 409 }
      );
    }

    // 4. Re-fetch Rescue Team from Supabase (authoritative readiness verification)
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('rescue_teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: `Rescue team ${teamId} not found in database`, details: teamError?.message },
        { status: 404 }
      );
    }

    const team = teamData as DbRescueTeam;

    // Check team availability
    if (team.status !== 'available') {
      return NextResponse.json(
        {
          error: `Rescue team '${team.name}' is currently '${team.status}'. Cannot assign unavailable unit.`,
          conflict: true,
        },
        { status: 409 }
      );
    }

    // 5. Re-check Capacity Constraint
    const peopleCount = incident.people_count ?? 1;
    if (team.capacity < peopleCount) {
      return NextResponse.json(
        {
          error: `Capacity violation: Team '${team.name}' carries ${team.capacity} pax, but incident requires capacity for ${peopleCount} pax.`,
        },
        { status: 422 }
      );
    }

    // 6. Re-check Mandatory Capabilities
    const { hasRequiredCapabilities, missingCapabilities } = checkCapabilitiesMatch(
      incident,
      team
    );
    if (!hasRequiredCapabilities && !overrideReason) {
      return NextResponse.json(
        {
          error: `Capability mismatch: Team lacks mandatory capabilities (${missingCapabilities.join(', ')}). A recorded override reason is required.`,
        },
        { status: 422 }
      );
    }

    // 7. Server-Side Distance, ETA & Cost Recomputation
    // Never trust client-supplied numbers!
    const distanceKm = calculateDistanceKm(
      { lat: team.lat, lng: team.lng },
      { lat: incident.lat, lng: incident.lng }
    );
    const estimatedCost = estimateDispatchCost(team, distanceKm);
    const estimatedEta = estimateArrivalMinutes(team, distanceKm) || 30; // fallback to 30 min if unknown

    // 8. Call Transactional Supabase confirm_assignment RPC
    const { data: assignmentId, error: rpcError } = await supabaseAdmin.rpc(
      'confirm_assignment',
      {
        p_incident_id: incidentId,
        p_team_id: teamId,
        p_estimated_cost: estimatedCost,
        p_eta_minutes: estimatedEta,
        p_shelter_id: shelterId,
      }
    );

    if (rpcError) {
      console.error('[API /api/assignments/confirm] RPC error:', rpcError);
      return NextResponse.json(
        {
          error: `Database transaction failed: ${rpcError.message}`,
          details: rpcError.details,
          code: rpcError.code,
        },
        { status: 409 }
      );
    }

    // If an optional note or override reason was supplied, update the assignment record
    if ((note || overrideReason) && assignmentId) {
      const combinedNote = [
        note ? `Dispatcher note: ${note}` : null,
        overrideReason ? `Human Override Reason: ${overrideReason}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      await supabaseAdmin
        .from('assignments')
        .update({ note: combinedNote })
        .eq('id', assignmentId);
    }

    // Fetch the newly created assignment record to return to client
    const { data: createdAssignment } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    return NextResponse.json({
      success: true,
      message: `Assignment successfully authorized for ${team.name} to incident ${incident.id}.`,
      assignmentId,
      assignment: createdAssignment,
      serverComputed: {
        distanceKm,
        estimatedCostPkr: estimatedCost,
        estimatedEtaMinutes: estimatedEta,
      },
    });
  } catch (err: any) {
    console.error('[API /api/assignments/confirm] Unexpected server error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing assignment confirmation', details: err?.message },
      { status: 500 }
    );
  }
}
