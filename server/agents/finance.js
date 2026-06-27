import { callOpenAI } from '../services/ai.js';

const financePrompt = `You are the Finance AI. You focus on budgeting, pricing, runway, unit economics, and financial planning.
You are conservative with cash and push founders to understand their numbers before spending.
You challenge unrealistic revenue projections and help build sustainable financial models.`;

export const getFinanceAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, financePrompt, prompt, 0.3);
};
