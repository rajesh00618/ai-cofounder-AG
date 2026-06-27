# AI Co-Founder — Product Specification (Build Document v1.0)

> **Build Instruction (for the AI agent building this):** This document is the complete, authoritative product specification for "AI Co-Founder" — a Startup Operating System. Treat every section as a functional requirement, not a suggestion. Where architecture decisions are not explicitly specified, follow the "Suggested Technical Architecture" section at the end. Build incrementally in the phase order given in "Build Roadmap," validating each phase before moving to the next.

---

## 1. Vision

Build the world's first AI Co-Founder that doesn't just answer questions. It **thinks, challenges, researches, plans, executes, tracks progress, remembers everything, and grows with the founder** throughout the entire startup journey — from raw idea to scale.

**Positioning statement:**
> Most AI tools answer questions. This AI builds companies.

This is not a chatbot. Not a generic AI assistant. It is a **Startup Operating System** with a persistent, opinionated AI co-founder at its core.

---

## 2. Core Philosophy

Current AI products behave like assistants — reactive, agreeable, stateless. This product behaves like a real co-founder. A real co-founder:

- Understands the founder, not just the startup
- Understands the startup's actual state, not just what the founder claims
- Challenges bad decisions instead of validating them
- Helps make better decisions through reasoning, not flattery
- Creates execution plans and **tracks** execution (not just generates plans)
- Holds the founder accountable
- Continuously learns about the founder and adapts
- Stays with the founder across every stage until the company succeeds

### AI Personality Rules (non-negotiable)
The AI must **never blindly agree**. It must:
- Ask clarifying questions before answering
- Challenge unrealistic assumptions with evidence/reasoning
- Explain its reasoning, not just its conclusion
- Recommend alternatives when the founder's plan is weak
- Stay honest — be optimistic but realistic, never falsely motivational
- Focus on execution over generic encouragement
- Think like a founder/operator, not like a customer-service chatbot

**Golden Rule — every AI response must satisfy three checks:**
1. Is the founder's request/goal realistic?
2. What is the fastest viable path to it?
3. What should the founder do *next* (concretely)?

> If a response does not improve execution, it should not exist.

---

## 3. Product Mission

Move founders through this pipeline without them feeling alone:

```
Idea → Validation → MVP → Launch → First Revenue → Product-Market Fit → Growth → Scale
```

At every stage, the AI updates plans, tasks, research, documents, and recommendations automatically — the founder is never stuck wondering what's next.

---

## 4. UX Philosophy

- **Never overwhelm.** Every screen answers exactly one question: *"What should I do next?"*
- Users should never feel lost.
- Design bar: **Apple-level simplicity. Linear-level productivity. Notion-level organization. ChatGPT-level conversational ease.**

---

## 5. End-to-End User Journey

```
Landing
  ↓
7 Founder Onboarding Questions
  ↓
Founder Profile Generated
  ↓
AI Welcome (personalized, not generic)
  ↓
Goal Conversation
  ↓
Clarification Engine (adaptive questioning)
  ↓
Reality Engine (feasibility scoring)
  ↓
Negotiation Engine (only if goal is unrealistic)
  ↓
Business Planning (deep-dive questions)
  ↓
Business Blueprint (auto-generated document)
  ↓
Execution Roadmap
  ↓
Startup Dashboard (the daily home base)
  ↓
Daily Tasks
  ↓
Continuous AI Co-Founder Loop (memory, research, review, replanning)
```

---

## 6. Phase 1 — Founder Onboarding

**Duration constraint:** Maximum 2 minutes. **Purpose:** Understand the *founder*, not the startup yet.

| # | Question | Options |
|---|----------|---------|
| 1 | What is your primary goal right now? | Find an idea · Validate an idea · Build MVP · Get customers · Generate revenue · Scale |
| 2 | Founder experience? | First startup · Tried before · Currently running one · Serial entrepreneur |
| 3 | Are you building alone? | Solo · Co-founder · Small team · Company |
| 4 | Weekly time available? | Less than 5 hrs · 1–2 hrs/day · 3–5 hrs/day · Full-time |
| 5 | Preferred working style? | Teach me step-by-step · AI does most of the work · Mix of both |
| 6 | Biggest current blocker? | Idea · Validation · Customers · Product · Marketing · Sales · Funding |
| 7 | Definition of success in 6 months? | MVP · First customer · First revenue · Product-market fit · Investment |

