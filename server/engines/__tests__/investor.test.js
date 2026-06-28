import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      verdict: 'would invest',
      strengths: ['Strong founding team with domain expertise', 'Large addressable market ($10B+)'],
      weaknesses: ['No revenue yet', 'High customer acquisition cost', 'Undifferentiated product'],
      hardQuestions: ['What is your unit economics?', 'How do you acquire customers at scale?'],
      estimatedValuation: '$5-10M',
      pitchRating: 'B',
      failureProbability: 40,
      recommendation: 'Focus on getting first 100 paying customers before raising',
    }))),
  };
});

import { evaluateAsInvestor, chatAsInvestor } from '../investor.js';
import { callOpenAI } from '../../services/ai.js';

describe('evaluateAsInvestor', () => {
  it('returns evaluation with verdict, strengths, and weaknesses', async () => {
    const result = await evaluateAsInvestor('test-key', {
      name: 'TestCo',
      stage: 'Pre-seed',
      market: 'AI SaaS',
    });
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('weaknesses');
    expect(result).toHaveProperty('hardQuestions');
    expect(result).toHaveProperty('estimatedValuation');
    expect(result).toHaveProperty('pitchRating');
    expect(result).toHaveProperty('failureProbability');
    expect(result).toHaveProperty('recommendation');
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(result.strengths.length).toBeGreaterThanOrEqual(1);
  });

  it('calls callOpenAI with the apiKey and business context', async () => {
    await evaluateAsInvestor('custom-key', { name: 'StartupXYZ' });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('StartupXYZ'), 0.3);
  });

  it('handles empty business context gracefully', async () => {
    const result = await evaluateAsInvestor('test-key', {});
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('strengths');
  });

  it('handles null business context gracefully', async () => {
    const result = await evaluateAsInvestor('test-key', null);
    expect(result).toHaveProperty('verdict');
  });
});

describe('chatAsInvestor', () => {
  it('returns chat response as a string', async () => {
    const result = await chatAsInvestor('test-key', {}, 'We are building AI for doctors');
    expect(typeof result).toBe('string');
  });

  it('calls callOpenAI with the apiKey, context, and message', async () => {
    await chatAsInvestor('test-key', { name: 'HealthAI' }, 'We have 10 pilot customers');
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('HealthAI'), 0.5);
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('pilot customers'), 0.5);
  });

  it('handles null context gracefully', async () => {
    const result = await chatAsInvestor('test-key', null, 'Hello');
    expect(typeof result).toBe('string');
  });
});
