# AI Co-Founder — Startup Operating System

The world's first Startup Operating System. Not just an AI chatbot — an **AI Co-Founder** that thinks, challenges, researches, plans, executes, tracks progress, remembers everything, and grows with the founder from raw idea to scale.

> Most AI tools answer questions. This AI builds companies.

---

## What's New

### v1.6 — Production Hardening
- **🐛 Fixed**: Dashboard sidebar syntax error causing crash on profile render
- **🧹 Cleaned**: 12 unused imports, dead code, and duplicated logic removed
- **🔒 Security**: Password reset token no longer logged to console; prompt injection defense-in-depth
- **💾 Memory leak fix**: Blueprint cache now has TTL (1 hour) to prevent unbounded growth
- **⚡ Performance**: Fixed missing React hook dependencies in 4 components
- **🧪 All 106 tests passing**, lint clean (1 pre-existing control-regex warning)

### v1.5 — Full Test Coverage
- **104 tests across 22 files** covering all 14 dashboard views
- Unit, integration, and E2E test suites

### v1.4 — Final Review Fixes
- Prompt injection hardening, runtime bug fixes, Docker build improvements
- Dead button cleanup

### v1.3 — Credibility Fixes
- Deterministic AI scoring, real thinking animation, AI-generated questions
- CORS restrictions

### v1.2 — Security Hardening
- Mobile responsive, testing infrastructure, deployment pipeline
- Error boundaries

### v1.1
- **🔐 User Authentication** — JWT-based login/signup with protected routes; each user's data is isolated
- **☁️ Supabase Migration** — moved from local SQLite to cloud PostgreSQL via Supabase; persistent data across restarts
- **💬 Multi-Turn Board Meetings** — debate with AI agents in back-and-forth conversation, not one-shot
- **✏️ Custom Inputs** — every question with options now has a "Type your own answer" fallback
- **🧠 Memory Scoped to Users** — memory nodes, tasks, and businesses tied to authenticated users

## Features

### Onboarding & Goal Setting
- **7-Question Founder Onboarding** — understand the founder, not just the startup (2 minutes)
- **Founder Profile** — automatically generated personality, experience, and working style model
- **Goal Conversation** — natural language goal input with adaptive clarifying questions
- **Reality Engine** — 8-dimension feasibility scoring (Market, Competition, Tech, Customer, Founder Fit, Revenue, Timing, Execution)
- **Negotiation Engine** — alternative goal suggestions when original is unrealistic (80/20 rule)

### Business Planning
- **Business Blueprint** — AI-generated 15-section business document (Executive Summary, Problem, Solution, TAM, USP, Competitors, Revenue Model, Business Model Canvas, Risks, GTM, MVP Plan, Roadmap, Financials, Success Metrics)
- **AI Document Generator** — instant generation of Business Plans, PRDs, Pitch Decks, Landing Pages, Investor Updates, Marketing Plans, Technical Specs, Competitor Analysis

### Dashboard (14 Views)

| View | Description |
|---|---|
| **Command Center** | Daily mission, startup score, business health, morning briefing |
| **AI Workspace** | Split-screen chat with AI agents (CEO, CTO, CMO, Sales, Finance, Research) |
| **Business Blueprint** | Editable business document with all 15 sections |
| **Task Engine** | Sprint-based task management with AI-powered task suggestions |
| **Roadmap View** | Quarterly roadmap with stage guidance |
| **Memory Graph** | Visual knowledge graph of everything the AI remembers |
| **Founder Twin** | 10-dimension DNA scores + personalized adaptation suggestions |
| **Research Center** | AI-researched market trends, competitors, opportunities, funding events |
| **Document Generator** | 8 document types with AI content |
| **AI Board Meeting** | Multi-agent debate (CEO, CTO, CMO, CFO, Investor) |
| **Execution Mode** | Autonomous AI execution — research, code, test, deploy |
| **Decision Simulator** | 3-scenario modeling with success probabilities |
| **Company Simulator** | 1,000 virtual customer market simulation |
| **Customer Simulator** | AI persona role-play for product feedback |
| **Daily Review** | Evening review with AI-generated coaching notes |

### AI Engine Room (12 Engines)

