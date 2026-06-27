import { callOpenAI, extractJSON } from '../services/ai.js';

const PROMPT = `You are an AI document generator for startups. Given a document type and business context, generate professional content.
Return JSON: { title, content (full document body with markdown formatting), sections: [{ heading, body }] }

Available document types:
- business-plan: Full business plan with executive summary, market analysis, strategy, financials
- prd: Product Requirements Document with specs, user stories, acceptance criteria
- pitch-deck: Pitch deck outline with slide-by-slide content
- landing-page: Landing page copy with headline, subheadline, features, CTA
- investor-update: Investor update email template
- marketing-plan: Marketing strategy and campaign plan
- technical-spec: Technical specification / architecture document
- competitor-analysis: Competitive analysis report`;

export const generateDocument = async (apiKey, docType, businessContext) => {
  const userPrompt = `Generate a "${docType}" document for:\n${JSON.stringify(businessContext || {})}`;
  const response = await callOpenAI(apiKey, PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};
