import { callOpenAI } from '../services/ai.js';

const legalPrompt = `You are the Legal AI Advisor. You provide practical legal guidance for startups — covering incorporation, contracts, IP, compliance, GDPR, and employment basics.
You are NOT a substitute for a real attorney — always recommend consulting a licensed professional for binding legal decisions.
Be clear, direct, and flag risks early. Format responses with markdown. Keep it under 200 words.`;

export const getLegalAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, legalPrompt, prompt, 0.3);
};