| Engine | Function |
|---|---|
| Reality Engine | Goal feasibility scoring across 8 dimensions |
| Negotiation Engine | Alternative goal generation |
| Business Engine | 15-section blueprint generation |
| Research Engine | Market research, opportunities, morning briefing |
| Documents Engine | 8 document types with AI content |
| Roadmap Engine | Quarterly roadmap + stage guidance |
| DNA Engine | 10-dimension founder analysis + adaptations |
| Mission Engine | Daily mission + health analysis |
| Review Engine | AI coaching notes + task suggestions |
| Execution Engine | Autonomous task execution |
| Simulation Engine | Decision, company, customer simulation |
| Memory Engine | Graph-based persistent memory |

### AI Personality (non-negotiable rules)
- Never blindly agrees — challenges unrealistic assumptions
- Explains reasoning, not just conclusions
- Recommends alternatives when plans are weak
- Execution-focused over generic encouragement
- Thinks like a founder/operator, not a customer-service chatbot

---

## Tech Stack

### Frontend
- **React 19** with functional components and hooks
- **Vite 8** for build tooling
- **Zustand 5** for state management (5 stores with localStorage persistence)
- **React Router v7** for routing
- **Recharts** for data visualization
- **Lucide React** for icons
- **Custom Design System** — dark theme with 50+ CSS custom properties

### Backend
- **Express 5** API server
- **Supabase** (PostgreSQL) for persistent storage — cloud-hosted, auto-scaling
- **@supabase/supabase-js** with service_role key for backend database access
- **JWT** authentication with bcrypt password hashing
- **OpenAI SDK** (compatible with NVIDIA API) for AI completions
- **6 AI Agent Personas**: CEO, CTO, CMO, Sales, Finance, Research

### AI
- **Model**: `meta/llama-4-maverick-17b-128e-instruct`
- **Provider**: NVIDIA API (`https://integrate.api.nvidia.com/v1`)
- **SDK**: OpenAI-compatible with custom base URL, 30s timeout, 2 retries
- **All AI responses are real** — no mock data, no fallback placeholders

---

## Getting Started

