import { describe, it, expect } from 'vitest';
import { calculateRealityScore } from '../reality.js';

describe('calculateRealityScore', () => {
  it('returns high score for full-time serial entrepreneur with large budget', () => {
    const score = calculateRealityScore({
      experience: 'Serial entrepreneur',
      time: 'Full-time',
      budget: 'More',
    });
    expect(score).toBe(90);
  });

  it('returns moderate score for currently running one full-time', () => {
    const score = calculateRealityScore({
      experience: 'Currently running one',
      time: 'Full-time',
      budget: 'Under $1000',
    });
    expect(score).toBe(80);
  });

  it('returns lower score for part-time first-timer', () => {
    const score = calculateRealityScore({
      experience: 'Tried before',
      time: '1–2 hrs/day',
      budget: 'Under $1000',
    });
    expect(score).toBe(65);
  });

  it('returns baseline score when no answers provided', () => {
    const score = calculateRealityScore({});
    expect(score).toBe(50);
  });

  it('handles undefined values gracefully', () => {
    const score = calculateRealityScore({ experience: undefined, time: undefined, budget: undefined });
    expect(score).toBe(50);
  });

  it('handles null values gracefully', () => {
    const score = calculateRealityScore({ experience: null, time: null, budget: null });
    expect(score).toBe(50);
  });

  it('clamps minimum score to 10', () => {
    const score = calculateRealityScore({});
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it('clamps maximum score to 98', () => {
    const highScore = calculateRealityScore({
      experience: 'Serial entrepreneur',
      time: 'Full-time',
      budget: 'More',
    });
    expect(highScore).toBeLessThanOrEqual(98);
  });
});
