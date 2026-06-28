import { logger } from './logger.js';

const TIMEOUT = 8000;
const MAX_RESULTS = 6;

const SEARCH_PROVIDERS = [
  {
    name: 'duckduckgo',
    search: async (query) => {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AICoFounder/1.0)' }
      });
      const html = await res.text();
      const results = [];
      const resultRegex = /<a rel="nofollow" class="result__a" href="(.*?)">.*?<b>(.*?)<\/b>.*?<a class="result__snippet" href=.*?>(.*?)<\/a>/gs;
      let match;
      while ((match = resultRegex.exec(html)) !== null && results.length < MAX_RESULTS) {
        results.push({
          title: match[2].replace(/<[^>]*>/g, ''),
          url: match[1],
          snippet: match[3].replace(/<[^>]*>/g, '').trim()
        });
      }
      return results;
    }
  },
  {
    name: 'startpage',
    search: async (query) => {
      const url = `https://www.startpage.com/do/dsearch?query=${encodeURIComponent(query)}&cat=web`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AICoFounder/1.0)' }
      });
      const html = await res.text();
      const results = [];
      const resultRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*result-title[^"]*"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p[^>]*class="[^"]*result-description[^"]*"[^>]*>([\s\S]*?)<\/p>/gs;
      let match;
      while ((match = resultRegex.exec(html)) !== null && results.length < MAX_RESULTS) {
        results.push({
          title: match[2].replace(/<[^>]*>/g, '').trim(),
          url: match[1],
          snippet: match[3].replace(/<[^>]*>/g, '').trim()
        });
      }
      return results;
    }
  }
];

export const searchWeb = async (query) => {
  for (const provider of SEARCH_PROVIDERS) {
    try {
      const results = await provider.search(query);
      if (results.length > 0) {
        logger.info(`[Search] ${provider.name} returned ${results.length} results for "${query.slice(0, 50)}"`);
        return results;
      }
    } catch (err) {
      logger.warn(`[Search] ${provider.name} failed: ${err.message}`);
    }
  }
  return [];
};

export const searchWebBatch = async (queries, concurrency = 2) => {
  const allResults = {};
  const queue = [...queries];
  const run = async () => {
    while (queue.length > 0) {
      const q = queue.shift();
      allResults[q] = await searchWeb(q);
    }
  };
  const workers = Array.from({ length: Math.min(concurrency, queries.length) }, () => run());
  await Promise.all(workers);
  return allResults;
};
