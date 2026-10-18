import test from 'node:test';
import assert from 'node:assert/strict';
import { DbAssignment, DbIncident, DbRescueTeam, DbShelter } from '../types';

/**
 * Pure transition engine for testing lifecycle rules deterministically
 * mirrors executeStartAssignment and executeCompleteAssignment logic.
 */
interface MockDatabaseState {
  assignments: Record<string, DbAssignment>;
  incidents: Record<string, DbIncident>;
  teams: Record<string, DbRescueTeam>;
  shelters: Record<string, DbShelter>;
}

function processStartOperation(
  state: MockDatabaseState,
  assignmentId: string,
  isAuthorized: boolean
) {
  if (!isAuthorized) {
    throw new Error('Unauthorized: Dispatcher or Coordinator authorization required.');
  }

  const assignment = state.assignments[assignmentId];
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  if (assignment.status === 'en_route') {
    return { success: true, alreadyEnRoute: true, assignment };
  }

  if (assignment.status !== 'assigned') {
    throw new Error(`Invalid status transition: Assignment is in status '${assignment.status}' (expected 'assigned')`);
  }

  const incident = state.incidents[assignment.incident_id];
  assignment.status = 'en_route';
  if (incident) {
    incident.status = 'in_progress';
    incident.updated_at = new Date().toISOString();
  }

  return { success: true, assignment, incident };
}

function processCompleteOperation(
  state: MockDatabaseState,
  params: {
    assignmentId: string;
    leaderConfirmed: boolean;
    assistedPeopleCount?: number;
    teamReady?: boolean;
    shelterId?: string | null;
    evacueesArrivedCount?: number;
    resolutionNotes?: string;
  },
  isAuthorized: boolean
) {
  if (!isAuthorized) {
    throw new Error('Unauthorized: Dispatcher or Coordinator authorization required.');
  }

  if (!params.leaderConfirmed) {
    throw new Error('On-scene rescue team leader confirmation is required.');
  }

  const assignment = state.assignments[params.assignmentId];
  if (!assignment) {
    throw new Error(`Assignment ${params.assignmentId} not found`);
  }

  if (assignment.status === 'completed') {
    throw new Error(`Duplicate completion: Assignment ${params.assignmentId} is already completed.`);
  }

  if (assignment.status !== 'en_route' && assignment.status !== 'assigned') {
    throw new Error(`Invalid status transition: Cannot complete an assignment with status '${assignment.status}'.`);
  }

  const incident = state.incidents[assignment.incident_id];
  if (!incident) {
    throw new Error(`Linked incident ${assignment.incident_id} not found`);
  }

  const totalPeople = incident.people_count ?? 1;
  const assistedCount = params.assistedPeopleCount !== undefined
    ? Math.max(0, params.assistedPeopleCount)
    : totalPeople;

  const isPartial = assistedCount < totalPeople;
  const remainingPeople = isPartial ? totalPeople - assistedCount : 0;

  // Shelter capacity check
  if (params.shelterId && (params.evacueesArrivedCount ?? 0) > 0) {
    const shelter = state.shelters[params.shelterId];
    if (!shelter) {
      throw new Error(`Shelter ${params.shelterId} not found`);
    }

    const arrived = params.evacueesArrivedCount ?? 0;
    const remainingSpots = shelter.capacity - shelter.occupied;
    if (shelter.occupied + arrived > shelter.capacity) {
      throw new Error(`Shelter capacity exceeded: '${shelter.name}' only has ${remainingSpots} spots remaining, but ${arrived} evacuees reported.`);
    }

    shelter.occupied += arrived;
  }

  // Team release check
  const team = state.teams[assignment.team_id];
  const teamReady = params.teamReady !== false;
  if (team) {
    team.status = teamReady ? 'available' : 'busy';
  }

  // Update assignment
  assignment.status = 'completed';
  assignment.completed_at = new Date().toISOString();
  if (params.shelterId) assignment.shelter_id = params.shelterId;
  if (params.resolutionNotes) {
    assignment.note = assignment.note
      ? `${assignment.note} | Res: ${params.resolutionNotes}`
      : `Res: ${params.resolutionNotes}`;
  }

  // Update incident
  if (isPartial) {
    incident.status = 'open';
    incident.people_count = remainingPeople;
    incident.details = `${incident.details || ''} [Partial rescue: ${assistedCount} assisted. ${remainingPeople} remain]`;
  } else {
    incident.status = 'resolved';
  }

  return {
    success: true,
    assignment,
    incident,
    team,
    isPartial,
    remainingPeople,
  };
}

