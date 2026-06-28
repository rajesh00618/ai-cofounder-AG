import { describe, it, expect } from 'vitest';
import { searchWeb, searchWebBatch } from '../search.js';

describe('searchWeb', () => {
  it('returns an array for any query', async () => {
    const results = await searchWeb('test query');
    expect(Array.isArray(results)).toBe(true);
  }, 30000);
});

describe('searchWebBatch', () => {
  it('returns a map of query to results', async () => {
    const results = await searchWebBatch(['test one', 'test two']);
    expect(typeof results).toBe('object');
    expect(results).toHaveProperty('test one');
    expect(results).toHaveProperty('test two');
    expect(Array.isArray(results['test one'])).toBe(true);
  }, 60000);
});
