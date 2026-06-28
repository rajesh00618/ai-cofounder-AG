import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';

vi.mock(import('../../services/ai.js'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callOpenAI: vi.fn(() => Promise.resolve(JSON.stringify({
      content: 'AI response',
      responses: [{ agent: 'CEO AI', position: 'test' }],
      failureProbability: 30,
      topRisks: [{ risk: 'test', impact: 'high', mitigation: 'fix' }],
      recommendation: 'test',
      score: 75,
      verdict: 'promising',
    }))),
    callOpenAIStream: vi.fn(),
  };
});

const mockResult = (val) => Promise.resolve(val);

vi.mock(import('../../engines/simulation.js'), () => ({
  runDecisionSimulation: vi.fn(() => mockResult({ scenarios: [] })),
  runCompanySimulation: vi.fn(() => mockResult({ virtualCustomers: 1000 })),
  simulateCustomerReaction: vi.fn(() => mockResult({ reaction: 'test' })),
}));

vi.mock(import('../../engines/research.js'), () => ({
  getResearch: vi.fn(() => mockResult([])),
  getOpportunities: vi.fn(() => mockResult([])),
  getMorningBriefing: vi.fn(() => mockResult({ briefing: 'test' })),
}));

vi.mock(import('../../engines/execution.js'), () => ({
  generateExecutionPlan: vi.fn(() => mockResult({ steps: [] })),
  executeStep: vi.fn(() => mockResult({ output: 'done' })),
}));

vi.mock(import('../../engines/business.js'), () => ({
  generateBlueprint: vi.fn(() => mockResult({ executiveSummary: 'Test blueprint' })),
  generateBlueprintTasks: vi.fn(() => mockResult([])),
  generateScores: vi.fn(() => mockResult({ businessHealth: {} })),
}));

vi.mock(import('../../engines/documents.js'), () => ({
  generateDocument: vi.fn(() => mockResult({ title: 'doc' })),
}));

vi.mock(import('../../engines/roadmap.js'), () => ({
  generateRoadmap: vi.fn(() => mockResult({ stages: [] })),
  generateStageGuidance: vi.fn(() => mockResult({ advice: 'test' })),
}));

vi.mock(import('../../engines/dna.js'), () => ({
  analyzeDNA: vi.fn(() => mockResult({ riskTolerance: 70 })),
  generateAdaptations: vi.fn(() => mockResult({ adaptations: [] })),
}));

vi.mock(import('../../engines/mission.js'), () => ({
  generateMission: vi.fn(() => mockResult({ mission: 'test' })),
  generateHealthAnalysis: vi.fn(() => mockResult({ recommendation: 'test' })),
}));

vi.mock(import('../../engines/review.js'), () => ({
  generateReviewNote: vi.fn(() => mockResult({ note: 'test' })),
  suggestTasks: vi.fn(() => mockResult({ tasks: [] })),
}));

vi.mock(import('../../engines/memory.js'), () => ({
  addMemoryNode: vi.fn(() => mockResult('node-id')),
  getMemoryNodes: vi.fn(() => mockResult([])),
  getMemoryTimeline: vi.fn(() => mockResult([])),
  addMemoryEdge: vi.fn(() => mockResult('edge-id')),
  getMemoryGraph: vi.fn(() => mockResult({ nodes: [], edges: [] })),
}));

vi.mock(import('../../agents/index.js'), () => ({
  getCEOAdvice: vi.fn(() => mockResult('CEO advice')),
  getCTOAdvice: vi.fn(() => mockResult('CTO advice')),
  getCMOAdvice: vi.fn(() => mockResult('CMO advice')),
  getSalesAdvice: vi.fn(() => mockResult('Sales advice')),
  getFinanceAdvice: vi.fn(() => mockResult('Finance advice')),
  getResearchAdvice: vi.fn(() => mockResult('Research advice')),
}));

vi.mock(import('../auth.js'), () => ({
  requireJwt: (req, _res, next) => {
    req.userId = req.headers['x-user-id'] || 'test-user';
    next();
  },
  default: { post: vi.fn(), get: vi.fn() },
}));

import apiRouter from '../api.js';

describe('API Routes', () => {
  let app;
  let server;
  let base;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    const addr = server.address();
    base = `http://localhost:${addr.port}/api`;
  });

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  it('rejects requests without API key (401)', async () => {
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hi' }),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('API key');
  });

  it('rejects requests missing required body fields (400)', async () => {
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing required field');
  });

  it('responds to /chat with valid API key and message', async () => {
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ message: 'Hello' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('confidence');
  });

  it('responds to /engines/reality endpoint', async () => {
    const res = await fetch(`${base}/engines/reality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ goal: 'Build a unicorn' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('score');
  });

  it('responds to /simulate/decision endpoint', async () => {
    const res = await fetch(`${base}/simulate/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ question: 'Pivot?' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('scenarios');
  });

  it('responds to /board endpoint', async () => {
    const res = await fetch(`${base}/board`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ question: 'Strategy?' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('responses');
  });

  it('responds to /failure/prediction endpoint', async () => {
    const res = await fetch(`${base}/failure/prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ stage: 'early' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('failureProbability');
  });

  it('responds to /business/blueprint/tasks endpoint', async () => {
    const res = await fetch(`${base}/business/blueprint/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ answers: { 1: 'test' } }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('tasks');
  });

  it('responds to /execution/plan endpoint', async () => {
    const res = await fetch(`${base}/execution/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ task: 'Build MVP' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 401 for protected routes without JWT', async () => {
    const res = await fetch(`${base}/business/blueprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { 1: 'test' } }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 502 when AI returns valid JSON but malformed board response', async () => {
    const { callOpenAI } = await import('../../services/ai.js');
    callOpenAI.mockResolvedValueOnce(JSON.stringify({ noResponsesField: true }));
    const res = await fetch(`${base}/board`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ question: 'Strategy?' }),
    });
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toContain('malformed');
  });

  it('returns 500 when AI call throws an error', async () => {
    const { callOpenAI } = await import('../../services/ai.js');
    callOpenAI.mockRejectedValueOnce(new Error('AI service unavailable'));
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k' },
      body: JSON.stringify({ message: 'Hi' }),
    });
    expect(res.status).toBe(500);
  });

  it('handles engine errors with 500 status', async () => {
    const { generateBlueprint } = await import('../../engines/business.js');
    generateBlueprint.mockRejectedValueOnce(new Error('Engine failure'));
    const res = await fetch(`${base}/business/blueprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'k', 'x-user-id': 'user-1' },
      body: JSON.stringify({ answers: { 1: 'test' } }),
    });
    expect(res.status).toBe(500);
  });
});
