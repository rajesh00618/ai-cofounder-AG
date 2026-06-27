import express from 'express';
import jwt from 'jsonwebtoken';
import { callOpenAI, callOpenAIStream, PROMPTS, extractJSON } from '../services/ai.js';
import { evaluateGoal, calculateRealityScore } from '../engines/reality.js';
import { negotiateGoal } from '../engines/negotiation.js';
import { runDecisionSimulation, runCompanySimulation, simulateCustomerReaction } from '../engines/simulation.js';
import { getResearch, getOpportunities, getMorningBriefing } from '../engines/research.js';
import { addMemoryNode, getMemoryNodes, getMemoryTimeline, addMemoryEdge, getMemoryGraph } from '../engines/memory.js';
import { generateExecutionPlan, executeStep } from '../engines/execution.js';
import { generateBlueprint } from '../engines/business.js';
import { generateDocument } from '../engines/documents.js';
import { generateRoadmap, generateStageGuidance } from '../engines/roadmap.js';
import { analyzeDNA, generateAdaptations } from '../engines/dna.js';
import { generateMission, generateHealthAnalysis } from '../engines/mission.js';
import { generateReviewNote, suggestTasks } from '../engines/review.js';
import { getCEOAdvice, getCTOAdvice, getCMOAdvice, getSalesAdvice, getFinanceAdvice, getResearchAdvice } from '../agents/index.js';
import { JWT_SECRET as getJwtSecret } from './auth.js';

const router = express.Router();

const requireJwt = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], getJwtSecret());
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const pick = (body, ...keys) => { for (const k of keys) { if (body[k] !== undefined && body[k] !== null && body[k] !== '') return body[k]; } return undefined; };

/**
 * Middleware to get API key.
 * NEVER falls back to process.env.NVIDIA_API_KEY for user requests.
 * Users must provide their own x-api-key header.
 */
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key is required. Provide your own x-api-key header.' });
  req.apiKey = apiKey;
  next();
};

const requireBody = (...fieldGroups) => (req, res, next) => {
  for (const group of fieldGroups) {
    const fields = Array.isArray(group) ? group : [group];
    const found = fields.some(f => req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== '');
    if (!found) {
      return res.status(400).json({ error: `Missing required field: one of [${fields.join(', ')}]` });
    }
  }
  next();
};

