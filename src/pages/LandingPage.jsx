import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Brain, Target, Zap, TrendingUp, Shield, ArrowRight, Sparkles, BarChart3, Users, Bot, LogIn } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Reality Engine', desc: 'Scores your goals for feasibility before you waste time building the wrong thing' },
  { icon: Target, title: 'Execution Mode', desc: 'AI doesn\'t just advise — it researches, builds, deploys, and reports back' },
  { icon: BarChart3, title: 'Company Simulator', desc: 'Test pricing, positioning, and launch timing with 1,000 virtual customers' },
  { icon: Users, title: 'AI Board Meeting', desc: 'CEO, CTO, CMO, CFO agents debate decisions so you see every angle' },
  { icon: Shield, title: 'Failure Prediction', desc: 'Surfaces your startup\'s failure risk before it becomes fatal' },
  { icon: TrendingUp, title: 'Never Sleeps', desc: 'Researches competitors, finds opportunities, and briefs you every morning' }
];

const stats = [
  { value: '24/7', label: 'Active Research' },
  { value: '10+', label: 'AI Agents' },
  { value: '∞', label: 'Memory' },
  { value: '100%', label: 'Honest' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  return (
    <div style={styles.page}>
      {/* Animated background */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />
      <div style={styles.gridBg} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={20} /></div>
            <span style={styles.logoText}>AI Co-Founder</span>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <button className="btn btn-ghost landing-nav-cta" onClick={() => navigate('/auth')} style={styles.navCta}>
              <LogIn size={14} /> Sign In
            </button>
            <button className="btn btn-primary landing-nav-cta" onClick={() => navigate('/auth')} style={styles.navCta}>
              Start Building <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{...styles.hero, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={styles.heroBadge}>
          <Zap size={12} style={{color:'var(--color-warning)'}} />
          <span>The world's first Startup Operating System</span>
        </div>
        <h1 style={styles.heroTitle}>
          Most AI tools answer questions.<br />
          <span className="text-gradient">This AI builds companies.</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Not a chatbot. Not an assistant. A persistent, opinionated AI co-founder that researches, challenges, executes, tracks, and grows with you — from raw idea to scale.
        </p>
        <div style={styles.heroCtas}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} style={styles.heroBtn}>
            <Rocket size={20} /> Start Your Journey
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({behavior:'smooth'})}>
            See How It Works
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{...styles.statsSection, opacity: visible ? 1 : 0, transition: 'opacity 1s 0.3s'}}>
        <div className="landing-stats-grid" style={styles.statsGrid}>
          {stats.map((s) => (
            <div key={`stat-${s.value}`} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section style={styles.comparisonSection}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>A Real Co-Founder, Not Another Chatbot</h2>
          <div className="landing-comp-grid" style={styles.compGrid}>
            <div style={{...styles.compCard, ...styles.compCardOld}}>
              <div style={styles.compHeader}>
                <Bot size={24} style={{color:'var(--color-text-muted)'}} />
                <span style={styles.compLabel}>Typical AI Tools</span>
              </div>
              <ul style={styles.compList}>
                {['Reactive & agreeable', 'Stateless conversations', 'Generic advice', 'Plans without tracking', 'Stops when you close the tab'].map((item) => (
                  <li key={`old-${item.slice(0,10)}`} style={styles.compItemOld}>✗ {item}</li>
                ))}
              </ul>
            </div>
            <div style={{...styles.compCard, ...styles.compCardNew}}>
              <div style={styles.compHeader}>
                <Sparkles size={24} style={{color:'var(--color-accent-light)'}} />
                <span style={styles.compLabel}>AI Co-Founder</span>
              </div>
              <ul style={styles.compList}>
                {['Challenges bad decisions', 'Remembers everything forever', 'Personalized to your DNA', 'Executes & tracks progress', 'Researches while you sleep'].map((item) => (
                  <li key={`new-${item.slice(0,10)}`} style={styles.compItemNew}>✓ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Core Engines That Set Us Apart</h2>
          <p style={styles.sectionSubtitle}>Features a competitor cannot fake with a better prompt</p>
          <div className="landing-features-grid" style={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={`feat-${f.title}`} className="glass-card" style={{...styles.featureCard, animationDelay: `${i * 100}ms`}}>
                <div style={styles.featureIcon}><f.icon size={24} /></div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section style={styles.pipelineSection}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Your Journey, End-to-End</h2>
          <div className="landing-pipeline" style={styles.pipeline}>
            {['Idea','Validation','MVP','Launch','Revenue','PMF','Scale'].map((stage) => (
              <React.Fragment key={`pipe-${stage}`}>
                <div style={styles.pipelineStage}>
                  <div style={{...styles.pipelineDot, background: ['Idea','Validation','MVP','Launch','Revenue','PMF','Scale'].indexOf(stage) === 0 ? 'var(--gradient-primary)' : 'var(--color-bg-glass-strong)'}} />
                  <span style={styles.pipelineLabel}>{stage}</span>
                </div>
                {['Idea','Validation','MVP','Launch','Revenue','PMF','Scale'].indexOf(stage) < 6 && <div className="landing-pipeline-line" style={styles.pipelineLine} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>Ready to build with an AI that actually works?</h2>
          <p style={styles.ctaSubtitle}>2 minutes to set up. Your AI co-founder remembers everything from here.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} style={styles.ctaBtn}>
            <Rocket size={20} /> Begin Onboarding
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <Sparkles size={16} style={{color:'var(--color-accent)'}} />
            <span>AI Co-Founder</span>
          </div>
          <p style={styles.footerText}>Building the future of startup creation.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { position: 'relative', minHeight: '100vh', overflow: 'hidden' },
  bgOrb1: { position:'fixed', top:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 },
  bgOrb2: { position:'fixed', bottom:'-20%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 },
  bgOrb3: { position:'fixed', top:'40%', left:'50%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 },
  gridBg: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 },
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:100, backdropFilter:'blur(20px)', background:'rgba(5,6,15,0.8)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  navInner: { maxWidth:'1200px', margin:'0 auto', padding:'0 2rem', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:'0.5rem' },
  logoIcon: { width:'36px', height:'36px', borderRadius:'10px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' },
  logoText: { fontSize:'1.125rem', fontWeight:700, color:'var(--color-text-primary)' },
  navCta: { fontSize:'0.8125rem' },
  hero: { position:'relative', zIndex:1, maxWidth:'900px', margin:'0 auto', padding:'160px 2rem 60px', textAlign:'center' },
  heroBadge: { display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 1rem', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'9999px', fontSize:'0.8125rem', color:'var(--color-warning-light)', marginBottom:'2rem' },
  heroTitle: { fontSize:'clamp(2.5rem, 5vw, 4rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.03em', color:'var(--color-text-primary)', marginBottom:'1.5rem' },
  heroSubtitle: { fontSize:'1.125rem', lineHeight:1.7, color:'var(--color-text-secondary)', maxWidth:'700px', margin:'0 auto 2.5rem' },
  heroCtas: { display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' },
  heroBtn: { animation: 'glowPulse 2s ease-in-out infinite' },
  statsSection: { position:'relative', zIndex:1, maxWidth:'800px', margin:'0 auto', padding:'0 2rem 80px' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem' },
  statCard: { textAlign:'center', padding:'1.5rem 1rem', background:'rgba(255,255,255,0.03)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' },
  statValue: { fontSize:'2rem', fontWeight:800, background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  statLabel: { fontSize:'0.8125rem', color:'var(--color-text-tertiary)', marginTop:'0.25rem' },
  comparisonSection: { position:'relative', zIndex:1, padding:'80px 0', background:'rgba(255,255,255,0.01)' },
  sectionInner: { maxWidth:'1000px', margin:'0 auto', padding:'0 2rem' },
  sectionTitle: { fontSize:'2rem', fontWeight:700, textAlign:'center', marginBottom:'0.75rem', letterSpacing:'-0.02em' },
  sectionSubtitle: { textAlign:'center', color:'var(--color-text-tertiary)', marginBottom:'3rem', fontSize:'1rem' },
  compGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' },
  compCard: { padding:'2rem', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' },
  compCardOld: { background:'rgba(255,255,255,0.02)' },
  compCardNew: { background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)' },
  compHeader: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' },
  compLabel: { fontSize:'1.125rem', fontWeight:600 },
  compList: { listStyle:'none', display:'flex', flexDirection:'column', gap:'0.75rem' },
  compItemOld: { color:'var(--color-text-muted)', fontSize:'0.9375rem' },
  compItemNew: { color:'var(--color-success-light)', fontSize:'0.9375rem' },
  featuresSection: { position:'relative', zIndex:1, padding:'80px 0' },
  featuresGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1.25rem' },
  featureCard: { padding:'2rem', cursor:'default' },
  featureIcon: { width:'48px', height:'48px', borderRadius:'12px', background:'var(--color-accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-accent-light)', marginBottom:'1rem' },
  featureTitle: { fontSize:'1.125rem', fontWeight:600, marginBottom:'0.5rem' },
  featureDesc: { fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.6 },
  pipelineSection: { position:'relative', zIndex:1, padding:'80px 0' },
  pipeline: { display:'flex', alignItems:'center', justifyContent:'center', gap:'0', flexWrap:'wrap', padding:'2rem 0' },
  pipelineStage: { display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' },
  pipelineDot: { width:'40px', height:'40px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' },
  pipelineLabel: { fontSize:'0.8125rem', color:'var(--color-text-secondary)', fontWeight:500 },
  pipelineLine: { width:'40px', height:'2px', background:'rgba(255,255,255,0.1)', marginBottom:'2rem' },
  ctaSection: { position:'relative', zIndex:1, padding:'40px 2rem 80px' },
  ctaCard: { maxWidth:'700px', margin:'0 auto', textAlign:'center', padding:'4rem 3rem', borderRadius:'24px', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)' },
  ctaTitle: { fontSize:'2rem', fontWeight:700, marginBottom:'1rem', letterSpacing:'-0.02em' },
  ctaSubtitle: { color:'var(--color-text-secondary)', marginBottom:'2rem', fontSize:'1.0625rem' },
  ctaBtn: {},
  footer: { position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.06)', padding:'2rem 0' },
  footerInner: { maxWidth:'1200px', margin:'0 auto', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' },
  footerLogo: { display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:600, fontSize:'0.9375rem' },
  footerText: { fontSize:'0.8125rem', color:'var(--color-text-muted)' },
};
