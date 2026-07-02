import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { STARTUP_STAGES } from '../../utils/constants';
import { Map, CheckCircle2, Clock, Circle, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

export default function RoadmapView() {
  const { currentStage, blueprint, businessHealth } = useBusinessStore();
  const currentIdx = STARTUP_STAGES.findIndex(s => s.id === currentStage);
  const [guidance, setGuidance] = useState('');
  const [loading, setLoading] = useState(false);
  const [rmError, setRmError] = useState('');

  useEffect(() => {
    if (currentStage && blueprint) {
      setLoading(true);
      api.getRoadmapGuidance(currentStage, { blueprint, businessHealth })
        .then(res => setGuidance(res.guidance))
        .catch(() => setRmError('Failed to load AI guidance'))
        .finally(() => setLoading(false));
    }
  }, [currentStage, blueprint, businessHealth]);

  const stage = STARTUP_STAGES[currentIdx];

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Map size={22} style={{ color: 'var(--color-accent-light)' }} /> Startup Roadmap</h2>
      <p style={styles.subtitle}>Your journey from idea to scale</p>

      {rmError && (
        <div style={{padding:'0.5rem 1rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'10px',fontSize:'0.75rem',color:'var(--color-danger)',marginBottom:'1rem'}}>
          {rmError}
        </div>
      )}

      {/* AI Guidance */}
      {loading && (
        <div style={styles.guidanceCard}>
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Getting AI guidance...</span>
        </div>
      )}
      {guidance && !loading && (
        <div style={styles.guidanceCard}>
          <Sparkles size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Stage: {stage?.label || currentStage}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {guidance}
            </div>
          </div>
        </div>
      )}

      <div style={styles.roadmap}>
        {STARTUP_STAGES.map((stage, i) => {
          const status = i < currentIdx ? 'complete' : i === currentIdx ? 'current' : 'upcoming';
          return (
            <div key={stage.id} style={styles.stageWrap}>
              <div style={styles.stageRow}>
                <div style={{ ...styles.connector, background: i < currentIdx ? 'var(--color-success)' : i === currentIdx ? 'var(--gradient-primary)' : 'var(--border)', opacity: i === 0 ? 0 : 1 }} />
                <div style={{
                  ...styles.stageCircle,
                  background: status === 'complete' ? 'var(--color-success)' : status === 'current' ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                  boxShadow: status === 'current' ? '0 0 20px rgba(196,154,108,0.3)' : 'none'
                }}>
                  {status === 'complete' ? <CheckCircle2 size={18} /> : status === 'current' ? <Circle size={18} /> : <div style={{width:18,height:18,borderRadius:'50%',border:'2px solid var(--border)'}} />}
                </div>
              </div>
              <div style={styles.stageInfo}>
                <span style={styles.stageEmoji}>{stage.icon}</span>
                <span style={styles.stageName}>{stage.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '800px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' },
  guidanceCard: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', background: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: '14px', marginBottom: '2rem', alignItems: 'flex-start' },
  roadmap: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  stageWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stageRow: { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' },
  connector: { height: '3px', flex: 1, maxWidth: '200px', borderRadius: '2px' },
  stageCircle: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, transition: 'all 0.3s' },
  stageInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.25rem' },
  stageEmoji: { fontSize: '1.25rem' },
  stageName: { fontSize: '0.9375rem' },
};
