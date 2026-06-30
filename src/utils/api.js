import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export const API_BASE = '/api';

const getApiKey = () => {
  try {
    return useAppStore.getState().apiKey || '';
  } catch {
    return '';
  }
};

const getToken = () => {
  try {
    return useAuthStore.getState().token || '';
  } catch {
    return '';
  }
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

const fetchWithRetry = async (url, options, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      if (err.name === 'AbortError') throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
    }
  }
};

const apiPost = async (path, body) => {
  try {
    let serializedBody;
    try { serializedBody = JSON.stringify(body); } catch {
      throw new Error('Failed to serialize request data');
    }
    const headers = getHeaders();
    const res = await fetchWithRetry(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: serializedBody,
      signal: AbortSignal.timeout(API_TIMEOUT),
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
  }
};

const apiGet = async (path) => {
  try {
    const headers = getHeaders();
    const res = await fetchWithRetry(`${API_BASE}${path}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(API_TIMEOUT),
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
      let lineBuffer = '';
      let streamDone = false;
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onDone && !streamDone) onDone(accumulatedText || buffer || '');
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const fullBuffer = buffer;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (i === 0 && lineBuffer) {
            line = lineBuffer + line;
            lineBuffer = '';
          }
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
              accumulatedText = data.fullText || accumulatedText + (data.token || '');
              onToken?.(data.token, accumulatedText);
            } catch {
              if (i === lines.length - 1 && !fullBuffer.endsWith('\n')) {
                lineBuffer = line;
              }
            }
          }
        }
      }
    }).catch(err => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        onError?.('Request timed out. Please check your connection and try again.');
      } else {
        onError?.(err.message);
      }
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
  boardChat: (messages, context) => apiPost('/board/chat', { messages, context }),
  simulateDecision: (question, context) => apiPost('/simulate/decision', { question, context }),
  simulateCompany: (question, context) => apiPost('/simulate/company', { question, context }),
  simulateCustomer: (product, persona, context) => apiPost('/simulate/customer', { product, persona, context }),
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
  recalculateScores: (answers, blueprint, profile, tasks, currentStage) => apiPost('/business/scores/recalculate', { answers, blueprint, profile, tasks, currentStage }),
  generateFullPlan: async (context, blueprint) => {
    const goalText = context?.[1] || '';
    const founder = context?.[5] || 'Unknown';
    const realityScore = context?.[3] || 'Unknown';
    const planContext = { goalText, founder, realityScore };

    let plan;
    try {
      plan = await apiPost('/execution/full-plan', { context: planContext, blueprint });
    } catch (err) {
      if (err.message?.includes('unavailable') || err.message?.includes('timed out') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        plan = await apiPost('/execution/full-plan', { context: planContext, blueprint });
      } else {
        throw err;
      }
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
