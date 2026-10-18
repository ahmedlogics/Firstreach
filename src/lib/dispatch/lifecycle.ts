import { getServiceSupabaseClient } from '@/lib/supabase';
import { DbAssignment, DbIncident, DbRescueTeam, DbShelter } from './types';

export interface StartAssignmentResult {
  success: boolean;
  assignmentId: string;
  status: 'en_route';
  incidentId: string;
  incidentStatus: 'in_progress';
  assignment?: DbAssignment;
  message: string;
}

export interface CompleteAssignmentParams {
  assignmentId: string;
  leaderConfirmed: boolean;
  assistedPeopleCount?: number;
  teamReady?: boolean;
  shelterId?: string | null;
  evacueesArrivedCount?: number;
  resolutionNotes?: string;
}

export interface CompleteAssignmentResult {
  success: boolean;
  assignmentId: string;
  status: 'completed';
  completedAt: string;
  incidentId: string;
  incidentStatus: 'resolved' | 'open';
  isPartial: boolean;
  remainingPeople: number;
  teamId: string;
  teamStatus: 'available' | 'busy';
  shelterId: string | null;
  evacueesArrivedCount: number;
  message: string;
}

/**
 * Transitions an assignment from 'assigned' to 'en_route',
 * and the corresponding incident to 'in_progress'.
 */
export async function executeStartAssignment(
  assignmentId: string
): Promise<StartAssignmentResult> {
  const supabase = getServiceSupabaseClient();

  // 1. Attempt database RPC first
  const { data: rpcData, error: rpcError } = await supabase.rpc('start_assignment', {
    p_assignment_id: assignmentId,
  });

  if (!rpcError && rpcData) {
    const res = rpcData as any;
    return {
      success: true,
      assignmentId,
      status: 'en_route',
      incidentId: res.incident_id,
      incidentStatus: 'in_progress',
      message: 'Rescue unit started operation; team is now en route.',
    };
  }

  // If error is NOT a missing RPC function (PGRST202), bubble up the RPC exception
  if (rpcError && rpcError.code !== 'PGRST202') {
    throw new Error(rpcError.message || 'Database RPC error while starting mission');
  }

  // 2. Authoritative Fallback via service-role client (if RPC not yet installed in Postgres)
  // Fetch assignment
  const { data: assignmentData, error: aErr } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (aErr || !assignmentData) {
    throw new Error(`Assignment ${assignmentId} not found in database`);
  }

  const assignment = assignmentData as DbAssignment;

  // Idempotency: if already en_route, safely acknowledge
  if (assignment.status === 'en_route') {
    return {
      success: true,
      assignmentId,
      status: 'en_route',
      incidentId: assignment.incident_id,
      incidentStatus: 'in_progress',
      message: 'Assignment is already marked en route.',
    };
  }

  if (assignment.status !== 'assigned') {
    throw new Error(
      `Invalid status transition: Assignment is in status '${assignment.status}' (expected 'assigned')`
    );
  }

  // Update assignment to 'en_route'
  const { error: updAssignErr } = await supabase
    .from('assignments')
    .update({ status: 'en_route' })
    .eq('id', assignmentId);

  if (updAssignErr) {
    throw new Error(`Failed to update assignment status: ${updAssignErr.message}`);
  }

  // Update linked incident to 'in_progress'
  if (assignment.incident_id) {
    const { error: updIncErr } = await supabase
      .from('incidents')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignment.incident_id);

    if (updIncErr) {
      console.warn(`[executeStartAssignment] Warning updating incident status: ${updIncErr.message}`);
    }
  }

  return {
    success: true,
    assignmentId,
    status: 'en_route',
    incidentId: assignment.incident_id,
    incidentStatus: 'in_progress',
    message: 'Rescue unit successfully marked en route. Incident is now in progress.',
  };
}

/**
 * Transitions an assignment to 'completed' with team release and optional shelter arrival.
 * Safely handles full vs partial rescues, team readiness, and shelter capacity.
 */
