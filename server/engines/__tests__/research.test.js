import { vi, describe, it, expect } from 'vitest';

const mockSearchResults = {
  query1: [
    { title: 'Market Report', snippet: 'Market is growing 20% YoY', source: 'MarketWatch', date: '3 days ago' },
    { title: 'Competitor News', snippet: 'Competitor launched new feature', source: 'TechCrunch', date: '1 week ago' },
  ],
};

vi.mock(import('../../services/search.js'), () => ({
  searchWebBatch: vi.fn(() => Promise.resolve(mockSearchResults)),
}));

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify([
      { title: 'AI Market Growth', source: 'MarketWatch', date: '3 days ago', priority: 'high', category: 'market', summary: 'AI market growing 20% YoY' },
      { title: 'Competitor raises $50M', source: 'TechCrunch', date: '1 week ago', priority: 'medium', category: 'competitor', summary: 'Competitor funding' },
      { title: 'New regulation impacts', source: 'Reuters', date: '2 weeks ago', priority: 'low', category: 'trend', summary: 'GDPR update' },
      { title: 'Startup grant program', source: 'SBA.gov', date: '1 month ago', priority: 'medium', category: 'opportunity', summary: '$50K grant available' },
      { title: 'Customer survey insights', source: 'Gartner', date: '5 days ago', priority: 'high', category: 'market', summary: 'Customer preferences shifting' },
      { title: 'IPO market trends', source: 'Bloomberg', date: 'today', priority: 'low', category: 'trend', summary: 'IPO window opening' },
    ]))),
  };
});

import { getResearch, getOpportunities, getMorningBriefing } from '../research.js';
import { callOpenAI } from '../../services/ai.js';
import { searchWebBatch } from '../../services/search.js';

describe('getResearch', () => {
  it('returns array of research items with required fields', async () => {
    const result = await getResearch('test-key', { blueprint: { problem: 'AI for healthcare', industry: 'healthtech', competitors: ['HealthAI'] } });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('source');
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('summary');
  });

  it('calls searchWebBatch with relevant queries', async () => {
    await getResearch('test-key', { blueprint: { problem: 'AI for healthcare', industry: 'healthtech', competitors: ['HealthAI'] } });
    expect(searchWebBatch).toHaveBeenCalled();
  });

  it('handles missing business context gracefully', async () => {
    const result = await getResearch('test-key', null);
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles web search failure gracefully', async () => {
    searchWebBatch.mockRejectedValueOnce(new Error('Search API down'));
    const result = await getResearch('test-key', { blueprint: { problem: 'Test' } });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getOpportunities', () => {
  it('returns array of opportunity items', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify([
      { title: 'Startup Grant', deadline: 'Next month', match: 85, description: 'Federal grant' },
      { title: 'YC Accelerator', deadline: '2 weeks', match: 60, description: 'Apply now' },
    ]));
    const result = await getOpportunities('test-key', { blueprint: { industry: 'fintech' } });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('calls searchWebBatch for opportunities', async () => {
    await getOpportunities('test-key', {});
    expect(searchWebBatch).toHaveBeenCalled();
  });

  it('handles empty business context', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify([]));
    const result = await getOpportunities('test-key', null);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getMorningBriefing', () => {
  it('returns briefing with greeting, findings, and focus', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      greeting: 'Good morning, Founder!',
      findings: [{ title: 'Market Update', detail: 'Markets up 2%' }],
      focus: 'Customer interviews',
    }));
    const result = await getMorningBriefing('test-key', { name: 'Alice' }, { currentStage: 'Pre-seed' });
    expect(result).toHaveProperty('greeting');
    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('focus');
  });

  it('calls searchWebBatch for news', async () => {
    await getMorningBriefing('test-key', { name: 'Bob' }, { currentStage: 'Growth' });
    expect(searchWebBatch).toHaveBeenCalled();
  });

  it('handles missing profile gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      greeting: 'Good morning!',
      findings: [],
      focus: 'Ship product',
    }));
    const result = await getMorningBriefing('test-key', null, null);
    expect(result.greeting).toBeTruthy();
  });
});
