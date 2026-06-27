# AI Co-Founder — Complete Project Report

> **Version:** 1.6.0 | **Build:** 398 KB JS, 7 KB CSS | **Status:** Production-Ready

---

## 1. Executive Summary

**AI Co-Founder** is a full-stack Startup Operating System that replaces generic AI assistants with an opinionated, persistent AI co-founder. Unlike chatbots that answer questions, this system **thinks, challenges, researches, plans, executes, tracks progress, remembers everything, and grows with the founder** — from raw idea to scale.

### Core Differentiators
- **Reality Engine** — scores goal feasibility across 8 dimensions before letting the founder proceed (never blindly agrees)
- **Execution Mode** — AI autonomously researches, codes, tests, and deploys (not just advises)
- **Company Simulator** — tests decisions against 1,000 virtual customers before real-world commitment
- **AI Never Sleeps** — background research agents work 24/7, greet founder each morning with findings

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React 19)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Pages   │ │ Components│ │  Stores  │ │  Utils │ │
│  │  (5)     │ │  (15)     │ │ (Zustand)│ │ (API)  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                      │ HTTP (port 5173 → 3001)        │
└──────────────────────┼──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Express 5 + Supabase)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Routes  │ │  Engines │ │  Services             │ │
│  │  (30+)   │ │  (12)    │ │  ┌────────────────┐  │ │
│  ├──────────┤ ├──────────┤ │  │  AI (OpenAI SDK)│  │ │
│  │  auth.js │ │  memory  │ │  │  Supabase JS    │  │ │
│  │  api.js  │ │  +11 more│ │  │  (service_role) │  │ │
│  └──────────┘ └──────────┘ │  └────────────────┘  │ │
│  ┌──────────┐ │  ┌────────────┐ │  ┌──────────────┐ │ │
│  │  Agents  │ └──│ JWT Auth   │ │  │  PostgreSQL   │ │
│  │  (7)     │    │ Middleware  │ │  │  (Supabase)   │ │
│  └──────────┘    └────────────┘ │  └──────────────┘ │
└──────────────────────────────────┼────────────────────┘
                                   │ NVIDIA API
                                   ▼
                   ┌──────────────────────────────┐
                   │     NVIDIA AI Endpoint       │
                   │  meta/llama-4-maverick-17b   │
                   └──────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Separate API server** (no Vite proxy) | Frontend and backend can scale independently; API can be deployed to different infrastructure |
| **Engine-per-file architecture** | Isolates prompts and business logic; each engine is independently testable and modifiable |
| **Zustand with persist middleware** | 5 stores with localStorage persistence — survives page refreshes without server dependency for UI state |
| **NVIDIA API over OpenAI** | User-provided NVIDIA key; OpenAI-compatible SDK makes the swap trivial (single baseURL change) |
| **Supabase PostgreSQL** | Cloud-hosted, auto-scaling database with Row Level Security; replaces local SQLite for multi-tenant persistence |
| **JWT Authentication** | bcrypt password hashing + JSON Web Tokens; `requireJwt` middleware protects user-scoped routes |
| **requireKey middleware + env fallback** | API key can be set in `.env` or sent per-request; Settings panel shows live server status via `/api/health` |

---

## 3. Project Data Model

### Database Tables (Supabase PostgreSQL)

```
users
├── id (TEXT PRIMARY KEY)
├── name (TEXT)
├── email (TEXT UNIQUE)
├── password_hash (TEXT)
└── created_at (TIMESTAMP)

founders
├── id (TEXT PRIMARY KEY)
├── user_id (TEXT — FK → users)
├── profile_data (TEXT — JSON blob)
├── dna_scores (TEXT — JSON blob)
└── created_at (TIMESTAMP)

businesses
├── id (TEXT PRIMARY KEY)
├── user_id (TEXT — FK → users)
├── founder_id (TEXT — FK → founders)
├── blueprint (TEXT — JSON blob, 15 sections)
├── health_scores (TEXT — JSON blob, 6 categories)
├── current_stage (TEXT)
└── created_at (TIMESTAMP)

tasks
├── id (TEXT PRIMARY KEY)
├── user_id (TEXT — FK → users)
├── business_id (TEXT — FK → businesses)
├── sprint_id (TEXT)
├── title (TEXT)
├── description (TEXT)
├── priority (TEXT — high/medium/low)
├── status (TEXT — pending/in_progress/completed)
├── estimated_time (TEXT)
├── ai_assistance (TEXT)
├── createdAt, completedAt (TIMESTAMP)
└── created_at (TIMESTAMP)

memory_nodes
├── id (TEXT PRIMARY KEY)
├── user_id (TEXT — FK → users)
├── founder_id (TEXT — FK → founders)
├── type (TEXT)
├── label (TEXT)
├── metadata (TEXT — JSON blob)
└── created_at (TIMESTAMP)
```

