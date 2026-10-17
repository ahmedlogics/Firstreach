import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DbIncident,
  DbRescueTeam,
  calculateEmergencyPriority,
  getEligibleRescueTeams,
  recommendRescueAssignments,
  calculateDistanceKm,
  estimateDispatchCost,
  estimateArrivalMinutes,
} from '../index';

// Helper fixtures
const mockLocationKarachi1 = { lat: 24.8605, lng: 67.011 };
const mockLocationKarachi2 = { lat: 24.878, lng: 67.028 };

test('Test 1: Life-first allocation — Incident A (Critical/expensive) prioritized over Incident B (Low/cheap)', () => {
  const incidentA: DbIncident = {
    id: 'inc-critical-expensive',
    zone_id: null,
    household_id: null,
    lat: 24.8605,
    lng: 67.011,
    people_count: 4,
    flood_severity: 3,
    medical_urgent: true,
    mobility_help: false,
    minutes_to_harm: 20,
    priority_score: 95,
    priority_reason: 'Critical imminent hazard',
    verification_status: 'verified',
    status: 'open',
    details: 'Trapped family in deep flood waters',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const incidentB: DbIncident = {
    id: 'inc-moderate-cheap',
    zone_id: null,
    household_id: null,
    lat: 24.861,
    lng: 67.012,
    people_count: 2,
    flood_severity: 1,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 180,
    priority_score: 40,
    priority_reason: 'Preventive evacuation',
    verification_status: 'verified',
    status: 'open',
    details: 'Preventive staging',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only ONE boat team available
  const singleTeam: DbRescueTeam = {
    id: 'team-zodiac-alpha',
    name: 'Edhi Swiftwater Alpha',
    team_type: 'boat',
    capacity: 6,
    capabilities: ['flood', 'medical'],
    lat: 24.88,
    lng: 67.03,
    status: 'available',
    fixed_cost: 6000,
    cost_per_km: 150,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([incidentB, incidentA], [singleTeam]);

  // Even though incidentB was passed first, Incident A MUST be assigned because of life safety
  assert.equal(result.recommendations.length, 1);
  assert.equal(result.recommendations[0].incident.id, incidentA.id);
  assert.equal(result.recommendations[0].recommendedTeam.id, singleTeam.id);

  // Incident B must be placed in unserved because only 1 resource existed
  assert.equal(result.unserved.length, 1);
  assert.equal(result.unserved[0].incident.id, incidentB.id);
});

test('Test 2: Insufficient capacity — Team with capacity 5 cannot single-rescue 8 people', () => {
  const largeIncident: DbIncident = {
    id: 'inc-large-group',
    zone_id: null,
    household_id: null,
    lat: 24.8605,
    lng: 67.011,
    people_count: 8,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 60,
    priority_score: 75,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: '8 people stranded on roof',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const smallTeam: DbRescueTeam = {
    id: 'team-small-boat',
    name: 'Rescue Boat Small',
    team_type: 'boat',
    capacity: 5,
    capabilities: ['flood'],
    lat: 24.868,
    lng: 67.015,
    status: 'available',
    fixed_cost: 2500,
    cost_per_km: 100,
    created_at: new Date().toISOString(),
  };

  const evaluation = getEligibleRescueTeams(largeIncident, [smallTeam]);
  assert.equal(evaluation.eligible.length, 0);
  assert.equal(evaluation.rejected.length, 1);
  assert.match(
    evaluation.rejected[0].rejectionReasons[0],
    /Insufficient capacity/
  );
});

test('Test 3: Missing capability — Medical-only team lacks flood capability for flood incident', () => {
  const floodIncident: DbIncident = {
    id: 'inc-flood-req',
    zone_id: null,
    household_id: null,
    lat: 24.8605,
    lng: 67.011,
    people_count: 2,
    flood_severity: 3,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 30,
    priority_score: 80,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: 'Fast-moving surge water',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const ambulanceTeam: DbRescueTeam = {
    id: 'team-med-ambulance',
    name: 'Road Ambulance Unit C',
    team_type: 'medical',
    capacity: 3,
    capabilities: ['medical'],
    lat: 24.85,
    lng: 67.02,
    status: 'available',
    fixed_cost: 1800,
    cost_per_km: 95,
    created_at: new Date().toISOString(),
  };

  const evaluation = getEligibleRescueTeams(floodIncident, [ambulanceTeam]);
  assert.equal(evaluation.eligible.length, 0);
  assert.equal(evaluation.rejected.length, 1);
  assert.match(
    evaluation.rejected[0].rejectionReasons[0],
    /Lacks mandatory capabilities: flood-rescue capability/
  );
});

test('Test 4: Unavailable team — Team with status busy is excluded', () => {
  const incident: DbIncident = {
    id: 'inc-test-4',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 2,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 45,
    priority_score: 70,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: 'test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const busyTeam: DbRescueTeam = {
    id: 'team-busy-1',
    name: 'Busy Boat 1',
    team_type: 'boat',
    capacity: 6,
    capabilities: ['flood'],
    lat: 24.86,
    lng: 67.01,
    status: 'busy',
    fixed_cost: 2500,
    cost_per_km: 100,
    created_at: new Date().toISOString(),
  };

  const evaluation = getEligibleRescueTeams(incident, [busyTeam]);
  assert.equal(evaluation.eligible.length, 0);
  assert.equal(evaluation.rejected.length, 1);
  assert.match(evaluation.rejected[0].rejectionReasons[0], /Team is currently busy/);
});

test('Test 5: No feasible team — Incident appears in unserved list with clear blocking reasons', () => {
  const incident: DbIncident = {
    id: 'inc-unserved-case',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 6,
    flood_severity: 3,
    medical_urgent: true,
    mobility_help: false,
    minutes_to_harm: 15,
    priority_score: 95,
    priority_reason: 'Critical water depth',
    verification_status: 'verified',
    status: 'open',
    details: 'Dialysis patient trapped',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only team available is a small vehicle without flood/medical
  const unusableTeam: DbRescueTeam = {
    id: 'team-truck-1',
    name: 'Utility Truck',
    team_type: 'vehicle',
    capacity: 2,
    capabilities: ['transport'],
    lat: 24.86,
    lng: 67.01,
    status: 'available',
    fixed_cost: 1500,
    cost_per_km: 80,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([incident], [unusableTeam]);
  assert.equal(result.recommendations.length, 0);
  assert.equal(result.unserved.length, 1);
  assert.equal(result.unserved[0].incident.id, incident.id);
  assert.ok(result.unserved[0].blockingReasons.length > 0);
  assert.match(result.unserved[0].suggestedEscalation, /CRITICAL ACTION REQUIRED/);
});

test('Test 6: Cost as secondary criterion — When 2 teams are comparably effective and timely, lower cost breaks tie', () => {
  const incident: DbIncident = {
    id: 'inc-tiebreaker',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 3,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 120, // plentiful time
    priority_score: 65,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: 'test tiebreaker',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Team 1: Nearby (3 km), slightly higher fixed cost
  const expensiveTeam: DbRescueTeam = {
    id: 'team-expensive',
    name: 'Premium Swiftwater Unit',
    team_type: 'boat',
    capacity: 6,
    capabilities: ['flood'],
    lat: 24.862,
    lng: 67.012,
    status: 'available',
    fixed_cost: 5000,
    cost_per_km: 150,
    created_at: new Date().toISOString(),
  };

  // Team 2: Similar distance (3.5 km), identical capabilities and capacity, but much lower fixed cost
  const economicalTeam: DbRescueTeam = {
    id: 'team-economical',
    name: 'Community Volunteer Boat',
    team_type: 'boat',
    capacity: 6,
    capabilities: ['flood'],
    lat: 24.863,
    lng: 67.013,
    status: 'available',
    fixed_cost: 2000,
    cost_per_km: 100,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([incident], [expensiveTeam, economicalTeam]);
  assert.equal(result.recommendations.length, 1);
  assert.equal(result.recommendations[0].recommendedTeam.id, economicalTeam.id);
  assert.equal(result.recommendations[0].alternativeTeams[0].team.id, expensiveTeam.id);
});

test('Test 7: Missing coordinates — Does not fabricate distance or ETA; adds verification warning', () => {
  const missingCoordsIncident: DbIncident = {
    id: 'inc-no-coords',
    zone_id: null,
    household_id: null,
    lat: null,
    lng: null,
    people_count: 2,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 60,
    priority_score: 60,
    priority_reason: null,
    verification_status: 'unverified',
    status: 'open',
    details: 'Location unknown',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const boatTeam: DbRescueTeam = {
    id: 'team-boat-coords',
    name: 'Boat Team Alpha',
    team_type: 'boat',
    capacity: 4,
    capabilities: ['flood'],
    lat: 24.86,
    lng: 67.01,
    status: 'available',
    fixed_cost: 2500,
    cost_per_km: 110,
    created_at: new Date().toISOString(),
  };

  const evaluation = getEligibleRescueTeams(missingCoordsIncident, [boatTeam]);
  assert.equal(evaluation.eligible.length, 1);
  const suitability = evaluation.eligible[0];
  assert.equal(suitability.distanceKm, null);
  assert.equal(suitability.simulatedEtaMinutes, null);
  assert.ok(suitability.warning);
  assert.match(suitability.warning, /Location verification required/);
});

test('Test 8: Double assignment prevention — A single team is not recommended for two separate incidents in one run', () => {
  const incident1: DbIncident = {
    id: 'inc-1',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 2,
    flood_severity: 3,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 30,
    priority_score: 85,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: 'Emergency 1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const incident2: DbIncident = {
    id: 'inc-2',
    zone_id: null,
    household_id: null,
    lat: 24.87,
    lng: 67.02,
    people_count: 2,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 45,
    priority_score: 75,
    priority_reason: null,
    verification_status: 'verified',
    status: 'open',
    details: 'Emergency 2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only ONE available team in fleet
  const soloTeam: DbRescueTeam = {
    id: 'team-solo',
    name: 'Solo Swiftwater Boat',
    team_type: 'boat',
    capacity: 4,
    capabilities: ['flood'],
    lat: 24.86,
    lng: 67.01,
    status: 'available',
    fixed_cost: 2000,
    cost_per_km: 100,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([incident1, incident2], [soloTeam]);

  // First incident gets the team
  assert.equal(result.recommendations.length, 1);
  assert.equal(result.recommendations[0].incident.id, incident1.id);
  assert.equal(result.recommendations[0].recommendedTeam.id, soloTeam.id);

  // Second incident cannot get the same team — placed into unserved queue
  assert.equal(result.unserved.length, 1);
  assert.equal(result.unserved[0].incident.id, incident2.id);
  assert.match(result.unserved[0].blockingReasons[0], /Zero rescue teams currently available/);
});

test('Test 9: Time-critical rescue — Faster team arrives before harm; cheaper team arrives too late and is deprioritized', () => {
  const urgentIncident: DbIncident = {
    id: 'inc-urgent-harm',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 2,
    flood_severity: 3,
    medical_urgent: true,
    mobility_help: false,
    minutes_to_harm: 20, // 20 minutes before water submerges roof!
    priority_score: 95,
    priority_reason: 'Critical rising water',
    verification_status: 'verified',
    status: 'open',
    details: 'Family on roof ledge',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Team Fast: 3 km away -> simulated ETA ~10 min (arrives BEFORE harm), costs Rs. 5,000
  const fastTeam: DbRescueTeam = {
    id: 'team-fast-near',
    name: 'Rapid Response Zodiac',
    team_type: 'boat',
    capacity: 4,
    capabilities: ['flood', 'medical'],
    lat: 24.875,
    lng: 67.025,
    status: 'available',
    fixed_cost: 5000,
    cost_per_km: 150,
    created_at: new Date().toISOString(),
  };

  // Team Slow: 18 km away -> simulated ETA ~46 min (arrives TOO LATE after harm!), costs only Rs. 1,000
  const slowCheapTeam: DbRescueTeam = {
    id: 'team-slow-far',
    name: 'Far Rural Inflatable',
    team_type: 'boat',
    capacity: 4,
    capabilities: ['flood', 'medical'],
    lat: 24.70,
    lng: 66.90,
    status: 'available',
    fixed_cost: 1000,
    cost_per_km: 50,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([urgentIncident], [slowCheapTeam, fastTeam]);

  // Fast team MUST be recommended despite costing 5x more! Life safety is paramount!
  assert.equal(result.recommendations.length, 1);
  assert.equal(result.recommendations[0].recommendedTeam.id, fastTeam.id);

  // The slow team should be flagged as potentially too late
  const slowAlternative = result.recommendations[0].alternativeTeams.find(
    (t) => t.team.id === slowCheapTeam.id
  );
  assert.ok(slowAlternative);
  assert.equal(slowAlternative.isPotentiallyTooLate, true);
  assert.match(slowAlternative.warning || '', /Potentially too late/);
});

test('Test 10: Existing assigned incident — Already assigned incident is skipped from open allocation', () => {
  const alreadyAssignedIncident: DbIncident = {
    id: 'inc-already-assigned',
    zone_id: null,
    household_id: null,
    lat: 24.86,
    lng: 67.01,
    people_count: 2,
    flood_severity: 2,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: 60,
    priority_score: 70,
    priority_reason: null,
    verification_status: 'verified',
    status: 'assigned', // already assigned!
    details: 'Assigned earlier',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const boatTeam: DbRescueTeam = {
    id: 'team-available',
    name: 'Available Boat',
    team_type: 'boat',
    capacity: 6,
    capabilities: ['flood'],
    lat: 24.86,
    lng: 67.01,
    status: 'available',
    fixed_cost: 2000,
    cost_per_km: 100,
    created_at: new Date().toISOString(),
  };

  const result = recommendRescueAssignments([alreadyAssignedIncident], [boatTeam]);
  assert.equal(result.evaluatedIncidentCount, 0);
  assert.equal(result.recommendations.length, 0);
  assert.equal(result.unserved.length, 0);
});

test('Priority Engine: calculates deterministic breakdown and handles unknown minutes_to_harm safely', () => {
  const incUnknownTime: Partial<DbIncident> = {
    flood_severity: 2, // 28 pts
    medical_urgent: true, // 25 pts
    mobility_help: false, // 0 pts
    minutes_to_harm: null, // unknown!
    people_count: 2,
  };

  const res = calculateEmergencyPriority(incUnknownTime);
  assert.equal(res.score, 53); // 28 + 25 = 53
  assert.equal(res.tier, 'medium');
  assert.equal(res.breakdown.timeUrgencyUnknown, true);
  assert.equal(res.breakdown.needsVerification, true);
  assert.match(res.reason, /time-to-harm unconfirmed/);
});
