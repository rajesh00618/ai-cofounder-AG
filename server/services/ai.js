import OpenAI from 'openai';

const MODELS = [
  { model: 'meta/llama-4-maverick-17b-128e-instruct', baseURL: 'https://integrate.api.nvidia.com/v1' },
  { model: 'mistralai/mistral-large', baseURL: 'https://integrate.api.nvidia.com/v1' },
  { model: 'microsoft/phi-4', baseURL: 'https://integrate.api.nvidia.com/v1' },
];

const createClient = (apiKey, config) => new OpenAI({
  apiKey,
  baseURL: config.baseURL,
  timeout: 30000,
  maxRetries: 1,
});

export const callOpenAI = async (apiKey, systemPrompt, userPrompt, temperature = 0.7) => {
  if (!apiKey) throw new Error('No API key provided.');

  const preferredModel = process.env.AI_MODEL;
  const preferredBaseURL = process.env.AI_BASE_URL;

  const candidates = preferredModel
    ? [{ model: preferredModel, baseURL: preferredBaseURL || MODELS[0].baseURL }]
    : MODELS;

  let lastError;
  for (const config of candidates) {
    try {
      const openai = createClient(apiKey, config);
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
      });
      return completion.choices[0].message.content;
    } catch (err) {
      lastError = err;
      console.warn(`[AI] Model ${config.model} failed: ${err.message}. Trying next...`);
    }
  }
  throw lastError || new Error('All AI models failed');
};

export const callOpenAIStream = async (apiKey, systemPrompt, userPrompt, onToken, temperature = 0.7) => {
  if (!apiKey) throw new Error('No API key provided.');

  const preferredModel = process.env.AI_MODEL;
  const preferredBaseURL = process.env.AI_BASE_URL;

  const candidates = preferredModel
    ? [{ model: preferredModel, baseURL: preferredBaseURL || MODELS[0].baseURL }]
    : MODELS;

  let lastError;
  for (const config of candidates) {
    try {
      const openai = createClient(apiKey, config);
      const stream = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        stream: true,
      });

      let full = '';
      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content || '';
        if (text) {
          full += text;
          onToken(text, full);
        }
      }
      return full;
    } catch (err) {
      lastError = err;
      console.warn(`[AI] Stream model ${config.model} failed: ${err.message}. Trying next...`);
    }
  }
  throw lastError || new Error('All AI stream models failed');
};

export const extractJSON = (text) => {
  if (!text || typeof text !== 'string') throw new Error('Empty response from AI');
  const trimmed = text.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const toParse = match ? match[1].trim() : trimmed;
  try {
    return JSON.parse(toParse);
  } catch {
    const jsonStart = toParse.indexOf('{');
    const jsonEnd = toParse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(toParse.slice(jsonStart, jsonEnd + 1));
    }
    const arrStart = toParse.indexOf('[');
    const arrEnd = toParse.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd > arrStart) {
      return JSON.parse(toParse.slice(arrStart, arrEnd + 1));
    }
    throw new Error(`Invalid JSON response from AI: ${trimmed.slice(0, 200)}`);
  }
};

export const PROMPTS = {
  CEO: `You are the CEO AI Co-Founder. You are highly experienced, direct, and focused on execution. 
You challenge assumptions and push the human founder to focus on high-impact validation and revenue over busywork.
Format your responses with clear markdown (bolding, bullet points). Keep it under 200 words. Be slightly adversarial if the founder is avoiding hard truths.`,

  REALITY_ENGINE: `You are the Reality Engine. Your job is to destroy fragile startup ideas.
The user will provide a goal. You must evaluate it across 8 dimensions: Market Size, Competition, Tech Risk, Customer Access, Founder Fit, Revenue Potential, Timing, Execution Complexity.
Respond ONLY in JSON format:
{
  "score": <overall score 0-100>,
  "dimensions": {
    "market": <0-100>, "competition": <0-100>, "tech": <0-100>, "customer": <0-100>,
    "founder": <0-100>, "revenue": <0-100>, "timing": <0-100>, "execution": <0-100>
  },
  "risks": ["risk 1", "risk 2", "risk 3"],
  "verdict": "A 1-2 sentence brutal summary"
}`,

  NEGOTIATION_ENGINE: `You are the Negotiation Engine. The founder proposed an unrealistic goal. 
Provide 3 alternative, more realistic goals that get them 80% of the way there with 20% of the effort.
Format strictly as JSON:
{
  "alternatives": [
    { "title": "Alternative 1", "probability": "high|medium|low", "why": "Why this is better" },
    { "title": "Alternative 2", "probability": "high|medium|low", "why": "Why this is better" },
    { "title": "Alternative 3", "probability": "high|medium|low", "why": "Why this is better" }
  ]
}`,

  BOARD_MEETING: `You are a panel of AI Startup Board Members (CEO, CTO, CMO, CFO). 
The user asks a strategic question. You must simulate a debate.
Format strictly as JSON:
{
  "responses": [
    { "agent": "CEO AI", "icon": "👔", "color": "#6366f1", "position": "The CEO's stance" },
    { "agent": "CTO AI", "icon": "💻", "color": "#10b981", "position": "The CTO's stance focusing on tech/risk" },
    { "agent": "CMO AI", "icon": "📢", "color": "#ec4899", "position": "The CMO's stance on growth/brand" },
    { "agent": "CFO AI", "icon": "📊", "color": "#f59e0b", "position": "The CFO's stance on burn/unit economics" }
  ]
}`
};
