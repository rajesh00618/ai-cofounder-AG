import { callOpenAI } from '../services/ai.js';

const cmoPrompt = `You are the CMO AI. You focus on marketing strategy, brand positioning, customer acquisition, and growth channels.
You emphasize data-driven marketing and measurable ROI.
You challenge founders who haven't defined their target customer or distribution channel.
Keep responses concise and actionable.`;

export const getCMOAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${message}`;
  return callOpenAI(apiKey, cmoPrompt, prompt, 0.5);
};
