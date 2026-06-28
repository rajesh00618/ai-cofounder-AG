import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/ai.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn().mockResolvedValue(JSON.stringify({
      score: 72,
      breakdown: { experience: 80, time: 70, resources: 60, marketFit: 78 },
      reasoning: 'Strong experience with adequate time commitment.'
    })),
  };
});

import { calculateRealityScore } from '../reality.js';

describe('calculateRealityScore', () => {
  it('calls AI and returns score with breakdown', async () => {
    const result = await calculateRealityScore('fake-key', {
      experience: 'Serial entrepreneur',
      time: 'Full-time',
      budget: 'More',
    });
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('reasoning');
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(98);
  });

  it('clamps score to valid range', async () => {
    const result = await calculateRealityScore('fake-key', {});
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(98);
  });
});
