import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFounderStore } from '../../store/founderStore';
import { useAppStore } from '../../store/appStore';
import { Home, MessageSquare, Briefcase, CheckSquare, Map, Brain, Search, FileText, Users, DollarSign, Zap, Beaker, Dna, CalendarCheck, Award, ChevronLeft, ChevronRight, LogOut, Menu, Route, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Command Center', icon: Home, title: 'Your startup command center' },
  { id: 'workspace', label: 'AI Co-Founder', icon: MessageSquare, title: 'Chat with your AI CEO' },
  { id: 'business', label: 'Business Blueprint', icon: Briefcase, title: 'Your complete business plan' },
  { id: 'tasks', label: 'Task Engine', icon: CheckSquare, title: 'Manage your tasks and sprints' },
  { id: 'plan', label: 'Full Plan', icon: Route, title: 'Full execution plan overview' },
  { id: 'roadmap', label: 'Roadmap', icon: Map, title: 'Product and business roadmap' },
  { id: 'memory', label: 'Memory Graph', icon: Brain, title: 'Visual map of your startup knowledge' },
  { id: 'founder', label: 'Founder DNA', icon: Dna, title: 'Your founder personality profile' },
  { id: 'research', label: 'Research', icon: Search, title: 'Market research and competitive analysis' },
  { id: 'documents', label: 'Documents', icon: FileText, title: 'Business documents and reports' },
  { id: 'board', label: 'AI Board', icon: Users, title: 'Debate decisions with your executive team' },
  { id: 'investor', label: 'Investor Mode', icon: DollarSign, title: 'Get a VC\'s perspective on your startup' },
  { id: 'build', label: 'Build Mode', icon: Zap, title: 'AI generates code and executes tasks' },
  { id: 'simulator', label: 'Simulator', icon: Beaker, title: 'Test pricing, positioning, and decisions' },
  { id: 'review', label: 'Daily Review', icon: CalendarCheck, title: 'Daily standup and progress review' },
  { id: 'weekly-review', label: 'Weekly Review', icon: Award, title: 'Weekly retrospective and planning' },
  { id: 'settings', label: 'Settings', icon: Settings, title: 'Account settings and API key' },
];

export default function Sidebar({ activeView, onNavigate }) {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebarCollapse } = useAppStore();
  const { profile } = useFounderStore();
  const { logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Note: duplicate resize listener also in DashboardPage.jsx — kept for separation of concerns
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const collapsed = isMobile ? !mobileOpen : sidebarCollapsed;
  const width = collapsed ? '64px' : '240px';

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 50, overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: collapsed ? '1rem 0' : '1rem',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          minHeight: '60px',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 800, color: 'white',
                transform: 'rotate(45deg)',
              }}>A</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>AI Co-Founder</span>
            </div>
          )}
          <button
            onClick={() => { isMobile ? setMobileOpen(!mobileOpen) : toggleSidebarCollapse(); }}
            style={{ color: 'var(--text-muted)', padding: 4, display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isMobile ? <Menu size={16} /> : (collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); if (isMobile) setMobileOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.625rem 0' : '0.625rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent-dark)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title={item.title}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3, height: '60%',
                    background: 'var(--accent)',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem', borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.8125rem', fontWeight: 700, minWidth: 32,
            }}>
              {profile.name?.[0]?.toUpperCase() || 'F'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.experienceLevel}</div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0.75rem 0' : '0.75rem',
            borderTop: '1px solid var(--border)',
            color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} />
        </button>
      </aside>
    </>
  );
}
