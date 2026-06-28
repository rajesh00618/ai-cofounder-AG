import React, { useState, useEffect } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import { getGreeting, getScoreColor, getScoreLabel, calculateOverallScore } from '../../utils/helpers';
import { STARTUP_STAGES } from '../../utils/constants';
import { Sparkles, Target, AlertTriangle, TrendingUp, CheckSquare, Brain, Zap, ArrowRight, BarChart3, Activity, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

function ScoreCard({ label, value, icon: Icon, color }) {
  return (
    <div style={styles.scoreCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={styles.scoreLabel}>{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span style={{ ...styles.scoreValue, color }}>{value}%</span>
        <span style={styles.scoreQuality}>{getScoreLabel(value)}</span>
      </div>
      <div className="progress-bar" style={{ marginTop: '0.5rem', height: '4px' }}>
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function CommandCenter({ onNavigate }) {
  const { profile, dnaScores } = useFounderStore(
    useShallow(s => ({ profile: s.profile, dnaScores: s.dnaScores }))
  );
  const { businessHealth, startupScore, currentStage, blueprint } = useBusinessStore(
    useShallow(s => ({ businessHealth: s.businessHealth, startupScore: s.startupScore, currentStage: s.currentStage, blueprint: s.blueprint }))
  );
  const { tasks } = useTaskStore(
    useShallow(s => ({ tasks: s.tasks }))
  );
  const [mission, setMission] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const todayTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);
  const completedToday = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const overallHealth = calculateOverallScore(businessHealth);

  useEffect(() => {
    setLoading(true);
    const ctx = { businessHealth, startupScore, profile, blueprint, currentStage, dnaScores, tasks };
    Promise.all([
      api.getMission(ctx).then(r => setMission(r.mission)).catch(() => setApiError('Failed to load mission data')),
      api.getHealth(ctx).then(r => setRecommendation(r.recommendation)).catch(() => setApiError('Failed to load health data'))
    ]).finally(() => setLoading(false));
  }, [businessHealth, startupScore, profile, blueprint, tasks, currentStage, dnaScores]);

  return (
    <div style={styles.page} className="page-enter">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h1 style={styles.greeting}>{getGreeting()}, {profile?.name} 👋</h1>
          <p style={styles.subtitle}>Here's your startup's pulse today</p>
        </div>
        <div style={styles.headerRight}>
          <span className="badge badge-accent"><Activity size={10} /> Live</span>
          <span style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Zap size={16} style={{ color: 'var(--color-warning)' }} /> Live Startup Score</h3>
        <div className="dashboard-grid-6" style={styles.scoreGrid}>
          <ScoreCard label="Execution" value={startupScore.execution} icon={TrendingUp} color="var(--color-accent-light)" />
          <ScoreCard label="Business" value={startupScore.business} icon={BarChart3} color="var(--color-info-light)" />
          <ScoreCard label="Customers" value={startupScore.customers} icon={Target} color="var(--color-success-light)" />
          <ScoreCard label="Product" value={startupScore.product} icon={Zap} color="var(--color-warning-light)" />
          <ScoreCard label="Cash" value={startupScore.cash} icon={TrendingUp} color="var(--color-danger-light)" />
          <ScoreCard label="AI Confidence" value={startupScore.aiConfidence} icon={Brain} color="var(--color-accent)" />
        </div>
      </div>

      <div className="dashboard-grid-2" style={styles.twoCol}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}><Target size={16} style={{ color: 'var(--color-accent-light)' }} /> Today's Mission</h3>
          <div style={styles.missionCard}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Crafting your mission...</span>
              </div>
            ) : (
              <p style={styles.missionText}>{mission || 'Waiting for mission...'}</p>
            )}
            <div style={styles.missionMeta}>
              <span className="badge badge-warning">Priority</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>~2 hrs estimated</span>
            </div>
          </div>

          <h4 style={{ ...styles.panelTitle, fontSize: '0.8125rem', marginTop: '1.25rem' }}>
            <CheckSquare size={14} /> Today's Tasks ({completedToday}/{totalTasks})
          </h4>
          {todayTasks.length > 0 && todayTasks.map((task) => (
            <div key={task.id} style={styles.taskItem}>
              <div style={{ ...styles.taskDot, background: task.priority === 'high' ? 'var(--color-danger)' : task.priority === 'medium' ? 'var(--color-warning)' : 'var(--color-text-muted)' }} />
              <div style={{ flex: 1 }}>
                <div style={styles.taskTitle}>{task.title}</div>
                <div style={styles.taskMeta}>
                  <span>{task.estimatedTime}</span> · <span>{task.aiAssistance}</span>
                </div>
              </div>
              <span className={`badge ${task.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{task.priority}</span>
            </div>
          ))}
          {todayTasks.length === 0 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', padding: '1rem 0' }}>No tasks yet. Generate your business blueprint first!</p>
          )}
        </div>

        <div style={styles.rightCol}>
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}><BarChart3 size={16} style={{ color: 'var(--color-success)' }} /> Business Health</h3>
            <div style={styles.healthOverall}>
              <span style={{ ...styles.healthValue, color: getScoreColor(overallHealth) }}>{overallHealth}%</span>
              <span style={styles.healthLabel}>Overall</span>
            </div>
            {Object.entries(businessHealth).map(([key, val]) => (
              <div key={key} style={styles.healthRow}>
                <span style={styles.healthKey}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <div className="progress-bar" style={{ flex: 1, height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${val}%`, background: getScoreColor(val) }} />
                </div>
                <span style={{ ...styles.healthPercent, color: getScoreColor(val) }}>{val}%</span>
              </div>
            ))}
          </div>

          <div style={{ ...styles.panel, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <h3 style={styles.panelTitle}><Sparkles size={16} style={{ color: 'var(--color-accent-light)' }} /> AI Recommendation</h3>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Analyzing your data...</span>
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {recommendation || 'Waiting for AI recommendation...'}
              </p>
            )}
            <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => onNavigate('workspace')}>
              Talk to AI <ArrowRight size={14} />
            </button>
          </div>

          <div style={styles.panel}>
            <h3 style={styles.panelTitle}><TrendingUp size={16} style={{ color: 'var(--color-warning)' }} /> Current Stage</h3>
            <div style={styles.stageRow}>
              {STARTUP_STAGES.map((stage, i) => (
                <div key={stage.id} style={{
                  ...styles.stageItem,
                  ...(stage.id === currentStage ? styles.stageActive : {}),
                  opacity: STARTUP_STAGES.findIndex(s => s.id === currentStage) >= i ? 1 : 0.3
                }}>
                  <span style={styles.stageEmoji}>{stage.icon}</span>
                  <span style={styles.stageLabel}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div style={{padding:'0.5rem 1rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'10px',fontSize:'0.75rem',color:'var(--color-danger)',marginBottom:'1rem'}}>
          {apiError}
        </div>
      )}

      {overallHealth < 50 && (
        <div style={styles.alertCard}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Reality Alert</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Your business health is at {overallHealth}%. Key weak spots: {
                Object.entries(businessHealth)
                  .filter(([_, v]) => v < 30)
                  .map(([k]) => k)
                  .join(', ') || 'multiple areas need attention'
              }. Let's fix them.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1200px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  greeting: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.9375rem', marginTop: '0.25rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  date: { fontSize: '0.8125rem', color: 'var(--color-text-muted)' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' },
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' },
  scoreCard: { padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' },
  scoreLabel: { fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  scoreValue: { fontSize: '1.5rem', fontWeight: 700 },
  scoreQuality: { fontSize: '0.6875rem', color: 'var(--color-text-muted)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
  panel: { padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  missionCard: { padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' },
  missionText: { fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.75rem' },
  missionMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  taskItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  taskDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  taskTitle: { fontSize: '0.875rem', fontWeight: 500 },
  taskMeta: { fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' },
  healthOverall: { textAlign: 'center', marginBottom: '1rem' },
  healthValue: { fontSize: '2.5rem', fontWeight: 800 },
  healthLabel: { display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' },
  healthRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  healthKey: { fontSize: '0.8125rem', color: 'var(--color-text-secondary)', width: '80px', flexShrink: 0 },
  healthPercent: { fontSize: '0.8125rem', fontWeight: 600, width: '35px', textAlign: 'right' },
  stageRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  stageItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', borderRadius: '10px', fontSize: '0.6875rem', transition: 'all 0.2s' },
  stageActive: { background: 'rgba(99,102,241,0.1)' },
  stageEmoji: { fontSize: '1.25rem' },
  stageLabel: { color: 'var(--color-text-tertiary)', fontWeight: 500 },
  alertCard: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '14px' },
};
