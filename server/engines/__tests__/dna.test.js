import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      riskTolerance: 70,
      executionFocus: 65,
      innovationBias: 80,
      collaborationStyle: 'independent',
      decisionSpeed: 'fast',
      resilience: 75,
      learningOrientation: 90,
      DetailOrientation: 60,
      leadershipStyle: 'visionary',
      communicationStyle: 'direct'
    })))
  };
});

import { analyzeDNA, generateAdaptations } from '../dna.js';
import { callOpenAI } from '../../services/ai.js';

describe('analyzeDNA', () => {
  it('returns an object with the expected keys', async () => {
    const mockProfile = { name: 'Test Founder', experienceLevel: 'First startup' };
    const result = await analyzeDNA('fake-api-key', mockProfile);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('riskTolerance');
    expect(result).toHaveProperty('executionFocus');
    expect(result).toHaveProperty('innovationBias');
    expect(result).toHaveProperty('collaborationStyle');
    expect(result).toHaveProperty('decisionSpeed');
    expect(result).toHaveProperty('resilience');
    expect(result).toHaveProperty('learningOrientation');
    expect(result).toHaveProperty('DetailOrientation');
    expect(result).toHaveProperty('leadershipStyle');
    expect(result).toHaveProperty('communicationStyle');
  });

  it('calls callOpenAI with the API key and profile', async () => {
    const mockProfile = { name: 'Test Founder' };
    await analyzeDNA('test-key', mockProfile);

    expect(callOpenAI).toHaveBeenCalled();
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('Test Founder'), 0.3);
  });

  it('handles edge cases like empty profile gracefully', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      riskTolerance: 50,
      executionFocus: 50,
      innovationBias: 50,
      collaborationStyle: 'balanced',
      decisionSpeed: 'moderate',
      resilience: 50,
      learningOrientation: 50,
      DetailOrientation: 50,
      leadershipStyle: 'balanced',
      communicationStyle: 'direct'
    }));

    const result = await analyzeDNA('test-key', {});
    expect(result.riskTolerance).toBe(50);
  });
});

describe('generateAdaptations', () => {
  it('returns adaptations in the correct format', async () => {
    const mockScores = { 'Decision-making': 50, 'Execution': 50 };
    const mockTwin = { thinkStyle: 'analytical' };
    const mockActivity = { lastAction: 'test' };

    callOpenAI.mockResolvedValue(JSON.stringify({
      adaptations: [
        { weakness: 'Test weakness', action: 'Test action', priority: 'high' }
      ]
    }));

    const result = await generateAdaptations('test-key', mockScores, mockTwin, mockActivity);

    expect(result).toHaveProperty('adaptations');
    expect(Array.isArray(result.adaptations)).toBe(true);
    expect(result.adaptations[0]).toHaveProperty('weakness');
    expect(result.adaptations[0]).toHaveProperty('action');
    expect(result.adaptations[0]).toHaveProperty('priority');
  });

  it('handles missing recentActivity', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      adaptations: []
    }));

    const result = await generateAdaptations('test-key', {}, {});
    expect(result.adaptations).toEqual([]);
  });
});
