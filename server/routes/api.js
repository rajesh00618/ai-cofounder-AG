import express from 'express';

import { callOpenAI, callOpenAIStream, PROMPTS, extractJSON, sanitizeOutput, sanitizeForPrompt } from '../services/ai.js';
import { evaluateGoal, calculateRealityScore } from '../engines/reality.js';
import { negotiateGoal } from '../engines/negotiation.js';
import { runDecisionSimulation, runCompanySimulation, simulateCustomerReaction } from '../engines/simulation.js';
import { getResearch, getOpportunities, getMorningBriefing } from '../engines/research.js';
import { addMemoryNode, getMemoryNodes, getMemoryTimeline, addMemoryEdge, getMemoryGraph } from '../engines/memory.js';
import { generateExecutionPlan, executeStep } from '../engines/execution.js';
import { generateBlueprint, generateBlueprintTasks, generateScores } from '../engines/business.js';
import { generateDocument } from '../engines/documents.js';
import { generateRoadmap, generateStageGuidance } from '../engines/roadmap.js';
import { analyzeDNA, generateAdaptations } from '../engines/dna.js';
import { generateMission, generateHealthAnalysis } from '../engines/mission.js';
import { generateReviewNote, suggestTasks } from '../engines/review.js';
import { getCEOAdvice, getCTOAdvice, getCMOAdvice, getSalesAdvice, getFinanceAdvice, getResearchAdvice, getLegalAdvice, getDesignerAdvice, getDeveloperAdvice, getPlannerAdvice } from '../agents/index.js';
import { evaluateAsInvestor, chatAsInvestor } from '../engines/investor.js';
import { generateWeeklyReview } from '../engines/weekly.js';
import { requireJwt } from './auth.js';
import { sendError } from '../services/errors.js';
import { logger } from '../services/logger.js';
import { getApiKey } from '../apiKeyCache.js';

const router = express.Router();

/**
 * Middleware to get API key.
 * Falls back to env var ONLY when ALLOW_SERVER_KEY_FALLBACK is explicitly enabled.
 * This prevents unauthenticated users from consuming the server's AI quota.
 */
const requireApiKey = (req, res, next) => {
  const allowFallback = process.env.ALLOW_SERVER_KEY_FALLBACK === 'true';
  const cachedKey = req.userId ? getApiKey(req.userId) : null;
  const apiKey = cachedKey || req.headers['x-api-key'] || (allowFallback ? process.env.NVIDIA_API_KEY : null);
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required.' });
  }
  req.apiKey = apiKey;
  next();
};

const pick = (body, ...keys) => { for (const k of keys) { if (body[k] !== undefined && body[k] !== null && body[k] !== '') return body[k]; } return undefined; };

const sanitizeContext = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, 5000);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
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
    const sanitizedContext = sanitizeContext(context);
    const prompt = `Context:\n${JSON.stringify(sanitizedContext || {})}\n\nUser: ${JSON.stringify(message)}`;
    const response = sanitizeOutput(await callOpenAI(req.apiKey, PROMPTS.CEO, prompt, 0.7));
    const confidence = response?.length > 100 ? 85 : response?.length > 50 ? 75 : 65;
    res.json({ content: response, confidence, confidenceReason: confidence >= 80 ? 'High confidence — detailed reasoning available' : confidence >= 70 ? 'Medium confidence — consider verifying key assumptions' : 'Lower confidence — limited context for this response' });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/chat/stream', requireApiKey, requireBody('message'), async (req, res) => {
  try {
    const { message, context } = req.body;
    const sanitizedContext = sanitizeContext(context);
    const prompt = `Context:\n${JSON.stringify(sanitizedContext || {})}\n\nUser: ${JSON.stringify(message)}`;

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
    logger.error(`[Chat Stream] ${error.message}`);
    res.write(`data: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`);
    res.end();
  }
});

