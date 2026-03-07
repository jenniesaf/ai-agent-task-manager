// API route for tasks - Main entry point for agent system

import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/agents/orchestrator';

// Initialize agent system on first request
let systemInitialized = false;

async function ensureInitialized() {
  if (!systemInitialized) {
    await orchestrator.initialize();
    systemInitialized = true;
  }
}

/**
 * GET /api/tasks - Get all tasks
 */
export async function GET() {
  try {
    await ensureInitialized();
    
    const tasks = orchestrator.getTasks();
    const logs = orchestrator.getLogs(50);
    
    return NextResponse.json({
      success: true,
      tasks,
      logs,
      system: orchestrator.getStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { title, description, priority } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const taskId = await orchestrator.createTask(title, description, priority);
    
    // Wait a moment for agents to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const task = orchestrator.getTask(taskId);
    const recentLogs = orchestrator.getLogs(10);

    return NextResponse.json({
      success: true,
      taskId,
      task,
      logs: recentLogs,
      message: 'Task created and assigned to agents',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
