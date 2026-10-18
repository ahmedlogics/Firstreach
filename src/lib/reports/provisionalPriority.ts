import { EmergencyReportInput } from './schema';
import { severityToLevel } from './mapping';

export interface PriorityEvaluation {
  score: number; // 0..100 (never 0 for real report)
  reason: string; // Must start with "Provisional:"
}


export function calculateProvisionalPriority(
  input: Pick<
    EmergencyReportInput,
    'floodSeverity' | 'trapped' | 'medicalUrgent' | 'mobilityHelp' | 'peopleCount'
  >,
  minutesToHarm?: number | null
): PriorityEvaluation {
  
  const severityBase: Record<number, number> = {
    0: 15,
    1: 30,
    2: 50,
    3: 70,
  };

  let rawScore = severityBase[input.floodSeverity] ?? 15;
  const reasons: string[] = [
    `Base severity ${input.floodSeverity} (${severityToLevel(input.floodSeverity)})`,
  ];

  
  if (input.trapped === true) {
    rawScore += 25;
    reasons.push('Trapped occupants (+25)');
  }


  if (input.medicalUrgent === true) {
    rawScore += 20;
    reasons.push('Critical medical emergency (+20)');
  }

  
  if (input.mobilityHelp === true) {
    rawScore += 15;
    reasons.push('Mobility assistance needed (+15)');
  }

  
  if (input.peopleCount && input.peopleCount > 1) {
    const peopleBonus = Math.min(10, (input.peopleCount - 1) * 2);
    rawScore += peopleBonus;
    reasons.push(`${input.peopleCount} individuals (+${peopleBonus})`);
  }

  
  if (minutesToHarm != null) {
    if (minutesToHarm <= 60) {
      rawScore += 15;
      reasons.push(`Imminent harm in ${minutesToHarm}m (+15)`);
    } else if (minutesToHarm <= 120) {
      rawScore += 10;
      reasons.push(`Harm within 2h (${minutesToHarm}m) (+10)`);
    } else if (minutesToHarm <= 240) {
      rawScore += 5;
      reasons.push(`Harm within 4h (${minutesToHarm}m) (+5)`);
    }
  }

  
  let unknownBonus = 0;
  const unknownFactors: string[] = [];
  if (input.trapped === null) {
    unknownBonus += 8;
    unknownFactors.push('trapped?');
  }
  if (input.medicalUrgent === null) {
    unknownBonus += 8;
    unknownFactors.push('medical?');
  }
  if (input.mobilityHelp === null) {
    unknownBonus += 5;
    unknownFactors.push('mobility?');
  }
  if (input.peopleCount === null) {
    unknownBonus += 4;
    unknownFactors.push('people?');
  }

  const cappedUnknownBonus = Math.min(15, unknownBonus);
  if (cappedUnknownBonus > 0) {
    rawScore += cappedUnknownBonus;
    reasons.push(`Safety uncertainty bonus [${unknownFactors.join(', ')}] (+${cappedUnknownBonus})`);
  }

  
  const finalScore = Math.min(100, Math.max(1, Math.round(rawScore)));

  return {
    score: finalScore,
    reason: `Provisional: ${reasons.join('; ')}`,
  };
}
