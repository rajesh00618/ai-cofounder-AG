import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useFounderStore } from '../../store/founderStore';
import { useAuthStore } from '../../store/authStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { useChatStore } from '../../store/chatStore';
import { Home, MessageSquare, Briefcase, CheckSquare, Map, Brain, Search, FileText, Users, Beaker, CalendarCheck, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Dna, Zap, Menu, LogOut, DollarSign, Award } from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { id: 'home', label: 'Command Center', icon: Home },
      { id: 'workspace', label: 'AI Co-Founder', icon: MessageSquare },
      { id: 'business', label: 'Business', icon: Briefcase },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'roadmap', label: 'Roadmap', icon: Map },
      { id: 'research', label: 'Research', icon: Search },
      { id: 'documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { id: 'board', label: 'AI Board', icon: Users },
      { id: 'investor', label: 'Investor Mode', icon: DollarSign },
      { id: 'build', label: 'Build Mode', icon: Zap },
      { id: 'simulator', label: 'Simulator', icon: Beaker },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'founder', label: 'Founder DNA', icon: Dna },
      { id: 'memory', label: 'Memory Graph', icon: Brain },
      { id: 'review', label: 'Daily Review', icon: CalendarCheck },
      { id: 'weekly-review', label: 'Weekly Review', icon: Award },
    ],
  },
];

export default function Sidebar({ activeView, onNavigate }) {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebarCollapse } = useAppStore();
  const { profile } = useFounderStore();
  const { logout } = useAuthStore();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const effectiveCollapsed = isMobile ? !mobileExpanded : sidebarCollapsed;

  const handleToggle = () => {
    if (isMobile) {
      setMobileExpanded(!mobileExpanded);
    } else {
      toggleSidebarCollapse();
    }
  };

  const toggleSection = (label) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
    {isMobile && mobileExpanded && (
      <div
        className="sidebar-backdrop"
        onClick={() => setMobileExpanded(false)}
        aria-hidden="true"
      />
    )}
    <aside style={{...styles.sidebar, width: effectiveCollapsed ? '72px' : '260px'}} className={`dashboard-sidebar${!effectiveCollapsed ? ' expanded' : ''}`}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}><Sparkles size={18} /></div>
        {!effectiveCollapsed && <span style={styles.logoText}>AI Co-Founder</span>}
        <button onClick={handleToggle} style={styles.collapseBtn} aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isMobile ? <Menu size={16} /> : (effectiveCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
        </button>
      </div>

      <nav style={styles.nav} role="navigation" aria-label="Main navigation">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {!effectiveCollapsed && (
              <button
                onClick={() => toggleSection(section.label)}
                style={styles.sectionHeader}
                aria-expanded={!collapsedSections[section.label]}
              >
                <span>{section.label}</span>
                <ChevronDown size={12} style={{ transform: collapsedSections[section.label] ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
            )}
            {(!effectiveCollapsed ? !collapsedSections[section.label] : true) && section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  ...styles.navItem,
                  ...(activeView === item.id ? styles.navItemActive : {}),
                  justifyContent: effectiveCollapsed ? 'center' : 'flex-start'
                }}
                title={effectiveCollapsed ? item.label : undefined}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <item.icon size={18} />
                {!effectiveCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {!effectiveCollapsed && profile && (
        <div style={styles.profile}>
          <div style={styles.avatar}>{profile.name?.[0]?.toUpperCase() || 'F'}</div>
          <div>
            <div style={styles.profileName}>{profile.name}</div>
            <div style={styles.profileRole}>{profile.experienceLevel}</div>
          </div>
        </div>
      )}

      <button
        aria-label="Sign out"
        onClick={() => {
        logout();
        useBusinessStore.setState({ blueprint: null, businessHealth: { idea: 0, validation: 0, product: 0, marketing: 0, sales: 0, finance: 0 }, startupScore: { execution: 0, business: 0, customers: 0, product: 0, cash: 0, aiConfidence: 50 }, currentStage: 'idea', businessAnswers: {}, documents: [] });
        useTaskStore.setState({ tasks: [], sprints: [], currentSprintId: null });
        useChatStore.setState({ messages: [], isThinking: false, thinkingStep: '', confidence: null, activeAgent: 'ceo', boardMeetingActive: false, debateActive: false, investorModeActive: false, customerSimActive: false });
        useFounderStore.setState({ profile: null, onboardingComplete: false, goal: '', clarificationAnswers: {}, realityScore: null, negotiationResult: null, founderTwin: null, dnaScores: null });
        navigate('/');
      }}
        style={{
          ...styles.navItem,
          justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
          color: 'var(--color-danger)'
        }}
        title={effectiveCollapsed ? 'Sign Out' : undefined}
      >
        <LogOut size={18} />
        {!effectiveCollapsed && <span>Sign Out</span>}
      </button>
    </aside>
    </>
  );
}

const styles = {
  sidebar: { position:'fixed', top:0, left:0, bottom:0, background:'rgba(10,11,26,0.95)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', transition:'width 0.3s ease', zIndex:50, overflow:'hidden' },
  logoSection: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', minHeight:'64px' },
  logoIcon: { width:'32px', height:'32px', minWidth:'32px', borderRadius:'8px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' },
  logoText: { fontSize:'0.9375rem', fontWeight:700, color:'var(--color-text-primary)', whiteSpace:'nowrap' },
  collapseBtn: { marginLeft:'auto', padding:'0.25rem', color:'var(--color-text-muted)', cursor:'pointer', background:'none', border:'none', display:'flex' },
  nav: { flex:1, padding:'0.75rem 0.5rem', display:'flex', flexDirection:'column', gap:'2px', overflow:'auto' },
  sectionHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0.75rem', fontSize:'0.6875rem', fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', marginTop:'0.5rem' },
  navItem: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem', borderRadius:'10px', color:'var(--color-text-secondary)', fontSize:'0.8125rem', fontWeight:500, transition:'all 0.2s', border:'none', cursor:'pointer', background:'transparent', width:'100%', textAlign:'left' },
  navItemActive: { background:'rgba(99,102,241,0.1)', color:'var(--color-accent-light)' },
  profile: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem', borderTop:'1px solid rgba(255,255,255,0.06)' },
  avatar: { width:'32px', height:'32px', borderRadius:'8px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.8125rem', fontWeight:700, flexShrink:0 },
  profileName: { fontSize:'0.8125rem', fontWeight:600, color:'var(--color-text-primary)' },
  profileRole: { fontSize:'0.6875rem', color:'var(--color-text-tertiary)' },
};
