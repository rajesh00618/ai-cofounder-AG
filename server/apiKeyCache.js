const cache = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 1000;

const evict = () => {
  if (cache.size <= MAX_ENTRIES) return;
  const entries = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
  const toRemove = entries.slice(0, cache.size - MAX_ENTRIES);
  for (const [key] of toRemove) cache.delete(key);
};

export const getApiKey = (userId) => {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) { cache.delete(userId); return null; }
  return entry.key;
};
export const setApiKey = (userId, key) => { cache.set(userId, { key, ts: Date.now() }); evict(); };
export const deleteApiKey = (userId) => cache.delete(userId);
export const hasApiKey = (userId) => cache.has(userId) && (Date.now() - cache.get(userId).ts <= TTL_MS);
