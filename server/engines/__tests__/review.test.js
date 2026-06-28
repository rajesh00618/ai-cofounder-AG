import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      note: 'You made good progress today. The customer interview went well. Tomorrow focus on the prototype.',
      adjustedPlan: 'Shift focus from marketing to product development',
      encouragement: 'Keep pushing forward, you are making real progress!',
    }))),
  };
});

import { generateReviewNote, suggestTasks } from '../review.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateReviewNote', () => {
  it('returns review note with adjustedPlan and encouragement', async () => {
    const result = await generateReviewNote('test-key', { mood: 'good', accomplishments: 'Built MVP' }, { name: 'Test' }, [], {});
    expect(result).toHaveProperty('note');
    expect(result).toHaveProperty('adjustedPlan');
    expect(result).toHaveProperty('encouragement');
  });

  it('calls callOpenAI with all parameters', async () => {
    await generateReviewNote('custom-key', { mood: 'tired' }, { name: 'Alice' }, [{ title: 'Task 1' }], { Execution: 50 });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('tired'), 0.4);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Alice'), 0.4);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Task 1'), 0.4);
  });

  it('handles null inputs gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      note: 'Default note',
      adjustedPlan: 'Take a break',
      encouragement: 'You got this',
    }));
    const result = await generateReviewNote('test-key', null, null, null, null);
    expect(result.note).toBe('Default note');
  });
});

describe('suggestTasks', () => {
  it('returns tasks with title, priority, estimatedTime, and aiAssistance', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      tasks: [
        { title: 'Customer interviews', priority: 'high', estimatedTime: '3 hrs', aiAssistance: 'AI-assisted' },
        { title: 'Build landing page', priority: 'medium', estimatedTime: '5 hrs', aiAssistance: 'AI-powered' },
      ],
    }));
    const result = await suggestTasks('test-key', { executiveSummary: 'Test' }, 'ideation', {});
    expect(result).toHaveProperty('tasks');
    expect(Array.isArray(result.tasks)).toBe(true);
    if (result.tasks.length > 0) {
      expect(result.tasks[0]).toHaveProperty('title');
      expect(result.tasks[0]).toHaveProperty('priority');
      expect(result.tasks[0]).toHaveProperty('estimatedTime');
      expect(result.tasks[0]).toHaveProperty('aiAssistance');
    }
  });

  it('calls callOpenAI with the given parameters', async () => {
    await suggestTasks('custom-key', { executiveSummary: 'SaaS' }, 'growth', { Execution: 80 });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('SaaS'), 0.3);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('growth'), 0.3);
  });

  it('handles missing blueprint gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({ tasks: [] }));
    const result = await suggestTasks('test-key', null, 'ideation', {});
    expect(result.tasks).toEqual([]);
  });
});
