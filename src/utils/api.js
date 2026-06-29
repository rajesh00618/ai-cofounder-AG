export const API_BASE = '/api';

const getApiKey = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('ai-cofounder-app-storage'));
    if (stored && stored.state && stored.state.apiKey) return stored.state.apiKey;
  } catch {}
  return null;
};

const getToken = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('ai-cofounder-auth-storage'));
    if (stored && stored.state && stored.state.token) return stored.state.token;
  } catch {}
  return null;
};

const getHeaders = () => {
  const apiKey = getApiKey();
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const API_TIMEOUT = 60000;
const STREAM_TIMEOUT = 60000;

const apiPost = async (path, body) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    let serializedBody;
    try { serializedBody = JSON.stringify(body); } catch {
      throw new Error('Failed to serialize request data');
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: serializedBody,
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: 'Request failed' }));
      const serverMsg = errBody.error || '';
      const friendly = res.status === 401 && serverMsg.includes('API key') ? 'AI service is not configured. Add an API key in Settings.'
        : res.status === 401 ? (serverMsg || 'Session expired. Please sign in again.')
        : res.status === 429 ? 'Too many requests. Please wait a moment.'
        : res.status >= 500 ? 'Our AI service is temporarily unavailable. Please try again.'
        : serverMsg || 'Something went wrong';
      throw new Error(friendly);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

