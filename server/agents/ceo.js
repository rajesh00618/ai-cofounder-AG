import { callOpenAI, PROMPTS } from '../services/ai.js';

export const getCEOAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, PROMPTS.CEO, prompt, 0.7);
};