### Prerequisites
- Node.js 18+
- NVIDIA API key (or any OpenAI-compatible API key)
- Supabase project (free tier works) — [create one here](https://supabase.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/rajesh00618/ai-cofounder-AG.git
cd ai-cofounder-AG

# Install dependencies
npm install

# Create .env file
echo "NVIDIA_API_KEY=your-key-here" > .env
echo "AI_MODEL=meta/llama-4-maverick-17b-128e-instruct" >> .env
echo "AI_BASE_URL=https://integrate.api.nvidia.com/v1" >> .env
echo "PORT=3001" >> .env
echo "JWT_SECRET=your-jwt-secret-change-in-production" >> .env
echo "SUPABASE_URL=https://your-project-ref.supabase.co" >> .env
echo "SUPABASE_SERVICE_KEY=your-service-role-key" >> .env

# Run the DDL below in your Supabase SQL Editor to create tables
# (Open Supabase Dashboard → SQL Editor → New Query)

# Start development (server + frontend concurrently)
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:3001`.

### Supabase Schema Setup

Run this SQL in your Supabase Dashboard → **SQL Editor** → **New Query**:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_data TEXT NOT NULL,
  dna_scores TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  founder_id TEXT NOT NULL REFERENCES founders(id),
  blueprint TEXT,
  health_scores TEXT,
  current_stage TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  sprint_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  estimated_time TEXT,
  difficulty TEXT,
  ai_assistance TEXT,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  founder_id TEXT NOT NULL REFERENCES founders(id),
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Production Build

```bash
npm run build
npm run server  # Serves API only
```

---

## Project Structure

```
ai-cofounder-AG/
├── server/                      # Express API backend
│   ├── index.js                 # Entry point (port 3001)
│   ├── agents/                  # AI agent personas (7 agents)
│   ├── db/                      # Supabase database layer
│   │   ├── database.js          # Supabase client (service_role)
│   │   └── schema.js            # DDL reference
│   ├── engines/                 # AI business logic (12 engines)
│   │   ├── reality.js           # Goal feasibility scoring
│   │   ├── negotiation.js       # Alternative goal generation
│   │   ├── business.js          # Blueprint generation
│   │   ├── research.js          # Market research
│   │   ├── documents.js         # Document generation
│   │   ├── roadmap.js           # Roadmap planning
│   │   ├── dna.js               # Founder DNA analysis
│   │   ├── mission.js           # Daily missions
│   │   ├── review.js            # Daily reviews
│   │   ├── execution.js         # Task execution
│   │   ├── simulation.js        # Decision/customer simulation
│   │   └── memory.js            # Graph memory store (user-scoped)
│   ├── routes/
│   │   ├── api.js               # 30+ API endpoints
│   │   └── auth.js              # JWT register/login/me
│   └── services/
│       ├── ai.js                # OpenAI SDK wrapper
│       ├── search.js            # Web search (DuckDuckGo, Startpage)
│       ├── logger.js            # File-based logging
│       └── reminders.js         # WhatsApp reminder scheduler
├── src/                         # React frontend
│   ├── App.jsx                  # Root + routing
│   ├── main.jsx                 # Entry point
│   ├── pages/                   # 7 page components
│   ├── components/              # 15 dashboard view components
│   ├── store/                   # 6 Zustand stores
│   ├── styles/                  # Design system CSS
│   └── utils/                   # API client, helpers, constants
├── e2e/                         # Playwright E2E tests
├── index.html                   # HTML entry
├── vite.config.js               # Vite build config
├── nginx.conf                   # Nginx reverse proxy config
├── Dockerfile                   # Docker build
├── docker-compose.yml           # Docker compose
└── .env                         # Environment variables
```

---

## API Endpoints

All endpoints are `POST /api/*` unless noted as `GET`. Auth endpoints use `Authorization: Bearer <token>`; most other endpoints use `x-api-key` header (falls back to `NVIDIA_API_KEY` env var).

### Authentication

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Auth | `POST /api/auth/register` | None | Create account |
| Auth | `POST /api/auth/login` | None | Sign in |
| Auth | `GET /api/auth/me` | JWT | Get current user |

### Core

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Chat | `/chat` | API key | General AI chat |
| Chat | `/chat/agent` | API key | Agent-specific chat (CEO, CTO, etc.) |
| Reality | `/engines/reality` | API key | Goal feasibility scoring |
| Reality | `/engines/reality/score` | None | Score from onboarding answers |
| Negotiation | `/engines/negotiate` | API key | Alternative goal generation |
| Board | `/board` | API key | Single-turn board meeting |
| Board | `/board/chat` | API key | Multi-turn board debate |

### Research & Documents

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Research | `/research` | API key | Market research items |
| Research | `/research/opportunities` | API key | Funding/event opportunities |
| Research | `/research/briefing` | API key | Morning briefing |
| Documents | `/documents/generate` | API key | Document generation |

### Roadmap & DNA

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Roadmap | `/roadmap/generate` | API key | Quarterly roadmap |
| Roadmap | `/roadmap/guidance` | API key | Stage-specific guidance |
| DNA | `/founder/dna/analyze` | API key | Founder DNA analysis |
| DNA | `/founder/dna/adapt` | API key | DNA-based adaptations |

### Command & Review

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Command | `/command/mission` | API key | Daily mission generation |
| Command | `/command/health` | API key | Health analysis |
| Review | `/review/note` | API key | Daily review coaching note |
| Tasks | `/tasks/suggest` | API key | AI task suggestions |

### Simulation

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Simulation | `/simulate/decision` | API key | Decision scenario simulation |
| Simulation | `/simulate/company` | API key | Company market simulation |
| Simulation | `/simulate/customer` | API key | Customer persona simulation |

### Business & Execution

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Business | `/business/blueprint` (POST) | API key | Blueprint generation |
| Business | `/business/blueprint` (GET) | None | Get stored blueprint |
| Execution | `/execution/plan` | API key | Generate execution plan |
| Execution | `/execution/step` | API key | Execute a step |

### Memory

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Memory | `/memory/nodes` (POST) | JWT | Add memory node |
| Memory | `/memory/nodes/:id` (GET) | JWT | Get memory nodes |
| Memory | `/memory/timeline/:id` (GET) | JWT | Get memory timeline |

### Health

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Health | `GET /api/health` | None | Server health check |

---

## User Journey

```
Landing Page
    ↓
Sign Up / Log In (JWT authentication)
    ↓
7 Founder Onboarding Questions
    ↓
Founder Profile Generated
    ↓
AI Welcome (personalized)
    ↓
Goal Conversation (natural language, custom input on all questions)
    ↓
Clarification Engine (adaptive questions, custom input on all)
    ↓
Reality Engine (8-dimension feasibility scoring)
    ↓
Negotiation Engine (if goal is unrealistic)
    ↓
Business Planning (5 deep-dive questions)
    ↓
Business Blueprint (15-section AI document)
    ↓
Startup Dashboard → 14 AI-powered views
    ↓
Continuous AI Loop (memory, research, review, replan)
```

---

## License

MIT
