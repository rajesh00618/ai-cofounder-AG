import { describe, it, expect } from 'vitest';
import { generateExecutionPlan, executeStep } from '../execution.js';

describe('generateExecutionPlan', () => {
  it('is a function', () => {
    expect(typeof generateExecutionPlan).toBe('function');
  });

  it('expects apiKey and task parameters', () => {
    expect(generateExecutionPlan.length).toBe(2);
  });
});

describe('executeStep', () => {
  it('is a function', () => {
    expect(typeof executeStep).toBe('function');
  });

  it('expects apiKey, stepId, and task parameters', () => {
    expect(executeStep.length).toBe(3);
  });

  it('returns an error message when not using real API key', async () => {
    const result = await executeStep('fake-key', 'step-1', { title: 'Test task' });
    expect(result).toHaveProperty('output');
    expect(typeof result.output).toBe('string');
  });
});
