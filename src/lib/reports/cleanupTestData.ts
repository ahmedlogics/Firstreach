/**
 * Cleanup script for removing automated test records from Supabase.
 *
 * SAFETY INVARIANTS:
 * 1. Only targets rows where details or description explicitly starts with "TEST:".
 * 2. NEVER touches, updates, or deletes any rows starting with "DEMO:" (hard team rule).
 * 3. Never run automatically during build or import; only invoked explicitly by command.
 * 4. Always prints counts of records found or deleted.
 */

export async function cleanupTestData(confirm = false): Promise<{
  reportsCount: number;
  incidentsCount: number;
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
  const safeIncidents = (testIncidents || []).filter(
    (inc) => inc.details.startsWith('TEST:') && !inc.details.startsWith('DEMO:')
  );
  const safeIncidentIds = safeIncidents.map((inc) => inc.id);

  // 2. Fetch test reports linked to these test incidents OR where payload location/description starts with TEST:
  let testReportIds: string[] = [];

  // Query reports by incident_id if any incidents exist
  if (safeIncidentIds.length > 0) {
    const { data: linkedReports, error: repErr } = await client
      .from('reports')
      .select('id')
      .in('incident_id', safeIncidentIds);

    if (!repErr && linkedReports) {
      testReportIds = linkedReports.map((r) => r.id);
    }
  }

  // Also query reports whose payload locationDescription starts with TEST:
  const { data: unlinkedReports, error: unlinkedErr } = await client
    .from('reports')
    .select('id, payload')
    .filter('payload->>locationDescription', 'ilike', 'TEST:%');

  if (!unlinkedErr && unlinkedReports) {
    for (const r of unlinkedReports) {
      if (!testReportIds.includes(r.id)) {
        testReportIds.push(r.id);
      }
    }
  }

  const incidentsCount = safeIncidentIds.length;
  const reportsCount = testReportIds.length;

  if (confirm) {
    // Perform deletion
    let deletedReports = 0;
    let deletedIncidents = 0;

    if (testReportIds.length > 0) {
      const { data: delRep, error: delRepErr } = await client
        .from('reports')
        .delete()
        .in('id', testReportIds)
        .select('id');

      if (delRepErr) {
        throw new Error(`Failed to delete test reports: ${delRepErr.message}`);
      }
      deletedReports = delRep?.length ?? 0;
    }

    if (safeIncidentIds.length > 0) {
      const { data: delInc, error: delIncErr } = await client
        .from('incidents')
        .delete()
        .in('id', safeIncidentIds)
        .select('id');

      if (delIncErr) {
        throw new Error(`Failed to delete test incidents: ${delIncErr.message}`);
      }
      deletedIncidents = delInc?.length ?? 0;
    }

    console.log(
      `Cleanup completed: Deleted ${deletedIncidents} test incident(s) and ${deletedReports} test report(s).`
    );
    return {
      reportsCount: deletedReports,
      incidentsCount: deletedIncidents,
    };
  } else {
    // Dry-run mode: report counts found
    console.log(
      `Cleanup scan: Found ${incidentsCount} test incident(s) and ${reportsCount} test report(s) matching "TEST:". (Pass --confirm to delete)`
    );
    return {
      reportsCount,
      incidentsCount,
    };
  }
}

// Auto-run if executed directly via node/tsx CLI
if (
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv.some((arg) => arg.includes('cleanupTestData'))
) {
  const isConfirm = process.argv.includes('--confirm');
  cleanupTestData(isConfirm).catch((err) => {
    console.error('Cleanup error:', err.message);
    process.exit(1);
  });
}