### Zustand Store Schema

```
appStore
├── currentPage, sidebarOpen, sidebarCollapsed, activeView
├── apiKey (localStorage-backed)
├── notifications[]
└── setPage, toggleSidebar, setActiveView, toggleSidebarCollapse, setApiKey, addNotification, removeNotification

businessStore
├── blueprint (15-section object)
├── businessHealth (6 categories: idea, validation, product, marketing, sales, finance)
├── startupScore (5 dimensions: execution, business, customers, product, cash, aiConfidence)
├── currentStage, businessAnswers, documents[]
└── setBlueprint, setBusinessHealth, setStartupScore, setCurrentStage, addBusinessAnswer, addDocument

chatStore
├── messages[], isThinking, thinkingStep, confidence
├── activeAgent, boardMode, debateMode, investorMode, customerSimMode
└── addMessage, setThinking, setThinkingStep, setConfidence, setActiveAgent, toggleBoardMode, etc.

founderStore
├── profile (name, experience, team, timeAvailable, workingStyle, blocker, successDefinition)
├── onboardingComplete, goal, realityScore, negotiationResult
├── founderTwin (personality, behavioral traits)
├── dnaScores (10 dimensions, initialized as random 20-80)
└── completeOnboarding, setGoal, setRealityScore, setNegotiationResult, setFounderTwin, setDnaScores

taskStore
├── tasks[], sprints[], currentSprintId
├── addTask, completeTask, deleteTask, updateTask, addSprint, setCurrentSprint
├── getTasksByStatus, getTasksBySprint, getPendingTasks, getCompletedTasks
└── getSprintProgress, getOverallProgress
```

---

## 4. API Reference

### Middleware

| Middleware | Purpose |
|---|---|
| `requireApiKey(req, res, next)` | Validates `x-api-key` header or falls back to `NVIDIA_API_KEY` env var. Returns 401 if neither exists. |
| `requireBody(...fieldGroups)` | Validates required body fields. Accepts grouped alternatives: `requireBody(['docType', 'type'])` means at least one of the two is required. Returns 400 if missing. |
| `pick(body, ...keys)` | Extracts the first non-null/undefined value from a list of key alternatives. Used for flexible payload shapes (e.g., `pick(req.body, 'type', 'docType')`). |

### Endpoint Catalog

#### Chat
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/chat` | API key | `{ message, context? }` | `{ content, confidence }` |
| POST | `/api/chat/agent` | API key | `{ message, context?, agent }` | `{ content, confidence, agent }` |

#### Reality Engine
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/engines/reality` | API key | `{ goal }` | `{ score, dimensions, risks, verdict }` |
| POST | `/api/engines/reality/score` | No | `{ answers }` | `{ score }` |

#### Negotiation
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/engines/negotiate` | API key | `{ goal }` | `{ alternatives[] }` |

#### Board Meeting
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/board` | API key | `{ question }` | `{ responses[] }` (CEO, CTO, CMO, CFO) |

#### Research
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/research` | API key | `{ context?, filter? }` | `{ items[] }` (trends, competitors, market, opportunities, threats, tech) |
| POST | `/api/research/opportunities` | API key | `{ context? }` | `{ opportunities[] }` (funding, accelerators, events, grants) |
| POST | `/api/research/briefing` | API key | `{ profile?, context?, stage? }` | `{ greeting, briefing }` |

#### Documents
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/documents/generate` | API key | `{ docType, context }` | `{ title, content, sections[] }` |

