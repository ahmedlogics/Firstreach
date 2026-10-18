import { NextRequest } from 'next/server';
import { outreachRepository } from '@/lib/outreach/repository';
import {
  CreateOutreachActionSchema,
  OutreachChannelType,
  OutreachStatusType,
  OUTREACH_CHANNEL_VALUES,
  OUTREACH_STATUS_VALUES,
} from '@/lib/outreach/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelRaw = searchParams.get('channel') || undefined;
    const statusRaw = searchParams.get('status') || undefined;
    const household_id = searchParams.get('household_id') || undefined;

    let channel: OutreachChannelType | undefined = undefined;
    if (channelRaw && OUTREACH_CHANNEL_VALUES.includes(channelRaw as OutreachChannelType)) {
      channel = channelRaw as OutreachChannelType;
    }

    let status: OutreachStatusType | undefined = undefined;
    if (statusRaw && OUTREACH_STATUS_VALUES.includes(statusRaw as OutreachStatusType)) {
      status = statusRaw as OutreachStatusType;
    }

    const actions = await outreachRepository.listOutreachActions({
      channel,
      status,
      household_id,
    });

    return Response.json({
      success: true,
      count: actions.length,
      data: actions,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API GET /api/outreach-actions] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to list outreach actions',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateOutreachActionSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const created = await outreachRepository.createOutreachAction(parseResult.data);

    return Response.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API POST /api/outreach-actions] Error:', error);
    return Response.json(
      {
        success: false,
        error: msg || 'Failed to create outreach action',
      },
      { status: 400 }
    );
  }
}
