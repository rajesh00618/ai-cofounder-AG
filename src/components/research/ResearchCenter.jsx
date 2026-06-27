import React, { useState, useEffect } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { Search, Globe, Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

export default function ResearchCenter() {
  const { profile } = useFounderStore();
  const { blueprint, currentStage, businessHealth } = useBusinessStore();
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('research');
  const [researchData, setResearchData] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const ctx = { blueprint, profile, stage: currentStage, businessHealth };
      try {
        const [research, opps, brief] = await Promise.allSettled([
          api.getResearch(ctx, filter),
          api.getOpportunities(ctx),
          api.getMorningBriefing(ctx),
        ]);
        if (research.status === 'fulfilled') setResearchData(research.value);
        if (opps.status === 'fulfilled') setOpportunities(opps.value);
        if (brief.status === 'fulfilled') setBriefing(brief.value);
        const errs = [research, opps, brief].filter(r => r.status === 'rejected').map(r => r.reason.message).join('; ');
        if (errs) setError(errs);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    loadData();
  }, [filter]);

  const typeColor = { competitor: 'var(--color-warning)', market: 'var(--color-info)', opportunity: 'var(--color-success)', trend: 'var(--color-accent)' };
  const filtered = filter === 'all' ? researchData : (researchData.filter ? researchData.filter(r => r.type === filter || r.category === filter) : []);

  if (loading) return (
    <div style={styles.page} className="page-enter">
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
        <p style={{ color: 'var(--color-text-tertiary)', marginTop: '1rem' }}>Gathering market intelligence...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Search size={22} style={{ color: 'var(--color-accent-light)' }} /> Research Center</h2>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {briefing && (
        <div style={styles.sleepBanner}>
          <Sparkles size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{briefing.greeting}</div>
            {briefing.findings?.length > 0 && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {briefing.findings.map((f, i) => typeof f === 'string' ? f : f.title || f.detail).join('. ')}
              </div>
            )}
          </div>
        </div>
      )}

      {!blueprint && (
        <div style={styles.emptyBanner}>
          <Sparkles size={14} /> Generate your business blueprint first for personalized research
        </div>
      )}

      <div style={styles.tabs}>
        <button onClick={() => setTab('research')} style={{ ...styles.tab, ...(tab === 'research' ? styles.tabActive : {}) }}>
          <Globe size={14} /> Research
        </button>
        <button onClick={() => setTab('radar')} style={{ ...styles.tab, ...(tab === 'radar' ? styles.tabActive : {}) }}>
          <Lightbulb size={14} /> Opportunity Radar
        </button>
      </div>

      {tab === 'research' && (
        <>
          <div style={styles.filters}>
            {['all', 'competitor', 'market', 'opportunity', 'trend'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={styles.list}>
            {(!Array.isArray(filtered) || filtered.length === 0) && (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No research items yet. Generate your business blueprint first.</p>
            )}
            {Array.isArray(filtered) && filtered.map((item, _i) => (
              <div key={item.id || i} style={styles.researchCard}>
                <div style={{ ...styles.typeDot, background: typeColor[item.type || item.category] || 'var(--color-text-muted)' }} />
                <div style={{ flex: 1 }}>
                  <div style={styles.itemTitle}>{item.title}</div>
                  <div style={styles.itemMeta}>
                    <span>{item.source}</span> · <span>{item.date}</span>
                  </div>
                </div>
                {item.priority && <span className={`badge ${item.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{item.priority}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'radar' && (
        <div style={styles.list}>
          {(!Array.isArray(opportunities) || opportunities.length === 0) && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No opportunities found. Generate your business blueprint first.</p>
          )}
          {Array.isArray(opportunities) && opportunities.map((opp, _i) => (
            <div key={i} style={styles.oppCard}>
              <div style={{ flex: 1 }}>
                <div style={styles.itemTitle}>{opp.title}</div>
                <div style={styles.itemMeta}>
                  {opp.type && <span className="badge badge-accent" style={{ fontSize: '0.5rem' }}>{opp.type}</span>}
                  {opp.deadline && <span>Deadline: {opp.deadline}</span>}
                </div>
              </div>
              {opp.match !== undefined && <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>{opp.match}%</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Match</div>
              </div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' },
  errorBanner: { padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' },
  emptyBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-warning)', marginBottom: '1rem' },
  sleepBanner: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '14px', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  tab: { display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer' },
  tabActive: { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: 'var(--color-accent-light)' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: { padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' },
  filterActive: { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: 'var(--color-accent-light)' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  researchCard: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
  typeDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  itemTitle: { fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.25rem' },
  itemMeta: { display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', alignItems: 'center' },
  oppCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
};
