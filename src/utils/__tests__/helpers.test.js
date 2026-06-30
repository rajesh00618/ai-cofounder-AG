import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-uuid-abc');
});

import { generateId, formatDate, formatTime, clamp, randomBetween, truncateText, calculateOverallScore, getScoreColor, getScoreLabel, getGreeting } from '../helpers.js';

describe('generateId', () => {
  it('returns a string from crypto.randomUUID', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id).toBe('fixed-uuid-abc');
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-06-15');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles timestamp numbers', () => {
    const result = formatDate(1718467200000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  it('formats a date into time string', () => {
    const date = new Date(2024, 0, 1, 14, 30, 0);
    const result = formatTime(date);
    expect(result).toContain('02');
    expect(result).toContain('30');
  });
});

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
  });
});

describe('randomBetween', () => {
  it('returns a number within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomBetween(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('returns an integer', () => {
    const val = randomBetween(1, 100);
    expect(Number.isInteger(val)).toBe(true);
  });
});

describe('truncateText', () => {
  it('returns text unchanged when under max length', () => {
    expect(truncateText('Hello', 100)).toBe('Hello');
  });

  it('truncates and appends ellipsis when over max length', () => {
    const result = truncateText('This is a long text that should be truncated', 10);
    expect(result).toBe('This is a ...');
    expect(result.length).toBe(13);
  });

  it('uses default max length of 100', () => {
    const short = 'Short text';
    expect(truncateText(short)).toBe(short);
  });
});

describe('calculateOverallScore', () => {
  it('averages numeric values', () => {
    expect(calculateOverallScore({ a: 80, b: 90, c: 70 })).toBe(80);
  });

  it('ignores non-numeric values', () => {
    expect(calculateOverallScore({ a: 80, b: 'high', c: 100 })).toBe(90);
  });

  it('returns 0 for empty object', () => {
    expect(calculateOverallScore({})).toBe(0);
  });
});

describe('getScoreColor', () => {
  it('returns success color for scores >= 80', () => {
    expect(getScoreColor(85)).toContain('success');
  });

  it('returns accent color for scores >= 60', () => {
    expect(getScoreColor(65)).toContain('accent');
  });

  it('returns warning color for scores >= 40', () => {
    expect(getScoreColor(45)).toContain('warning');
  });

  it('returns danger color for scores < 40', () => {
    expect(getScoreColor(20)).toContain('danger');
  });
});

describe('getScoreLabel', () => {
  it('returns Excellent for scores >= 80', () => {
    expect(getScoreLabel(90)).toBe('Excellent');
  });

  it('returns Good for scores >= 60', () => {
    expect(getScoreLabel(65)).toBe('Good');
  });

  it('returns Fair for scores >= 40', () => {
    expect(getScoreLabel(45)).toBe('Fair');
  });

  it('returns Needs Work for scores >= 20', () => {
    expect(getScoreLabel(25)).toBe('Needs Work');
  });

  it('returns Critical for scores < 20', () => {
    expect(getScoreLabel(10)).toBe('Critical');
  });
});

describe('getGreeting', () => {
  it('returns a greeting string', () => {
    const greeting = getGreeting();
    expect(typeof greeting).toBe('string');
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
  });
});
