import { IncidentInsertColumns } from './mapping';
import { CandidateIncident, mergeRaiseOnly } from './duplicates';
import { EmergencyReportInput } from './schema';

export interface ZoneSummary {
  id: string;
  name: string;
  flood_risk: number;
  reporting_coverage: 'unknown' | 'low' | 'adequate';
}

export interface ReportRecord {
  id: string;
  incident_id: string | null;
  source: 'resident' | 'volunteer' | 'coordinator';
  payload: Record<string, unknown>;
  event_at: string;
  received_at: string;
  possible_duplicate_of: string | null;
  needs_review: boolean;
}

export interface ReportInsert {
  incident_id?: string | null;
  source: 'resident' | 'volunteer' | 'coordinator';
  payload: Record<string, unknown>;
  event_at: string;
  possible_duplicate_of?: string | null;
  needs_review?: boolean;
}

export interface IncidentRecord {
  id: string;
  zone_id: string;
  household_id: string | null;
  lat: number | null;
  lng: number | null;
  people_count: number;
  flood_severity: number;
  medical_urgent: boolean;
  mobility_help: boolean;
  minutes_to_harm: number | null;
  priority_score: number;
  priority_reason: string;
  verification_status: 'unverified' | 'verified' | 'conflicting';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  details: string;
  created_at: string;
  updated_at: string;
}

export interface ReportRepository {
  listZones(): Promise<ZoneSummary[]>;
  insertReport(report: ReportInsert): Promise<ReportRecord>;
  updateReport(
    id: string,
    updates: Partial<Pick<ReportRecord, 'incident_id' | 'needs_review' | 'possible_duplicate_of'>>
  ): Promise<ReportRecord>;
  findReportByIdempotencyKey(key: string): Promise<ReportRecord | null>;
  listRecentIncidents(hours?: number): Promise<CandidateIncident[]>;
  createIncident(incident: IncidentInsertColumns): Promise<IncidentRecord>;
  updateIncident(
    id: string,
    updates: Partial<IncidentInsertColumns>,
    expectedUpdatedAt?: string,
    incomingReport?: Pick<
      EmergencyReportInput,
      'floodSeverity' | 'peopleCount' | 'medicalUrgent' | 'mobilityHelp'
    >
  ): Promise<IncidentRecord>;
  getIncidentById(id: string): Promise<IncidentRecord | null>;
  listLatest(limit?: number): Promise<Array<ReportRecord & { incident?: IncidentRecord | null }>>;
}

/**
 * In-memory repository implementation for deterministic unit and integration tests.
 */
export class MemoryReportRepository implements ReportRepository {
  private zones: ZoneSummary[] = [];
  private reports: ReportRecord[] = [];
  private incidents: IncidentRecord[] = [];

  constructor(initialData?: {
    zones?: ZoneSummary[];
    incidents?: IncidentRecord[];
    reports?: ReportRecord[];
  }) {
    if (initialData?.zones) this.zones = [...initialData.zones];
    if (initialData?.incidents) this.incidents = [...initialData.incidents];
    if (initialData?.reports) this.reports = [...initialData.reports];
  }

  async listZones(): Promise<ZoneSummary[]> {
    return [...this.zones];
  }

  async insertReport(report: ReportInsert): Promise<ReportRecord> {
    const record: ReportRecord = {
      id: crypto.randomUUID(),
      incident_id: report.incident_id ?? null,
      source: report.source,
      payload: JSON.parse(JSON.stringify(report.payload)), // preserve original untouched
      event_at: report.event_at,
      received_at: new Date().toISOString(),
      possible_duplicate_of: report.possible_duplicate_of ?? null,
      needs_review: report.needs_review ?? false,
    };
    this.reports.push(record);
    return record;
  }

