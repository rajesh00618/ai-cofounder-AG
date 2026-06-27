const API_BASE = 'http://localhost:3001/api';

const getHeaders = () => {
  const apiKey = localStorage.getItem('ai-cofounder-apikey');
  const token = localStorage.getItem('ai-cofounder-token');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const apiPost = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'API Error');
  return res.json();
};

const apiGet = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).error || 'API Error');
  return res.json();
};

export const api = {
  // Auth
  register: (name, email, password) => apiPost('/auth/register', { name, email, password }),
  login: (email, password) => apiPost('/auth/login', { email, password }),
  getMe: () => apiGet('/auth/me'),

  // Existing
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
  getMemoryNodes: (founderId) => apiGet(`/memory/nodes/${founderId}`),
  getMemoryTimeline: (founderId) => apiGet(`/memory/timeline/${founderId}`),
  addMemoryNode: (founderId, type, label, metadata) => apiPost('/memory/nodes', { founderId, type, label, metadata }),
  getExecutionPlan: (task) => apiPost('/execution/plan', { task }),
  executeStep: (stepId, task) => apiPost('/execution/step', { stepId, task }),
  generateBlueprint: (answers) => apiPost('/business/blueprint', { answers }),
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
  healthCheck: () => apiGet('/api/health'),
};
