/**
 * FIRSTREACH — Shared TypeScript Domain Interfaces
 * Built for 4-developer modular development across:
 * - /dashboard (Member 1)
 * - /report (Member 2)
 * - /dispatch (Member 3)
 * - /outreach (Member 4)
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type VerificationStatus = 'verified' | 'unverified' | 'pending_verification';

export type IncidentStatus = 
  | 'pending_dispatch'
  | 'assigned'
  | 'en_route'
  | 'rescued'
  | 'unserved';

export type ResourceType = 
  | 'boat'
  | 'medical_boat'
  | 'high_clearance_vehicle'
  | 'specialized_amphibious'
  | 'drone_delivery'
  | 'volunteer_team';

export type TeamStatus = 'available' | 'busy' | 'staging' | 'maintenance';

export type PhoneReachability = 'none' | 'intermittent' | 'connected';

export type ContactStatus = 
  | 'unreachable'
  | 'overdue_checkin'
  | 'confirmed_safe'
  | 'needs_visit'
  | 'not_contacted';

export type OutreachMethod = 
  | 'volunteer_visit'
  | 'loudspeaker_alert'
  | 'neighbor_relay'
  | 'sms_fallback'
  | 'voice_call'
  | 'app_push';

export interface IncidentFactors {
  risingWater: boolean;
  medicalEmergency: boolean;
  mobilityAssistanceRequired: boolean;
  peopleTrapped: boolean;
  elderlyPresent: boolean;
  childrenPresent: boolean;
}

export interface ZoneRiskSnapshot {
  level: SeverityLevel;
  waterDepthMeters: number;
  timeToHarmHours: number;
  coveragePct: number;
}

export interface Zone {
  id: string;
  name: string;
  area: string;
  coordinates: [number, number]; // [lat, lng]
  floodExposureLevel: SeverityLevel;
  reportingCoverage: number; // 0 - 100%
  unreachableHouseholds: number;
  lastContactTime: string;
  suggestedVerificationStatus: 'urgent' | 'pending' | 'verified' | 'unverified';
  simulatedRiskAtHour?: Record<number, ZoneRiskSnapshot>;
}

export interface EmergencyIncident {
  id: string;
  zoneId: string;
  zoneName: string;
  locationDescription: string;
  coordinates: [number, number]; // [lat, lng]
  affectedPeople: number;
  severity: SeverityLevel;
  priorityScore: number; // 0 - 100 (weighted algorithm)
  verificationStatus: VerificationStatus;
  timeUrgencyHours: number; // estimated hours remaining before critical harm
  status: IncidentStatus;
  blockingReason?: string; // if unserved, why
  requiredResourceType: ResourceType;
  factors: IncidentFactors;
  reporterName?: string;
  reporterPhone?: string;
  reporterRole?: 'resident' | 'neighbor' | 'volunteer' | 'other';
  createdAt: string;
  priorityRationale: string[];
}

export interface RescueTeam {
  id: string;
  name: string;
  type: ResourceType;
  status: TeamStatus;
  capacity: number; // number of persons rescued per trip
  currentAssignment?: string;
  capabilities: string[];
  location: string;
  coordinates: [number, number];
  etaMinutes: number;
  estimatedCostPkr: number;
  contactCallsign: string;
}

export interface Shelter {
  id: string;
  name: string;
  zone: string;
  totalCapacity: number;
  occupiedSpaces: number;
  availableSpaces: number;
  status: 'available' | 'near_capacity' | 'full';
  coordinates: [number, number];
  hasMedicalSupport: boolean;
  hasFoodSupply: boolean;
  lastUpdated: string;
}

export interface Household {
  id: string;
  referenceCode: string; // e.g. HH-SUR-0412
  zoneId: string;
  zoneName: string;
  headOfHousehold: string;
  totalMembers: number;
  vulnerabilityIndicators: string[];
  phoneReachability: PhoneReachability;
  lastSuccessfulContact: string;
  contactStatus: ContactStatus;
  silenceDurationHours: number;
  escalationLevel: 'normal' | 'monitoring' | 'verification_visit' | 'high_priority_outreach';
  recommendedOutreachMethod: OutreachMethod;
  notes?: string;
}

export interface VolunteerTask {
  id: string;
  householdReference: string;
  zoneName: string;
  reason: string;
  urgency: SeverityLevel;
  status: 'pending' | 'assigned' | 'completed';
  assignedVolunteer?: string;
  createdAt: string;
}

export interface DispatchRecommendation {
  incidentId: string;
  teamId: string;
  suitabilityScore: number; // 0 - 100
  etaMinutes: number;
  estimatedCostPkr: number;
  reasoning: string;
  safetyFirstPrinciple: string;
}

export interface EmergencyReportFormData {
  reportingFor: 'myself' | 'someone_else';
  reporterName?: string;
  reporterPhone?: string;
  reporterRole: 'resident' | 'neighbor' | 'volunteer' | 'other';
  zoneId: string;
  locationDescription: string;
  latitude: number | '';
  longitude: number | '';
  affectedPeople: number;
  floodSeverity: SeverityLevel;
  factors: IncidentFactors;
  additionalDescription?: string;
  reliabilityConfirmed: boolean;
  lastObservationTime: string;
}
