import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, CheckCircle2, Server, AlertTriangle, Loader2, MessageCircle, Lock, Mail, Send } from 'lucide-react';
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
  const [keyError, setKeyError] = useState('');

  const [chatId, setChatId] = useState(() => { try { return localStorage.getItem('ai-cofounder-telegram') || ''; } catch { return ''; } });
  const [chatIdSaved, setChatIdSaved] = useState(false);
  const [chatIdError, setChatIdError] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState('');

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
    setKeyError('');
    if (!user) { setKeyError('Please sign in to save your API key on the server.'); return; }
    if (!key || !key.trim()) return;
    try {
      await api.setApiKey(key.trim());
      setApiKey(key.trim());
      setServerKeyStatus(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setKeyError('Failed to save API key. Please check your key and try again.');
    }
  };

  const handleSaveChatId = async () => {
    setChatIdError('');
    if (!user) { setChatIdError('Please sign in to register for Telegram reminders.'); return; }
    if (!chatId || !chatId.trim()) { setChatIdError('Enter your Telegram chat ID.'); return; }
    try {
      await api.registerReminderPhone(user.email, chatId.trim());
      localStorage.setItem('ai-cofounder-telegram', chatId.trim());
      setChatIdSaved(true);
      setTimeout(() => setChatIdSaved(false), 2000);
    } catch (err) {
      setChatIdError('Failed to register Telegram chat ID. Check server logs.');
    }
  };

  const handleTestReminder = async () => {
    setTestResult('');
    if (!chatId || !chatId.trim()) { setChatIdError('Enter your Telegram chat ID first.'); return; }
    setTestSending(true);
    try {
      await api.testReminder(chatId.trim());
      setTestResult('Test message sent! Check your Telegram.');
    } catch (err) {
      setTestResult('Failed to send test: ' + err.message);
    }
    setTestSending(false);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) return;
    setResetError('');
    try {
      await api.forgotPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetError('Something went wrong. Please check your email and try again.');
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
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Settings size={22} style={{ color: 'var(--color-accent-light)' }} /> Settings</h2>
      <p style={styles.subtitle}>Configure your AI Co-Founder</p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Key size={16} /> AI API Key</h3>
        {serverStatus === null && (
          <div style={{ ...styles.badge, background: 'var(--accent-subtle)', borderColor: 'var(--border)', color: 'var(--color-text-muted)' }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Checking server configuration...
          </div>
        )}
        {serverStatus === 'configured' && !apiKey && (
          <div style={{ ...styles.badge, background: 'rgba(125,184,125,0.08)', borderColor: 'rgba(125,184,125,0.15)' }}>
            <Server size={14} style={{ color: 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-success-light)' }}>Server has an API key configured. AI will work without entering one.</span>
          </div>
        )}
        {serverStatus === 'no-key' && serverKeyStatus && !key && (
          <div style={{ ...styles.badge, background: 'rgba(125,184,125,0.08)', borderColor: 'rgba(125,184,125,0.15)' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-success-light)' }}>API key stored securely on the server.</span>
          </div>
        )}
        {serverStatus === 'no-key' && !serverKeyStatus && !apiKey && !key && (
          <div style={{ ...styles.badge, background: 'rgba(196,112,112,0.08)', borderColor: 'rgba(196,112,112,0.15)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />
            <span style={{ color: 'var(--color-danger-light)' }}>No API key configured. Add one below or in the .env file.</span>
          </div>
        )}
        {serverStatus === 'offline' && (
          <div style={{ ...styles.badge, background: 'rgba(196,112,112,0.08)', borderColor: 'rgba(196,112,112,0.15)' }}>
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
        {keyError && <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{keyError}</p>}
        <p style={styles.hint}>Stored securely on the server (never in localStorage). <strong style={{color:'var(--color-success)'}}>Security note:</strong> After signing in, your API key is encrypted in memory on the server.</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><MessageCircle size={16} /> Telegram Reminders</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Get daily reminders at 9 AM (what to do) and 6 PM (did you complete it?).<br />
          Enter your Telegram chat ID. <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{color:'var(--color-accent)'}}>Find your chat ID</a>.
        </p>
        <div style={styles.inputRow}>
          <input type="text" placeholder="123456789" value={chatId} onChange={e => setChatId(e.target.value)} style={styles.input} />
          <button className="btn btn-primary btn-sm" onClick={handleSaveChatId}>
            {chatIdSaved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
        {chatIdError && <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{chatIdError}</p>}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleTestReminder} disabled={testSending || !chatId.trim()}>
            {testSending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {' '}Send Test
          </button>
        </div>
        {testResult && <p style={{ fontSize: '0.75rem', color: testResult.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '0.25rem' }}>{testResult}</p>}
        <p style={styles.hint}>Chat ID saved to your account. Click "Send Test" to verify it works immediately.</p>
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

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
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
          <strong>Web Search:</strong> Tavily (primary), DuckDuckGo + Startpage (fallback)<br />
          <strong>Monitoring:</strong> Structured file logging<br />
          <strong>Reminders:</strong> Telegram at 9 AM / 6 PM<br />
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
  card: { padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1.25rem' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' },
  inputRow: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  input: { flex: 1, padding: '0.625rem 1rem', fontSize: '0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--color-text-primary)' },
  badge: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', border: '1px solid', borderRadius: '8px', fontSize: '0.8125rem' },
  hint: { fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' },
};
