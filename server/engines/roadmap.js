import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

const PROMPT = `You are an AI startup roadmap strategist. Given a business blueprint, generate a quarterly roadmap.
Return JSON: { stages: [{ quarter, label, goals: [string], tasks: [{ title, priority, estimatedTime }] }], guidance: "Personalized advice string" }`;

export const generateRoadmap = async (apiKey, blueprint) => {
  const userPrompt = `Generate a 4-quarter startup roadmap from this blueprint:\n${sanitizeForPrompt(JSON.stringify(blueprint || {}))}`;
  const response = await callOpenAI(apiKey, PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

export const generateStageGuidance = async (apiKey, currentStage, businessHealth, dnaScores) => {
  const prompt = `You are an AI startup coach. Give personalized stage-specific guidance.
Return JSON: { advice: "specific actionable advice string", nextStep: "single next action", focus: "area to focus on" }`;
  const userPrompt = `Stage: ${sanitizeForPrompt(currentStage)}\nHealth: ${sanitizeForPrompt(JSON.stringify(businessHealth))}\nDNA: ${sanitizeForPrompt(JSON.stringify(dnaScores))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return extractJSON(response);
};
