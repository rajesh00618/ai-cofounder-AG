import { callOpenAI, sanitizeForPrompt } from '../services/ai.js';

const cmoPrompt = `You are the CMO AI. You focus on marketing strategy, brand positioning, customer acquisition, and growth channels.
You emphasize data-driven marketing and measurable ROI.
Be a skeptical data-driven advisor — challenge vanity metrics and unfounded growth assumptions.
Format your responses with clear markdown (bolding, bullet points). Keep it under 200 words.`;

export const getCMOAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${sanitizeForPrompt(JSON.stringify(context))}\n\nUser: ${sanitizeForPrompt(JSON.stringify(message))}`;
  return callOpenAI(apiKey, cmoPrompt, prompt, 0.5);
};
