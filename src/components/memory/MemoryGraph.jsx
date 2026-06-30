import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { Brain, Clock, Plus, Link2 } from 'lucide-react';
import { api } from '../../utils/api';

const NODE_COLORS = {
  idea: '#6366f1', task: '#f59e0b', customer: '#10b981',
  document: '#3b82f6', milestone: '#a855f7', revenue: '#ec4899',
  goal: '#8b5cf6', project: '#06b6d4'
};

const EDGE_TYPES = ['related_to', 'depends_on', 'part_of', 'influences', 'blocks', 'enables', 'contradicts'];

const GRAPH_SIZE_WARNING = 80;

const forceLayout = (nodes, edges, width, height) => {
  const positions = nodes.map(() => ({
    x: width * 0.15 + Math.random() * width * 0.7,
    y: height * 0.15 + Math.random() * height * 0.7,
    vx: 0, vy: 0,
  }));

  const REPULSION = 5000;
  const ATTRACTION = 0.005;
  const DAMPING = 0.85;
  const MAX_ITERATIONS = nodes.length > 100 ? 25 : 50;
  const MIN_ENERGY = 5;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let totalEnergy = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = positions[j].x - positions[i].x;
        let dy = positions[j].y - positions[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = REPULSION / (dist * dist);
        positions[i].vx -= (force * dx) / dist;
        positions[i].vy -= (force * dy) / dist;
        positions[j].vx += (force * dx) / dist;
        positions[j].vy += (force * dy) / dist;
      }
    }

    for (const [fromIdx, toIdx] of edges) {
      let dx = positions[toIdx].x - positions[fromIdx].x;
      let dy = positions[toIdx].y - positions[fromIdx].y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = ATTRACTION * dist;
      positions[fromIdx].vx += (force * dx) / dist;
      positions[fromIdx].vy += (force * dy) / dist;
      positions[toIdx].vx -= (force * dx) / dist;
      positions[toIdx].vy -= (force * dy) / dist;
    }

    for (const p of positions) {
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.max(40, Math.min(width - 40, p.x));
      p.y = Math.max(40, Math.min(height - 40, p.y));
      totalEnergy += Math.abs(p.vx) + Math.abs(p.vy);
    }

    if (totalEnergy < MIN_ENERGY) break;
  }

  return positions;
};

const relationshipLabel = (rel) => {
  const labels = {
    related_to: 'related to', depends_on: 'depends on', part_of: 'part of',
    influences: 'influences', blocks: 'blocks', enables: 'enables', contradicts: 'contradicts',
  };
  return labels[rel] || rel;
};

