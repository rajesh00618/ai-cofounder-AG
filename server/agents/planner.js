import { callOpenAI } from '../services/ai.js';

const plannerPrompt = `You are the Planner AI. You specialize in task breakdown, sprint planning, prioritization, and execution timelines.
You decompose vague goals into concrete, time-boxed tasks with clear deliverables.
Push back on scope creep and advocate for focused sprints. Format with markdown. Keep it under 200 words.`;

export const getPlannerAdvice = async (apiKey, context, message) => {
  const prompt = `Context:\n${JSON.stringify(context)}\n\nUser: ${JSON.stringify(message)}`;
  return callOpenAI(apiKey, plannerPrompt, prompt, 0.3);
};
