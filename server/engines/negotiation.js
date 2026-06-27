import { callOpenAI, PROMPTS, extractJSON } from '../services/ai.js';

export const negotiateGoal = async (apiKey, goal) => {
  const prompt = `Provide alternatives for this goal: ${goal}`;
  const response = await callOpenAI(apiKey, PROMPTS.NEGOTIATION_ENGINE, prompt, 0.6);
  return extractJSON(response);
};
