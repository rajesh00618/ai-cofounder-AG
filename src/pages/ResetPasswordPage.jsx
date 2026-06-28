import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  let email = '';
  try {
    email = decodeURIComponent(searchParams.get('email') || '');
  } catch {
    email = searchParams.get('email') || '';
  }

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
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(token, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!token || !email) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <AlertTriangle size={32} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Invalid Reset Link</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            This password reset link is invalid or expired.
          </p>
          <Link to="/auth" style={{ color: 'var(--color-accent-light)' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <CheckCircle2 size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Password Reset!</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Lock size={32} style={{ color: 'var(--color-accent-light)', marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Reset Your Password</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Enter a new password for {email}
        </p>

        {error && (
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
            <AlertTriangle size={14} style={{ marginRight: '0.375rem' }} /> {error}
          </div>
        )}

        <input type="password" placeholder="New password (6+ characters)" value={password}
          onChange={e => setPassword(e.target.value)} style={styles.input} />
        <input type="password" placeholder="Confirm new password" value={confirm}
          onChange={e => setConfirm(e.target.value)} style={styles.input} />

        <button className="btn btn-primary btn-lg" onClick={handleReset} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : 'Reset Password'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/auth" style={{ color: 'var(--color-accent-light)', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} style={{ marginRight: '0.25rem' }} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px', textAlign: 'center' },
  input: { width: '100%', padding: '0.75rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--color-text-primary)', marginBottom: '0.75rem', boxSizing: 'border-box' },
};
