/**
 * FIRSTREACH — Member 3: Dispatch & Rescue Resource Allocation Types
 * Strictly aligned with Supabase schema and life-first emergency dispatch rules.
 */

export interface DbIncident {
  id: string; // uuid
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
}

export interface DbRescueTeam {
  id: string; // uuid
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

export interface DbAssignment {
  id: string; // uuid
  incident_id: string;
  team_id: string;
  shelter_id: string | null;
  estimated_cost: number | null;
  estimated_eta_minutes: number | null;
  status: 'assigned' | 'en_route' | 'completed' | 'cancelled';
  approved_at: string;
  completed_at: string | null;
  note: string | null;
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

export interface DbZone {
  id: string;
  name: string;
  center_lat?: number | null;
  center_lng?: number | null;
  flood_risk: number;
  minutes_to_impact: number;
  reporting_coverage: string;
  created_at?: string;
}

export type PriorityTier = 'critical' | 'high' | 'medium' | 'low';

export interface PriorityBreakdown {
  floodScore: number;
  medicalScore: number;
  mobilityScore: number;
  timeScore: number;
  vulnerabilityScore: number;
  timeUrgencyUnknown: boolean;
  needsVerification: boolean;
  conflictingWarning: boolean;
}

export interface PriorityCalculationResult {
  score: number; // 0–100
  tier: PriorityTier;
  reason: string;
  breakdown: PriorityBreakdown;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TeamSuitability {
  team: DbRescueTeam;
  isEligible: boolean;
  rejectionReasons: string[];
  distanceKm: number | null;
  simulatedEtaMinutes: number | null;
  estimatedCostPkr: number | null;
  suitabilityScore: number; // 0–100
  isPotentiallyTooLate: boolean;
  warning?: string;
}

export interface RecommendedAssignment {
  incident: DbIncident;
  recommendedTeam: DbRescueTeam;
  suitability: TeamSuitability;
  alternativeTeams: TeamSuitability[];
  explanation: string;
  safetyFirstPrinciple: string;
  warnings: string[];
}

export interface UnservedIncident {
  incident: DbIncident;
  blockingReasons: string[];
  missingCapabilities: string[];
  suggestedEscalation: string;
  urgencyTier: PriorityTier;
  candidateTeamsEvaluated: number;
}

export interface RecommendationRunResult {
  recommendations: RecommendedAssignment[];
  unserved: UnservedIncident[];
  evaluatedIncidentCount: number;
  availableTeamCount: number;
}

export interface ConfirmAssignmentRequest {
  incidentId: string;
  teamId: string;
  shelterId?: string | null;
  note?: string;
  overrideReason?: string;
}

export interface ConfirmAssignmentResponse {
  success: boolean;
  assignmentId?: string;
  assignment?: DbAssignment;
  error?: string;
  message?: string;
}
