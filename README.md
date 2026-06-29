# AI Co-Founder — Startup Operating System

The world's first Startup Operating System. Not just an AI chatbot — an **AI Co-Founder** that thinks, challenges, researches, plans, executes, tracks progress, remembers everything, and grows with the founder from raw idea to scale.

> Most AI tools answer questions. This AI builds companies.

---

## What's New

### v2.2 — Premium UI/UX Design System & Warm Color Palette
- **🎨 Warm Color Palette** — White, Black, Cream (`#FFF8EB`), Beige (`#E8DCC8`), Brown spectrum (`#8B6F47` → `#3D2B1F`) replaces cold indigo theme
- **✨ 16 Reusable UI Components**: AuroraBackground, CursorGlow, KineticText, SlideCards, SkeletonLoaders, ScrollStory, BottomSheet, FAB, MagneticButton, RippleButton, ViewToggle, ProgressiveDisclosure, BentoGrid, LiquidSwipe, ThreeDCard, ScrollProgress
- **🔮 Glassmorphism** — Frosted glass cards with `backdrop-filter: blur(24px)` and subtle borders
- **🪬 Neomorphism** — Soft shadow buttons and sidebar logo with dual-shadow depth effect
- **🧊 Claymorphism** — Tactile clay-textured cards with inner highlight gradient
- **📐 Bento Grid Layout** — Apple-style asymmetric grid with wide/tall/large variants and staggered reveal
- **🌍 Aurora Backgrounds** — Mouse-reactive gradient overlays with animated color shifts
- **⌨️ Kinetic Typography** — Letter-by-letter animated text with perspective transforms
- **🖱️ Cursor-Controlled Interactions** — Global cursor glow, magnetic buttons, 3D tilt cards
- **🌊 Parallax Scrolling** — Mouse-tracking floating orbs and scroll-driven transforms
- **📜 Scroll-Driven Storytelling** — Intersection Observer-powered reveal animations on scroll
- **🃏 Slide Cards** — Auto-playing card carousel with dot navigation
- **💫 Micro-interactions** — Ripple click effects, hover lifts, bounce-in animations, elastic transitions
- **🦴 Dynamic Skeleton Loaders** — Text, circle, card, bento, and full dashboard skeleton variants
- **📌 Sticky Bottom Sheets** — Drag-to-dismiss mobile bottom sheets with backdrop blur
- **🔄 Grid-to-List Toggles** — View switcher component for content layouts
- **📂 Progressive Disclosure** — Accordion menus with smooth height transitions
- **⬆️ Floating Action Buttons** — FAB with extended hover label and bounce-in animation
- **🎯 Shared Element Transitions** — View transition animations between dashboard views
- **📱 50+ CSS Animations** — fadeIn, slide, float, aurora, morphBlob, ripple, kineticLetter, bounce, elastic, parallax, liquidMorph, neuronPulse, borderGlow, and more
- **♿ Reduced Motion Support** — All animations respect `prefers-reduced-motion`
- **🧪 130/130 tests passing**, lint clean, build verified

### v2.1 — MNC-Grade Certification & Zero Fake Data Audit
- **✅ MNC-Grade Certified** — 55/56 quality gates passed, 9.0/10 architecture score
- **🔒 15 security gates pass**: CSP, stream rate limiting, abort-on-disconnect, 22 prompt-injection patterns, prototype pollution protection, circuit breaker, graceful shutdown, Docker read-only + no-new-privs + tini
- **💾 14 database indexes** on foreign keys, cascade deletes, CHECK constraints, migration rollbacks, cycle detection in memory graph
- **🧪 331 tests passing** (47 files), 0 lint errors, 37 code-split build chunks
- **🤖 All 10 agents sanitized** — user input sanitized in every agent + engine file
- **♿ Full accessibility audit** — 7+ aria-labels, keyboard nav, reduced-motion, responsive breakpoints
- **🏗️ Production CI/CD** — npm audit, Trivy security scan, Docker Scout, GHCR push with metadata
- **🚫 AnalyticsDashboard removed** — was computing fake revenue/MRR from math formulas with no real data source
- **🧠 Reality scoring rewritten** — `calculateRealityScore` now calls AI instead of hardcoded magic numbers
- **🧬 DNA scores start null** — populated by real AI analysis after onboarding, not hardcoded 50s
- **👤 Founder Twin starts null** — populated by AI behavioral modeling, not static labels
- **⏱️ Mission time from AI** — Command Center shows AI-estimated time, not hardcoded "~2 hrs"
- **🗑️ Fake confidence removed** — string-length-based confidence metric (85/75/65) deleted from chat responses
- **Principle**: Every number shown to users is either real AI or clearly indicates it's loading

