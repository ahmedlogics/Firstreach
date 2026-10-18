import { calculateEmergencyPriority, getPriorityTier } from '@/lib/dispatch/priority';
import { DbIncident, PriorityCalculationResult } from '@/lib/dispatch/types';
import { EmergencyReportInput } from './schema';
import { calculateProvisionalPriority } from './provisionalPriority';

export interface PriorityScoreResult {
  score: number;
  reason: string;
  tier: string;
}

export interface EffectiveReportInputs {
  trapped: boolean | null;
  medicalUrgent: boolean | null;
  mobilityHelp: boolean | null;
  peopleCount: number | null;
  floodSeverity: number;
}

let activePriorityCalculator = calculateEmergencyPriority;

export function setEmergencyPriorityCalculator(
  fn: (incident: Partial<DbIncident>) => PriorityCalculationResult
): void {
  activePriorityCalculator = fn;
}

export function resetEmergencyPriorityCalculator(): void {
  activePriorityCalculator = calculateEmergencyPriority;
}

/**
 * Extracts unified effective inputs from all linked report payloads.
 * - trapped / medicalUrgent / mobilityHelp: true if ANY report says true,
 *   false if at least one says false and none true, otherwise null.
 * - peopleCount: highest known value across reports, or null if none known.
 * - floodSeverity: highest reported severity across reports.
 */
export function computeEffectiveInputs(
  payloads: Array<Record<string, any>>
): EffectiveReportInputs {
  if (payloads.length === 0) {
    return {
      trapped: null,
      medicalUrgent: null,
      mobilityHelp: null,
      peopleCount: null,
      floodSeverity: 0,
    };
  }

  // Trapped
  let trapped: boolean | null = null;
  if (payloads.some((p) => p.trapped === true)) {
    trapped = true;
  } else if (payloads.some((p) => p.trapped === false)) {
    trapped = false;
  }

  // Medical urgent
  let medicalUrgent: boolean | null = null;
  if (payloads.some((p) => p.medicalUrgent === true)) {
    medicalUrgent = true;
  } else if (payloads.some((p) => p.medicalUrgent === false)) {
    medicalUrgent = false;
  }

  // Mobility help
  let mobilityHelp: boolean | null = null;
  if (payloads.some((p) => p.mobilityHelp === true)) {
    mobilityHelp = true;
  } else if (payloads.some((p) => p.mobilityHelp === false)) {
    mobilityHelp = false;
  }

  // People count
  const knownPeople = payloads
    .map((p) => p.peopleCount)
    .filter((c): c is number => typeof c === 'number' && !isNaN(c));
  const peopleCount = knownPeople.length > 0 ? Math.max(...knownPeople) : null;

  // Flood severity
  const knownSeverities = payloads
    .map((p) => p.floodSeverity)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s));
  const floodSeverity = knownSeverities.length > 0 ? Math.max(...knownSeverities) : 0;

  return {
    trapped,
    medicalUrgent,
    mobilityHelp,
    peopleCount,
    floodSeverity,
  };
}

/**
 * Computes report intake priority by combining:
 * 1. Member 3's shared calculateEmergencyPriority() dispatch score (0–100)
 * 2. Trapped bonus (+20 if trapped === true)
 * 3. Capped uncertainty bonus (max +15 for unknown fields)
 *
 * If calculateEmergencyPriority throws for any reason, falls back safely to
 * calculateProvisionalPriority.
 */
