import React, { useState, useEffect, useRef } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { useShallow } from 'zustand/react/shallow';
import { getGreeting, getScoreColor, getScoreLabel, calculateOverallScore } from '../../utils/helpers';
import { STARTUP_STAGES } from '../../utils/constants';
import { Sparkles, Target, AlertTriangle, TrendingUp, CheckSquare, Brain, Zap, ArrowRight, BarChart3, Activity, Loader2, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';
import { Card } from '../ui';
import { BentoGrid, BentoItem } from '../ui/BentoGrid';
import RippleButton from '../ui/RippleButton';

const ScoreCard = React.memo(function ScoreCard({ label, value, icon: Icon, color, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        ...styles.scoreCard,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ${delay}ms cubic-bezier(0.4,0,0.2,1)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={styles.scoreLabel}>{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span style={{ ...styles.scoreValue, color }}>{value}%</span>
        <span style={styles.scoreQuality}>{getScoreLabel(value)}</span>
      </div>
      <div className="progress-bar" style={{ marginTop: '0.5rem', height: '4px' }}>
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: color, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
});

export default function CommandCenter({ onNavigate }) {
  const { profile, dnaScores: rawDnaScores } = useFounderStore(
    useShallow(s => ({ profile: s.profile, dnaScores: s.dnaScores }))
  );
  const dnaScores = rawDnaScores || {};
  const { businessHealth, startupScore, currentStage, blueprint } = useBusinessStore(
    useShallow(s => ({ businessHealth: s.businessHealth, startupScore: s.startupScore, currentStage: s.currentStage, blueprint: s.blueprint }))
  );
  const { tasks, getTodaysTasks, sprints, currentSprintId } = useTaskStore(
    useShallow(s => ({ tasks: s.tasks, getTodaysTasks: s.getTodaysTasks, sprints: s.sprints, currentSprintId: s.currentSprintId }))
  );
  const [mission, setMission] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const todayTasks = getTodaysTasks();
  const activeSprint = sprints.find(s => s.id === currentSprintId);
  const completedToday = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const overallHealth = calculateOverallScore(businessHealth);

  const ctxRef = useRef('');
  const reqIdRef = useRef(0);
  useEffect(() => {
    const ctxKey = JSON.stringify({ businessHealth, startupScore, profile, blueprint, currentStage, dnaScores, tasks: tasks?.length });
    if (ctxRef.current === ctxKey) return;
    ctxRef.current = ctxKey;
    const reqId = ++reqIdRef.current;
    setLoading(true);
    const ctx = { businessHealth, startupScore, profile, blueprint, currentStage, dnaScores, tasks };
    Promise.all([
      api.getMission(ctx).then(r => { if (reqIdRef.current === reqId) { setMission(r.mission); setEstimatedTime(r.estimatedTime || ''); } }).catch(() => { if (reqIdRef.current === reqId) setApiError('Failed to load mission data'); }),
      api.getHealth(ctx).then(r => { if (reqIdRef.current === reqId) setRecommendation(r.recommendation); }).catch(() => { if (reqIdRef.current === reqId) setApiError('Failed to load health data'); })
    ]).finally(() => { if (reqIdRef.current === reqId) setLoading(false); });
  }, [businessHealth, startupScore, profile, blueprint, tasks, currentStage, dnaScores]);

  return (
    <div style={styles.page} className="page-enter">
      {/* Header */}
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h1 style={styles.greeting}>{getGreeting()}, {profile?.name}</h1>
          <p style={styles.subtitle}>Here's your startup's pulse today</p>
        </div>
        <div style={styles.headerRight}>
          <span className="badge badge-accent"><Activity size={10} /> Live</span>
          <span style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <BentoGrid columns={4} gap="1rem" style={{ marginBottom: '1.5rem' }}>
        {/* Score Cards - Full Width */}
        <BentoItem full delay={0}>
          <div style={styles.scoreSection}>
            <h3 style={styles.sectionTitle}><Zap size={16} style={{ color: 'var(--warning)' }} /> Live Startup Score</h3>
            <div style={styles.scoreGrid}>
              <ScoreCard label="Execution" value={startupScore.execution} icon={TrendingUp} color="var(--accent)" delay={0} />
              <ScoreCard label="Business" value={startupScore.business} icon={BarChart3} color="var(--accent-light)" delay={80} />
              <ScoreCard label="Customers" value={startupScore.customers} icon={Target} color="var(--success)" delay={160} />
              <ScoreCard label="Product" value={startupScore.product} icon={Zap} color="var(--warning)" delay={240} />
              <ScoreCard label="Cash" value={startupScore.cash} icon={TrendingUp} color="var(--danger)" delay={320} />
              <ScoreCard label="AI Confidence" value={startupScore.aiConfidence} icon={Brain} color="var(--accent-dark)" delay={400} />
            </div>
          </div>
        </BentoItem>

        {/* Mission - Wide */}
        <BentoItem wide delay={0.1}>
          <Card>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}><Target size={16} style={{ color: 'var(--accent)' }} /> Today's Mission</h3>
              <div style={styles.missionCard}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Crafting your mission...</span>
                  </div>
                ) : (
                  <p style={styles.missionText}>{mission || 'Waiting for mission...'}</p>
                )}
                <div style={styles.missionMeta}>
                  <span className="badge badge-warning">Priority</span>
                  {estimatedTime && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{estimatedTime}</span>}
                </div>
              </div>
            </div>
          </Card>
        </BentoItem>

        {/* Business Health - Tall */}
        <BentoItem tall delay={0.15}>
          <Card>
            <div style={{ ...styles.panel, height: '100%' }}>
              <h3 style={styles.panelTitle}><BarChart3 size={16} style={{ color: 'var(--success)' }} /> Business Health</h3>
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
          </Card>
        </BentoItem>

        {/* Tasks */}
        <BentoItem wide delay={0.2}>
          <Card>
            <div style={styles.panel}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={styles.panelTitle}><CheckSquare size={16} /> Today's Tasks ({completedToday}/{totalTasks})</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')} style={{ fontSize: '0.75rem' }}>
                  View All <ChevronRight size={12} />
                </button>
              </div>
              {activeSprint && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{activeSprint.phaseTitle || 'Sprint ' + activeSprint.week}</span>
                  {activeSprint.goal && <span style={{ color: 'var(--text-muted)' }}>· {activeSprint.goal}</span>}
                </div>
              )}
              {todayTasks.length > 0 && todayTasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                  <div style={{ ...styles.taskDot, background: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)' }} />
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
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No tasks yet. Generate your business blueprint first!</p>
              )}
            </div>
          </Card>
        </BentoItem>

        {/* AI Recommendation */}
        <BentoItem wide delay={0.25}>
          <Card>
            <div style={{ ...styles.panel, background: 'var(--accent-subtle)', border: '1px solid var(--border)' }}>
              <h3 style={styles.panelTitle}><Sparkles size={16} style={{ color: 'var(--accent)' }} /> AI Recommendation</h3>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Analyzing your data...</span>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {recommendation || 'Waiting for AI recommendation...'}
                </p>
              )}
              <RippleButton className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => onNavigate('workspace')}>
                Talk to AI <ArrowRight size={14} />
              </RippleButton>
            </div>
          </Card>
        </BentoItem>

        {/* Current Stage */}
        <BentoItem wide delay={0.3}>
          <Card>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}><TrendingUp size={16} style={{ color: 'var(--warning)' }} /> Current Stage</h3>
              <div style={styles.stageRow}>
                {STARTUP_STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    style={{
                      ...styles.stageItem,
                      ...(stage.id === currentStage ? styles.stageActive : {}),
                      opacity: STARTUP_STAGES.findIndex(s => s.id === currentStage) >= STARTUP_STAGES.findIndex(s => s.id === stage.id) ? 1 : 0.3,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span style={styles.stageEmoji}>{stage.icon}</span>
                    <span style={styles.stageLabel}>{stage.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </BentoItem>
      </BentoGrid>

      {apiError && (
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(196,112,112,0.06)', border: '1px solid rgba(196,112,112,0.12)', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--danger)', marginBottom: '1rem' }}>
          {apiError}
        </div>
      )}

      {overallHealth < 50 && (
        <div style={{ ...styles.alertCard, animation: 'fadeInUp 0.5s ease-out' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Reality Alert</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
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
  subtitle: { color: 'var(--text-tertiary)', fontSize: '0.9375rem', marginTop: '0.25rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  date: { fontSize: '0.8125rem', color: 'var(--text-muted)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' },
  scoreSection: { padding: '1.25rem', borderRadius: '16px', height: '100%' },
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' },
  scoreCard: { padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '14px', border: '1px solid var(--border)', transition: 'all 0.3s ease' },
  scoreLabel: { fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  scoreValue: { fontSize: '1.5rem', fontWeight: 700 },
  scoreQuality: { fontSize: '0.6875rem', color: 'var(--text-muted)' },
  panel: { padding: '1.25rem', borderRadius: '16px', height: '100%' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' },
  missionCard: { padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' },
  missionText: { fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.75rem' },
  missionMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  taskItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' },
  taskDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  taskTitle: { fontSize: '0.875rem', fontWeight: 500 },
  taskMeta: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' },
  healthOverall: { textAlign: 'center', marginBottom: '1rem' },
  healthValue: { fontSize: '2.5rem', fontWeight: 800 },
  healthLabel: { display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' },
  healthRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  healthKey: { fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 },
  healthPercent: { fontSize: '0.8125rem', fontWeight: 600, width: '35px', textAlign: 'right' },
  stageRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  stageItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', borderRadius: '10px', fontSize: '0.6875rem', transition: 'all 0.2s' },
  stageActive: { background: 'var(--accent-subtle)', boxShadow: 'inset 0 0 0 1px var(--accent)' },
  stageEmoji: { fontSize: '1.25rem' },
  stageLabel: { color: 'var(--text-tertiary)', fontWeight: 500 },
  alertCard: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.12)', borderRadius: '14px' },
};