### v2.0 — Final MNC-Grade Polish & Complete Audit
- **🔍 15+ AI sub-agents** ran full end-to-end audits: architecture, security, frontend, backend, prompts, cloud, QA, product, UX, design system, config, test coverage
- **🛡️ 10 security fixes**: investor/chat output sanitization, auth login query narrowed, email validation on register, nginx security headers (COOP/CORP/XSS/Referrer/Permissions), stronger SSL ciphers, server_tokens off
- **🧹 6 files removed**: stale audit reports, orphaned ChatPanel component + test, unused assets, stale logs
- **⚙️ 8 config fixes**: .gitignore coverage/playwright dirs, docker-compose resource limits + port mapping, .env.example cleaned, oxlint rules expanded, nginx header inheritance fixed
- **🤖 4 new AI agents**: Legal, Designer, Developer, Planner — full 10-agent council
- **📱 Sidebar grouped**: 17 flat items → 4 collapsible sections (Core, Strategy, AI Tools, Personal)
- **📊 Analytics labeled**: projected metrics clearly marked with info banner
- **🔬 Background research enabled by default**
- **⚡ Performance**: React.memo on leaf components, CommandCenter API call debouncing
- **🧹 Zero console.log/error/warn** in production code (backend + frontend)
- **🧪 331 tests passing** (47 files), 0 lint errors, build 236KB gzip

### v1.9 — MNC-Grade Quality & Production Hardening
- **🛡️ 8 AI sub-agents** audited architecture, security, frontend, backend, prompts, cloud, QA, product, and MLOps
- **🔒 36 fixes** applied across security, bugs, accessibility, performance, and infrastructure
- **⚡ Circuit breaker** — AI models skip after 3 consecutive failures (prevents cascade failures)
- **🔐 Auth hardening** — All 7 auth routes now use `sendError()`, context objects sanitized, reminders endpoint requires JWT
- **🐛 Critical bug fixes** — MemoryGraph edge key, chatStream onDone callback, Sidebar DNA key mismatch
- **♿ Accessibility** — Focus-visible CSS rules, modal Escape key handlers
- **📱 Mobile responsive** — AI Workspace, Weekly Review, Founder Twin, Analytics grids
- **🏗️ Infrastructure** — Log rotation (7-day), correlation IDs, startup env validation, database migration system, readiness health check
- **📊 Testing** — Vitest coverage config, `test:e2e` script, `test:coverage` script
- **🤖 Agent quality** — All 6 agents now have personality directives and output format instructions
- **🧪 331 tests passing** (47 files), 0 lint errors, build 236KB gzip

### v1.8 — 5 Customer Persona Audit & UX Hardening
- **👤 5 customer sub-agents** walked through every screen
- **🐛 16 UX fixes**: GoalPage preserves answers on API error, clarifying answers no longer lost on retry, ExecutionMode null-checks, mobile sidebar margin fixed
- **📱 Mobile responsive**: Dashboard sidebar margin corrected to 56px, all grid layouts maintain responsive behavior
- **🧪 264 tests passing** (44 files), 0 lint errors, build 236KB gzip

