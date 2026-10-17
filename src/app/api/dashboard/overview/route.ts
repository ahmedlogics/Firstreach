import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';
import {
  DbZone,
  DbIncident,
  DbRescueTeam,
  DbHousehold,
  DbShelter,
  DbAssignment,
  DashboardOverviewResponse,
} from '@/lib/dashboard/types';
import { calculateDashboardStats, evaluateZoneAnalytics } from '@/lib/dashboard/helpers';


export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    // Parallel fetch with explicit field selections
    const [
      zonesRes,
      incidentsRes,
      teamsRes,
      householdsRes,
      sheltersRes,
      assignmentsRes,
    ] = await Promise.all([
      supabase
        .from('zones')
        .select('id, name, center_lat, center_lng, flood_risk, minutes_to_impact, reporting_coverage, created_at')
        .order('name', { ascending: true }),

      supabase
        .from('incidents')
        .select('id, zone_id, household_id, lat, lng, people_count, flood_severity, medical_urgent, mobility_help, minutes_to_harm, priority_score, priority_reason, verification_status, status, details, created_at, updated_at')
        .order('created_at', { ascending: false }),

      supabase
        .from('rescue_teams')
        .select('id, name, team_type, capacity, capabilities, lat, lng, status, fixed_cost, cost_per_km, created_at')
        .order('name', { ascending: true }),

      supabase
        .from('households')
        .select('id, zone_id, label, lat, lng, people_count, elderly_present, mobility_assistance, medical_support_needed, reachability, last_contact_at, contact_status, created_at'),

      supabase
        .from('shelters')
        .select('id, name, zone_id, capacity, occupied, lat, lng'),

      supabase
        .from('assignments')
        .select('id, incident_id, team_id, status'),
    ]);

    // Check for critical database query errors
    if (zonesRes.error) throw new Error(`Zones query failed: ${zonesRes.error.message}`);
    if (incidentsRes.error) throw new Error(`Incidents query failed: ${incidentsRes.error.message}`);
    if (teamsRes.error) throw new Error(`Rescue teams query failed: ${teamsRes.error.message}`);
    if (householdsRes.error) throw new Error(`Households query failed: ${householdsRes.error.message}`);

    const rawZones: DbZone[] = (zonesRes.data || []) as DbZone[];
    const rawIncidents: DbIncident[] = (incidentsRes.data || []) as DbIncident[];
    const rawTeams: DbRescueTeam[] = (teamsRes.data || []) as DbRescueTeam[];
    const rawHouseholds: DbHousehold[] = (householdsRes.data || []) as DbHousehold[];
    const rawShelters: DbShelter[] = (sheltersRes.data || []) as DbShelter[];
    const rawAssignments: DbAssignment[] = (assignmentsRes.data || []) as DbAssignment[];

    // Build zone name lookup map
    const zoneNameMap = new Map<string, string>();
    rawZones.forEach((z) => zoneNameMap.set(z.id, z.name));

    // Enrich incidents with zone_name
    const enrichedIncidents: DbIncident[] = rawIncidents.map((inc) => ({
      ...inc,
      zone_name: inc.zone_id ? zoneNameMap.get(inc.zone_id) || 'Unassigned Zone' : 'Unassigned Zone',
    }));

    // Calculate core stats
    const statistics = calculateDashboardStats(
      enrichedIncidents,
      rawTeams,
      rawHouseholds,
      rawShelters,
      rawAssignments
    );

    // Evaluate zone analytics & blind spots
    const evaluatedZones = rawZones.map((zone) =>
      evaluateZoneAnalytics(zone, rawHouseholds, enrichedIncidents)
    );

    const responseData: DashboardOverviewResponse = {
      success: true,
      statistics,
      incidents: enrichedIncidents,
      zones: evaluatedZones,
      rescueTeams: rawTeams,
      shelters: rawShelters,
      lastUpdated: new Date().toISOString(),
      dataSource: 'supabase_live',
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('[API /api/dashboard/overview] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch dashboard overview telemetry',
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
