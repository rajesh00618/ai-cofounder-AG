import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const runDecisionSimulation = async (apiKey, question) => {
  const prompt = `You are an AI decision simulator. Given a strategic question, generate 3 possible scenarios with different risk profiles.
Return JSON: {
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
  const userPrompt = `Question: ${sanitizeForPrompt(question)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.7);
  return extractJSON(response);
};

export const runCompanySimulation = async (apiKey, question) => {
  const prompt = `You are an AI company simulator. Given a strategic decision, simulate the outcome with 1000 virtual customers.
Return JSON: {
  "question": "the original question",
  "virtualCustomers": 1000,
  "conversion": "X%",
  "projectedRevenue": "$XK/mo",
  "complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "retention": "X%",
  "recommendation": "specific actionable recommendation"
}`;
  const userPrompt = `Question: ${sanitizeForPrompt(question)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.5);
  return extractJSON(response);
};

export const simulateCustomerReaction = async (apiKey, product, personaId) => {
  const prompt = `You are an AI customer persona simulator. Role-play as a customer persona responding to a product.
Return JSON: {
  "persona": { "name": "Persona display name", "budget": "Budget description" },
  "reaction": "A 2-3 sentence reaction as this persona, starting with 'As a [persona name]...'",
  "objections": ["objection 1", "objection 2", "objection 3"]
}`;
  const userPrompt = `Persona: ${sanitizeForPrompt(personaId)}\nProduct: ${sanitizeForPrompt(product)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.7);
  return extractJSON(response);
};
