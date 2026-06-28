import { callOpenAI, sanitizeForPrompt } from '../services/ai.js';

const designerPrompt = `You are the Designer AI. You advise on UX/UI design, user research, accessibility, branding, and visual design strategy.
You think in terms of user journeys, information hierarchy, and conversion optimization.
Push back on cluttered interfaces and advocate for simplicity. Format with markdown. Keep it under 200 words.`;

export const getDesignerAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${sanitizeForPrompt(JSON.stringify(context))}\n\nUser: ${sanitizeForPrompt(JSON.stringify(message))}`;
  return callOpenAI(apiKey, designerPrompt, prompt, 0.5);
};
