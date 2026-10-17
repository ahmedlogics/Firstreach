import { EmergencyReportInput } from './schema';

export interface CandidateIncident {
  id: string;
  zone_id: string;
  household_id?: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  created_at: string;
  flood_severity: number;
  people_count: number;
  medical_urgent: boolean;
  mobility_help: boolean;
  verification_status: 'unverified' | 'verified' | 'conflicting';
}

export interface DuplicateMatch {
  matchedIncidentId: string;
  reason: string;
  distanceMeters?: number;
}


export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; 
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export function findPossibleDuplicate(
  newReport: Pick<
    EmergencyReportInput,
    'zoneId' | 'lat' | 'lng' | 'observedAt'
  > & { householdId?: string | null },
  recentIncidents: CandidateIncident[]
): DuplicateMatch | null {
  const activeStatuses = new Set(['open', 'assigned', 'in_progress']);

  const reportTime =
    typeof newReport.observedAt === 'string'
      ? new Date(newReport.observedAt).getTime()
      : newReport.observedAt instanceof Date
      ? newReport.observedAt.getTime()
      : Date.now();

  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  for (const incident of recentIncidents) {
    // 1. Must be active
    if (!activeStatuses.has(incident.status)) {
      continue;
    }

    // 2. Created within 2 hours
    const incidentTime = new Date(incident.created_at).getTime();
    if (Math.abs(reportTime - incidentTime) > TWO_HOURS_MS) {
      continue;
    }

    // 3a. Same household ID
    if (
      newReport.householdId &&
      incident.household_id &&
      newReport.householdId === incident.household_id
    ) {
      return {
        matchedIncidentId: incident.id,
        reason: `Matched active incident ${incident.id} with identical household ID (${newReport.householdId}) within 2 hours`,
      };
    }

    // 3b. Same zone + within 50m (both have coordinates)
    if (
      newReport.zoneId === incident.zone_id &&
      newReport.lat != null &&
      newReport.lng != null &&
      incident.lat != null &&
      incident.lng != null
    ) {
      const distance = haversineMeters(
        newReport.lat,
        newReport.lng,
        incident.lat,
        incident.lng
      );

      if (distance <= 50) {
        return {
          matchedIncidentId: incident.id,
          reason: `Matched active incident ${incident.id} in zone ${newReport.zoneId} within ${Math.round(distance)}m`,
          distanceMeters: Math.round(distance),
        };
      }
    }
  }

  return null;
}

export interface MergeRaiseResult {
  updatedFields: {
    flood_severity: number;
    people_count: number;
    medical_urgent: boolean;
    mobility_help: boolean;
    verification_status: 'unverified' | 'verified' | 'conflicting';
    updated_at: string;
  };
  isConflicting: boolean;
  raisedFields: string[];
}


export function mergeRaiseOnly(
  existingIncident: CandidateIncident,
  newReport: Pick<
    EmergencyReportInput,
    'floodSeverity' | 'peopleCount' | 'medicalUrgent' | 'mobilityHelp'
  >
): MergeRaiseResult {
  const raisedFields: string[] = [];

  // Severity: only raise
  const newSeverity = Math.max(
    existingIncident.flood_severity,
    newReport.floodSeverity
  );
  if (newSeverity > existingIncident.flood_severity) {
    raisedFields.push('flood_severity');
  }

  // People count: only raise (unknown/null does not lower)
  const incomingPeople = newReport.peopleCount ?? 0;
  const newPeopleCount = Math.max(existingIncident.people_count, incomingPeople);
  if (newPeopleCount > existingIncident.people_count) {
    raisedFields.push('people_count');
  }

  // Medical urgent: true over false
  const newMedicalUrgent =
    existingIncident.medical_urgent || newReport.medicalUrgent === true;
  if (newMedicalUrgent && !existingIncident.medical_urgent) {
    raisedFields.push('medical_urgent');
  }

  // Mobility help: true over false
  const newMobilityHelp =
    existingIncident.mobility_help || newReport.mobilityHelp === true;
  if (newMobilityHelp && !existingIncident.mobility_help) {
    raisedFields.push('mobility_help');
  }

  // Verification conflict: difference of 2 or more in severity
  const severityDifference = Math.abs(
    newReport.floodSeverity - existingIncident.flood_severity
  );
  const isConflicting = severityDifference >= 2;

  let verification_status = existingIncident.verification_status;
  if (isConflicting) {
    verification_status = 'conflicting';
  }

  return {
    updatedFields: {
      flood_severity: newSeverity,
      people_count: newPeopleCount,
      medical_urgent: newMedicalUrgent,
      mobility_help: newMobilityHelp,
      verification_status,
      updated_at: new Date().toISOString(),
    },
    isConflicting,
    raisedFields,
  };
}
