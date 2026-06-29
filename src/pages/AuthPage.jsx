import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlashCard, ThreeDCard } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useFounderStore } from '../store/founderStore';
import { api } from '../utils/api';
import { Mail, Lock, User, ArrowRight, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const setAuth = useAuthStore(s => s.setAuth);
  const logout = useAuthStore(s => s.logout);
  const resetOnboarding = useFounderStore(s => s.resetOnboarding);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-tertiary)', gap: '0.5rem' }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login(email, password)
        : await api.register(name, email, password);
      setAuth(res.user, res.token);
      if (mode === 'register') {
        resetOnboarding();
        ['ai-cofounder-founder-storage', 'ai-cofounder-business-storage', 'ai-cofounder-task-storage', 'ai-cofounder-chat-storage'].forEach(k => localStorage.removeItem(k));
        navigate('/onboarding');
      } else {
        const existingProfile = useFounderStore.getState().profile;
        navigate(existingProfile ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', fontWeight: 800, color: 'white',
            transform: 'rotate(45deg)',
          }}>A</div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>AI Co-Founder</span>
        </div>

        <ThreeDCard intensity={4}>
          <SlashCard variant="accent" clip="both" style={{ textAlign: 'center' }}>
            {token ? (
              <>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: 'white',
                  margin: '0 auto 1rem',
                }}>
                  {user?.name?.[0] || '?'}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>You're signed in</h2>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>{user?.email}</p>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/onboarding')}>
                  <ArrowRight size={18} /> Continue
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.75rem', color: 'var(--text-muted)' }} onClick={() => { logout(); }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                  {mode === 'login' ? 'Sign in to continue building' : 'Start your journey with your AI co-founder'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                  {mode === 'register' && (
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '2.5rem' }} required minLength={8} />
                      <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, padding: '0.25rem 0', textAlign: 'right', width: '100%' }} onClick={() => navigate('/reset-password')}>
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {error && (
                    <div style={{
                      padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius)',
                      color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center',
                    }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Please wait...
                      </span>
                    ) : mode === 'login' ? (
                      <><LogIn size={18} /> Sign In</>
                    ) : (
                      <><User size={18} /> Create Account</>
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'} <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </SlashCard>
        </ThreeDCard>
      </div>
    </div>
  );
}
