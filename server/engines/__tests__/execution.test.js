import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      task: 'Build landing page',
      plan: {
        estimatedTime: '~2 hours',
        steps: [
          { id: 1, label: 'Design mockup', duration: '30min', type: 'generate' },
          { id: 2, label: 'Write HTML', duration: '1hr', type: 'generate' },
          { id: 3, label: 'Review output', duration: '30min', type: 'review' },
        ],
      },
    }))),
  };
});

import { generateExecutionPlan, executeStep } from '../execution.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateExecutionPlan', () => {
  it('returns execution plan with steps', async () => {
    const result = await generateExecutionPlan('test-key', { title: 'Build landing page' });
    expect(result).toHaveProperty('task');
    expect(result).toHaveProperty('plan');
    expect(result.plan).toHaveProperty('steps');
    expect(Array.isArray(result.plan.steps)).toBe(true);
    expect(result.plan.steps.length).toBeGreaterThanOrEqual(1);
  });

  it('calls callOpenAI with the apiKey and task', async () => {
    await generateExecutionPlan('custom-key', { title: 'Test task' });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Test task'), 0.3);
  });

  it('handles empty task gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      task: '',
      plan: { estimatedTime: '~0', steps: [] },
    }));
    const result = await generateExecutionPlan('test-key', {});
    expect(result.plan.steps).toEqual([]);
  });
});

describe('executeStep', () => {
  it('returns generated output from AI', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      files: [
        { filename: 'index.html', content: '<h1>Hello</h1>', language: 'html' },
      ],
      instructions: 'Open index.html in a browser.',
    }));
    const result = await executeStep('test-key', 'step-1', { title: 'Build HTML' });
    expect(result).toHaveProperty('output');
    expect(typeof result.output).toBe('string');
  });

  it('throws when AI call fails', async () => {
    callOpenAI.mockRejectedValue(new Error('API error'));
    await expect(executeStep('test-key', 'step-1', { title: 'Test' })).rejects.toThrow('API error');
  });

  it('handles empty files array from AI', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      files: [],
      instructions: '',
    }));
    const result = await executeStep('test-key', 'step-1', { title: 'Empty task' });
    expect(result.output).toContain('No files were generated');
  });
});