export default function MemoryGraph() {
  const { profile } = useFounderStore();
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [memError, setMemError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState({ type: 'idea', label: '', metadata: '' });
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [newEdge, setNewEdge] = useState({ sourceId: '', targetId: '', relationship: 'related_to' });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_LIMIT = 100;
  const svgRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(700);
  const mountedRef = useRef(true);
  const reqIdRef = useRef(0);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    const resize = () => {
      if (svgRef.current?.parentElement) {
        setSvgWidth(Math.min(svgRef.current.parentElement.clientWidth - 48, 700));
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!showAddModal && !showEdgeModal) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEdgeModal(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAddModal, showEdgeModal]);

  const loadGraph = useCallback(async (loadOffset = 0, append = false) => {
    const reqId = ++reqIdRef.current;
    setMemError('');
    try {
      if (profile?.id) {
        const data = await api.getMemoryGraph(profile.id, PAGE_LIMIT, loadOffset);
        if (!mountedRef.current || reqId !== reqIdRef.current) return;
        if (data && data.nodes) {
          setGraph(prev => append ? {
            nodes: [...prev.nodes, ...data.nodes],
            edges: [...prev.edges, ...data.edges],
          } : data);
          setHasMore(data.nodes.length >= PAGE_LIMIT);
          setOffset(loadOffset);
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setMemError('Could not load memory graph: ' + err.message);
    }
    if (mountedRef.current) setLoading(false);
  }, [profile]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  const loadMore = useCallback(() => {
    loadGraph(offset + PAGE_LIMIT, true);
  }, [loadGraph, offset]);

  const handleAddNode = async () => {
    if (!newNode.label.trim() || !profile?.id) return;
    setMemError('');
    try {
      await api.addMemoryNode(profile.id, newNode.type, newNode.label, newNode.metadata ? { description: newNode.metadata } : {});
      if (!mountedRef.current) return;
      setNewNode({ type: 'idea', label: '', metadata: '' });
      setShowAddModal(false);
      await loadGraph();
    } catch (err) {
      if (mountedRef.current) setMemError(err.message);
    }
  };

  const handleAddEdge = async () => {
    if (!newEdge.sourceId || !newEdge.targetId) return;
    setMemError('');
    try {
      await api.addMemoryEdge(newEdge.sourceId, newEdge.targetId, newEdge.relationship);
      if (!mountedRef.current) return;
      setNewEdge({ sourceId: '', targetId: '', relationship: 'related_to' });
      setShowEdgeModal(false);
      await loadGraph();
    } catch (err) {
      if (mountedRef.current) setMemError(err.message);
    }
  };

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const edgePairs = edges
    .map(e => [nodes.findIndex(n => n.id === e.source_node_id), nodes.findIndex(n => n.id === e.target_node_id)])
    .filter(([a, b]) => a !== -1 && b !== -1);

  const SVG_W = svgWidth, SVG_H = Math.max(350, Math.min(500, svgWidth * 0.7));
  const positions = useMemo(() => nodes.length > 0 ? forceLayout(nodes, edgePairs, SVG_W, SVG_H) : [], [nodes, edgePairs, SVG_W, SVG_H]);
  const usedPairs = edgePairs
    .map((pair, i) => ({ pair, edge: edges[i] }))
    .filter(({ pair: [a, b] }) => positions[a] && positions[b]);

  return (
    <div style={styles.page} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={styles.title}><Brain size={22} style={{ color: 'var(--color-accent-light)' }} /> Memory Graph</h2>
          <p style={styles.subtitle}>Everything your AI remembers, connected</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={14} /> Add Node
          </button>
          <button className="btn btn-secondary" onClick={() => setShowEdgeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Link2 size={14} /> Add Edge
          </button>
        </div>
      </div>

      {memError && (
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
          {memError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <div style={{ width: '100%', height: '420px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
        </div>
      ) : (
        <>
          {nodes.length > GRAPH_SIZE_WARNING && (
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', fontSize: '0.75rem', color: '#f59e0b', marginBottom: '1rem' }}>
              Large graph detected ({nodes.length} nodes). Rendering may be slower. Consider filtering by type.
            </div>
          )}
          <div style={styles.graphCard}>
            <svg ref={svgRef} width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
              {usedPairs.map(({ pair: [fromIdx, toIdx], edge }) => {
                const a = positions[fromIdx], b = positions[toIdx];
                const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
                const edgeKey = `${edge?.source_node_id || fromIdx}-${edge?.target_node_id || toIdx}`;
                return (
                  <g key={`ed-${edgeKey}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                    <text x={midX} y={midY - 8} fill="rgba(255,255,255,0.25)" fontSize="7" textAnchor="middle">
                      {relationshipLabel(edge?.relationship)}
                    </text>
                  </g>
                );
              })}
              {nodes.map((node, i) => {
                const pos = positions[i];
                if (!pos) return null;
                const color = NODE_COLORS[node.type] || '#6366f1';
                return (
                  <g key={node.id} style={{ cursor: 'pointer' }}>
                    <circle cx={pos.x} cy={pos.y} r="28" fill={color} opacity="0.1" />
                    <circle cx={pos.x} cy={pos.y} r="20" fill={color} opacity="0.2" />
                    <circle cx={pos.x} cy={pos.y} r="10" fill={color} />
                    <text x={pos.x} y={pos.y + 30} fill="var(--color-text-secondary)" fontSize="10" textAnchor="middle" fontWeight="500">{node.label}</text>
                    <text x={pos.x} y={pos.y + 42} fill="var(--color-text-muted)" fontSize="8" textAnchor="middle">
                      {node.created_at ? new Date(node.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </text>
                  </g>
                );
              })}
              {profile && (
                <>
                  <circle cx={SVG_W / 2} cy={30} r="20" fill="url(#grad)" opacity="0.8" />
                  <text x={SVG_W / 2} y={34} fill="white" fontSize="10" textAnchor="middle" fontWeight="700">{profile.name?.[0] || 'F'}</text>
                </>
              )}
              <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
            </svg>
          </div>

          <div style={styles.legend}>
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} style={styles.legendItem}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            ))}
          </div>

          <h3 style={{ ...styles.title, fontSize: '1.125rem', marginTop: '2rem', marginBottom: '1rem' }}>
            <Clock size={16} /> Timeline View
          </h3>
          <div style={styles.timeline}>
            {nodes.map(node => {
              const color = NODE_COLORS[node.type] || '#6366f1';
              return (
                <div key={node.id} style={styles.timelineItem}>
                  <div style={{ ...styles.timelineDot, background: color }} />
                  <div style={styles.timelineDate}>
                    {node.created_at ? new Date(node.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </div>
                  <div style={styles.timelineLabel}>{node.label}</div>
                  <span className="badge" style={{ background: `${color}20`, color, fontSize: '0.5rem' }}>{node.type}</span>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button className="btn btn-secondary" onClick={loadMore} style={{ marginTop: '1rem', width: '100%' }}>
              Load More Nodes
            </button>
          )}
        </>
      )}

      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Add Memory Node</h3>
            <select value={newNode.type} onChange={e => setNewNode(p => ({ ...p, type: e.target.value }))} style={styles.input}>
              {Object.keys(NODE_COLORS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input type="text" placeholder="Label" value={newNode.label} onChange={e => setNewNode(p => ({ ...p, label: e.target.value }))} style={styles.input} />
            <input type="text" placeholder="Description (optional)" value={newNode.metadata} onChange={e => setNewNode(p => ({ ...p, metadata: e.target.value }))} style={styles.input} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddNode}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showEdgeModal && (
        <div style={styles.overlay} onClick={() => setShowEdgeModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Add Edge Connection</h3>
            <select value={newEdge.sourceId} onChange={e => setNewEdge(p => ({ ...p, sourceId: e.target.value }))} style={styles.input}>
              <option value="">Select source node...</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.type})</option>)}
            </select>
            <select value={newEdge.targetId} onChange={e => setNewEdge(p => ({ ...p, targetId: e.target.value }))} style={styles.input}>
              <option value="">Select target node...</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.type})</option>)}
            </select>
            <select value={newEdge.relationship} onChange={e => setNewEdge(p => ({ ...p, relationship: e.target.value }))} style={styles.input}>
              {EDGE_TYPES.map(t => <option key={t} value={t}>{relationshipLabel(t)}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowEdgeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEdge}>Add Edge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '0' },
  graphCard: { background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', marginBottom: '1rem' },
  legend: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  timelineItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' },
  timelineDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  timelineDate: { fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '50px', flexShrink: 0 },
  timelineLabel: { flex: 1, fontSize: '0.875rem', fontWeight: 500 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: 'var(--color-bg-secondary)', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '440px', border: '1px solid rgba(255,255,255,0.08)' },
  input: { width: '100%', padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.875rem', marginBottom: '0.5rem' },
};