router.post('/chat/agent', requireApiKey, requireBody('message', 'agent'), async (req, res) => {
  try {
    const { message, context, agent } = req.body;
    const agents = { ceo: getCEOAdvice, cto: getCTOAdvice, cmo: getCMOAdvice, sales: getSalesAdvice, finance: getFinanceAdvice, research: getResearchAdvice, legal: getLegalAdvice, designer: getDesignerAdvice, developer: getDeveloperAdvice, planner: getPlannerAdvice };
    const agentFn = agents[agent] || getCEOAdvice;
    const response = sanitizeOutput(await agentFn(req.apiKey, context || {}, message));
    const confidence = response?.length > 100 ? 85 : response?.length > 50 ? 75 : 65;
    res.json({ content: response, confidence, agent });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/engines/reality', requireApiKey, requireBody('goal'), async (req, res) => {
  try {
    const { goal } = req.body;
    const response = await evaluateGoal(req.apiKey, goal);
    res.json(response);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/engines/reality/score', requireApiKey, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Missing required field: answers' });
    }
    const score = calculateRealityScore(answers);
    res.json({ score });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/engines/negotiate', requireApiKey, requireBody('goal'), async (req, res) => {
  try {
    const { goal } = req.body;
    const response = await negotiateGoal(req.apiKey, goal);
    res.json(response);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/simulate/decision', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const result = await runDecisionSimulation(req.apiKey, question);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/simulate/company', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const result = await runCompanySimulation(req.apiKey, question);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/simulate/customer', requireApiKey, requireBody('product'), async (req, res) => {
  try {
    const { product, persona } = req.body;
    const result = await simulateCustomerReaction(req.apiKey, product, persona || 'customer');
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/board', requireApiKey, requireBody('question'), async (req, res) => {
  try {
    const { question } = req.body;
    const sanitizedQuestion = sanitizeContext({ q: question }).q;
    const response = await callOpenAI(req.apiKey, PROMPTS.BOARD_MEETING, `Debate this topic: ${sanitizedQuestion}`, 0.8);
    const parsed = extractJSON(response);
    if (!parsed || !parsed.responses || !Array.isArray(parsed.responses)) {
      return res.status(502).json({ error: 'AI returned malformed board meeting response' });
    }
    res.json(parsed);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/board/chat', requireApiKey, requireBody('messages'), async (req, res) => {
  try {
    const { messages } = req.body;
    const formatted = messages.map(m => {
      const safeContent = typeof m.content === 'string' ? sanitizeForPrompt(m.content.slice(0, 5000)) : '';
      return `${m.role === 'user' ? 'Founder' : m.name || 'Board'}: ${safeContent}`;
    }).join('\n\n');
    const prompt = `Here is the board discussion so far:\n\n${formatted}\n\nBoard members, continue the debate responding to the latest points raised.`;
    const response = await callOpenAI(req.apiKey, PROMPTS.BOARD_MEETING, prompt, 0.8);
    const parsed = extractJSON(response);
    if (!parsed || !parsed.responses || !Array.isArray(parsed.responses)) {
      return res.status(502).json({ error: 'AI returned malformed board meeting response' });
    }
    res.json(parsed);
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
  }
});

router.post('/research/opportunities', requireApiKey, async (req, res) => {
  try {
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth');
    const opportunities = await getOpportunities(req.apiKey, context || {});
    res.json(opportunities);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/research/briefing', requireApiKey, async (req, res) => {
  try {
    const profile = pick(req.body, 'profile') || {};
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth');
    const briefing = await getMorningBriefing(req.apiKey, profile, context || { currentStage: pick(req.body, 'stage', 'currentStage') });
    res.json(briefing);
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
  }
});

// --- AI-POWERED ROADMAP ---
router.post('/roadmap/generate', requireApiKey, requireBody('blueprint'), async (req, res) => {
  try {
    const { blueprint } = req.body;
    const roadmap = await generateRoadmap(req.apiKey, blueprint);
    res.json(roadmap);
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
  }
});

// --- AI-POWERED FOUNDER DNA ---
router.post('/founder/dna/analyze', requireApiKey, requireBody('profile'), async (req, res) => {
  try {
    const { profile } = req.body;
    const result = await analyzeDNA(req.apiKey, profile);
    res.json(result);
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
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
    sendError(res, error);
  }
});

router.post('/command/health', requireApiKey, async (req, res) => {
  try {
    const blueprint = pick(req.body, 'blueprint', 'businessHealth', 'startupScore') || {};
    const businessHealth = pick(req.body, 'businessHealth') || {};
    const analysis = await generateHealthAnalysis(req.apiKey, typeof blueprint === 'object' ? blueprint : {}, businessHealth);
    res.json({ recommendation: analysis.recommendation || analysis.alert || JSON.stringify(analysis) });
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
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
    sendError(res, error);
  }
});

// --- MEMORY ---
router.post('/memory/nodes', requireJwt, requireBody('founderId', 'type', 'label'), async (req, res) => {
  try {
    const { founderId, type, label, metadata } = req.body;
    const id = await addMemoryNode(req.userId, founderId, type, label, metadata);
    res.json({ id, message: 'Memory node created' });
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/memory/nodes/:founderId', requireJwt, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = parseInt(req.query.offset, 10) || 0;
    const nodes = await getMemoryNodes(req.userId, req.params.founderId, limit, offset);
    res.json(nodes);
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/memory/timeline/:founderId', requireJwt, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const offset = parseInt(req.query.offset, 10) || 0;
    const timeline = await getMemoryTimeline(req.userId, req.params.founderId, limit, offset);
    res.json(timeline);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/memory/edges', requireJwt, requireBody('sourceNodeId', 'targetNodeId', 'relationship'), async (req, res) => {
  try {
    const { sourceNodeId, targetNodeId, relationship } = req.body;
    const id = await addMemoryEdge(req.userId, sourceNodeId, targetNodeId, relationship);
    res.json({ id, message: 'Memory edge created' });
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/memory/graph/:founderId', requireJwt, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = parseInt(req.query.offset, 10) || 0;
    const graph = await getMemoryGraph(req.userId, req.params.founderId, limit, offset);
    res.json(graph);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete('/memory/nodes/:nodeId', requireJwt, async (req, res) => {
  try {
    const supabase = (await import('../db/database.js')).getDb();
    if (!supabase) return res.status(503).json({ error: 'Database not available' });
    const { error } = await supabase.from('memory_nodes')
      .delete()
      .eq('id', req.params.nodeId)
      .eq('user_id', req.userId);
    if (error) throw error;
    res.json({ message: 'Memory node deleted' });
  } catch (error) {
    sendError(res, error);
  }
});

router.delete('/memory/edges/:edgeId', requireJwt, async (req, res) => {
  try {
    const supabase = (await import('../db/database.js')).getDb();
    if (!supabase) return res.status(503).json({ error: 'Database not available' });
    const { error } = await supabase.from('memory_edges')
      .delete()
      .eq('id', req.params.edgeId)
      .eq('user_id', req.userId);
    if (error) throw error;
    res.json({ message: 'Memory edge deleted' });
  } catch (error) {
    sendError(res, error);
  }
});

// --- BUSINESS BLUEPRINT ---
const _blueprintCache = new Map();
const BLUEPRINT_TTL = 3600000;
const BLUEPRINT_MAX_ENTRIES = 500;

const evictBlueprints = () => {
  if (_blueprintCache.size <= BLUEPRINT_MAX_ENTRIES) return;
  const entries = [..._blueprintCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
  const toRemove = entries.slice(0, _blueprintCache.size - BLUEPRINT_MAX_ENTRIES);
  for (const [key] of toRemove) _blueprintCache.delete(key);
};

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
    evictBlueprints();
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/business/blueprint', requireJwt, async (req, res) => {
  const cached = getCachedBlueprint(req.userId);
  if (cached) return res.json(cached);
  res.status(404).json({ error: 'No blueprint found for this user' });
});

router.post('/business/blueprint/tasks', requireJwt, requireApiKey, requireBody('answers'), async (req, res) => {
  try {
    const { answers, blueprint } = req.body;
    const tasks = await generateBlueprintTasks(req.apiKey, answers, blueprint);
    res.json({ tasks });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/business/blueprint/scores', requireJwt, requireApiKey, requireBody('answers'), async (req, res) => {
  try {
    const { answers, blueprint, profile } = req.body;
    const scores = await generateScores(req.apiKey, answers, blueprint, profile);
    res.json(scores);
  } catch (error) {
    sendError(res, error);
  }
});

// --- EXECUTION ---
router.post('/execution/plan', requireApiKey, requireBody('task'), async (req, res) => {
  try {
    const { task } = req.body;
    const plan = await generateExecutionPlan(req.apiKey, task);
    res.json(plan);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/execution/step', requireApiKey, requireBody('stepId', 'task'), async (req, res) => {
  try {
    const { stepId, task } = req.body;
    const result = await executeStep(req.apiKey, stepId, task);
    res.json({ stepId, output: result.output });
  } catch (error) {
    sendError(res, error);
  }
});

// --- INVESTOR MODE (flagship feature) ---
router.post('/investor/evaluate', requireApiKey, async (req, res) => {
  try {
    const context = pick(req.body, 'context', 'blueprint', 'businessHealth', 'startupScore') || {};
    const result = await evaluateAsInvestor(req.apiKey, context);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/investor/chat', requireApiKey, requireBody('message'), async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await chatAsInvestor(req.apiKey, context || {}, message);
    res.json({ content: response });
  } catch (error) {
    sendError(res, error);
  }
});

// --- WEEKLY CEO/BOARD REVIEW ---
router.post('/review/weekly', requireApiKey, async (req, res) => {
  try {
    const profile = pick(req.body, 'profile') || {};
    const tasks = pick(req.body, 'tasks') || [];
    const dnaScores = pick(req.body, 'dnaScores') || {};
    const businessHealth = pick(req.body, 'businessHealth') || {};
    const startupScore = pick(req.body, 'startupScore') || {};
    const review = await generateWeeklyReview(req.apiKey, profile, tasks, dnaScores, businessHealth, startupScore);
    res.json(review);
  } catch (error) {
    sendError(res, error);
  }
});

// --- FAILURE PREDICTION ---
router.post('/failure/prediction', requireApiKey, async (req, res) => {
  try {
    const context = req.body || {};
    const prompt = `Business context: ${JSON.stringify(context)}`;

    const systemPrompt = `You are a startup failure prediction engine. Analyze the provided business context and predict failure probability and key risks.
Respond ONLY in JSON format:
{
  "failureProbability": <number 0-100>,
  "topRisks": [
    { "risk": "risk description", "impact": "high/medium/low", "mitigation": "how to mitigate" }
  ],
  "recommendation": "A 1-2 sentence actionable recommendation"
}`;

    const response = await callOpenAI(req.apiKey, systemPrompt, prompt, 0.7);
    const parsed = extractJSON(response);
    // Validate structure
    if (typeof parsed?.failureProbability !== 'number') {
      return res.status(502).json({ error: 'AI returned malformed prediction response' });
    }
    res.json(parsed);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
