import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';
import { DbIncident, DbRescueTeam } from '@/lib/dispatch/types';
import { recommendRescueAssignments } from '@/lib/dispatch/allocation';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabaseClient();

    // 1. Server fetches authoritative incident data directly from database
    const { data: rawIncidents, error: incError } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (incError) {
      console.error('[API /api/assignments/recommend] Incidents fetch error:', incError);
      return NextResponse.json(
        { error: 'Failed to retrieve incidents from database', details: incError.message },
        { status: 500 }
      );
    }

    // 2. Server fetches authoritative rescue teams directly from database
    const { data: rawTeams, error: teamError } = await supabase
      .from('rescue_teams')
      .select('*')
      .order('name');

    if (teamError) {
      console.error('[API /api/assignments/recommend] Teams fetch error:', teamError);
      return NextResponse.json(
        { error: 'Failed to retrieve rescue teams from database', details: teamError.message },
        { status: 500 }
      );
    }

    // Also fetch current assignments for context
    const { data: rawAssignments } = await supabase
      .from('assignments')
      .select('*')
      .order('approved_at', { ascending: false });

    const incidents = (rawIncidents as DbIncident[]) || [];
    const teams = (rawTeams as DbRescueTeam[]) || [];

    // 3. Run pure life-first recommendation engine server-side
    const recommendationResult = recommendRescueAssignments(incidents, teams);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      recommendations: recommendationResult.recommendations,
      unserved: recommendationResult.unserved,
      stats: {
        totalIncidents: incidents.length,
        openIncidents: incidents.filter((i) => i.status === 'open').length,
        assignedIncidents: incidents.filter((i) => i.status === 'assigned').length,
        totalTeams: teams.length,
        availableTeams: teams.filter((t) => t.status === 'available').length,
        busyTeams: teams.filter((t) => t.status === 'busy').length,
        activeAssignmentsCount: rawAssignments?.length || 0,
      },
      allIncidents: incidents,
      allTeams: teams,
      activeAssignments: rawAssignments || [],
    });
  } catch (err: any) {
    console.error('[API /api/assignments/recommend] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error while computing recommendations', details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow GET to re-route to the recommendation logic
  return POST(req);
}
