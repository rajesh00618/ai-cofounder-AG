import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useFounderStore } from '../store/founderStore';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';

const CommandCenter = lazy(() => import('../components/dashboard/CommandCenter'));
const AIWorkspace = lazy(() => import('../components/dashboard/AIWorkspace'));
const TaskEngine = lazy(() => import('../components/tasks/TaskEngine'));
const FullPlanView = lazy(() => import('../components/tasks/FullPlanView'));
const RoadmapView = lazy(() => import('../components/roadmap/RoadmapView'));
const MemoryGraph = lazy(() => import('../components/memory/MemoryGraph'));
const FounderTwin = lazy(() => import('../components/founder/FounderTwin'));
const ResearchCenter = lazy(() => import('../components/research/ResearchCenter'));
const BusinessBlueprint = lazy(() => import('../components/business/BusinessBlueprint'));
const DocumentGenerator = lazy(() => import('../components/documents/DocumentGenerator'));
const AIBoardMeeting = lazy(() => import('../components/ai/AIBoardMeeting'));
const ExecutionMode = lazy(() => import('../components/ai/ExecutionMode'));
const DecisionSimulator = lazy(() => import('../components/simulators/DecisionSimulator'));
const DailyReview = lazy(() => import('../components/review/DailyReview'));
const SettingsPanel = lazy(() => import('../components/dashboard/SettingsPanel'));
const InvestorMode = lazy(() => import('../components/ai/InvestorMode'));
const WeeklyReview = lazy(() => import('../components/review/WeeklyReview'));

const VIEWS = {
  home: CommandCenter, workspace: AIWorkspace, business: BusinessBlueprint,
  tasks: TaskEngine, plan: FullPlanView, roadmap: RoadmapView, memory: MemoryGraph,
  founder: FounderTwin, research: ResearchCenter, documents: DocumentGenerator,
  board: AIBoardMeeting, investor: InvestorMode, build: ExecutionMode,
  simulator: DecisionSimulator, review: DailyReview, 'weekly-review': WeeklyReview,
  settings: SettingsPanel,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useFounderStore();
  const { sidebarCollapsed } = useAppStore();
  const [activeView, setActiveView] = useState('home');
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [transition, setTransition] = useState('');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const unsub = useFounderStore.persist.onFinishHydration(() => setHydrated(true));
    if (useFounderStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (hydrated && !profile) navigate('/onboarding');
  }, [hydrated, profile, navigate]);

  const handleNavigate = (view) => {
    setTransition('exiting');
    setTimeout(() => {
      setActiveView(view);
      setTransition('entering');
      setTimeout(() => setTransition(''), 400);
    }, 200);
  };

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ width: sidebarCollapsed ? '64px' : '240px' }} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 200, height: 8, background: 'rgba(255,255,255,0.04)',
            borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '40%',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
              borderRadius: 4, animation: 'shimmer 1.5s ease-in-out infinite',
              backgroundSize: '200% 100%',
            }} />
          </div>
        </main>
      </div>
    );
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? '64px' : '240px');
  const ActiveComponent = VIEWS[activeView] || CommandCenter;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      <main
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
          opacity: transition === 'exiting' ? 0 : 1,
          transform: transition === 'exiting' ? 'translateY(8px)' : 'none',
          overflow: 'auto',
          minHeight: '100vh',
        }}
      >
        <Suspense fallback={
          <div style={{ padding: '2rem' }}>
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 120, borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          </div>
        }>
          <div className="page-enter" style={{ padding: '1.5rem 2rem' }}>
            <ActiveComponent onNavigate={handleNavigate} />
          </div>
        </Suspense>
      </main>
    </div>
  );
}
