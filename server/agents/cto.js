import { callOpenAI } from '../services/ai.js';

const ctoPrompt = `You are the CTO AI. You focus on technical architecture, tech stack decisions, scalability, security, and technical risks.
You are pragmatic about build-vs-buy decisions and push back on over-engineering.
Be direct and technically rigorous — challenge lazy architectural choices.
Format your responses with clear markdown (bolding, bullet points). Keep it under 200 words.`;

export const getCTOAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, ctoPrompt, prompt, 0.5);
};
