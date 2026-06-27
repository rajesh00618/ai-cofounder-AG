import React, { useEffect, useState } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { Brain, Clock } from 'lucide-react';
import { api } from '../../utils/api';

const NODE_COLORS = {
  idea: '#6366f1', task: '#f59e0b', customer: '#10b981',
  document: '#3b82f6', milestone: '#a855f7', revenue: '#ec4899',
  goal: '#8b5cf6', project: '#06b6d4'
};

const DEFAULT_NODES = [
  { id: 1, type: 'idea', label: 'Idea', date: new Date(Date.now() - 86400000 * 60).toLocaleDateString('en-US',{month:'short',day:'numeric'}) },
  { id: 2, type: 'task', label: 'Validation', date: new Date(Date.now() - 86400000 * 45).toLocaleDateString('en-US',{month:'short',day:'numeric'}) },
  { id: 3, type: 'milestone', label: 'MVP', date: new Date(Date.now() - 86400000 * 30).toLocaleDateString('en-US',{month:'short',day:'numeric'}) },
  { id: 4, type: 'goal', label: 'Launch', date: new Date(Date.now() - 86400000 * 15).toLocaleDateString('en-US',{month:'short',day:'numeric'}) },
  { id: 5, type: 'revenue', label: 'Growth', date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US',{month:'short',day:'numeric'}) },
];

const DEFAULT_EDGES = [[1,2],[2,3],[3,4],[4,5]];

const NODE_POSITIONS = [
  { x: 200, y: 80 }, { x: 120, y: 180 }, { x: 300, y: 180 },
  { x: 80, y: 290 }, { x: 220, y: 290 }, { x: 350, y: 290 }, { x: 200, y: 390 },
];

export default function MemoryGraph() {
  const { profile } = useFounderStore();
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [loading, setLoading] = useState(true);
  const [memError, setMemError] = useState('');

  useEffect(() => {
    const loadMemory = async () => {
      try {
        if (profile?.id) {
          const timeline = await api.getMemoryTimeline(profile.id);
          if (timeline && timeline.length > 0) {
            const mapped = timeline.map((item, i) => ({
              id: i + 1,
              type: item.type,
              label: item.label,
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));
            if (mapped.length > 0) setNodes(mapped);
          }
        }
      } catch {
        setMemError('Could not load memory timeline, showing defaults');
      }
      setLoading(false);
    };
    loadMemory();
  }, [profile]);

  const edges = DEFAULT_EDGES;
  const positions = NODE_POSITIONS;

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Brain size={22} style={{color:'var(--color-accent-light)'}} /> Memory Graph</h2>
      <p style={styles.subtitle}>Everything your AI remembers, connected</p>

      {memError && (
        <div style={{padding:'0.5rem 1rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'10px',fontSize:'0.75rem',color:'var(--color-danger)',marginBottom:'1rem'}}>
          {memError}
        </div>
      )}

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem',color:'var(--color-text-muted)'}}>
          <div style={styles.skeleton} />
        </div>
      ) : (
        <>
          <div style={styles.graphCard}>
            <svg width="100%" height="420" viewBox="0 0 440 420" style={{display:'block'}}>
              {edges.map(([from, to], i) => {
                const a = nodes[from - 1] || positions[from - 1];
                const b = nodes[to - 1] || positions[to - 1];
                const ax = a.x !== undefined ? a.x : positions[from - 1]?.x;
                const ay = a.y !== undefined ? a.y : positions[from - 1]?.y;
                const bx = b.x !== undefined ? b.x : positions[to - 1]?.x;
                const by = b.y !== undefined ? b.y : positions[to - 1]?.y;
                return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />;
              })}
              {nodes.map((node, i) => {
                const pos = positions[i] || { x: 200 + i * 30, y: 200 + i * 20 };
                const color = NODE_COLORS[node.type] || '#6366f1';
                return (
                  <g key={node.id}>
                    <circle cx={pos.x} cy={pos.y} r="24" fill={color} opacity="0.15" />
                    <circle cx={pos.x} cy={pos.y} r="16" fill={color} opacity="0.3" />
                    <circle cx={pos.x} cy={pos.y} r="8" fill={color} />
                    <text x={pos.x} y={pos.y + 35} fill="var(--color-text-secondary)" fontSize="10" textAnchor="middle" fontWeight="500">{node.label}</text>
                    <text x={pos.x} y={pos.y + 48} fill="var(--color-text-muted)" fontSize="8" textAnchor="middle">{node.date}</text>
                  </g>
                );
              })}
              <circle cx="200" cy="30" r="20" fill="url(#grad)" opacity="0.8" />
              <text x="200" y="34" fill="white" fontSize="10" textAnchor="middle" fontWeight="700">{profile?.name?.[0] || 'F'}</text>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
            </svg>
          </div>

          <div style={styles.legend}>
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} style={styles.legendItem}>
                <div style={{width:10,height:10,borderRadius:'50%',background:color}} />
                <span>{type.charAt(0).toUpperCase()+type.slice(1)}</span>
              </div>
            ))}
          </div>

          <h3 style={{...styles.title, fontSize:'1.125rem', marginTop:'2rem', marginBottom:'1rem'}}>
            <Clock size={16} /> Timeline View
          </h3>
          <div style={styles.timeline}>
            {nodes.map(node => {
              const color = NODE_COLORS[node.type] || '#6366f1';
              return (
                <div key={node.id} style={styles.timelineItem}>
                  <div style={{...styles.timelineDot, background: color}} />
                  <div style={styles.timelineDate}>{node.date}</div>
                  <div style={styles.timelineLabel}>{node.label}</div>
                  <span className="badge" style={{background:`${color}20`,color,fontSize:'0.5rem'}}>{node.type}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth:'900px' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.25rem' },
  subtitle: { color:'var(--color-text-tertiary)', fontSize:'0.875rem', marginBottom:'1.5rem' },
  graphCard: { background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)', padding:'1.5rem', marginBottom:'1rem' },
  legend: { display:'flex', gap:'1.25rem', flexWrap:'wrap' },
  legendItem: { display:'flex', alignItems:'center', gap:'0.375rem', fontSize:'0.75rem', color:'var(--color-text-tertiary)' },
  timeline: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  timelineItem: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 1rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.04)' },
  timelineDot: { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  timelineDate: { fontSize:'0.75rem', color:'var(--color-text-muted)', width:'50px', flexShrink:0 },
  timelineLabel: { flex:1, fontSize:'0.875rem', fontWeight:500 },
  skeleton: { width:'100%', height:'420px', background:'rgba(255,255,255,0.03)', borderRadius:'16px' },
};