### v1.7 — Comprehensive Security & Quality Audit
- **🛡️ 12 AI sub-agents** audited every layer — architecture, backend, frontend, prompts, cloud, QA, product, UX, graph, domain, beta testing, and internal quality
- **🔒 7 security fixes**: prompt injection now strips patterns, all 30+ routes use centralized `sendError()`, missing auth on `/engines/reality/score`, password reset tokens hashed + timing-safe comparison, `trust proxy` for rate limiting behind nginx
- **🐛 5 backend bug fixes**: simulation bias removed, memory graph now queries bidirectional edges, auth limiter error message, `console.log` → logger, broken `.dockerignore` fixed
- **⚡ 8 frontend fixes**: CommandCenter infinite re-render loop, page crash on AI error, `React.lazy` code splitting (236KB main bundle, down from 425KB), AuthPage hydration flash, hardcoded localhost in SettingsPanel, dead Edit/Export buttons, humanized API errors
- **♿ 4 accessibility fixes**: ARIA labels on all icon buttons, keyboard navigation on interactive divs, `aria-current` on nav items, screen-reader-friendly priority indicators
- **🧪 34 new tests** (206 total, 31 files): API route integration tests, business engine, simulation engine, utility helpers
- **🏗️ Infrastructure**: nginx SSL config, Docker HEALTHCHECK + `--chown`, `apk upgrade`
- **📋 Lint**: 0 errors, 0 warnings

### v1.6 — Production Hardening
- **📋 features.md** — Comprehensive feature directory documenting all 20 feature areas, 30+ API endpoints, and 151 tests
- **🐛 Fixed**: Dashboard sidebar syntax error causing crash on profile render
- **🧹 Cleaned**: 12 unused imports, dead code, and duplicated logic removed
- **🔒 Security**: Password reset token no longer logged to console; prompt injection defense-in-depth
- **💾 Memory leak fix**: Blueprint cache now has TTL (1 hour) to prevent unbounded growth
- **⚡ Performance**: Fixed missing React hook dependencies in 4 components
- **🧪 All 151 tests passing**, lint clean

### v1.5 — Full Test Coverage
- **151 tests across 27 files** covering all 14 dashboard views and all backend engines
- Unit, integration, and E2E test suites

---

## Features

> **📖 Full details in [`features.md`](features.md)** — 1000+ lines covering 20 feature areas, 30+ API endpoints, and 331 tests.

### Onboarding & Goal Setting
- **7-Question Founder Onboarding** — understand the founder, not just the startup (2 minutes)
- **Founder Profile** — automatically generated personality, experience, and working style model
- **Goal Conversation** — natural language goal input with adaptive clarifying questions
- **Reality Engine** — 8-dimension feasibility scoring (Market, Competition, Tech, Customer, Founder Fit, Revenue, Timing, Execution)
- **Negotiation Engine** — alternative goal suggestions when original is unrealistic (80/20 rule)

### Business Planning
- **Business Blueprint** — AI-generated 15-section business document
- **AI Document Generator** — instant generation of Business Plans, PRDs, Pitch Decks, Landing Pages, Investor Updates, Marketing Plans, Technical Specs, Competitor Analysis

### Dashboard (16 Views)

| View | Description |
|---|---|
| **Command Center** | Daily mission, startup score, business health, morning briefing |
| **AI Workspace** | Split-screen chat with 10 AI agent personas |
| **Business Blueprint** | Editable business document with all 15 sections |
| **Task Engine** | Sprint-based task management with AI-powered task suggestions |
| **Roadmap View** | Quarterly roadmap with stage guidance |
| **Memory Graph** | Visual knowledge graph of everything the AI remembers |
| **Founder Twin** | 10-dimension DNA scores + personalized adaptation suggestions |
| **Research Center** | AI-researched market trends, competitors, opportunities, funding events |
| **Document Generator** | 8 document types with AI content |
| **AI Board Meeting** | Multi-agent debate (CEO, CTO, CMO, CFO, Investor) |
| **Investor Mode** | Skeptical VC investor evaluation and chat |
| **Execution Mode** | Autonomous AI execution — research, code, test, deploy |
| **Decision Simulator** | 3-scenario modeling with success probabilities |
| **Company Simulator** | 1,000 virtual customer market simulation |
| **Customer Simulator** | AI persona role-play for product feedback |
| **Daily Review** | Evening review with AI-generated coaching notes |
| **Weekly Review** | CEO/Board weekly performance analysis |

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
- **Vite 8** for build tooling (code splitting with React.lazy)
- **Zustand 5** for state management (6 stores with localStorage persistence)
- **React Router v7** for routing
- **Recharts** for data visualization
- **Lucide React** for icons
- **Custom Design System** — warm color palette (Cream/Beige/Brown) with 50+ CSS custom properties
- **16 UI Components** — AuroraBackground, CursorGlow, KineticText, ThreeDCard, BentoGrid, RippleButton, MagneticButton, SkeletonLoaders, ScrollStory, BottomSheet, FAB, ViewToggle, ProgressiveDisclosure, LiquidSwipe, SlideCards, ScrollProgress