  async updateReport(
    id: string,
    updates: Partial<Pick<ReportRecord, 'incident_id' | 'needs_review' | 'possible_duplicate_of'>>
  ): Promise<ReportRecord> {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Report with id ${id} not found`);
    }
    const current = this.reports[idx];
    const updated: ReportRecord = {
      ...current,
      ...updates,
    };
    this.reports[idx] = updated;
    return { ...updated };
  }

  async getIncidentById(id: string): Promise<IncidentRecord | null> {
    const found = this.incidents.find((i) => i.id === id);
    return found ? { ...found } : null;
  }

  async findReportByIdempotencyKey(key: string): Promise<ReportRecord | null> {
    if (!key) return null;
    const found = this.reports.find(
      (r) => r.payload && (r.payload as Record<string, unknown>).idempotencyKey === key
    );
    return found ? { ...found } : null;
  }

  async listRecentIncidents(hours = 2): Promise<CandidateIncident[]> {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const activeStatuses = new Set(['open', 'assigned', 'in_progress']);

    return this.incidents
      .filter((inc) => {
        const created = new Date(inc.created_at).getTime();
        return created >= cutoff && activeStatuses.has(inc.status);
      })
      .map((inc) => ({
        id: inc.id,
        zone_id: inc.zone_id,
        household_id: inc.household_id,
        lat: inc.lat,
        lng: inc.lng,
        status: inc.status,
        created_at: inc.created_at,
        updated_at: inc.updated_at,
        flood_severity: inc.flood_severity,
        people_count: inc.people_count,
        medical_urgent: inc.medical_urgent,
        mobility_help: inc.mobility_help,
        verification_status: inc.verification_status,
      }));
  }

  async createIncident(incident: IncidentInsertColumns): Promise<IncidentRecord> {
    const now = new Date().toISOString();
    const record: IncidentRecord = {
      id: crypto.randomUUID(),
      ...incident,
      created_at: now,
      updated_at: now,
    };
    this.incidents.push(record);
    return { ...record };
  }

  async updateIncident(
    id: string,
    updates: Partial<IncidentInsertColumns>,
    expectedUpdatedAt?: string,
    incomingReport?: Pick<
      EmergencyReportInput,
      'floodSeverity' | 'peopleCount' | 'medicalUrgent' | 'mobilityHelp'
    >
  ): Promise<IncidentRecord> {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx === -1) {
      throw new Error(`Incident with id ${id} not found`);
    }

    const current = this.incidents[idx];

    // Optimistic concurrency check: if expectedUpdatedAt was given and does not match
    if (expectedUpdatedAt && current.updated_at !== expectedUpdatedAt) {
      if (incomingReport) {
        // Re-run mergeRaiseOnly on fresh values and retry once
        const remerged = mergeRaiseOnly(current, incomingReport);
        const retried: IncidentRecord = {
          ...current,
          ...remerged.updatedFields,
          updated_at: new Date().toISOString(),
        };
        this.incidents[idx] = retried;
        return { ...retried };
      }
      throw new Error(`Incident ${id} updated_at mismatch`);
    }

    const updated: IncidentRecord = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.incidents[idx] = updated;
    return { ...updated };
  }

  async listLatest(
    limit = 20
  ): Promise<Array<ReportRecord & { incident?: IncidentRecord | null }>> {
    const sorted = [...this.reports].sort(
      (a, b) =>
        new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );

    return sorted.slice(0, limit).map((report) => {
      const inc = report.incident_id
        ? this.incidents.find((i) => i.id === report.incident_id) ?? null
        : null;
      return {
        ...report,
        incident: inc,
      };
    });
  }
}

/**
 * Server-only Supabase repository.
 * Lazily loads client via dynamic import so importing repository.ts never initializes Supabase.
 * Enforces strict secret key validation (no silent anon fallback) and preserves raw payload immutability.
 */
export class SupabaseReportRepository implements ReportRepository {
  private async getClient() {
    const secretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretKey) {
      throw new Error(
        'Server configuration error: SUPABASE_SECRET_KEY is required for privileged repository operations.'
      );
    }
    const { getServiceSupabaseClient } = await import('@/lib/supabase');
    return getServiceSupabaseClient();
  }

  async listZones(): Promise<ZoneSummary[]> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('zones')
      .select('id, name, flood_risk, reporting_coverage')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list zones: ${error.message}`);
    }

    return (data || []) as ZoneSummary[];
  }

  async insertReport(report: ReportInsert): Promise<ReportRecord> {
    const client = await this.getClient();

    const { data, error } = await client
      .from('reports')
      .insert({
        incident_id: report.incident_id ?? null,
        source: report.source,
        payload: report.payload, // Stored untouched
        event_at: report.event_at,
        received_at: new Date().toISOString(),
        possible_duplicate_of: report.possible_duplicate_of ?? null,
        needs_review: report.needs_review ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert report: ${error.message}`);
    }

    return data as ReportRecord;
  }

  async updateReport(
    id: string,
    updates: Partial<Pick<ReportRecord, 'incident_id' | 'needs_review' | 'possible_duplicate_of'>>
  ): Promise<ReportRecord> {
    const client = await this.getClient();

    const { data, error } = await client
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }

    return data as ReportRecord;
  }

  async getIncidentById(id: string): Promise<IncidentRecord | null> {
    const client = await this.getClient();

    const { data, error } = await client
      .from('incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch incident: ${error.message}`);
    }

    return (data as IncidentRecord) || null;
  }

  async findReportByIdempotencyKey(key: string): Promise<ReportRecord | null> {
    if (!key) return null;

    const client = await this.getClient();
    const { data, error } = await client
      .from('reports')
      .select('*')
      .filter('payload->>idempotencyKey', 'eq', key)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check idempotency: ${error.message}`);
    }

    return data && data.length > 0 ? (data[0] as ReportRecord) : null;
  }

  async listRecentIncidents(hours = 2): Promise<CandidateIncident[]> {
    const client = await this.getClient();
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await client
      .from('incidents')
      .select(
        'id, zone_id, household_id, lat, lng, status, created_at, updated_at, flood_severity, people_count, medical_urgent, mobility_help, verification_status'
      )
      .gte('created_at', cutoff)
      .in('status', ['open', 'assigned', 'in_progress']);

    if (error) {
      throw new Error(`Failed to fetch recent incidents: ${error.message}`);
    }

    return (data || []) as CandidateIncident[];
  }

  async createIncident(incident: IncidentInsertColumns): Promise<IncidentRecord> {
    const client = await this.getClient();

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('incidents')
      .insert({
        ...incident,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create incident: ${error.message}`);
    }

    return data as IncidentRecord;
  }

  async updateIncident(
    id: string,
    updates: Partial<IncidentInsertColumns>,
    expectedUpdatedAt?: string,
    incomingReport?: Pick<
      EmergencyReportInput,
      'floodSeverity' | 'peopleCount' | 'medicalUrgent' | 'mobilityHelp'
    >
  ): Promise<IncidentRecord> {
    const client = await this.getClient();

    let query = client
      .from('incidents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (expectedUpdatedAt) {
      query = query.eq('updated_at', expectedUpdatedAt);
    }

    const { data, error } = await query.select();

    if (error) {
      throw new Error(`Failed to update incident: ${error.message}`);
    }

    // If optimistic lock failed (no rows updated)
    if (!data || data.length === 0) {
      if (expectedUpdatedAt && incomingReport) {
        // Re-read fresh incident
        const fresh = await this.getIncidentById(id);
        if (!fresh) {
          throw new Error(`Incident ${id} not found during optimistic retry`);
        }
        // Re-run mergeRaiseOnly on the fresh values to guarantee we only raise
        const remerged = mergeRaiseOnly(fresh, incomingReport);
        const retryResult = await client
          .from('incidents')
          .update({
            ...remerged.updatedFields,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('updated_at', fresh.updated_at)
          .select()
          .single();

        if (retryResult.error) {
          throw new Error(`Failed to update incident on retry: ${retryResult.error.message}`);
        }
        return retryResult.data as IncidentRecord;
      }
      throw new Error(`Incident ${id} updated_at mismatch (expected ${expectedUpdatedAt})`);
    }

    return data[0] as IncidentRecord;
  }

  async listLatest(
    limit = 20
  ): Promise<Array<ReportRecord & { incident?: IncidentRecord | null }>> {
    const client = await this.getClient();

    const { data: reports, error: reportsErr } = await client
      .from('reports')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(limit);

    if (reportsErr) {
      throw new Error(`Failed to list reports: ${reportsErr.message}`);
    }

    if (!reports || reports.length === 0) {
      return [];
    }

    // Hydrate incidents for each report
    const incidentIds = Array.from(
      new Set(reports.map((r) => r.incident_id).filter(Boolean))
    ) as string[];

    let incidentMap: Record<string, IncidentRecord> = {};
    if (incidentIds.length > 0) {
      const { data: incidents, error: incErr } = await client
        .from('incidents')
        .select('*')
        .in('id', incidentIds);

      if (incErr) {
        throw new Error(`Failed to hydrate report incidents: ${incErr.message}`);
      }

      if (incidents) {
        incidentMap = incidents.reduce((acc, inc) => {
          acc[inc.id] = inc;
          return acc;
        }, {} as Record<string, IncidentRecord>);
      }
    }

    return reports.map((r) => ({
      ...r,
      incident: r.incident_id ? incidentMap[r.incident_id] ?? null : null,
    }));
  }
}

let activeRepository: ReportRepository = new SupabaseReportRepository();

/**
 * Allows switching repository implementation (e.g. MemoryReportRepository for isolated unit tests).
 */
export function setReportRepository(repo: ReportRepository): void {
  activeRepository = repo;
}

export function resetReportRepository(): void {
  activeRepository = new SupabaseReportRepository();
}

/**
 * Default exported repository instance delegating to activeRepository.
 */
export const reportRepository: ReportRepository = {
  listZones: () => activeRepository.listZones(),
  insertReport: (report) => activeRepository.insertReport(report),
  updateReport: (id, updates) => activeRepository.updateReport(id, updates),
  findReportByIdempotencyKey: (key) => activeRepository.findReportByIdempotencyKey(key),
  listRecentIncidents: (hours) => activeRepository.listRecentIncidents(hours),
  createIncident: (incident) => activeRepository.createIncident(incident),
  updateIncident: (id, updates, expectedUpdatedAt, incomingReport) =>
    activeRepository.updateIncident(id, updates, expectedUpdatedAt, incomingReport),
  getIncidentById: (id) => activeRepository.getIncidentById(id),
  listLatest: (limit) => activeRepository.listLatest(limit),
};
