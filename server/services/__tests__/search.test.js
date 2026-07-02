import { vi, describe, it, expect, beforeEach } from 'vitest';
import { searchWeb, searchWebBatch } from '../search.js';

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchWeb', () => {
  it('returns parsed results when DuckDuckGo responds', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<html><a rel="nofollow" class="result__a" href="https://example.com"><b>Test Result</b></a><a class="result__snippet" href="https://example.com">A test snippet</a></html>')
    })));
    const results = await searchWeb('test query');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Test Result');
    expect(results[0].url).toBe('https://example.com');
    expect(results[0].snippet).toBe('A test snippet');
  });

  it('returns empty array when all providers fail', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    const results = await searchWeb('test query');
    expect(results).toEqual([]);
  });

  it('returns empty array when no results found in HTML', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<html><body>No results here</body></html>')
    })));
    const results = await searchWeb('test query');
    expect(results).toEqual([]);
  });
});

describe('searchWebBatch', () => {
  it('returns a map of query to results', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<html><a rel="nofollow" class="result__a" href="https://example.com"><b>Result</b></a><a class="result__snippet" href="https://example.com">Snippet</a></html>')
    })));
    const results = await searchWebBatch(['test one', 'test two']);
    expect(typeof results).toBe('object');
    expect(results).toHaveProperty('test one');
    expect(results).toHaveProperty('test two');
    expect(Array.isArray(results['test one'])).toBe(true);
  });
});
