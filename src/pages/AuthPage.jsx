import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useFounderStore } from '../store/founderStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const resetOnboarding = useFounderStore(s => s.resetOnboarding);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login(email, password)
        : await api.register(name, email, password);
      setAuth(res.user, res.token);
      resetOnboarding();
      ['ai-cofounder-founder-storage', 'ai-cofounder-business-storage', 'ai-cofounder-task-storage', 'ai-cofounder-chat-storage'].forEach(k => localStorage.removeItem(k));
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.gridBg} />

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={20} /></div>
            <span style={styles.logoText}>AI Co-Founder</span>
          </div>

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
                <div style={styles.inputWrapper}>
                  <User size={16} style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? (
                <><LogIn size={18} /> Sign In</>
              ) : (
                <><User size={18} /> Create Account</>
              )}
            </button>
          </form>

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
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bgOrb1: { position:'fixed', top:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 },
  bgOrb2: { position:'fixed', bottom:'-20%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 },
  gridBg: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 },
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:'420px', padding:'2rem' },
  card: { background:'rgba(10,11,26,0.8)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'2.5rem 2rem' },
  logo: { display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'2rem' },
  logoIcon: { width:'36px', height:'36px', borderRadius:'10px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' },
  logoText: { fontSize:'1.125rem', fontWeight:700, color:'var(--color-text-primary)' },
  title: { fontSize:'1.75rem', fontWeight:700, textAlign:'center', marginBottom:'0.5rem', letterSpacing:'-0.02em' },
  subtitle: { fontSize:'0.9375rem', color:'var(--color-text-tertiary)', textAlign:'center', marginBottom:'2rem' },
  form: { display:'flex', flexDirection:'column', gap:'1.25rem' },
  inputGroup: { display:'flex', flexDirection:'column', gap:'0.375rem' },
  label: { fontSize:'0.8125rem', fontWeight:500, color:'var(--color-text-secondary)' },
  inputWrapper: { position:'relative', display:'flex', alignItems:'center' },
  inputIcon: { position:'absolute', left:'12px', color:'var(--color-text-tertiary)', pointerEvents:'none' },
  input: { width:'100%', padding:'0.75rem 0.75rem 0.75rem 2.5rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'var(--color-text-primary)', fontSize:'0.9375rem', outline:'none', transition:'border-color 0.2s' },
  eyeBtn: { position:'absolute', right:'12px', background:'none', border:'none', color:'var(--color-text-tertiary)', cursor:'pointer', padding:'4px', display:'flex' },
  error: { padding:'0.75rem 1rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', color:'var(--color-danger)', fontSize:'0.875rem', textAlign:'center' },
  submitBtn: { width:'100%', justifyContent:'center', gap:'0.5rem', marginTop:'0.5rem' },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem' },
  footerText: { fontSize:'0.875rem', color:'var(--color-text-tertiary)' },
  switchBtn: { display:'inline-flex', alignItems:'center', gap:'0.25rem', background:'none', border:'none', color:'var(--color-accent-light)', cursor:'pointer', fontSize:'0.875rem', fontWeight:500, padding:'0' },
};