export function computeReportPriority(
  input: Pick<
    EmergencyReportInput,
    'floodSeverity' | 'trapped' | 'medicalUrgent' | 'mobilityHelp' | 'peopleCount'
  >,
  minutesToHarm?: number | null,
  incidentOverrides?: Partial<DbIncident>
): PriorityScoreResult {
  const trappedBonus = input.trapped === true ? 20 : 0;

  // Unknown caution bonus (max +15)
  let unknownRaw = 0;
  const unknownList: string[] = [];
  if (input.trapped === null) {
    unknownRaw += 8;
    unknownList.push('trapped?');
  }
  if (input.medicalUrgent === null) {
    unknownRaw += 8;
    unknownList.push('medical?');
  }
  if (input.mobilityHelp === null) {
    unknownRaw += 5;
    unknownList.push('mobility?');
  }
  if (input.peopleCount === null) {
    unknownRaw += 4;
    unknownList.push('people?');
  }
  const cappedUnknownBonus = Math.min(15, unknownRaw);

  const incidentData: Partial<DbIncident> = {
    flood_severity: input.floodSeverity,
    medical_urgent: input.medicalUrgent === true,
    mobility_help: input.mobilityHelp === true,
    people_count: input.peopleCount ?? 1,
    minutes_to_harm: minutesToHarm ?? null,
    verification_status: 'unverified',
    ...incidentOverrides,
  };

  try {
    const dispatchResult: PriorityCalculationResult =
      activePriorityCalculator(incidentData);

    const rawScore =
      dispatchResult.score + trappedBonus + cappedUnknownBonus;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    const extras: string[] = [];
    if (trappedBonus > 0) {
      extras.push('trapped occupants (+20)');
    }
    if (cappedUnknownBonus > 0) {
      extras.push(
        `Unknown: ${unknownList.join(', ')} (+${cappedUnknownBonus} caution bonus)`
      );
    }

    const fullReason =
      extras.length > 0
        ? `${dispatchResult.reason} [Intake: ${extras.join('; ')}]`
        : dispatchResult.reason;

    return {
      score: finalScore,
      reason: fullReason,
      tier: dispatchResult.tier,
    };
  } catch {
    // Fallback if calculateEmergencyPriority throws
    const prov = calculateProvisionalPriority(input, minutesToHarm);
    return {
      score: prov.score,
      reason: prov.reason,
      tier: getPriorityTier(prov.score),
    };
  }
}

/**
 * Computes priority for a merged incident by evaluating effective inputs
 * from all linked report payloads plus merged incident columns.
 */
export function computeMergedPriority(
  mergedIncident: {
    flood_severity?: number;
    people_count?: number;
    medical_urgent?: boolean;
    mobility_help?: boolean;
    minutes_to_harm?: number | null;
    verification_status?: 'unverified' | 'verified' | 'conflicting';
  },
  payloads: Array<Record<string, any>>
): PriorityScoreResult {
  const effective = computeEffectiveInputs(payloads);

  const effectiveSeverity = Math.max(
    mergedIncident.flood_severity ?? 0,
    effective.floodSeverity
  );
  const effectivePeople = Math.max(
    mergedIncident.people_count ?? 1,
    effective.peopleCount ?? 1
  );
  const effectiveMedical = Boolean(
    mergedIncident.medical_urgent || effective.medicalUrgent === true
  );
  const effectiveMobility = Boolean(
    mergedIncident.mobility_help || effective.mobilityHelp === true
  );

  const trappedBonus = effective.trapped === true ? 20 : 0;

  // Unknown bonus applies ONLY to fields that no linked report answered
  let unknownRaw = 0;
  const unknownList: string[] = [];
  if (effective.trapped === null) {
    unknownRaw += 8;
    unknownList.push('trapped?');
  }
  if (effective.medicalUrgent === null) {
    unknownRaw += 8;
    unknownList.push('medical?');
  }
  if (effective.mobilityHelp === null) {
    unknownRaw += 5;
    unknownList.push('mobility?');
  }
  if (effective.peopleCount === null) {
    unknownRaw += 4;
    unknownList.push('people?');
  }
  const cappedUnknownBonus = Math.min(15, unknownRaw);

  const incidentData: Partial<DbIncident> = {
    flood_severity: effectiveSeverity,
    medical_urgent: effectiveMedical,
    mobility_help: effectiveMobility,
    people_count: effectivePeople,
    minutes_to_harm: mergedIncident.minutes_to_harm ?? null,
    verification_status: mergedIncident.verification_status ?? 'unverified',
  };

  try {
    const dispatchResult = activePriorityCalculator(incidentData);

    const rawScore =
      dispatchResult.score + trappedBonus + cappedUnknownBonus;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    const extras: string[] = [];
    if (trappedBonus > 0) {
      extras.push('trapped occupants (+20)');
    }
    if (cappedUnknownBonus > 0) {
      extras.push(
        `Unknown: ${unknownList.join(', ')} (+${cappedUnknownBonus} caution bonus)`
      );
    }

    const fullReason =
      extras.length > 0
        ? `${dispatchResult.reason} [Intake: ${extras.join('; ')}]`
        : dispatchResult.reason;

    return {
      score: finalScore,
      reason: fullReason,
      tier: dispatchResult.tier,
    };
  } catch {
    // Fallback if calculateEmergencyPriority throws
    const prov = calculateProvisionalPriority(
      {
        floodSeverity: effectiveSeverity,
        trapped: effective.trapped,
        medicalUrgent: effective.medicalUrgent,
        mobilityHelp: effective.mobilityHelp,
        peopleCount: effective.peopleCount,
      },
      mergedIncident.minutes_to_harm
    );
    return {
      score: prov.score,
      reason: prov.reason,
      tier: getPriorityTier(prov.score),
    };
  }
}
