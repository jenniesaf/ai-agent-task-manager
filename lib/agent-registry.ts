// Agent Registry - Central registry for all agents in the system

import { Agent, AgentType, AgentStatus, IAgent } from './types';
import { generateId, getTimestamp } from './utils';
import { eventBus } from './event-bus';

class AgentRegistry {
  private agents: Map<string, Agent>;
  private agentInstances: Map<string, IAgent>;

  constructor() {
    this.agents = new Map();
    this.agentInstances = new Map();
  }

  /**
   * Register a new agent
   */
  registerAgent(name: string, type: AgentType, instance: IAgent): Agent {
    const agent: Agent = {
      id: generateId(),
      name,
      type,
      status: 'idle',
      lastActive: getTimestamp(),
    };

    this.agents.set(agent.id, agent);
    this.agentInstances.set(agent.id, instance);

    console.log(`[AgentRegistry] Registered ${type} agent: ${name} (${agent.id})`);

    return agent;
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agent instance by ID
   */
  getAgentInstance(agentId: string): IAgent | undefined {
    return this.agentInstances.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Get idle agents (available for work)
   */
  getIdleAgents(type?: AgentType): Agent[] {
    let agents = Array.from(this.agents.values()).filter(agent => agent.status === 'idle');
    if (type) {
      agents = agents.filter(agent => agent.type === type);
    }
    return agents;
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(
    agentId: string,
    status: AgentStatus,
    currentTaskId?: string
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    agent.status = status;
    agent.currentTaskId = currentTaskId;
    agent.lastActive = getTimestamp();

    // Emit event
    if (status === 'idle') {
      await eventBus.emit('agent.idle', { agentId });
    } else if (status === 'busy') {
      await eventBus.emit('agent.busy', { agentId, taskId: currentTaskId });
    } else if (status === 'error') {
      await eventBus.emit('agent.error', { agentId });
    }
  }

  /**
   * Find best available agent for a task
   */
  findAvailableAgent(type: AgentType): Agent | null {
    const idleAgents = this.getIdleAgents(type);
    if (idleAgents.length === 0) {
      return null;
    }
    
    // For now, just return the first idle agent
    // Later we can add load balancing logic
    return idleAgents[0];
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    total: number;
    byType: Record<AgentType, number>;
    byStatus: Record<AgentStatus, number>;
  } {
    const agents = Array.from(this.agents.values());
    
    const stats = {
      total: agents.length,
      byType: {
        planning: agents.filter(a => a.type === 'planning').length,
        implementation: agents.filter(a => a.type === 'implementation').length,
      },
      byStatus: {
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
        error: agents.filter(a => a.status === 'error').length,
      },
    };

    return stats;
  }

  /**
   * Check if system is ready (has required agents registered)
   */
  isSystemReady(): boolean {
    const hasPlanningAgent = this.getAgentsByType('planning').length > 0;
    const hasImplementationAgent = this.getAgentsByType('implementation').length > 0;
    return hasPlanningAgent && hasImplementationAgent;
  }

  /**
   * Clear all agents (for testing)
   */
  clear(): void {
    this.agents.clear();
    this.agentInstances.clear();
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();
