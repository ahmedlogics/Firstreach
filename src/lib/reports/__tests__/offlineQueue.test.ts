import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OfflineReportQueue,
  MemoryQueueStore,
  QueuedReportItem,
} from '../offlineQueue';
import { EmergencyReportInput } from '../schema';

function makeMockPayload(overrides: Partial<EmergencyReportInput> = {}): EmergencyReportInput {
  return {
    zoneId: 'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9',
    locationDescription: 'TEST: Offline queue mock landmark',
    observedAt: new Date().toISOString(),
    reportingFor: 'myself',
    reporterRole: 'resident',
    floodSeverity: 2,
    peopleCount: 3,
    trapped: false,
    medicalUrgent: false,
    mobilityHelp: false,
    lat: 24.863,
    lng: 67.014,
    description: 'TEST: Offline test description',
    reporterName: 'Offline Reporter',
    reporterPhone: '+92 300 1234567',
    idempotencyKey: 'idemp-offline-123',
    ...overrides,
  };
}

test('offlineQueue: enqueues report with status "local_only" and preserves idempotencyKey', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const payload = makeMockPayload();
  const item = await queue.enqueue(payload);

  assert.equal(item.status, 'local_only');
  assert.equal(item.idempotencyKey, 'idemp-offline-123');
  assert.equal(item.retryCount, 0);

  const stored = await store.get('idemp-offline-123');
  assert.ok(stored, 'Item must be saved in store');
  assert.equal(stored.status, 'local_only');
  assert.equal(stored.payload.reporterPhone, '+92 300 1234567');
});

test('offlineQueue: removes item from store once delivered with ok: true (Rule 5)', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const payload = makeMockPayload();
  await queue.enqueue(payload);

  const itemsBefore = await queue.getItems();
  assert.equal(itemsBefore.length, 1);

  // Simulate network delivery returning 201 ok: true
  const mockSend = async (p: EmergencyReportInput) => {
    assert.equal(p.idempotencyKey, 'idemp-offline-123', 'Must reuse same idempotencyKey');
    return {
      status: 201,
      data: { ok: true, reportId: 'rep-1', incidentId: 'inc-1' },
    };
  };

  const res = await queue.processItem(itemsBefore[0], mockSend);
  assert.equal(res.ok, true);

  // Delivered item must be removed from store to protect reporter phone numbers
  const itemsAfter = await queue.getItems();
  assert.equal(itemsAfter.length, 0, 'Delivered item must be removed from storage');
  const stored = await store.get('idemp-offline-123');
  assert.equal(stored, undefined, 'Delivered item should no longer exist in store');
});

test('offlineQueue: keeps item as "local_only" on network failure', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const payload = makeMockPayload();
  await queue.enqueue(payload);

  const items = await queue.getItems();

  // Simulate offline network error
  const mockSend = async () => {
    throw new Error('TypeError: Failed to fetch (offline)');
  };

  const res = await queue.processItem(items[0], mockSend);
  assert.equal(res.ok, false);

  const stored = await store.get('idemp-offline-123');
  assert.ok(stored);
  assert.equal(stored.status, 'local_only');
  assert.equal(stored.retryCount, 1);
  assert.match(stored.error || '', /offline/i);
});

test('offlineQueue: sets status to "needs_correction" on 400 validation error (Rule 2)', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const payload = makeMockPayload();
  await queue.enqueue(payload);

  const items = await queue.getItems();

  // Simulate 400 validation error
  const mockSend = async () => {
    return {
      status: 400,
      data: { ok: false, error: 'Validation failed' },
    };
  };

  const res = await queue.processItem(items[0], mockSend);
  assert.equal(res.ok, false);

  const stored = await store.get('idemp-offline-123');
  assert.ok(stored);
  assert.equal(stored.status, 'needs_correction');
  assert.match(stored.error || '', /Validation failed/);
});

test('offlineQueue: keeps item as "local_only" on 429 rate limit (Rule 2)', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const payload = makeMockPayload();
  await queue.enqueue(payload);

  const items = await queue.getItems();

  // Simulate 429 rate limit
  const mockSend = async () => {
    return {
      status: 429,
      data: { ok: false, error: 'Rate limit exceeded' },
    };
  };

  const res = await queue.processItem(items[0], mockSend);
  assert.equal(res.ok, false);

  const stored = await store.get('idemp-offline-123');
  assert.ok(stored);
  assert.equal(stored.status, 'local_only');
  assert.match(stored.error || '', /Rate limited/);
});

test('offlineQueue: processAll processes all pending items and reuses idempotencyKeys', async () => {
  const store = new MemoryQueueStore();
  const queue = new OfflineReportQueue(store);

  const p1 = makeMockPayload({ idempotencyKey: 'idemp-1' });
  const p2 = makeMockPayload({ idempotencyKey: 'idemp-2' });

  await queue.enqueue(p1);
  await queue.enqueue(p2);

  const sentKeys: string[] = [];

  const mockSend = async (p: EmergencyReportInput) => {
    sentKeys.push(p.idempotencyKey || '');
    return {
      status: 201,
      data: { ok: true, reportId: `rep-${p.idempotencyKey}` },
    };
  };

  await queue.processAll(mockSend);

  assert.deepEqual(sentKeys, ['idemp-1', 'idemp-2']);
  const remaining = await queue.getItems();
  assert.equal(remaining.length, 0, 'All successfully delivered items must be cleared');
});
