import { z } from 'zod';

/**
 * Strict database and domain types for Member 4: Outreach & Shelters
 * Verified against FirstReach_Complete_Schema_Source.sql
 */

// 1. Strict Enum Types matching PostgreSQL CHECK constraints
export type ReachabilityType = 'smartphone' | 'basic_phone' | 'no_phone' | 'unknown';
export const REACHABILITY_VALUES: [ReachabilityType, ...ReachabilityType[]] = [
  'smartphone',
  'basic_phone',
  'no_phone',
  'unknown',
];

export type ContactStatusType = 'unknown' | 'reached' | 'no_response' | 'needs_visit';
export const CONTACT_STATUS_VALUES: [ContactStatusType, ...ContactStatusType[]] = [
  'unknown',
  'reached',
  'no_response',
  'needs_visit',
];

export type OutreachChannelType =
  | 'app_demo'
  | 'sms_demo'
  | 'call_demo'
  | 'volunteer_visit'
  | 'broadcast_demo';
export const OUTREACH_CHANNEL_VALUES: [OutreachChannelType, ...OutreachChannelType[]] = [
  'app_demo',
  'sms_demo',
  'call_demo',
  'volunteer_visit',
  'broadcast_demo',
];

export type OutreachStatusType =
  | 'planned'
  | 'sent_demo'
  | 'visit_assigned'
  | 'safe_confirmed'
  | 'needs_help'
  | 'no_response'
  | 'cancelled';
export const OUTREACH_STATUS_VALUES: [OutreachStatusType, ...OutreachStatusType[]] = [
  'planned',
  'sent_demo',
  'visit_assigned',
  'safe_confirmed',
  'needs_help',
  'no_response',
  'cancelled',
];

// 2. Database Record Interfaces
export interface DbZone {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  flood_risk: number; // 0..3
  minutes_to_impact: number | null;
  reporting_coverage: 'unknown' | 'low' | 'adequate';
  created_at: string;
}

export interface DbHousehold {
  id: string;
  zone_id: string;
  label: string;
  lat: number | null;
  lng: number | null;
  people_count: number;
  elderly_present: boolean;
  mobility_assistance: boolean;
  medical_support_needed: boolean;
  reachability: ReachabilityType;
  last_contact_at: string | null;
  contact_status: ContactStatusType;
  created_at: string;
}

export interface DbShelter {
  id: string;
  name: string;
  zone_id: string | null;
  capacity: number;
  occupied: number;
  lat: number | null;
  lng: number | null;
}

export interface DbOutreachAction {
  id: string;
  household_id: string | null;
  zone_id: string | null;
  channel: OutreachChannelType;
  status: OutreachStatusType;
  due_at: string | null;
  attempted_at: string | null;
  note: string | null;
  created_at: string;
}

// 3. View / API Model Interfaces
export interface HouseholdWithZone extends DbHousehold {
  zone_name?: string;
  zone_flood_risk?: number;
  zone_minutes_to_impact?: number | null;
  silence_hours?: number;
  is_vulnerable?: boolean;
}

export interface ShelterWithZone extends DbShelter {
  zone_name?: string;
  free_beds: number;
  occupancy_pct: number;
  status: 'available' | 'near_capacity' | 'full';
}

export interface OutreachActionWithDetails extends DbOutreachAction {
  household_label?: string;
  zone_name?: string;
}

export interface ReachabilityOverviewMetrics {
  totalHouseholds: number;
  noPhoneCount: number;
  basicPhoneCount: number;
  smartphoneCount: number;
  unknownReachabilityCount: number;
  uncontactedCount: number;
  needsVisitCount: number;
  reachedCount: number;
  activeVolunteerTasks: number;
  totalShelterCapacity: number;
  totalShelterOccupied: number;
  totalFreeBeds: number;
  sheltersNearCapacityCount: number;
}

// 4. Zod Request Validation Schemas
export const PatchHouseholdSchema = z.object({
  contact_status: z.enum(CONTACT_STATUS_VALUES, {
    message: `contact_status must be one of: ${CONTACT_STATUS_VALUES.join(', ')}`,
  }),
  last_contact_at: z.string().nullable().optional(),
  reachability: z.enum(REACHABILITY_VALUES).optional(),
});

export type PatchHouseholdInput = z.infer<typeof PatchHouseholdSchema>;

export const PatchShelterSchema = z.object({
  occupied: z
    .number()
    .int()
    .min(0, { message: 'occupied beds cannot be negative' }),
});

export type PatchShelterInput = z.infer<typeof PatchShelterSchema>;

export const CreateOutreachActionSchema = z
  .object({
    household_id: z.string().uuid({ message: 'household_id must be a valid UUID' }).nullable().optional(),
    zone_id: z.string().uuid({ message: 'zone_id must be a valid UUID' }).nullable().optional(),
    channel: z.enum(OUTREACH_CHANNEL_VALUES, {
      message: `channel must be one of: ${OUTREACH_CHANNEL_VALUES.join(', ')}`,
    }),
    status: z.enum(OUTREACH_STATUS_VALUES).default('planned'),
    due_at: z.string().nullable().optional(),
    attempted_at: z.string().nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (data) => Boolean(data.household_id || data.zone_id),
    { message: 'Action must be associated with either a household_id or a zone_id' }
  );

export type CreateOutreachActionInput = z.infer<typeof CreateOutreachActionSchema>;

export const PatchOutreachActionSchema = z.object({
  status: z.enum(OUTREACH_STATUS_VALUES, {
    message: `status must be one of: ${OUTREACH_STATUS_VALUES.join(', ')}`,
  }),
  note: z.string().max(1000).nullable().optional(),
});

export type PatchOutreachActionInput = z.infer<typeof PatchOutreachActionSchema>;
