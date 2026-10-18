import { getServiceSupabaseClient } from '@/lib/supabase';
import {
  ContactStatusType,
  CreateOutreachActionInput,
  DbHousehold,
  DbOutreachAction,
  HouseholdWithZone,
  OutreachActionWithDetails,
  OutreachChannelType,
  OutreachStatusType,
  PatchHouseholdInput,
  PatchOutreachActionInput,
  ReachabilityOverviewMetrics,
  ReachabilityType,
  ShelterWithZone,
} from './types';

interface HouseholdQueryRow extends DbHousehold {
  zones: {
    id: string;
    name: string;
    flood_risk: number;
    minutes_to_impact: number | null;
  } | null;
}

interface ShelterQueryRow {
  id: string;
  name: string;
  zone_id: string | null;
  capacity: number;
  occupied: number;
  lat: number | null;
  lng: number | null;
  zones: { name: string } | null;
}

interface OutreachActionQueryRow extends DbOutreachAction {
  households: { label: string } | null;
  zones: { name: string } | null;
}

/**
 * Service repository for Member 4: Outreach & Shelters
 * Runs exclusively on server-side Next.js route handlers using the service role key.
 */
export class OutreachRepository {
  private ensureClient() {
    const secretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretKey) {
      console.warn(
        '[FirstReach Outreach] SUPABASE_SECRET_KEY not set. Falling back to default client.'
      );
    }
    return getServiceSupabaseClient();
  }

  // ==========================================
  // HOUSEHOLDS
  // ==========================================

  async listHouseholds(filters?: {
    zone_id?: string;
    reachability?: ReachabilityType;
    contact_status?: ContactStatusType;
    search?: string;
  }): Promise<HouseholdWithZone[]> {
    const client = this.ensureClient();

    let query = client.from('households').select(`
      id,
      zone_id,
      label,
      lat,
      lng,
      people_count,
      elderly_present,
      mobility_assistance,
      medical_support_needed,
      reachability,
      last_contact_at,
      contact_status,
      created_at,
      zones (
        id,
        name,
        flood_risk,
        minutes_to_impact
      )
    `);

    if (filters?.zone_id) {
      query = query.eq('zone_id', filters.zone_id);
    }
    if (filters?.reachability) {
      query = query.eq('reachability', filters.reachability);
    }
    if (filters?.contact_status) {
      query = query.eq('contact_status', filters.contact_status);
    }
    if (filters?.search) {
      query = query.ilike('label', `%${filters.search.trim()}%`);
    }

    query = query.order('label', { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list households: ${error.message}`);
    }

    const rows = (data || []) as unknown as HouseholdQueryRow[];
    const now = Date.now();

    return rows.map((row) => {
      const zone = row.zones;

      let silence_hours = 0;
      if (row.last_contact_at) {
        const lastContact = new Date(row.last_contact_at).getTime();
        silence_hours = Math.max(0, Math.round((now - lastContact) / (1000 * 60 * 60)));
      } else {
        silence_hours = 48; // default placeholder for uncontacted
      }

      const is_vulnerable =
        Boolean(row.elderly_present) ||
        Boolean(row.mobility_assistance) ||
        Boolean(row.medical_support_needed);

      return {
        id: row.id,
        zone_id: row.zone_id,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        people_count: row.people_count,
        elderly_present: row.elderly_present,
        mobility_assistance: row.mobility_assistance,
        medical_support_needed: row.medical_support_needed,
        reachability: row.reachability,
        last_contact_at: row.last_contact_at,
        contact_status: row.contact_status,
        created_at: row.created_at,
        zone_name: zone?.name || 'Unassigned Zone',
        zone_flood_risk: zone?.flood_risk ?? 0,
        zone_minutes_to_impact: zone?.minutes_to_impact ?? null,
        silence_hours,
        is_vulnerable,
      };
    });
  }

  async getHouseholdById(id: string): Promise<HouseholdWithZone | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('households')
      .select(`
        id,
        zone_id,
        label,
        lat,
        lng,
        people_count,
        elderly_present,
        mobility_assistance,
        medical_support_needed,
        reachability,
        last_contact_at,
        contact_status,
        created_at,
        zones (
          id,
          name,
          flood_risk,
          minutes_to_impact
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get household: ${error.message}`);
    }
    if (!data) return null;

    const row = data as unknown as HouseholdQueryRow;
    const zone = row.zones;
    const now = Date.now();
    let silence_hours = 0;
    if (row.last_contact_at) {
      const lastContact = new Date(row.last_contact_at).getTime();
      silence_hours = Math.max(0, Math.round((now - lastContact) / (1000 * 60 * 60)));
    }

    return {
      id: row.id,
      zone_id: row.zone_id,
      label: row.label,
      lat: row.lat,
      lng: row.lng,
      people_count: row.people_count,
      elderly_present: row.elderly_present,
      mobility_assistance: row.mobility_assistance,
      medical_support_needed: row.medical_support_needed,
      reachability: row.reachability,
      last_contact_at: row.last_contact_at,
      contact_status: row.contact_status,
      created_at: row.created_at,
      zone_name: zone?.name || 'Unassigned Zone',
      zone_flood_risk: zone?.flood_risk ?? 0,
      zone_minutes_to_impact: zone?.minutes_to_impact ?? null,
      silence_hours,
      is_vulnerable:
        Boolean(row.elderly_present) ||
        Boolean(row.mobility_assistance) ||
        Boolean(row.medical_support_needed),
    };
  }

  async updateHousehold(
    id: string,
    input: PatchHouseholdInput
  ): Promise<HouseholdWithZone> {
    const client = this.ensureClient();

    const updates: Partial<DbHousehold> = {
      contact_status: input.contact_status,
    };

    if (input.reachability) {
      updates.reachability = input.reachability;
    }

    if (input.last_contact_at !== undefined) {
      updates.last_contact_at = input.last_contact_at;
    } else if (input.contact_status === 'reached') {
      updates.last_contact_at = new Date().toISOString();
    }

    const { error } = await client
      .from('households')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update household: ${error.message}`);
    }

    const updated = await this.getHouseholdById(id);
    if (!updated) {
      throw new Error(`Household with ID ${id} not found after update`);
    }
    return updated;
  }

  // ==========================================
  // SHELTERS
  // ==========================================

  async listShelters(): Promise<ShelterWithZone[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('shelters')
      .select(`
        id,
        name,
        zone_id,
        capacity,
        occupied,
        lat,
        lng,
        zones (
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list shelters: ${error.message}`);
    }

    const rows = (data || []) as unknown as ShelterQueryRow[];

    return rows.map((row) => {
      const zone = row.zones;
      const capacity = Number(row.capacity);
      const occupied = Number(row.occupied);
      const free_beds = Math.max(0, capacity - occupied);
      const occupancy_pct =
        capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

      let status: 'available' | 'near_capacity' | 'full' = 'available';
      if (occupied >= capacity) {
        status = 'full';
      } else if (occupancy_pct >= 85) {
        status = 'near_capacity';
      }

      return {
        id: row.id,
        name: row.name,
        zone_id: row.zone_id,
        capacity,
        occupied,
        lat: row.lat,
        lng: row.lng,
        zone_name: zone?.name || 'Unassigned Sector',
        free_beds,
        occupancy_pct,
        status,
      };
    });
  }

  async getShelterById(id: string): Promise<ShelterWithZone | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('shelters')
      .select(`
        id,
        name,
        zone_id,
        capacity,
        occupied,
        lat,
        lng,
        zones (
          name
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch shelter: ${error.message}`);
    }
    if (!data) return null;

    const row = data as unknown as ShelterQueryRow;
    const capacity = Number(row.capacity);
    const occupied = Number(row.occupied);
    const free_beds = Math.max(0, capacity - occupied);
    const occupancy_pct =
      capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

    let status: 'available' | 'near_capacity' | 'full' = 'available';
    if (occupied >= capacity) {
      status = 'full';
    } else if (occupancy_pct >= 85) {
      status = 'near_capacity';
    }

    return {
      id: row.id,
      name: row.name,
      zone_id: row.zone_id,
      capacity,
      occupied,
      lat: row.lat,
      lng: row.lng,
      zone_name: row.zones?.name || 'Unassigned Sector',
      free_beds,
      occupancy_pct,
      status,
    };
  }

  async updateShelterOccupancy(id: string, occupied: number): Promise<ShelterWithZone> {
    const current = await this.getShelterById(id);
    if (!current) {
      throw new Error(`Shelter with ID ${id} not found.`);
    }

    if (occupied < 0) {
      throw new Error(`Occupied beds cannot be negative (${occupied}).`);
    }

    // Capacity integrity check: occupied beds cannot exceed total capacity
    if (occupied > current.capacity) {
      throw new Error(
        `Capacity integrity violation: occupied beds (${occupied}) exceeds maximum capacity of ${current.capacity}.`
      );
    }

    const client = this.ensureClient();
    const { error } = await client
      .from('shelters')
      .update({ occupied })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update shelter occupancy: ${error.message}`);
    }

    const updated = await this.getShelterById(id);
    if (!updated) {
      throw new Error(`Shelter with ID ${id} could not be retrieved after update.`);
    }
    return updated;
  }

  // ==========================================
  // OUTREACH ACTIONS & VOLUNTEER TASKS
  // ==========================================

  async listOutreachActions(filters?: {
    channel?: OutreachChannelType;
    status?: OutreachStatusType;
    household_id?: string;
  }): Promise<OutreachActionWithDetails[]> {
    const client = this.ensureClient();

    let query = client.from('outreach_actions').select(`
      id,
      household_id,
      zone_id,
      channel,
      status,
      due_at,
      attempted_at,
      note,
      created_at,
      households (
        label
      ),
      zones (
        name
      )
    `);

    if (filters?.channel) {
      query = query.eq('channel', filters.channel);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.household_id) {
      query = query.eq('household_id', filters.household_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list outreach actions: ${error.message}`);
    }

    const rows = (data || []) as unknown as OutreachActionQueryRow[];

    return rows.map((row) => ({
      id: row.id,
      household_id: row.household_id,
      zone_id: row.zone_id,
      channel: row.channel,
      status: row.status,
      due_at: row.due_at,
      attempted_at: row.attempted_at,
      note: row.note,
      created_at: row.created_at,
      household_label: row.households?.label || undefined,
      zone_name: row.zones?.name || undefined,
    }));
  }

  async createOutreachAction(
    input: CreateOutreachActionInput
  ): Promise<OutreachActionWithDetails> {
    const client = this.ensureClient();

    const record = {
      household_id: input.household_id || null,
      zone_id: input.zone_id || null,
      channel: input.channel,
      status: input.status || 'planned',
      due_at: input.due_at || null,
      attempted_at: input.attempted_at || new Date().toISOString(),
      note: input.note || null,
    };

    const { data, error } = await client
      .from('outreach_actions')
      .insert(record)
      .select(`
        id,
        household_id,
        zone_id,
        channel,
        status,
        due_at,
        attempted_at,
        note,
        created_at
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create outreach action: ${error.message}`);
    }

    let household_label: string | undefined;
    let zone_name: string | undefined;

    if (data.household_id) {
      const hh = await this.getHouseholdById(data.household_id);
      household_label = hh?.label;
      zone_name = hh?.zone_name;
    }

    return {
      ...data,
      household_label,
      zone_name,
    };
  }

  async updateOutreachAction(
    id: string,
    input: PatchOutreachActionInput
  ): Promise<OutreachActionWithDetails> {
    const client = this.ensureClient();

    const { data: existing, error: fetchErr } = await client
      .from('outreach_actions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      throw new Error(`Outreach action with ID ${id} not found.`);
    }

    const updates: Partial<DbOutreachAction> = {
      status: input.status,
    };
    if (input.note !== undefined) {
      updates.note = input.note;
    }

    const { data, error } = await client
      .from('outreach_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update outreach action: ${error.message}`);
    }

    // If a volunteer visit is marked as safe_confirmed, update the household contact_status to 'reached'
    if (input.status === 'safe_confirmed' && existing.household_id) {
      try {
        await this.updateHousehold(existing.household_id, {
          contact_status: 'reached',
          last_contact_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not auto-update household on safe confirmation:', err);
      }
    }

    return data as OutreachActionWithDetails;
  }

  // ==========================================
  // NO-RESPONSE ESCALATION LOGIC
  // ==========================================

  /**
   * Safe Escalation: Uncontacted vulnerable households in high-risk zones
   * are routed to volunteer welfare verification patrols.
   * Silence is treated as unknown status, NEVER as an automatic emergency rescue declaration.
   */
  async escalateNoResponseHouseholds(): Promise<{
    escalatedCount: number;
    tasksCreated: string[];
  }> {
    const households = await this.listHouseholds();
    const activeTasks = await this.listOutreachActions({ channel: 'volunteer_visit' });
    const activeHouseholdIds = new Set(
      activeTasks
        .filter((t) => ['planned', 'visit_assigned'].includes(t.status))
        .map((t) => t.household_id)
        .filter(Boolean)
    );

    const candidates = households.filter((h) => {
      // Must be in a high-risk zone
      const isHighRiskZone =
        (h.zone_flood_risk ?? 0) >= 2 ||
        (h.zone_minutes_to_impact != null && h.zone_minutes_to_impact <= 60);

      // Must be uncontacted or need visit
      const isUncontacted =
        h.contact_status === 'no_response' ||
        h.contact_status === 'needs_visit' ||
        h.reachability === 'no_phone';

      // Must have vulnerability flag
      const isVulnerable = h.is_vulnerable;

      return isHighRiskZone && isUncontacted && isVulnerable;
    });

    const tasksCreated: string[] = [];

    for (const c of candidates) {
      if (activeHouseholdIds.has(c.id)) {
        continue; // Already has an active volunteer task
      }

      const note = `[DEMO ONLY / SIMULATED] Escalated uncontacted vulnerable household (${c.label}) in ${c.zone_name}. Volunteer physical welfare verification required.`;

      const task = await this.createOutreachAction({
        household_id: c.id,
        zone_id: c.zone_id,
        channel: 'volunteer_visit',
        status: 'planned',
        note,
      });

      tasksCreated.push(task.id);
    }

    return {
      escalatedCount: tasksCreated.length,
      tasksCreated,
    };
  }

  // ==========================================
  // OVERVIEW METRICS
  // ==========================================

  async getOverviewMetrics(): Promise<ReachabilityOverviewMetrics> {
    const households = await this.listHouseholds();
    const shelters = await this.listShelters();
    const volunteerTasks = await this.listOutreachActions({ channel: 'volunteer_visit' });

    let noPhoneCount = 0;
    let basicPhoneCount = 0;
    let smartphoneCount = 0;
    let unknownReachabilityCount = 0;
    let uncontactedCount = 0;
    let needsVisitCount = 0;
    let reachedCount = 0;

    for (const h of households) {
      if (h.reachability === 'no_phone') noPhoneCount++;
      else if (h.reachability === 'basic_phone') basicPhoneCount++;
      else if (h.reachability === 'smartphone') smartphoneCount++;
      else unknownReachabilityCount++;

      if (h.contact_status === 'reached') reachedCount++;
      else if (h.contact_status === 'needs_visit') needsVisitCount++;
      else if (h.contact_status === 'no_response') uncontactedCount++;
    }

    const activeVolunteerTasks = volunteerTasks.filter((t) =>
      ['planned', 'visit_assigned'].includes(t.status)
    ).length;

    let totalShelterCapacity = 0;
    let totalShelterOccupied = 0;
    let sheltersNearCapacityCount = 0;

    for (const s of shelters) {
      totalShelterCapacity += s.capacity;
      totalShelterOccupied += s.occupied;
      if (s.status === 'near_capacity' || s.status === 'full') {
        sheltersNearCapacityCount++;
      }
    }

    const totalFreeBeds = Math.max(0, totalShelterCapacity - totalShelterOccupied);

    return {
      totalHouseholds: households.length,
      noPhoneCount,
      basicPhoneCount,
      smartphoneCount,
      unknownReachabilityCount,
      uncontactedCount,
      needsVisitCount,
      reachedCount,
      activeVolunteerTasks,
      totalShelterCapacity,
      totalShelterOccupied,
      totalFreeBeds,
      sheltersNearCapacityCount,
    };
  }
}

export const outreachRepository = new OutreachRepository();
