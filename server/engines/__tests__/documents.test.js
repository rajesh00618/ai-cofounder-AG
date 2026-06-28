import { vi, describe, it, expect } from 'vitest';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      title: 'Business Plan',
      content: '# Executive Summary\n\nThis is a business plan.',
      sections: [{ heading: 'Executive Summary', body: 'Full text' }],
    }))),
  };
});

import { generateDocument } from '../documents.js';
import { callOpenAI } from '../../services/ai.js';

describe('generateDocument', () => {
  it('returns document with title, content, and sections', async () => {
    const result = await generateDocument('test-key', 'business-plan', { name: 'TestCo', stage: 'Pre-seed' });
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('sections');
    expect(Array.isArray(result.sections)).toBe(true);
  });

  it('calls callOpenAI with the apiKey, docType, and businessContext', async () => {
    await generateDocument('custom-key', 'pitch-deck', { name: 'MyCo' });
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('pitch-deck'), 0.3);
    expect(callOpenAI).toHaveBeenCalledWith('custom-key', expect.any(String), expect.stringContaining('MyCo'), 0.3);
  });

  it('handles empty businessContext gracefully', async () => {
    callOpenAI.mockResolvedValueOnce(JSON.stringify({
      title: 'Default Document',
      content: 'No context provided.',
      sections: [],
    }));
    const result = await generateDocument('test-key', 'business-plan', null);
    expect(result.title).toBe('Default Document');
  });

  it('handles missing businessContext', async () => {
    const result = await generateDocument('test-key', 'prd', {});
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('sections');
  });
});
