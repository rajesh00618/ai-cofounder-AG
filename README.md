# AI Co-Founder — Startup Operating System

The world's first Startup Operating System. Not just an AI chatbot — an **AI Co-Founder** that thinks, challenges, researches, plans, executes, tracks progress, remembers everything, and grows with the founder from raw idea to scale.

> Most AI tools answer questions. This AI builds companies.

---

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
- **SQLite** via `sqlite3` for persistent storage
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

# Start development (server + frontend concurrently)
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:3001`.

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
│   ├── db/                      # SQLite database layer
│   │   ├── database.js          # Connection manager
│   │   └── schema.js            # Table definitions
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
│   │   └── memory.js            # Graph memory store
│   ├── routes/
│   │   └── api.js               # 28+ API endpoints
│   └── services/
│       └── ai.js                # OpenAI SDK wrapper
├── src/                         # React frontend
│   ├── App.jsx                  # Root + routing
│   ├── main.jsx                 # Entry point
│   ├── pages/                   # 5 page components
│   ├── components/              # 15 dashboard view components
│   ├── store/                   # 5 Zustand stores
│   ├── styles/                  # Design system CSS
│   └── utils/                   # API client, helpers, constants
├── index.html                   # HTML entry
├── vite.config.js               # Vite build config
└── .env                         # Environment variables
```

---

## API Endpoints

All endpoints are `POST /api/*` unless noted as `GET`. Requires `x-api-key` header (falls back to `NVIDIA_API_KEY` env var).

| Category | Endpoint | Purpose |
|---|---|---|
| Chat | `/chat` | General AI chat |
| Chat | `/chat/agent` | Agent-specific chat (CEO, CTO, etc.) |
| Reality | `/engines/reality` | Goal feasibility scoring |
| Reality | `/engines/reality/score` | Score from onboarding answers |
| Negotiation | `/engines/negotiate` | Alternative goal generation |
| Board | `/board` | Multi-agent board meeting |
| Research | `/research` | Market research items |
| Research | `/research/opportunities` | Funding/event opportunities |
| Research | `/research/briefing` | Morning briefing |
| Documents | `/documents/generate` | Document generation |
| Roadmap | `/roadmap/generate` | Quarterly roadmap |
| Roadmap | `/roadmap/guidance` | Stage-specific guidance |
| DNA | `/founder/dna/analyze` | Founder DNA analysis |
| DNA | `/founder/dna/adapt` | DNA-based adaptations |
| Command | `/command/mission` | Daily mission generation |
| Command | `/command/health` | Health analysis |
| Review | `/review/note` | Daily review coaching note |
| Tasks | `/tasks/suggest` | AI task suggestions |
| Simulation | `/simulate/decision` | Decision scenario simulation |
| Simulation | `/simulate/company` | Company market simulation |
| Simulation | `/simulate/customer` | Customer persona simulation |
| Business | `/business/blueprint` (POST) | Blueprint generation |
| Business | `/business/blueprint` (GET) | Get stored blueprint |
| Memory | `/memory/nodes` (POST) | Add memory node |
| Memory | `/memory/nodes/:id` (GET) | Get memory nodes |
| Memory | `/memory/timeline/:id` (GET) | Get memory timeline |
| Execution | `/execution/plan` | Generate execution plan |
| Execution | `/execution/step` | Execute a step |
| Health | `/api/health` (GET) | Server health check |

---

## User Journey

```
Landing Page
    ↓
7 Founder Onboarding Questions
    ↓
Founder Profile Generated
    ↓
AI Welcome (personalized)
    ↓
Goal Conversation (natural language)
    ↓
Clarification Engine (adaptive questions)
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
