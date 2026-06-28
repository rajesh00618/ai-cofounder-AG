import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      alternatives: [
        { title: 'Alternative 1', probability: 'high', why: 'More achievable' },
        { title: 'Alternative 2', probability: 'medium', why: 'Better market fit' },
        { title: 'Alternative 3', probability: 'low', why: 'Less risky' },
      ],
    }))),
  };
});

import { negotiateGoal } from '../negotiation.js';
import { callOpenAI } from '../../services/ai.js';

describe('negotiateGoal', () => {
  it('returns alternatives with probabilities and reasons', async () => {
    const result = await negotiateGoal('test-key', 'Build a unicorn in 3 months');
    expect(result).toHaveProperty('alternatives');
    expect(Array.isArray(result.alternatives)).toBe(true);
    expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
    expect(result.alternatives[0]).toHaveProperty('title');
    expect(result.alternatives[0]).toHaveProperty('probability');
    expect(result.alternatives[0]).toHaveProperty('why');
  });

  it('calls callOpenAI with the apiKey and goal', async () => {
    await negotiateGoal('custom-key', 'Launch in 2 weeks');
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Launch in 2 weeks'), 0.6);
  });

  it('handles empty goal gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({ alternatives: [] }));
    const result = await negotiateGoal('test-key', '');
    expect(result.alternatives).toEqual([]);
  });

  it('handles null goal gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({ alternatives: [] }));
    const result = await negotiateGoal('test-key', null);
    expect(result.alternatives).toEqual([]);
  });
});
