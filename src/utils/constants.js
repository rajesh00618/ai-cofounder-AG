/* AI CO-FOUNDER — UTILITY & CONSTANTS */
export const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    question: "What is your primary goal right now?",
    options: ["Find an idea", "Validate an idea", "Build MVP", "Get customers", "Generate revenue", "Scale"]
  },
  {
    id: 2,
    question: "What's your founder experience?",
    options: ["First startup", "Tried before", "Currently running one", "Serial entrepreneur"]
  },
  {
    id: 3,
    question: "Are you building alone?",
    options: ["Solo", "Co-founder", "Small team", "Company"]
  },
  {
    id: 4,
    question: "Weekly time available?",
    options: ["Less than 5 hrs", "1–2 hrs/day", "3–5 hrs/day", "Full-time"]
  },
  {
    id: 5,
    question: "Preferred working style?",
    options: ["Teach me step-by-step", "AI does most of the work", "Mix of both"]
  },
  {
    id: 6,
    question: "Biggest current blocker?",
    options: ["Idea", "Validation", "Customers", "Product", "Marketing", "Sales", "Funding"]
  },
  {
    id: 7,
    question: "Definition of success in 6 months?",
    options: ["MVP", "First customer", "First revenue", "Product-market fit", "Investment"]
  }
];

export const STARTUP_STAGES = [
  { id: 'idea', label: 'Idea', icon: '💡' },
  { id: 'validation', label: 'Validation', icon: '🔍' },
  { id: 'mvp', label: 'MVP', icon: '🛠️' },
  { id: 'launch', label: 'Launch', icon: '🚀' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'pmf', label: 'Product-Market Fit', icon: '🎯' },
  { id: 'scale', label: 'Scale', icon: '📈' }
];

export const AI_AGENTS = [
  { id: 'ceo', name: 'CEO AI', role: 'Business decisions, prioritization', color: '#C49A6C', icon: '👔' },
  { id: 'cto', name: 'CTO AI', role: 'Technical architecture', color: '#3b82f6', icon: '💻' },
  { id: 'cmo', name: 'CMO AI', role: 'Marketing strategy', color: '#ec4899', icon: '📢' },
  { id: 'sales', name: 'Sales AI', role: 'Customer acquisition', color: '#10b981', icon: '🤝' },
  { id: 'finance', name: 'Finance AI', role: 'Budget, pricing, runway', color: '#f59e0b', icon: '📊' },
  { id: 'legal', name: 'Legal AI', role: 'Compliance, contracts', color: '#8b5cf6', icon: '⚖️' },
  { id: 'research', name: 'Research AI', role: 'Deep research', color: '#06b6d4', icon: '🔬' },
  { id: 'designer', name: 'Designer AI', role: 'UX/UI guidance', color: '#f43f5e', icon: '🎨' },
  { id: 'developer', name: 'Developer AI', role: 'Coding/implementation', color: '#22d3ee', icon: '⚙️' },
  { id: 'planner', name: 'Planner AI', role: 'Task breakdown & scheduling', color: '#a855f7', icon: '📋' },
];

export const REALITY_DIMENSIONS = [
  'Timeline Feasibility',
  'Market Size & Demand',
  'Competition Intensity',
  'Founder Experience Match',
  'Available Resources',
  'Customer Validation',
  'Technology Feasibility',
  'Overall Risk'
];

export const BUSINESS_HEALTH_CATEGORIES = [
  { id: 'idea', label: 'Idea', weight: 0.1 },
  { id: 'validation', label: 'Validation', weight: 0.2 },
  { id: 'product', label: 'Product', weight: 0.2 },
  { id: 'marketing', label: 'Marketing', weight: 0.15 },
  { id: 'sales', label: 'Sales', weight: 0.15 },
  { id: 'finance', label: 'Finance', weight: 0.2 }
];

export const DNA_DIMENSIONS = [
  'Decision-making', 'Execution', 'Consistency', 'Learning speed',
  'Leadership', 'Sales ability', 'Technical skill', 'Communication', 'Focus', 'Confidence'
];
