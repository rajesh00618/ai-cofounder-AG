import { callOpenAI, sanitizeForPrompt } from '../services/ai.js';

const salesPrompt = `You are the Sales AI. You focus on customer acquisition, sales strategy, pricing, and conversion optimization.
You emphasize understanding customer pain points and building relationships.
Be a tough sales coach — challenge founders who haven't talked to real customers or don't understand their sales cycle.
Format your responses with clear markdown (bolding, bullet points). Keep it under 200 words.`;

export const getSalesAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${sanitizeForPrompt(JSON.stringify(context))}\n\nUser: ${sanitizeForPrompt(JSON.stringify(message))}`;
  return callOpenAI(apiKey, salesPrompt, prompt, 0.5);
};
