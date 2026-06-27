import { describe, it, expect } from 'vitest';
import * as dna from '../dna.js';

describe('DNA Engine', () => {
  it('exports analyzeDNA function', () => {
    expect(dna.analyzeDNA).toBeDefined();
    expect(typeof dna.analyzeDNA).toBe('function');
  });

  it('exports generateAdaptations function', () => {
    expect(dna.generateAdaptations).toBeDefined();
    expect(typeof dna.generateAdaptations).toBe('function');
  });
});