**Output — Founder Profile (auto-generated, never asked again):**
- Name, Experience level, Goals, Strengths, Weaknesses
- Learning Style, Working Hours, Risk Appetite
- Decision Style, Execution Style

---

## 7. Phase 2 — AI Welcome & Goal Conversation

Instead of a generic *"How can I help you?"*, the AI opens with a profile-aware welcome:

> "Hi [Founder Name]. I now understand how you work. My job is to help you build your company. Tell me your biggest goal today."

The founder states a goal in natural language (e.g., *"I want to earn $1000 in 30 days."*).

---

## 8. Phase 3 — Clarification Engine

**Rule: the AI never answers a goal immediately.** It investigates first.

- Questions are **dynamically adaptive** — generated based on the goal stated, not from a fixed script
- **Hard cap: maximum 5 questions**
- Every question must measurably reduce uncertainty about feasibility (no filler questions)

Example adaptive question set for "$1000 in 30 days":
1. How will you earn it? (SaaS · AI Agency · Freelancing · AI Product · Not sure)
2. Current stage? (Idea · Prototype/MVP · Existing product · Nothing yet)
3. Daily available time? (2 hrs · 4 hrs · 8 hrs · Full-time)
4. Budget? ($0 · Under $100 · Under $1000 · More)
5. Strongest skill? (AI/Programming · Sales · Marketing · Design)

---

## 9. Phase 4 — Reality Engine (core differentiator)

This is the heart of the product. Where most AI tools say *"Great idea!"*, this engine asks *"Is this realistic?"*

**Evaluates across these dimensions:**
- Timeline feasibility
- Market size & demand
- Competition intensity
- Founder experience match
- Available resources (time, budget, skills)
- Customer validation status
- Technology feasibility
- Overall risk

**Output format:**
```
Goal: $1000 in 30 days
Reality Score: 82%
Probability of Success: 24–74% (range depends on path chosen)
Main Risks:
  - No validation done yet
  - No marketing plan
  - No existing audience
Recommendation: Interview 10 target customers before building anything.
```

---

## 9A. AI Think Mode + Confidence Meter (applies everywhere from here on)

Every non-trivial AI response — Reality Engine scoring, Negotiation alternatives, business analysis, simulations, board decisions — must visibly show its reasoning process before the final answer, instead of producing an instant black-box output. This is what makes the AI feel like it's actually working, not autocompleting.

