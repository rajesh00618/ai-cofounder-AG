import { callOpenAI, PROMPTS, sanitizeForPrompt } from '../services/ai.js';

export const getCEOAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${sanitizeForPrompt(JSON.stringify(context))}\n\nUser: ${sanitizeForPrompt(JSON.stringify(message))}`;
  return callOpenAI(apiKey, PROMPTS.CEO, prompt, 0.7);
};
