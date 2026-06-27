import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, CheckCircle2, Server, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const API_BASE = 'http://localhost:3001/api';

export default function SettingsPanel() {
  const { apiKey, setApiKey } = useAppStore();
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(data => setServerStatus(data.apiKeyConfigured ? 'configured' : 'no-key'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const handleSave = () => {
    setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const showServerBadge = !apiKey && serverStatus === 'configured';

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Settings size={22} style={{color:'var(--color-accent-light)'}} /> Settings</h2>
      <p style={styles.subtitle}>Configure your AI Co-Founder</p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Key size={16} /> AI API Key</h3>

        {serverStatus === null && (
          <div style={{...styles.badge, background:'rgba(99,102,241,0.05)', borderColor:'rgba(99,102,241,0.1)', color:'var(--color-text-muted)'}}>
            <Loader2 size={14} style={{animation:'spin 1s linear infinite'}} /> Checking server configuration...
          </div>
        )}

        {serverStatus === 'configured' && !apiKey && (
          <div style={{...styles.badge, background:'rgba(16,185,129,0.05)', borderColor:'rgba(16,185,129,0.1)'}}>
            <Server size={14} style={{color:'var(--color-success)'}} />
            <span style={{color:'var(--color-success-light)'}}>Server has an API key configured. AI will work without entering one.</span>
          </div>
        )}

        {serverStatus === 'no-key' && !apiKey && !key && (
          <div style={{...styles.badge, background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.1)'}}>
            <AlertTriangle size={14} style={{color:'var(--color-danger)'}} />
            <span style={{color:'var(--color-danger-light)'}}>No API key configured. Add one below or in the .env file.</span>
          </div>
        )}

        {serverStatus === 'offline' && (
          <div style={{...styles.badge, background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.1)'}}>
            <AlertTriangle size={14} style={{color:'var(--color-danger)'}} />
            <span style={{color:'var(--color-danger-light)'}}>Server is offline. Start it with: node server/index.js</span>
          </div>
        )}

        <div style={styles.inputRow}>
          <input type="password" placeholder="sk-... or nvapi-..." value={key} onChange={e => setKey(e.target.value)} style={styles.input} />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            {saved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
        <p style={styles.hint}>
          Stored locally in your browser. Leave empty to use the server key.
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>About</h3>
        <p style={styles.cardDesc}>
          <strong>AI Co-Founder v1.0</strong> — The world's first Startup Operating System.<br />
          Most AI tools answer questions. This AI builds companies.<br /><br />
          Model: meta/llama-4-maverick-17b-128e-instruct via NVIDIA API
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth:'700px' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.25rem' },
  subtitle: { color:'var(--color-text-tertiary)', fontSize:'0.875rem', marginBottom:'1.5rem' },
  card: { padding:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'1.25rem' },
  cardTitle: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem', fontWeight:600, marginBottom:'0.75rem' },
  cardDesc: { fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.6, marginBottom:'1rem' },
  inputRow: { display:'flex', gap:'0.5rem', marginTop:'1rem' },
  input: { flex:1, padding:'0.625rem 1rem', fontSize:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px' },
  badge: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 0.75rem', border:'1px solid', borderRadius:'8px', fontSize:'0.8125rem' },
  hint: { fontSize:'0.75rem', color:'var(--color-text-muted)', marginTop:'0.5rem' },
};
