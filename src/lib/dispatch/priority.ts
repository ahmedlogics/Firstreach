import {
  DbIncident,
  PriorityCalculationResult,
  PriorityTier,
  PriorityBreakdown,
} from './types';

/**
 * FIRSTREACH — Member 3: Deterministic Emergency Priority Engine
 * Life-First triage calculation with transparent explanations.
 * Can be reused directly by Member 2 (reporting intake) and Member 1 (dashboard).
 */

export interface PriorityScoringConfig {
  floodWeights: Record<number, number>;
  medicalUrgentPoints: number;
  mobilityHelpPoints: number;
  timeUrgencyTiers: Array<{ maxMinutes: number; points: number }>;
  vulnerabilityCountThreshold: number;
  vulnerabilityBonusPoints: number;
}

export const DEFAULT_PRIORITY_CONFIG: PriorityScoringConfig = {
  // Flood severity: 0–40 points
  floodWeights: {
    0: 0,
    1: 15,
    2: 28,
    3: 40,
  },
  // Medical urgency: 25 points
  medicalUrgentPoints: 25,
  // Mobility limitations: 15 points
  mobilityHelpPoints: 15,
  // Time urgency before critical harm: up to 20 points
  timeUrgencyTiers: [
    { maxMinutes: 30, points: 20 },
    { maxMinutes: 60, points: 15 },
    { maxMinutes: 120, points: 10 },
    { maxMinutes: 240, points: 5 },
  ],
  vulnerabilityCountThreshold: 6,
  vulnerabilityBonusPoints: 5,
};

/**
 * Maps numeric score (0–100) to operational priority tier
 */
export function getPriorityTier(score: number): PriorityTier {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Pure, deterministic priority calculation function for any incident.
 * Handles missing information safely without guessing or underestimating danger.
 */
export function calculateEmergencyPriority(
  incident: Partial<DbIncident>,
  config: PriorityScoringConfig = DEFAULT_PRIORITY_CONFIG
): PriorityCalculationResult {
  const floodLevel = Math.min(3, Math.max(0, incident.flood_severity ?? 0));
  const floodScore = config.floodWeights[floodLevel] ?? 0;

  const medicalScore = incident.medical_urgent ? config.medicalUrgentPoints : 0;
  const mobilityScore = incident.mobility_help ? config.mobilityHelpPoints : 0;

  let timeScore = 0;
  let timeUrgencyUnknown = false;
  let needsVerification = false;

  if (incident.minutes_to_harm === null || incident.minutes_to_harm === undefined) {
    timeUrgencyUnknown = true;
    needsVerification = true;
    timeScore = 0;
  } else {
    const mins = incident.minutes_to_harm;
    const tier = config.timeUrgencyTiers.find((t) => mins <= t.maxMinutes);
    timeScore = tier ? tier.points : 0;
  }

  // Large family / group vulnerability bonus
  const peopleCount = incident.people_count ?? 1;
  const vulnerabilityScore =
    peopleCount >= config.vulnerabilityCountThreshold
      ? config.vulnerabilityBonusPoints
      : 0;

  const rawScore =
    floodScore + medicalScore + mobilityScore + timeScore + vulnerabilityScore;
  const clampedScore = Math.min(100, Math.max(0, rawScore));
  const priorityTier = getPriorityTier(clampedScore);

  const isConflicting = incident.verification_status === 'conflicting';
  if (incident.verification_status === 'unverified') {
    needsVerification = true;
  }

  // Build human-readable deterministic explanation
  const contributingReasons: string[] = [];

  if (floodLevel === 3) contributingReasons.push('severe catastrophic flooding');
  else if (floodLevel === 2) contributingReasons.push('moderate flood surge');
  else if (floodLevel === 1) contributingReasons.push('minor water accumulation');

  if (incident.medical_urgent) {
    contributingReasons.push('urgent medical intervention required');
  }

  if (incident.mobility_help) {
    contributingReasons.push('mobility assistance needed');
  }

  if (timeUrgencyUnknown) {
    contributingReasons.push('time-to-harm unconfirmed (verification required)');
  } else {
    contributingReasons.push(`approx. ${incident.minutes_to_harm}m before estimated harm`);
  }

  if (peopleCount > 1) {
    contributingReasons.push(`${peopleCount} persons at risk`);
  }

  let tierPrefix = 'Low';
  if (priorityTier === 'critical') tierPrefix = 'Critical';
  if (priorityTier === 'high') tierPrefix = 'High';
  if (priorityTier === 'medium') tierPrefix = 'Moderate';

  let reason = `${tierPrefix}: ${contributingReasons.join(', ')}.`;
  if (isConflicting) {
    reason += ' [WARNING: Conflicting field reports logged — human verification required]';
  }

  const breakdown: PriorityBreakdown = {
    floodScore,
    medicalScore,
    mobilityScore,
    timeScore,
    vulnerabilityScore,
    timeUrgencyUnknown,
    needsVerification,
    conflictingWarning: isConflicting,
  };

  return {
    score: clampedScore,
    tier: priorityTier,
    reason,
    breakdown,
  };
}
