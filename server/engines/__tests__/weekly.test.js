import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      weekSummary: 'Productive week with solid progress on MVP development and customer interviews.',
      achievements: ['Completed user authentication flow', 'Interviewed 5 potential customers', 'Revised pricing model'],
      missedGoals: ['Failed to complete onboarding flow', 'Missed target of 10 customer interviews'],
      businessHealthTrend: 'improving',
      executionScore: 72,
      focusAreas: [
        { area: 'Product Development', status: 'on track', recommendation: 'Continue shipping features' },
        { area: 'Customer Discovery', status: 'needs attention', recommendation: 'Double down on outreach' },
      ],
      nextWeekPlan: 'Finish MVP and start beta testing with 3 early adopters',
      grade: 'B',
      coachingNote: 'Your execution is solid but customer discovery needs more focus. Delegate tasks to free up time.',
    }))),
  };
});

import { generateWeeklyReview } from '../weekly.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateWeeklyReview', () => {
  it('returns review with weekSummary, achievements, and execution score', async () => {
    const result = await generateWeeklyReview('test-key', {}, [], {}, {}, {});
    expect(result).toHaveProperty('weekSummary');
    expect(result).toHaveProperty('achievements');
    expect(result).toHaveProperty('missedGoals');
    expect(result).toHaveProperty('businessHealthTrend');
    expect(result).toHaveProperty('executionScore');
    expect(result).toHaveProperty('focusAreas');
    expect(result).toHaveProperty('nextWeekPlan');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('coachingNote');
    expect(Array.isArray(result.achievements)).toBe(true);
    expect(typeof result.weekSummary).toBe('string');
  });

  it('calls callOpenAI with the apiKey', async () => {
    await generateWeeklyReview('custom-key', { name: 'John' }, [], {}, {}, {});
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.any(String), 0.3);
  });

  it('handles null inputs gracefully', async () => {
    const result = await generateWeeklyReview('test-key', null, null, null, null, null);
    expect(result).toHaveProperty('weekSummary');
    expect(result).toHaveProperty('achievements');
    expect(result).toHaveProperty('executionScore');
  });

  it('handles empty profile and tasks gracefully', async () => {
    const result = await generateWeeklyReview('test-key', {}, [], {}, {}, {});
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('coachingNote');
  });

  it('validates executionScore is a number', async () => {
    const result = await generateWeeklyReview('test-key', {}, [], {}, {}, {});
    expect(typeof result.executionScore).toBe('number');
  });
});
