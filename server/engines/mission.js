import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const generateMission = async (apiKey, businessContext, tasks, dnaScores) => {
  const prompt = `You are an AI co-founder setting the daily mission. Given business context, tasks, and founder DNA, generate today's single most important mission.
Return ONLY valid JSON. No markdown, no code fences, no explanations. { mission: "specific actionable mission", reason: "why this matters now", estimatedTime: "X hrs", recommendation: "personalized advice" }`;
  const userPrompt = `Context: ${sanitizeForPrompt(JSON.stringify(businessContext))}\nTasks: ${sanitizeForPrompt(JSON.stringify(tasks))}\nDNA: ${sanitizeForPrompt(JSON.stringify(dnaScores))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return extractJSON(response);
};

export const generateHealthAnalysis = async (apiKey, blueprint, businessHealth) => {
  const prompt = `You are an AI business analyst. Given a startup blueprint and current health scores, provide analysis and recommendations.
Return ONLY valid JSON. No markdown, no code fences, no explanations. { overallHealth: 0-100, weakSpots: [{ area, score, recommendation }], alert: "critical alert message if score < 30, otherwise empty string", recommendation: "top priority recommendation" }`;
  const userPrompt = `Blueprint: ${sanitizeForPrompt(JSON.stringify(blueprint))}\nHealth: ${sanitizeForPrompt(JSON.stringify(businessHealth))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};
