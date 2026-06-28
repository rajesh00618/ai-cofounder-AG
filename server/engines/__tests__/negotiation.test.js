import { describe, it, expect } from 'vitest';
import { negotiateGoal } from '../negotiation.js';

describe('negotiateGoal', () => {
  it('is a function', () => {
    expect(typeof negotiateGoal).toBe('function');
  });

  it('expects apiKey and goal parameters', () => {
    expect(negotiateGoal.length).toBe(2);
  });
});
