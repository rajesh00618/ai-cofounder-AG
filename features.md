# AI Co-Founder — Complete Feature Directory

> **Version:** 2.1.0 | **Stack:** React 19 + Express 5 + Supabase + OpenAI/NVIDIA
> **Tests:** 274 (47 files) | **Lint:** 0 errors | **Build:** 236 KB (code-split)
> **Positioning:** Most AI tools answer questions. This AI builds companies.

---

## Table of Contents
1. [Founder Onboarding & DNA Profiling](#1-founder-onboarding--dna-profiling)
2. [Goal Setting & Reality Engine](#2-goal-setting--reality-engine)
3. [AI Multi-Agent Board](#3-ai-multi-agent-board)
4. [AI Workspace & Streaming Chat](#4-ai-workspace--streaming-chat)
5. [Business Blueprint Builder](#5-business-blueprint-builder)
6. [Startup Roadmap & Stage Guidance](#6-startup-roadmap--stage-guidance)
7. [Task Engine & Sprint Management](#7-task-engine--sprint-management)
8. [Research Center & Market Intelligence](#8-research-center--market-intelligence)
9. [Document Generator Suite](#9-document-generator-suite)
10. [Company Simulator & Decision Testing](#10-company-simulator--decision-testing)
11. [Founder DNA & Twin Analytics](#11-founder-dna--twin-analytics)
12. [Memory Graph & Knowledge Persistence](#12-memory-graph--knowledge-persistence)
13. [Daily Review & Accountability](#13-daily-review--accountability)
14. [Execution Mode (Build Mode)](#14-execution-mode-build-mode)
15. [Command Center Dashboard](#15-command-center-dashboard)
16. [Settings & API Key Management](#16-settings--api-key-management)
17. [Authentication & Security](#17-authentication--security)
18. [Background Research & Morning Briefing](#18-background-research--morning-briefing)
19. [AI Personality & Alignment System](#19-ai-personality--alignment-system)
20. [Prompt Injection Protection](#20-prompt-injection-protection)

---

## 1. Founder Onboarding & DNA Profiling

| Property | Detail |
|----------|--------|
| **File(s)** | `src/pages/OnboardingPage.jsx`, `src/store/founderStore.js` |
| **Phase** | Entry flow after first sign-in |
| **Status** | Implemented, tested (8 tests) |

### Description
Multi-step onboarding questionnaire that builds a founder profile and psychological DNA model before any startup work begins. The AI tailors all future interactions based on this profile.

### Steps
1. **Primary goal** — Find an idea / Validate an idea / Build MVP / Get customers / Generate revenue / Scale
2. **Experience** — First startup / Tried before / Currently running one / Serial entrepreneur
3. **Team status** — Solo / Co-founder / Small team / Company
4. **Time commitment** — Less than 5 hrs / 1–2 hrs/day / 3–5 hrs/day / Full-time
5. **Working style** — Teach me step-by-step / AI does most of the work / Mix of both
6. **Biggest blocker** — Idea / Validation / Customers / Product / Marketing / Sales / Funding
7. **Success definition** — MVP / First customer / First revenue / Product-market fit / Investment

### Store Methods
- `setOnboardingAnswer(questionId, answer)` — saves individual answer
- `nextOnboardingStep()` / `prevOnboardingStep()` — navigation
- `completeOnboarding(name)` — builds profile object with derived attributes:
  - `riskAppetite` — calculated from experience + goal
  - `focusArea` — derived from primary goal
- `resetOnboarding()` — clears all onboarding state

### Derived Profile Object
```json
{
  "id": "generated-uuid",
  "name": "Founder Name",
  "experienceLevel": "Serial entrepreneur",
  "primaryGoal": "Build MVP",
  "teamStatus": "Solo",
  "timeAvailable": "Full-time",
  "workingStyle": "Mix of both",
  "biggestBlocker": "Skills",
  "successDefinition": "Revenue",
  "riskAppetite": "high",
  "focusArea": "execution",
  "strengths": ["resilience"],
  "weaknesses": ["focus"],
  "onboardedAt": "ISO-timestamp"
}
```

---

## 2. Goal Setting & Reality Engine

| Property | Detail |
|----------|--------|
| **File(s)** | `src/pages/GoalPage.jsx`, `server/engines/reality.js`, `server/engines/negotiation.js` |
| **Phase** | After onboarding, before dashboard |
| **Status** | Implemented, tested (3 test files) |

### Description
The Reality Engine is the core differentiator — it **never blindly agrees** with the founder. It evaluates goal feasibility across 8 dimensions, scores it, and negotiates alternatives if the goal is unrealistic.

### Phases
| Phase | Name | Description |
|-------|------|-------------|
| 0 | WELCOME | Intro animation with "empty cup" metaphor |
| 1 | GOAL_INPUT | Free-text field for the founder's primary goal |
| 2 | CLARIFYING | AI generates 3 personalized clarifying questions via OpenAI |
| 3 | REALITY | 8-dimension radar assessment with overall score |
| 4 | NEGOTIATION | If score < 60, AI suggests alternatives; founder can accept |
| 5 | COMPLETE | Goal is locked, proceeds to dashboard |

### Reality Score Dimensions
1. **Market** — Is there a real market need?
2. **Team** — Does the founder have the right team/skills?
3. **Product** — How defined is the product idea?
4. **Execution** — Can the founder realistically execute?
5. **Business** — Is there a viable business model?
6. **Customers** — Are customers accessible?
7. **Cash** — Financial runway and budget
8. **AI Confidence** — The AI's overall belief in success

### Scoring Algorithm
```javascript
// calculateRealityScore(answers)
// Base: 50
// +15 (Serial entrepreneur), +10 (Running one), +5 (Tried before)
// +15 (Full-time), +10 (3-5 hrs/day), +5 (1-2 hrs/day)
// +10 (More budget), +5 (Under $1000)
// Clamped to [10, 98]
```

### Goal Storage
- `founderStore.goal` — the raw goal text
- `founderStore.goalClarified` — boolean
- `founderStore.clarificationAnswers` — Q&A pairs
- `founderStore.realityScore` — full score object with dimensions
- `founderStore.negotiationResult` — accepted alternative if applicable

---

## 3. AI Multi-Agent Board

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/ai/AIBoardMeeting.jsx`, `server/agents/*.js`, `server/agents/index.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (AIBoardMeeting.test.jsx) |

### Description
Simulates a board of directors meeting with 6 AI personas who debate, challenge, and provide specialized advice. Each agent has a distinct personality, temperature setting, and expertise domain.

### Agent Personnel

| Agent | File | Temperature | Role |
|-------|------|-------------|------|
| **CEO** | `agents/ceo.js` | 0.7 | Execution-focused, direct, challenges assumptions |
| **CTO** | `agents/cto.js` | 0.5 | Technical architecture, feasibility, build vs buy |
| **CMO** | `agents/cmo.js` | 0.6 | Market positioning, growth, brand, go-to-market |
| **Sales** | `agents/sales.js` | 0.7 | Revenue strategy, pipeline, pricing |
| **Finance** | `agents/finance.js` | 0.3 | Burn rate, unit economics, fundraising |
| **Research** | `agents/research.js` | 0.6 | Market data, trends, competitive analysis |

### Board Meeting Features
- **Single agent chat** — Pick any agent for 1-on-1 advice
- **Full board debate** — All 6 agents respond to the same question
- **Agent avatars** — Color-coded with role icons
- **Confidence meter** — Each response includes a confidence score
- **Context injection** — Agents receive founder profile, blueprint, and recent messages

### Stream Integration
Board meeting responses are streamed via `api.chatStream()` with real-time token display.

---

## 3A. Investor Mode (Flagship Feature)

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/ai/InvestorMode.jsx`, `server/engines/investor.js`, `server/routes/api.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (InvestorMode.test.jsx, investor.test.js) |

### Description
Switches the AI's persona entirely into a skeptical VC investor evaluating the startup. Two modes:
1. **Evaluate** — AI analyzes business context and returns verdict (would invest/would not invest/need more data), strengths, weaknesses, hard questions, estimated valuation, pitch rating, failure probability
2. **Chat** — Conversational mode where the AI roleplays as a skeptical investor

### API Endpoints
- `POST /api/investor/evaluate` — Full evaluation with context
- `POST /api/investor/chat` — Conversational investor chat

---

## 3B. Weekly CEO/Board Review

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/review/WeeklyReview.jsx`, `server/engines/weekly.js`, `server/routes/api.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (WeeklyReview.test.jsx, weekly.test.js) |

### Description
AI-powered weekly performance analysis with board-level insights. Generates: week summary, achievements, missed goals, business health trend, execution score, focus areas with recommendations, next week plan, grade (A-F), and personalized coaching note.

### API Endpoint
- `POST /api/review/weekly` — Generate comprehensive weekly review

---

## 4. AI Workspace & Streaming Chat

### Description
The primary conversational interface with the AI Co-Founder. Features real-time streaming, thinking animation, context-aware responses, and abort controls.

### Key Features
- **Streaming responses** — Tokens appear in real-time via server-sent events
- **Thinking bubble** — 3-step animated progress indicator
- **Confidence meter** — Per-response confidence score (0–99%)
- **Abort control** — Cancel in-progress generation
- **Context injection** — Automatically includes founder profile, business blueprint, and active tasks
- **Panel system** — Toggle between Business, Tasks, Research, and AI Team panels
- **Persistent conversation** — Chat history survives page reloads via Zustand persist

### Streaming Flow
1. User sends message → `api.chatStream()`
2. Backend creates `callOpenAIStream()` with model routing + fallback
3. Tokens are returned via `res.write()` as NDJSON
4. Frontend accumulates tokens in real-time using `updateMessage(msgId, { content })`
5. On completion, confidence score is calculated and stored

### Store Methods
- `addMessage(msg)` — adds with auto-generated `id` and `timestamp`
- `updateMessage(id, updates)` — for streaming partial updates
- `clearMessages()` — resets conversation
- `setThinking(bool)` / `setThinkingStep(step)` — thinking UI state
- `setConfidence(val)` — current confidence score
- `setActiveAgent(agent)` — switches between CEO/CTO/CMO/Sales/Finance/Research

---

## 5. Business Blueprint Builder

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/business/BusinessBlueprint.jsx`, `server/engines/business.js`, `src/store/businessStore.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (BusinessBlueprint.test.jsx, 10 businessStore tests) |

### Description
A structured 16-field business model canvas that can be filled via AI generation or manual editing. The blueprint is the central knowledge object used by all engines.

### Blueprint Fields
1. **Problem** — What problem are you solving?
2. **Solution** — Your proposed solution
3. **Target Customer** — Who is the customer?
4. **Value Proposition** — Why should they care?
5. **Revenue Model** — How do you make money?
6. **Pricing** — Pricing strategy
7. **Marketing Channels** — How do you reach customers?
8. **Sales Process** — How do you close?
9. **Competitors** — Competitive landscape
10. **Competitive Advantage** — Your moat
11. **Key Metrics** — KPIs and success metrics
12. **Team** — Current team composition
13. **Funding** — Capital requirements
14. **Timeline** — Key milestones
15. **Risks** — Major risks identified
16. **Risk Mitigation** — How you'll address risks

### AI Generation
- `generateBlueprint(apiKey, answers, founderProfile)` — OpenAI call with structured prompt
- Returns full 16-field JSON object
- Generation context includes founder experience level and business answers

### Editing
- **Controlled textarea editing** — each field is editable via toggle (stable, no contentEditable quirks)
- **Export** — Download blueprint as .txt file
- **Auto-save** — changes persist to Zustand store
- **Collapsible sections** — organized by category

---

## 6. Startup Roadmap & Stage Guidance

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/roadmap/RoadmapView.jsx`, `server/engines/roadmap.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (RoadmapView.test.jsx) |

### Description
Dynamic stage-based roadmap that shows the founder's progress from idea to scale, with AI-generated guidance for each stage.

### Startup Stages
| Stage | Label | Description |
|-------|-------|-------------|
| idea | Idea | Concept validation |
| validation | Validation | Customer discovery |
| mvp | MVP | Minimum viable product |
| launch | Launch | Go-to-market |
| growth | Growth | Scaling |
| scale | Scale | Expansion |

### Features
- **Stage indicator** — Shows current position with completed/current/upcoming states
- **Stage checklist** — 4-6 actionable items per stage
- **AI guidance** — `getStageGuidance()` generates contextual advice based on blueprint and business health
- **Business health scores** — 6-dimension health visualization (Idea, Validation, Product, Marketing, Sales, Finance)
- **Progress tracking** — Startup Score across 6 dimensions (Execution, Business, Customers, Product, Cash, AI Confidence)

---

## 7. Task Engine & Sprint Management

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/tasks/TaskEngine.jsx`, `src/store/taskStore.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (TaskEngine.test.jsx, 10 taskStore tests) |

### Description
Full-featured task management with AI-assisted creation, sprint planning, and priority management.

### Task Properties
| Field | Type | Options |
|-------|------|---------|
| `title` | string | Required |
| `description` | string | Optional |
| `priority` | enum | `low` / `medium` / `high` / `critical` |
| `estimatedTime` | string | e.g. "30 min", "~2 hours" |
| `difficulty` | enum | `easy` / `medium` / `hard` |
| `dependencies` | array | task IDs |
| `aiAssistance` | enum | `assisted` / `autonomous` / `manual` |
| `status` | enum | `todo` / `in_progress` / `done` |
| `sprintId` | string | foreign key to sprint |

### Features
- **Add task** — Form with all fields
- **Edit task** — Inline editing
- **Complete task** — Sets status to `done` with timestamp
- **Delete task** — With confirmation
- **Filter by status** — `getTasksByStatus(status)`
- **Filter by sprint** — `getTasksBySprint(sprintId)`
- **Sort by priority** — Color-coded priority badges (with aria-labels)
- **Estimated time display** — Visual badges

### Sprint Management
- **Create sprint** — Named with goal, deadline, week number
- **Active sprint** — Only one active sprint at a time
- **Complete sprint** — Marks all tasks as sprint-complete
- **Auto-association** — New tasks auto-linked to active sprint

### Store Methods
- `addTask(task)` — auto-generates id, createdAt, sprintId
- `updateTask(id, updates)` — partial update
- `completeTask(id)` — sets done + completedAt
- `deleteTask(id)` — removes from list
- `createSprint(sprint)` — creates with active status
- `completeSprint(id)` — marks completed
- `getActiveSprint()` — finds current active sprint
- `getTasksByStatus(status)` — filtering helper
- `getTasksBySprint(sprintId)` — sprint filtering

---

## 8. Research Center & Market Intelligence

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/research/ResearchCenter.jsx`, `server/engines/research.js`, `server/services/search.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (ResearchCenter.test.jsx) |

### Description
Automated market research engine that searches the web, synthesizes findings, and identifies opportunities. Runs both on-demand and as a background process.

### Research Types
1. **Market Research** — Industry trends, competitors, market size
   - Web search via DuckDuckGo/Startpage
   - AI synthesis into 6 structured items with relevance scores
   - 4 categories: Market Trends, Competition, Customer Insights, Growth Opportunities

2. **Opportunity Finder** — Funding and accelerator programs
   - Identifies 4 relevant opportunities
   - Each with: program name, type, amount, deadline, relevance reason

3. **Morning Briefing** — Daily personalized intelligence brief
   - Generated when founder opens the app
   - Includes date, market update, opportunity alert, suggested focus
   - Tailored to founder profile and business context

### Search Service
- Dual provider (DuckDuckGo HTML + Startpage scraping)
- Graceful fallback if search fails (still calls AI with empty results)
- Rate-limited with 500ms delay between requests

---

## 9. Document Generator Suite

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/documents/DocumentGenerator.jsx`, `server/engines/documents.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (DocumentGenerator.test.jsx) |

### Description
Generates professional business documents using AI, based on the current business blueprint and context.

### Document Types
| Type | Description | Use Case |
|------|-------------|----------|
| `business-plan` | Full business plan | Investors, partners |
| `pitch-deck` | Pitch deck outline | Fundraising |
| `prd` | Product requirements doc | Engineering team |
| `marketing-plan` | Marketing strategy | Growth execution |
| `financial-model` | Financial projections | Planning |

### Generation Process
1. User selects document type from 8-type grid
2. AI receives full business context (blueprint, health scores, stage)
3. `generateDocument(apiKey, docType, businessContext)` returns structured markdown
4. Document is saved to `businessStore.documents` array
5. Can be viewed in a dedicated modal, downloaded as `.md`, or regenerated

### Document Storage
Each document has:
- `id` — UUID
- `type` — document type
- `title` — user-provided name
- `content` — AI-generated markdown
- `createdAt` — timestamp
- `updatedAt` — optional edit tracking

---

## 10. Company Simulator & Decision Testing

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/simulators/DecisionSimulator.jsx`, `server/engines/simulation.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (DecisionSimulator.test.jsx, simulation.test.js) |

### Description
Three simulation engines that let founders test decisions against virtual customers, run full company simulations, and predict outcomes before committing real resources.

### Simulation Types

#### 1. Decision Simulator
- Founder describes a decision
- AI evaluates as 3 scenarios with impartial risk/reward analysis (no bias toward Option A)
- Returns probability-weighted outcome analysis
- Generates "market reaction" summary

#### 2. Company Simulator (1,000 Virtual Customers)
- Runs Monte Carlo-style simulation across 7 dimensions
- Each dimension scored 0–100
- Generates aggregate "startup health score"
- Provides "top insight" — the single most important finding

#### 3. Customer Reaction Simulator
- Tests specific features or messages against virtual personas
- Returns "likely customer reaction" with sentiment analysis
- Provides "adjustment recommendation"

### API Endpoints
- `POST /api/simulate/decision` — Decision simulation
- `POST /api/simulate/company` — Company health simulation
- `POST /api/simulate/customer` — Customer reaction test

---

## 11. Founder DNA & Twin Analytics

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/founder/FounderTwin.jsx`, `server/engines/dna.js`, `src/store/founderStore.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (FounderTwin.test.jsx) |

### Description
Psychological profiling system that tracks 10 founder traits over time. The DNA model evolves based on decisions made and tasks completed, providing personalized growth insights.

### DNA Dimensions
| Trait | Description |
|-------|-------------|
| Decision-making | Speed and quality of decisions |
| Execution | Ability to get things done |
| Consistency | Follow-through on commitments |
| Learning speed | How quickly founder adapts |
| Leadership | Team management ability |
| Sales ability | Persuasion and closing skills |
| Technical skill | Building and technical knowledge |
| Communication | Clarity and articulation |
| Focus | Ability to prioritize |
| Confidence | Self-assurance level |

### Founder Twin (Personality Archetype)
| Trait | Options |
|-------|---------|
| Think Style | `analytical` / `intuitive` / `experimental` |
| Decide Style | `balanced` / `decisive` / `cautious` / `data-driven` |
| Learn Style | `building` / `reading` / `watching` / `doing` |
| Work Pattern | `focused` / `multi-tasking` / `bursts` |
| Failure Pattern | `stall` / `reset` / `pivot` / `persist` |
| Recovery Pattern | `structured` / `support-seeking` / `reflective` |

### Features
- **DNA Radar Chart** — 10-axis spider graph of current scores
- **Twin Profile Card** — Personality archetype summary
- **Twin Insights** — AI-generated growth recommendations via `analyzeDNA()`
- **Score Updates** — `updateDnaScore(trait, value)` for dynamic adjustment

---

## 12. Memory Graph & Knowledge Persistence

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/memory/MemoryGraph.jsx`, `server/engines/memory.js`, `server/db/schema.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (MemoryGraph.test.jsx, memory.test.js) |

### Description
Graph-based knowledge persistence system that stores startup artifacts as nodes and relationships, enabling the AI to reason about connections between ideas, tasks, customers, and milestones.

### Node Types
| Type | Color | Purpose |
|------|-------|---------|
| `idea` | #6366f1 | Business ideas |
| `task` | #f59e0b | Action items |
| `customer` | #10b981 | User/customer insights |
| `document` | #3b82f6 | Generated documents |
| `milestone` | #a855f7 | Key achievements |
| `revenue` | #ec4899 | Financial events |
| `goal` | #8b5cf6 | Primary goals |
| `project` | #06b6d4 | Projects |

### Edge Types
| Type | Description |
|------|-------------|
| `depends_on` | Task A depends on Task B |
| `triggers` | Event triggers another |
| `relates_to` | General relationship |
| `inspired_by` | Creativity source |
| `blocks` | One node blocks another |
| `implements` | Implementation relationship |
| `references` | Reference connection |

### Visualization
- **Force-directed layout** — Custom physics simulation with repulsion and attraction forces
- **Bidirectional edge rendering** — Edges rendered from both source and target directions
- **Node details** — Shows metadata panel
- **Timeline** — Chronological node listing for history tracking
- **Add node/edge** — Inline creation forms

### Database Schema
```sql
memory_nodes (id, user_id, founder_id, type, label, metadata, created_at)
memory_edges (id, user_id, source_node_id CASCADE, target_node_id CASCADE, relationship, created_at)
```

### API Endpoints
- `GET /api/memory/timeline/:founderId` — chronological node list
- `GET /api/memory/graph/:founderId` — full graph with nodes + edges (bidirectional)
- `POST /api/memory/nodes` — create node
- `POST /api/memory/edges` — create edge

---

## 13. Daily Review & Accountability

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/review/DailyReview.jsx`, `server/engines/review.js`, `server/engines/mission.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (DailyReview.test.jsx) |

### Description
End-of-day review system that analyzes progress, generates insights, and suggests next-day tasks. Includes a Mission & Health subsystem for automated startup health analysis.

### Review Components
1. **Daily Review Note** — AI-generated summary of the day's progress
   - What was accomplished
   - What was blocked
   - Key insight
   - Tomorrow's focus

2. **Health Analysis** — Business health assessment
   - Scores across 6 dimensions with trend indicators
   - Generated via OpenAI analysis of current state
   - Stored for historical comparison

3. **Task Suggestions** — AI-recommended tasks for next day
   - Based on current stage, backlog, and health gaps
   - Prioritized by impact

### Mission Engine
- `generateMission(apiKey, context)` — creates mission statement from blueprint
- `generateHealthAnalysis(apiKey, context)` — automated health check
- Mission stored in business context for consistency

---

## 14. Execution Mode (Build Mode)

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/ai/ExecutionMode.jsx`, `server/engines/execution.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (ExecutionMode.test.jsx) |

### Description
AI-powered execution engine that generates step-by-step plans for tasks and produces code/file outputs. Code execution is **disabled for security** (sandboxing commented out), but plan generation and file content generation remain active.

### Features
1. **Execution Plan Generation** — `generateExecutionPlan(apiKey, task)`
   - Returns structured plan with estimated times
   - Steps include: `generate`, `shell`, `review` types
   - Visual timeline with step durations

2. **Step Execution** — `executeStep(apiKey, stepId, task)`
   - Generates file contents for `generate` type steps
   - Returns filename, language, content, instructions
   - Output displayed in collapsible code blocks

3. **Security Warning** — Prominent banner about sandboxing
   - All code is "review-only" — never auto-executed
   - Docker/k8s sandbox recommendations in comments

### Security Architecture
```javascript
// Remote code execution DISABLED for security.
// To re-enable in future:
// 1. Docker with no network + read-only root FS
// 2. Resource limits (CPU, memory, disk, runtime)
// 3. Strip dangerous modules
// 4. Never mount host filesystem or pass env vars
// 5. Separate non-root user
```

---

## 15. Command Center Dashboard

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/dashboard/CommandCenter.jsx`, `src/pages/DashboardPage.jsx`, `src/components/dashboard/Sidebar.jsx` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (CommandCenter.test.jsx) |

### Description
The startup's mission control — a single-pane overview showing real-time health scores, task progress, AI confidence, and quick actions.

### Widgets
1. **Startup Score Card** — 6-axis radar (Execution, Business, Customers, Product, Cash, AI Confidence)
2. **Business Health** — 6-dimension bar chart (Idea, Validation, Product, Marketing, Sales, Finance)
3. **Active Tasks** — Task breakdown by priority with counts
4. **Recent Activity** — Timeline of recent events/messages
5. **Quick Actions** — One-click access to key features
6. **AI Confidence Meter** — Overall AI confidence in current direction

### Sidebar Navigation
14 navigation items with icons and active state (ARIA-accessible):
| View | Icon | Component |
|------|------|-----------|
| Command Center | Home | CommandCenter |
| AI Co-Founder | MessageSquare | AIWorkspace |
| Business | Briefcase | BusinessBlueprint |
| Tasks | CheckSquare | TaskEngine |
| Roadmap | Map | RoadmapView |
| Research | Search | ResearchCenter |
| Documents | FileText | DocumentGenerator |
| Memory Graph | Brain | MemoryGraph |
| Founder DNA | Dna | FounderTwin |
| AI Board | Users | AIBoardMeeting |
| Build Mode | Zap | ExecutionMode |
| Simulator | Beaker | DecisionSimulator |
| Daily Review | CalendarCheck | DailyReview |
| Settings | Settings | SettingsPanel |

### Layout
- **Responsive sidebar** — Collapsible / mobile drawer with ARIA labels
- **Main content area** — Dynamic view rendering (code-split via React.lazy)
- **Header** — View title with context
- **Protected routing** — Redirects to onboarding if no profile

---

## 16. Settings & API Key Management

| Property | Detail |
|----------|--------|
| **File(s)** | `src/components/dashboard/SettingsPanel.jsx`, `src/store/appStore.js` |
| **Phase** | Dashboard view |
| **Status** | Implemented, tested (SettingsPanel.test.jsx, 7 appStore tests) |

### Description
User settings panel for API key configuration, account management, and application preferences.

### Features
- **NVIDIA API Key** — Input field for AI model access (masked display)
- **API Status Check** — "Test Connection" button hits `/api/health` (via `API_BASE`)
- **Account Info** — Display user email and name
- **Theme** — Dark theme only (design system enforced)
- **Data Management** — Clear chat history button
- **Session Info** — Token status and expiry
- **Password Reset** — In-panel password change with confirmation
- **WhatsApp Reminder Registration** — Phone number for Twilio reminders

### Key Storage
- API key stored in Zustand persist middleware (`ai-cofounder-app-storage`)
- Sent as `x-api-key` header on all API requests
- Persisted across sessions

---

## 17. Authentication & Security

| Property | Detail |
|----------|--------|
| **File(s)** | `server/routes/auth.js`, `src/pages/AuthPage.jsx`, `src/pages/ResetPasswordPage.jsx`, `src/store/authStore.js` |
| **Phase** | Entry flow |
| **Status** | Implemented, tested (auth.test.js, AuthPage.test.jsx, 4 authStore tests) |

### Features
1. **Registration** — Name, email, password with Supabase users table
2. **Login** — Email/password with JWT token (7-day expiry)
3. **Password Reset** — Token-based reset flow:
   - Forgot password endpoint generates token (SHA-256 hashed in DB)
   - Token sent in POST body (not URL param) — not exposed in logs/history
   - Timing-safe comparison via `crypto.timingSafeEqual`
   - bcryptjs password hashing
4. **Session Persistence** — Token stored in Zustand persist with hydration guard
5. **Protected Routes** — `ProtectedRoute.jsx` redirects unauthenticated users
6. **JWT Middleware** — `requireJwt` on all user-scoped routes
7. **Rate Limiting** — 100 req/15min general, 10 req/15min auth (with error messages)

### Security Headers (Helmet)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security

### Error Handling
- All 30+ routes use centralized `sendError()` — no stack traces or internal details leaked
- User-friendly API error messages (401→"Session expired", 500→"Service unavailable")
- Global error handler catches middleware-level errors

### API Key Authentication
- JWT for user auth + NVIDIA API key for AI calls
- `x-api-key` header sent from frontend
- All AI endpoints require API key (including `/engines/reality/score`)

### Trust Proxy
- `app.set('trust proxy', 1)` enables accurate client IP behind nginx
- Required for rate limiting to work correctly in production

---

## 18. Background Research & Morning Briefing

| Property | Detail |
|----------|--------|
| **File(s)** | `server/engines/research.js`, `server/services/search.js`, `server/services/reminders.js` |
| **Phase** | Background service |
| **Status** | Implemented |

### Morning Briefing
- Generated when founder accesses the dashboard
- `getMorningBriefing(apiKey, profile, businessContext)`
- Includes:
  - Current date
  - Relevant market updates (based on business blueprint)
  - Opportunity alerts
  - Personalized focus suggestion
  - Tailored to founder's DNA profile

### Reminder Service
- **WhatsApp reminders** via Twilio API
- Phone registration endpoint: `POST /api/reminders/register`
- Hourly scheduler via `startReminderScheduler()`:
  - Checks for pending tasks
  - Sends WhatsApp prompts if configured
- Phone number stored as env vars

### Web Search Service
- Primary: DuckDuckGo HTML scraping
- Fallback: Startpage.com
- Results parsed and extracted from HTML
- 500ms delay between searches to avoid rate limits
- Graceful fallback — logs warning and returns empty if search fails

---

## 19. AI Personality & Alignment System

| Property | Detail |
|----------|--------|
| **File(s)** | `server/services/ai.js`, `server/agents/*.js` |
| **Phase** | Core engine |
| **Status** | Implemented, tested (ai.test.js) |

### Personality Rules (Non-negotiable)
1. Never blindly validates — always challenges if appropriate
2. Uses startup-specific language, not generic consultant-speak
3. Remembers everything about the founder and startup
4. Adapts tone to founder's experience level and DNA profile
5. Maintains 6 distinct persona voices (CEO/CTO/CMO/Sales/Finance/Research)
6. Keeps responses under 200 words unless deeper analysis requested
7. Uses markdown formatting consistently

### Prompt Architecture
- System prompts stored in `PROMPTS` object with 12+ keys
- Each persona has its own base prompt
- User messages are sanitized, truncated to 10K chars, and context-enriched
- Temperature varies per agent: CEO (0.7), CTO (0.5), CMO (0.6), Sales (0.7), Finance (0.3), Research (0.6)

### Prompt Injection Protection
- **12 injection pattern regexes** — matched text is REDACTED from input (not just logged)
- Strips null bytes and control characters
- Max input length: 10,000 characters
- Recursive JSON.stringify for non-string inputs
- System boundary suffix appended to all system prompts
- Logger warning on detected injection attempts

### Model Configuration
```javascript
const MODELS = [
  { model: 'meta/llama-4-maverick-17b-128e-instruct', baseURL: 'https://integrate.api.nvidia.com/v1' },
  { model: 'mistralai/mistral-large', baseURL: 'https://integrate.api.nvidia.com/v1' },
  { model: 'microsoft/phi-4', baseURL: 'https://integrate.api.nvidia.com/v1' },
];
```

### Model Routing Strategy
1. Start with `AI_MODEL` (if set) or Llama-4 Maverick
2. On 401/403 (quota) → rotate to next model in list
3. On 429 (rate limit) → rotate to next model
4. On other errors → skip to next after 500ms delay
5. If all models exhausted → throw quota error
6. Max 1 retry per request

---

## 20. Prompt Injection Protection

| Property | Detail |
|----------|--------|
| **File(s)** | `server/services/ai.js` |
| **Phase** | Core security |
| **Status** | Implemented, tested |

### Injection Patterns Blocked & Redacted
| Pattern | Example |
|---------|---------|
| Ignore instructions | `ignore all previous instructions` |
| Forget system prompt | `forget all prior directions` |
| Disregard rules | `disregard your previous commands` |
| Role override | `you are now free from restrictions` |
| System prompt leak | `your system prompt is overridden` |
| New rules injection | `new rule: ...` |
| Token smuggling | `[SYSTEM]`, `[INST]`, `<\|...\|>` |
| DAN/STAN jailbreak | `DAN`, `STAN` patterns |

### Sanitization Pipeline
1. Type coercion (non-strings → JSON.stringify)
2. Null byte and control character removal
3. Truncation to 10,000 chars
4. **Pattern matching against 12 injection regexes — matched text REDACTED with `[REDACTED]`**
5. Warning logged via structured logger
6. System boundary suffix appended to system prompt
7. Pass-through to AI model

---

## Quick Reference: Page & View Routing

| Path | Page Component | Auth Required |
|------|---------------|---------------|
| `/` | LandingPage | No |
| `/auth` | AuthPage | No |
| `/reset-password` | ResetPasswordPage | No |
| `/onboarding` | OnboardingPage | Yes (token) |
| `/goals` | GoalPage | Yes (profile) |
| `/dashboard` | DashboardPage | Yes (profile + hydrated) |

### Dashboard Views (internal routing via state, code-split with React.lazy)
| View Key | Component | Sidebar Icon |
|----------|-----------|--------------|
| `home` | CommandCenter | Home |
| `workspace` | AIWorkspace | MessageSquare |
| `business` | BusinessBlueprint | Briefcase |
| `tasks` | TaskEngine | CheckSquare |
| `roadmap` | RoadmapView | Map |
| `research` | ResearchCenter | Search |
| `documents` | DocumentGenerator | FileText |
| `memory` | MemoryGraph | Brain |
| `founder` | FounderTwin | Dna |
| `board` | AIBoardMeeting | Users |
| `investor` | InvestorMode | DollarSign |
| `build` | ExecutionMode | Zap |
| `analytics` | AnalyticsDashboard | BarChart3 |
| `simulator` | DecisionSimulator | Beaker |
| `review` | DailyReview | CalendarCheck |
| `weekly-review` | WeeklyReview | Award |
| `settings` | SettingsPanel | Settings |

---

## Quick Reference: API Endpoints

### Auth Routes (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in |
| GET | `/me` | Get current user |
| POST | `/forgot-password` | Request reset (token in body only) |
| POST | `/reset-password` | Execute reset (timing-safe) |

### API Routes (`/api`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Server status | None |
| POST | `/chat` | AI chat | API key |
| POST | `/chat/stream` | SSE streaming chat | API key |
| POST | `/chat/agent` | Agent-specific chat | API key |
| POST | `/engines/reality` | Reality engine | API key |
| POST | `/engines/reality/score` | Score from answers | API key |
| POST | `/engines/negotiate` | Goal negotiation | API key |
| POST | `/board` | Single-turn board meeting | API key |
| POST | `/board/chat` | Multi-turn board debate | API key |
| POST | `/research` | Market research | API key |
| POST | `/research/opportunities` | Funding opportunities | API key |
| POST | `/research/briefing` | Morning briefing | API key |
| POST | `/documents/generate` | Document generation | API key |
| POST | `/roadmap/generate` | Full roadmap | API key |
| POST | `/roadmap/guidance` | Stage-specific guidance | API key |
| POST | `/founder/dna/analyze` | DNA analysis | API key |
| POST | `/founder/dna/adapt` | Growth recommendations | API key |
| POST | `/command/mission` | Mission statement | API key |
| POST | `/command/health` | Health analysis | API key |
| POST | `/review/note` | Daily review | API key |
| POST | `/tasks/suggest` | Task suggestions | API key |
| POST | `/simulate/decision` | Decision simulation | API key |
| POST | `/simulate/company` | Company simulation | API key |
| POST | `/simulate/customer` | Customer reaction | API key |
| POST | `/business/blueprint` | Blueprint generation | API key |
| GET | `/business/blueprint` | Get stored blueprint | JWT |
| POST | `/business/blueprint/tasks` | Blueprint tasks | API key |
| POST | `/business/blueprint/scores` | Blueprint scores | API key |
| POST | `/memory/nodes` | Add memory node | JWT |
| GET | `/memory/nodes/:founderId` | Get memory nodes | JWT |
| GET | `/memory/timeline/:founderId` | Memory timeline | JWT |
| POST | `/memory/edges` | Add memory edge | JWT |
| GET | `/memory/graph/:founderId` | Memory graph | JWT |
| POST | `/execution/plan` | Execution plan | API key |
| POST | `/execution/step` | Execute step | API key |
| POST | `/investor/evaluate` | Investor evaluation | API key |
| POST | `/investor/chat` | Investor chat | API key |
| POST | `/review/weekly` | Weekly CEO review | API key |
| POST | `/failure/prediction` | Failure prediction | API key |
| POST | `/auth/api-key` | Store API key server-side | JWT |
| GET | `/auth/api-key` | Check API key status | JWT |
| POST | `/reminders/register` | WhatsApp registration | None |

---

## Test Coverage Map

| Test File | What It Covers | Tests |
|---|---|---|
| `stores/authStore.test.js` | Auth state management | 4 |
| `stores/founderStore.test.js` | Onboarding, profile, goal, DNA | 8 |
| `stores/businessStore.test.js` | Blueprint, health, scores, docs | 10 |
| `stores/taskStore.test.js` | Task CRUD, sprints, filtering | 10 |
| `stores/chatStore.test.js` | Messages, streaming, modes | 12 |
| `stores/appStore.test.js` | Sidebar, API key, notifications | 7 |
| `components/AuthPage.test.jsx` | Login/register UI | 3 |
| `components/ProtectedRoute.test.jsx` | Route guards | 3 |
| `components/AIWorkspace.test.jsx` | Chat interface | 4 |
| `components/AIBoardMeeting.test.jsx` | Agent board | 4 |
| `components/BusinessBlueprint.test.jsx` | Blueprint editor | 4 |
| `components/CommandCenter.test.jsx` | Dashboard widgets | 4 |
| `components/DailyReview.test.jsx` | Review page | 3 |
| `components/DecisionSimulator.test.jsx` | Simulator | 4 |
| `components/DocumentGenerator.test.jsx` | Document generation | 3 |
| `components/ExecutionMode.test.jsx` | Build mode | 3 |
| `components/FounderTwin.test.jsx` | DNA visualization | 3 |
| `components/MemoryGraph.test.jsx` | Graph visualization | 3 |
| `components/ResearchCenter.test.jsx` | Research display | 3 |
| `components/RoadmapView.test.jsx` | Roadmap stages | 3 |
| `components/SettingsPanel.test.jsx` | Settings UI | 3 |
| `components/InvestorMode.test.jsx` | Investor evaluation/chat | 4 |
| `components/WeeklyReview.test.jsx` | Weekly review UI | 3 |
| `components/AnalyticsDashboard.test.jsx` | Analytics metrics | 3 |
| `components/ChatPanel.test.jsx` | Reusable chat component | 3 |
| `components/ProgressBar.test.jsx` | Onboarding progress | 3 |
| `components/TaskEngine.test.jsx` | Task management | 4 |
| `engines/reality.test.js` | Reality scoring | 3 |
| `engines/dna.test.js` | DNA analysis | 4 |
| `engines/memory.test.js` | Memory graph engine | 8 |
| `engines/business.test.js` | Business blueprint | 6 |
| `engines/simulation.test.js` | Simulation engines | 9 |
| `engines/__tests__/documents.test.js` | Document engine | 7 |
| `engines/__tests__/execution.test.js` | Execution engine | 7 |
| `engines/__tests__/investor.test.js` | Investor mode engine | 10 |
| `engines/__tests__/mission.test.js` | Mission engine | 7 |
| `engines/__tests__/negotiation.test.js` | Negotiation engine | 7 |
| `engines/__tests__/research.test.js` | Research engine | 7 |
| `engines/__tests__/review.test.js` | Review engine | 7 |
| `engines/__tests__/roadmap.test.js` | Roadmap engine | 7 |
| `engines/__tests__/weekly.test.js` | Weekly review engine | 5 |
| `engines/__tests__/investor.test.js` | Investor mode engine | 7 |
| `routes/auth.test.js` | Auth endpoints | 8 |
| `routes/api.test.js` | API integration tests | 13 |
| `services/ai.test.js` | extractJSON, PROMPTS | 14 |
| `services/__tests__/errors.test.js` | Error sanitizer | 3 |
| `services/__tests__/logger.test.js` | Buffered logger | 4 |
| `services/__tests__/reminders.test.js` | Reminder scheduler | 2 |
| `services/__tests__/search.test.js` | Web search fallback | 1 |
| `utils/helpers.test.js` | Utility functions | 19 |
| **Total** | **47 files** | **274 tests** |
