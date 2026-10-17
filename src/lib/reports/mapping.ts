import { EmergencyReportInput } from './schema';

export type ReportSource = 'resident' | 'volunteer' | 'coordinator';

export type SeverityLabel = 'low' | 'medium' | 'high' | 'critical';


export function reporterRoleToSource(
  role: EmergencyReportInput['reporterRole']
): ReportSource {
  switch (role) {
    case 'volunteer':
      return 'volunteer';
    case 'resident':
    case 'neighbor':
    case 'other':
    default:
      return 'resident';
  }
}

export function severityToLevel(severity: number): SeverityLabel {
  switch (severity) {
    case 3:
      return 'critical';
    case 2:
      return 'high';
    case 1:
      return 'medium';
    case 0:
    default:
      return 'low';
  }
}


export function levelToSeverity(level: string): number {
  switch (level.toLowerCase()) {
    case 'critical':
      return 3;
    case 'high':
      return 2;
    case 'medium':
      return 1;
    case 'low':
    default:
      return 0;
  }
}


export function computeMissingFields(input: EmergencyReportInput): string[] {
  const missing: string[] = [];
  if (input.peopleCount === null) {
    missing.push('peopleCount');
  }
  if (input.trapped === null) {
    missing.push('trapped');
  }
  if (input.medicalUrgent === null) {
    missing.push('medicalUrgent');
  }
  if (input.mobilityHelp === null) {
    missing.push('mobilityHelp');
  }
  if (input.lat == null || input.lng == null) {
    missing.push('coordinates');
  }
  return missing;
}

export interface IncidentInsertColumns {
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
}


export function toIncidentColumns(
  input: EmergencyReportInput,
  priorityScore = 0,
  priorityReason = ''
): IncidentInsertColumns {
  const missingFields = computeMissingFields(input);
  const unknownNotes =
    missingFields.length > 0 ? `\nUnknown: ${missingFields.join(', ')}` : '';

  const observerText = input.description
    ? `${input.locationDescription} — ${input.description}`
    : input.locationDescription;

  const fullDetails = `${observerText}${unknownNotes}`;

  return {
    zone_id: input.zoneId,
    household_id: null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    people_count: input.peopleCount ?? 1,
    flood_severity: input.floodSeverity,
    medical_urgent: input.medicalUrgent === true,
    mobility_help: input.mobilityHelp === true,
    minutes_to_harm: null,
    priority_score: priorityScore,
    priority_reason: priorityReason,
    verification_status: 'unverified',
    status: 'open',
    details: fullDetails,
  };
}
