# Agent Architecture Documentation

## System Overview

This application implements a **multi-agent architecture** where specialized AI agents collaborate to accomplish tasks autonomously.

## Core Principles

1. **Agent Autonomy**: Each agent operates independently with specific responsibilities
2. **Event-Driven Communication**: Agents communicate through events, not direct calls  
3. **Task Decomposition**: Complex requests are broken into manageable subtasks
4. **Observable Behavior**: All agent actions are logged and trackable

## Agent Types

### Planning Agent
**Role**: Strategic coordinator and task analyzer

**Responsibilities**:
- Analyze user input to understand intent
- Break complex tasks into actionable subtasks
- Assign priorities based on dependencies and urgency
- Route tasks to appropriate agents
- Monitor overall progress

**Decision Process**:
```
Input → Analyze Keywords → Identify Task Type → Decompose → Prioritize → Assign
```

**Example**:
```
User: "Build user authentication"
↓
Planning Agent Output:
- [HIGH] Research auth libraries
- [HIGH] Design user schema
- [MEDIUM] Implement login API
- [MEDIUM] Create UI forms
- [LOW] Add tests
```

### Implementation Agent
**Role**: Task executor and code generator

**Responsibilities**:
- Receive specific tasks from Planning Agent
- Execute implementation steps
- Generate code/content
- Update task status
- Report completion or blockers

**Execution Flow**:
```
Receive Task → Validate Requirements → Execute → Log Actions → Report Status
```

## Agent Communication

### Event Bus Pattern
Agents communicate through events, enabling loose coupling:

```typescript
Events:
- task.created       // User creates new task
- task.analyzed      // Planning Agent completes analysis
- task.assigned      // Task routed to Implementation Agent
- task.started       // Agent begins execution
- task.completed     // Task finished
- task.failed        // Task encountered error
- agent.idle         // Agent available
- agent.busy         // Agent working
```

### Data Flow
```
┌──────────┐
│   User   │
└────┬─────┘
     │ creates task
     ▼
┌──────────────────┐
│ Planning Agent   │
│ - Analyzes       │
│ - Decomposes     │
│ - Prioritizes    │
└────┬────────────┘
     │ assigns
     ▼
┌────────────────────┐
│ Implementation     │
│ Agent              │
│ - Executes         │
│ - Reports          │
└────────────────────┘
```

## State Management

### Task States
- `pending`: Newly created, awaiting analysis
- `analyzing`: Planning Agent processing
- `ready`: Analyzed and ready for execution
- `in_progress`: Implementation Agent working
- `completed`: Successfully finished
- `failed`: Encountered error
- `blocked`: Waiting on dependency

### Agent States
- `idle`: Available for work
- `busy`: Currently processing
- `error`: Encountered issue

## Storage Layer

The system maintains three key data stores:

1. **Tasks**: Core task information and status
2. **Agent Logs**: Audit trail of all agent actions
3. **Agent Registry**: Current state of all agents

## Technology Decisions

### Why No External Database Initially?
- Start with in-memory storage for rapid prototyping
- Add persistence (SQLite/PostgreSQL) in later milestones
- Focus on agent logic, not infrastructure

### Why Event-Driven?
- Agents don't need to know about each other
- Easy to add new agent types
- Natural fit for async operations
- Enables replay and debugging

### Why TypeScript?
- Strong typing catches errors early
- Better IDE support for agent interfaces
- Self-documenting code

## Next Steps

See `agents/planning-agent/SPECIFICATION.md` for Planning Agent implementation details.
See `agents/implementation-agent/SPECIFICATION.md` for Implementation Agent details.
