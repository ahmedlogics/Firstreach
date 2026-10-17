import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';
import { DbRescueTeam } from '@/lib/dispatch/types';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();
    const { data: teams, error } = await supabase
      .from('rescue_teams')
      .select('id, name, team_type, capabilities, capacity, status, lat, lng, fixed_cost, cost_per_km, created_at')
      .order('name');

    if (error) {
      console.error('[API /api/teams] Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve rescue teams from database', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teams: (teams as DbRescueTeam[]) || [],
      count: teams?.length || 0,
      source: 'supabase',
    });
  } catch (err: any) {
    console.error('[API /api/teams] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}
