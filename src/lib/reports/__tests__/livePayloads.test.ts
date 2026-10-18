import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/reports/route';
import { setReportRepository, SupabaseReportRepository } from '../index';

test(
  'Live Supabase payloads 1 to 4',
  { skip: process.env.RUN_LIVE_TESTS !== '1' },
  async () => {
    // 1. Activate live repository
    const repo = new SupabaseReportRepository();
    setReportRepository(repo);

    // 2. Pre-check: Ensure no stale TEST rows exist before starting
    const { getServiceSupabaseClient } = await import('@/lib/supabase');
    const client = getServiceSupabaseClient();
    const { data: staleIncidents, error: staleErr } = await client
      .from('incidents')
      .select('id, details')
      .like('details', 'TEST:%')
      .limit(1);

    if (staleErr) {
      throw new Error(`Failed to check existing incidents: ${staleErr.message}`);
    }

    if (staleIncidents && staleIncidents.length > 0) {
      throw new Error('Found existing incidents starting with "TEST:". Run cleanupTestData.ts first.');
    }

    const zoneId = 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9'; // Demo Zone A
    const now = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    // --- PAYLOAD 1: Genuine Volunteer Emergency Report ---
    const p1 = {
      zoneId,
      locationDescription: 'TEST: Near corner landmark, Sector 4A',
      observedAt: new Date(now - 5 * 60 * 1000).toISOString(),
      reportingFor: 'someone_else',
      reporterRole: 'volunteer',
      floodSeverity: 3,
      peopleCount: 4,
      trapped: true,
      medicalUrgent: true,
      mobilityHelp: false,
      lat: 24.8630,
      lng: 67.0140,
      description: 'TEST: Trapped family of 4, water rising',
      reporterName: 'Volunteer Tester',
      reporterPhone: '+92 300 0000001',
      idempotencyKey: `test-idemp-1-${randomSuffix}`,
    };

    const req1 = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify(p1),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res1 = await POST(req1);
    const data1 = await res1.json();

    console.log('\n--- PAYLOAD 1 RESULT ---');
    console.log(`HTTP status: ${res1.status}`);
    console.log(`reportId: ${data1.reportId}`);
    console.log(`incidentId: ${data1.incidentId}`);
    console.log(`verificationStatus: ${data1.verificationStatus}`);
    console.log(`needsReview: ${data1.needsReview}`);
    console.log(`possibleDuplicateOf: ${data1.possibleDuplicateOf}`);
    console.log(`priorityScore: ${data1.priorityScore}`);

    assert.equal(res1.status, 201, 'P1 must return HTTP 201');
    assert.equal(data1.ok, true);
    assert.ok(data1.reportId, 'P1 must have reportId');
    assert.ok(data1.incidentId, 'P1 must have new incidentId');
    assert.equal(data1.verificationStatus, 'unverified');
    assert.equal(data1.needsReview, false);
    assert.equal(data1.possibleDuplicateOf, null);
    assert.ok(data1.priorityScore > 0);

    const p1ReportId = data1.reportId;
    const p1IncidentId = data1.incidentId;

    // --- PAYLOAD 2: Near-duplicate (20m away, 2 mins ago) ---
    const p2 = {
      zoneId,
      locationDescription: 'TEST: Neighbor 20m away confirming same trapped family',
      observedAt: new Date(now - 2 * 60 * 1000).toISOString(),
      reportingFor: 'someone_else',
      reporterRole: 'neighbor',
      floodSeverity: 3,
      peopleCount: 6,
      trapped: true,
      medicalUrgent: true,
      mobilityHelp: true,
      lat: 24.86315,
      lng: 67.01408,
      description: 'TEST: Additional neighbor on roof, mobility assistance needed',
      reporterName: 'Neighbor Tester',
      idempotencyKey: `test-idemp-2-${randomSuffix}`,
    };

    const req2 = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify(p2),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res2 = await POST(req2);
    const data2 = await res2.json();

    console.log('\n--- PAYLOAD 2 RESULT ---');
    console.log(`HTTP status: ${res2.status}`);
    console.log(`reportId: ${data2.reportId}`);
    console.log(`incidentId: ${data2.incidentId}`);
    console.log(`verificationStatus: ${data2.verificationStatus}`);
    console.log(`needsReview: ${data2.needsReview}`);
    console.log(`possibleDuplicateOf: ${data2.possibleDuplicateOf}`);
    console.log(`priorityScore: ${data2.priorityScore}`);

    assert.equal(res2.status, 201, 'P2 must return HTTP 201');
    assert.equal(data2.ok, true);
    assert.equal(data2.incidentId, p1IncidentId, 'P2 must have the same incidentId as P1');
    assert.equal(data2.needsReview, true, 'P2 must have needsReview true');
    assert.equal(
      data2.possibleDuplicateOf,
      p1ReportId,
      "P2 possibleDuplicateOf must equal P1's reportId"
    );

    // --- PAYLOAD 3: Unknown fields (no coordinates) ---
    const p3 = {
      zoneId,
      locationDescription: 'TEST: Unverified water entering street block',
      observedAt: new Date(now - 4 * 60 * 1000).toISOString(),
      reportingFor: 'myself',
      reporterRole: 'resident',
      floodSeverity: 1,
      peopleCount: null,
      trapped: null,
      medicalUrgent: null,
      mobilityHelp: null,
      lat: null,
      lng: null,
      description: 'TEST: Unknown if neighbors trapped',
      idempotencyKey: `test-idemp-3-${randomSuffix}`,
    };

    const req3 = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify(p3),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res3 = await POST(req3);
    const data3 = await res3.json();

    console.log('\n--- PAYLOAD 3 RESULT ---');
    console.log(`HTTP status: ${res3.status}`);
    console.log(`reportId: ${data3.reportId}`);
    console.log(`incidentId: ${data3.incidentId}`);
    console.log(`verificationStatus: ${data3.verificationStatus}`);
    console.log(`needsReview: ${data3.needsReview}`);
    console.log(`possibleDuplicateOf: ${data3.possibleDuplicateOf}`);
    console.log(`priorityScore: ${data3.priorityScore}`);

    assert.equal(res3.status, 201, 'P3 must return HTTP 201');
    assert.equal(data3.ok, true);
    assert.notEqual(data3.incidentId, p1IncidentId, 'P3 must have a different incidentId');
    assert.equal(data3.needsReview, true, 'P3 must have needsReview true due to missing fields');
    assert.equal(data3.possibleDuplicateOf, null);

    // --- PAYLOAD 4: Follow-up lower severity at same location as Payload 1 ---
    const p4 = {
      zoneId,
      locationDescription: 'TEST: Follow-up observer thinks water level is low',
      observedAt: new Date(now - 1 * 60 * 1000).toISOString(),
      reportingFor: 'someone_else',
      reporterRole: 'other',
      floodSeverity: 1,
      peopleCount: 1,
      trapped: false,
      medicalUrgent: false,
      mobilityHelp: false,
      lat: 24.8630,
      lng: 67.0140,
      description: 'TEST: Believes water is receded',
      idempotencyKey: `test-idemp-4-${randomSuffix}`,
    };

    const req4 = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify(p4),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res4 = await POST(req4);
    const data4 = await res4.json();

    console.log('\n--- PAYLOAD 4 RESULT ---');
    console.log(`HTTP status: ${res4.status}`);
    console.log(`reportId: ${data4.reportId}`);
    console.log(`incidentId: ${data4.incidentId}`);
    console.log(`verificationStatus: ${data4.verificationStatus}`);
    console.log(`needsReview: ${data4.needsReview}`);
    console.log(`possibleDuplicateOf: ${data4.possibleDuplicateOf}`);
    console.log(`priorityScore: ${data4.priorityScore}`);

    assert.equal(res4.status, 201, 'P4 must return HTTP 201');
    assert.equal(data4.ok, true);
    assert.equal(data4.incidentId, p1IncidentId, 'P4 must have the same incidentId as P1');
    assert.equal(
      data4.verificationStatus,
      'conflicting',
      "P4 verificationStatus must be 'conflicting'"
    );
    assert.equal(data4.needsReview, true);
    assert.equal(data4.possibleDuplicateOf, p1ReportId);

    // --- VERIFY P1 INCIDENT IN DATABASE AFTER P4 ---
    const incidentAfterP4 = await repo.getIncidentById(p1IncidentId);
    assert.ok(incidentAfterP4, 'Incident must exist');
    assert.equal(
      incidentAfterP4.flood_severity,
      3,
      'flood_severity must still be 3 (never lowered)'
    );
    assert.equal(
      incidentAfterP4.people_count,
      6,
      'people_count must still be 6 (never lowered)'
    );
    assert.equal(incidentAfterP4.medical_urgent, true);
    assert.equal(incidentAfterP4.mobility_help, true);
    assert.equal(incidentAfterP4.verification_status, 'conflicting');
  }
);
