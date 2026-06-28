import { describe, it, expect } from 'vitest';
import { generateReviewNote, suggestTasks } from '../review.js';

describe('generateReviewNote', () => {
  it('is a function', () => {
    expect(typeof generateReviewNote).toBe('function');
  });

  it('has 5 parameters (apiKey, review, profile, tasks, dnaScores)', () => {
    expect(generateReviewNote.length).toBe(5);
  });
});

describe('suggestTasks', () => {
  it('is a function', () => {
    expect(typeof suggestTasks).toBe('function');
  });

  it('has 4 parameters', () => {
    expect(suggestTasks.length).toBe(4);
  });
});