#### Roadmap
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/roadmap/generate` | API key | `{ blueprint }` | `{ quarters[] }` (4 quarters with goals, tasks, milestones) |
| POST | `/api/roadmap/guidance` | API key | `{ stage, businessHealth?, dnaScores?, blueprint? }` | `{ guidance }` |

#### Founder DNA
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/founder/dna/analyze` | API key | `{ profile }` | `{ dnaScores{}, founderTwin{} }` |
| POST | `/api/founder/dna/adapt` | API key | `{ dnaScores, founderTwin?, recentActivity? }` | `{ adaptations[] }` |

#### Command Center
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/command/mission` | API key | `{ context?, tasks?, dnaScores? }` | `{ mission }` (daily mission text) |
| POST | `/api/command/health` | API key | `{ blueprint?, businessHealth? }` | `{ recommendation }` (health analysis) |

#### Reviews
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/review/note` | API key | `{ review, profile?, tasks?, dnaScores? }` | `{ note }` (coaching note) |

#### Tasks
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/tasks/suggest` | API key | `{ blueprint?, stage?, dnaScores? }` | `{ suggestions[] }` (task titles) |

#### Simulation
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/simulate/decision` | API key | `{ question }` | `{ question, scenarios[], recommendation, failureRisk }` |
| POST | `/api/simulate/company` | API key | `{ question }` | `{ question, virtualCustomers, conversion, projectedRevenue, complaints[], retention, recommendation }` |
| POST | `/api/simulate/customer` | API key | `{ product, persona }` | `{ persona, reaction, objections[] }` |

#### Business Blueprint
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/business/blueprint` | API key | `{ answers, profile? }` | `{ executiveSummary, problem, solution, tam, usp, competitors, revenueModel, businessModelCanvas, risks, gtmPlan, validationPlan, mvpPlan, roadmap, financials, successMetrics }` |
| GET | `/api/business/blueprint` | No | — | `{}` (placeholder) |

#### Memory
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/memory/nodes` | No | `{ founderId, type, label, metadata? }` | `{ id, message }` |
| GET | `/api/memory/nodes/:founderId` | No | — | `[{ id, type, label, metadata, created_at }]` |
| GET | `/api/memory/timeline/:founderId` | No | — | `[{ id, type, label, created_at }]` |

#### Execution
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/execution/plan` | API key | `{ task }` | `{ task, plan: { estimatedTime, steps[] }, result }` |
| POST | `/api/execution/step` | API key | `{ stepId, task }` | `{ stepId, output }` |

#### Health
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/health` | No | — | `{ status, hasKey }` |

---

## 5. AI Engines (Detailed)

### 5.1 Reality Engine (`server/engines/reality.js`)
- **Purpose:** Prevents founders from pursuing unrealistic goals
- **Dimensions scored:** Market Size, Competition, Tech Risk, Customer Access, Founder Fit, Revenue Potential, Timing, Execution Complexity
- **Output:** Overall score (0-100), per-dimension scores, 3 risks, 1-2 sentence verdict
- **System prompt:** *"You are the Reality Engine. Your job is to destroy fragile startup ideas."*

### 5.2 Negotiation Engine (`server/engines/negotiation.js`)
- **Purpose:** When a goal scores low on reality, suggests 3 more achievable alternatives
- **Approach:** 80/20 rule — get 80% of the value with 20% of the effort
- **Output:** 3 alternatives with title, probability (high/medium/low), and reasoning

### 5.3 Business Engine (`server/engines/business.js`)
- **Purpose:** Generates a comprehensive 15-section business blueprint from 5 answers
- **Sections:** Executive Summary, Problem, Solution, Target Customer, ICP, Market Size, USP, Competitors & SWOT, Revenue Model, Business Model Canvas, Risk Analysis, GTM Plan, Validation Plan, MVP Plan, Roadmap, Financial Estimate, Success Metrics

### 5.4 Research Engine (`server/engines/research.js`)
- **3 sub-engines:**
  - **getResearch** — 6 market research items (trends, competitors, market, opportunities, threats, tech)
  - **getOpportunities** — 4 funding/accelerator/event opportunities
  - **getMorningBriefing** — Personalized morning greeting with overnight findings

### 5.5 Documents Engine (`server/engines/documents.js`)
- **8 document types:** business-plan, prd, pitch-deck, landing-page, investor-update, marketing-plan, technical-spec, competitor-analysis
- Each document has: title, markdown content, and structured sections

