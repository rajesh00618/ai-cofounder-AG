# AI Co-Founder — Project Report

## Overview

**AI Co-Founder** is a full-stack Startup Operating System that pairs human founders with an AI co-founder to build companies. It covers the entire journey from idea validation through execution — providing business planning, task management, market research, document generation, investor evaluation, decision simulation, and autonomous execution.

**Version**: 0.0.0 (private)  
**Stack**: React 19 + Express 5 + Supabase (PostgreSQL) + NVIDIA AI (Llama 4)  
**Tests**: 331 unit tests (all passing, 47 test files), Playwright E2E suite  
**Customer Reviews**: 10 persona rounds completed (60+ bugs fixed)  
**Deployment**: Docker multi-stage, GitHub Actions CI/CD, nginx reverse proxy

---

## Architecture

### Frontend
- **React 19** with React Router 7 for client-side routing
- **Zustand 5** with `persist` middleware for state management (6 stores, localStorage-backed) — all stores use `version: 1`, `migrate`, and `partialize`
- **Vite 8** for build tooling and dev server with HMR
- **Lucide React** for iconography
- **23 components** across 8 categories (app shell, UI base, dashboard, founder, tasks, business, AI, simulators, review)
- **331 unit tests** via Vitest with jsdom environment (47 test files)
- **No external runtime dependencies beyond core stack** — removed `uuid` dependency in favor of `crypto.randomUUID()`

### Backend
- **Express 5** HTTP server with helmet, CORS, rate limiting
- **JWT authentication** with bcrypt password hashing (7-day token expiry)
- **Supabase** (PostgreSQL) with 6 tables: users, founders, businesses, tasks, memory_nodes, memory_edges
- **OpenAI-compatible SDK** communicating with NVIDIA's API (Llama 4 Maverick 17B)
- **10 AI engines**: reality, negotiation, business, dna, execution, roadmap, memory, simulation, investor, mission, review
- **10 AI agent personas**: CEO, CTO, CMO, Sales, Finance, Legal, Research, Designer, Developer, Planner
- **Circuit breaker pattern** for AI model fallback on failure (with `recordModelFailure` count logging)
- **Prompt injection protection** via boundary enforcement and `sanitizeForPrompt` on all user-sourced input
- **PII sanitization** — strips email, phone, SSN, and credit card patterns before all third-party AI API calls
- **Retry with exponential backoff** — `fetchWithRetry` (500ms, 1000ms) for network/timeout errors
- **Daily rotating logs** with async file buffering (no PII logged)
- **Background research cycle** every 6 hours
- **Telegram reminders** (morning 9AM / evening 6PM) with task notifications; scheduled batch sending with per-user error isolation

### Deployment
- **Docker**: Multi-stage build (deps → builder → runner), non-root user, read-only filesystem, seccomp profile
- **Docker Compose**: Single service, resource limits (1 CPU / 512MB RAM), health checks
- **CI/CD**: GitHub Actions — lint + test → Trivy security scan → Docker build & push to GHCR
- **nginx**: SSL termination, security headers, API proxy, static SPA serving

---

## Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, email, name, password_hash, created_at |
| `founders` | id, user_id, profile, dna_scores, created_at |
| `businesses` | id, user_id, blueprint, scores, created_at |
| `tasks` | id, user_id, sprint_id, title, description, priority, difficulty, status, due_date, phase_title |
| `memory_nodes` | id, user_id, type, label, properties, created_at |
| `memory_edges` | id, user_id, source_id, target_id, relationship, weight |

---

## User Flow Detail

1. **Landing Page** (`/`) — Feature overview, call-to-action
2. **Authentication** (`/auth`) — Register or sign in with email/password
3. **Onboarding** (`/onboarding`) — 7-question founder profile (multi-select + custom answers)
4. **Goal Setting** (`/goal`) — Enter startup goal → AI clarifying questions → Reality Engine evaluation → optional Negotiation for weak goals
5. **Blueprint Generation** (automatic, no user input) — 15-section business plan + execution plan with multi-phase sprints + AI scoring
6. **Dashboard** (`/dashboard`) — 17 sub-views accessed via collapsible sidebar

