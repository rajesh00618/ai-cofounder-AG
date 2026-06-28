import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      mission: 'Interview 5 potential customers this week',
      reason: 'Customer discovery is the biggest risk right now',
      estimatedTime: '3 hrs',
      recommendation: 'Focus on talking to users before building more features',
    }))),
  };
});

import { generateMission, generateHealthAnalysis } from '../mission.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateMission', () => {
  it('returns mission with reason, estimatedTime, and recommendation', async () => {
    const result = await generateMission('test-key', { stage: 'Pre-seed' }, [], {});
    expect(result).toHaveProperty('mission');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('estimatedTime');
    expect(result).toHaveProperty('recommendation');
  });

  it('calls callOpenAI with apiKey, businessContext, tasks, and dnaScores', async () => {
    await generateMission('custom-key', { name: 'TestCo' }, [{ title: 'Task 1' }], { Execution: 70 });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('TestCo'), 0.4);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Task 1'), 0.4);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Execution'), 0.4);
  });

  it('handles empty inputs gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      mission: 'Take a break and reflect',
      reason: 'Need to recharge',
      estimatedTime: '1 hr',
      recommendation: 'Rest',
    }));
    const result = await generateMission('test-key', null, null, null);
    expect(result.mission).toBe('Take a break and reflect');
  });
});

describe('generateHealthAnalysis', () => {
  it('returns health analysis with overallHealth, weakSpots, alert, and recommendation', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      overallHealth: 65,
      weakSpots: [{ area: 'Validation', score: 30, recommendation: 'Talk to customers' }],
      alert: '',
      recommendation: 'Focus on customer discovery',
    }));
    const result = await generateHealthAnalysis('test-key', { executiveSummary: 'Test' }, { idea: 60, validation: 40 });
    expect(result).toHaveProperty('overallHealth');
    expect(result).toHaveProperty('weakSpots');
    expect(result).toHaveProperty('alert');
    expect(result).toHaveProperty('recommendation');
    expect(result.overallHealth).toBe(65);
  });

  it('calls callOpenAI with the given data', async () => {
    await generateHealthAnalysis('custom-key', { executiveSummary: 'SaaS' }, { idea: 80 });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('SaaS'), 0.3);
  });

  it('handles null blueprint gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      overallHealth: 50,
      weakSpots: [],
      alert: '',
      recommendation: 'Focus on product.',
    }));
    const result = await generateHealthAnalysis('test-key', null, {});
    expect(result.overallHealth).toBe(50);
  });

  it('sets alert when health score is below 30', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      overallHealth: 25,
      weakSpots: [{ area: 'Cash', score: 15, recommendation: 'Cut burn rate' }],
      alert: 'Cash runway is critically low!',
      recommendation: 'Reduce spending immediately',
    }));
    const result = await generateHealthAnalysis('test-key', {}, { cash: 15 });
    expect(result.alert).toBeTruthy();
  });
});
