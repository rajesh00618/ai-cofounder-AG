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

const TASKS_PROMPT = `You are an AI sprint planner for a startup. Given the founder's business answers and their blueprint, generate 6 actionable tasks for the first validation sprint.
Return EXACTLY this JSON array (no markdown, no code fences):
[
  { "title": "task description", "priority": "high|medium|low", "estimatedTime": "X hrs", "aiAssistance": "AI-powered|AI-assisted|AI-generated" }
]`;

export const generateBlueprintTasks = async (apiKey, answers, blueprint) => {
  const userPrompt = `Answers:\n${Object.entries(answers || {}).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n\nBlueprint:\nExecutive Summary: ${blueprint?.executiveSummary || ''}\nProblem: ${blueprint?.problem || ''}\nMVP Plan: ${blueprint?.mvpPlan || ''}\nValidation Plan: ${blueprint?.validationPlan || ''}`;

  const response = await callOpenAI(apiKey, TASKS_PROMPT, userPrompt, 0.3);
  const tasks = extractJSON(response);
  return Array.isArray(tasks) ? tasks.map(t => ({
    title: t.title,
    priority: t.priority || 'medium',
    estimatedTime: t.estimatedTime || '1 hr',
    aiAssistance: t.aiAssistance || t.AIAssistance || 'AI-assisted'
  })) : [];
};

const SCORES_PROMPT = `You are a startup analyst. Given a business blueprint and founder profile, evaluate the startup across multiple dimensions.
Return EXACTLY this JSON (no markdown, no code fences):
{
  "businessHealth": { "idea": 0-100, "validation": 0-100, "product": 0-100, "marketing": 0-100, "sales": 0-100, "finance": 0-100 },
  "startupScore": { "execution": 0-100, "business": 0-100, "customers": 0-100, "product": 0-100, "cash": 0-100, "aiConfidence": 0-100 }
}
Be realistic and critical — most early startups should score between 20-60. Only exceptional answers get higher.`;

export const generateScores = async (apiKey, answers, blueprint, founderProfile) => {
  const userPrompt = `Founder: ${founderProfile?.name || 'Unknown'}
Experience: ${founderProfile?.experienceLevel || 'First-time'}
Team: ${founderProfile?.teamStatus || 'Solo'}
Time: ${founderProfile?.timeAvailable || 'Part-time'}

Answers:
${Object.entries(answers || {}).map(([k,v]) => `- Q${k}: ${v}`).join('\n')}

Blueprint:
Executive Summary: ${blueprint?.executiveSummary || ''}
Problem: ${blueprint?.problem || ''}
Solution: ${blueprint?.solution || ''}
Target Customer: ${blueprint?.targetCustomer || ''}
Market Size: ${blueprint?.marketSize || ''}
Revenue Model: ${blueprint?.revenueModel || ''}
GTM Plan: ${blueprint?.gtmPlan || ''}
Validation Plan: ${blueprint?.validationPlan || ''}
MVP Plan: ${blueprint?.mvpPlan || ''}
Risks: ${(blueprint?.risks || []).join(', ')}
Success Metrics: ${(blueprint?.successMetrics || []).join(', ')}`;

  const response = await callOpenAI(apiKey, SCORES_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};
