import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlashCard, ThreeDCard } from '../components/ui';
import { Rss, BarChart3, Brain, Target, Zap, Shield, ChevronDown } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Reality Engine', desc: 'Scores your goals for feasibility before you waste time building the wrong thing' },
  { icon: Target, title: 'Execution Mode', desc: 'AI researches, builds, deploys, and reports back — not just advice' },
  { icon: BarChart3, title: 'Company Simulator', desc: 'Test pricing, positioning, and timing with 1,000 virtual customers' },
  { icon: Rss, title: 'AI Board Meeting', desc: 'CEO, CTO, CMO, CFO agents debate decisions from every angle' },
  { icon: Shield, title: 'Failure Prediction', desc: 'Surfaces your startup\'s failure risk before it becomes fatal' },
  { icon: Zap, title: 'Never Sleeps', desc: 'Researches competitors, finds opportunities, briefs you every morning' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setVisible(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 2rem', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `rgba(7,7,13,${Math.min(scrollY / 200, 0.9)})`,
          backdropFilter: `blur(${Math.min(scrollY / 10, 20)}px)`,
          borderBottom: `1px solid rgba(99,102,241,${Math.min(scrollY / 600, 0.08)})`,
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: 'white',
            transform: 'rotate(45deg)',
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>AI Co-Founder</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Start Building</button>
        </div>
      </nav>

      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 2rem 60px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem',
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          color: 'var(--accent-light)',
          marginBottom: '2rem',
          animation: 'floatSlow 4s ease-in-out infinite',
        }}>
          <Zap size={12} /> The world's first Startup Operating System
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
        }}>
          Most AI tools answer questions.
          <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-light), #a78bfa, var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            This AI builds companies.
          </span>
        </h1>

        <p style={{
          fontSize: '1.125rem', lineHeight: 1.7,
          color: 'var(--text-secondary)',
          maxWidth: '640px', margin: '0 auto 2.5rem',
        }}>
          Not a chatbot. Not an assistant. A persistent, opinionated AI co-founder
          that researches, challenges, executes, tracks, and grows with you.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/auth')}
            style={{ animation: 'glowPulse 2s ease-in-out infinite' }}
          >
            Start Your Journey
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            See How It Works <ChevronDown size={16} />
          </button>
        </div>

        <ThreeDCard intensity={6} glow>
          <div style={{
            background: 'rgba(7,7,13,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            maxWidth: '500px',
            animation: 'tiltFloat 6s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              {[0,1,2].map(i => <div key={`dot-${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[100, 70, 85, 60].map((w, i) => (
                <div key={i} style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, width: `${w}%` }} />
              ))}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </ThreeDCard>
      </section>

      <section id="features" style={{ padding: '60px 2rem 100px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Core Engines</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem' }}>Features a competitor cannot fake with a better prompt</p>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => (
            <ThreeDCard key={f.title} intensity={5}>
              <SlashCard variant="accent" tilt>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--accent-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <f.icon size={22} style={{ color: 'var(--accent-light)' }} />
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{f.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </SlashCard>
            </ThreeDCard>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 2rem', textAlign: 'center' }}>
        <ThreeDCard intensity={4}>
          <SlashCard variant="accent" glow style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to build?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>2 minutes to set up. Your AI co-founder remembers everything.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
              Begin Onboarding
            </button>
          </SlashCard>
        </ThreeDCard>
      </section>

      <footer style={{
        borderTop: '1px solid var(--border)', padding: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1000px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: 'white',
            transform: 'rotate(45deg)',
          }}>A</div>
          AI Co-Founder
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Building the future of startup creation.</p>
      </footer>
    </div>
  );
}
