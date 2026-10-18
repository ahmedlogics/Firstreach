import { NextRequest, NextResponse } from 'next/server';
import { executeStartAssignment } from '@/lib/dispatch/lifecycle';

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

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorization check
    if (!verifyDispatcherAuth(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Dispatcher or Coordinator authorization required to start operations.' },
        { status: 401 }
      );
    }

    // 2. Resolve dynamic ID
    const resolvedParams = await Promise.resolve(context.params);
    const { id: assignmentId } = resolvedParams;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing required assignment ID path parameter.' },
        { status: 400 }
      );
    }

    // 3. Execute state transition
    const result = await executeStartAssignment(assignmentId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[API /api/assignments/[id]/start] Error:`, err);
    const isConflict = err.message?.includes('Invalid status transition') || err.message?.includes('already');
    const isNotFound = err.message?.includes('not found');

    return NextResponse.json(
      { error: err.message || 'Failed to start assignment operation' },
      { status: isNotFound ? 404 : isConflict ? 409 : 500 }
    );
  }
}

// Allow POST as well for flexibility
export async function POST(req: NextRequest, context: RouteContext) {
  return PATCH(req, context);
}
