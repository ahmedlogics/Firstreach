import {
  DbIncident,
  DbRescueTeam,
  RecommendationRunResult,
  RecommendedAssignment,
  TeamSuitability,
  UnservedIncident,
} from './types';
import { getPriorityTier } from './priority';
import { getEligibleRescueTeams } from './matching';
import { formatPkr } from './cost';

/**
 * FIRSTREACH — Member 3: Intelligent Rescue Allocation Engine
 * Life-First Greedy Multi-Incident Dispatch Recommendation.
 *
 * Implements a hierarchical decision process:
 * 1. Life threat & urgency (Priority Tier & Score)
 * 2. Time-to-harm intervention feasibility (Simulated ETA vs Minutes to Harm)
 * 3. Required equipment & medical capacity
 * 4. Cost is used EXCLUSIVELY as a secondary tie-breaker among comparably effective choices.
 */

/**
 * Sorts incidents by life-safety hierarchy:
 * 1. Priority Tier (critical > high > medium > low)
 * 2. Priority Score (descending)
 * 3. Minutes to Harm (ascending, shorter time = more urgent)
 * 4. Medical Urgency (medical cases prioritized)
 */
export function sortIncidentsByUrgency(incidents: DbIncident[]): DbIncident[] {
  const tierWeight: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...incidents].sort((a, b) => {
    const tierA = getPriorityTier(a.priority_score ?? 0);
    const tierB = getPriorityTier(b.priority_score ?? 0);

    if (tierWeight[tierA] !== tierWeight[tierB]) {
      return tierWeight[tierB] - tierWeight[tierA];
    }

    if ((b.priority_score ?? 0) !== (a.priority_score ?? 0)) {
      return (b.priority_score ?? 0) - (a.priority_score ?? 0);
    }

    // Within same priority, shorter time-to-harm comes first
    const timeA = a.minutes_to_harm ?? 9999;
    const timeB = b.minutes_to_harm ?? 9999;
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // Medical urgency takes precedence
    if (a.medical_urgent && !b.medical_urgent) return -1;
    if (!a.medical_urgent && b.medical_urgent) return 1;

    return 0;
  });
}

/**
 * Ranks eligible teams for an incident using Life-First criteria.
 * Cost is ONLY evaluated when two teams offer comparable timeliness and life-safety adequacy.
 */
export function rankEligibleTeams(
  incident: DbIncident,
  eligibleSuitabilities: TeamSuitability[]
): TeamSuitability[] {
  return [...eligibleSuitabilities].sort((a, b) => {
    // 1. Arrival Feasibility: Team arriving before harm outranks team arriving after harm
    if (!a.isPotentiallyTooLate && b.isPotentiallyTooLate) return -1;
    if (a.isPotentiallyTooLate && !b.isPotentiallyTooLate) return 1;

    // 2. Timeliness: Significantly earlier simulated ETA takes precedence
    const etaA = a.simulatedEtaMinutes ?? 9999;
    const etaB = b.simulatedEtaMinutes ?? 9999;
    const etaDiff = Math.abs(etaA - etaB);

    // If ETA difference is more than 5 minutes, faster team wins for life safety
    if (etaDiff > 5) {
      return etaA - etaB;
    }

    // 3. Higher suitability score (capabilities buffer, specialized equipment)
    if (Math.abs(b.suitabilityScore - a.suitabilityScore) > 10) {
      return b.suitabilityScore - a.suitabilityScore;
    }

    // 4. Secondary Tie-Breaker ONLY: Lowest estimated financial cost
    const costA = a.estimatedCostPkr ?? 0;
    const costB = b.estimatedCostPkr ?? 0;
    return costA - costB;
  });
}

/**
 * Executes a full recommendation run across actionable open incidents and available teams.
 * Prevents double-recommendation of the same team within the run.
 */