### 5.6 Roadmap Engine (`server/engines/roadmap.js`)
- **generateRoadmap:** 4-quarter roadmap from blueprint
- **generateStageGuidance:** Stage-specific advice based on business health and DNA scores

### 5.7 DNA Engine (`server/engines/dna.js`)
- **analyzeDNA:** Infer 10-dimensional DNA scores from profile
  - Dimensions: Decision-making, Execution, Consistency, Learning Speed, Leadership, Sales Ability, Technical Skill, Communication, Focus, Confidence
  - Also generates founder twin: personality, strengths, weaknesses, working style, communication style
- **generateAdaptations:** Personalized growth actions based on DNA + recent activity

### 5.8 Mission Engine (`server/engines/mission.js`)
- **generateMission:** Single most important daily task based on context, tasks, and DNA
- **generateHealthAnalysis:** Business health scoring (0-100) with weak spot identification

### 5.9 Review Engine (`server/engines/review.js`)
- **generateReviewNote:** Personalized coaching note from daily review answers
- **suggestTasks:** 6 actionable sprint tasks from blueprint + stage + DNA

### 5.10 Execution Engine (`server/engines/execution.js`)
- **generateExecutionPlan:** 4-6 step AI-generated execution plan per task
- **executeStep:** Realistic AI-generated step output (research, architecture, coding, testing, deploy)

### 5.11 Simulation Engine (`server/engines/simulation.js`)
- **runDecisionSimulation:** 3 scenarios (Aggressive/Balanced/Conservative) with timeline, success%, risk level
- **runCompanySimulation:** 1,000 virtual customer simulation with conversion, revenue, complaints, retention
- **simulateCustomerReaction:** Persona-specific product reaction with objections

### 5.12 Memory Engine (`server/engines/memory.js`)
- CRUD operations against `memory_nodes` SQLite table
- Nodes have: id (UUID), founder_id, type, label, metadata (JSON)
- Timeline endpoint returns chronological order
- Graph structure enables causal relationship tracking

---

## 6. Frontend Architecture

### 6.1 Component Tree

```
App (BrowserRouter)
├── LandingPage          / → /onboarding
├── OnboardingPage       /onboarding → /goal
├── GoalPage             /goal → /business-planning
├── BusinessPlanningPage /business-planning → /dashboard/home
└── DashboardPage        /dashboard/*
    ├── Sidebar (always visible)
    └── Main Content (switches by activeView)
        ├── CommandCenter       (home)
        ├── AIWorkspace          (workspace)
        ├── BusinessBlueprint    (business)
        ├── TaskEngine           (tasks)
        ├── RoadmapView          (roadmap)
        ├── MemoryGraph          (memory)
        ├── FounderTwin           (founder)
        ├── ResearchCenter        (research)
        ├── DocumentGenerator    (documents)
        ├── AIBoardMeeting       (board)
        ├── ExecutionMode        (build)
        ├── DecisionSimulator    (simulator)
        ├── DailyReview          (review)
        └── SettingsPanel        (settings)
```

### 6.2 State Management (Zustand + persist)

```
User Action → Component → Store (action) → [localStorage persist]
                              │
                              ▼
                         API Call → Server → AI → Response
                              │
                              ▼
                    Store (state update) → Component re-render
```

### 6.3 Design System (`src/styles/design-system.css`)

Dark theme with 50+ CSS custom properties:

| Category | Variables | Example |
|---|---|---|
| Backgrounds | `--color-bg-*` (5 levels) | `--color-bg: #0a0a1f` |
| Text | `--color-text-*` (4 levels) | `--color-text: #e8e8f0` |
| Accent (primary) | `--color-accent-*` | `--color-accent: #6366f1` |
| Semantic | `--color-success`, `--color-warning`, `--color-danger` | `#10b981`, `#f59e0b`, `#ef4444` |
| Typography | `--font-family` | `Inter, system-ui, sans-serif` |
| Layout | `--sidebar-width`, `--radius-*` | `280px`, `12px` |

---

## 7. User Flow (End-to-End)

