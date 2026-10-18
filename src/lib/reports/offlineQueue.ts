import { EmergencyReportInput } from './schema';

export type QueueItemStatus =
  | 'local_only'
  | 'retrying'
  | 'needs_correction'
  | 'delivered';

export interface QueuedReportItem {
  idempotencyKey: string;
  payload: EmergencyReportInput;
  status: QueueItemStatus;
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
  retryCount: number;
}

export interface OfflineQueueStore {
  getAll(): Promise<QueuedReportItem[]>;
  get(idempotencyKey: string): Promise<QueuedReportItem | undefined>;
  put(item: QueuedReportItem): Promise<void>;
  delete(idempotencyKey: string): Promise<void>;
  clear(): Promise<void>;
}

const DB_NAME = 'firstreach_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_reports';

/**
 * Native IndexedDB store implementation.
 * Zero external dependencies.
 */
export class IndexedDbStore implements OfflineQueueStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not available in this environment'));
    }
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'idempotencyKey' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async getAll(): Promise<QueuedReportItem[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async get(idempotencyKey: string): Promise<QueuedReportItem | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(idempotencyKey);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async put(item: QueuedReportItem): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(idempotencyKey: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(idempotencyKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

/**
 * In-memory store implementation for testing and fallback.
 */
export class MemoryQueueStore implements OfflineQueueStore {
  private items = new Map<string, QueuedReportItem>();

  async getAll(): Promise<QueuedReportItem[]> {
    return Array.from(this.items.values());
  }

  async get(idempotencyKey: string): Promise<QueuedReportItem | undefined> {
    return this.items.get(idempotencyKey);
  }

  async put(item: QueuedReportItem): Promise<void> {
    this.items.set(item.idempotencyKey, { ...item });
  }

  async delete(idempotencyKey: string): Promise<void> {
    this.items.delete(idempotencyKey);
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}

/**
 * Offline report queue manager.
 */
export class OfflineReportQueue {
  private store: OfflineQueueStore;
  private listeners: Set<() => void> = new Set();
  private isProcessing = false;

  constructor(store?: OfflineQueueStore) {
    if (store) {
      this.store = store;
    } else if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.store = new IndexedDbStore();
    } else {
      this.store = new MemoryQueueStore();
    }

    // Automatically trigger retries when device comes back online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processAll().catch(() => {});
      });
    }
  }

  setStore(store: OfflineQueueStore) {
    this.store = store;
    this.notify();
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }

  /**
   * Save report locally with status 'local_only' and its idempotencyKey.
   */
  async enqueue(payload: EmergencyReportInput): Promise<QueuedReportItem> {
    const key =
      payload.idempotencyKey ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

    const item: QueuedReportItem = {
      idempotencyKey: key,
      payload: { ...payload, idempotencyKey: key },
      status: 'local_only',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    await this.store.put(item);
    this.notify();
    return item;
  }

  async getItems(): Promise<QueuedReportItem[]> {
    return this.store.getAll();
  }

  async getItem(idempotencyKey: string): Promise<QueuedReportItem | undefined> {
    return this.store.get(idempotencyKey);
  }

  async removeItem(idempotencyKey: string): Promise<void> {
    await this.store.delete(idempotencyKey);
    this.notify();
  }

  /**
   * Attempt delivery of a single queued item.
   * sendFn: Injectable HTTP caller for unit testing without network.
   */
  async processItem(
    item: QueuedReportItem,
    sendFn?: (payload: EmergencyReportInput) => Promise<{ status: number; data?: any }>
  ): Promise<{ ok: boolean; status: number; result?: any }> {
    item.status = 'retrying';
    item.lastAttemptAt = new Date().toISOString();
    item.retryCount += 1;
    await this.store.put(item);
    this.notify();

    const doSend =
      sendFn ||
      (async (p: EmergencyReportInput) => {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
      });

    try {
      const { status, data } = await doSend(item.payload);

      if (status === 200 || status === 201) {
        if (data?.ok) {
          // Rule 5: Remove an item from IndexedDB once delivered to protect reporter phone numbers
          await this.store.delete(item.idempotencyKey);
          this.notify();
          return { ok: true, status, result: data };
        }
      }

      if (status === 400) {
        // Rule 2: Do NOT queue 400 validation errors; show them as "Needs correction"
        item.status = 'needs_correction';
        item.error = data?.error || 'Validation failed. Needs correction.';
        await this.store.put(item);
        this.notify();
        return { ok: false, status, result: data };
      }

      if (status === 429) {
        // Rule 2: For 429, keep the item and retry later
        item.status = 'local_only';
        item.error = 'Rate limited. Will retry shortly.';
        await this.store.put(item);
        this.notify();
        return { ok: false, status, result: data };
      }

      // Server 500 or other transient error: keep as local_only to retry
      item.status = 'local_only';
      item.error = data?.error || 'Server error. Will retry when connected.';
      await this.store.put(item);
      this.notify();
      return { ok: false, status, result: data };
    } catch (err: any) {
      // Network failure / still offline
      item.status = 'local_only';
      item.error = err?.message || 'Network unreachable';
      await this.store.put(item);
      this.notify();
      return { ok: false, status: 0, result: null };
    }
  }

  /**
   * Attempt delivery of all pending items in the queue.
   */
  async processAll(
    sendFn?: (payload: EmergencyReportInput) => Promise<{ status: number; data?: any }>
  ): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const items = await this.store.getAll();
      const pending = items.filter(
        (i) => i.status === 'local_only' || i.status === 'retrying'
      );

      for (const item of pending) {
        await this.processItem(item, sendFn);
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Global singleton instance for browser runtime
export const offlineReportQueue = new OfflineReportQueue();
