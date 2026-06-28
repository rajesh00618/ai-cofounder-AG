import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      stages: [
        { quarter: 'Q1', label: 'Validation', goals: ['Find 10 early adopters'], tasks: [{ title: 'Customer interviews', priority: 'high', estimatedTime: '2 hrs' }] },
        { quarter: 'Q2', label: 'Build', goals: ['Ship MVP'], tasks: [{ title: 'Build core features', priority: 'high', estimatedTime: '40 hrs' }] },
        { quarter: 'Q3', label: 'Launch', goals: ['Public launch'], tasks: [{ title: 'Marketing campaign', priority: 'medium', estimatedTime: '20 hrs' }] },
        { quarter: 'Q4', label: 'Scale', goals: ['Reach 1000 users'], tasks: [{ title: 'Scale infrastructure', priority: 'medium', estimatedTime: '30 hrs' }] },
      ],
      guidance: 'Focus on customer discovery before building.',
    }))),
  };
});

import { generateRoadmap, generateStageGuidance } from '../roadmap.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateRoadmap', () => {
  it('returns roadmap with stages and guidance', async () => {
    const result = await generateRoadmap('test-key', { executiveSummary: 'AI SaaS', problem: 'Manual accounting' });
    expect(result).toHaveProperty('stages');
    expect(result).toHaveProperty('guidance');
    expect(Array.isArray(result.stages)).toBe(true);
    expect(result.stages.length).toBeGreaterThanOrEqual(1);
    expect(result.stages[0]).toHaveProperty('quarter');
    expect(result.stages[0]).toHaveProperty('label');
    expect(result.stages[0]).toHaveProperty('goals');
  });

  it('calls callOpenAI with blueprint data', async () => {
    await generateRoadmap('custom-key', { executiveSummary: 'Healthcare SaaS' });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Healthcare SaaS'), 0.3);
  });

  it('handles empty blueprint gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({ stages: [], guidance: '' }));
    const result = await generateRoadmap('test-key', null);
    expect(result.stages).toEqual([]);
  });
});

describe('generateStageGuidance', () => {
  it('returns guidance with advice, nextStep, and focus', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      advice: 'Focus on product-market fit by talking to 10 customers',
      nextStep: 'Schedule 5 customer interviews this week',
      focus: 'Customer discovery',
    }));
    const result = await generateStageGuidance('test-key', 'ideation', { idea: 60, validation: 30 }, { Execution: 70 });
    expect(result).toHaveProperty('advice');
    expect(result).toHaveProperty('nextStep');
    expect(result).toHaveProperty('focus');
  });

  it('calls callOpenAI with stage, health, and dnaScores', async () => {
    await generateStageGuidance('custom-key', 'growth', { marketing: 80 }, { Leadership: 90 });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('growth'), 0.4);
  });

  it('handles missing data gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      advice: 'Focus on product-market fit',
      nextStep: 'Interview customers',
      focus: 'Customer discovery',
    }));
    const result = await generateStageGuidance('test-key', null, null, null);
    expect(result.advice).toBeTruthy();
    expect(result.nextStep).toBeTruthy();
  });
});