```
1. LANDING PAGE
   └── "Start Building" CTA

2. ONBOARDING (7 questions, ~2 min)
   └── Primary goal, experience, team size, time, working style, blocker, success definition
   └── Founder profile auto-generated → saved to founderStore

3. GOAL CONVERSATION
   └── Founder types goal in natural language
   └── AI clarifies with up to 5 adaptive questions
   └── Reality Engine scores goal (8 dimensions)
   └── If score low → Negotiation Engine offers alternatives
   └── Founder selects/accepted goal

4. BUSINESS PLANNING (5 questions)
   └── Customer, problem, alternatives, pricing, advantage
   └── AI generates 15-section Business Blueprint

5. DASHBOARD (14 views, AI-powered)
   └── Mission & health check (daily)
   └── AI Workspace for conversation
   └── Task Engine with AI sprint suggestions
   └── Research Center with AI market data
   └── Document Generator for business docs
   └── Roadmap with AI stage guidance
   └── Simulators for decision testing
   └── Daily Review with AI coaching
```

---

## 8. AI Integration

### 8.1 Provider Configuration

```js
// server/services/ai.js
const model = process.env.AI_MODEL || 'meta/llama-4-maverick-17b-128e-instruct';
const baseURL = process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
```

### 8.2 OpenAI SDK Configuration

| Parameter | Value |
|---|---|
| Timeout | 30,000ms |
| Max Retries | 2 |
| Temperature | 0.3-0.8 (per engine) |

### 8.3 JSON Extraction (`extractJSON`)

3-tier fallback for parsing AI responses:
1. Fenced code block: ```json ... ```
2. First `{...}` object in response
3. Throws with context snippet for debugging

### 8.4 System Prompts

Each engine and agent has a distinct system prompt that defines its personality:
- **CEO AI:** *"You challenge assumptions and push the human founder to focus on high-impact validation and revenue over busywork."*
- **Reality Engine:** *"Your job is to destroy fragile startup ideas."*
- **Board Meeting:** *"You are a panel of AI Startup Board Members simulating a debate."*

### 8.5 Response Caching

No caching layer — every call hits the AI API. The 30s timeout with 2 retries provides resilience for API latency.

---

## 9. Build & Development

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start server (nodemon) + frontend (Vite) concurrently |
| `npm run server` | Start API server only |
| `npm run build` | Production build (Vite) |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |

### Build Output

```
dist/
├── index.html                   0.98 KB  (gzip: 0.52 KB)
├── assets/index-DZ3nJIKM.css    7.23 KB  (gzip: 2.13 KB)
└── assets/index-CEB0h5km.js   398.01 KB  (gzip: 113.59 KB)
```

Build time: ~525ms. Zero warnings, zero errors.

### Dependencies

| Dependency | Version | Purpose |
|---|---|---|---|
| react | ^19.2.7 | UI framework |
| react-dom | ^19.2.7 | DOM rendering |
| react-router-dom | ^7.18.0 | Client-side routing |
| zustand | ^5.0.14 | State management |
| recharts | ^3.9.0 | Charts & visualization |
| lucide-react | ^1.21.0 | Icons |
| express | ^5.2.1 | API server |
| @supabase/supabase-js | ^2.49.4 | Cloud database client |
| pg | ^8.14.1 | PostgreSQL driver |
| bcryptjs | ^3.0.2 | Password hashing |
| jsonwebtoken | ^10.0.3 | JWT auth |
| openai | ^6.45.0 | AI SDK |
| cors | ^2.8.6 | CORS middleware |
| dotenv | ^17.4.2 | Environment variables |
| uuid | ^14.0.1 | ID generation |
| vite | ^8.1.0 | Build tool |
| oxlint | ^1.69.0 | Linter |
| nodemon | ^3.1.14 | Auto-restart |
| concurrently | ^10.0.3 | Run multiple commands |

---

## 10. Security

### API Key Protection
- Key stored in `.env` (gitignored)
- Server falls back to env var when no `x-api-key` header sent
- Settings panel shows server key status without revealing the key
- Frontend stores key in localStorage for per-request headers

### Input Validation
- `requireBody` middleware validates required fields on all POST endpoints
- Returns 400 with specific field name on missing required data
- `pick()` helper prevents undefined/null from reaching engines

