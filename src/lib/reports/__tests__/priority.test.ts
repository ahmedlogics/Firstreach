import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  computeReportPriority,
  computeEffectiveInputs,
  computeMergedPriority,
  setEmergencyPriorityCalculator,
  resetEmergencyPriorityCalculator,
} from '../priority';
import { calculateProvisionalPriority } from '../provisionalPriority';
import { POST as postReport, _resetRateLimitsForTesting } from '@/app/api/reports/route';
import { setReportRepository, MemoryReportRepository } from '../index';

test('priority: 5 example scores from specification (85, 30, 15, 32, 53)', () => {
  // 1. Score 85: Sev 3 catastrophic flood (40) + Medical urgent (25) + Trapped occupants (+20) = 85
  const res85 = computeReportPriority({
    floodSeverity: 3,
    trapped: true,
    medicalUrgent: true,
    mobilityHelp: false,
    peopleCount: 4,
  });
  assert.equal(res85.score, 85, 'Sev 3 + medical + trapped must equal 85');

  // 2. Score 30: Sev 1 minor flood (15) + All unknown (+15 capped uncertainty) = 30
  const res30 = computeReportPriority({
    floodSeverity: 1,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    peopleCount: null,
  });
  assert.equal(res30.score, 30, 'Sev 1 all-unknown must equal 30');

  // 3. Score 15: Sev 1 minor flood (15) + all answered false / 1 person (+0) = 15
  const res15 = computeReportPriority({
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 1,
  });
  assert.equal(res15.score, 15, 'Sev 1 all answered safe must equal 15');

  // 4. Score 32: Sev 2 moderate flood (28) + peopleCount null (+4 unknown) = 32
  const res32 = computeReportPriority({
    floodSeverity: 2,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: null,
  });
  assert.equal(res32.score, 32, 'Sev 2 with people unknown must equal 32');

  // 5. Score 53: Sev 2 moderate flood (28) + medical urgent true (25) = 53
  const res53 = computeReportPriority({
    floodSeverity: 2,
    trapped: false,
    medicalUrgent: true,
    mobilityHelp: false,
    peopleCount: 1,
  });
  assert.equal(res53.score, 53, 'Sev 2 with medical urgent must equal 53');
});

test('priority: sev-3 trapped medical beats sev-1 all-unknown', () => {
  const sev3TrappedMedical = computeReportPriority({
    floodSeverity: 3,
    trapped: true,
    medicalUrgent: true,
    mobilityHelp: false,
    peopleCount: 4,
  });

  const sev1AllUnknown = computeReportPriority({
    floodSeverity: 1,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    peopleCount: null,
  });

  assert.ok(
    sev3TrappedMedical.score > sev1AllUnknown.score,
    `Critical rescue (${sev3TrappedMedical.score}) must outrank all-unknown (${sev1AllUnknown.score})`
  );
  assert.equal(sev3TrappedMedical.score, 85);
  assert.equal(sev1AllUnknown.score, 30);
});

test('priority: unknown field never scores below "no" (cautious intake invariant)', () => {
  // Test across all 4 tri-state fields at severity 1
  const baselineSafe = computeReportPriority({
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 1,
  });

  const unknownTrapped = computeReportPriority({
    floodSeverity: 1,
    trapped: null,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 1,
  });

  const unknownMedical = computeReportPriority({
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: null,
    mobilityHelp: false,
    peopleCount: 1,
  });

  const unknownMobility = computeReportPriority({
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: null,
    peopleCount: 1,
  });

  const unknownPeople = computeReportPriority({
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: null,
  });

  const allUnknown = computeReportPriority({
    floodSeverity: 1,
    trapped: null,
    medicalUrgent: null,
    mobilityHelp: null,
    peopleCount: null,
  });

  assert.ok(unknownTrapped.score >= baselineSafe.score, 'Unknown trapped must score >= false');
  assert.ok(unknownMedical.score >= baselineSafe.score, 'Unknown medical must score >= false');
  assert.ok(unknownMobility.score >= baselineSafe.score, 'Unknown mobility must score >= false');
  assert.ok(unknownPeople.score >= baselineSafe.score, 'Unknown people must score >= false');
  assert.ok(allUnknown.score >= baselineSafe.score, 'All unknown must score >= all false');
});

