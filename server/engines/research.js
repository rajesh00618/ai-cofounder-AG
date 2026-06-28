import { callOpenAI, extractJSON } from '../services/ai.js';
import { searchWebBatch } from '../services/search.js';
import { logger } from '../services/logger.js';

const RESEARCH_PROMPT = `You are an AI market researcher. Analyze the provided web search results and business context to produce realistic, sourced market research findings.
Return valid JSON array of objects with: title, source (real source name), date (relative like "2 days ago"), priority (high/medium/low), category (trend/competitor/market/opportunity), summary`;

export const getResearch = async (apiKey, businessContext) => {
  const year = new Date().getFullYear();
  let searchResults = [];
  try {
    const queries = [];
    if (businessContext?.blueprint?.problem) queries.push(`${businessContext.blueprint.problem.slice(0, 80)} market size ${year}`);
    if (businessContext?.blueprint?.industry) queries.push(`${businessContext.blueprint.industry} market trends ${year}`);
    if (businessContext?.blueprint?.competitors?.length) queries.push(`${businessContext.blueprint.competitors[0]} competitor analysis ${year}`);
    queries.push(`latest startup funding trends ${year}`);

    const webData = await searchWebBatch(queries.slice(0, 3));
    searchResults = Object.values(webData).flat().slice(0, 10);
    logger.info(`[Research] Got ${searchResults.length} real web results`);
  } catch (err) {
    logger.warn(`[Research] Web search failed: ${err.message}`);
  }

  const userPrompt = `Business context:\n${JSON.stringify(businessContext || {})}\n\nReal web search results:\n${JSON.stringify(searchResults)}\n\nGenerate 6 research items mixing real data from search results with AI analysis. Include actual source names where available.`;
  const response = await callOpenAI(apiKey, RESEARCH_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

const OPPORTUNITY_PROMPT = `You are an AI opportunity scout. Given a startup's context and real web data, identify 4 real funding opportunities, grants, accelerators, or events.
Return JSON array: [{ title, deadline (relative), match (0-100), description }]`;

export const getOpportunities = async (apiKey, businessContext) => {
  const year = new Date().getFullYear();
  let searchResults = [];
  try {
    const queries = [];
    if (businessContext?.blueprint?.industry) queries.push(`${businessContext.blueprint.industry} startup grants ${year}`);
    queries.push(`startup accelerators accepting applications ${year}`);
    queries.push(`small business grants ${year}`);

    const webData = await searchWebBatch(queries.slice(0, 2));
    searchResults = Object.values(webData).flat().slice(0, 8);
  } catch (err) {
    logger.warn(`[Research] Opportunity search failed: ${err.message}`);
  }

  const userPrompt = `Business context:\n${JSON.stringify(businessContext || {})}\n\nReal web results:\n${JSON.stringify(searchResults)}\n\nIdentify 4 real opportunities based on actual search results.`;
  const response = await callOpenAI(apiKey, OPPORTUNITY_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

const BRIEFING_PROMPT = `You are an AI co-founder's morning briefing generator. Generate a personalized morning briefing using real market data.
Return JSON: { greeting (personalized), findings: [{ title, detail }], focus: "string" }`;

export const getMorningBriefing = async (apiKey, profile, businessContext) => {
  let searchResults = [];
  try {
    const queries = [];
    queries.push('startup news today');
    if (businessContext?.blueprint?.industry) queries.push(`${businessContext.blueprint.industry} news`);
    const webData = await searchWebBatch(queries.slice(0, 2));
    searchResults = Object.values(webData).flat().slice(0, 6);
  } catch (err) {
    logger.warn(`[Research] Briefing search failed: ${err.message}`);
  }

  const userPrompt = `Founder: ${profile?.name || 'Founder'}\nStage: ${businessContext?.currentStage}\n\nToday's real news:\n${JSON.stringify(searchResults)}\n\nGenerate a morning briefing incorporating real news.`;
  const response = await callOpenAI(apiKey, BRIEFING_PROMPT, userPrompt, 0.4);
  return extractJSON(response);
};
