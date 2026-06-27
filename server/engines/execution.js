import { callOpenAI, extractJSON } from '../services/ai.js';

export const generateExecutionPlan = async (apiKey, task) => {
  const prompt = `You are an AI execution engine. Given a task, generate a step-by-step execution plan with 4-6 steps.
Return JSON: {
  "task": "the original task",
  "plan": {
    "estimatedTime": "estimated total time like ~5 minutes",
    "steps": [{ "id": 1, "label": "Step name", "duration": "estimated duration like 30s" }]
  },
  "result": "Task execution completed successfully."
}`;
  const userPrompt = `Task: ${JSON.stringify(task)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};

export const executeStep = async (apiKey, stepId, task) => {
  const prompt = `You are an AI execution engine executing step ${stepId} of a task. Generate a realistic, detailed output describing what was accomplished.
Respond with a single concise paragraph (1-3 sentences). Do NOT use JSON. Just return the output text.`;
  const userPrompt = `Task: ${JSON.stringify(task)}\nStep Number: ${stepId}`;
  const output = await callOpenAI(apiKey, prompt, userPrompt, 0.4);
  return { output: output.trim() };
};
