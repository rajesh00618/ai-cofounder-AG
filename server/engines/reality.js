import { callOpenAI, PROMPTS, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const evaluateGoal = async (apiKey, goal) => {
  const prompt = `Evaluate this goal: ${sanitizeForPrompt(JSON.stringify(goal))}`;
  const response = await callOpenAI(apiKey, PROMPTS.REALITY_ENGINE, prompt, 0.2);
  return extractJSON(response);
};

export const calculateRealityScore = async (apiKey, answers) => {
  const prompt = `You are a startup reality scorer. Given these founder answers, calculate a realistic feasibility score.

Founder answers:
${JSON.stringify(answers, null, 2)}

Return JSON only:
{
  "score": <number 0-100>,
  "breakdown": { "experience": <0-100>, "time": <0-100>, "resources": <0-100>, "marketFit": <0-100> },
  "reasoning": "1-2 sentence explanation of the score"
}`;

  const response = await callOpenAI(apiKey, prompt, '', 0.2);
  const parsed = extractJSON(response);
  return { score: Math.min(Math.max(parsed.score || 50, 10), 98), ...parsed };
};
