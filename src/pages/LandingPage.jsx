import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Brain, Target, Zap, TrendingUp, Shield, ArrowRight, Sparkles, BarChart3, Users, Bot, LogIn, ChevronDown, ArrowUpRight } from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import CursorGlow from '../components/ui/CursorGlow';
import KineticText from '../components/ui/KineticText';
import { ScrollStorySection, useScrollProgress } from '../components/ui/ScrollStory';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid';
import ThreeDCard from '../components/ui/ThreeDCard';
import ScrollProgress from '../components/ui/ScrollProgress';
import MagneticButton from '../components/ui/MagneticButton';
import RippleButton from '../components/ui/RippleButton';

const features = [
  { icon: Brain, title: 'Reality Engine', desc: 'Scores your goals for feasibility before you waste time building the wrong thing', color: 'var(--color-accent)' },
  { icon: Target, title: 'Execution Mode', desc: 'AI doesn\'t just advise — it researches, builds, deploys, and reports back', color: 'var(--color-success)' },
  { icon: BarChart3, title: 'Company Simulator', desc: 'Test pricing, positioning, and launch timing with 1,000 virtual customers', color: 'var(--color-info)' },
  { icon: Users, title: 'AI Board Meeting', desc: 'CEO, CTO, CMO, CFO agents debate decisions so you see every angle', color: 'var(--color-warning)' },
  { icon: Shield, title: 'Failure Prediction', desc: 'Surfaces your startup\'s failure risk before it becomes fatal', color: 'var(--color-danger)' },
  { icon: TrendingUp, title: 'Never Sleeps', desc: 'Researches competitors, finds opportunities, and briefs you every morning', color: 'var(--color-accent-light)' },
];

const stats = [
  { value: '24/7', label: 'Active Research', icon: Zap },
  { value: '10+', label: 'AI Agents', icon: Users },
  { value: '∞', label: 'Memory', icon: Brain },
  { value: '100%', label: 'Honest', icon: Shield },
];

