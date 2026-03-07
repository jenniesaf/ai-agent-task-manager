// Event Bus for agent-to-agent communication
// Implements the Observer pattern for loose coupling

import { AgentEvent, EventType } from './types';
import { generateId } from './utils';

type EventHandler = (event: AgentEvent) => void | Promise<void>;

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>>;
  private eventHistory: AgentEvent[];
  private maxHistorySize: number = 100;

  constructor() {
    this.handlers = new Map();
    this.eventHistory = [];
  }

  /**
   * Subscribe to specific event types
   */
  on(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to all event types
    const eventTypes: EventType[] = [
      'task.created',
      'task.analyzed',
      'task.assigned',
      'task.started',
      'task.completed',
      'task.failed',
      'agent.idle',
      'agent.busy',
      'agent.error',
    ];
    
    eventTypes.forEach(type => {
      unsubscribers.push(this.on(type, handler));
    });
    
    // Return function that unsubscribes from all
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Emit an event to all subscribed handlers
   */
  async emit(
    eventType: EventType,
    data?: {
      agentId?: string;
      taskId?: string;
      data?: Record<string, any>;
    }
  ): Promise<void> {
    const event: AgentEvent = {
      id: generateId(),
      type: eventType,
      agentId: data?.agentId,
      taskId: data?.taskId,
      data: data?.data,
      timestamp: new Date().toISOString(),
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift(); // Remove oldest
    }

    // Call all handlers for this event type
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const promises = Array.from(handlers).map(handler => 
        Promise.resolve(handler(event))
      );
      await Promise.all(promises);
    }
  }

  /**
   * Get recent event history
   */
  getHistory(limit?: number): AgentEvent[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get all active subscriptions count
   */
  getSubscriptionCount(): number {
    let count = 0;
    this.handlers.forEach(handlers => {
      count += handlers.size;
    });
    return count;
  }
}

// Singleton instance
export const eventBus = new EventBus();
