# AI Co-Founder

The world's first **Startup Operating System** — an AI that builds companies with you.

AI Co-Founder is a full-stack application combining a React frontend, Express backend, and NVIDIA AI to guide founders from idea to execution. It provides AI-powered business planning, task management, market research, document generation, investor evaluation, decision simulation, and more — all in one dashboard.

## Quick Start

```bash
cp .env.example .env     # add your NVIDIA API key and Supabase credentials
npm install              # install dependencies
npm run dev              # starts backend + frontend
```

Then open **http://localhost:5173**.

## User Flow

```
Landing → Auth → Onboarding → Goal Setting → Blueprint (auto-generated) → Dashboard
```

1. **Onboarding** — 7-question founder profile (experience, goals, blockers)
2. **Goal Setting** — AI Reality Engine evaluates feasibility, negotiates weak goals
3. **Blueprint** — 15-section business plan generated automatically
4. **Dashboard** — Full execution plan, AI agents, research, documents, simulator

## Dashboard Views

| View | Description |
|---|---|---|
| Command Center | Startup score, daily mission, health, today's tasks |
| AI Co-Founder | Chat with 10 specialized AI agents |
| Business Blueprint | Review/edit/export your full plan |
| Full Plan | Multi-phase execution plan with sprints |
| Task Engine | Sprint & task management |
| Roadmap | Timeline view of milestones |
| Memory Graph | Visual knowledge graph of your business |
| Founder DNA | Personality and strength analysis |
| Research | AI-driven market research & briefings |
| Documents | Generate PRDs, pitch decks, plans |
| AI Board | Multi-agent board meeting |
| Investor Mode | AI evaluates your startup |
| Build Mode | AI executes tasks autonomously |
| Simulator | Test decisions with virtual customers |
| Daily Review | Daily progress check-in |
| Weekly Review | AI-generated weekly performance summary |
| Settings | API key, account, server status |

## Tech Stack

- **Frontend**: React 19, Zustand, React Router 7, Lucide icons
- **Backend**: Express 5, Supabase (PostgreSQL), JWT auth
- **AI**: NVIDIA API (Llama 4 via OpenAI-compatible SDK)
- **Build**: Vite 8, Vitest, oxlint
- **Deployment**: Docker multi-stage, GitHub Actions CI/CD, nginx

## Configuration

Key environment variables (see `.env.example`):

| Variable | Required | Default |
|---|---|---|
| `NVIDIA_API_KEY` | Yes | — |
| `SUPABASE_URL` | Yes | — |
| `SUPABASE_SERVICE_KEY` | Yes | — |
| `JWT_SECRET` | Yes | min 32 chars |
| `AI_MODEL` | No | `meta/llama-4-maverick-17b-128e-instruct` |
| `FRONTEND_URL` | No | `http://localhost:5173` |

## Tests

```bash
npm test          # 331+ unit tests
npm run test:e2e  # Playwright E2E tests
```

## Docker

```bash
docker compose up --build
```

## License

Private — all rights reserved.
