import React, { useState, useEffect, useRef } from 'react';
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
  const [hoveredItem, setHoveredItem] = useState(null);
  const [ripplePos, setRipplePos] = useState(null);
  const navRef = useRef(null);

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

  const handleNavClick = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id,
    });
    setTimeout(() => setRipplePos(null), 600);
    onNavigate(id);
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
      <aside style={{
        ...styles.sidebar,
        width: effectiveCollapsed ? '72px' : '260px',
      }} className={`dashboard-sidebar${!effectiveCollapsed ? ' expanded' : ''}`}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}><Sparkles size={18} /></div>
          {!effectiveCollapsed && <span style={styles.logoText}>AI Co-Founder</span>}
          <button onClick={handleToggle} style={styles.collapseBtn} aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isMobile ? <Menu size={16} /> : (effectiveCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
          </button>
        </div>

        {/* Navigation */}
        <nav ref={navRef} style={styles.nav} role="navigation" aria-label="Main navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: '0.25rem' }}>
              {!effectiveCollapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  style={styles.sectionHeader}
                  aria-expanded={!collapsedSections[section.label]}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    size={12}
                    style={{
                      transform: collapsedSections[section.label] ? 'rotate(-90deg)' : 'rotate(0)',
                      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                </button>
              )}
              <div style={{
                maxHeight: effectiveCollapsed || !collapsedSections[section.label] ? '200px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {section.items.map((item) => {
                  const isActive = activeView === item.id;
                  const isHovered = hoveredItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => handleNavClick(e, item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                        ...(isHovered && !isActive ? styles.navItemHover : {}),
                        justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      title={effectiveCollapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Ripple effect */}
                      {ripplePos && ripplePos.id === item.id && (
                        <span style={{
                          position: 'absolute',
                          left: ripplePos.x - 20,
                          top: ripplePos.y - 20,
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(196,154,108,0.2)',
                          animation: 'ripple 0.6s ease-out',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: '60%',
                          background: 'var(--gradient-primary)',
                          borderRadius: '0 3px 3px 0',
                          animation: 'scaleIn 0.3s ease-out',
                        }} />
                      )}

                      <item.icon size={18} style={{
                        color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        transition: 'color 0.2s',
                      }} />
                      {!effectiveCollapsed && (
                        <span style={{
                          color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'color 0.2s',
                        }}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        {!effectiveCollapsed && profile && (
          <div style={styles.profile}>
            <div style={styles.avatar}>{profile.name?.[0]?.toUpperCase() || 'F'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={styles.profileName}>{profile.name}</div>
              <div style={styles.profileRole}>{profile.experienceLevel}</div>
            </div>
          </div>
        )}

        {/* Sign Out */}
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
            borderTop: '1px solid rgba(255,248,235,0.06)',
            paddingTop: '0.75rem',
            marginTop: '0.25rem',
            color: 'var(--color-danger)',
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
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    background: 'rgba(15,13,10,0.95)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255,248,235,0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 50,
    overflow: 'hidden',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem 1rem',
    borderBottom: '1px solid rgba(255,248,235,0.06)',
    minHeight: '64px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: '8px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 2px 8px rgba(196,154,108,0.3)',
  },
  logoText: { fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' },
  collapseBtn: {
    marginLeft: 'auto',
    padding: '0.25rem',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    display: 'flex',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  nav: {
    flex: 1,
    padding: '0.75rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'auto',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    marginTop: '0.5rem',
    borderRadius: '6px',
    transition: 'color 0.2s',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '10px',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(196,154,108,0.1)',
    color: 'var(--color-accent-light)',
    boxShadow: 'inset 0 0 0 1px rgba(196,154,108,0.15)',
  },
  navItemHover: {
    background: 'rgba(255,248,235,0.03)',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderTop: '1px solid rgba(255,248,235,0.06)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: '8px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  profileName: { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileRole: { fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
};
