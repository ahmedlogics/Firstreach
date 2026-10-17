import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getServiceSupabaseClient();

    // 1. Clear assignments
    const { error: delError } = await supabase
      .from('assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delError) {
      console.error('[API /api/assignments/reset] Delete error:', delError);
    }

    // 2. Reset incidents back to 'open'
    const { error: incError } = await supabase
      .from('incidents')
      .update({ status: 'open' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (incError) {
      console.error('[API /api/assignments/reset] Incident reset error:', incError);
    }

    // 3. Reset teams back to 'available'
    const { error: teamError } = await supabase
      .from('rescue_teams')
      .update({ status: 'available' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (teamError) {
      console.error('[API /api/assignments/reset] Team reset error:', teamError);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo scenario reset successfully: all units available and emergencies open.',
    });
  } catch (err: any) {
    console.error('[API /api/assignments/reset] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to reset demo scenario', details: err?.message },
      { status: 500 }
    );
  }
}