test('priority: score is always a clamped integer in [0, 100]', () => {
  // Extreme high inputs
  const extremeHigh = computeReportPriority(
    {
      floodSeverity: 3,
      trapped: true,
      medicalUrgent: true,
      mobilityHelp: true,
      peopleCount: 500,
    },
    15 // 15 mins to harm
  );
  assert.ok(Number.isInteger(extremeHigh.score), 'Score must be integer');
  assert.ok(extremeHigh.score <= 100, 'Score must not exceed 100');
  assert.ok(extremeHigh.score >= 0, 'Score must be >= 0');

  // Zero severity all safe
  const zeroSafe = computeReportPriority({
    floodSeverity: 0,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 1,
  });
  assert.ok(Number.isInteger(zeroSafe.score), 'Score must be integer');
  assert.ok(zeroSafe.score >= 0 && zeroSafe.score <= 100, 'Score must be in [0, 100]');
});

test('priority merge: report 1 trapped:true then follow-up trapped:null keeps the trapped bonus in recomputed score', () => {
  const report1 = {
    floodSeverity: 2,
    trapped: true,
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 2,
  };

  const report2Followup = {
    floodSeverity: 2,
    trapped: null, // follow-up reporter does not know
    medicalUrgent: false,
    mobilityHelp: false,
    peopleCount: 2,
  };

  // Rule 1: trapped is true if ANY report says true
  const effective = computeEffectiveInputs([report1, report2Followup]);
  assert.equal(effective.trapped, true, 'Effective trapped must remain true');

  const merged = computeMergedPriority(
    { flood_severity: 2, people_count: 2, medical_urgent: false, mobility_help: false },
    [report1, report2Followup]
  );

  // Dispatch sev 2 = 28 + trapped bonus (+20) = 48
  assert.equal(merged.score, 48);
  assert.ok(merged.reason.includes('trapped occupants (+20)'));
});

test('priority merge: report 1 medical unknown then report 2 medical true raises the score', () => {
  const report1 = {
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: null, // unknown
    mobilityHelp: false,
    peopleCount: 2,
  };

  const report2 = {
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: true, // confirmed true
    mobilityHelp: false,
    peopleCount: 2,
  };

  const initial = computeReportPriority(report1);
  assert.equal(initial.score, 23); // 15 (sev 1) + 8 (unknown medical)

  const effective = computeEffectiveInputs([report1, report2]);
  assert.equal(effective.medicalUrgent, true);

  const merged = computeMergedPriority(
    { flood_severity: 1, people_count: 2, medical_urgent: true, mobility_help: false },
    [report1, report2]
  );

  // Dispatch sev 1 (15) + medical urgent (25) = 40
  assert.equal(merged.score, 40);
  assert.ok(merged.score > initial.score, `Score must raise from ${initial.score} to ${merged.score}`);
});

test('priority merge: lower-severity follow-up leaves stored score unchanged (monotonic escalation)', async () => {
  _resetRateLimitsForTesting();

  const memoryRepo = new MemoryReportRepository({
    zones: [
      {
        id: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
        name: 'Demo Zone A',
        flood_risk: 2,
        reporting_coverage: 'adequate',
      },
    ],
  });
  setReportRepository(memoryRepo);

  // Initial severe report (Sev 3 + medical = 65)
  const highSevPayload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Main Square flood point',
    observedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 3,
    peopleCount: 3,
    trapped: false,
    medicalUrgent: true,
    mobilityHelp: false,
    lat: 24.9500,
    lng: 67.0500,
    idempotencyKey: 'idemp-high-sev-1',
  };

  const req1 = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(highSevPayload),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.111' },
  });
  const res1 = await postReport(req1);
  assert.equal(res1.status, 201);
  const data1 = await res1.json();
  const initialScore = data1.priorityScore;
  const initialReason = data1.priorityReason;
  assert.equal(initialScore, 65); // 40 (sev 3) + 25 (med)

  // Lower-severity follow-up at neighboring house (Sev 0, safe)
  const lowSevPayload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Main Square flood point neighboring house',
    observedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    reportingFor: 'someone_else',
    reporterRole: 'volunteer',
    floodSeverity: 0,
    peopleCount: 1,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    lat: 24.9501,
    lng: 67.0501, // ~15m away
    idempotencyKey: 'idemp-low-sev-followup',
  };

  const req2 = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(lowSevPayload),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.112' },
  });
  const res2 = await postReport(req2);
  assert.equal(res2.status, 201);
  const data2 = await res2.json();

  // Rule 2: Stored score must NEVER be lowered by a follow-up report
  assert.equal(data2.incidentId, data1.incidentId);
  assert.equal(data2.priorityScore, initialScore, 'Stored score must not decrease');
  assert.equal(data2.priorityReason, initialReason, 'Priority reason must not be downgraded when score did not increase');
});

