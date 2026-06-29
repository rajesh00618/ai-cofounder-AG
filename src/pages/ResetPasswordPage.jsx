import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { Lock, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  let email = '';
  try { email = decodeURIComponent(searchParams.get('email') || ''); }
  catch { email = searchParams.get('email') || ''; }

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => navigate('/auth'), 3000);
    return () => clearTimeout(id);
  }, [success, navigate]);

  const handleReset = async () => {
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try { await api.resetPassword(token, email, password); setSuccess(true); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };

  if (!token || !email) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Card style={{ textAlign: 'center' }}>
            <AlertTriangle size={32} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Invalid Reset Link</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>This password reset link is invalid or expired.</p>
            <Link to="/auth" style={{ color: 'var(--accent-dark)' }}>Go to Login</Link>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Card style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Redirecting to login...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Card style={{ textAlign: 'center' }}>
          <Lock size={32} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Reset Your Password</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Enter a new password for {email}</p>

          {error && (
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius)', fontSize: '0.8125rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <input type="password" placeholder="New password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: '0.75rem', textAlign: 'center' }} />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ marginBottom: '1rem', textAlign: 'center' }} />

          <button className="btn btn-primary btn-lg" onClick={handleReset} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : 'Reset Password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/auth" style={{ color: 'var(--accent-dark)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
