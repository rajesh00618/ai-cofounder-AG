import React, { useState, useEffect, Suspense } from 'react';
import { useFounderStore } from '../store/founderStore';
import { useAppStore } from '../store/appStore';
const Sidebar = React.lazy(() => import('../components/dashboard/Sidebar'));
const CommandCenter = React.lazy(() => import('../components/dashboard/CommandCenter'));
const AIWorkspace = React.lazy(() => import('../components/dashboard/AIWorkspace'));
const TaskEngine = React.lazy(() => import('../components/tasks/TaskEngine'));
const RoadmapView = React.lazy(() => import('../components/roadmap/RoadmapView'));
const MemoryGraph = React.lazy(() => import('../components/memory/MemoryGraph'));
const FounderTwin = React.lazy(() => import('../components/founder/FounderTwin'));
const ResearchCenter = React.lazy(() => import('../components/research/ResearchCenter'));
const BusinessBlueprint = React.lazy(() => import('../components/business/BusinessBlueprint'));
const DocumentGenerator = React.lazy(() => import('../components/documents/DocumentGenerator'));
const AIBoardMeeting = React.lazy(() => import('../components/ai/AIBoardMeeting'));
const ExecutionMode = React.lazy(() => import('../components/ai/ExecutionMode'));
const DecisionSimulator = React.lazy(() => import('../components/simulators/DecisionSimulator'));
const DailyReview = React.lazy(() => import('../components/review/DailyReview'));
const SettingsPanel = React.lazy(() => import('../components/dashboard/SettingsPanel'));
const AnalyticsDashboard = React.lazy(() => import('../components/dashboard/AnalyticsDashboard'));
const InvestorMode = React.lazy(() => import('../components/ai/InvestorMode'));
const WeeklyReview = React.lazy(() => import('../components/review/WeeklyReview'));
import { useNavigate } from 'react-router-dom';

const VIEWS = {
  home: CommandCenter,
  workspace: AIWorkspace,
  business: BusinessBlueprint,
  tasks: TaskEngine,
  roadmap: RoadmapView,
  memory: MemoryGraph,
  founder: FounderTwin,
  research: ResearchCenter,
  documents: DocumentGenerator,
  board: AIBoardMeeting,
  investor: InvestorMode,
  build: ExecutionMode,
  analytics: AnalyticsDashboard,
  simulator: DecisionSimulator,
  review: DailyReview,
  'weekly-review': WeeklyReview,
  settings: SettingsPanel,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useFounderStore();
  const { sidebarCollapsed } = useAppStore();
  const [activeView, setActiveView] = useState('home');
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const unsub = useFounderStore.persist.onFinishHydration(() => setHydrated(true));
    if (useFounderStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  if (hydrated && !profile) {
    navigate('/onboarding');
    return null;
  }

  if (!hydrated) return null;

  const ActiveComponent = VIEWS[activeView] || CommandCenter;

  return (
    <div style={styles.layout}>
      <Suspense fallback={null}><Sidebar activeView={activeView} onNavigate={setActiveView} /></Suspense>
      <main className="dashboard-main" style={{...styles.main, marginLeft: isMobile ? '56px' : (sidebarCollapsed ? '72px' : '260px')}}>
        <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem',color:'var(--color-text-tertiary)'}}>Loading...</div>}>
          <ActiveComponent onNavigate={setActiveView} />
        </Suspense>
      </main>
    </div>
  );
}

const styles = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--color-bg-primary)' },
  main: { flex:1, transition:'margin-left 0.3s ease', overflow:'auto', padding:'1.5rem 2rem' },
};
