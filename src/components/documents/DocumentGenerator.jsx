import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { FileText, Download, Sparkles, CheckCircle2, Loader2, AlertCircle, X, Eye } from 'lucide-react';
import { api } from '../../utils/api';

const DOC_TYPES = [
  { id: 'business-plan', label: 'Business Plan', icon: '\uD83D\uDCCB', desc: 'Complete business plan document' },
  { id: 'prd', label: 'Product Requirements (PRD)', icon: '\uD83D\uDCC4', desc: 'Detailed product specification' },
  { id: 'pitch-deck', label: 'Pitch Deck', icon: '\uD83C\uDFAF', desc: 'Investor-ready pitch presentation' },
  { id: 'landing-copy', label: 'Landing Page Copy', icon: '\uD83C\uDF10', desc: 'Conversion-optimized web copy' },
  { id: 'investor-deck', label: 'Investor Deck', icon: '\uD83D\uDCB0', desc: 'Detailed investor presentation' },
  { id: 'marketing-plan', label: 'Marketing Plan', icon: '\uD83D\uDCE2', desc: 'Go-to-market strategy document' },
  { id: 'financial-plan', label: 'Financial Plan', icon: '\uD83D\uDCCA', desc: 'Revenue projections & forecasts' },
  { id: 'tech-docs', label: 'Technical Docs', icon: '\u2699\uFE0F', desc: 'Architecture & tech specifications' },
];

export default function DocumentGenerator() {
  const { blueprint } = useBusinessStore();
  const [generating, setGenerating] = useState(null);
  const [generated, setGenerated] = useState(new Set());
  const [docContent, setDocContent] = useState({});
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const handleGenerate = async (docId) => {
    setError('');
    setGenerating(docId);
    try {
      const result = await api.generateDocument(docId, { blueprint: blueprint || null });
      setDocContent(prev => ({ ...prev, [docId]: result.content }));
      setGenerated(prev => new Set([...prev, docId]));
    } catch (e) {
      setError(e.message);
    }
    setGenerating(null);
  };

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><FileText size={22} style={{ color: 'var(--color-accent-light)' }} /> Document Generator</h2>
      <p style={styles.subtitle}>One-click generation of any startup document</p>

      {notification && <div style={styles.notifBanner}><CheckCircle2 size={14} /> {notification}</div>}
      {error && <div style={styles.errorBanner}><AlertCircle size={14} /> {error}</div>}

      {!blueprint && (
        <div style={styles.warningBanner}>
          <Sparkles size={14} /> Generate your business blueprint first for best results
        </div>
      )}

      <div style={styles.grid}>
        {DOC_TYPES.map(doc => (
          <div key={doc.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={{ fontSize: '2rem' }}>{doc.icon}</span>
              <div>
                <div style={styles.cardLabel}>{doc.label}</div>
                <div style={styles.cardDesc}>{doc.desc}</div>
              </div>
            </div>
            <div style={styles.cardActions}>
              {generated.has(doc.id) ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success btn-sm" onClick={() => { setNotification('Document generated — scroll to view'); setTimeout(() => setNotification(''), 3000); }}><CheckCircle2 size={14} /> Generated</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const blob = new Blob([docContent[doc.id]], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `${doc.id}.md`; a.click();
                    }}><Download size={14} /></button>
                  </div>
                  {docContent[doc.id] && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setPreviewDoc(docContent[doc.id])} style={{fontSize:'0.75rem'}}>
                      <Eye size={12} /> View
                    </button>
                  )}
                </div>
              ) : generating === doc.id ? (
                <button className="btn btn-secondary btn-sm" disabled>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => handleGenerate(doc.id)}>
                  <Sparkles size={14} /> Generate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {previewDoc && (
        <div style={styles.overlay} onClick={() => setPreviewDoc(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h3 style={{fontSize:'1.125rem',fontWeight:600}}>Document Preview</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreviewDoc(null)}><X size={16} /></button>
            </div>
            <pre style={{padding:'1rem',background:'rgba(0,0,0,0.3)',borderRadius:'10px',fontSize:'0.8125rem',maxHeight:'65vh',overflow:'auto',whiteSpace:'pre-wrap',lineHeight:1.6,color:'var(--color-text-secondary)'}}>
              {previewDoc}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '0.75rem' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '0.75rem' },
  notifBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-success)', marginBottom: '0.75rem' },
  warningBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-warning)', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
  card: { padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardTop: { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
  cardLabel: { fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' },
  cardDesc: { fontSize: '0.75rem', color: 'var(--color-text-muted)' },
  cardActions: {},
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'var(--color-bg-secondary)', borderRadius:'16px', padding:'1.5rem', width:'90%', maxWidth:'700px', maxHeight:'80vh', border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', display:'flex', flexDirection:'column' },
};
