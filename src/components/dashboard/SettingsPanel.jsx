import React, { useState, useEffect, useRef } from 'react';
import { Settings, Key, Save, CheckCircle2, Server, AlertTriangle, Loader2, Smartphone, Lock, Mail, Send } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { api, API_BASE } from '../../utils/api';

export default function SettingsPanel() {
  const { apiKey, setApiKey } = useAppStore();
  const { user } = useAuthStore();
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [serverKeyStatus, setServerKeyStatus] = useState(null);

  const [phone, setPhone] = useState(() => { try { return localStorage.getItem('ai-cofounder-whatsapp') || ''; } catch { return ''; } });
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (!controller.signal.aborted) setServerStatus(data.apiKeyConfigured ? 'configured' : 'no-key'); })
      .catch(() => { if (!controller.signal.aborted) setServerStatus('offline'); });

    if (user) {
      api.getApiKeyStatus()
        .then(data => { if (!controller.signal.aborted) setServerKeyStatus(data.hasApiKey); })
        .catch(() => { if (!controller.signal.aborted) setServerKeyStatus(false); });
    }
    return () => controller.abort();
  }, [user]);

  const handleSaveKey = async () => {
    if (!user) {
      alert('Please sign in to save your API key on the server.');
      return;
    }
    if (!key || !key.trim()) return;
    try {
      await api.setApiKey(key.trim());
      setApiKey(key.trim());
      setServerKeyStatus(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save API key: ' + err.message);
    }
  };

  const handleSavePhone = () => {
    localStorage.setItem('ai-cofounder-whatsapp', phone);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2000);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) return;
    setResetError('');
    try {
      await api.forgotPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    try {
      let token = null;
      try { token = localStorage.getItem('ai-cofounder-reset-token'); } catch {}
      if (user?.email && token) {
        await api.resetPassword(token, user.email, newPassword);
        setPasswordChanged(true);
      } else {
        setPasswordError('Password reset is available via forgot password flow.');
      }
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Settings size={22} style={{ color: 'var(--color-accent-light)' }} /> Settings</h2>
      <p style={styles.subtitle}>Configure your AI Co-Founder</p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Key size={16} /> AI API Key</h3>
        {serverStatus === null && (
          <div style={{ ...styles.badge, background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.1)', color: 'var(--color-text-muted)' }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Checking server configuration...
          </div>
        )}
        {serverStatus === 'configured' && !apiKey && (
          <div style={{ ...styles.badge, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)' }}>
            <Server size={14} style={{ color: 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-success-light)' }}>Server has an API key configured. AI will work without entering one.</span>
          </div>
        )}
        {serverStatus === 'no-key' && serverKeyStatus && !key && (
          <div style={{ ...styles.badge, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-success-light)' }}>API key stored securely on the server.</span>
          </div>
        )}
        {serverStatus === 'no-key' && !serverKeyStatus && !apiKey && !key && (
          <div style={{ ...styles.badge, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />
            <span style={{ color: 'var(--color-danger-light)' }}>No API key configured. Add one below or in the .env file.</span>
          </div>
        )}
        {serverStatus === 'offline' && (
          <div style={{ ...styles.badge, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />
            <span style={{ color: 'var(--color-danger-light)' }}>Server is offline. Start it with: node server/index.js</span>
          </div>
        )}
        <div style={styles.inputRow}>
          <input type="password" placeholder="sk-... or nvapi-..." value={key} onChange={e => setKey(e.target.value)} style={styles.input} />
          <button className="btn btn-primary btn-sm" onClick={handleSaveKey}>
            {saved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
        <p style={styles.hint}>Stored securely on the server (never in localStorage). <strong style={{color:'var(--color-success)'}}>Security note:</strong> After signing in, your API key is encrypted in memory on the server.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Smartphone size={16} /> WhatsApp Reminders</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Get daily reminders at 9 AM (what to do) and 6 PM (did you complete it?).<br />
          Enter your phone number with country code (e.g., +1234567890).
        </p>
        <div style={styles.inputRow}>
          <input type="tel" placeholder="+1234567890" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />
          <button className="btn btn-primary btn-sm" onClick={handleSavePhone}>
            {phoneSaved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
        <p style={styles.hint}>Phone stored locally. Server needs TWILIO_ACCOUNT_SID configured to send.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Lock size={16} /> Password & Security</h3>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Forgot your password? Enter your email to receive a reset link:</p>
          <div style={styles.inputRow}>
            <input type="email" placeholder="Your account email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} style={styles.input} />
            <button className="btn btn-secondary btn-sm" onClick={handleForgotPassword}>
              {resetSent ? <><CheckCircle2 size={14} /> Sent</> : <><Mail size={14} /> Send Reset</>}
            </button>
          </div>
          {resetError && <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{resetError}</p>}
          {resetSent && <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>Reset link sent (check server console in dev mode).</p>}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Change your password (requires reset token from forgot password):</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="password" placeholder="New password (8+ chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={styles.input} />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={styles.input} />
            <button className="btn btn-primary btn-sm" onClick={handleChangePassword}>
              <Send size={14} /> Change Password
            </button>
          </div>
          {passwordError && <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{passwordError}</p>}
          {passwordChanged && <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>Password changed successfully.</p>}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>About</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <strong>AI Co-Founder v2.1</strong> — The world's first Startup Operating System.<br />
          <strong>AI Models:</strong> llama-4-maverick-17b, mistral-large, phi-4 (multi-model fallback)<br />
          <strong>Web Search:</strong> DuckDuckGo + Startpage (real-time)<br />
          <strong>Monitoring:</strong> Structured file logging<br />
          <strong>Reminders:</strong> WhatsApp (Twilio) at 9 AM / 6 PM<br />
          <strong>Streaming:</strong> SSE-based token streaming
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '700px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' },
  card: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' },
  inputRow: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  input: { flex: 1, padding: '0.625rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--color-text-primary)' },
  badge: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', border: '1px solid', borderRadius: '8px', fontSize: '0.8125rem' },
  hint: { fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' },
};
