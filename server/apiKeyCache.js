const cache = new Map();

export const getApiKey = (userId) => cache.get(userId) || null;
export const setApiKey = (userId, key) => cache.set(userId, key);
export const deleteApiKey = (userId) => cache.delete(userId);
export const hasApiKey = (userId) => cache.has(userId);
