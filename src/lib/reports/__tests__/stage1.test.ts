import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emergencyReportSchema,
  reporterRoleToSource,
  severityToLevel,
  levelToSeverity,
  computeMissingFields,
  toIncidentColumns,
  calculateProvisionalPriority,
  haversineMeters,
  findPossibleDuplicate,
  mergeRaiseOnly,
  CandidateIncident,
} from '../index';

test('schema: valid full report passes validation', () => {
  const valid = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Near Sector 4B Water Pump, Street 7',
    observedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reportingFor: 'someone_else',
    reporterRole: 'volunteer',
    floodSeverity: 3,
    peopleCount: 4,
    trapped: true,
    medicalUrgent: true,
    mobilityHelp: false,
    lat: 24.95,
    lng: 67.05,
    description: 'Ground floor submerged, family waving from rooftop',
    reporterName: 'Ahmed Raza',
    reporterPhone: '+92 300 1234567',
    idempotencyKey: 'idemp-1234567890',
  };

  const parsed = emergencyReportSchema.parse(valid);
  assert.equal(parsed.zoneId, valid.zoneId);
  assert.equal(parsed.floodSeverity, 3);
  assert.equal(parsed.trapped, true);
});

test('schema: invalid UUID zone fails validation', () => {
  const invalid = {
    zoneId: 'zone-surjani', // Not a UUID
    locationDescription: 'Near Sector 4B Water Pump',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 2,
    peopleCount: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
  };

  const result = emergencyReportSchema.safeParse(invalid);
  assert.equal(result.success, false);
  if (!result.success) {
    const issue = result.error.issues.find((i) => i.path[0] === 'zoneId');
    assert.ok(issue, 'Should report error on zoneId');
  }
});

test('schema: future date and date older than 72 hours fail validation', () => {
  const base = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Valid landmark location',
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 1,
    peopleCount: 1,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
  };

  // 10 minutes in the future
  const future = {
    ...base,
    observedAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
  assert.equal(emergencyReportSchema.safeParse(future).success, false);

  // 75 hours in the past
  const past = {
    ...base,
    observedAt: new Date(Date.now() - 75 * 60 * 60 * 1000).toISOString(),
  };
  assert.equal(emergencyReportSchema.safeParse(past).success, false);
});

test('schema: coordinates outside Karachi fail bounds validation', () => {
  const invalidLat = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Some street location',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 1,
    peopleCount: null,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    lat: 33.6844, // Islamabad latitude!
    lng: 67.05,
  };
  assert.equal(emergencyReportSchema.safeParse(invalidLat).success, false);
});

test('schema: unknown extra keys are rejected by strict()', () => {
  const extraKeys = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Some street location',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 1,
    peopleCount: 1,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    unknownHackField: 'malicious',
  };
  assert.equal(emergencyReportSchema.safeParse(extraKeys).success, false);
});

test('mapping: reporterRoleToSource maps correctly', () => {
  assert.equal(reporterRoleToSource('volunteer'), 'volunteer');
  assert.equal(reporterRoleToSource('resident'), 'resident');
  assert.equal(reporterRoleToSource('neighbor'), 'resident');
  assert.equal(reporterRoleToSource('other'), 'resident');
});

test('mapping: severity label conversions', () => {
  assert.equal(severityToLevel(0), 'low');
  assert.equal(severityToLevel(1), 'medium');
  assert.equal(severityToLevel(2), 'high');
  assert.equal(severityToLevel(3), 'critical');

  assert.equal(levelToSeverity('low'), 0);
  assert.equal(levelToSeverity('medium'), 1);
  assert.equal(levelToSeverity('high'), 2);
  assert.equal(levelToSeverity('critical'), 3);
});

test('mapping: computeMissingFields identifies all tri-state nulls', () => {
  const input = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Some Street',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself' as const,
    reporterRole: 'resident' as const,
    floodSeverity: 2,
    peopleCount: null,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    lat: null,
    lng: null,
  };

  const missing = computeMissingFields(input);
  assert.deepEqual(missing.sort(), [
    'coordinates',
    'medicalUrgent',
    'mobilityHelp',
    'peopleCount',
    'trapped',
  ]);
});

test('mapping: toIncidentColumns assigns safe defaults and notes unknown fields', () => {
  const input = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    locationDescription: 'Surjani Block 3, near bridge',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself' as const,
    reporterRole: 'resident' as const,
    floodSeverity: 1,
    peopleCount: null, // unknown
    trapped: null, // unknown
    medicalUrgent: null, // unknown
    mobilityHelp: null, // unknown
  };

  const cols = toIncidentColumns(input, 40, 'Provisional: Test');
  assert.equal(cols.people_count, 1, 'Defaults to 1 for NOT NULL column');
  assert.equal(cols.medical_urgent, false, 'Defaults to false for NOT NULL column');
  assert.equal(cols.mobility_help, false, 'Defaults to false for NOT NULL column');
  assert.equal(cols.verification_status, 'unverified');
  assert.ok(cols.details.includes('Unknown:'));
  assert.ok(cols.details.includes('peopleCount'));
  assert.ok(cols.details.includes('trapped'));
});

