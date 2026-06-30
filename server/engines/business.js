import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';
import { logger } from '../services/logger.js';

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
  const userPrompt = `Founder: ${sanitizeForPrompt(founderProfile?.name || 'Unknown')}
Experience: ${sanitizeForPrompt(founderProfile?.experienceLevel || 'First-time')}
Team: ${sanitizeForPrompt(founderProfile?.teamStatus || 'Solo')}
Time: ${sanitizeForPrompt(founderProfile?.timeAvailable || 'Part-time')}
Answers:
- Target Customer: ${sanitizeForPrompt(answers[1] || 'Not specified')}
- Problem: ${sanitizeForPrompt(answers[2] || 'Not specified')}
- Current Alternatives: ${sanitizeForPrompt(answers[3] || 'Not specified')}
- Pricing: ${sanitizeForPrompt(answers[4] || 'Not specified')}
- Advantage: ${sanitizeForPrompt(answers[5] || 'Not specified')}`;

  const response = await callOpenAI(apiKey, BLUEPRINT_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

const TASKS_PROMPT = `You are an AI sprint planner for a startup. Given the founder's business answers and their blueprint, generate 6 actionable tasks for the first validation sprint.
Return EXACTLY this JSON array (no markdown, no code fences):
[
  { "title": "task description", "priority": "high|medium|low", "estimatedTime": "X hrs", "aiAssistance": "AI-powered|AI-assisted|AI-generated" }
]`;

export const generateBlueprintTasks = async (apiKey, answers, blueprint) => {
  const userPrompt = `Answers:\n${Object.entries(answers || {}).map(([k,v]) => `- ${sanitizeForPrompt(k)}: ${sanitizeForPrompt(String(v))}`).join('\n')}\n\nBlueprint:\nExecutive Summary: ${sanitizeForPrompt(blueprint?.executiveSummary || '')}\nProblem: ${sanitizeForPrompt(blueprint?.problem || '')}\nMVP Plan: ${sanitizeForPrompt(blueprint?.mvpPlan || '')}\nValidation Plan: ${sanitizeForPrompt(blueprint?.validationPlan || '')}`;

  let tasks;
  try {
    const response = await callOpenAI(apiKey, TASKS_PROMPT, userPrompt, 0.3);
    tasks = extractJSON(response);
  } catch (err) {
    logger.warn(`[Business] Failed to parse tasks: ${err.message}`);
    tasks = [];
  }
  return Array.isArray(tasks)
    ? tasks.filter(t => t.title).map(t => ({
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

const RECALCULATE_SCORES_PROMPT = `You are a startup analyst evaluating progress. Given the original business blueprint, founder profile, and task completion data, recalculate the startup's scores and determine the current startup stage.

Startup stages in order: idea → validation → mvp → launch → revenue → pmf → scale

Consider:
- Completed tasks should improve relevant scores and advance the stage
- High-priority completed tasks have more impact
- The ratio of completed to total tasks
- Original blueprint quality still matters
- A stage should advance only when the founder has demonstrated meaningful progress (tasks completed, scores improved)

Return EXACTLY this JSON (no markdown, no code fences):
{
  "businessHealth": { "idea": 0-100, "validation": 0-100, "product": 0-100, "marketing": 0-100, "sales": 0-100, "finance": 0-100 },
  "startupScore": { "execution": 0-100, "business": 0-100, "customers": 0-100, "product": 0-100, "cash": 0-100, "aiConfidence": 0-100 },
  "currentStage": "idea | validation | mvp | launch | revenue | pmf | scale"
}
Be realistic — task completion should move scores but don't inflate them unreasonably. Stage should only advance if real progress is demonstrated.`;

export const recalculateScores = async (apiKey, answers, blueprint, founderProfile, tasks, currentStage) => {
  const completedTasks = (tasks || []).filter(t => t.status === 'done');
  const totalTasks = (tasks || []).length;
  const completionRateNum = totalTasks > 0 ? (completedTasks.length / totalTasks) : 0;
  const completionRatePct = (completionRateNum * 100).toFixed(0);
  const highPriorityDone = completedTasks.filter(t => t.priority === 'high').length;
  const taskSummary = (tasks || []).map(t => `- [${t.status}] ${t.title} (priority: ${t.priority || 'medium'}, difficulty: ${t.difficulty || 'medium'})`).join('\n');
  const normalizedAnswers = Array.isArray(answers)
    ? Object.fromEntries(answers.map((v, i) => [i + 1, v]))
    : (answers || {});

  const userPrompt = `Founder: ${sanitizeForPrompt(founderProfile?.name || 'Unknown')}
Experience: ${sanitizeForPrompt(founderProfile?.experienceLevel || 'First-time')}
Current Stage: ${sanitizeForPrompt(currentStage || 'idea')}
Completion Rate: ${completionRatePct}% (${completedTasks.length}/${totalTasks} tasks done)
High Priority Tasks Done: ${highPriorityDone}

Tasks:
${taskSummary}

Answers:
${Object.entries(normalizedAnswers).map(([k,v]) => `- Q${sanitizeForPrompt(String(k))}: ${sanitizeForPrompt(String(v))}`).join('\n')}

Blueprint:
Executive Summary: ${sanitizeForPrompt(blueprint?.executiveSummary || '')}
Problem: ${sanitizeForPrompt(blueprint?.problem || '')}
Solution: ${sanitizeForPrompt(blueprint?.solution || '')}
Target Customer: ${sanitizeForPrompt(blueprint?.targetCustomer || '')}
Market Size: ${sanitizeForPrompt(blueprint?.marketSize || '')}
Revenue Model: ${sanitizeForPrompt(blueprint?.revenueModel || '')}
GTM Plan: ${sanitizeForPrompt(blueprint?.gtmPlan || '')}
Validation Plan: ${sanitizeForPrompt(blueprint?.validationPlan || '')}
MVP Plan: ${sanitizeForPrompt(blueprint?.mvpPlan || '')}
Risks: ${sanitizeForPrompt(Array.isArray(blueprint?.risks) ? blueprint.risks.join(', ') : 'N/A')}
Success Metrics: ${sanitizeForPrompt(Array.isArray(blueprint?.successMetrics) ? blueprint.successMetrics.join(', ') : 'N/A')}`;

  const response = await callOpenAI(apiKey, RECALCULATE_SCORES_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

export const generateScores = async (apiKey, answers, blueprint, founderProfile) => {
  const userPrompt = `Founder: ${sanitizeForPrompt(founderProfile?.name || 'Unknown')}
Experience: ${sanitizeForPrompt(founderProfile?.experienceLevel || 'First-time')}
Team: ${sanitizeForPrompt(founderProfile?.teamStatus || 'Solo')}
Time: ${sanitizeForPrompt(founderProfile?.timeAvailable || 'Part-time')}

Answers:
${Object.entries(answers || {}).map(([k,v]) => `- Q${sanitizeForPrompt(String(k))}: ${sanitizeForPrompt(String(v))}`).join('\n')}

Blueprint:
Executive Summary: ${sanitizeForPrompt(blueprint?.executiveSummary || '')}
Problem: ${sanitizeForPrompt(blueprint?.problem || '')}
Solution: ${sanitizeForPrompt(blueprint?.solution || '')}
Target Customer: ${sanitizeForPrompt(blueprint?.targetCustomer || '')}
Market Size: ${sanitizeForPrompt(blueprint?.marketSize || '')}
Revenue Model: ${sanitizeForPrompt(blueprint?.revenueModel || '')}
GTM Plan: ${sanitizeForPrompt(blueprint?.gtmPlan || '')}
Validation Plan: ${sanitizeForPrompt(blueprint?.validationPlan || '')}
MVP Plan: ${sanitizeForPrompt(blueprint?.mvpPlan || '')}
Risks: ${sanitizeForPrompt(Array.isArray(blueprint?.risks) ? blueprint.risks.join(', ') : 'N/A')}
Success Metrics: ${sanitizeForPrompt(Array.isArray(blueprint?.successMetrics) ? blueprint.successMetrics.join(', ') : 'N/A')}`;

  const response = await callOpenAI(apiKey, SCORES_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};
