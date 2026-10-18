import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET as getReports, POST as postReport, _resetRateLimitsForTesting } from '@/app/api/reports/route';
import { GET as getZones } from '@/app/api/reports/zones/route';
import { setReportRepository, MemoryReportRepository } from '../index';

// Initialize in-memory repository with test zones so tests run without .env
const testRepo = new MemoryReportRepository({
  zones: [
    {
      id: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
      name: 'Demo Zone A',
      flood_risk: 2,
      reporting_coverage: 'adequate',
    },
  ],
});
setReportRepository(testRepo);

test('API POST /api/reports: rejects body > 20 KB with 413', async () => {
  _resetRateLimitsForTesting();

  // Create oversized payload (> 20 KB)
  const hugeString = 'A'.repeat(21 * 1024);
  const req = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify({ huge: hugeString }),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.10',
    },
  });

  const res = await postReport(req);
  assert.equal(res.status, 413);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test('API POST /api/reports: rate limits to 10 requests/min per IP (11th returns 429)', async () => {
  _resetRateLimitsForTesting();

  const ip = '192.168.1.50';
  const makeReq = () =>
    new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: 'invalid-json', // Will be parsed after rate limit check
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': ip,
      },
    });

  // Make 10 requests (all pass rate limit, fail at JSON parse with 400)
  for (let i = 0; i < 10; i++) {
    const res = await postReport(makeReq());
    assert.equal(res.status, 400, `Request ${i + 1} should pass rate limiter`);
  }

  // 11th request must return 429
  const res11 = await postReport(makeReq());
  assert.equal(res11.status, 429);
  const data = await res11.json();
  assert.equal(data.ok, false);
});

test('API POST /api/reports: invalid JSON returns 400', async () => {
  _resetRateLimitsForTesting();

  const req = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: '{ unclosed json',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.60',
    },
  });

  const res = await postReport(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test('API POST /api/reports: validation failure returns 400 with field errors', async () => {
  _resetRateLimitsForTesting();

  const req = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify({
      zoneId: 'not-a-uuid',
      locationDescription: 'short',
    }),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.70',
    },
  });

  const res = await postReport(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.ok(data.errors);
  assert.ok(data.errors.zoneId);
});

test('API GET /api/reports/zones: returns list of zones with expected shape', async () => {
  const res = await getZones();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  if (data.length > 0) {
    const first = data[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(first.flood_risk !== undefined);
    assert.ok(first.reporting_coverage !== undefined);
    // Ensure internal coordinates / times are not leaked
    assert.equal(first.center_lat, undefined);
    assert.equal(first.center_lng, undefined);
  }
});

test('API GET /api/reports: returns 404 when NODE_ENV === "production"', async () => {
  const prevEnv = process.env.NODE_ENV;
  try {
    (process.env as any).NODE_ENV = 'production';
    const res = await getReports();
    assert.equal(res.status, 404);
  } finally {
    (process.env as any).NODE_ENV = prevEnv;
  }
});

test('API GET /api/reports: strips reporter name and phone from returned payloads', async () => {
  const prevEnv = process.env.NODE_ENV;
  try {
    (process.env as any).NODE_ENV = 'development';
    const res = await getReports();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    for (const report of data) {
      if (report.payload) {
        assert.equal(report.payload.reporterName, undefined);
        assert.equal(report.payload.reporterPhone, undefined);
        if (report.payload.reporter) {
          assert.equal(report.payload.reporter.name, undefined);
          assert.equal(report.payload.reporter.phone, undefined);
        }
      }
    }
  } finally {
    (process.env as any).NODE_ENV = prevEnv;
  }
});

test('API POST /api/reports: valid submission creates incident and returns 201', async () => {
  _resetRateLimitsForTesting();

  const validPayload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Near Sector 4B Water Pump, Street 7',
    observedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
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
    idempotencyKey: 'idemp-test-unique-1',
  };

  const req = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(validPayload),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.80',
    },
  });

  const res = await postReport(req);
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(data.reportId);
  assert.ok(data.incidentId);
  assert.equal(data.verificationStatus, 'unverified');
  assert.equal(data.needsReview, false);
  assert.equal(data.possibleDuplicateOf, null);
  assert.ok(data.priorityScore > 0);
  assert.ok(data.priorityReason.startsWith('Provisional:'));

  // Test idempotency replay: same request must return 200 and same IDs
  const replayReq = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(validPayload),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.80',
    },
  });

  const replayRes = await postReport(replayReq);
  assert.equal(replayRes.status, 200);
  const replayData = await replayRes.json();
  assert.equal(replayData.ok, true);
  assert.equal(replayData.reportId, data.reportId);
  assert.equal(replayData.incidentId, data.incidentId);
});

