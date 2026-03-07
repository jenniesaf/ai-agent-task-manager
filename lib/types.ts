// Core type definitions for the agent system

export type TaskStatus = 
  | 'pending'         // Newly created, awaiting analysis
  | 'analyzing'       // Planning Agent processing
  | 'ready'           // Analyzed and ready for execution
  | 'in_progress'     // Implementation Agent working
  | 'completed'       // Successfully finished
  | 'failed'          // Encountered error
  | 'blocked';        // Waiting on dependency

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type AgentType = 'planning' | 'implementation';

export type AgentStatus = 'idle' | 'busy' | 'error';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToAgent?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: 'user' | 'agent';
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  currentTaskId?: string;
  lastActive: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  taskId?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Event types for agent communication
export type EventType =
  | 'task.created'
  | 'task.analyzed'
  | 'task.assigned'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'agent.idle'
  | 'agent.busy'
  | 'agent.error';

export interface AgentEvent {
  id: string;
  type: EventType;
  agentId?: string;
  taskId?: string;
  data?: Record<string, any>;
  timestamp: string;
}

// Planning Agent specific types
export interface TaskAnalysis {
  taskId: string;
  taskType: string;
  complexity: number; // 1-5 scale
  detectedKeywords: string[];
  suggestedPriority: TaskPriority;
  requiresDecomposition: boolean;
  requiresUserInput: boolean;
}

export interface SubtaskDefinition {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignTo: AgentType;
  estimatedComplexity: number;
  dependsOn?: string; // parent task id
}

export interface PlanningResult {
  originalTaskId: string;
  analysis: TaskAnalysis;
  subtasks: SubtaskDefinition[];
  nextAction: 'assign' | 'wait_for_user' | 'decompose_further';
}

// Implementation Agent specific types
export interface ExecutionResult {
  taskId: string;
  status: 'completed' | 'failed' | 'blocked';
  output?: {
    type: 'code' | 'text' | 'file';
    content: string;
    location?: string;
  };
  logs: string[];
  duration: number; // milliseconds
  error?: string;
}

// Agent interface that all agents must implement
export interface IAgent {
  id: string;
  name: string;
  type: AgentType;
  
  // Process a task assigned to this agent
  processTask(task: Task): Promise<ExecutionResult | PlanningResult>;
  
  // Get current status
  getStatus(): AgentStatus;
  
  // Handle events from other agents
  handleEvent(event: AgentEvent): Promise<void>;
}
