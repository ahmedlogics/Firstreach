import { NextRequest, NextResponse } from 'next/server';
import {
  emergencyReportSchema,
  computeMissingFields,
  reporterRoleToSource,
  toIncidentColumns,
  calculateProvisionalPriority,
  findPossibleDuplicate,
  mergeRaiseOnly,
  reportRepository,
} from '@/lib/reports';

// In-memory rate limiting map: IP -> array of request timestamps (epoch ms)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_BODY_BYTES = 20 * 1024; // 20 KB limit

/**
 * Checks in-memory sliding window rate limit (10 requests / min / IP).
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

/**
 * Helper to reset rate limits (useful for testing).
 */
export function _resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

/**
 * GET /api/reports
 * Returns the 20 latest reports with their joined incident (testing only, no secrets).
 * Returns 404 in production environment.
 * Strips reporter name and phone for privacy.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, error: 'Not found' },
      { status: 404 }
    );
  }

  try {
    const latest = await reportRepository.listLatest(20);

    const sanitized = latest.map((report) => {
      const payloadCopy = { ...report.payload };
      delete (payloadCopy as Record<string, unknown>).reporterName;
      delete (payloadCopy as Record<string, unknown>).reporterPhone;

      if (
        payloadCopy.reporter &&
        typeof payloadCopy.reporter === 'object' &&
        !Array.isArray(payloadCopy.reporter)
      ) {
        const rep = { ...(payloadCopy.reporter as Record<string, unknown>) };
        delete rep.name;
        delete rep.phone;
        payloadCopy.reporter = rep;
      }

      return {
        ...report,
        payload: payloadCopy,
      };
    });

    return NextResponse.json(sanitized);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not fetch reports' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * Evaluates emergency intake in strictly defined order:
 * 1. Reject bodies over 20 KB with 413.
 * 2. In-memory rate limit per IP: 10 req/min, else 429.
 * 3. Parse JSON & validate with shared Zod schema. Else 400 { ok:false, errors }.
 * 4. Check idempotencyKey. If exists, return earlier result with 200, create nothing.
 * 5. Insert original submission into reports first (payload holds full validated input, missingFields, receivedInfo).
 * 6. Run findPossibleDuplicate. If found: link report, set needs_review & possible_duplicate_of, apply mergeRaiseOnly to incident. No 2nd incident.
 * 7. If not a duplicate: create incident (unverified, open) with provisional priority & reason, details beginning with description.
 * 8. Return 201 { ok:true, reportId, incidentId, verificationStatus, needsReview, possibleDuplicateOf, missingFields, priorityScore, priorityReason }.
 * 9. On unexpected errors return 500 { ok:false, error:"Could not save report" } without stack traces or internals.
 */