const pipelineStages = ['Idea', 'Validation', 'MVP', 'Launch', 'Revenue', 'PMF', 'Scale'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const heroRef = useRef(null);
  const scrollProgress = useScrollProgress();
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => { setVisible(true); }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * 0.01}px, ${y * 0.01}px)`;
        if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-x * 0.008}px, ${-y * 0.008}px)`;
        if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${x * 0.005}px, ${y * 0.005}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={styles.page}>
      <ScrollProgress />
      <CursorGlow color="rgba(196,154,108,0.04)" size={500} />

      {/* Floating orbs with parallax */}
      <div ref={orb1Ref} style={styles.bgOrb1} />
      <div ref={orb2Ref} style={styles.bgOrb2} />
      <div ref={orb3Ref} style={styles.bgOrb3} />
      <div style={styles.gridBg} />

      {/* Nav */}
      <nav style={{ ...styles.nav, backdropFilter: `blur(${20 + scrollProgress * 10}px)`, background: `rgba(15,13,10,${0.7 + scrollProgress * 0.25})` }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={20} /></div>
            <span style={styles.logoText}>AI Co-Founder</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-ghost landing-nav-cta" onClick={() => navigate('/auth')} style={styles.navCta}>
              <LogIn size={14} /> Sign In
            </button>
            <RippleButton className="btn btn-primary landing-nav-cta" onClick={() => navigate('/auth')} style={styles.navCta}>
              Start Building <ArrowRight size={16} />
            </RippleButton>
          </div>
        </div>
      </nav>

      {/* Hero Section with Scrollytelling */}
      <AuroraBackground intensity={0.4}>
        <section
          ref={heroRef}
          className="landing-hero"
          style={{
            ...styles.hero,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div style={styles.heroBadge}>
            <Zap size={12} style={{ color: 'var(--color-warning)' }} />
            <span>The world's first Startup Operating System</span>
          </div>

          <h1 style={styles.heroTitle}>
            <KineticText text="Most AI tools answer questions." tag="span" delay={0.2} staggerDelay={0.02} />
            <br />
            <span className="text-gradient">
              <KineticText text="This AI builds companies." tag="span" delay={0.8} staggerDelay={0.03} />
            </span>
          </h1>

          <p style={styles.heroSubtitle}>
            Not a chatbot. Not an assistant. A persistent, opinionated AI co-founder that researches, challenges, executes, tracks, and grows with you — from raw idea to scale.
          </p>

          <div style={styles.heroCtas}>
            <MagneticButton className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} style={styles.heroBtn} strength={0.15}>
              <Rocket size={20} /> Start Your Journey
            </MagneticButton>
            <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works <ChevronDown size={16} />
            </button>
          </div>

          {/* Floating 3D card preview */}
          <div style={styles.heroPreview}>
            <ThreeDCard intensity={8}>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div style={styles.previewDot} />
                  <div style={styles.previewDot} />
                  <div style={styles.previewDot} />
                </div>
                <div style={styles.previewContent}>
                  <div style={styles.previewLine} />
                  <div style={{ ...styles.previewLine, width: '70%' }} />
                  <div style={{ ...styles.previewLine, width: '85%' }} />
                  <div style={styles.previewBar}>
                    <div style={{ ...styles.previewBarFill, width: '72%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <div style={styles.previewTag} />
                    <div style={{ ...styles.previewTag, width: '60px' }} />
                    <div style={{ ...styles.previewTag, width: '45px' }} />
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </div>

          {/* Scroll indicator */}
          <div style={styles.scrollIndicator}>
            <div style={styles.scrollMouse}>
              <div style={styles.scrollDot} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Scroll to explore</span>
          </div>
        </section>
      </AuroraBackground>

      {/* Stats with stagger animation */}
      <ScrollStorySection animation="fadeInUp">
        <section style={styles.statsSection}>
          <div className="landing-stats-grid" style={styles.statsGrid}>
            {stats.map((s, i) => (
              <ThreeDCard key={s.label} intensity={5}>
                <div style={{ ...styles.statCard, animationDelay: `${i * 0.1}s` }}>
                  <s.icon size={20} style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }} />
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </ThreeDCard>
            ))}
          </div>
        </section>
      </ScrollStorySection>

      {/* Comparison — Bento Layout */}
      <ScrollStorySection animation="fadeInUp">
        <section style={styles.comparisonSection}>
          <div style={styles.sectionInner}>
            <h2 style={styles.sectionTitle}>A Real Co-Founder, Not Another Chatbot</h2>
            <div className="landing-comp-grid" style={styles.compGrid}>
              <div className="glass-card" style={styles.compCardOld}>
                <div style={styles.compHeader}>
                  <Bot size={24} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={styles.compLabel}>Typical AI Tools</span>
                </div>
                <ul style={styles.compList}>
                  {['Reactive & agreeable', 'Stateless conversations', 'Generic advice', 'Plans without tracking', 'Stops when you close the tab'].map((item) => (
                    <li key={`old-${item}`} style={styles.compItemOld}>
                      <span style={{ color: 'var(--color-danger)', marginRight: '0.5rem' }}>✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="clay-card" style={styles.compCardNew}>
                <div style={styles.compHeader}>
                  <Sparkles size={24} style={{ color: 'var(--color-accent-light)' }} />
                  <span style={styles.compLabel}>AI Co-Founder</span>
                </div>
                <ul style={styles.compList}>
                  {['Challenges bad decisions', 'Remembers everything forever', 'Personalized to your DNA', 'Executes & tracks progress', 'Researches while you sleep'].map((item) => (
                    <li key={`new-${item}`} style={styles.compItemNew}>
                      <span style={{ color: 'var(--color-success)', marginRight: '0.5rem' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </ScrollStorySection>

      {/* Features — Bento Grid */}
      <ScrollStorySection animation="fadeInUp">
        <section id="features" style={styles.featuresSection}>
          <div style={styles.sectionInner}>
            <h2 style={styles.sectionTitle}>Core Engines That Set Us Apart</h2>
            <p style={styles.sectionSubtitle}>Features a competitor cannot fake with a better prompt</p>
            <BentoGrid columns={3} gap="1.25rem">
              {features.map((f, i) => (
                <BentoItem key={f.title} delay={i * 0.08}>
                  <ThreeDCard intensity={6}>
                    <div className="glass-card" style={styles.featureCard}>
                      <div style={{ ...styles.featureIcon, background: `${f.color}15`, color: f.color }}>
                        <f.icon size={24} />
                      </div>
                      <h3 style={styles.featureTitle}>{f.title}</h3>
                      <p style={styles.featureDesc}>{f.desc}</p>
                      <div style={styles.featureArrow}>
                        <ArrowUpRight size={16} style={{ color: f.color }} />
                      </div>
                    </div>
                  </ThreeDCard>
                </BentoItem>
              ))}
            </BentoGrid>
          </div>
        </section>
      </ScrollStorySection>

      {/* Pipeline — Scroll Story */}
      <ScrollStorySection animation="fadeInUp">
        <section style={styles.pipelineSection}>
          <div style={styles.sectionInner}>
            <h2 style={styles.sectionTitle}>Your Journey, End-to-End</h2>
            <div className="landing-pipeline" style={styles.pipeline}>
              {pipelineStages.map((stage, i) => (
                <React.Fragment key={`pipe-${stage}`}>
                  <div
                    style={{
                      ...styles.pipelineStage,
                      opacity: 1,
                      transform: 'translateY(0)',
                      transition: `all 0.5s ${i * 0.1}s ease`,
                    }}
                  >
                    <div style={{
                      ...styles.pipelineDot,
                      background: i === 0 ? 'var(--gradient-primary)' : 'var(--color-bg-glass-strong)',
                      boxShadow: i === 0 ? '0 0 20px rgba(196,154,108,0.3)' : 'none',
                    }} />
                    <span style={styles.pipelineLabel}>{stage}</span>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className="landing-pipeline-line" style={styles.pipelineLine} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </ScrollStorySection>

      {/* CTA with Aurora */}
      <ScrollStorySection animation="fadeInScale">
        <section style={styles.ctaSection}>
          <AuroraBackground intensity={0.3}>
            <div style={styles.ctaCard}>
              <h2 style={styles.ctaTitle}>Ready to build with an AI that actually works?</h2>
              <p style={styles.ctaSubtitle}>2 minutes to set up. Your AI co-founder remembers everything from here.</p>
              <MagneticButton className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} style={styles.ctaBtn} strength={0.1}>
                <Rocket size={20} /> Begin Onboarding
              </MagneticButton>
            </div>
          </AuroraBackground>
        </section>
      </ScrollStorySection>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
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
  bgOrb1: { position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,108,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, transition: 'transform 0.3s ease-out' },
  bgOrb2: { position: 'fixed', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,184,125,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, transition: 'transform 0.3s ease-out' },
  bgOrb3: { position: 'fixed', top: '40%', left: '50%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,168,196,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, transition: 'transform 0.3s ease-out' },
  gridBg: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,248,235,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,248,235,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 },

  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(255,248,235,0.06)' },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  logoText: { fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' },
  navCta: { fontSize: '0.8125rem' },

  hero: { position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '160px 2rem 40px', textAlign: 'center' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: '9999px', fontSize: '0.8125rem', color: 'var(--color-warning-light)', marginBottom: '2rem', animation: 'floatSlow 4s ease-in-out infinite' },
  heroTitle: { fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '1.5rem' },
  heroSubtitle: { fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem' },
  heroCtas: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' },
  heroBtn: { animation: 'glowPulse 2s ease-in-out infinite' },

  heroPreview: { maxWidth: '500px', margin: '0 auto 2rem', animation: 'float 6s ease-in-out infinite' },
  previewCard: { background: 'rgba(15,13,10,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,248,235,0.08)', borderRadius: '16px', overflow: 'hidden' },
  previewHeader: { display: 'flex', gap: '6px', padding: '12px 16px', borderBottom: '1px solid rgba(255,248,235,0.06)' },
  previewDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,248,235,0.1)' },
  previewContent: { padding: '20px' },
  previewLine: { height: '8px', background: 'rgba(255,248,235,0.06)', borderRadius: '4px', marginBottom: '8px', width: '100%' },
  previewBar: { height: '6px', background: 'rgba(255,248,235,0.04)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' },
  previewBarFill: { height: '100%', background: 'var(--gradient-primary)', borderRadius: '3px' },
  previewTag: { width: '50px', height: '6px', background: 'rgba(196,154,108,0.15)', borderRadius: '3px' },

  scrollIndicator: { display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'float 2s ease-in-out infinite' },
  scrollMouse: { width: '24px', height: '36px', border: '2px solid rgba(255,248,235,0.15)', borderRadius: '12px', display: 'flex', justifyContent: 'center', paddingTop: '6px' },
  scrollDot: { width: '3px', height: '8px', background: 'var(--color-accent)', borderRadius: '2px', animation: 'float 1.5s ease-in-out infinite' },

  statsSection: { position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 80px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: { textAlign: 'center', padding: '1.5rem 1rem', background: 'rgba(255,248,235,0.03)', borderRadius: '16px', border: '1px solid rgba(255,248,235,0.06)', transition: 'all 0.3s ease' },
  statValue: { fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' },

  comparisonSection: { position: 'relative', zIndex: 1, padding: '80px 0', background: 'rgba(255,248,235,0.01)' },
  sectionInner: { maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' },
  sectionTitle: { fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' },
  sectionSubtitle: { textAlign: 'center', color: 'var(--color-text-tertiary)', marginBottom: '3rem', fontSize: '1rem' },
  compGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  compCardOld: { padding: '2rem' },
  compCardNew: { padding: '2rem' },
  compHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' },
  compLabel: { fontSize: '1.125rem', fontWeight: 600 },
  compList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  compItemOld: { color: 'var(--color-text-muted)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center' },
  compItemNew: { color: 'var(--color-success-light)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center' },

  featuresSection: { position: 'relative', zIndex: 1, padding: '80px 0' },
  featureCard: { padding: '2rem', cursor: 'default', height: '100%', position: 'relative' },
  featureIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  featureTitle: { fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' },
  featureDesc: { fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 },
  featureArrow: { position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.4, transition: 'opacity 0.3s' },

  pipelineSection: { position: 'relative', zIndex: 1, padding: '80px 0' },
  pipeline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap', padding: '2rem 0' },
  pipelineStage: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.5s ease' },
  pipelineDot: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,248,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' },
  pipelineLabel: { fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 },
  pipelineLine: { width: '40px', height: '2px', background: 'rgba(255,248,235,0.1)', marginBottom: '2rem' },

  ctaSection: { position: 'relative', zIndex: 1, padding: '40px 2rem 80px' },
  ctaCard: { maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '4rem 3rem', borderRadius: '24px', background: 'rgba(196,154,108,0.04)', border: '1px solid rgba(196,154,108,0.12)' },
  ctaTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' },
  ctaSubtitle: { color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1.0625rem' },
  ctaBtn: {},

  footer: { position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,248,235,0.06)', padding: '2rem 0' },
  footerInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' },
  footerText: { fontSize: '0.8125rem', color: 'var(--color-text-muted)' },
};
