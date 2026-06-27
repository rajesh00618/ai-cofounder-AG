import { callOpenAI, extractJSON } from '../services/ai.js';

const PROMPT = `You are an AI market researcher. Given a founder's business context, generate realistic market research findings.
Return valid JSON array of objects with: title, source, date (relative like "2 days ago"), priority (high/medium/low), category (trend/competitor/market/opportunity), summary`;

export const getResearch = async (apiKey, businessContext) => {
  const userPrompt = `Generate 6 research items for this business:\n${JSON.stringify(businessContext || {})}`;
  const response = await callOpenAI(apiKey, PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

export const getOpportunities = async (apiKey, businessContext) => {
  const prompt = `You are an AI opportunity scout. Given a startup's context, identify 4 real funding opportunities, grants, accelerators, or events that would benefit them.
Return JSON array: [{ title, deadline (relative), match (0-100), description }]`;
  const userPrompt = `Find opportunities for:\n${JSON.stringify(businessContext || {})}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};

export const getMorningBriefing = async (apiKey, profile, businessContext) => {
  const prompt = `You are an AI co-founder's morning briefing generator. Generate a personalized morning briefing.
Return JSON: { greeting (personalized), findings: [{ title, detail }], focus: "string" }`;
  const userPrompt = `Founder: ${profile?.name}\nStage: ${businessContext?.currentStage}\nGenerate a morning briefing.`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return extractJSON(response);
};
