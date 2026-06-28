import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const analyzeDNA = async (apiKey, profile) => {
  const prompt = `You are an AI psychologist specializing in founder assessment. 
Given onboarding answers, infer the founder's DNA profile across 10 dimensions (each 0-100).
Also infer their thinking style, decision style, learning style, work pattern, failure pattern, and recovery pattern.
Return JSON: { dnaScores: { "Decision-making": 0-100, "Execution": 0-100, "Consistency": 0-100, "Learning speed": 0-100, "Leadership": 0-100, "Sales ability": 0-100, "Technical skill": 0-100, "Communication": 0-100, "Focus": 0-100, "Confidence": 0-100 }, founderTwin: { thinkStyle, decideStyle, learnStyle, workPattern, failurePattern, recoveryPattern }, adaptations: [{ weakness, action }] }`;

  const userPrompt = `Analyze this founder:\n${sanitizeForPrompt(JSON.stringify(profile || {}))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};

export const generateAdaptations = async (apiKey, dnaScores, founderTwin, recentActivity) => {
  const prompt = `You are an AI coach. Given a founder's DNA profile and recent activity, suggest personalized growth adaptations.
Return JSON: { adaptations: [{ weakness, action, priority: "high|medium|low" }] }`;
  const userPrompt = `DNA: ${sanitizeForPrompt(JSON.stringify(dnaScores))}\nTwin: ${sanitizeForPrompt(JSON.stringify(founderTwin))}\nActivity: ${sanitizeForPrompt(JSON.stringify(recentActivity || {}))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return extractJSON(response);
};
