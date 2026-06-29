# AI Co-Founder — Step-by-Step Workflow

## 1. Landing Page (`/`)

- User arrives at the landing page
- Reads feature overview (Reality Engine, Execution Mode, Company Simulator, etc.)
- Clicks **"Start Building"** or **"Sign In"** → goes to `/auth`

---

## 2. Authentication (`/auth`)

### Returning user (already signed in + completed onboarding)
- Auto-redirects to `/dashboard` — no interaction needed
- If auto-redirect doesn't fire, click **"Continue"** → goes to `/dashboard`

### Returning user (signed in but onboarding incomplete)
- Shows "You're signed in" card
- Click **"Continue"** → goes to `/onboarding`

### New user — Register
- Switch to **"Sign up"** tab
- Enter Name, Email, Password
- Click **"Create Account"** → goes to `/onboarding`

### Existing user — Login
- Enter Email, Password
- Click **"Sign In"**
  - If profile exists → `/dashboard`
  - If no profile → `/onboarding`

---

## 3. Onboarding (`/onboarding`)

7 questions, each with multi-select options:

| # | Question | Purpose |
|---|----------|---------|
| 1 | What is your primary goal? | `primaryGoal` |
| 2 | What's your founder experience? | `experienceLevel`, `riskAppetite` |
| 3 | Are you building alone? | `teamStatus` |
| 4 | Weekly time available? | `timeAvailable` |
| 5 | Preferred working style? | `workingStyle` |
| 6 | Biggest current blocker? | `biggestBlocker` |
| 7 | Definition of success in 6 months? | `successDefinition` |

- **Select one or more options** per question (toggle on/off)
- Click **"Continue"** to advance (must select ≥1)
- Or click **"Type your own"** for a custom answer
- After question 7 → enter your name → click **"Meet Your AI Co-Founder"**
- Profile is saved → navigates to `/goal`

> **Note:** The founder profile persists across sessions. On next login, you go directly to `/dashboard`.

---

## 4. Goal Setting (`/goal`)

### Welcome
- AI summarises your founder profile
- Click **"Let's Go"**

### Goal Input
- Type your biggest startup goal (e.g. "Earn $1000 in 30 days")
- Click **"Analyze"**

### Clarifying Questions
- AI generates 5–7 personalised clarifying questions
- Answer each (single-select or type your own)
- After all answered → AI runs **Reality Engine**

### Reality Engine Results
- Overall **Reality Score** (0–100%)
- Radar chart across 8 dimensions
- Risk list + AI recommendation
- If score ≥ 50 → click **"Generate Blueprint"**
- If score < 50 → enters **Negotiation** phase

### Negotiation (low-score goals only)
- AI suggests alternative goals with better success probability
- Select one alternative or keep the original
- Click **"Generate Blueprint"**

---

## 5. Blueprint Generation (automatic)

After goal setting, the AI automatically generates a 15-section Business Blueprint using all data collected (goal text, clarification answers, reality scores, negotiation selection, founder profile).

### Generation
- Loading animation shows progress per section
- Scores generated (business health, startup score)
- Full execution plan created with multiple phases/sprints covering the entire journey to the goal
- Each phase gets its own sprint with tasks, duration, and goal
- First sprint is active — its tasks appear as **Today's Tasks**

### Blueprint Review (`/business-planning`)
- View full blueprint with all sections
- Click **"Edit"** to modify any section
- Click **"Export"** to download as `.txt`
- Click **"Enter Your Dashboard"** → goes to `/dashboard`
- Accessible anytime from the sidebar under **"Business Blueprint"**

---

## 6. Dashboard (`/dashboard`)

### Sidebar Navigation
- 15 views: Command Center, AI Co-Founder, Business Blueprint, Task Engine, Roadmap, Memory Graph, Founder DNA, Research, Documents, AI Board, Investor Mode, Build Mode, Simulator, Daily Review, Weekly Review, Settings
- Collapsible sidebar (toggle with `<`/`>` icon)
- User avatar + name at bottom

### Command Center (default view)
- **Live Startup Score**: 6 metric cards (Execution, Business, Customers, Product, Cash, AI Confidence)
- **Today's Mission**: AI-generated daily mission
- **Business Health**: Overall % + individual category bars
- **Today's Tasks**: Up to 4 pending tasks from the active sprint (current phase of the full plan)
- **AI Recommendation**: Contextual advice
- **Current Stage**: Startup stage tracker (Idea → Validation → MVP → Launch → Revenue → PMF → Scale)

### Other views
- **AI Co-Founder**: Chat with AI agents
- **Task Engine**: Manage tasks and sprints
- **Full Plan**: Complete multi-phase execution plan from start to goal
- **Roadmap**: Timeline view
- **Memory Graph**: Visual knowledge graph
- **Founder DNA**: Personality/strength scores
- **Research**: AI-driven market research
- **Documents**: Generated documents
- **AI Board**: Multi-agent board meeting
- **Build Mode**: AI executes tasks autonomously
- **Simulator**: Test decisions with virtual customers
- **Daily/Weekly Review**: Progress check-ins

---

## Data Flow Summary

```
Landing Page → Auth → Onboarding → Goal → (Blueprint auto-generated) → Dashboard
                                                                          │
                                                          (all features accessible)
```

- **Founder profile** survives logout (re-login → dashboard)
- **Business data** (blueprint, tasks, scores) cleared on logout
- All stores use zustand persist (localStorage)

---

## Documentation Index

| File | Purpose |
|---|---|
| `README.md` | Project overview, quick start, tech stack, configuration |
| `FEATURES.md` | Detailed description of all 18 feature areas |
| `REPORT.md` | Architecture, security, testing, deployment, metrics |
| `WORKFLOW.md` | Step-by-step user flow through the application |
