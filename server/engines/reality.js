import { callOpenAI, PROMPTS, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const evaluateGoal = async (apiKey, goal) => {
  const prompt = `Evaluate this goal: ${sanitizeForPrompt(JSON.stringify(goal))}`;
  const response = await callOpenAI(apiKey, PROMPTS.REALITY_ENGINE, prompt, 0.2);
  return extractJSON(response);
};

const REALITY_SCORE_PROMPT = `You are a startup reality scorer. Given these founder answers, calculate a realistic feasibility score.

Return ONLY valid JSON. No markdown, no code fences, no explanations:
{
  "score": <number 0-100>,
  "breakdown": { "experience": <0-100>, "time": <0-100>, "resources": <0-100>, "marketFit": <0-100> },
  "reasoning": "1-2 sentence explanation of the score"
}`;

export const calculateRealityScore = async (apiKey, answers) => {
  const userPrompt = `Founder answers:\n${sanitizeForPrompt(JSON.stringify(answers, null, 2))}`;
  const response = await callOpenAI(apiKey, REALITY_SCORE_PROMPT, userPrompt, 0.2);
  const parsed = extractJSON(response);
  return { ...parsed, score: Math.min(Math.max(parsed.score ?? 50, 10), 98) };
};
