import React, { useState } from 'react';
import { useFounderStore } from '../store/founderStore';
import { useAppStore } from '../store/appStore';
import Sidebar from '../components/dashboard/Sidebar';
import CommandCenter from '../components/dashboard/CommandCenter';
import AIWorkspace from '../components/dashboard/AIWorkspace';
import TaskEngine from '../components/tasks/TaskEngine';
import RoadmapView from '../components/roadmap/RoadmapView';
import MemoryGraph from '../components/memory/MemoryGraph';
import FounderTwin from '../components/founder/FounderTwin';
import ResearchCenter from '../components/research/ResearchCenter';
import BusinessBlueprint from '../components/business/BusinessBlueprint';
import DocumentGenerator from '../components/documents/DocumentGenerator';
import AIBoardMeeting from '../components/ai/AIBoardMeeting';
import ExecutionMode from '../components/ai/ExecutionMode';
import DecisionSimulator from '../components/simulators/DecisionSimulator';
import DailyReview from '../components/review/DailyReview';
import SettingsPanel from '../components/dashboard/SettingsPanel';
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
  build: ExecutionMode,
  simulator: DecisionSimulator,
  review: DailyReview,
  settings: SettingsPanel,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useFounderStore();
  const { sidebarCollapsed } = useAppStore();
  const [activeView, setActiveView] = useState('home');

  if (!profile) {
    navigate('/onboarding');
    return null;
  }

  const ActiveComponent = VIEWS[activeView] || CommandCenter;

  return (
    <div style={styles.layout}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main style={{...styles.main, marginLeft: sidebarCollapsed ? '72px' : '260px'}}>
        <ActiveComponent onNavigate={setActiveView} />
      </main>
    </div>
  );
}

const styles = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--color-bg-primary)' },
  main: { flex:1, transition:'margin-left 0.3s ease', overflow:'auto', padding:'1.5rem 2rem' },
};
