import { DbIncident, DbRescueTeam, TeamSuitability } from './types';
import {
  calculateDistanceKm,
  estimateArrivalMinutes,
  estimateDispatchCost,
  isEtaTooLate,
} from './cost';

/**
 * FIRSTREACH — Member 3: Resource Suitability & Eligibility Engine
 * Rigorous life-first eligibility evaluation.
 */

export interface EvaluationResult {
  eligible: TeamSuitability[];
  rejected: TeamSuitability[];
}

/**
 * Checks whether a team meets the mandatory capability requirements for an incident.
 */
export function checkCapabilitiesMatch(
  incident: Pick<DbIncident, 'flood_severity' | 'medical_urgent'>,
  team: Pick<DbRescueTeam, 'capabilities' | 'team_type'>
): { hasRequiredCapabilities: boolean; missingCapabilities: string[] } {
  const missingCapabilities: string[] = [];
  const teamCaps = (team.capabilities || []).map((c) => c.toLowerCase());
  const teamType = team.team_type?.toLowerCase();

  // 1. Flood capability check
  const requiresFlood = (incident.flood_severity ?? 0) > 0;
  const hasFloodCapability =
    teamCaps.includes('flood') ||
    teamCaps.includes('boat') ||
    teamCaps.includes('swiftwater') ||
    teamType === 'boat';

  if (requiresFlood && !hasFloodCapability) {
    missingCapabilities.push('flood-rescue capability');
  }

  // 2. Urgent medical capability check
  const requiresMedical = !!incident.medical_urgent;
  const hasMedicalCapability =
    teamCaps.includes('medical') ||
    teamCaps.includes('paramedic') ||
    teamCaps.includes('emt') ||
    teamType === 'medical';

  if (requiresMedical && !hasMedicalCapability) {
    missingCapabilities.push('emergency medical support');
  }

  return {
    hasRequiredCapabilities: missingCapabilities.length === 0,
    missingCapabilities,
  };
}

/**
 * Evaluates all candidate rescue teams for a given incident.
 * Separates teams into eligible candidates and rejected units with specific reasons.
 */
export function getEligibleRescueTeams(
  incident: DbIncident,
  rescueTeams: DbRescueTeam[]
): EvaluationResult {
  const eligible: TeamSuitability[] = [];
  const rejected: TeamSuitability[] = [];

  for (const team of rescueTeams) {
    const rejectionReasons: string[] = [];

    // Rule 1: Availability
    if (team.status !== 'available') {
      rejectionReasons.push(`Team is currently ${team.status}`);
    }

    // Rule 2: Single-team Capacity Constraint
    const peopleCount = incident.people_count ?? 1;
    if (team.capacity < peopleCount) {
      rejectionReasons.push(
        `Insufficient capacity: team carries ${team.capacity} persons, incident requires ${peopleCount}`
      );
    }

    // Rule 3: Mandatory Capabilities
    const { hasRequiredCapabilities, missingCapabilities } = checkCapabilitiesMatch(
      incident,
      team
    );
    if (!hasRequiredCapabilities) {
      rejectionReasons.push(
        `Lacks mandatory capabilities: ${missingCapabilities.join(', ')}`
      );
    }

    // Geographic distance & ETA calculation
    const distanceKm = calculateDistanceKm(
      { lat: team.lat, lng: team.lng },
      { lat: incident.lat, lng: incident.lng }
    );
    const simulatedEtaMinutes = estimateArrivalMinutes(team, distanceKm);
    const estimatedCostPkr = estimateDispatchCost(team, distanceKm);

    const isTooLate = isEtaTooLate(simulatedEtaMinutes, incident.minutes_to_harm);

    let warning: string | undefined;
    if (distanceKm === null) {
      warning = 'Location verification required: incident or team coordinates missing.';
    } else if (isTooLate) {
      warning = `Potentially too late — simulated arrival (~${simulatedEtaMinutes}m) exceeds estimated time to harm (~${incident.minutes_to_harm}m). Requires dispatcher escalation.`;
    }

    // Compute suitability score for ranking among eligible teams
    let suitabilityScore = 0;
    if (rejectionReasons.length === 0) {
      suitabilityScore = 50; // baseline for meeting all mandatory checks

      // Arrival before harm bonus
      if (!isTooLate && simulatedEtaMinutes !== null) {
        suitabilityScore += 25;
      } else if (isTooLate) {
        suitabilityScore -= 20; // heavy penalty for arriving after estimated harm
      }

      // Proximity / fast response bonus (up to 15 pts)
      if (simulatedEtaMinutes !== null) {
        const proximityPoints = Math.max(0, 15 - Math.floor(simulatedEtaMinutes / 5));
        suitabilityScore += proximityPoints;
      }

      // Extra capabilities bonus (e.g. medical when not strictly required)
      if (!incident.medical_urgent && team.capabilities.includes('medical')) {
        suitabilityScore += 5;
      }

      // Capacity buffer bonus
      if (team.capacity >= peopleCount + 2) {
        suitabilityScore += 5;
      }

      suitabilityScore = Math.min(100, Math.max(1, suitabilityScore));
    }

    const suitability: TeamSuitability = {
      team,
      isEligible: rejectionReasons.length === 0,
      rejectionReasons,
      distanceKm,
      simulatedEtaMinutes,
      estimatedCostPkr,
      suitabilityScore,
      isPotentiallyTooLate: isTooLate,
      warning,
    };

    if (suitability.isEligible) {
      eligible.push(suitability);
    } else {
      rejected.push(suitability);
    }
  }

  return { eligible, rejected };
}