**Visible processing states (must reflect what's actually happening in the backend, not decorative):**
```
Thinking...
Checking Memory...
Researching...
Comparing...
Running Reality Engine...
Done.
```

Pair every completed answer with an **AI Confidence Meter**:
```
Confidence: 92%
Reason: High confidence — backed by market data + prior validation evidence
```
Low-confidence answers must say so explicitly rather than presenting uncertain conclusions with false authority — this directly enforces the "AI never lies" rule from Section 2.

---

## 10. Phase 5 — Negotiation Engine

Triggered **only if** the Reality Engine flags the goal as low-probability. The AI never lies and never gives fake motivation — it always explains *why* an alternative is better.

**Output format — always present 2–3 alternatives + the original, with explicit success probability for each:**
```
Current Goal:   $1000 in 30 days  → Success Probability: 22–24%
Alternative A:  $500 in 30 days   → Success Probability: 82–85%
Alternative B:  $1000 in 60 days  → Success Probability: 76%
Alternative C:  Keep current goal → Risk: Very High (explicit warning)
```
The founder makes the final decision — the AI's role is to inform, not override.

---

## 11. Phase 6 — Business Planning

Triggered **only after** the founder has agreed on a realistic goal (post Reality/Negotiation engines).

AI asks 2–5 targeted business questions:
- Who is your customer?
- What is their biggest problem?
- What do they currently use instead (status quo / competitors)?
- Why now (timing)?
- What's your pricing?
- What's your USP (unique selling proposition)?

---

## 12. Phase 7 — Business Blueprint (auto-generated document)

A complete, **fully editable** business document containing:

- Executive Summary
- Problem & Solution
- Target Customer & ICP (Ideal Customer Profile)
- Market Size
- Unique Selling Proposition (USP)
- Competitors & SWOT
- Revenue Model & Pricing
- Business Model Canvas
- Risk Analysis
- Go-to-Market Plan
- Validation Plan
- MVP Plan
- Roadmap
- Financial Estimate
- Success Metrics

---

## 12A. AI Execution Mode (core differentiator — AI does, not just tells)

This is the single biggest behavioral upgrade over a typical AI co-founder: instead of only advising, the AI can **execute** directly when the founder approves.

**Example interaction:**
```
Founder: "Build my landing page."

AI: I will now:
  ✓ Research competitors
  ✓ Generate landing page structure
  ✓ Generate copy
  ✓ Create hero section
  ✓ Build React code
  ✓ Deploy

  Estimated time: 6 minutes
  [Start]
```
Once approved, the AI executes the full chain autonomously and reports back — it does not just hand over a checklist and wait.

### 12A.1 Build Mode (execution visualized as a pipeline)
For technical/product-build tasks specifically, execution is shown as a visible pipeline with live progress, not a single "here's your code" dump:
```
Research → Architecture → Coding → Testing → Deploy → Open Preview
```
Each stage shows real progress (not a fake loading bar) and the founder can inspect output at any stage before it proceeds to the next.

---

## 13. Phase 8 — Startup Dashboard / Command Center (the daily home base)

**Critical principle: the dashboard is the brain, not a chat window.** Chat is one tool inside the dashboard, not the whole product.

### 13.0 AI Workspace (split-screen layout, not a single chat thread)
The primary working surface is a split screen, not full-screen chat:
```
┌─────────────┬─────────────────────────────┐
│             │  Business Plan / Tasks /    │
│    Chat     │  Research / Files / Memory  │
│  (AI Co-    │  (whichever panel is active │
│  Founder)   │  updates live as chat        │
│             │  produces output)            │
└─────────────┴─────────────────────────────┘
```
When the founder discusses pricing in chat, the Business panel updates live. When the AI runs research, the Research panel updates live. Chat drives the workspace; it doesn't replace it.

### 13.1 Information Architecture (top-level modules)
```
Home / Command Center · Business · AI Co-Founder (chat) · Research · Tasks ·
Documents · Roadmap · Marketing · Sales · Finance ·
Investors · Analytics · Memory Graph · Settings
```

### 13.2 Home / Command Center
Displays at a glance:
- Today's Mission
- Reality Alerts (warnings the AI proactively raised)
- Founder Mood (from Daily Review check-ins)
- Progress / Execution Score
- Business Health (overall %)
- Revenue
- Customers
- Latest Research findings
- Recent Activity
- Weekly Goal
- Current Roadmap Stage
- Today's AI Recommendation

### 13.2A Live Startup Score
A always-visible, daily-updating composite score broken into the dimensions that actually drive outcomes — distinct from the broader Business Health Score (Section 15) in that this is the fast, glanceable "pulse check" version:
```
Execution:      84%
Business:       61%
Customers:      18%
Product:        72%
Cash:           42%
AI Confidence:  79%
```
Updates daily based on task completion, research findings, and founder check-ins — not a static snapshot.

### 13.3 Business Workspace
Editable, synchronized fields: Problem, Solution, Customer, USP, Pricing, Competitors, Business Model, Market, Validation status, Vision, Mission, Roadmap.

### 13.4 Research Center
Background AI agents continuously research and auto-update:
- Competitors, pricing changes, customer reviews
- Market trends, news, technology shifts
- Funding rounds, grants, hackathons, accelerators (YC, etc.)

### 13.5 Task Engine
Every business decision/plan automatically decomposes into tasks.
```
Example — Today:
  - Interview 3 target users        [Priority: High | ~45 min | AI-assisted]
  - Build landing page              [Priority: High | ~2 hrs  | AI-assisted]
  - Set up payment integration      [Priority: Med  | ~1 hr   | AI-assisted]
  - Deploy MVP                      [Priority: High | ~3 hrs  | Manual]
```
Each task carries: Priority, Estimated Time, Difficulty, Dependencies, Level of AI assistance available.

**Adaptive planning:** if tasks are missed, the AI replans automatically. If priorities shift, the roadmap updates automatically. Plans are never static.

### 13.5A Auto Sprint
Tasks are also grouped into weekly sprints with a single sprint goal, generated automatically each Monday:
```
Sprint 12
Goal: Launch Beta
Tasks: Research · Code · Marketing
Deadline: Friday
```
The sprint goal ties directly back to the Roadmap stage the founder is currently in — sprints are how the roadmap actually gets executed week by week, not a separate planning system.

### 13.6 Roadmap
```
Idea → Validation → MVP → Launch → Revenue → Product-Market Fit → Scale
```
Current stage is always visually highlighted.

### 13.7 Documents (instant generation)
Business Plan · PRD · Pitch Deck · Landing Page copy · Investor Deck · Marketing Plan · Financial Plan · Technical Docs.

### 13.8 Memory Graph
The AI remembers everything across the founder's entire journey — but critically, **not as a flat timeline**. Memory is structured as a connected graph, because founder decisions don't happen in isolation:
```
Founder
  ↓
Projects → Tasks → Ideas
  ↓
Customers → Feedback
  ↓
Documents → Meetings
  ↓
Competitors → Pricing changes
  ↓
Revenue
```
Every node links to the nodes that influenced it — e.g. a pricing change links back to the customer feedback and competitor data that caused it. This is what makes "never ask twice" actually intelligent: the AI can trace *why* something changed, not just *that* it changed.

A chronological **Timeline view** remains available as one lens into this graph, for quick scanning:
```
June 20 — Idea Created
June 28 — Landing Page Live
July 3  — First Customer
July 15 — First Revenue
August  — Funding Conversation Started
```

### 13.9 Analytics
Visitors, Revenue, MRR, Users, Retention, Burn Rate, Growth — with the AI explaining what each metric means and what to do about it, not just displaying numbers.

---

## 14. Founder Twin (behavioral modeling system — beyond DNA scoring)

This goes deeper than tracking scores. The AI builds a working model — a "twin" — of how this specific founder operates, so its coaching and pacing are personalized rather than generic:

- **How you think** — reasoning patterns, what evidence convinces you
- **How you decide** — fast/intuitive vs. slow/analytical, risk tolerance in practice
- **How you learn** — by reading, by building, by being challenged
- **How you work** — peak hours, focus span, what derails you
- **How you fail** — what situations cause you to stall or abandon tasks
- **How you recover** — what gets you back on track after a setback

**Founder DNA scores** (the measurable surface of the twin) are tracked across:
- Decision-making · Execution · Consistency · Learning speed
- Leadership · Sales ability · Technical skill · Communication · Focus · Confidence

**The AI adapts its behavior based on detected patterns and weaknesses:**
```
Weak Sales        → AI increases sales coaching frequency
Weak Execution     → AI breaks tasks into smaller units
Weak Focus         → AI reduces daily workload / simplifies priorities
Tends to stall after setbacks → AI changes how it delivers bad news, adds recovery nudges
```
The Founder Twin is what allows the same underlying engines (Reality, Negotiation, Task) to feel personalized to *this* founder rather than generic across all users.

---

## 15. Business Health Score

A weighted dashboard score across categories, e.g.:
```
Idea:        95%
Validation:  34–40%
Product:     60–61%
Marketing:   25–28%
Sales:       10–12%
Finance:     16%
Overall:     46–47%
```
Purpose: make the founder's exact weak spots visible at a glance — not a vanity metric.

---

## 16. Decision Simulator

For any major fork-in-the-road decision, the AI models scenarios with timeline + success probability and gives a clear, data-justified recommendation.

```
Question: "Should I build a mobile app?"

Scenario A — Native App   | Timeline: 4–5 months | Success: 40%
Scenario B — Web App       | Timeline: 1 month    | Success: 82–84%

Recommendation: Build the Web MVP first.
```

---

## 16A. Failure Prediction

The AI proactively surfaces failure risk before it becomes fatal — not as a vague warning, but with a specific probability and named causes:
```
Your startup currently has a 63% chance of failing because:
  - No validation done
  - No distribution channel
  - Weak marketing

Let's fix them — starting with validation.
```
This should trigger automatically whenever Business Health (Section 15) drops below a threshold in any critical dimension, and should always end with a concrete next action, per the Golden Rule in Section 2.

---

## 16B. Company Simulator (flagship differentiator — largely unmet in the market)

Before the founder commits to a real-world decision with consequences (pricing, launch timing, positioning), they can run it through a simulation first.

```
Founder: "Launch this pricing."

AI runs simulation:
  1,000 virtual customers
    ↓
  Estimated Conversion
    ↓
  Projected Revenue
    ↓
  Likely Complaints
    ↓
  Retention Estimate
    ↓
  Result: [summary + recommendation]
```
This is conceptually a step beyond the Decision Simulator (16) and Customer Simulator (17.2) combined — it models an entire market's reaction to a decision, not just one scenario comparison or one persona's feedback. Effectively: **play the future before making the decision**, rather than finding out after launch.

---

## 17. AI Team (multi-agent system, not a single model)

Instead of one general AI, the founder is supported by a council of specialized agents that collaborate:

| Agent | Responsibility |
|---|---|
| **CEO AI** | Business decisions, prioritization |
| **CTO AI** | Technical architecture decisions |
| **CMO AI** | Marketing strategy |
| **Sales AI** | Customer acquisition strategy |
| **Finance AI** | Budget, pricing, runway |
| **Legal AI** | Compliance basics, contracts awareness |
| **Research AI** | Deep/background research |
| **Designer AI** | UX/UI guidance |
| **Developer AI** | Coding/implementation assistance |
| **Planner AI** | Task breakdown & scheduling |

### 17.1 AI Board Meeting
For significant decisions, multiple agent personas weigh in with distinct viewpoints (CEO, CTO, CMO, CFO, Investor, Research, Legal) before the founder decides — modeling a real board's diversity of perspective rather than one monolithic answer.

### 17.1A AI Debate (lightweight version of the Board Meeting for single questions)
For sharper, single-topic disagreements, agents argue their position directly against each other so the founder sees the actual tension between functions, not a blended-down answer:
```
Founder: "What should I price this at?"

CEO:       Price high — protects margin and positioning
Sales:     Price low — removes friction, faster early traction
Finance:   Price medium — balances runway with conversion
Investor:  Need validation first — don't price without data

Founder decides.
```

### 17.2 Investor Mode
One click switches the AI's persona entirely into a skeptical investor evaluating the startup, rather than a supportive co-founder:
```
Why should I invest?
Weaknesses identified: [...]
Hard questions: [...]
Estimated valuation range: [...]
Pitch rating: [...]
```
This is intentionally adversarial — the value is in the AI *not* being on the founder's side for this exercise, so weak spots surface before a real investor finds them.

### 17.3 Customer Simulator
Before launch, the AI temporarily role-plays as different target-customer personas (e.g. Student, CEO, Developer, Teacher, Doctor) and reacts to the product as that persona genuinely would — surfacing objections, confusion points, or appeal that the founder might not anticipate from inside the building.

---

## 18. Opportunity Radar

Continuous background scanning for founder-relevant external opportunities:
Investors · Accelerators (e.g. YC) · Competitions · Hackathons · Grants · Partnerships · Incubators · relevant API/model launches.

The founder should only ever see **opportunities that are actually relevant** to their stage and niche — not a generic feed.

### 18.1 AI Never Sleeps
The Research Center (13.4) and Opportunity Radar both run as genuine 24/7 background processes, not only when the founder opens the app. Each morning, the AI greets the founder with what it found overnight:
```
Good morning Rajesh.

Last night I found:
  - 3 new competitors
  - 2 YC startups in your space
  - 1 pricing change among competitors
  - 1 relevant funding opportunity
```
This is what makes the "co-founder" framing credible — a real co-founder doesn't stop thinking about the company when the founder logs off.

---

## 19. Review Cadences

### 19.1 Daily Review (every evening)
- What did you complete?
- What blocked you?
- What did you learn?
- Mood/energy check
- Tomorrow's focus

→ AI updates memory and may adjust tomorrow's task load based on answers.

### 19.2 Weekly CEO/Board Review (every Sunday)
- Summary of achievements vs. missed goals
- Business Health trend
- Execution Score
- Suggestions for the coming week
- Next week's plan
- A grade/score for the week

---

## 20. Automation Layer

- WhatsApp/notification reminders for tasks
- Daily and weekly report delivery
- Calendar sync for deadlines/meetings
- Email follow-up assistance
- Monthly strategy review trigger

---

## 21. Long-Term Stage Model

```
Founder → Idea → Validation → Business Plan → MVP → Launch →
First Customer → Revenue → Product-Market Fit → Growth → Hiring →
Investment → Scale
```
At every stage transition, the AI automatically updates: plans, tasks, research focus, document templates, and recommendations. Nothing is manually re-triggered by the founder.

---

## 22. Final Product Statement

> ChatGPT helps people **answer questions**.
> Typical AI co-founder tools help people **create business plans**.
> **Our AI runs the startup with the founder** — it researches, decides alongside, executes, simulates outcomes before they happen, and never stops working in the background.

This distinction must be visible in every screen, every conversation, every decision, and every feature. If a feature could exist in a generic chatbot, it is not differentiated enough for this product. The features that prove this distinction most concretely are: **Execution Mode** (12A), **Company Simulator** (16B), and **AI Never Sleeps** (18.1) — these are the ones a competitor cannot fake with a better prompt.

---

## 23. Suggested Technical Architecture (build guidance)

> This section is *guidance for the build agent*, not a rigid mandate — adapt to actual constraints, but preserve the architectural intent: persistent state, multi-agent reasoning, and proactive (not just reactive) behavior.

### 23.1 High-level system shape
- **Orchestrator layer**: routes founder input to the relevant specialized agent(s) (CEO/CTO/CMO/etc.), aggregates responses, and runs the "never blindly agree" check before returning output to the founder.
- **Reality Engine** and **Negotiation Engine** are not just prompts — they should be deterministic scoring modules (rule-based + LLM-assisted) so feasibility scores are explainable and reproducible, not just vibes from a language model.
- **Execution Agent** (powers Section 12A): a distinct service from the conversational orchestrator, with permission to actually take actions (generate code, deploy, create documents) once the founder approves a proposed action plan. Needs sandboxed execution and a clear approval/rollback model — this is the highest-risk, highest-differentiation component, so isolate it cleanly from the advisory layers.
- **Persistent Memory layer**: implemented as an actual **graph database** (not just a relational timeline) to support the Memory Graph (13.8) — nodes for Founder/Project/Task/Idea/Customer/Document/Meeting/Competitor/Revenue, edges representing causal/influence relationships. Combine with a vector store for semantic recall of past conversations.
- **Simulation Engine** (powers 16, 16B, 17.3): a separate modeling service that takes a proposed decision (pricing, positioning, feature) plus current market/customer data and produces a probabilistic outcome distribution — this is computationally and conceptually distinct from the Reality Engine's feasibility scoring, since it's modeling *market response* rather than *founder feasibility*.
- **Background Research Agents**: scheduled/async jobs (not on-demand only) that keep competitor/market/opportunity data fresh, writing into the Research Center module and feeding the morning "AI Never Sleeps" summary.
- **Task Engine**: business blueprint → task/sprint decomposition should be a distinct service, since tasks need to be replanned independently of conversation flow (missed-task triggers, dependency tracking, sprint grouping).

### 23.2 Suggested data model anchors
- `Founder` (profile, DNA/Twin scores, preferences)
- `Business` (blueprint fields, health scores, stage)
- `Goal` (statement, reality score, negotiation history, status)
- `Task` (priority, difficulty, estimated time, dependencies, status, sprint_id)
- `MemoryNode` / `MemoryEdge` (graph structure: type, timestamp, linked nodes)
- `ResearchItem` (type: competitor/market/opportunity, source, freshness)
- `ExecutionRun` (action plan, approval status, steps, current stage, output artifacts)
- `SimulationResult` (decision tested, sample size, projected outcomes, confidence)

### 23.3 Build Roadmap (phase order)
1. **Founder Onboarding + Profile generation** (Phase 1) — establishes the data model foundation
2. **Clarification + Reality + Negotiation Engines + AI Think Mode** (Phases 3–5, 9A) — the core differentiator; build and validate this before anything else, since it's the product's reason to exist
3. **Business Planning + Blueprint generation** (Phases 6–7)
4. **Dashboard shell + AI Workspace + Task Engine + Auto Sprint + Roadmap** (Phase 8 core)
5. **Memory Graph + Founder Twin/DNA scoring**
6. **Research Center (background agents) + AI Never Sleeps + Opportunity Radar**
7. **Multi-agent AI Team + AI Board Meeting + AI Debate**
8. **Execution Agent + Build Mode** (12A) — build only once the advisory layers above are trustworthy, since execution actions are higher-stakes than advice
9. **Review cadences (daily/weekly) + Automation/notifications layer**
10. **Analytics + Decision Simulator + Failure Prediction**
11. **Simulation Engine: Company Simulator + Customer Simulator + Investor Mode** — the most ambitious component; sequence last since it depends on having real research, memory, and business data flowing through the rest of the system to produce trustworthy simulations rather than guesses

Build and validate each phase end-to-end before adding the next — this mirrors the founder's own mental model (**Idea → Architecture → Feasibility → Build → Improve → Scale → Monetize**) and avoids building a beautiful dashboard around an engine that doesn't actually work yet.

---

*End of specification. This document is the single source of truth for the AI Co-Founder build. Any feature not traceable to a section above should be flagged for review before being added.*