### Backend
- **Express 5** API server with centralized error handling
- **Supabase** (PostgreSQL) for persistent storage — cloud-hosted, auto-scaling
- **@supabase/supabase-js** with service_role key for backend database access
- **JWT** authentication with bcrypt password hashing + timing-safe reset tokens
- **OpenAI SDK** (compatible with NVIDIA API) for AI completions
- **10 AI Agent Personas**: CEO, CTO, CMO, Sales, Finance, Research, Legal, Designer, Developer, Planner
- **Buffered async logger** — non-blocking file-based structured logging with rotation
- **Circuit breaker** — AI model fallback with failure tracking

### AI
- **Model**: `meta/llama-4-maverick-17b-128e-instruct`
- **Provider**: NVIDIA API (`https://integrate.api.nvidia.com/v1`)
- **Fallback models**: Mistral Large, Microsoft Phi-4 (automatic rotation with circuit breaker)
- **SDK**: OpenAI-compatible with custom base URL, 30s timeout, max_tokens limit
- **All AI responses are real** — no mock data, no fallback placeholders

### Security
- Helmet security headers with CSP
- CORS restricted to configured frontend URL
- Rate limiting: 100 req/15min general, 10 req/15min auth
- Prompt injection protection: 22 regex patterns + redaction
- Output sanitization: script tags, iframes, event handlers, javascript: URIs
- `sendError` sanitizer — no stack traces or internal details leaked to clients
- Context sanitization — user-controlled context objects sanitized before AI calls
- `trust proxy` enabled for accurate IP behind nginx
- Auth on all protected endpoints (including reminders)

### Infrastructure
- **Log rotation** — 7-day automatic cleanup
- **Correlation IDs** — Every request gets a unique ID for distributed tracing
- **Startup validation** — Server crashes fast if JWT_SECRET missing or too short
- **Database migrations** — Versioned migration system with tracking table
- **Readiness health check** — `/api/health/ready` verifies DB connectivity
- **Docker** — Multi-stage build, non-root user, `.dockerignore`, healthcheck

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
echo "JWT_SECRET=your-jwt-secret-minimum-32-characters" >> .env
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
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
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

