import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      dnaScores: {
        'Decision-making': 70,
        'Execution': 60,
        'Consistency': 80,
        'Learning speed': 50,
        'Leadership': 40,
        'Sales ability': 30,
        'Technical skill': 60,
        'Communication': 75,
        'Focus': 55,
        'Confidence': 65,
      },
      founderTwin: {
        thinkStyle: 'analytical',
        decideStyle: 'balanced',
        learnStyle: 'building',
        workPattern: 'focused',
        failurePattern: 'stall',
        recoveryPattern: 'structured',
      },
      adaptations: [{ weakness: 'Execution', action: 'Set daily goals', priority: 'high' }],
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
    expect(result).toHaveProperty('dnaScores');
    expect(result).toHaveProperty('founderTwin');
    expect(result).toHaveProperty('adaptations');
    expect(result.dnaScores).toHaveProperty('Decision-making');
    expect(result.dnaScores).toHaveProperty('Execution');
    expect(result.founderTwin).toHaveProperty('thinkStyle');
    expect(result.founderTwin).toHaveProperty('decideStyle');
  });

  it('calls callOpenAI with the API key and profile', async () => {
    const mockProfile = { name: 'Test Founder' };
    await analyzeDNA('test-key', mockProfile);

    expect(callOpenAI).toHaveBeenCalled();
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('Test Founder'), 0.3);
  });

  it('handles edge cases like empty profile gracefully', async () => {
    callOpenAI.mockResolvedValue(JSON.stringify({
      dnaScores: { 'Decision-making': 50, 'Execution': 50, 'Consistency': 50, 'Learning speed': 50, 'Leadership': 50, 'Sales ability': 50, 'Technical skill': 50, 'Communication': 50, 'Focus': 50, 'Confidence': 50 },
      founderTwin: { thinkStyle: 'analytical', decideStyle: 'balanced', learnStyle: 'building', workPattern: 'focused', failurePattern: 'stall', recoveryPattern: 'structured' },
      adaptations: [],
    }));

    const result = await analyzeDNA('test-key', {});
    expect(result.dnaScores['Decision-making']).toBe(50);
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
