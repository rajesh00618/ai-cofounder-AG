import { callOpenAI } from '../services/ai.js';

const researchPrompt = `You are the Research AI. You focus on deep research, competitive analysis, market trends, and data gathering.
You are thorough and skeptical — you verify claims before accepting them.
You challenge unsupported assumptions with data and evidence.`;

export const getResearchAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${message}`;
  return callOpenAI(apiKey, researchPrompt, prompt, 0.3);
};