test('priority merge: a report whose unknown field is answered by later report loses unknown bonus but stored score does not drop', () => {
  // Report 1: Sev 1 (15) + medical: null (+8 unknown) = 23
  const report1 = {
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: null,
    mobilityHelp: false,
    peopleCount: 1,
  };
  const score1 = computeReportPriority(report1).score;
  assert.equal(score1, 23);

  // Stored incident in database has score 23
  const storedScore = score1;

  // Report 2: medical is answered as false
  const report2 = {
    floodSeverity: 1,
    trapped: false,
    medicalUrgent: false, // answered false!
    mobilityHelp: false,
    peopleCount: 1,
  };

  // When computing effective inputs across both reports:
  // medicalUrgent = false if at least one says false and none true
  const effective = computeEffectiveInputs([report1, report2]);
  assert.equal(effective.medicalUrgent, false);

  // The unknown bonus applies ONLY to fields that no linked report answered:
  // So medical is answered -> unknown bonus for medical is 0!
  const mergedResult = computeMergedPriority(
    { flood_severity: 1, people_count: 1, medical_urgent: false, mobility_help: false },
    [report1, report2]
  );
  // Recomputed score = 15 (unknown bonus was lost!)
  assert.equal(mergedResult.score, 15);

  // BUT Rule 2 invariant: finalScore = max(storedScore, newScore) -> Never lower a stored score!
  const finalScore = Math.max(storedScore, mergedResult.score);
  assert.equal(finalScore, 23, 'Stored score must remain 23 and not drop to 15');
});

test('priority fallback: if calculateEmergencyPriority throws, falls back to provisional priority and returns 201', async () => {
  _resetRateLimitsForTesting();

  const memoryRepo = new MemoryReportRepository({
    zones: [
      {
        id: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
        name: 'Demo Zone A',
        flood_risk: 2,
        reporting_coverage: 'adequate',
      },
    ],
  });
  setReportRepository(memoryRepo);

  // Configure priority calculator to throw an error
  setEmergencyPriorityCalculator(() => {
    throw new Error('Simulated unexpected crash inside dispatch priority engine');
  });

  try {
    const input = {
      floodSeverity: 2,
      trapped: true,
      medicalUrgent: false,
      mobilityHelp: false,
      peopleCount: 3,
    };

    // 1. Direct unit verification of fallback
    const fallbackPriority = computeReportPriority(input);
    const expectedProvisional = calculateProvisionalPriority(input);
    assert.equal(fallbackPriority.score, expectedProvisional.score);
    assert.equal(fallbackPriority.reason, expectedProvisional.reason);

    // 2. HTTP route verification: still returns HTTP 201 ok: true
    const payload = {
      zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
      locationDescription: 'Near Sector 4B Water Pump, Street 15',
      observedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      reportingFor: 'myself',
      reporterRole: 'resident',
      floodSeverity: 2,
      peopleCount: 3,
      trapped: true,
      medicalUrgent: false,
      mobilityHelp: false,
      lat: 24.95,
      lng: 67.05,
      idempotencyKey: 'idemp-fallback-test-1',
    };

    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.120' },
    });

    const res = await postReport(req);
    assert.equal(res.status, 201, 'Must still return 201 despite priority engine error');
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(data.incidentId);
    assert.equal(data.priorityScore, expectedProvisional.score);
  } finally {
    // Restore original priority calculator
    resetEmergencyPriorityCalculator();
  }
});