export function recommendRescueAssignments(
  incidents: DbIncident[],
  teams: DbRescueTeam[]
): RecommendationRunResult {
  // Only evaluate open incidents
  const openIncidents = incidents.filter((i) => i.status === 'open');
  const sortedIncidents = sortIncidentsByUrgency(openIncidents);

  // Available candidate pool (cloned so we can decrement assigned teams)
  let availableTeamsPool = teams.filter((t) => t.status === 'available');

  const recommendations: RecommendedAssignment[] = [];
  const unserved: UnservedIncident[] = [];

  for (const incident of sortedIncidents) {
    const { eligible, rejected } = getEligibleRescueTeams(incident, availableTeamsPool);

    if (eligible.length > 0) {
      const ranked = rankEligibleTeams(incident, eligible);
      const bestMatch = ranked[0];
      const alternatives = ranked.slice(1);

      // Remove the recommended team from the available pool for subsequent incidents
      availableTeamsPool = availableTeamsPool.filter((t) => t.id !== bestMatch.team.id);

      const warnings: string[] = [];
      if (bestMatch.warning) warnings.push(bestMatch.warning);
      if (incident.verification_status === 'unverified') {
        warnings.push('Unverified incident: Dispatcher phone confirmation advised.');
      } else if (incident.verification_status === 'conflicting') {
        warnings.push('Conflicting incident reports: Verify rescue coordinates prior to launch.');
      }

      // Generate explainable rationale
      const costStr = formatPkr(bestMatch.estimatedCostPkr ?? 0);
      const etaStr = bestMatch.simulatedEtaMinutes
        ? `~${bestMatch.simulatedEtaMinutes}m`
        : 'Unknown ETA';

      const explanation = `${bestMatch.team.name} recommended because it has sufficient capacity (${bestMatch.team.capacity} pax), meets mandatory capabilities (${bestMatch.team.capabilities.join(', ')}), and provides the most suitable simulated arrival (${etaStr}) among currently eligible teams. Estimated cost: ${costStr}.`;

      const safetyFirstPrinciple =
        'Life safety, urgent medical need, and time before harm governed this match. Financial cost was used solely as a tie-breaker between safe, effective options.';

      recommendations.push({
        incident,
        recommendedTeam: bestMatch.team,
        suitability: bestMatch,
        alternativeTeams: alternatives,
        explanation,
        safetyFirstPrinciple,
        warnings,
      });
    } else {
      // Unserved incident: analyze why no team could be assigned
      const blockingReasons: string[] = [];
      const missingCapabilities: string[] = [];

      if (availableTeamsPool.length === 0) {
        blockingReasons.push('Zero rescue teams currently available in fleet');
      } else {
        // Collect specific blocking reasons from rejected candidates
        for (const rej of rejected) {
          for (const reason of rej.rejectionReasons) {
            if (!blockingReasons.includes(reason)) {
              blockingReasons.push(reason);
            }
          }
        }

        if (incident.flood_severity > 0) {
          const hasFloodTeam = availableTeamsPool.some(
            (t) => t.capabilities.includes('flood') || t.team_type === 'boat'
          );
          if (!hasFloodTeam) missingCapabilities.push('flood-capable craft');
        }

        if (incident.medical_urgent) {
          const hasMedTeam = availableTeamsPool.some(
            (t) => t.capabilities.includes('medical') || t.team_type === 'medical'
          );
          if (!hasMedTeam) missingCapabilities.push('emergency paramedic unit');
        }

        const maxCap = Math.max(0, ...availableTeamsPool.map((t) => t.capacity));
        if (maxCap < incident.people_count) {
          blockingReasons.push(
            `Largest available team carries ${maxCap} pax; incident requires single-team capacity of ${incident.people_count}`
          );
        }
      }

      const urgencyTier = getPriorityTier(incident.priority_score ?? 0);
      let suggestedEscalation = 'Monitor fleet return times; assign immediately upon team return.';
      if (urgencyTier === 'critical') {
        suggestedEscalation =
          'CRITICAL ACTION REQUIRED: Immediate escalation to Sindh Rangers / Pakistan Military 5-Corps amphibious mutual aid command.';
      } else if (urgencyTier === 'high') {
        suggestedEscalation =
          'Request mutual aid from nearby district volunteer boat units or stage community evacuation.';
      }

      unserved.push({
        incident,
        blockingReasons,
        missingCapabilities,
        suggestedEscalation,
        urgencyTier,
        candidateTeamsEvaluated: availableTeamsPool.length,
      });
    }
  }

  return {
    recommendations,
    unserved,
    evaluatedIncidentCount: openIncidents.length,
    availableTeamCount: teams.filter((t) => t.status === 'available').length,
  };
}
