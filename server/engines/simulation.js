import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

const fmtCtx = (ctx) => {
  if (!ctx || typeof ctx !== 'object') return '';
  const { profile, blueprint, businessHealth, startupScore, currentStage, tasks } = ctx;
  const parts = [];
  if (profile?.name) parts.push(`Founder: ${sanitizeForPrompt(profile.name)} (${sanitizeForPrompt(profile.experienceLevel || 'N/A')})`);
  if (blueprint?.executiveSummary) parts.push(`Business: ${sanitizeForPrompt(blueprint.executiveSummary)}`);
  if (businessHealth) parts.push(`Health: ${JSON.stringify(businessHealth)}`);
  if (startupScore) parts.push(`Scores: ${JSON.stringify(startupScore)}`);
  if (currentStage) parts.push(`Stage: ${currentStage}`);
  if (tasks?.length) {
    const done = tasks.filter(t => t.status === 'done').length;
    parts.push(`Tasks: ${done}/${tasks.length} completed`);
  }
  return parts.length ? `\nBusiness Context:\n${parts.join('\n')}` : '';
};

export const runDecisionSimulation = async (apiKey, question, context) => {
  const prompt = `You are an AI decision simulator. Given a strategic question, generate 3 possible scenarios with different risk profiles.
Return ONLY valid JSON. No markdown, no code fences, no explanations.
{
  "question": "the original question",
  "scenarios": [
    { "label": "Option A — High-level description", "timeline": "X months", "success": a number between 30 and 88, "risk": "High" },
    { "label": "Option B — High-level description", "timeline": "X months", "success": a number between 65 and 88, "risk": "Medium" },
    { "label": "Option C — High-level description", "timeline": "X months", "success": a number between 50 and 75, "risk": "Low" }
  ],
  "recommendation": "label of best option",
  "failureRisk": a number between 25 and 65
}
Make success numbers realistic and consistent with risk level. Analyze each scenario impartially and recommend based on risk/reward analysis.`;
  const userPrompt = `Question: ${sanitizeForPrompt(question)}${fmtCtx(context)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.7);
  return extractJSON(response);
};

export const runCompanySimulation = async (apiKey, question, context) => {
  const prompt = `You are an AI company simulator. Given a strategic decision, simulate the outcome with 1000 virtual customers.
Return ONLY valid JSON. No markdown, no code fences, no explanations.
{
  "question": "the original question",
  "virtualCustomers": 1000,
  "conversion": "X%",
  "projectedRevenue": "$XK/mo",
  "complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "retention": "X%",
  "recommendation": "specific actionable recommendation"
}`;
  const userPrompt = `Question: ${sanitizeForPrompt(question)}${fmtCtx(context)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.5);
  return extractJSON(response);
};

export const simulateCustomerReaction = async (apiKey, product, personaId, context) => {
  const prompt = `You are an AI customer persona simulator. Role-play as a customer persona responding to a product.
Return ONLY valid JSON. No markdown, no code fences, no explanations.
{
  "persona": { "name": "Persona display name", "budget": "Budget description" },
  "reaction": "A 2-3 sentence reaction as this persona, starting with 'As a [persona name]...'",
  "objections": ["objection 1", "objection 2", "objection 3"]
}`;
  const userPrompt = `Persona: ${sanitizeForPrompt(personaId)}\nProduct: ${sanitizeForPrompt(product)}${fmtCtx(context)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.7);
  return extractJSON(response);
};
