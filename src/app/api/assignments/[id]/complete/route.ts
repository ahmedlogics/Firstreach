import { NextRequest, NextResponse } from 'next/server';
import { executeCompleteAssignment } from '@/lib/dispatch/lifecycle';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

function verifyDispatcherAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const dispatcherRole = req.headers.get('x-dispatcher-role');
  const demoMode = req.headers.get('x-demo-coordinator');

  return Boolean(
    (authHeader && authHeader.startsWith('Bearer ')) ||
    dispatcherRole === 'coordinator' ||
    dispatcherRole === 'operations_chief' ||
    demoMode === 'true'
  );
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorization check
    if (!verifyDispatcherAuth(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Dispatcher or Coordinator authorization required to complete operations.' },
        { status: 401 }
      );
    }

    // 2. Resolve dynamic assignment ID
    const resolvedParams = await Promise.resolve(context.params);
    const { id: assignmentId } = resolvedParams;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing required assignment ID path parameter.' },
        { status: 400 }
      );
    }

    // 3. Parse JSON request body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const {
      leaderConfirmed,
      assistedPeopleCount,
      teamReady = true,
      shelterId = null,
      evacueesArrivedCount = 0,
      resolutionNotes,
    } = body;

    if (!leaderConfirmed) {
      return NextResponse.json(
        { error: 'On-scene rescue team leader confirmation is required to authorize mission resolution.' },
        { status: 422 }
      );
    }

    // 4. Execute atomic completion
    const result = await executeCompleteAssignment({
      assignmentId,
      leaderConfirmed: Boolean(leaderConfirmed),
      assistedPeopleCount: typeof assistedPeopleCount === 'number' ? assistedPeopleCount : undefined,
      teamReady: Boolean(teamReady),
      shelterId: shelterId || null,
      evacueesArrivedCount: typeof evacueesArrivedCount === 'number' ? evacueesArrivedCount : 0,
      resolutionNotes: typeof resolutionNotes === 'string' ? resolutionNotes : undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[API /api/assignments/[id]/complete] Error:`, err);
    const msg = err.message || '';
    const isConflict =
      msg.includes('Duplicate completion') ||
      msg.includes('already completed') ||
      msg.includes('Invalid status transition');
    const isShelterCapacity = msg.includes('capacity exceeded');
    const isNotFound = msg.includes('not found');

    return NextResponse.json(
      { error: msg || 'Failed to complete rescue assignment' },
      { status: isNotFound ? 404 : isShelterCapacity ? 422 : isConflict ? 409 : 500 }
    );
  }
}
