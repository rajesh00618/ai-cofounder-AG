import { callOpenAI, extractJSON, sanitizeForPrompt } from '../services/ai.js';

export const generateReviewNote = async (apiKey, review, profile, tasks, dnaScores) => {
  const prompt = `You are an AI co-founder conducting a daily review. Given the founder's review answers, their tasks, and DNA profile, generate a personalized coaching note.
Return ONLY valid JSON. No markdown, no code fences, no explanations. { note: "personalized empathetic note with specific observations and advice (2-3 paragraphs)", adjustedPlan: "how tomorrow should change based on today", encouragement: "one line of genuine encouragement" }`;
  const userPrompt = `Review: ${sanitizeForPrompt(JSON.stringify(review))}\nTasks: ${sanitizeForPrompt(JSON.stringify(tasks))}\nDNA: ${sanitizeForPrompt(JSON.stringify(dnaScores))}\nProfile: ${sanitizeForPrompt(JSON.stringify(profile))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return extractJSON(response);
};

export const suggestTasks = async (apiKey, blueprint, stage, dnaScores) => {
  const prompt = `You are an AI task planner. Given a business blueprint and current stage, suggest 6 actionable tasks for the current sprint.
Return ONLY valid JSON. No markdown, no code fences, no explanations. { tasks: [{ title, priority: "high|medium|low", estimatedTime: "X hrs", aiAssistance: "AI-powered|AI-assisted|AI-generated" }] }`;
  const userPrompt = `Blueprint: ${sanitizeForPrompt(JSON.stringify(blueprint))}\nStage: ${sanitizeForPrompt(stage)}\nDNA: ${sanitizeForPrompt(JSON.stringify(dnaScores))}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};
