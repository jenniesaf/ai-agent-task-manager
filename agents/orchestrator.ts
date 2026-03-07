// Agent System Orchestrator - Initializes and coordinates all agents

import { PlanningAgent } from './planning-agent';
import { ImplementationAgent } from './implementation-agent';
import { agentRegistry, dataStore, eventBus } from '@/lib';

class AgentOrchestrator {
  private planningAgent?: PlanningAgent;
  private implementationAgent?: ImplementationAgent;
  private initialized: boolean = false;

  /**
   * Initialize the agent system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[Orchestrator] System already initialized');
      return;
    }

    console.log('[Orchestrator] Initializing agent system...');

    // Create agents
    this.planningAgent = new PlanningAgent('Planning Agent');
    this.implementationAgent = new ImplementationAgent('Implementation Agent');

    // Setup system event logging
    this.setupSystemLogging();

    this.initialized = true;
    console.log('[Orchestrator] Agent system initialized successfully');
    console.log(`[Orchestrator] Registered agents: ${agentRegistry.getAllAgents().length}`);
  }

  /**
   * Check if system is ready
   */
  isReady(): boolean {
    return this.initialized && agentRegistry.isSystemReady();
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      ready: this.isReady(),
      agents: agentRegistry.getAllAgents(),
      agentStats: agentRegistry.getStats(),
      taskStats: dataStore.getTaskStats(),
      eventHistory: eventBus.getHistory(10),
      recentLogs: dataStore.getRecentLogs(20),
    };
  }

  /**
   * Create a new task (typically from user input)
   */
  async createTask(title: string, description?: string, priority?: 'HIGH' | 'MEDIUM' | 'LOW'): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Agent system not initialized');
    }

    console.log('[Orchestrator] Creating new task:', title);

    // Create task in data store
    const task = dataStore.createTask({
      title,
      description,
      priority,
      createdBy: 'user',
    });

    // Emit event (Planning Agent will pick it up automatically)
    await eventBus.emit('task.created', {
      taskId: task.id,
      data: { createdBy: 'user' },
    });

    console.log(`[Orchestrator] Task created: ${task.id}`);
    return task.id;
  }

  /**
   * Get all tasks
   */
  getTasks() {
    return dataStore.getAllTasks();
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string) {
    return dataStore.getTask(taskId);
  }

  /**
   * Get agent logs
   */
  getLogs(limit?: number) {
    return dataStore.getAllLogs(limit);
  }

  /**
   * Setup comprehensive system logging
   */
  private setupSystemLogging(): void {
    // Log all events for debugging
    eventBus.onAny((event) => {
      console.log(`[Event] ${event.type}`, {
        agentId: event.agentId,
        taskId: event.taskId,
        timestamp: event.timestamp,
      });
    });
  }

  /**
   * Shutdown the system (cleanup)
   */
  async shutdown(): Promise<void> {
    console.log('[Orchestrator] Shutting down agent system...');
    // Could add cleanup logic here if needed
    this.initialized = false;
    console.log('[Orchestrator] System shut down');
  }
}

// Singleton instance
export const orchestrator = new AgentOrchestrator();
