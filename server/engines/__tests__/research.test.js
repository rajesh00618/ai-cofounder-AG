import { describe, it, expect } from 'vitest';
import { getResearch, getOpportunities, getMorningBriefing } from '../research.js';

describe('getResearch', () => {
  it('is a function', () => {
    expect(typeof getResearch).toBe('function');
  });

  it('expects apiKey and businessContext parameters', () => {
    expect(getResearch.length).toBe(2);
  });
});

describe('getOpportunities', () => {
  it('is a function', () => {
    expect(typeof getOpportunities).toBe('function');
  });

  it('expects apiKey and businessContext parameters', () => {
    expect(getOpportunities.length).toBe(2);
  });
});

describe('getMorningBriefing', () => {
  it('is a function', () => {
    expect(typeof getMorningBriefing).toBe('function');
  });

  it('expects apiKey, profile, and businessContext parameters', () => {
    expect(getMorningBriefing.length).toBe(3);
  });
});