router.post('/chat', requireApiKey, requireBody('message'), async (req, res) => {
  try {
    const { message, context } = req.body;
    const prompt = `Context:\n${JSON.stringify(context || {})}\n\nUser: ${JSON.stringify(message)}`;
    const response = await callOpenAI(req.apiKey, PROMPTS.CEO, prompt, 0.7);
    const confidence = Math.min(70 + Math.floor((message?.length || 10) / 10), 99);
    res.json({ content: response, confidence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat/stream', requireApiKey, requireBody('message'), async (req, res) => {
  try {
    const { message, context } = req.body;
    const prompt = `Context:\n${JSON.stringify(context || {})}\n\nUser: ${JSON.stringify(message)}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const full = await callOpenAIStream(req.apiKey, PROMPTS.CEO, prompt, (token, fullText) => {
      res.write(`data: ${JSON.stringify({ token, fullText })}\n\n`);
    }, 0.7);

    res.write(`data: ${JSON.stringify({ done: true, fullText: full })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

router.post('/chat/agent', requireApiKey, requireBody('message', 'agent'), async (req, res) => {
  try {
    const { message, context, agent } = req.body;
    const agents = { ceo: getCEOAdvice, cto: getCTOAdvice, cmo: getCMOAdvice, sales: getSalesAdvice, finance: getFinanceAdvice, research: getResearchAdvice };
    const agentFn = agents[agent] || getCEOAdvice;
    const response = await agentFn(req.apiKey, context || {}, message);
    const confidence = Math.min(70 + Math.floor((message?.length || 10) / 10), 99);
    res.json({ content: response, confidence, agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/engines/reality', requireApiKey, requireBody('goal'), async (req, res) => {
  try {
    const { goal } = req.body;
    const response = await evaluateGoal(req.apiKey, goal);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/engines/reality/score', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Missing required field: answers' });
    }
    const score = calculateRealityScore(answers);
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/engines/negotiate', requireApiKey, requireBody('goal'), async (req, res) => {
  try {
    const { goal } = req.body;
    const response = await negotiateGoal(req.apiKey, goal);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/simulate/decision', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const result = await runDecisionSimulation(req.apiKey, question);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/simulate/company', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const result = await runCompanySimulation(req.apiKey, question);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/simulate/customer', requireApiKey, requireBody('product'), async (req, res) => {
  try {
    const { product, persona } = req.body;
    const result = await simulateCustomerReaction(req.apiKey, product, persona || 'customer');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/board', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const response = await callOpenAI(req.apiKey, PROMPTS.BOARD_MEETING, `Debate this topic: ${question}`, 0.8);
    const parsed = extractJSON(response);
    // Validate parsed structure before returning
    if (!parsed || !parsed.responses || !Array.isArray(parsed.responses)) {
      return res.status(502).json({ error: 'AI returned malformed board meeting response' });
    }
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/board/chat', requireApiKey, requireBody('messages'), async (req, res) => {
  try {
    const { messages } = req.body;
    const formatted = messages.map(m =>
      `${m.role === 'user' ? 'Founder' : m.name || 'Board'}: ${m.content}`
    ).join('\n\n');
    const prompt = `Here is the board discussion so far:\n\n${formatted}\n\nBoard members, continue the debate responding to the latest points raised.`;
    const response = await callOpenAI(req.apiKey, PROMPTS.BOARD_MEETING, prompt, 0.8);
    const parsed = extractJSON(response);
    if (!parsed || !parsed.responses || !Array.isArray(parsed.responses)) {
      return res.status(502).json({ error: 'AI returned malformed board meeting response' });
    }
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RESEARCH ---
router.post('/research', requireApiKey, async (req, res) => {
  try {
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth', 'startupScore');
    const filter = pick(req.body, 'filter') || 'all';
    const items = await getResearch(req.apiKey, context || {});
    res.json(Array.isArray(items) ? items.filter(i => filter === 'all' || i.category === filter || i.type === filter) : items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/research/opportunities', requireApiKey, async (req, res) => {
  try {
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth');
    const opportunities = await getOpportunities(req.apiKey, context || {});
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/research/briefing', requireApiKey, async (req, res) => {
  try {
    const profile = pick(req.body, 'profile') || {};
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth');
    const briefing = await getMorningBriefing(req.apiKey, profile, context || { currentStage: pick(req.body, 'stage', 'currentStage') });
    res.json(briefing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED DOCUMENTS ---
router.post('/documents/generate', requireApiKey, requireBody(['docType', 'type', 'documentType'], ['context', 'blueprint']), async (req, res) => {
  try {
    const docType = pick(req.body, 'docType', 'type', 'documentType');
    const context = pick(req.body, 'context', 'blueprint') || {};
    const doc = await generateDocument(req.apiKey, docType, context);
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED ROADMAP ---
router.post('/roadmap/generate', requireApiKey, requireBody('blueprint'), async (req, res) => {
  try {
    const { blueprint } = req.body;
    const roadmap = await generateRoadmap(req.apiKey, blueprint);
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/roadmap/guidance', requireApiKey, requireBody(['currentStage', 'stage']), async (req, res) => {
  try {
    const currentStage = pick(req.body, 'currentStage', 'stage');
    const businessHealth = pick(req.body, 'businessHealth') || {};
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const guidance = await generateStageGuidance(req.apiKey, currentStage, businessHealth, dnaScores);
    res.json({ guidance: guidance.advice || guidance.guidance || JSON.stringify(guidance) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED FOUNDER DNA ---
router.post('/founder/dna/analyze', requireApiKey, requireBody('profile'), async (req, res) => {
  try {
    const { profile } = req.body;
    const result = await analyzeDNA(req.apiKey, profile);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/founder/dna/adapt', requireApiKey, requireBody(['dnaScores', 'profile']), async (req, res) => {
  try {
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const founderTwin = pick(req.body, 'founderTwin') || {};
    const recentActivity = pick(req.body, 'recentActivity');
    const result = await generateAdaptations(req.apiKey, dnaScores, founderTwin, recentActivity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED COMMAND CENTER ---
router.post('/command/mission', requireApiKey, async (req, res) => {
  try {
    const context = pick(req.body, 'context', 'businessHealth', 'startupScore', 'profile') || {};
    const tasks = pick(req.body, 'tasks') || [];
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const mission = await generateMission(req.apiKey, context, tasks, dnaScores);
    res.json({ mission: mission.mission || mission.recommendation || JSON.stringify(mission) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/command/health', requireApiKey, async (req, res) => {
  try {
    const blueprint = pick(req.body, 'blueprint', 'businessHealth', 'startupScore') || {};
    const businessHealth = pick(req.body, 'businessHealth') || {};
    const analysis = await generateHealthAnalysis(req.apiKey, typeof blueprint === 'object' ? blueprint : {}, businessHealth);
    res.json({ recommendation: analysis.recommendation || analysis.alert || JSON.stringify(analysis) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED REVIEW ---
router.post('/review/note', requireApiKey, requireBody(['review', 'responses']), async (req, res) => {
  try {
    const review = pick(req.body, 'review', 'responses');
    const profile = pick(req.body, 'profile') || {};
    const tasks = pick(req.body, 'tasks') || [];
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const note = await generateReviewNote(req.apiKey, review, profile, tasks, dnaScores);
    res.json({ note: note.note || JSON.stringify(note) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI-POWERED TASK SUGGESTIONS ---
router.post('/tasks/suggest', requireApiKey, async (req, res) => {
  try {
    const blueprint = pick(req.body, 'blueprint', 'sprint') || {};
    const stage = pick(req.body, 'stage', 'currentStage') || 'ideation';
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const result = await suggestTasks(req.apiKey, blueprint, stage, dnaScores);
    res.json({ suggestions: (result.tasks || []).map(t => t.title) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MEMORY ---
router.post('/memory/nodes', requireJwt, requireBody('founderId', 'type', 'label'), async (req, res) => {
  try {
    const { founderId, type, label, metadata } = req.body;
    const id = await addMemoryNode(req.userId, founderId, type, label, metadata);
    res.json({ id, message: 'Memory node created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memory/nodes/:founderId', requireJwt, async (req, res) => {
  try {
    const nodes = await getMemoryNodes(req.userId, req.params.founderId);
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memory/timeline/:founderId', requireJwt, async (req, res) => {
  try {
    const timeline = await getMemoryTimeline(req.userId, req.params.founderId);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/memory/edges', requireJwt, requireBody('sourceNodeId', 'targetNodeId', 'relationship'), async (req, res) => {
  try {
    const { sourceNodeId, targetNodeId, relationship } = req.body;
    const id = await addMemoryEdge(req.userId, sourceNodeId, targetNodeId, relationship);
    res.json({ id, message: 'Memory edge created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memory/graph/:founderId', requireJwt, async (req, res) => {
  try {
    const graph = await getMemoryGraph(req.userId, req.params.founderId);
    res.json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- BUSINESS BLUEPRINT ---
const _blueprintCache = new Map();
const BLUEPRINT_TTL = 3600000;

const getCachedBlueprint = (userId) => {
  const entry = _blueprintCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.ts > BLUEPRINT_TTL) {
    _blueprintCache.delete(userId);
    return null;
  }
  return entry.data;
};

router.post('/business/blueprint', requireJwt, requireApiKey, requireBody('answers'), async (req, res) => {
  try {
    const { answers, profile } = req.body;
    const result = await generateBlueprint(req.apiKey, answers, profile);
    _blueprintCache.set(req.userId, { data: result, ts: Date.now() });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/business/blueprint', requireJwt, async (req, res) => {
  const cached = getCachedBlueprint(req.userId);
  if (cached) return res.json(cached);
  res.status(404).json({ error: 'No blueprint found for this user' });
});

// --- EXECUTION ---
router.post('/execution/plan', requireApiKey, requireBody('task'), async (req, res) => {
  try {
    const { task } = req.body;
    const plan = await generateExecutionPlan(req.apiKey, task);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/execution/step', requireApiKey, requireBody('stepId', 'task'), async (req, res) => {
  try {
    const { stepId, task } = req.body;
    const result = await executeStep(req.apiKey, stepId, task);
    res.json({ stepId, output: result.output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- FAILURE PREDICTION ---
router.post('/failure/prediction', requireApiKey, async (req, res) => {
  try {
    const context = req.body || {};
    const prompt = `You are a startup failure prediction engine. Analyze the provided business context and predict failure probability and key risks.

Respond ONLY in JSON format:
{
  "failureProbability": <number 0-100>,
  "topRisks": [
    { "risk": "risk description", "impact": "high/medium/low", "mitigation": "how to mitigate" }
  ],
  "recommendation": "A 1-2 sentence actionable recommendation"
}

Business context: ${JSON.stringify(context)}`;

    const response = await callOpenAI(req.apiKey, 'You are a startup failure prediction engine. Analyze the provided business context and predict failure probability.', prompt, 0.7);
    const parsed = extractJSON(response);
    // Validate structure
    if (typeof parsed?.failureProbability !== 'number') {
      return res.status(502).json({ error: 'AI returned malformed prediction response' });
    }
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