### State Persistence
- Founder profile and auth token persist across sessions (logout → re-login returns to dashboard)
- Business data (blueprint, tasks, scores, chat history) clears on logout
- All 6 stores use zustand `persist` middleware (localStorage) with `version: 1`, `migrate` functions, and `partialize` for selective persistence
- `MAX_MESSAGES` capped at 100 (reduced from 500) for chat history
- Additional localStorage keys cleaned on logout

---

## Security Measures

| Layer | Implementation |
|---|---|---|
| Authentication | JWT (7-day expiry, no PII in payload), bcrypt password hashing, rate-limited auth endpoints (10/15min) |
| Transport | Helmet CSP headers, CORS origin validation, HTTPS in production |
| API | Rate limiting (100/15min global), specific-before-global ordering, request timeouts, 413 JSON handler |
| AI | Prompt injection sanitization (`sanitizeForPrompt`), PII stripping before API calls, system boundary enforcement in agent prompts |
| Errors | Centralized handler — sanitizes all error messages, no stack traces leaked |
| Process | `unhandledRejection` + `uncaughtException` handlers, `validateEnv` checks (FRONTEND_URL, JWT length, Supabase URL) |
| Docker | Non-root user, read-only root filesystem, tmpfs for writable dirs, dropped capabilities, seccomp profile, no-new-privileges, graceful shutdown with `closeDb()` |
| Supply Chain | GitHub Actions Trivy vulnerability scanner, npm audit in CI |

---

## AI Integration

- **Provider**: NVIDIA API (Llama 4 Maverick 17B-128E-Instruct)
- **SDK**: OpenAI-compatible (`openai` npm package) with custom base URL
- **Fallback**: Model fallback chain with circuit breaker (stops after repeated failures), with `recordModelFailure` count logging
- **JSON Extraction**: All structured outputs (blueprints, plans, scores) use `extractJSON` — a robust regex-based parser with `fixTruncated` brace correction and response preview in error messages
- **Streaming**: Chat endpoints support streaming via SSE; token updates batched with `requestAnimationFrame`; `fullText` sent only on final `{ done: true }` event
- **Prompt Engineering**: Each agent has a persona-specific system prompt; the Reality Engine, Business Engine, and Plan Generation use structured prompts with "no markdown, no code fences, no explanations" instruction on all JSON-format prompts
- **Timeout**: 15s per-model timeout (reduced from 30s)

---

## Testing

**331 unit tests** across **47 test files**:

| Category | Files | Scope |
|---|---|---|
| Component tests | ~15 | Rendering, user interactions, state changes |
| Store tests | 5 | Zustand store logic, persistence, actions (migrate/partialize) |
| Helper tests | 1 | Utility functions |
| Server engine tests | 11 | AI engine output validation |
| Server service tests | 4 | AI client, logger, errors, search |
| Server route tests | 2 | Auth + API endpoint behavior |

**E2E tests**: Playwright with chromium (configured but requires running server)

---

## Key Metrics

- **Source files**: 6 pages, 23 components, 6 stores, 3 utilities, 1 stylesheet
- **Server files**: ~30 engine/service/agent files
- **Database tables**: 6
- **AI agents**: 10
- **Dashboard views**: 17
- **Customer review rounds**: 10 (5 initial personas + 5 follow-up: PM, Privacy Officer, Performance Engineer, Startup Mentor, DevOps)
- **Bugs fixed**: 60+ (security, privacy, performance, UX, code quality)
   - Telegram send errors propagated to caller (was silently swallowed)
   - Scheduled batch reminders wrap individual sends in try/catch so one failure doesn't break the batch
   - Goal page JSON extraction handles markdown-wrapped AI responses
- **Lines of code**: ~15,000+ (frontend + server)
- **Test coverage**: High (all 331 tests passing, 47 test files, 0 ESLint errors)
- **Build time**: ~500ms (Vite production build)

---

## Getting Started

```bash
git clone <repo>
cp .env.example .env   # configure NVIDIA API key, Supabase, JWT secret
npm install
npm run dev            # backend on :3001, frontend on :5173
```

For Docker:
```bash
docker compose up --build
```
