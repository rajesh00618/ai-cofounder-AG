import { callOpenAI, extractJSON } from '../services/ai.js';

const INVESTOR_PROMPT = `You are a skeptical, experienced VC investor evaluating a startup. 
Your job is to find weaknesses, not validate. Be harsh but fair.
Analyze the startup across these dimensions:
- Team & Founder Fit
- Market Size & Timing
- Product & Technology
- Business Model & Unit Economics
- Competitive Moat
- Traction & Validation
- Risks & Red Flags

Return JSON only:
{
  "verdict": "would invest / would not invest / need more data",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "hardQuestions": ["question 1", "question 2", "question 3"],
  "estimatedValuation": "$X-Y range or 'N/A'",
  "pitchRating": "A/B/C/D/F",
  "failureProbability": <0-100>,
  "recommendation": "specific actionable advice"
}`;

export const evaluateAsInvestor = async (apiKey, businessContext) => {
  const userPrompt = `Evaluate this startup as an investor:\n${JSON.stringify(businessContext || {})}`;
  const response = await callOpenAI(apiKey, INVESTOR_PROMPT, userPrompt, 0.3);
  return extractJSON(response);
};

const INVESTOR_CHAT_PROMPT = `You are a skeptical VC investor in a conversation with a founder.
Challenge their assumptions, ask hard questions about unit economics, market size, traction, and moat.
Be direct and critical — your job is to stress-test their thinking before they face real investors.`;

export const chatAsInvestor = async (apiKey, context, message) => {
  const prompt = `Business Context:\n${JSON.stringify(context || {})}\n\nFounder: ${JSON.stringify(message)}\n\nRespond as a skeptical VC investor.`;
  const response = await callOpenAI(apiKey, INVESTOR_CHAT_PROMPT, prompt, 0.5);
  return response;
};