CREATE TABLE IF NOT EXISTS memory_edges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  source_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);
```

### Production Build

```bash
npm run build
npm run server  # Serves API only
```

### Docker Deployment

```bash
docker compose up --build
```

Nginx reverse proxy with SSL support is configured in `nginx.conf`. Set `SSL_CERT_PATH` and `SSL_KEY_PATH` env vars for HTTPS.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server + frontend concurrently |
| `npm run server` | Start API server only |
| `npm run build` | Production build |
| `npm run lint` | Run linter (0 errors) |
| `npm test` | Run all 331 tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Project Structure

```
ai-cofounder-AG/
├── server/                      # Express API backend
│   ├── index.js                 # Entry point (port 3001)
│   ├── agents/                  # AI agent personas (10 agents)
│   ├── db/                      # Supabase database layer
│   │   ├── database.js          # Supabase client (service_role)
│   │   └── schema.js            # Versioned migration system
│   ├── engines/                 # AI business logic (12 engines)
│   ├── routes/
│   │   ├── api.js               # 30+ API endpoints
│   │   └── auth.js              # JWT register/login/me
│   ├── services/
│   │   ├── ai.js                # OpenAI SDK + circuit breaker + prompt injection defense
│   │   ├── search.js            # Web search (DuckDuckGo, Startpage)
│   │   ├── logger.js            # Buffered async logging with rotation + correlation IDs
│   │   ├── errors.js            # Centralized error sanitizer
│   │   └── reminders.js         # WhatsApp reminder scheduler
│   └── __tests__/               # Backend tests
├── src/                         # React frontend
│   ├── App.jsx                  # Root + routing (code-split with React.lazy)
│   ├── main.jsx                 # Entry point
│   ├── pages/                   # 7 page components
│   ├── components/              # 16 dashboard view components
│   │   ├── ui/                  # 16 reusable UI components (Aurora, Bento, 3D, etc.)
│   │   ├── dashboard/           # CommandCenter, Sidebar, Settings, AIWorkspace
│   │   ├── ai/                  # BoardMeeting, Execution, Investor
│   │   └── ...                  # Other feature components
│   ├── store/                   # 6 Zustand stores
│   ├── styles/                  # Design system CSS (warm palette)
│   └── utils/                   # API client, helpers, constants
├── e2e/                         # Playwright E2E tests
├── index.html                   # HTML entry
├── vite.config.js               # Vite build + coverage config
├── nginx.conf                   # Nginx reverse proxy (SSL ready)
├── Dockerfile                   # Docker build (multi-stage, non-root)
├── docker-compose.yml           # Docker compose
├── .dockerignore                # Docker build exclusions
└── .env                         # Environment variables
```

---

## API Endpoints

All endpoints are `POST /api/*` unless noted as `GET`. Auth endpoints use `Authorization: Bearer <token>`; most other endpoints use `x-api-key` header.

### Authentication

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Auth | `POST /api/auth/register` | None | Create account |
| Auth | `POST /api/auth/login` | None | Sign in |
| Auth | `GET /api/auth/me` | JWT | Get current user |
| Auth | `POST /api/auth/forgot-password` | None | Request password reset |
| Auth | `POST /api/auth/reset-password` | None | Execute password reset (token in body) |

### Core

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Chat | `/chat` | API key | General AI chat |
| Chat | `/chat/agent` | API key | Agent-specific chat (CEO, CTO, etc.) |
| Reality | `/engines/reality` | API key | Goal feasibility scoring |
| Reality | `/engines/reality/score` | API key | Score from onboarding answers |
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
| Review | `/review/weekly` | API key | Weekly CEO review |
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
| Business | `/business/blueprint` (GET) | JWT | Get stored blueprint |
| Execution | `/execution/plan` | API key | Generate execution plan |
| Execution | `/execution/step` | API key | Execute a step |

### Memory

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Memory | `/memory/nodes` (POST) | JWT | Add memory node |
| Memory | `/memory/nodes/:id` (GET) | JWT | Get memory nodes |
| Memory | `/memory/timeline/:id` (GET) | JWT | Get memory timeline |
| Memory | `/memory/graph/:id` (GET) | JWT | Get full memory graph |

### Investor & Health

| Category | Endpoint | Auth | Purpose |
|---|---|---|---|
| Investor | `/investor/evaluate` | API key | Investor evaluation |
| Investor | `/investor/chat` | API key | Investor chat |
| Health | `GET /api/health` | None | Server health check |
| Health | `GET /api/health/ready` | None | Readiness check (DB, AI) |

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
Startup Dashboard → 16 AI-powered views
    ↓
Continuous AI Loop (memory, research, review, replan)
```

---

## Test Coverage

| Category | Files | Tests |
|----------|-------|-------|
| **Store Tests** | 6 | 51 |
| **Component Tests** | 19 | 66 |
| **Engine Tests** | 14 | 92 |
| **Route Tests** | 2 | 21 |
| **Service Tests** | 5 | 24 |
| **Utility Tests** | 1 | 19 |
| **E2E Tests** | 3 | 10 |
| **Total** | **50 files** | **130 tests** |

---

## License

MIT
