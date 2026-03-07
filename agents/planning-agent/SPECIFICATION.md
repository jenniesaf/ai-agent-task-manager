# Planning Agent Specification

## Agent Identity
- **Name**: Planning Agent
- **Type**: Coordinator
- **Version**: 1.0.0

## Purpose
Analyze user requests and transform them into structured, actionable task plans that can be executed by implementation agents.

## Core Capabilities

### 1. Task Analysis
Examine user input to understand:
- **Intent**: What does the user want to accomplish?
- **Complexity**: Is this a simple task or complex project?
- **Domain**: What area does this task belong to? (coding, design, research, etc.)

### 2. Task Decomposition
Break complex tasks into subtasks:
- Identify logical steps
- Consider dependencies between steps
- Ensure each subtask is atomic and actionable

**Example**:
```
Input: "Build a contact form"
Output:
1. Design form schema (fields needed)
2. Create form component
3. Add validation logic
4. Implement submission handler
5. Add success/error messaging
```

### 3. Priority Assignment
Determine task priority using:
- **Urgency keywords**: "urgent", "asap", "critical" → HIGH
- **Dependencies**: Blocking tasks → HIGH
- **Complexity**: Quick wins → MEDIUM, Complex research → varies
- **Default**: MEDIUM when unclear

**Priority Levels**:
- `HIGH`: Must be done first, blocking other work
- `MEDIUM`: Normal priority, can be done in order
- `LOW`: Nice-to-have, can be deferred

### 4. Agent Assignment
Route tasks to appropriate agent:
- Code generation → Implementation Agent
- Testing tasks → Implementation Agent  
- More planning needed → Keep with Planning Agent
- User clarification → Hold in pending

## Decision Rules

### Rule 1: Complexity Detection
```typescript
if (taskDescription.length > 100 || containsKeywords(['build', 'create', 'implement', 'system'])) {
  // Complex task - decompose
  return decompose(task);
} else {
  // Simple task - single item
  return [task];
}
```

### Rule 2: Priority Keywords
```typescript
const highPriorityWords = ['urgent', 'critical', 'asap', 'blocker', 'important'];
const lowPriorityWords = ['maybe', 'someday', 'nice to have', 'optional'];

if (containsAny(highPriorityWords)) return 'HIGH';
if (containsAny(lowPriorityWords)) return 'LOW';
return 'MEDIUM';
```

### Rule 3: Dependency Detection
```typescript
// If task name contains "after" or "once" or "depends on"
// Mark as blocked and identify parent task
```

## Input/Output Contract

### Input
```typescript
interface TaskInput {
  id: string;
  title: string;
  description?: string;
  createdBy: 'user' | 'agent';
}
```

### Output
```typescript
interface PlanningResult {
  originalTaskId: string;
  subtasks: Array<{
    id: string;
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    assignTo: 'implementation' | 'planning' | 'user';
    parentId?: string;
    estimatedComplexity: number; // 1-5
  }>;
  analysis: {
    taskType: string;
    detectedKeywords: string[];
    requiresUserInput: boolean;
  };
}
```

## Behavior Patterns

### Pattern 1: Single Task Flow
```
User creates task
→ Planning Agent analyzes
→ Assigns priority
→ Routes to Implementation Agent
→ Monitors completion
```

### Pattern 2: Complex Task Flow
```
User creates complex task
→ Planning Agent decomposes into 5 subtasks
→ Assigns priorities (2 HIGH, 2 MEDIUM, 1 LOW)
→ Creates dependency chain
→ Routes first HIGH task to Implementation Agent
→ Monitors and routes next task upon completion
```

### Pattern 3: Ambiguous Task Flow
```
User creates vague task
→ Planning Agent identifies missing info
→ Marks task as 'needs_clarification'
→ Waits for user input
→ Re-analyzes with new info
```

## State Tracking

The Planning Agent maintains awareness of:
- All pending tasks
- All in-progress tasks
- Agent availability
- Task dependencies
- Blocked tasks

## Limitations (MVP)

**Version 1 will NOT**:
- Use external LLM APIs (rule-based only)
- Learn from past tasks (no ML)
- Handle concurrent task dependencies
- Support task deadlines
- Estimate time requirements

**Future versions may add**:
- LLM integration for better analysis
- Learning from task patterns
- Resource allocation
- Time estimation

## Testing Scenarios

### Scenario 1: Simple Task
```
Input: "Add a button to homepage"
Expected: Single task, MEDIUM priority, assign to Implementation
```

### Scenario 2: Complex Task
```
Input: "Build user authentication system"
Expected: 5-7 subtasks, varying priorities, sequential assignment
```

### Scenario 3: Urgent Task
```
Input: "URGENT: Fix broken login"
Expected: Single task, HIGH priority, immediate assignment
```

### Scenario 4: Vague Task
```
Input: "Improve the app"
Expected: Mark for clarification, no immediate assignment
```

## Implementation Notes

- Start with simple keyword matching
- Use regular expressions for pattern detection
- Store decision rationale in agent logs
- Make rules easy to modify and extend
- Prioritize clarity over cleverness

## Success Criteria

Planning Agent is successful when:
1. 90%+ of tasks are correctly categorized
2. Complex tasks are broken into logical steps
3. Priorities make sense to users
4. Implementation Agent receives clear, actionable tasks
5. Dependencies are correctly identified