const apiGet = async (path) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: getHeaders(),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: 'Request failed' }));
      const serverMsg = errBody.error || '';
      const friendly = res.status === 401 && serverMsg.includes('API key') ? 'AI service is not configured. Add an API key in Settings.'
        : res.status === 401 ? (serverMsg || 'Session expired. Please sign in again.')
        : res.status === 429 ? 'Too many requests. Please wait a moment.'
        : res.status >= 500 ? 'Our AI service is temporarily unavailable. Please try again.'
        : serverMsg || 'Something went wrong';
      throw new Error(friendly);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  // Auth
  register: (name, email, password) => apiPost('/auth/register', { name, email, password }),
  login: (email, password) => apiPost('/auth/login', { email, password }),
  getMe: () => apiGet('/auth/me'),
  forgotPassword: (email) => apiPost('/auth/forgot-password', { email }),
  resetPassword: (token, email, password) => apiPost('/auth/reset-password', { token, email, password }),

  // Streaming Chat
  chatStream: (message, context, onToken, onDone, onError) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT);
    const headers = getHeaders();

    fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, context }),
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Stream request failed' }));
        onError?.(errBody.error || `Request failed with status ${res.status}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamDone = false;
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onDone && !streamDone) onDone(accumulatedText || buffer || '');
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                await reader.cancel();
                onError?.(data.error);
                return;
              }
              if (data.done) {
                streamDone = true;
                await reader.cancel();
                onDone?.(data.fullText);
                return;
              }
              accumulatedText = data.fullText || accumulatedText + data.token;
              onToken?.(data.token, data.fullText);
            } catch (e) {
              console.warn('chatStream: failed to parse SSE data line', line.slice(6), e);
            }
          }
        }
      }
    }).catch(err => {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError') onError?.(err.message);
    });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  },

  // Existing endpoints
  chat: (message, context) => apiPost('/chat', { message, context }),
  chatWithAgent: (message, context, agent) => apiPost('/chat/agent', { message, context, agent }),
  evaluateGoal: (goal) => apiPost('/engines/reality', { goal }),
  negotiateGoal: (goal) => apiPost('/engines/negotiate', { goal }),
  boardMeeting: (question) => apiPost('/board', { question }),
  boardChat: (messages) => apiPost('/board/chat', { messages }),
  simulateDecision: (question) => apiPost('/simulate/decision', { question }),
  simulateCompany: (question) => apiPost('/simulate/company', { question }),
  simulateCustomer: (product, persona) => apiPost('/simulate/customer', { product, persona }),
  getResearch: (context = {}, filter = 'all') => apiPost('/research', { ...context, filter }),
  getOpportunities: (context = {}) => apiPost('/research/opportunities', { ...context }),
  getMorningBriefing: (context = {}) => apiPost('/research/briefing', { ...context }),
  getMemoryNodes: (founderId, limit = 100, offset = 0) => apiGet(`/memory/nodes/${encodeURIComponent(founderId)}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`),
  getMemoryTimeline: (founderId, limit = 200, offset = 0) => apiGet(`/memory/timeline/${encodeURIComponent(founderId)}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`),
  getMemoryGraph: (founderId, limit = 100, offset = 0) => apiGet(`/memory/graph/${encodeURIComponent(founderId)}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`),
  addMemoryNode: (founderId, type, label, metadata) => apiPost('/memory/nodes', { founderId, type, label, metadata }),
  addMemoryEdge: (sourceNodeId, targetNodeId, relationship) => apiPost('/memory/edges', { sourceNodeId, targetNodeId, relationship }),
  getExecutionPlan: (task) => apiPost('/execution/plan', { task }),
  executeStep: (stepId, task) => apiPost('/execution/step', { stepId, task }),
  generateBlueprint: (answers) => apiPost('/business/blueprint', { answers }),
  generateBlueprintFromGoal: (context) => apiPost('/business/blueprint', { answers: context }),
  getFailurePrediction: (context = {}) => apiPost('/failure/prediction', { ...context }),
  generateDocument: (type, context) => apiPost('/documents/generate', { type, context }),
  getRoadmapGuidance: (stage, context) => apiPost('/roadmap/guidance', { stage, ...context }),
  analyzeDNA: (profile) => apiPost('/founder/dna/analyze', { profile }),
  adaptDNA: (dnaScores, founderTwin, recentActivity) => apiPost('/founder/dna/adapt', { dnaScores, founderTwin, recentActivity }),
  getMission: (context) => apiPost('/command/mission', { ...context }),
  getHealth: (context) => apiPost('/command/health', { ...context }),
  submitReviewNote: (review, extra) => apiPost('/review/note', { review, ...extra }),
  getTaskSuggestions: (context) => apiPost('/tasks/suggest', { ...context }),
  getBusinessBlueprint: () => apiGet('/business/blueprint'),
  generateBlueprintTasks: (answers, blueprint) => apiPost('/business/blueprint/tasks', { answers, blueprint }),
  generateBlueprintScores: (answers, blueprint, profile) => apiPost('/business/blueprint/scores', { answers, blueprint, profile }),
  generateFullPlan: async (context, blueprint) => {
    const goalText = context?.[1] || '';
    const timeframeMatch = goalText.match(/\b(\d+)\s*(day|week|month|year)s?\b/i);
    const timeframe = timeframeMatch ? `${timeframeMatch[1]} ${timeframeMatch[2]}${timeframeMatch[1] !== '1' ? 's' : ''}` : null;

    const prompt = `You are a startup execution planner. Generate a complete phased execution plan to achieve the founder's goal within the stated timeframe.

Return ONLY a JSON object with a "phases" array. The response must be valid JSON and nothing else.

TIMEFRAME CONSTRAINT: The goal must be achieved within ${timeframe || 'the stated period'}. The total duration of ALL phases combined MUST NOT exceed ${timeframe || 'the goal timeframe'}. Break the timeframe into realistic phases — shorter goals mean shorter/denser phases.

REQUIREMENTS:
- The "phases" array contains phases that fit within the total timeframe
- Each phase has "title" (string), "goal" (string), "duration" (string e.g. "1 week", "3 days"), "tasks" (array)
- Each task has "title" (string), "description" (string), "priority" ("high"/"medium"/"low"), "estimatedTime" (string like "2 hrs"), "difficulty" ("easy"/"medium"/"hard")
- Each phase has 3-5 tasks
- Cover the full journey from start to goal completion — every phase must be necessary and fit within the total deadline

FOUNDER GOAL: ${goalText}
FOUNDER: ${context?.[5] || 'Unknown'}
REALITY SCORE: ${context?.[3] || 'Unknown'}

BUSINESS BLUEPRINT DATA:
Executive Summary: ${blueprint?.executiveSummary?.slice(0, 300) || ''}
Target Customer: ${blueprint?.targetCustomer || ''}
Problem: ${blueprint?.problem || ''}
Solution: ${blueprint?.solution || ''}
Revenue Model: ${blueprint?.revenueModel || ''}
Go-to-Market: ${blueprint?.gtmPlan || ''}
Validation Plan: ${blueprint?.validationPlan || ''}
MVP Plan: ${blueprint?.mvpPlan || ''}
Competitors: ${blueprint?.competitors || ''}
Risks: ${(blueprint?.risks || []).join(', ')}
Success Metrics: ${(blueprint?.successMetrics || []).join(', ')}`;

    const extractPlan = (raw) => {
      let text = typeof raw === 'string' ? raw : (raw?.content || '');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('AI returned non-object response');
      return parsed;
    };

    let plan;
    try {
      const res = await apiPost('/chat', { message: prompt, context: { goal: context?.[1], blueprint } });
      plan = extractPlan(res);
    } catch {
      const retryPrompt = prompt + '\n\nYour previous response was not valid. Return ONLY a JSON object with a "phases" array. No markdown, no explanation, just JSON.';
      const res = await apiPost('/chat', { message: retryPrompt, context: { goal: context?.[1], blueprint } });
      plan = extractPlan(res);
    }
    if (!plan?.phases || !Array.isArray(plan.phases)) {
      throw new Error('AI returned a plan without a phases array');
    }
    return plan;
  },
  healthCheck: () => apiGet('/health'),

  // Investor Mode
  investorEvaluate: (context) => apiPost('/investor/evaluate', { context }),
  investorChat: (message, context) => apiPost('/investor/chat', { message, context }),

  // Reviews
  generateWeeklyReview: (data) => apiPost('/review/weekly', data),

  // API Key (server-side storage)
  setApiKey: (apiKey) => apiPost('/auth/api-key', { apiKey }),
  getApiKeyStatus: () => apiGet('/auth/api-key'),

  // WhatsApp
  registerReminderPhone: (email, phone) => apiPost('/reminders/register', { email, phone }),
};