### Database
- Supabase PostgreSQL — cloud-hosted with automated backups
- Service role key used server-side (never exposed to client)
- Schema created via Supabase SQL Editor

### Authentication
- **JWT-based auth** with 7-day token expiry
- **bcrypt** password hashing (10 salt rounds)
- `requireJwt` middleware protects user-scoped routes (memory, etc.)
- Founder/business/task/memory data scoped to `user_id` foreign key

### CORS
- Server accepts all origins (development mode)
- No rate limiting (to be added for production)

---

## 11. Error Handling

### Server-Side
- All routes wrapped in try/catch → returns 500 with `{ error: message }`
- AI service throws meaningful errors (not vague "API key" blame)
- Network errors vs API errors differentiated in error messages
- `extractJSON` throws with response snippet for debugging

### Frontend-Side
- API client (`api.js`) throws with server's error message
- Components catch errors and show inline error banners
- All API calls have local mock fallbacks when server is unreachable
- Loading states with spinner animations for all async operations

---

## 12. Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|---|
| `NVIDIA_API_KEY` | Yes | — | NVIDIA AI API key |
| `AI_MODEL` | No | `meta/llama-4-maverick-17b-128e-instruct` | AI model identifier |
| `AI_BASE_URL` | No | `https://integrate.api.nvidia.com/v1` | API base URL |
| `PORT` | No | `3001` | Server port |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `SUPABASE_URL` | Yes | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | — | Supabase service_role key |

### Gitignore

```gitignore
.env              # Secrets
*.sqlite          # Database files (legacy)
node_modules/     # Dependencies
dist/             # Build output
*.log             # Log files
.vscode/          # Editor config
.idea/            # Editor config
.DS_Store         # macOS
```

---

## 13. Limitations & Future Work

### Current Limitations
- **No rate limiting** — API endpoint has no request throttling
- **No caching** — every request hits the AI API (latency-sensitive)
- **Frontend API key in localStorage** — vulnerable to XSS
- **No WebSocket** — real-time features use polling/delays
- **No background job system** — "AI Never Sleeps" is simulated on-demand
- **Supabase RLS not configured** — relying on service_role key + server-side auth
- **Web search** uses regex-based HTML scraping (brittle, may break with provider changes)
- **WhatsApp reminders** poll every 60s instead of using cron

### Planned Enhancements
- [ ] WebSocket for real-time AI responses
- [ ] Background job queue for continuous research
- [ ] Redis caching for AI responses
- [ ] Rate limiting and API key rotation
- [ ] Supabase Row Level Security policies
- [ ] Mobile push notifications via WhatsApp/Telegram
- [ ] Calendar integration for deadlines
- [ ] Email campaign automation
- [ ] Stripe integration for SaaS monetization
- [ ] CI/CD pipeline with automated testing
- [ ] Structured logging with log aggregation

---

## 14. File Manifest

