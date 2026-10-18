export interface ZoneItem {
  id: string;
  name: string;
  flood_risk?: string;
  reporting_coverage?: string;
}

export interface ReportFormData {
  zoneId: string;
  locationDescription: string;
  observationOption: 'now' | '15m' | '1h' | '3h' | '12h' | '24h';
  customObservedAt?: string;
  reportingFor: 'myself' | 'someone_else';
  reporterRole: 'resident' | 'neighbor' | 'volunteer' | 'other';
  floodSeverity: number; // 0, 1, 2, 3
  peopleCount: number | null;
  isPeopleCountUnknown: boolean;
  trapped: boolean | null;
  medicalUrgent: boolean | null;
  mobilityHelp: boolean | null;
  lat: number | null;
  lng: number | null;
  description: string;
  reporterName: string;
  reporterPhone: string;
  idempotencyKey: string;
}

export interface ReportSuccessResult {
  ok: true;
  reportId: string;
  incidentId: string;
  verificationStatus: string;
  priorityScore: number;
  needsReview: boolean;
  missingFields: string[];
  possibleDuplicateOf: string | null;
  hasCoordinates: boolean;
}
