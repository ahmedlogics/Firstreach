/**
 * FIRSTREACH — Member 1 Dashboard Domain Types
 * Exactly matches Supabase PostgreSQL schema:
 * - public.zones
 * - public.incidents
 * - public.households
 * - public.rescue_teams
 * - public.shelters
 * - public.assignments
 */

export interface DbZone {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  flood_risk: number; // smallint (0–3)
  minutes_to_impact: number | null;
  reporting_coverage: 'unknown' | 'low' | 'adequate';
  created_at: string;
}

export interface DbIncident {
  id: string;
  zone_id: string | null;
  household_id: string | null;
  lat: number | null;
  lng: number | null;
  people_count: number;
  flood_severity: number; // smallint (0–3)
  medical_urgent: boolean;
  mobility_help: boolean;
  minutes_to_harm: number | null;
  priority_score: number; // smallint (0–100)
  priority_reason: string | null;
  verification_status: 'unverified' | 'verified' | 'conflicting';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  details: string | null;
  created_at: string;
  updated_at: string;
  // Augmented field from relation join
  zone_name?: string;
}

export interface DbRescueTeam {
  id: string;
  name: string;
  team_type: 'boat' | 'vehicle' | 'medical';
  capacity: number;
  capabilities: string[];
  lat: number | null;
  lng: number | null;
  status: 'available' | 'busy' | 'offline';
  fixed_cost: number;
  cost_per_km: number;
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
  reachability: 'smartphone' | 'basic_phone' | 'no_phone' | 'unknown';
  last_contact_at: string | null;
  contact_status: 'unknown' | 'reached' | 'no_response' | 'needs_visit';
  created_at: string;
}

export interface DbShelter {
  id: string;
  name: string;
  zone_id: string | null;
  capacity: number;
  occupied: number;
  lat: number;
  lng: number;
}

export interface DbAssignment {
  id: string;
  incident_id: string;
  team_id: string;
  status: string;
  created_at?: string;
}

export interface DashboardStatistics {
  activeEmergencies: number; // open, assigned, in_progress
  criticalEmergencies: number; // priority_score >= 80
  availableRescueTeams: number; // status === 'available'
  unreachableHouseholds: number; // reachability === 'no_phone'
  uncontactedHouseholds: number; // no_response + needs_visit
  unservedEmergencies: number | 'Not connected'; // open with no active assignment
  totalHouseholds: number;
  totalShelterCapacity: number;
  totalShelterOccupied: number;
}

export interface ZoneAnalytics extends DbZone {
  householdCount: number;
  noPhoneCount: number;
  uncontactedCount: number;
  incidentCount: number;
  criticalIncidentCount: number;
  isBlindSpot: boolean;
  blindSpotReason?: string;
  recommendedAction?: string;
}

export interface DashboardOverviewResponse {
  success: boolean;
  statistics: DashboardStatistics;
  incidents: DbIncident[];
  zones: ZoneAnalytics[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  lastUpdated: string;
  dataSource: 'supabase_live' | 'fallback_demo';
  error?: string;
}