test('API POST /api/reports: near duplicate links to existing incident and returns 201 with duplicate flag', async () => {
  _resetRateLimitsForTesting();
  setReportRepository(
    new MemoryReportRepository({
      zones: [
        {
          id: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
          name: 'Demo Zone A',
          flood_risk: 2,
          reporting_coverage: 'adequate',
        },
      ],
    })
  );

  // Initial report created 10 mins ago at 24.95000, 67.05000
  const initialPayload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Initial flood report at Main Gate',
    observedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 1,
    peopleCount: 2,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    lat: 24.95000,
    lng: 67.05000,
    idempotencyKey: 'idemp-orig-1',
  };

  const req1 = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(initialPayload),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.90' },
  });
  const res1 = await postReport(req1);
  assert.equal(res1.status, 201);
  const data1 = await res1.json();
  const origIncidentId = data1.incidentId;

  // Follow-up report 20m away in same zone 5 mins ago with higher severity (3) and trapped true
  const duplicatePayload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Follow up at neighboring shop 20m away',
    observedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    reportingFor: 'someone_else',
    reporterRole: 'volunteer',
    floodSeverity: 3,
    peopleCount: 5,
    trapped: true,
    medicalUrgent: false,
    mobilityHelp: false,
    lat: 24.95015,
    lng: 67.05010, // ~20m distance
    idempotencyKey: 'idemp-followup-1',
  };

  const req2 = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(duplicatePayload),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.91' },
  });
  const res2 = await postReport(req2);
  assert.equal(res2.status, 201);
  const data2 = await res2.json();

  // Must link to original incident, NOT create a new one
  assert.equal(data2.incidentId, origIncidentId);
  // possibleDuplicateOf must equal the earlier REPORT id, not the incident id
  assert.equal(data2.possibleDuplicateOf, data1.reportId);
  assert.equal(data2.needsReview, true);
  // Severity difference |3 - 1| = 2 -> must be conflicting
  assert.equal(data2.verificationStatus, 'conflicting');
});

test('API POST /api/reports: failure in createIncident returns 500 ok:false and preserves orphan report with needs_review=true', async () => {
  _resetRateLimitsForTesting();

  // Create a repository where createIncident throws an error
  class FailingIncidentRepository extends MemoryReportRepository {
    async createIncident(): Promise<any> {
      throw new Error('Database disk full / constraint failure');
    }
  }

  const failingRepo = new FailingIncidentRepository({
    zones: [
      {
        id: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
        name: 'Demo Zone A',
        flood_risk: 2,
        reporting_coverage: 'adequate',
      },
    ],
  });
  setReportRepository(failingRepo);

  const payload = {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'Near Main Gate, House 10',
    observedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 2,
    peopleCount: 3,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    lat: 24.95,
    lng: 67.05,
    idempotencyKey: 'idemp-fail-test-1',
  };

  const req = new NextRequest('http://localhost:3000/api/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.99' },
  });

  const res = await postReport(req);
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.equal(data.error, 'Could not save report');

  // Verify the report was inserted first and preserved with needs_review = true
  const savedReport = await failingRepo.findReportByIdempotencyKey('idemp-fail-test-1');
  assert.ok(savedReport, 'Report should be preserved in repository');
  assert.equal(savedReport.incident_id, null, 'Incident ID should be null since incident creation failed');
  assert.equal(savedReport.needs_review, true, 'Report must be flagged with needs_review = true');

  // Restore testRepo for other tests
  setReportRepository(testRepo);
});