test('priority: never returns 0 and starts with "Provisional:"', () => {
  const minimal = {
    floodSeverity: 0,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 1,
  };

  const result = calculateProvisionalPriority(minimal);
  assert.ok(result.score > 0, 'Score must be greater than 0');
  assert.ok(result.reason.startsWith('Provisional:'), 'Reason must start with Provisional:');

  const severe = {
    floodSeverity: 3,
    trapped: true,
    medicalUrgent: true,
    mobilityHelp: true,
    peopleCount: 6,
  };

  const severeResult = calculateProvisionalPriority(severe, 30);
  assert.ok(severeResult.score >= 90, 'Severe case should have very high priority');
});

test('duplicates: haversine accurately measures short distances', () => {
  // Two points in Karachi approx 35 meters apart
  const d = haversineMeters(24.95000, 67.05000, 24.95025, 67.05020);
  assert.ok(d > 20 && d < 50, `Expected distance ~35m, got ${d}`);
});

test('duplicates: findPossibleDuplicate finds nearby active incident within 2 hours', () => {
  const now = Date.now();
  const existing: CandidateIncident = {
    id: 'inc-11111111-2222-3333-4444-555555555555',
    zone_id: 'zone-1111',
    household_id: null,
    lat: 24.95000,
    lng: 67.05000,
    status: 'open',
    created_at: new Date(now - 15 * 60 * 1000).toISOString(),
    flood_severity: 1,
    people_count: 2,
    medical_urgent: false,
    mobility_help: false,
    verification_status: 'unverified',
  };

  // Nearby report (same zone, 25m away, 10 min later)
  const nearbyReport = {
    zoneId: 'zone-1111',
    lat: 24.95015,
    lng: 67.05010,
    observedAt: new Date(now - 5 * 60 * 1000).toISOString(),
  };

  const match = findPossibleDuplicate(nearbyReport, [existing]);
  assert.ok(match, 'Should find duplicate');
  assert.equal(match?.matchedIncidentId, existing.id);

  // Far report (> 100m away)
  const farReport = {
    zoneId: 'zone-1111',
    lat: 24.96000,
    lng: 67.06000,
    observedAt: new Date(now).toISOString(),
  };
  assert.equal(findPossibleDuplicate(farReport, [existing]), null);

  // Resolved incident should not match
  const resolvedExisting = { ...existing, status: 'resolved' };
  assert.equal(findPossibleDuplicate(nearbyReport, [resolvedExisting]), null);
});

test('duplicates: mergeRaiseOnly only raises values and flags conflicting if diff >= 2', () => {
  const existing: CandidateIncident = {
    id: 'inc-1',
    zone_id: 'zone-1',
    lat: 24.95,
    lng: 67.05,
    status: 'open',
    created_at: new Date().toISOString(),
    flood_severity: 1,
    people_count: 3,
    medical_urgent: false,
    mobility_help: true,
    verification_status: 'unverified',
  };

  // New report has severity 3 (diff = 2 -> conflicting), peopleCount 5 (raise to 5), medicalUrgent true (raise to true)
  const incoming = {
    floodSeverity: 3,
    peopleCount: 5,
    medicalUrgent: true,
    mobilityHelp: null,
  };

  const merged = mergeRaiseOnly(existing, incoming);
  assert.equal(merged.updatedFields.flood_severity, 3);
  assert.equal(merged.updatedFields.people_count, 5);
  assert.equal(merged.updatedFields.medical_urgent, true);
  assert.equal(merged.updatedFields.mobility_help, true, 'Does not reset true to false');
  assert.equal(merged.isConflicting, true);
  assert.equal(merged.updatedFields.verification_status, 'conflicting');

  // Follow-up report with lower values CANNOT lower existing incident
  const lowerReport = {
    floodSeverity: 0,
    peopleCount: 1,
    medicalUrgent: false,
    mobilityHelp: false,
  };
  const mergedLower = mergeRaiseOnly(merged.updatedFields as any, lowerReport);
  assert.equal(mergedLower.updatedFields.flood_severity, 3, 'Severity must not be lowered');
  assert.equal(mergedLower.updatedFields.people_count, 5, 'People count must not be lowered');
  assert.equal(mergedLower.updatedFields.medical_urgent, true, 'Medical urgency must not be downgraded');
  assert.equal(mergedLower.updatedFields.mobility_help, true, 'Mobility help must not be downgraded');
});
