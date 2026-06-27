import { callOpenAI, PROMPTS, extractJSON } from '../services/ai.js';

export const evaluateGoal = async (apiKey, goal) => {
  const prompt = `Evaluate this goal: ${JSON.stringify(goal)}`;
  const response = await callOpenAI(apiKey, PROMPTS.REALITY_ENGINE, prompt, 0.2);
  return extractJSON(response);
};

export const calculateRealityScore = (answers) => {
  let score = 50;
  if (answers.experience === 'Serial entrepreneur') score += 15;
  else if (answers.experience === 'Currently running one') score += 10;
  else if (answers.experience === 'Tried before') score += 5;
  if (answers.time === 'Full-time') score += 15;
  else if (answers.time === '3–5 hrs/day') score += 10;
  else if (answers.time === '1–2 hrs/day') score += 5;
  if (answers.budget === 'More') score += 10;
  else if (answers.budget === 'Under $1000') score += 5;
  return Math.min(Math.max(score, 10), 98);
};