export async function POST(request: NextRequest) {
  let insertedReportId: string | null = null;
  try {
    // 1. Reject bodies over 20 KB with 413
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Payload exceeds 20KB limit' },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Payload exceeds 20KB limit' },
        { status: 413 }
      );
    }

    // 2. In-memory rate limit per IP: 10 requests per minute, else 429
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rate limit exceeded. Maximum 10 requests per minute allowed.',
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 3. Parse JSON (400 on bad JSON) and validate with the shared Zod schema
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validation = emergencyReportSchema.safeParse(parsedJson);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path.join('.') || 'root';
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      return NextResponse.json(
        { ok: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    const input = validation.data;

    // 4. If idempotencyKey already exists, return earlier result with 200 and create nothing
    if (input.idempotencyKey) {
      const existing = await reportRepository.findReportByIdempotencyKey(
        input.idempotencyKey
      );
      if (existing) {
        let incident = null;
        if (existing.incident_id) {
          incident = await reportRepository.getIncidentById(existing.incident_id);
        }
        const missing = computeMissingFields(input);
        const prov = calculateProvisionalPriority(input);

        return NextResponse.json(
          {
            ok: true,
            reportId: existing.id,
            incidentId: existing.incident_id,
            verificationStatus: incident?.verification_status ?? 'unverified',
            needsReview: existing.needs_review,
            possibleDuplicateOf: existing.possible_duplicate_of,
            missingFields: existing.payload?.missingFields ?? missing,
            priorityScore: incident?.priority_score ?? prov.score,
            priorityReason: incident?.priority_reason ?? prov.reason,
          },
          { status: 200 }
        );
      }
    }

    // 5. Insert original submission into reports first (payload holds full validated input, missingFields, received info)
    const missingFields = computeMissingFields(input);
    const source = reporterRoleToSource(input.reporterRole);
    const eventAt =
      typeof input.observedAt === 'string'
        ? input.observedAt
        : input.observedAt.toISOString();

    const fullPayload = {
      ...input,
      missingFields,
      receivedInfo: {
        ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    };

    const insertedReport = await reportRepository.insertReport({
      source,
      payload: fullPayload,
      event_at: eventAt,
      possible_duplicate_of: null,
      needs_review: missingFields.length > 0,
    });
    insertedReportId = insertedReport.id;

    // 6. Run findPossibleDuplicate. If found: link to incident, set needs_review & possible_duplicate_of, apply mergeRaiseOnly
    const recentIncidents = await reportRepository.listRecentIncidents(2);
    const duplicateMatch = findPossibleDuplicate(
      {
        zoneId: input.zoneId,
        lat: input.lat,
        lng: input.lng,
        observedAt: input.observedAt,
      },
      recentIncidents
    );

    if (duplicateMatch) {
      const matchedIncident = recentIncidents.find(
        (i) => i.id === duplicateMatch.matchedIncidentId
      )!;

      const mergeResult = mergeRaiseOnly(matchedIncident, input);

      const updatedIncident = await reportRepository.updateIncident(
        matchedIncident.id,
        mergeResult.updatedFields,
        matchedIncident.updated_at || matchedIncident.created_at,
        input
      );

      // Find the earlier report id associated with this incident
      const earlierReportId =
        (await reportRepository.findEarliestReportIdByIncidentId(matchedIncident.id)) ||
        matchedIncident.id;

      await reportRepository.updateReport(insertedReport.id, {
        incident_id: matchedIncident.id,
        needs_review: true,
        possible_duplicate_of: earlierReportId,
      });

      return NextResponse.json(
        {
          ok: true,
          reportId: insertedReport.id,
          incidentId: matchedIncident.id,
          verificationStatus: updatedIncident.verification_status,
          needsReview: true,
          possibleDuplicateOf: earlierReportId,
          missingFields,
          priorityScore: updatedIncident.priority_score,
          priorityReason: updatedIncident.priority_reason,
        },
        { status: 201 }
      );
    }

    // 7. If not a duplicate: create an incident (unverified, open) with provisional priority and reason
    const priority = calculateProvisionalPriority(input);
    const incidentColumns = toIncidentColumns(
      input,
      priority.score,
      priority.reason
    );

    const createdIncident = await reportRepository.createIncident(
      incidentColumns
    );

    await reportRepository.updateReport(insertedReport.id, {
      incident_id: createdIncident.id,
      needs_review: missingFields.length > 0,
      possible_duplicate_of: null,
    });

    // 8. Return 201 { ok:true, reportId, incidentId, verificationStatus, needsReview, possibleDuplicateOf, missingFields, priorityScore, priorityReason }
    return NextResponse.json(
      {
        ok: true,
        reportId: insertedReport.id,
        incidentId: createdIncident.id,
        verificationStatus: createdIncident.verification_status,
        needsReview: missingFields.length > 0,
        possibleDuplicateOf: null,
        missingFields,
        priorityScore: createdIncident.priority_score,
        priorityReason: createdIncident.priority_reason,
      },
      { status: 201 }
    );
  } catch {
    // If the original report was already inserted before downstream incident failure,
    // ensure the orphan report is preserved in place with needs_review = true
    if (insertedReportId) {
      try {
        await reportRepository.updateReport(insertedReportId, {
          needs_review: true,
        });
      } catch {
        // Best effort
      }
    }

    // 9. On unexpected errors return 500 { ok:false, error:"Could not save report" } without stack traces or internals
    return NextResponse.json(
      { ok: false, error: 'Could not save report' },
      { status: 500 }
    );
  }
}