export async function executeCompleteAssignment(
  params: CompleteAssignmentParams
): Promise<CompleteAssignmentResult> {
  const {
    assignmentId,
    leaderConfirmed,
    assistedPeopleCount,
    teamReady = true,
    shelterId = null,
    evacueesArrivedCount = 0,
    resolutionNotes,
  } = params;

  if (!leaderConfirmed) {
    throw new Error('On-scene rescue team leader confirmation is required to complete this mission.');
  }

  const supabase = getServiceSupabaseClient();

  // 1. Attempt database RPC first
  const { data: rpcData, error: rpcError } = await supabase.rpc('complete_assignment', {
    p_assignment_id: assignmentId,
    p_assisted_people_count: assistedPeopleCount ?? null,
    p_team_ready: teamReady,
    p_shelter_id: shelterId || null,
    p_evacuees_arrived_count: evacueesArrivedCount,
    p_resolution_notes: resolutionNotes || null,
  });

  if (!rpcError && rpcData) {
    const res = rpcData as any;
    return {
      success: true,
      assignmentId,
      status: 'completed',
      completedAt: res.completed_at || new Date().toISOString(),
      incidentId: res.incident_id,
      incidentStatus: res.incident_status,
      isPartial: Boolean(res.is_partial),
      remainingPeople: res.remaining_people || 0,
      teamId: res.team_id,
      teamStatus: res.team_status,
      shelterId: res.shelter_id,
      evacueesArrivedCount: res.evacuees_arrived_count || 0,
      message: res.is_partial
        ? `Partial rescue completed. ${res.remaining_people} people still require assistance; incident remains open.`
        : 'Rescue mission successfully completed. Incident marked resolved.',
    };
  }

  // If error is NOT a missing RPC function (PGRST202), bubble up the RPC exception
  if (rpcError && rpcError.code !== 'PGRST202') {
    throw new Error(rpcError.message || 'Database RPC error while completing mission');
  }

  // 2. Authoritative Fallback via service-role client (if RPC not yet installed in Postgres)
  // Fetch assignment
  const { data: assignmentData, error: aErr } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (aErr || !assignmentData) {
    throw new Error(`Assignment ${assignmentId} not found in database`);
  }

  const assignment = assignmentData as DbAssignment;

  // Concurrency & Duplicate check
  if (assignment.status === 'completed') {
    throw new Error(`Duplicate completion: Assignment ${assignmentId} is already completed.`);
  }

  if (assignment.status !== 'en_route' && assignment.status !== 'assigned') {
    throw new Error(`Invalid status transition: Cannot complete an assignment with status '${assignment.status}'.`);
  }

  // Fetch linked incident
  const { data: incidentData, error: iErr } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', assignment.incident_id)
    .single();

  if (iErr || !incidentData) {
    throw new Error(`Linked incident ${assignment.incident_id} not found in database`);
  }

  const incident = incidentData as DbIncident;

  // Determine people assisted and partial vs full rescue
  const totalPeopleInIncident = incident.people_count ?? 1;
  const peopleAssisted = assistedPeopleCount !== undefined && assistedPeopleCount !== null
    ? Math.max(0, assistedPeopleCount)
    : totalPeopleInIncident;

  const isPartial = peopleAssisted < totalPeopleInIncident;
  const remainingPeople = isPartial ? totalPeopleInIncident - peopleAssisted : 0;
  const newIncidentStatus = isPartial ? 'open' : 'resolved';

  // Shelter Capacity Validation & Update
  if (shelterId && evacueesArrivedCount > 0) {
    const { data: shelterData, error: sErr } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', shelterId)
      .single();

    if (sErr || !shelterData) {
      throw new Error(`Selected destination shelter ${shelterId} not found.`);
    }

    const shelter = shelterData as DbShelter;
    const remainingSpots = shelter.capacity - shelter.occupied;

    if (shelter.occupied + evacueesArrivedCount > shelter.capacity) {
      throw new Error(
        `Shelter capacity exceeded: '${shelter.name}' only has ${Math.max(0, remainingSpots)} spots remaining, but ${evacueesArrivedCount} evacuees reported.`
      );
    }

    // Increment shelter occupied count
    const { error: updShelterErr } = await supabase
      .from('shelters')
      .update({ occupied: shelter.occupied + evacueesArrivedCount })
      .eq('id', shelterId);

    if (updShelterErr) {
      throw new Error(`Failed to update shelter occupancy: ${updShelterErr.message}`);
    }
  }

  // Team Readiness Status
  const newTeamStatus = teamReady ? 'available' : 'busy';
  if (assignment.team_id) {
    const { error: updTeamErr } = await supabase
      .from('rescue_teams')
      .update({ status: newTeamStatus })
      .eq('id', assignment.team_id);

    if (updTeamErr) {
      console.warn(`[executeCompleteAssignment] Warning updating team status: ${updTeamErr.message}`);
    }
  }

  // Format notes
  const completedTimestamp = new Date().toISOString();
  let updatedNote = assignment.note || '';
  if (resolutionNotes && resolutionNotes.trim().length > 0) {
    updatedNote = updatedNote
      ? `${updatedNote} | Res: ${resolutionNotes.trim()}`
      : `Res: ${resolutionNotes.trim()}`;
  }
  if (isPartial) {
    const partialNotice = `[Partial Rescue: ${peopleAssisted} assisted, ${remainingPeople} remaining]`;
    updatedNote = updatedNote ? `${updatedNote} ${partialNotice}` : partialNotice;
  }

  // Update Assignment record
  const { error: updAssignErr } = await supabase
    .from('assignments')
    .update({
      status: 'completed',
      completed_at: completedTimestamp,
      shelter_id: shelterId || assignment.shelter_id,
      note: updatedNote,
    })
    .eq('id', assignmentId);

  if (updAssignErr) {
    throw new Error(`Failed to update assignment to completed: ${updAssignErr.message}`);
  }

  // Update Incident record
  if (isPartial) {
    // Keep incident active and update remaining people_count and details
    const appendedDetails = incident.details
      ? `${incident.details}\n[Partial extraction by Unit ${assignment.team_id.slice(0, 8)}: ${peopleAssisted} evacuees assisted. ${remainingPeople} still need evacuation]`
      : `[Partial extraction: ${peopleAssisted} evacuees assisted. ${remainingPeople} still need evacuation]`;

    const { error: updIncErr } = await supabase
      .from('incidents')
      .update({
        status: 'open',
        people_count: remainingPeople,
        details: appendedDetails,
        updated_at: completedTimestamp,
      })
      .eq('id', incident.id);

    if (updIncErr) {
      console.warn(`[executeCompleteAssignment] Warning updating incident partial status: ${updIncErr.message}`);
    }
  } else {
    // Full resolution
    const { error: updIncErr } = await supabase
      .from('incidents')
      .update({
        status: 'resolved',
        updated_at: completedTimestamp,
      })
      .eq('id', incident.id);

    if (updIncErr) {
      console.warn(`[executeCompleteAssignment] Warning marking incident resolved: ${updIncErr.message}`);
    }
  }

  return {
    success: true,
    assignmentId,
    status: 'completed',
    completedAt: completedTimestamp,
    incidentId: incident.id,
    incidentStatus: newIncidentStatus,
    isPartial,
    remainingPeople,
    teamId: assignment.team_id,
    teamStatus: newTeamStatus,
    shelterId: shelterId || assignment.shelter_id,
    evacueesArrivedCount,
    message: isPartial
      ? `Partial rescue logged: ${peopleAssisted} assisted, ${remainingPeople} people remain in need. Incident re-opened in queue.`
      : 'Rescue mission successfully completed. Incident resolved.',
  };
}
