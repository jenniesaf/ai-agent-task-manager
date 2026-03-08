// Implementation Agent - Executes specific tasks and generates outputs

import {
  IAgent,
  AgentType,
  AgentStatus,
  Task,
  ExecutionResult,
  AgentEvent,
} from '@/lib/types';
import { dataStore, eventBus, agentRegistry, delay } from '@/lib';

export class ImplementationAgent implements IAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType = 'implementation';
  private status: AgentStatus = 'idle';
  private currentTaskId?: string;

  constructor(name: string = 'Implementation Agent') {
    this.name = name;
    
    // Register with the agent registry
    const agent = agentRegistry.registerAgent(name, 'implementation', this);
    this.id = agent.id;

    // Subscribe to relevant events
    this.setupEventListeners();

    this.log('Agent initialized and ready');
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Process a task assigned to this agent
   */
  async processTask(task: Task): Promise<ExecutionResult> {
    this.log(`Starting task execution: ${task.title}`, task.id);
    this.setStatus('busy', task.id);

    const startTime = Date.now();
    const logs: string[] = [];

    try {
      // Update task status
      dataStore.updateTaskStatus(task.id, 'in_progress', this.id);
      await eventBus.emit('task.started', {
        agentId: this.id,
        taskId: task.id,
      });

      logs.push(`Started: ${task.title}`);

      // Validate task
      if (!this.validateTask(task)) {
        logs.push('Task validation failed: missing requirements');
        const result = this.createResult(task.id, 'blocked', logs, startTime, 'Task is not clear or missing requirements');
        this.setStatus('idle');
        return result;
      }

      logs.push('Task validated successfully');

      // Execute the task
      const output = await this.execute(task, logs);

      logs.push('Task execution completed');

      // Mark as completed
      dataStore.updateTaskStatus(task.id, 'completed', this.id);
      
      // Set status to idle BEFORE emitting event so other agents can pick up new work
      this.setStatus('idle');
      
      await eventBus.emit('task.completed', {
        agentId: this.id,
        taskId: task.id,
      });

      const result = this.createResult(task.id, 'completed', logs, startTime, undefined, output);
      
      this.log(`Task completed successfully: ${task.title}`, task.id);
      return result;

    } catch (error) {
      logs.push(`Error: ${error}`);
      this.log(`Task failed: ${error}`, task.id);
      
      dataStore.updateTaskStatus(task.id, 'failed', this.id);
      await eventBus.emit('task.failed', {
        agentId: this.id,
        taskId: task.id,
        data: { error: String(error) },
      });

      const result = this.createResult(task.id, 'failed', logs, startTime, String(error));
      this.setStatus('error');
      return result;
    }
  }

  /**
   * Validate that task is ready for execution
   */
  private validateTask(task: Task): boolean {
    // Check if task has clear requirements
    if (!task.title || task.title.length < 5) {
      return false;
    }

    // Check for vague tasks
    const vagueWords = ['something', 'thing', 'stuff', 'do something'];
    const lowerTitle = task.title.toLowerCase();
    if (vagueWords.some(word => lowerTitle.includes(word))) {
      return false;
    }

    return true;
  }

  /**
   * Execute the task and generate output
   */
  private async execute(task: Task, logs: string[]): Promise<{ type: string; content: string; location?: string }> {
    const fullText = `${task.title} ${task.description || ''}`.toLowerCase();

    // Simulate work with realistic delays
    logs.push('Analyzing task requirements...');
    await delay(300);

    logs.push('Preparing execution environment...');
    await delay(200);

    // Determine task type and generate appropriate output
    if (fullText.includes('component') || fullText.includes('ui')) {
      return await this.generateComponent(task, logs);
    } else if (fullText.includes('api') || fullText.includes('endpoint') || fullText.includes('route')) {
      return await this.generateAPI(task, logs);
    } else if (fullText.includes('function') || fullText.includes('method')) {
      return await this.generateFunction(task, logs);
    } else if (fullText.includes('test')) {
      return await this.generateTest(task, logs);
    } else if (fullText.includes('document') || fullText.includes('readme')) {
      return await this.generateDocumentation(task, logs);
    } else {
      return await this.generateGeneric(task, logs);
    }
  }

  /**
   * Generate a component
   */
  private async generateComponent(task: Task, logs: string[]): Promise<{ type: string; content: string; location: string }> {
    logs.push('Generating React component...');
    await delay(500);

    const componentName = this.extractComponentName(task.title);
    
    const content = `// ${componentName} Component
export default function ${componentName}() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">${componentName}</h2>
      {/* Component implementation */}
    </div>
  );
}`;

    logs.push(`Component ${componentName} generated`);
    return { type: 'code', content, location: `components/${componentName}.tsx` };
  }

  /**
   * Generate API endpoint
   */
  private async generateAPI(task: Task, logs: string[]): Promise<{ type: string; content: string; location: string }> {
    logs.push('Generating API endpoint...');
    await delay(600);

    const content = `// API Route Handler
export async function GET(request: Request) {
  try {
    // Handle GET request
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Handle POST request
    return Response.json({ success: true, data: body });
  }catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}`;

    logs.push('API endpoint generated');
    return { type: 'code', content, location: 'app/api/endpoint/route.ts' };
  }

  /**
   * Generate function
   */
  private async generateFunction(task: Task, logs: string[]): Promise<{ type: string; content: string }> {
    logs.push('Generating function...');
    await delay(400);

    const content = `/**
 * ${task.title}
 */
export function generatedFunction(params: any) {
  // Function implementation
  return params;
}`;

    logs.push('Function generated');
    return { type: 'code', content };
  }

  /**
   * Generate test
   */
  private async generateTest(task: Task, logs: string[]): Promise<{ type: string; content: string }> {
    logs.push('Generating test cases...');
    await delay(450);

    const content = `describe('${task.title}', () => {
  it('should work correctly', () => {
    // Test implementation
    expect(true).toBe(true);
  });

  it('should handle errors', () => {
    // Error handling test
    expect(true).toBe(true);
  });
});`;

    logs.push('Test cases generated');
    return { type: 'code', content };
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(task: Task, logs: string[]): Promise<{ type: string; content: string }> {
    logs.push('Generating documentation...');
    await delay(350);

    const content = `# ${task.title}

## Overview
Documentation content for ${task.title}

## Usage
\`\`\`
// Example usage
\`\`\`

## Notes
- Auto-generated documentation
- Review and enhance as needed
`;

    logs.push('Documentation generated');
    return { type: 'text', content };
  }

  /**
   * Generate generic output
   */
  private async generateGeneric(task: Task, logs: string[]): Promise<{ type: string; content: string }> {
    logs.push('Executing task...');
    await delay(500);

    logs.push('Processing...');
    await delay(300);

    const content = `Task: ${task.title}
Status: Completed
Description: ${task.description || 'N/A'}

Output: Task has been successfully processed.
`;

    logs.push('Task execution complete');
    return { type: 'text', content };
  }

  /**
   * Extract component name from task title
   */
  private extractComponentName(title: string): string {
    const words = title.split(' ').filter(w => 
      w.length > 2 && 
      !['the', 'and', 'for', 'with', 'create', 'add', 'build'].includes(w.toLowerCase())
    );
    
    if (words.length > 0) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    
    return 'Component';
  }

  /**
   * Create execution result
   */
  private createResult(
    taskId: string,
    status: 'completed' | 'failed' | 'blocked',
    logs: string[],
    startTime: number,
    error?: string,
    output?: { type: string; content: string; location?: string }
  ): ExecutionResult {
    return {
      taskId,
      status,
      output,
      logs,
      duration: Date.now() - startTime,
      error,
    };
  }

  /**
   * Handle events from other agents
   */
  async handleEvent(event: AgentEvent): Promise<void> {
    // Implementation agent listens for task assignments
    if (event.type === 'task.assigned' && event.taskId) {
      const task = dataStore.getTask(event.taskId);
      
      // Check if task is assigned to this agent
      if (task && task.assignedToAgent === this.id && task.status === 'ready') {
        if (this.status === 'idle') {
          // Automatically start working on assigned task
          this.log(`Received task assignment: ${task.title}`, task.id);
          await this.processTask(task);
        } else {
          this.log(`Task assigned but currently busy: ${task.title}`, task.id);
        }
      }
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for task assignments
    eventBus.on('task.assigned', async (event) => {
      await this.handleEvent(event);
    });
  }

  /**
   * Update agent status
   */
  private async setStatus(status: AgentStatus, taskId?: string): Promise<void> {
    this.status = status;
    this.currentTaskId = taskId;
    await agentRegistry.updateAgentStatus(this.id, status, taskId);
  }

  /**
   * Log agent action
   */
  private log(action: string, taskId?: string, details?: Record<string, any>): void {
    console.log(`[${this.name}] ${action}`);
    dataStore.addLog({
      agentId: this.id,
      agentName: this.name,
      action,
      taskId,
      details,
    });
  }
}
