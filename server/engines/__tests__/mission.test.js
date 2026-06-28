import { describe, it, expect } from 'vitest';
import { generateMission, generateHealthAnalysis } from '../mission.js';

describe('generateMission', () => {
  it('is a function', () => {
    expect(typeof generateMission).toBe('function');
  });

  it('has 4 parameters', () => {
    expect(generateMission.length).toBe(4);
  });
});

describe('generateHealthAnalysis', () => {
  it('is a function', () => {
    expect(typeof generateHealthAnalysis).toBe('function');
  });

  it('has 3 parameters', () => {
    expect(generateHealthAnalysis.length).toBe(3);
  });
});
