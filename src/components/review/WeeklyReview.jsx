import React, { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { api } from '../../utils/api';
import { CalendarCheck, Loader2, AlertCircle, CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, Target, BookOpen, Award, Lightbulb, Sparkles, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'ai-cofounder-weekly-review';

function HealthTrend({ trend }) {
  const config = {
    improving: { icon: TrendingUp, color: 'var(--color-success)', label: 'Improving' },
    stable: { icon: Minus, color: 'var(--color-warning)', label: 'Stable' },
    declining: { icon: TrendingDown, color: 'var(--color-danger)', label: 'Declining' }
  };
  const { icon: Icon, color, label } = config[trend] || config.stable;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon size={18} style={{ color }} />
      <span style={{ color, fontWeight: 600, fontSize: '0.9375rem' }}>{label}</span>
    </div>
  );
}

function GradeBadge({ grade }) {
  const config = {
    A: { color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)' },
    B: { color: 'var(--color-accent-light)', bg: 'rgba(99,102,241,0.1)' },
    C: { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' },
    D: { color: 'var(--color-danger-light)', bg: 'rgba(249,115,22,0.1)' },
    F: { color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)' }
  };
  const { color, bg } = config[grade] || config.C;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '48px', height: '48px', borderRadius: '50%',
      background: bg, color, fontSize: '1.5rem', fontWeight: 800,
      border: `2px solid ${color}`
    }}>{grade}</span>
  );
}

function ExecutionBar({ value }) {
  const color = value >= 70 ? 'var(--color-success)' : value >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="progress-bar" style={{ flex: 1, height: '8px', borderRadius: '4px' }}>
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color, minWidth: '40px', textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function FocusAreaCard({ area, status, recommendation }) {
  const statusConfig = {
    'on track': { icon: CheckCircle2, color: 'var(--color-success)' },
    'needs attention': { icon: AlertCircle, color: 'var(--color-warning)' },
    'critical': { icon: XCircle, color: 'var(--color-danger)' }
  };
  const { icon: Icon, color } = statusConfig[status] || statusConfig['needs attention'];
  return (
    <div style={{
      padding: '0.875rem 1rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
        <Icon size={14} style={{ color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{area}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color, fontWeight: 500, textTransform: 'capitalize' }}>{status}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{recommendation}</p>
    </div>
  );
}

export default function WeeklyReview() {
  const { profile, dnaScores } = useFounderStore(
    useShallow(s => ({ profile: s.profile, dnaScores: s.dnaScores || {} }))
  );
  const { businessHealth, startupScore } = useBusinessStore(
    useShallow(s => ({ businessHealth: s.businessHealth, startupScore: s.startupScore }))
  );
  const { tasks } = useTaskStore(
    useShallow(s => ({ tasks: s.tasks }))
  );

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setReview(data.review);
        setHasGenerated(data.hasGenerated || false);
      }
    } catch {}
  }, []);

  const persist = (extra = {}) => {
    const data = { review, hasGenerated, ...extra };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.generateWeeklyReview({
        profile, tasks, dnaScores, businessHealth, startupScore
      });
      setReview(data);
      setHasGenerated(true);
      persist({ review: data, hasGenerated: true });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!hasGenerated && !loading && !review) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}>
        <CalendarCheck size={22} style={{ color: 'var(--color-accent-light)' }} />
        Weekly CEO / Board Review
      </h2>
      <p style={styles.subtitle}>AI-powered weekly performance analysis with board-level insights</p>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading && !review && (
        <div style={styles.loadingCard}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent-light)' }} />
          <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-tertiary)' }}>Analyzing your week...</span>
        </div>
      )}

      {review && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}><BookOpen size={16} style={{ color: 'var(--color-accent-light)' }} /> Week Summary</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{review.weekSummary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={styles.sectionCard}>
              <h3 style={{ ...styles.sectionTitle, color: 'var(--color-success)' }}>
                <CheckCircle2 size={16} /> Achievements
              </h3>
              <ul style={styles.list}>
                {review.achievements?.map((item) => (
                  <li key={`ach-${item.slice(0,20)}`} style={styles.listItem}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={{ ...styles.sectionTitle, color: 'var(--color-danger)' }}>
                <XCircle size={16} /> Missed Goals
              </h3>
              <ul style={styles.list}>
                {review.missedGoals?.map((item) => (
                  <li key={`miss-${item.slice(0,20)}`} style={styles.listItem}>
                    <XCircle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}><TrendingUp size={16} style={{ color: 'var(--color-success)' }} /> Business Health Trend</h3>
              <HealthTrend trend={review.businessHealthTrend} />
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}><Target size={16} style={{ color: 'var(--color-accent-light)' }} /> Execution Score</h3>
              <ExecutionBar value={review.executionScore} />
            </div>
          </div>

          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}><Target size={16} style={{ color: 'var(--color-warning)' }} /> Focus Areas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {review.focusAreas?.map((area) => (
                <FocusAreaCard key={`fa-${area.area}`} area={area.area} status={area.status} recommendation={area.recommendation} />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}><ChevronRight size={16} style={{ color: 'var(--color-accent-light)' }} /> Next Week Plan</h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{review.nextWeekPlan}</p>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}><Award size={16} style={{ color: 'var(--color-warning)' }} /> Grade</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <GradeBadge grade={review.grade} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>Weekly Performance Rating</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '1.25rem',
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '14px'
          }}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: '0.75rem' }}>
              <Lightbulb size={16} style={{ color: 'var(--color-accent-light)' }} /> Coaching Note
            </h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              {review.coachingNote}
            </p>
          </div>
        </div>
      )}

      {review && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Regenerating...</>
            ) : (
              <><Sparkles size={16} /> Refresh Review</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' },
  loadingCard: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem 2rem', flexDirection: 'column' },
  sectionCard: { padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' },
  listItem: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 },
};
