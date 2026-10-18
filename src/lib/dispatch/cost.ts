import { Coordinates, DbIncident, DbRescueTeam } from './types';

/**
 * FIRSTREACH — Member 3: Distance, Simulated ETA and Cost Engine
 * Pure mathematical functions using Haversine distance and transparent costing.
 */

export const TEAM_SIMULATED_SPEEDS_KMH: Record<DbRescueTeam['team_type'], number> = {
  boat: 25, // Shallow water / flood navigation speed
  vehicle: 35, // High-clearance truck speed through debris/water
  medical: 40, // Emergency medical transport / ambulance route speed
};

export const STAGING_MOBILIZATION_MINUTES = 3;

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 * Returns null if either coordinate pair is invalid or missing.
 * NOTE: Never labeled as confirmed road routing distance.
 */
export function calculateDistanceKm(
  from: Coordinates | { lat: number | null; lng: number | null },
  to: Coordinates | { lat: number | null; lng: number | null }
): number | null {
  if (
    from.lat === null ||
    from.lat === undefined ||
    from.lng === null ||
    from.lng === undefined ||
    to.lat === null ||
    to.lat === undefined ||
    to.lng === null ||
    to.lng === undefined
  ) {
    return null;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Estimates assignment cost using:
 * Estimated Cost = Fixed Cost + (Distance in km × Cost per km)
 * Guarantees fixed cost is charged only once per single assignment.
 */
export function estimateDispatchCost(
  team: Pick<DbRescueTeam, 'fixed_cost' | 'cost_per_km'>,
  distanceKm: number | null
): number {
  const fixedCost = Number(team.fixed_cost) || 0;
  const costPerKm = Number(team.cost_per_km) || 0;

  if (distanceKm === null || distanceKm <= 0) {
    // If distance unknown, baseline is fixed deployment cost
    return fixedCost;
  }

  const variableCost = distanceKm * costPerKm;
  return Math.round(fixedCost + variableCost);
}

/**
 * Calculates Simulated ETA in minutes based on straight-line distance and team speed.
 * Returns null if distance cannot be computed.
 * Clearly labeled as simulation only; does not infer real road navigability.
 */
export function estimateArrivalMinutes(
  team: Pick<DbRescueTeam, 'team_type'>,
  distanceKm: number | null
): number | null {
  if (distanceKm === null) {
    return null;
  }

  const speedKmh = TEAM_SIMULATED_SPEEDS_KMH[team.team_type] || 30;
  const travelTimeMinutes = (distanceKm / speedKmh) * 60;
  const totalMinutes = Math.round(travelTimeMinutes + STAGING_MOBILIZATION_MINUTES);

  // Return at least 1 minute
  return Math.max(1, totalMinutes);
}

/**
 * Checks if simulated arrival exceeds the incident's time before harm.
 */
export function isEtaTooLate(
  simulatedEtaMinutes: number | null,
  minutesToHarm: number | null
): boolean {
  if (simulatedEtaMinutes === null || minutesToHarm === null) {
    return false;
  }
  return simulatedEtaMinutes > minutesToHarm;
}

/**
 * Formats PKR currency strings
 */
export function formatPkr(amount: number): string {
  return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}`;
}
