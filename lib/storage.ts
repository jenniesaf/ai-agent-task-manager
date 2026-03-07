// In-memory data storage for tasks and agent logs
// Later can be replaced with database persistence

import { Task, AgentLog, TaskStatus, TaskPriority } from './types';
import { generateId, getTimestamp } from './utils';

class DataStore {
  private tasks: Map<string, Task>;
  private logs: AgentLog[];
  private maxLogsSize: number = 1000;

  constructor() {
    this.tasks = new Map();
    this.logs = [];
  }

  // ============= TASK OPERATIONS =============

  /**
   * Create a new task
   */
  createTask(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    parentTaskId?: string;
    createdBy?: 'user' | 'agent';
  }): Task {
    const task: Task = {
      id: generateId(),
      title: data.title,
      description: data.description,
      status: 'pending',
      priority: data.priority || 'MEDIUM',
      parentTaskId: data.parentTaskId,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      createdBy: data.createdBy || 'user',
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  /**
   * Get tasks by parent ID (subtasks)
   */
  getSubtasks(parentId: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.parentTaskId === parentId);
  }

  /**
   * Update task
   */
  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    const updatedTask = {
      ...task,
      ...updates,
      id: task.id, // Prevent ID change
      createdAt: task.createdAt, // Prevent createdAt change
      updatedAt: getTimestamp(),
    };

    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus, assignedToAgent?: string): Task | null {
    return this.updateTask(taskId, { status, assignedToAgent });
  }

  /**
   * Delete task
   */
  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * Get pending tasks (ready for processing)
   */
  getPendingTasks(): Task[] {
    return this.getTasksByStatus('pending');
  }

  /**
   * Get active tasks (being processed)
   */
  getActiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(
      task => task.status === 'analyzing' || task.status === 'in_progress'
    );
  }

  // ============= LOG OPERATIONS =============

  /**
   * Add agent log entry
   */
  addLog(data: {
    agentId: string;
    agentName: string;
    action: string;
    taskId?: string;
    details?: Record<string, any>;
  }): AgentLog {
    const log: AgentLog = {
      id: generateId(),
      agentId: data.agentId,
      agentName: data.agentName,
      action: data.action,
      taskId: data.taskId,
      details: data.details,
      timestamp: getTimestamp(),
    };

    this.logs.push(log);

    // Trim logs if exceeds max size
    if (this.logs.length > this.maxLogsSize) {
      this.logs = this.logs.slice(-this.maxLogsSize);
    }

    return log;
  }

  /**
   * Get all logs
   */
  getAllLogs(limit?: number): AgentLog[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  /**
   * Get logs for specific agent
   */
  getLogsByAgent(agentId: string, limit?: number): AgentLog[] {
    const agentLogs = this.logs.filter(log => log.agentId === agentId);
    if (limit) {
      return agentLogs.slice(-limit);
    }
    return agentLogs;
  }

  /**
   * Get logs for specific task
   */
  getLogsByTask(taskId: string): AgentLog[] {
    return this.logs.filter(log => log.taskId === taskId);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50): AgentLog[] {
    return this.logs.slice(-limit);
  }

  // ============= STATISTICS =============

  /**
   * Get task statistics
   */
  getTaskStats(): {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
  } {
    const tasks = Array.from(this.tasks.values());

    return {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        analyzing: tasks.filter(t => t.status === 'analyzing').length,
        ready: tasks.filter(t => t.status === 'ready').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      },
      byPriority: {
        HIGH: tasks.filter(t => t.priority === 'HIGH').length,
        MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
        LOW: tasks.filter(t => t.priority === 'LOW').length,
      },
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.tasks.clear();
    this.logs = [];
  }
}

// Singleton instance
export const dataStore = new DataStore();
