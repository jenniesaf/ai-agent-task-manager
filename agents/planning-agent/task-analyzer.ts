// Task Analyzer - Examines tasks to understand intent and complexity

import { Task, TaskAnalysis, TaskPriority } from '@/lib/types';
import { containsAny, extractKeywords } from '@/lib/utils';

// Keyword detection for task classification
const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'critical', 'asap', 'blocker', 'important', 'emergency', 'fix', 'bug', 'broken'
];

const LOW_PRIORITY_KEYWORDS = [
  'maybe', 'someday', 'nice to have', 'optional', 'consider', 'think about'
];

const COMPLEXITY_KEYWORDS = {
  high: ['build', 'create', 'implement', 'system', 'architecture', 'integration', 'authentication', 'database'],
  medium: ['add', 'update', 'modify', 'refactor', 'improve', 'enhance'],
  low: ['fix typo', 'update text', 'change color', 'rename']
};

const TASK_TYPES = {
  coding: ['code', 'function', 'component', 'api', 'endpoint', 'class', 'method'],
  design: ['design', 'ui', 'ux', 'layout', 'style', 'theme'],
  documentation: ['document', 'readme', 'docs', 'comment', 'explain'],
  testing: ['test', 'testing', 'unit test', 'integration test'],
  deployment: ['deploy', 'deployment', 'production', 'release'],
};

/**
 * Analyzes a task to understand its characteristics
 */
export function analyzeTask(task: Task): TaskAnalysis {
  const fullText = `${task.title} ${task.description || ''}`.toLowerCase();
  
  // Detect task type
  let taskType = 'general';
  for (const [type, keywords] of Object.entries(TASK_TYPES)) {
    if (containsAny(fullText, keywords)) {
      taskType = type;
      break;
    }
  }

  // Determine complexity (1-5 scale)
  let complexity = 2; // default medium-low
  if (containsAny(fullText, COMPLEXITY_KEYWORDS.high)) {
    complexity = 4;
  } else if (containsAny(fullText, COMPLEXITY_KEYWORDS.medium)) {
    complexity = 3;
  } else if (containsAny(fullText, COMPLEXITY_KEYWORDS.low)) {
    complexity = 1;
  }

  // Longer descriptions suggest higher complexity
  if (task.description && task.description.length > 200) {
    complexity = Math.min(5, complexity + 1);
  }

  // Detect priority keywords
  let suggestedPriority: TaskPriority = 'MEDIUM';
  if (containsAny(fullText, HIGH_PRIORITY_KEYWORDS)) {
    suggestedPriority = 'HIGH';
  } else if (containsAny(fullText, LOW_PRIORITY_KEYWORDS)) {
    suggestedPriority = 'LOW';
  }

  // Extract all detected keywords
  const allKeywords = [
    ...HIGH_PRIORITY_KEYWORDS,
    ...LOW_PRIORITY_KEYWORDS,
    ...COMPLEXITY_KEYWORDS.high,
    ...COMPLEXITY_KEYWORDS.medium,
    ...COMPLEXITY_KEYWORDS.low,
  ];
  const detectedKeywords = extractKeywords(fullText, allKeywords);

  // Check if task requires decomposition
  const requiresDecomposition = 
    complexity >= 4 || 
    fullText.length > 150 ||
    containsAny(fullText, ['build', 'create', 'implement', 'system']);

  // Check if task is too vague
  const requiresUserInput = 
    task.title.length < 10 ||
    containsAny(fullText, ['something', 'thing', 'stuff', 'improve']) ||
    fullText.split(' ').length < 3;

  return {
    taskId: task.id,
    taskType,
    complexity,
    detectedKeywords,
    suggestedPriority,
    requiresDecomposition,
    requiresUserInput,
  };
}

/**
 * Determines if a task description is clear enough
 */
export function isTaskClear(task: Task): boolean {
  const analysis = analyzeTask(task);
  return !analysis.requiresUserInput;
}

/**
 * Determines if a task should be broken down
 */
export function shouldDecompose(task: Task): boolean {
  const analysis = analyzeTask(task);
  return analysis.requiresDecomposition;
}