function createInitialState(): MockDatabaseState {
  return {
    assignments: {
      'asg-1': {
        id: 'asg-1',
        incident_id: 'inc-1',
        team_id: 'team-boat',
        shelter_id: null,
        estimated_cost: 3500,
        estimated_eta_minutes: 15,
        status: 'assigned',
        approved_at: new Date().toISOString(),
        completed_at: null,
        note: 'High priority flood rescue',
      },
    },
    incidents: {
      'inc-1': {
        id: 'inc-1',
        zone_id: null,
        household_id: null,
        lat: 24.86,
        lng: 67.01,
        people_count: 5,
        flood_severity: 2,
        medical_urgent: false,
        mobility_help: false,
        minutes_to_harm: 45,
        priority_score: 80,
        priority_reason: 'Trapped family',
        verification_status: 'verified',
        status: 'assigned',
        details: 'House rooftop flood rescue',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    teams: {
      'team-boat': {
        id: 'team-boat',
        name: 'Rescue Boat Alpha',
        team_type: 'boat',
        capacity: 6,
        capabilities: ['flood'],
        lat: 24.85,
        lng: 67.02,
        status: 'busy',
        fixed_cost: 2500,
        cost_per_km: 100,
        created_at: new Date().toISOString(),
      },
    },
    shelters: {
      'shelter-1': {
        id: 'shelter-1',
        name: 'Surjani Relief Camp',
        zone_id: null,
        capacity: 20,
        occupied: 16, // 4 spots remaining
        lat: 24.88,
        lng: 67.03,
      },
    },
  };
}

// ----------------------------------------------------------------------------
// TEST 1: Normal Full Completion
// ----------------------------------------------------------------------------
test('Test 1: Normal Full Completion — Incident resolved, team returned to available, completed_at stamped', () => {
  const state = createInitialState();
  // Start operation first
  processStartOperation(state, 'asg-1', true);
  assert.equal(state.assignments['asg-1'].status, 'en_route');
  assert.equal(state.incidents['inc-1'].status, 'in_progress');

  // Complete operation
  const res = processCompleteOperation(
    state,
    {
      assignmentId: 'asg-1',
      leaderConfirmed: true,
      assistedPeopleCount: 5,
      teamReady: true,
      shelterId: 'shelter-1',
      evacueesArrivedCount: 4,
      resolutionNotes: 'All 5 victims safely retrieved',
    },
    true
  );

  assert.equal(res.success, true);
  assert.equal(state.assignments['asg-1'].status, 'completed');
  assert.ok(state.assignments['asg-1'].completed_at !== null);
  assert.equal(state.incidents['inc-1'].status, 'resolved');
  assert.equal(state.teams['team-boat'].status, 'available');
  assert.equal(state.shelters['shelter-1'].occupied, 20); // 16 + 4
});

// ----------------------------------------------------------------------------
// TEST 2: Team Not Ready
// ----------------------------------------------------------------------------
test('Test 2: Team Not Ready — teamReady: false keeps unit in busy state for decontamination/rest', () => {
  const state = createInitialState();
  processStartOperation(state, 'asg-1', true);

  processCompleteOperation(
    state,
    {
      assignmentId: 'asg-1',
      leaderConfirmed: true,
      assistedPeopleCount: 5,
      teamReady: false, // NOT ready
    },
    true
  );

  assert.equal(state.assignments['asg-1'].status, 'completed');
  assert.equal(state.incidents['inc-1'].status, 'resolved');
  assert.equal(state.teams['team-boat'].status, 'busy'); // Kept busy!
});

// ----------------------------------------------------------------------------
// TEST 3: Shelter Full
// ----------------------------------------------------------------------------
test('Test 3: Shelter Full — Attempting to deliver more evacuees than remaining capacity is rejected', () => {
  const state = createInitialState();
  processStartOperation(state, 'asg-1', true);

  // Shelter 1 has 16/20 (4 spots). Attempting 6 evacuees should throw.
  assert.throws(
    () => {
      processCompleteOperation(
        state,
        {
          assignmentId: 'asg-1',
          leaderConfirmed: true,
          assistedPeopleCount: 5,
          shelterId: 'shelter-1',
          evacueesArrivedCount: 6, // Exceeds remaining 4 spots
        },
        true
      );
    },
    (err: Error) => {
      return err.message.includes('Shelter capacity exceeded');
    }
  );

  // Verify shelter occupancy was not modified
  assert.equal(state.shelters['shelter-1'].occupied, 16);
  assert.equal(state.assignments['asg-1'].status, 'en_route');
});

// ----------------------------------------------------------------------------
// TEST 4: No Shelter Selected
// ----------------------------------------------------------------------------
test('Test 4: No Shelter Selected — Dry-ground field triage completes without touching shelters', () => {
  const state = createInitialState();
  processStartOperation(state, 'asg-1', true);

  processCompleteOperation(
    state,
    {
      assignmentId: 'asg-1',
      leaderConfirmed: true,
      assistedPeopleCount: 5,
      shelterId: null,
      evacueesArrivedCount: 0,
    },
    true
  );

  assert.equal(state.assignments['asg-1'].status, 'completed');
  assert.equal(state.shelters['shelter-1'].occupied, 16); // unchanged
});

// ----------------------------------------------------------------------------
// TEST 5: Duplicate Completion Request (Idempotency)
// ----------------------------------------------------------------------------
test('Test 5: Duplicate Completion Request — Repeated completion requests fail and do not double-increment shelter', () => {
  const state = createInitialState();
  processStartOperation(state, 'asg-1', true);

  processCompleteOperation(
    state,
    {
      assignmentId: 'asg-1',
      leaderConfirmed: true,
      assistedPeopleCount: 5,
      shelterId: 'shelter-1',
      evacueesArrivedCount: 2,
    },
    true
  );
  assert.equal(state.shelters['shelter-1'].occupied, 18);

  // Second duplicate completion call
  assert.throws(
    () => {
      processCompleteOperation(
        state,
        {
          assignmentId: 'asg-1',
          leaderConfirmed: true,
          assistedPeopleCount: 5,
          shelterId: 'shelter-1',
          evacueesArrivedCount: 2,
        },
        true
      );
    },
    (err: Error) => err.message.includes('Duplicate completion')
  );

  // Occupancy did NOT increment again
  assert.equal(state.shelters['shelter-1'].occupied, 18);
});

// ----------------------------------------------------------------------------
// TEST 6: Partial Rescue
// ----------------------------------------------------------------------------
test('Test 6: Partial Rescue — When 3 of 5 are rescued, incident stays open with 2 remaining', () => {
  const state = createInitialState();
  processStartOperation(state, 'asg-1', true);

  const res = processCompleteOperation(
    state,
    {
      assignmentId: 'asg-1',
      leaderConfirmed: true,
      assistedPeopleCount: 3, // only 3 of 5
      teamReady: true,
    },
    true
  );

  assert.equal(res.isPartial, true);
  assert.equal(res.remainingPeople, 2);
  assert.equal(state.assignments['asg-1'].status, 'completed');
  // Critical life-first constraint: Incident must NOT be resolved!
  assert.equal(state.incidents['inc-1'].status, 'open');
  assert.equal(state.incidents['inc-1'].people_count, 2);
  assert.ok(state.incidents['inc-1'].details?.includes('Partial rescue'));
  assert.equal(state.teams['team-boat'].status, 'available');
});

// ----------------------------------------------------------------------------
// TEST 7: Invalid Status Transition
// ----------------------------------------------------------------------------
test('Test 7: Invalid Status Transition — Cannot start a completed or cancelled assignment', () => {
  const state = createInitialState();
  state.assignments['asg-1'].status = 'completed';

  assert.throws(
    () => {
      processStartOperation(state, 'asg-1', true);
    },
    (err: Error) => err.message.includes('Invalid status transition')
  );
});

// ----------------------------------------------------------------------------
// TEST 8: Unauthorized Request
// ----------------------------------------------------------------------------
test('Test 8: Unauthorized Request — Operation fails if coordinator authorization is missing', () => {
  const state = createInitialState();

  assert.throws(
    () => {
      processStartOperation(state, 'asg-1', false); // unauthorized
    },
    (err: Error) => err.message.includes('Unauthorized')
  );

  assert.throws(
    () => {
      processCompleteOperation(
        state,
        { assignmentId: 'asg-1', leaderConfirmed: true },
        false // unauthorized
      );
    },
    (err: Error) => err.message.includes('Unauthorized')
  );
});
