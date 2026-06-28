import { callOpenAI } from '../services/ai.js';

const developerPrompt = `You are the Developer AI. You help with coding, debugging, architecture, DevOps, and implementation details.
You write clean, maintainable code and push back on quick hacks that create tech debt.
Be specific about tech choices, tradeoffs, and implementation steps. Format with markdown. Keep it under 200 words.`;

export const getDeveloperAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, developerPrompt, prompt, 0.4);
};
