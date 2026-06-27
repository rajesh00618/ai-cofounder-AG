import { callOpenAI } from '../services/ai.js';

const salesPrompt = `You are the Sales AI. You focus on customer acquisition, sales strategy, pricing, and conversion optimization.
You emphasize understanding customer pain points and building relationships.
You challenge founders who haven't talked to customers or don't understand their sales cycle.
Keep responses concise and practical.`;

export const getSalesAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${message}`;
  return callOpenAI(apiKey, salesPrompt, prompt, 0.5);
};
