import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      question: 'Test question',
      scenarios: [
        { label: 'Option A', timeline: '6 months', success: 80, risk: 'Low' },
        { label: 'Option B', timeline: '3 months', success: 60, risk: 'Medium' },
        { label: 'Option C', timeline: '1 month', success: 40, risk: 'High' },
      ],
      recommendation: 'Option A',
      failureRisk: 20,
      virtualCustomers: 1000,
      conversion: '3.5%',
      projectedRevenue: '$50K/mo',
      complaints: ['Too slow', 'Expensive'],
      retention: '85%',
      persona: { name: 'Test Persona', budget: 'Moderate' },
      reaction: 'As a Test Persona, I like this product.',
      objections: ['Price is too high'],
    }))),
  };
});

import { runDecisionSimulation, runCompanySimulation, simulateCustomerReaction } from '../simulation.js';
import { callOpenAI } from '../../services/ai.js';

describe('runDecisionSimulation', () => {
  it('returns simulation with scenarios and recommendation', async () => {
    const result = await runDecisionSimulation('test-key', 'Should we raise prices?');
    expect(result).toHaveProperty('scenarios');
    expect(result).toHaveProperty('recommendation');
    expect(result).toHaveProperty('failureRisk');
    expect(Array.isArray(result.scenarios)).toBe(true);
    expect(result.scenarios.length).toBeGreaterThanOrEqual(1);
  });

  it('calls callOpenAI with the question', async () => {
    await runDecisionSimulation('custom-key', 'Hire more engineers?');
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('Hire more engineers?'), 0.7);
  });

  it('handles edge cases with empty question gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      scenarios: [],
      recommendation: 'No recommendation',
      failureRisk: 50,
    }));

    const result = await runDecisionSimulation('test-key', '');
    expect(result.scenarios).toEqual([]);
  });
});

describe('runCompanySimulation', () => {
  it('returns company simulation with virtual customers and revenue', async () => {
    const result = await runCompanySimulation('test-key', 'Launch new feature?');
    expect(result).toHaveProperty('virtualCustomers');
    expect(result).toHaveProperty('conversion');
    expect(result).toHaveProperty('projectedRevenue');
    expect(result).toHaveProperty('retention');
    expect(result).toHaveProperty('recommendation');
  });

  it('calls callOpenAI with the question', async () => {
    await runCompanySimulation('test-key', 'Expand to new market?');
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('Expand to new market?'), 0.5);
  });

  it('handles null question gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      virtualCustomers: 0,
      conversion: '0%',
      projectedRevenue: '$0',
      retention: '0%',
      recommendation: 'N/A',
    }));

    const result = await runCompanySimulation('test-key', null);
    expect(result.virtualCustomers).toBe(0);
  });
});

describe('simulateCustomerReaction', () => {
  it('returns persona and reaction for a product', async () => {
    const result = await simulateCustomerReaction('test-key', 'AI Dashboard', 'CTO');
    expect(result).toHaveProperty('persona');
    expect(result).toHaveProperty('reaction');
    expect(result).toHaveProperty('objections');
    expect(Array.isArray(result.objections)).toBe(true);
  });

  it('calls callOpenAI with product and persona', async () => {
    await simulateCustomerReaction('test-key', 'SaaS Tool', 'developer');
    expect(callOpenAI).toHaveBeenCalledWith('test-key', expect.any(String), expect.stringContaining('SaaS Tool'), 0.7);
  });

  it('handles missing persona by defaulting to customer', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      persona: { name: 'Customer', budget: 'Unknown' },
      reaction: 'Looks interesting.',
      objections: [],
    }));

    const result = await simulateCustomerReaction('test-key', 'New product', undefined);
    expect(result.persona.name).toBe('Customer');
  });
});
