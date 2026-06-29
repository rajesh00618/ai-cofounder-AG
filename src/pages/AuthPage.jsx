import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, LogIn, LogOut, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useFounderStore } from '../store/founderStore';
import ThreeDCard from '../components/ui/ThreeDCard';
import RippleButton from '../components/ui/RippleButton';

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
  const [focusedField, setFocusedField] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)', gap: '0.5rem', fontSize: '0.9375rem' }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsAnimating(true);
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
      setIsAnimating(false);
    }
  };

  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setMode(m => m === 'login' ? 'register' : 'login');
      setError('');
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div style={styles.page}>

      <div style={styles.container}>
        <ThreeDCard intensity={5} style={{ width: '100%' }}>
          <div ref={cardRef} className="auth-card" style={{
            ...styles.card,
            opacity: isAnimating ? 0.7 : 1,
            transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}><Sparkles size={20} /></div>
              <span style={styles.logoText}>AI Co-Founder</span>
            </div>

            {token ? (
              <div style={styles.signedInBox}>
                <div style={styles.avatar}>{user?.name?.[0] || '?'}</div>
                <h2 style={styles.signedInTitle}>You're signed in</h2>
                <p style={styles.signedInEmail}>{user?.email}</p>
                <RippleButton className="btn btn-primary btn-lg" style={styles.signedInBtn} onClick={() => navigate('/onboarding')}>
                  <ArrowRight size={18} /> Continue to Onboarding
                </RippleButton>
                <button className="btn btn-ghost" style={styles.logoutBtn} onClick={() => { logout(); }}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <>
                <h1 style={styles.title}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p style={styles.subtitle}>
                  {mode === 'login'
                    ? 'Sign in to continue building your startup'
                    : 'Start your journey with your AI co-founder'}
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                  {mode === 'register' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Name</label>
                      <div style={{
                        ...styles.inputWrapper,
                        ...(focusedField === 'name' ? styles.inputWrapperFocused : {}),
                      }}>
                        <User size={16} style={{ ...styles.inputIcon, color: focusedField === 'name' ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
                        <input
                          style={styles.input}
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email</label>
                    <div style={{
                      ...styles.inputWrapper,
                      ...(focusedField === 'email' ? styles.inputWrapperFocused : {}),
                    }}>
                      <Mail size={16} style={{ ...styles.inputIcon, color: focusedField === 'email' ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
                      <input
                        style={styles.input}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={{
                      ...styles.inputWrapper,
                      ...(focusedField === 'password' ? styles.inputWrapperFocused : {}),
                    }}>
                      <Lock size={16} style={{ ...styles.inputIcon, color: focusedField === 'password' ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
                      <input
                        style={styles.input}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        style={styles.eyeBtn}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <button
                        type="button"
                        style={styles.forgotLink}
                        onClick={() => navigate('/reset-password')}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {error && (
                    <div style={{
                      ...styles.error,
                      animation: 'bounceIn 0.4s ease-out',
                    }}>
                      {error}
                    </div>
                  )}

                  <RippleButton
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Please wait...
                      </span>
                    ) : mode === 'login' ? (
                      <><LogIn size={18} /> Sign In</>
                    ) : (
                      <><User size={18} /> Create Account</>
                    )}
                  </RippleButton>
                </form>
              </>
            )}

            {!token && (
              <div style={styles.footer}>
                <span style={styles.footerText}>
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  style={styles.switchBtn}
                  onClick={toggleMode}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </ThreeDCard>
      </div>
    </div>
  );
}

const styles = {
  page: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  container: { position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '2rem' },
  card: { background: 'rgba(20,18,15,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,248,235,0.08)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' },
  logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  logoText: { fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' },
  title: { fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '0.9375rem', color: 'var(--color-text-tertiary)', textAlign: 'center', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', borderRadius: '10px', transition: 'all 0.3s ease', border: '1px solid rgba(255,248,235,0.08)' },
  inputWrapperFocused: { borderColor: 'var(--color-accent)', boxShadow: '0 0 0 3px rgba(196,154,108,0.1)' },
  inputIcon: { position: 'absolute', left: '12px', pointerEvents: 'none', transition: 'color 0.2s ease' },
  input: { width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: 'rgba(255,248,235,0.03)', border: 'none', borderRadius: '10px', color: 'var(--color-text-primary)', fontSize: '0.9375rem', outline: 'none' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px', display: 'flex', transition: 'color 0.2s' },
  forgotLink: { background: 'none', border: 'none', color: 'var(--color-accent-light)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, padding: '0.25rem 0', textAlign: 'right', width: '100%', transition: 'color 0.2s' },
  error: { padding: '0.75rem 1rem', background: 'rgba(196,112,112,0.08)', border: '1px solid rgba(196,112,112,0.15)', borderRadius: '10px', color: 'var(--color-danger)', fontSize: '0.875rem', textAlign: 'center' },
  submitBtn: { width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' },
  footerText: { fontSize: '0.875rem', color: 'var(--color-text-tertiary)' },
  switchBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--color-accent-light)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: '0', transition: 'color 0.2s' },
  signedInBox: { textAlign: 'center', padding: '1rem 0' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: '0 auto 1rem', animation: 'bounceIn 0.6s ease-out' },
  signedInTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  signedInEmail: { fontSize: '0.9375rem', color: 'var(--color-text-tertiary)', marginBottom: '1.5rem' },
  signedInBtn: { width: '100%', justifyContent: 'center', gap: '0.5rem' },
  logoutBtn: { width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--color-text-muted)' },
};
