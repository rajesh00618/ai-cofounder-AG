import { describe, it, expect } from 'vitest';
import { generateRoadmap, generateStageGuidance } from '../roadmap.js';

describe('generateRoadmap', () => {
  it('is a function', () => {
    expect(typeof generateRoadmap).toBe('function');
  });

  it('has 2 parameters', () => {
    expect(generateRoadmap.length).toBe(2);
  });
});

describe('generateStageGuidance', () => {
  it('is a function', () => {
    expect(typeof generateStageGuidance).toBe('function');
  });

  it('has 4 parameters', () => {
    expect(generateStageGuidance.length).toBe(4);
  });
});
