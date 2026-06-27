import React, { useState, useEffect } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { DNA_DIMENSIONS } from '../../utils/constants';
import { Dna, Brain, Zap, Loader2 } from 'lucide-react';
import { getScoreColor } from '../../utils/helpers';
import { api } from '../../utils/api';

export default function FounderTwin() {
  const { dnaScores, founderTwin } = useFounderStore();
  const dims = DNA_DIMENSIONS;
  const avgScore = Math.round(Object.values(dnaScores).reduce((a, b) => a + b, 0) / dims.length);
  const [adaptations, setAdaptations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.adaptDNA(dnaScores, founderTwin)
      .then(res => setAdaptations(res.adaptations || []))
      .catch((err) => { console.error('[FounderTwin] Failed to load adaptations:', err); setAdaptations([]); })
      .finally(() => setLoading(false));
  }, [dnaScores, founderTwin]);

  const size = 260, cx = size / 2, cy = size / 2, r = 90;
  const getPoint = (i, val) => { const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2; const dist = (val / 100) * r; return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }; };
  const points = dims.map((_, i) => getPoint(i, dnaScores[dims[i]]));
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Dna size={22} style={{ color: 'var(--color-accent-light)' }} /> Founder DNA</h2>
      <p style={styles.subtitle}>Your behavioral model — how the AI adapts to you</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>DNA Scores</h3>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: getScoreColor(avgScore) }}>{avgScore}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'block' }}>Average Score</span>
          </div>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
            {[20, 40, 60, 80, 100].map(v => { const pts = dims.map((_, i) => getPoint(i, v)); return <polygon key={v} points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" />; })}
            {dims.map((_, i) => { const end = getPoint(i, 100); return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.04)" />; })}
            <polygon points={polygon} fill="rgba(99,102,241,0.15)" stroke="var(--color-accent)" strokeWidth="2" />
            {dims.map((d, i) => { const lp = getPoint(i, 125); return <text key={i} x={lp.x} y={lp.y} fill="var(--color-text-tertiary)" fontSize="8" textAnchor="middle" dominantBaseline="middle">{d.split(' ')[0]}</text>; })}
          </svg>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Dimension Breakdown</h3>
          {dims.map(d => (
            <div key={d} style={styles.scoreRow}>
              <span style={styles.scoreLabel}>{d}</span>
              <div className="progress-bar" style={{ flex: 1, height: '4px' }}>
                <div className="progress-bar-fill" style={{ width: `${dnaScores[d]}%`, background: getScoreColor(dnaScores[d]) }} />
              </div>
              <span style={{ ...styles.scoreVal, color: getScoreColor(dnaScores[d]) }}>{dnaScores[d]}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.twinCard}>
        <h3 style={styles.cardTitle}><Brain size={16} style={{ color: 'var(--color-accent-light)' }} /> Founder Twin Model</h3>
        <div style={styles.twinGrid}>
          {[{ label: 'Think Style', value: founderTwin.thinkStyle, icon: '\uD83E\uDDE0' },
          { label: 'Decision Style', value: founderTwin.decideStyle, icon: '\u26A1' },
          { label: 'Learn Style', value: founderTwin.learnStyle, icon: '\uD83D\uDCDA' },
          { label: 'Work Pattern', value: founderTwin.workPattern, icon: '\u23F0' },
          { label: 'Failure Pattern', value: founderTwin.failurePattern, icon: '\u26A0\uFE0F' },
          { label: 'Recovery', value: founderTwin.recoveryPattern, icon: '\uD83D\uDD04' }
          ].map(item => (
            <div key={item.label} style={styles.twinItem}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.adaptCard}>
        <h3 style={styles.cardTitle}><Zap size={16} style={{ color: 'var(--color-warning)' }} /> AI Adaptations</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>How the AI adjusts based on your patterns</p>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Analyzing your patterns...</span>
          </div>
        ) : adaptations.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>No specific adaptations needed right now.</p>
        ) : (
          adaptations.map((a, i) => (
            <div key={i} style={styles.adaptRow}>
              <span className="badge badge-warning" style={{ fontSize: '0.5rem', minWidth: '60px', justifyContent: 'center' }}>{a.weakness}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>→ {a.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '1000px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' },
  card: { padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' },
  scoreRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' },
  scoreLabel: { fontSize: '0.8125rem', color: 'var(--color-text-secondary)', width: '110px', flexShrink: 0 },
  scoreVal: { fontSize: '0.8125rem', fontWeight: 600, width: '35px', textAlign: 'right' },
  twinCard: { padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' },
  twinGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  twinItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' },
  adaptCard: { padding: '1.5rem', background: 'rgba(245,158,11,0.03)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.1)' },
  adaptRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' },
};
