import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MemoryReportRepository,
  SupabaseReportRepository,
  ReportInsert,
  IncidentInsertColumns,
} from '../index';

test('MemoryReportRepository: insertReport preserves payload untouched and sets received_at', async () => {
  const repo = new MemoryReportRepository();

  const originalPayload = {
    zoneId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    trapped: null,
    peopleCount: null,
    idempotencyKey: 'idem-test-1',
  };

  const reportInsert: ReportInsert = {
    source: 'resident',
    payload: originalPayload,
    event_at: new Date().toISOString(),
  };

  const saved = await repo.insertReport(reportInsert);

  assert.ok(saved.id, 'Should generate an ID');
  assert.ok(saved.received_at, 'Should set received_at timestamp');
  assert.deepEqual(saved.payload, originalPayload, 'Payload must be preserved untouched');
  assert.equal(saved.source, 'resident');

  // Verify findReportByIdempotencyKey
  const found = await repo.findReportByIdempotencyKey('idem-test-1');
  assert.ok(found, 'Should find report by idempotencyKey');
  assert.equal(found?.id, saved.id);

  const notFound = await repo.findReportByIdempotencyKey('nonexistent-key');
  assert.equal(notFound, null);
});

test('MemoryReportRepository: createIncident and updateIncident manage updated_at', async () => {
  const repo = new MemoryReportRepository();

  const incData: IncidentInsertColumns = {
    zone_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    household_id: null,
    lat: 24.95,
    lng: 67.05,
    people_count: 2,
    flood_severity: 1,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: null,
    priority_score: 35,
    priority_reason: 'Provisional: Base severity 1',
    verification_status: 'unverified',
    status: 'open',
    details: 'Ground floor ingress',
  };

  const created = await repo.createIncident(incData);
  assert.ok(created.id);
  assert.equal(created.people_count, 2);
  assert.ok(created.created_at);
  assert.ok(created.updated_at);

  // Update incident
  const updated = await repo.updateIncident(created.id, {
    people_count: 5,
    flood_severity: 2,
  });

  assert.equal(updated.people_count, 5);
  assert.equal(updated.flood_severity, 2);
  assert.ok(updated.updated_at);
});

test('MemoryReportRepository: listRecentIncidents filters by status and time cutoff', async () => {
  const repo = new MemoryReportRepository();

  const now = Date.now();
  // 1 hour ago active
  const inc1 = await repo.createIncident({
    zone_id: 'z1',
    household_id: null,
    lat: 24.95,
    lng: 67.05,
    people_count: 1,
    flood_severity: 1,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: null,
    priority_score: 30,
    priority_reason: 'test',
    verification_status: 'unverified',
    status: 'open',
    details: 'test',
  });

  // resolved incident
  const inc2 = await repo.createIncident({
    zone_id: 'z1',
    household_id: null,
    lat: 24.95,
    lng: 67.05,
    people_count: 1,
    flood_severity: 1,
    medical_urgent: false,
    mobility_help: false,
    minutes_to_harm: null,
    priority_score: 30,
    priority_reason: 'test',
    verification_status: 'unverified',
    status: 'resolved',
    details: 'test',
  });

  const recent = await repo.listRecentIncidents(2);
  assert.equal(recent.length, 1);
  assert.equal(recent[0].id, inc1.id);
});

test('SupabaseReportRepository: throws clear server error when secret key is missing', async () => {
  const savedSecret = process.env.SUPABASE_SECRET_KEY;
  const savedService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const repo = new SupabaseReportRepository();
    await assert.rejects(
      async () => {
        await repo.listZones();
      },
      /SUPABASE_SECRET_KEY is required/
    );
  } finally {
    if (savedSecret) process.env.SUPABASE_SECRET_KEY = savedSecret;
    if (savedService) process.env.SUPABASE_SERVICE_ROLE_KEY = savedService;
  }
});
