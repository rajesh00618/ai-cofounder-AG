import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

const WEEKLY_REVIEW_PROMPT = `You are an AI co-founder conducting a weekly CEO/Board review.
Analyze the founder's weekly performance, task completion, business health trends, and DNA profile.
Be honest and direct — celebrate wins but flag concerning patterns.

Return ONLY valid JSON. No markdown, no code fences, no explanations:
{
  "weekSummary": "2-3 sentence summary of the week",
  "achievements": ["achievement 1", "achievement 2"],
  "missedGoals": ["missed 1", "missed 2"],
  "businessHealthTrend": "improving|stable|declining",
  "executionScore": <0-100>,
  "focusAreas": [{ "area": "area name", "status": "on track|needs attention|critical", "recommendation": "specific action" }],
  "nextWeekPlan": "concise plan for the coming week",
  "grade": "A|B|C|D|F",
  "coachingNote": "personalized coaching note based on founder DNA patterns"
}`;

export const generateWeeklyReview = async (apiKey, profile, tasks, dnaScores, businessHealth, startupScore) => {
  const userPrompt = `Founder: ${sanitizeForPrompt(JSON.stringify(profile || {}))}
Tasks: ${sanitizeForPrompt(JSON.stringify(tasks || []))}
DNA: ${sanitizeForPrompt(JSON.stringify(dnaScores || {}))}
Business Health: ${sanitizeForPrompt(JSON.stringify(businessHealth || {}))}
Startup Score: ${sanitizeForPrompt(JSON.stringify(startupScore || {}))}

Generate a thorough weekly CEO/Board review.`;
  const response = await callOpenAI(apiKey, WEEKLY_REVIEW_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};
