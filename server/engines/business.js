import { callOpenAI, extractJSON } from '../services/ai.js';

const BLUEPRINT_PROMPT = `You are a seasoned startup advisor and business strategist. Given a founder's answers about their idea, generate a comprehensive business blueprint in valid JSON only.

Return EXACTLY this JSON structure (no markdown, no code fences):
{
  "executiveSummary": "2-3 sentence summary",
  "problem": "The problem being solved",
  "solution": "The proposed solution",
  "targetCustomer": "Ideal customer profile",
  "marketSize": "TAM/SAM calculation with numbers",
  "usp": "Unique selling proposition",
  "competitors": "Competitive landscape analysis",
  "revenueModel": "Pricing and revenue strategy",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "gtmPlan": "Go-to-market strategy",
  "validationPlan": "How to validate the idea",
  "mvpPlan": "Minimum viable product plan",
  "roadmap": { "q1": "", "q2": "", "q3": "", "q4": "" },
  "financials": { "monthlyBurn": "", "breakeven": "", "projectedMRR": "" },
  "successMetrics": ["metric 1", "metric 2", "metric 3"]
}`;

export const generateBlueprint = async (apiKey, answers, founderProfile) => {
  const userPrompt = `Founder: ${founderProfile?.name || 'Unknown'}
Experience: ${founderProfile?.experienceLevel || 'First-time'}
Team: ${founderProfile?.teamStatus || 'Solo'}
Time: ${founderProfile?.timeAvailable || 'Part-time'}
Answers:
- Target Customer: ${answers[1] || 'Not specified'}
- Problem: ${answers[2] || 'Not specified'}
- Current Alternatives: ${answers[3] || 'Not specified'}
- Pricing: ${answers[4] || 'Not specified'}
- Advantage: ${answers[5] || 'Not specified'}`;

  const response = await callOpenAI(apiKey, BLUEPRINT_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};
