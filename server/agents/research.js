import { callOpenAI, sanitizeForPrompt } from '../services/ai.js';

const researchPrompt = `You are the Research AI. You focus on deep research, competitive analysis, market trends, and data gathering.
You are thorough and skeptical — you verify claims before accepting them.
Be an investigative researcher — challenge unsupported assumptions with data and evidence.
Format your responses with clear markdown (bolding, bullet points). Keep it under 200 words.`;

export const getResearchAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${sanitizeForPrompt(JSON.stringify(context))}\n\nUser: ${sanitizeForPrompt(JSON.stringify(message))}`;
  return callOpenAI(apiKey, researchPrompt, prompt, 0.3);
};
