import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      executiveSummary: 'Test summary',
      problem: 'Test problem',
      solution: 'Test solution',
      targetCustomer: 'Test customer',
      marketSize: '$1B TAM',
      usp: 'Test USP',
      competitors: 'None',
      revenueModel: 'Subscription',
      risks: ['risk 1'],
      gtmPlan: 'Online',
      validationPlan: 'Survey',
      mvpPlan: 'Landing page',
      roadmap: { q1: 'Build', q2: 'Launch', q3: 'Grow', q4: 'Scale' },
      financials: { monthlyBurn: '$5k', breakeven: 'Month 6', projectedMRR: '$10k' },
      successMetrics: ['metric 1'],
    }))),
  };
});

import { generateBlueprint, generateBlueprintTasks, generateScores } from '../business.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateBlueprint', () => {
  it('returns a blueprint with all expected keys', async () => {
    const answers = { 1: 'Developers', 2: 'No tool for X', 3: 'Manual process', 4: '$29/mo', 5: 'AI-native' };
    const profile = { name: 'Test Founder', experienceLevel: 'First-time', teamStatus: 'Solo', timeAvailable: 'Full-time' };
    const result = await generateBlueprint('test-key', answers, profile);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('executiveSummary');
    expect(result).toHaveProperty('problem');
    expect(result).toHaveProperty('solution');
    expect(result).toHaveProperty('targetCustomer');
    expect(result).toHaveProperty('marketSize');
    expect(result).toHaveProperty('revenueModel');
    expect(result).toHaveProperty('risks');
    expect(Array.isArray(result.risks)).toBe(true);
  });

  it('calls callOpenAI with the api key and founder profile', async () => {
    await generateBlueprint('custom-key', { 1: 'a' }, { name: 'Alice' });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Alice'), 0.3);
  });

  it('handles empty answers gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      executiveSummary: 'Fallback summary',
      problem: '',
      solution: '',
      targetCustomer: '',
      marketSize: '',
      usp: '',
      competitors: '',
      revenueModel: '',
      risks: [],
      gtmPlan: '',
      validationPlan: '',
      mvpPlan: '',
      roadmap: { q1: '', q2: '', q3: '', q4: '' },
      financials: { monthlyBurn: '', breakeven: '', projectedMRR: '' },
      successMetrics: [],
    }));

    const result = await generateBlueprint('test-key', {}, null);
    expect(result.executiveSummary).toBe('Fallback summary');
  });
});

describe('generateBlueprintTasks', () => {
  it('returns an array of tasks', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify([
      { title: 'Task 1', priority: 'high', estimatedTime: '2 hrs', aiAssistance: 'AI-powered' },
    ]));

    const tasks = await generateBlueprintTasks('test-key', { 1: 'test' }, { executiveSummary: 'test' });
    expect(Array.isArray(tasks)).toBe(true);
    if (tasks.length > 0) {
      expect(tasks[0]).toHaveProperty('title');
      expect(tasks[0]).toHaveProperty('priority');
    }
  });

  it('returns empty array when AI returns non-array', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({ notAnArray: true }));
    const tasks = await generateBlueprintTasks('test-key', {}, null);
    expect(tasks).toEqual([]);
  });

  it('provides default values for missing task fields', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify([
      { title: 'Minimal task' },
    ]));
    const tasks = await generateBlueprintTasks('test-key', {}, {});
    expect(tasks[0].priority).toBe('medium');
    expect(tasks[0].estimatedTime).toBe('1 hr');
    expect(tasks[0].aiAssistance).toBe('AI-assisted');
  });

  it('handles AIAssistance vs aiAssistance casing', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify([
      { title: 'Task', priority: 'high', estimatedTime: '2 hrs', AIAssistance: 'AI-powered' },
    ]));
    const tasks = await generateBlueprintTasks('test-key', {}, {});
    expect(tasks[0].aiAssistance).toBe('AI-powered');
  });

  it('handles empty AI response gracefully', async () => {
    callOpenAI.mockResolvedValue('');
    await expect(generateBlueprintTasks('test-key', {}, {})).resolves.toEqual([]);
  });

  it('handles malformed AI response gracefully', async () => {
    callOpenAI.mockResolvedValue('not json');
    await expect(generateBlueprintTasks('test-key', {}, {})).resolves.toEqual([]);
  });
});

describe('generateScores', () => {
  it('returns an object with businessHealth and startupScore', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      businessHealth: { idea: 60, validation: 40, product: 30, marketing: 20, sales: 10, finance: 50 },
      startupScore: { execution: 55, business: 45, customers: 35, product: 40, cash: 25, aiConfidence: 70 },
    }));

    const result = await generateScores('test-key', {}, {}, {});
    expect(result).toHaveProperty('businessHealth');
    expect(result).toHaveProperty('startupScore');
    expect(result.businessHealth).toHaveProperty('idea');
    expect(result.startupScore).toHaveProperty('execution');
  });

  it('handles missing founder profile', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      businessHealth: { idea: 50, validation: 50, product: 50, marketing: 50, sales: 50, finance: 50 },
      startupScore: { execution: 50, business: 50, customers: 50, product: 50, cash: 50, aiConfidence: 50 },
    }));

    const result = await generateScores('test-key', {}, null, null);
    expect(result.businessHealth.idea).toBe(50);
  });
});
