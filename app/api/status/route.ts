// API route for system status

import { NextResponse } from 'next/server';
import { orchestrator } from '@/agents/orchestrator';

export async function GET() {
  try {
    if (!orchestrator.isReady()) {
      await orchestrator.initialize();
    }

    const status = orchestrator.getStatus();

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
