// Planning Agent - Main agent class that coordinates task analysis and planning

import {
  IAgent,
  AgentType,
  AgentStatus,
  Task,
  PlanningResult,
  AgentEvent,
  TaskAnalysis,
} from '@/lib/types';
import { dataStore, eventBus, agentRegistry, getTimestamp } from '@/lib';
import { analyzeTask, isTaskClear, shouldDecompose } from './task-analyzer';
import { decomposeTask, optimizeSubtaskPriorities } from './task-decomposer';

export class PlanningAgent implements IAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType = 'planning';
  private status: AgentStatus = 'idle';
  private currentTaskId?: string;

  constructor(name: string = 'Planning Agent') {
    this.name = name;
    
    // Register with the agent registry
    const agent = agentRegistry.registerAgent(name, 'planning', this);
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
  async processTask(task: Task): Promise<PlanningResult> {
    this.log(`Processing task: ${task.title}`, task.id);
    this.setStatus('busy', task.id);

    try {
      // Update task status to analyzing
      dataStore.updateTaskStatus(task.id, 'analyzing', this.id);
      await eventBus.emit('task.started', {
        agentId: this.id,
        taskId: task.id,
      });

      // Analyze the task
      const analysis = await this.analyze(task);
      this.log(`Task analysis complete. Type: ${analysis.taskType}, Complexity: ${analysis.complexity}`, task.id);

      // Check if task needs clarification
      if (analysis.requiresUserInput) {
        this.log('Task requires clarification from user', task.id);
        dataStore.updateTaskStatus(task.id, 'blocked');
        
        const result: PlanningResult = {
          originalTaskId: task.id,
          analysis,
          subtasks: [],
          nextAction: 'wait_for_user',
        };

        this.setStatus('idle');
        return result;
      }

      // Check if task should be decomposed
      if (analysis.requiresDecomposition) {
        this.log('Task requires decomposition', task.id);
        return await this.decomposeAndPlan(task, analysis);
      } else {
        this.log('Task is simple, routing directly to implementation', task.id);
        return await this.routeDirectly(task, analysis);
      }

    } catch (error) {
      this.log(`Error processing task: ${error}`, task.id);
      this.setStatus('error');
      dataStore.updateTaskStatus(task.id, 'failed');
      throw error;
    }
  }

  /**
   * Analyze a task to understand its characteristics
   */
  private async analyze(task: Task): Promise<TaskAnalysis> {
    this.log('Analyzing task...', task.id);
    
    // Simulate thinking time
    await this.simulateThinking(500);
    
    const analysis = analyzeTask(task);
    
    // Apply suggested priority if task doesn't have explicit priority
    if (task.priority === 'MEDIUM' && analysis.suggestedPriority !== 'MEDIUM') {
      dataStore.updateTask(task.id, { priority: analysis.suggestedPriority });
    }
    
    return analysis;
  }

  /**
   * Decompose task and create subtasks
   */
  private async decomposeAndPlan(task: Task, analysis: TaskAnalysis): Promise<PlanningResult> {
    this.log('Decomposing task into subtasks...', task.id);
    
    // Simulate planning time
    await this.simulateThinking(800);
    
    // Get subtask definitions
    let subtaskDefs = decomposeTask(task);
    subtaskDefs = optimizeSubtaskPriorities(subtaskDefs);
    
    this.log(`Created ${subtaskDefs.length} subtasks`, task.id);
    
    // Create actual task entries for subtasks
    const createdSubtasks: Task[] = [];
    for (const def of subtaskDefs) {
      const subtask = dataStore.createTask({
        title: def.title,
        description: def.description,
        priority: def.priority,
        parentTaskId: task.id,
        createdBy: 'agent',
      });
      createdSubtasks.push(subtask);
      
      await eventBus.emit('task.created', {
        agentId: this.id,
        taskId: subtask.id,
        data: { parentTaskId: task.id },
      });
    }
    
    // Mark original task as completed (it's now split)
    dataStore.updateTaskStatus(task.id, 'completed', this.id);
    await eventBus.emit('task.completed', {
      agentId: this.id,
      taskId: task.id,
    });
    
    // Assign first subtask
    if (createdSubtasks.length > 0) {
      const firstSubtask = createdSubtasks[0];
      await this.assignToImplementation(firstSubtask);
    }
    
    const result: PlanningResult = {
      originalTaskId: task.id,
      analysis,
      subtasks: subtaskDefs,
      nextAction: 'assign',
    };
    
    this.setStatus('idle');
    return result;
  }

  /**
   * Route simple task directly to implementation
   */
  private async routeDirectly(task: Task, analysis: TaskAnalysis): Promise<PlanningResult> {
    this.log('Routing task to implementation agent', task.id);
    
    // Mark as analyzed and ready
    dataStore.updateTaskStatus(task.id, 'ready');
    await eventBus.emit('task.analyzed', {
      agentId: this.id,
      taskId: task.id,
    });
    
    // Assign to implementation agent
    await this.assignToImplementation(task);
    
    const result: PlanningResult = {
      originalTaskId: task.id,
      analysis,
      subtasks: [],
      nextAction: 'assign',
    };
    
    this.setStatus('idle');
    return result;
  }

  /**
   * Assign a task to implementation agent
   */
  private async assignToImplementation(task: Task): Promise<void> {
    // Find available implementation agent
    const implAgent = agentRegistry.findAvailableAgent('implementation');
    
    if (!implAgent) {
      this.log('No implementation agent available, task will wait', task.id);
      dataStore.updateTaskStatus(task.id, 'ready');
      return;
    }
    
    this.log(`Assigning task to ${implAgent.name}`, task.id);
    dataStore.updateTaskStatus(task.id, 'ready', implAgent.id);
    
    await eventBus.emit('task.assigned', {
      agentId: this.id,
      taskId: task.id,
      data: { assignedTo: implAgent.id },
    });
  }

  /**
   * Handle events from other agents
   */
  async handleEvent(event: AgentEvent): Promise<void> {
    // Planning agent can react to completed subtasks to assign next ones
    if (event.type === 'task.completed' && event.taskId) {
      const task = dataStore.getTask(event.taskId);
      if (task?.parentTaskId) {
        // Check if there are more subtasks to assign
        const siblings = dataStore.getSubtasks(task.parentTaskId);
        const nextTask = siblings.find(t => t.status === 'pending');
        
        if (nextTask) {
          this.log(`Subtask completed, assigning next: ${nextTask.title}`, nextTask.id);
          await this.assignToImplementation(nextTask);
        }
      }
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for new tasks
    eventBus.on('task.created', async (event) => {
      if (event.data?.createdBy === 'user') {
        const task = dataStore.getTask(event.taskId!);
        if (task && this.status === 'idle') {
          // Automatically process new user tasks
          await this.processTask(task);
        }
      }
    });

    // Listen for completed implementation tasks
    eventBus.on('task.completed', async (event) => {
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

  /**
   * Simulate thinking/processing time
   */
  private async simulateThinking(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
