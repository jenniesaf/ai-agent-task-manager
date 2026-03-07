# Implementation Agent Specification

## Agent Identity
- **Name**: Implementation Agent
- **Type**: Executor
- **Version**: 1.0.0

## Purpose
Execute specific, well-defined tasks assigned by the Planning Agent and report progress.

## Core Capabilities

### 1. Task Execution
Receive and execute atomic tasks:
- Parse task requirements
- Validate preconditions
- Perform the work
- Verify completion

### 2. Status Reporting
Maintain clear communication:
- Report when starting a task
- Provide progress updates
- Report completion or failure
- Include relevant details/artifacts

### 3. Error Handling
Gracefully handle issues:
- Detect blocking conditions
- Report specific error messages
- Request clarification when needed
- Avoid silent failures

## Input/Output Contract

### Input
```typescript
interface TaskAssignment {
  taskId: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  requirements?: string[];
  parentTaskId?: string;
}
```

### Output
```typescript
interface ExecutionResult {
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
```

## Execution Strategy

### Step 1: Validate
```
- Check if task is clear and actionable
- Verify no blocking dependencies
- Confirm requirements are met
```

### Step 2: Execute
```
- Perform the specified work
- Log each action taken
- Generate required outputs
```

### Step 3: Verify
```
- Check work meets requirements
- Validate outputs exist
- Confirm success criteria
```

### Step 4: Report
```
- Update task status
- Log completion details
- Notify Planning Agent
```

## Task Types (MVP)

### Type 1: Code Generation
For tasks like "Create login form component":
- Use template-based generation
- Follow project conventions
- Include basic structure

### Type 2: File Operations
For tasks like "Create new file X":
- Validate path
- Create/update file
- Report location

### Type 3: Documentation
For tasks like "Add README section":
- Generate structured content
- Follow markdown conventions
- Include examples

### Type 4: Simulated Work
For learning/demo purposes:
- Simulate task execution
- Add realistic delays
- Generate sample outputs

## Behavior Patterns

### Pattern 1: Successful Execution
```
Receive task
→ Log "Starting task X"
→ Execute work (with progress logs)
→ Log "Completed task X"
→ Report success with output
```

### Pattern 2: Blocked Task
```
Receive task
→ Log "Starting task X"
→ Detect missing dependency
→ Log "Task X blocked: needs Y"
→ Report blocked status
```

### Pattern 3: Failed Task
```
Receive task
→ Log "Starting task X"
→ Attempt execution
→ Encounter error
→ Log "Task X failed: [error]"
→ Report failure with details
```

## Logging Standards

All actions must be logged with:
```typescript
{
  timestamp: string;
  agentName: 'implementation';
  taskId: string;
  action: string;
  details?: any;
}
```

## Limitations (MVP)

**Version 1 will NOT**:
- Use external APIs or LLMs
- Execute arbitrary code
- Modify system files
- Handle parallel tasks
- Learn or improve over time

**Version 1 WILL**:
- Simulate task execution
- Use templates and rules
- Report realistic progress
- Focus on demonstrating agent patterns

## Testing Scenarios

### Scenario 1: Code Generation Task
```
Input: "Create Button component"
Expected: 
- Log start
- Generate component code
- Log completion
- Return code artifact
```

### Scenario 2: Blocked Task
```
Input: "Deploy to production" (requires completed build)
Expected:
- Detect missing build
- Report blocked status
- Don't proceed
```

### Scenario 3: Invalid Task
```
Input: "Do something" (too vague)
Expected:
- Request clarification
- Don't attempt execution
- Report needs_info
```

## Success Criteria

Implementation Agent is successful when:
1. Completes all valid, unblocked tasks
2. Accurately reports status
3. Provides useful output artifacts
4. Logs all actions clearly
5. Handles errors gracefully
6. Never silently fails

## Implementation Notes

- Keep execution logic simple and deterministic
- Use templates for code generation
- Simulate async work with delays
- Make logs human-readable
- Focus on demonstrating agent behavior

## Future Enhancements

- LLM integration for real code generation
- Actual file system operations
- Git integration
- Testing automation
- Performance optimization
