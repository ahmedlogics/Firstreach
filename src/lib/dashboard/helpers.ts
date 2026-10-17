import {
  DbZone,
  DbIncident,
  DbHousehold,
  DbRescueTeam,
  DbShelter,
  DbAssignment,
  DashboardStatistics,
  ZoneAnalytics,
} from './types';

/**
 * Calculates dashboard statistics strictly following Member 1 criteria.
 */
export function calculateDashboardStats(
  incidents: DbIncident[],
  teams: DbRescueTeam[],
  households: DbHousehold[],
  shelters: DbShelter[],
  assignments: DbAssignment[]
): DashboardStatistics {
  // Active Emergencies: open, assigned, in_progress
  const activeEmergencies = incidents.filter((i) =>
    ['open', 'assigned', 'in_progress'].includes(i.status)
  ).length;

  // Critical Emergencies: unresolved with priority_score >= 80
  const criticalEmergencies = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'cancelled' && i.priority_score >= 80
  ).length;

  // Available Rescue Teams: status === 'available'
  const availableRescueTeams = teams.filter((t) => t.status === 'available').length;

  // Unreachable Households: reachability === 'no_phone'
  const unreachableHouseholds = households.filter((h) => h.reachability === 'no_phone').length;

  // Uncontacted Households: contact_status === 'no_response' or 'needs_visit'
  const uncontactedHouseholds = households.filter((h) =>
    ['no_response', 'needs_visit'].includes(h.contact_status)
  ).length;

  // Unserved Emergencies: open incidents with no active assigned team
  const assignedIncidentIds = new Set(
    assignments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed').map((a) => a.incident_id)
  );
  const unservedEmergencies = incidents.filter(
    (i) => i.status === 'open' && !assignedIncidentIds.has(i.id)
  ).length;

  const totalShelterCapacity = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalShelterOccupied = shelters.reduce((acc, s) => acc + (s.occupied || 0), 0);

  return {
    activeEmergencies,
    criticalEmergencies,
    availableRescueTeams,
    unreachableHouseholds,
    uncontactedHouseholds,
    unservedEmergencies,
    totalHouseholds: households.length,
    totalShelterCapacity,
    totalShelterOccupied,
  };
}

/**
 * Evaluates high-risk blind-spot status for each zone.
 * Core Principle: Zero reports can indicate missing information or blackout, not safety.
 */
export function evaluateZoneAnalytics(
  zone: DbZone,
  households: DbHousehold[],
  incidents: DbIncident[]
): ZoneAnalytics {
  const zoneHouseholds = households.filter((h) => h.zone_id === zone.id);
  const zoneIncidents = incidents.filter((i) => i.zone_id === zone.id);

  const noPhoneCount = zoneHouseholds.filter((h) => h.reachability === 'no_phone').length;
  const uncontactedCount = zoneHouseholds.filter((h) =>
    ['no_response', 'needs_visit'].includes(h.contact_status)
  ).length;
  const criticalIncidentCount = zoneIncidents.filter((i) => i.priority_score >= 80).length;

  // Rule: Known hazard exposure (flood_risk >= 2 or minutes_to_impact <= 60)
  // combined with low reporting coverage or uncontacted households with few/zero reports.
  const isHighExposure = zone.flood_risk >= 2 || (zone.minutes_to_impact !== null && zone.minutes_to_impact <= 60);
  const isLowCoverage = zone.reporting_coverage === 'low' || zone.reporting_coverage === 'unknown';
  const hasSilenceGap = (noPhoneCount > 0 || uncontactedCount > 0) && zoneIncidents.length === 0;

  const isBlindSpot = isHighExposure && (isLowCoverage || hasSilenceGap);

  let blindSpotReason: string | undefined;
  let recommendedAction: string | undefined;

  if (isBlindSpot) {
    if (zone.reporting_coverage === 'low' && zoneIncidents.length === 0) {
      blindSpotReason = `High flood risk (Tier ${zone.flood_risk}) with ${
        zone.minutes_to_impact !== null ? `${zone.minutes_to_impact}m to impact` : 'imminent hazard'
      }, yet 0 reports filed and low coverage. High probability of communication blackout.`;
      recommendedAction = 'Deploy mobile volunteer reconnaissance patrol for immediate door-to-door welfare verification.';
    } else if (uncontactedCount > 0) {
      blindSpotReason = `${uncontactedCount} unconfirmed/needs-visit households in flood path with minimal incoming telemetry.`;
      recommendedAction = 'Task community volunteers or neighbor relays to confirm physical evacuation status.';
    } else {
      blindSpotReason = `Zone under active surge threat with low verification coverage.`;
      recommendedAction = 'Dispatch ground verification team before allocating watercraft.';
    }
  }

  return {
    ...zone,
    householdCount: zoneHouseholds.length,
    noPhoneCount,
    uncontactedCount,
    incidentCount: zoneIncidents.length,
    criticalIncidentCount,
    isBlindSpot,
    blindSpotReason,
    recommendedAction,
  };
}

/**
 * Calculates remaining minutes to impact given simulation offset.
 * Handles null honestly per prompt guidelines.
 */
export function getSimulatedMinutesToImpact(
  baseMinutes: number | null,
  simulationOffsetMinutes: number
): number | null {
  if (baseMinutes === null) return null;
  return Math.max(0, baseMinutes - simulationOffsetMinutes);
}

/**
 * Priority Tier classification derived from actual priority_score.
 */
export function getPriorityTier(score: number): {
  tier: 'Critical' | 'High' | 'Medium' | 'Low';
  badgeClass: string;
  dotColor: string;
} {
  if (score >= 80) {
    return {
      tier: 'Critical',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-[#F16D70]',
    };
  }
  if (score >= 60) {
    return {
      tier: 'High',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-[#F5B544]',
    };
  }
  if (score >= 40) {
    return {
      tier: 'Medium',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
    };
  }
  return {
    tier: 'Low',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-[#10B981]',
  };
}

/**
 * Translates numeric flood_severity (0–3) into human-readable label.
 */
export function formatFloodSeverity(severity: number): {
  label: string;
  colorClass: string;
} {
  switch (severity) {
    case 3:
      return { label: 'Severe / Neck-deep', colorClass: 'text-red-700 font-bold' };
    case 2:
      return { label: 'Moderate / Waist-deep', colorClass: 'text-amber-700 font-semibold' };
    case 1:
      return { label: 'Minor / Knee-deep', colorClass: 'text-blue-700' };
    default:
      return { label: 'Surface Runoff / Low', colorClass: 'text-slate-600' };
  }
}