```
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git exclusion rules
├── .oxlintrc.json                # Linter configuration
├── AI_CoFounder_Product_Specification-1.md  # Original product spec
├── index.html                    # HTML entry point
├── package.json                  # Dependency manifest
├── README.md                     # Project readme
├── vite.config.js                # Vite build configuration
├── report.md                     # This file
│
├── public/
│   ├── favicon.svg               # Browser favicon
│   └── icons.svg                 # SVG icon sprite
│
├── server/
│   ├── index.js                  # Express server entry point
│   ├── agents/
│   │   ├── index.js              # Agent barrel export
│   │   ├── ceo.js                # CEO AI agent
│   │   ├── cto.js                # CTO AI agent
│   │   ├── cmo.js                # CMO AI agent
│   │   ├── sales.js              # Sales AI agent
│   │   ├── finance.js            # Finance AI agent
│   │   └── research.js           # Research AI agent
│   ├── db/
│   │   ├── database.js           # SQLite connection manager
│   │   ├── database.sqlite       # Database file (gitignored)
│   │   └── schema.js             # Table definitions
│   ├── engines/
│   │   ├── business.js           # Business blueprint generator
│   │   ├── dna.js                # Founder DNA analyzer
│   │   ├── documents.js          # Document generator
│   │   ├── execution.js          # Task execution engine
│   │   ├── memory.js             # Memory graph store
│   │   ├── mission.js            # Mission & health analyzer
│   │   ├── negotiation.js        # Goal negotiator
│   │   ├── reality.js            # Reality scoring engine
│   │   ├── research.js           # Market research engine
│   │   ├── review.js             # Daily review engine
│   │   ├── roadmap.js            # Roadmap planner
│   │   └── simulation.js         # Decision simulator
│   ├── routes/
│   │   ├── api.js                # API route definitions
│   │   └── auth.js               # JWT register/login/me
│   ├── services/
│   │   ├── ai.js                 # OpenAI SDK wrapper
│   │   ├── search.js             # Web search (DuckDuckGo, Startpage)
│   │   ├── logger.js             # File-based structured logging
│   │   └── reminders.js          # WhatsApp reminder scheduler (Twilio)
│   ├── engines/__tests__/        # Engine unit tests (3 files)
│   ├── routes/__tests__/         # Route tests (1 file)
│   └── services/__tests__/       # Service tests (1 file)
│
    └── src/
    ├── App.jsx                   # Root component + routing
    ├── main.jsx                  # React entry point
    ├── assets/
    │   ├── hero.png              # Landing page hero image
    │   └── vite.svg              # Vite logo
    ├── components/
    │   ├── ai/
    │   │   ├── AIBoardMeeting.jsx
    │   │   └── ExecutionMode.jsx
    │   ├── business/
    │   │   └── BusinessBlueprint.jsx
    │   ├── dashboard/
    │   │   ├── AIWorkspace.jsx
    │   │   ├── CommandCenter.jsx
    │   │   ├── SettingsPanel.jsx
    │   │   └── Sidebar.jsx
    │   ├── documents/
    │   │   └── DocumentGenerator.jsx
    │   ├── founder/
    │   │   └── FounderTwin.jsx
    │   ├── memory/
    │   │   └── MemoryGraph.jsx
    │   ├── research/
    │   │   └── ResearchCenter.jsx
    │   ├── review/
    │   │   └── DailyReview.jsx
    │   ├── roadmap/
    │   │   └── RoadmapView.jsx
    │   ├── simulators/
    │   │   └── DecisionSimulator.jsx
    │   └── tasks/
    │       └── TaskEngine.jsx
    ├── pages/
    │   ├── AuthPage.jsx
    │   ├── BusinessPlanningPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── GoalPage.jsx
    │   ├── LandingPage.jsx
    │   ├── OnboardingPage.jsx
    │   └── ResetPasswordPage.jsx
    ├── store/
    │   ├── appStore.js
    │   ├── authStore.js
    │   ├── businessStore.js
    │   ├── chatStore.js
    │   ├── founderStore.js
    │   └── taskStore.js
    ├── styles/
    │   └── design-system.css
    ├── test/
    │   ├── setup.js
    │   ├── stores/
    │   │   └── authStore.test.js
    │   └── components/
    │       └── 16 dashboard component tests
    └── utils/
        ├── api.js
        ├── constants.js
        └── helpers.js
```

---

## 15. Version History

| Version | Date | Changes |
|---|---|---|---|
| 1.0.0 | 2026-06-27 | Initial production release. All 14 dashboard views fully AI-powered. 12 AI engines. 28 API endpoints. |
| 1.1.0 | 2026-06-27 | JWT authentication (login/signup), Supabase PostgreSQL migration, multi-turn board meetings, custom input fallback. |
| 1.2.0 | 2026-06-27 | Security hardening, mobile responsive, testing infra, deployment, error boundaries. |
| 1.3.0 | 2026-06-27 | Credibility fixes — deterministic scores, real thinking, AI-generated questions, CORS restrict. |
| 1.4.0 | 2026-06-27 | Prompt injection hardening, runtime bug fixes, Docker build, dead button cleanup. |
| 1.5.0 | 2026-06-27 | 104 tests across 22 files — all 14 dashboard views tested. |
| 1.6.0 | 2026-06-27 | Production hardening — fixed sidebar syntax crash, removed 12 unused imports, fixed missing hook deps, added blueprint cache TTL, secured reset token logging, removed dead code and duplication. 22 test files, 106 tests passing, lint clean. |

---

*Report generated from the AI Co-Founder codebase. For the complete product specification, see `AI_CoFounder_Product_Specification-1.md`.*
