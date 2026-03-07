// Task Decomposer - Breaks complex tasks into manageable subtasks

import { Task, SubtaskDefinition, TaskPriority } from '@/lib/types';
import { analyzeTask } from './task-analyzer';
import { containsAny } from '@/lib/utils';

/**
 * Decomposes a complex task into subtasks
 */
export function decomposeTask(task: Task): SubtaskDefinition[] {
  const analysis = analyzeTask(task);
  const fullText = `${task.title} ${task.description || ''}`.toLowerCase();

  // Use pattern matching to create appropriate subtasks
  if (containsAny(fullText, ['authentication', 'auth', 'login', 'signup', 'register'])) {
    return decomposeAuthTask(task);
  }

  if (containsAny(fullText, ['api', 'endpoint', 'rest', 'route'])) {
    return decomposeApiTask(task);
  }

  if (containsAny(fullText, ['component', 'ui', 'interface', 'view'])) {
    return decomposeUITask(task);
  }

  if (containsAny(fullText, ['database', 'db', 'schema', 'model'])) {
    return decomposeDatabaseTask(task);
  }

  if (containsAny(fullText, ['form', 'input', 'validation'])) {
    return decomposeFormTask(task);
  }

  // Default decomposition for generic complex tasks
  return decomposeGenericTask(task, analysis.complexity);
}

/**
 * Decompose authentication-related tasks
 */
function decomposeAuthTask(task: Task): SubtaskDefinition[] {
  return [
    {
      title: 'Research and select authentication library',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Design user database schema',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Implement login API endpoint',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
    {
      title: 'Implement signup/register API endpoint',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
    {
      title: 'Create login UI form',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add form validation and error handling',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add authentication tests',
      priority: 'LOW',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
  ];
}

/**
 * Decompose API-related tasks
 */
function decomposeApiTask(task: Task): SubtaskDefinition[] {
  return [
    {
      title: 'Define API endpoint structure and routes',
      priority: 'HIGH',
      assignTo: 'planning',
      estimatedComplexity: 2,
    },
    {
      title: 'Implement API route handlers',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
    {
      title: 'Add request validation',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Implement error handling',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add API documentation',
      priority: 'LOW',
      assignTo: 'implementation',
      estimatedComplexity: 1,
    },
  ];
}

/**
 * Decompose UI component tasks
 */
function decomposeUITask(task: Task): SubtaskDefinition[] {
  return [
    {
      title: 'Design component structure and props',
      priority: 'HIGH',
      assignTo: 'planning',
      estimatedComplexity: 2,
    },
    {
      title: 'Create base component markup',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add styling with Tailwind CSS',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add interactivity and state management',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
    {
      title: 'Test component in different scenarios',
      priority: 'LOW',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
  ];
}

/**
 * Decompose database-related tasks
 */
function decomposeDatabaseTask(task: Task): SubtaskDefinition[] {
  return [
    {
      title: 'Design database schema',
      priority: 'HIGH',
      assignTo: 'planning',
      estimatedComplexity: 3,
    },
    {
      title: 'Create database migration/setup script',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Implement database access functions',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 3,
    },
    {
      title: 'Add database error handling',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
  ];
}

/**
 * Decompose form-related tasks
 */
function decomposeFormTask(task: Task): SubtaskDefinition[] {
  return [
    {
      title: 'Define form fields and structure',
      priority: 'HIGH',
      assignTo: 'planning',
      estimatedComplexity: 1,
    },
    {
      title: 'Create form component with inputs',
      priority: 'HIGH',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add validation rules',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Implement form submission handler',
      priority: 'MEDIUM',
      assignTo: 'implementation',
      estimatedComplexity: 2,
    },
    {
      title: 'Add error messages and feedback',
      priority: 'LOW',
      assignTo: 'implementation',
      estimatedComplexity: 1,
    },
  ];
}

/**
 * Generic decomposition based on complexity
 */
function decomposeGenericTask(task: Task, complexity: number): SubtaskDefinition[] {
  const baseTitle = task.title;
  
  if (complexity >= 4) {
    // Very complex - break into planning and implementation phases
    return [
      {
        title: `Research and plan: ${baseTitle}`,
        priority: 'HIGH',
        assignTo: 'planning',
        estimatedComplexity: 2,
      },
      {
        title: `Design architecture for: ${baseTitle}`,
        priority: 'HIGH',
        assignTo: 'planning',
        estimatedComplexity: 3,
      },
      {
        title: `Implement core functionality: ${baseTitle}`,
        priority: 'MEDIUM',
        assignTo: 'implementation',
        estimatedComplexity: 4,
      },
      {
        title: `Add error handling and edge cases`,
        priority: 'MEDIUM',
        assignTo: 'implementation',
        estimatedComplexity: 2,
      },
      {
        title: `Test and document: ${baseTitle}`,
        priority: 'LOW',
        assignTo: 'implementation',
        estimatedComplexity: 2,
      },
    ];
  } else {
    // Moderately complex - simpler breakdown
    return [
      {
        title: `Plan approach for: ${baseTitle}`,
        priority: 'HIGH',
        assignTo: 'planning',
        estimatedComplexity: 1,
      },
      {
        title: `Implement: ${baseTitle}`,
        priority: 'HIGH',
        assignTo: 'implementation',
        estimatedComplexity: complexity,
      },
      {
        title: `Test: ${baseTitle}`,
        priority: 'MEDIUM',
        assignTo: 'implementation',
        estimatedComplexity: 1,
      },
    ];
  }
}

/**
 * Determines optimal priority for subtasks
 */
export function optimizeSubtaskPriorities(subtasks: SubtaskDefinition[]): SubtaskDefinition[] {
  // Ensure first few tasks are HIGH priority for immediate action
  return subtasks.map((subtask, index) => {
    if (index < 2) {
      return { ...subtask, priority: 'HIGH' as TaskPriority };
    }
    return subtask;
  });
}
