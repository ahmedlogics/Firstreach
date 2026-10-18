/**
 * Cleanup script for removing automated test records from Supabase.
 *
 * SAFETY INVARIANTS:
 * 1. Only deletes rows where details or description explicitly starts with "TEST:".
 * 2. NEVER touches, updates, or deletes any rows starting with "DEMO:" (hard team rule).
 * 3. Never run automatically during build or import; only invoked explicitly by command.
 */

export async function cleanupTestData(): Promise<{
  deletedReportsCount: number;
  deletedIncidentsCount: number;
}> {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) {
    throw new Error(
      'Server configuration error: SUPABASE_SECRET_KEY is required to run cleanup script.'
    );
  }

  const { getServiceSupabaseClient } = await import('@/lib/supabase');
  const client = getServiceSupabaseClient();

  // 1. Fetch test incidents (only where details starts with "TEST:")
  const { data: testIncidents, error: incFetchErr } = await client
    .from('incidents')
    .select('id, details')
    .like('details', 'TEST:%');

  if (incFetchErr) {
    throw new Error(`Failed to fetch test incidents: ${incFetchErr.message}`);
  }

  // Double-check safety: ensure NO "DEMO:" incidents are in this list
  const safeIncidentIds = (testIncidents || [])
    .filter((inc) => inc.details.startsWith('TEST:') && !inc.details.startsWith('DEMO:'))
    .map((inc) => inc.id);

  let deletedReportsCount = 0;
  let deletedIncidentsCount = 0;

  // 2. Delete test reports linked to these test incidents OR whose payload contains TEST:
  if (safeIncidentIds.length > 0) {
    const { data: delReports, error: delRepErr } = await client
      .from('reports')
      .delete()
      .in('incident_id', safeIncidentIds)
      .select('id');

    if (delRepErr) {
      throw new Error(`Failed to delete test reports: ${delRepErr.message}`);
    }
    deletedReportsCount = delReports?.length ?? 0;

    // 3. Delete the test incidents
    const { data: delIncidents, error: delIncErr } = await client
      .from('incidents')
      .delete()
      .in('id', safeIncidentIds)
      .select('id');

    if (delIncErr) {
      throw new Error(`Failed to delete test incidents: ${delIncErr.message}`);
    }
    deletedIncidentsCount = delIncidents?.length ?? 0;
  }

  return {
    deletedReportsCount,
    deletedIncidentsCount,
  };
}
