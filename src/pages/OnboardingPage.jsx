import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { ONBOARDING_QUESTIONS } from '../utils/constants';
import { ArrowLeft, Sparkles, User, CheckCircle2, Send } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { onboardingStep, onboardingAnswers, setOnboardingAnswer, nextOnboardingStep, prevOnboardingStep, completeOnboarding } = useFounderStore();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const customRef = useRef(null);
  const totalSteps = ONBOARDING_QUESTIONS.length;
  const progress = ((onboardingStep + 1) / totalSteps) * 100;

  useEffect(() => { if (customMode) customRef.current?.focus(); }, [customMode]);

  const handleSelect = (answer) => {
    setOnboardingAnswer(onboardingStep + 1, answer);
    setCustomMode(false);
    setCustomInput('');
    if (onboardingStep < totalSteps - 1) {
      setTimeout(() => nextOnboardingStep(), 300);
    } else {
      setShowNameInput(true);
    }
  };

  const handleCustomSubmit = () => {
    if (!customInput.trim()) return;
    handleSelect(customInput.trim());
  };

  const handleComplete = () => {
    if (!name.trim()) return;
    completeOnboarding(name.trim());
    navigate('/goal');
  };

  const currentQ = ONBOARDING_QUESTIONS[onboardingStep];
  const selectedAnswer = onboardingAnswers[onboardingStep + 1];

  if (showNameInput) {
    return (
      <div style={styles.page}>
        <div style={styles.bgOrb} />
        <div style={styles.container}>
          <div style={styles.card} className="page-enter">
            <div style={styles.iconWrap}><User size={32} /></div>
            <h2 style={styles.title}>One last thing — what should I call you?</h2>
            <p style={styles.subtitle}>This is how your AI Co-Founder will address you.</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComplete()}
              style={styles.nameInput}
              autoFocus
            />
            <button className="btn btn-primary btn-lg" onClick={handleComplete} disabled={!name.trim()} style={{...styles.completeBtn, opacity: name.trim() ? 1 : 0.5}}>
              <Sparkles size={18} /> Meet Your AI Co-Founder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb} />
      <div style={styles.container}>
        {/* Progress */}
        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Question {onboardingStep + 1} of {totalSteps}</span>
            <span style={styles.progressTime}>~{Math.max(1, Math.ceil((totalSteps - onboardingStep) * 0.3))} min left</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div style={styles.card} key={customMode ? 'custom' : onboardingStep} className="page-enter">
          <div style={styles.questionNumber}>Q{onboardingStep + 1}</div>
          <h2 style={styles.questionTitle}>{currentQ.question}</h2>

          {customMode ? (
            <div style={styles.customWrap}>
              <textarea
                ref={customRef}
                placeholder="Type your own answer..."
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomSubmit(); } }}
                style={styles.customInput}
                rows={3}
              />
              <button className="btn btn-primary" onClick={handleCustomSubmit} disabled={!customInput.trim()} style={styles.customSubmit}>
                <Send size={16} /> Submit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setCustomMode(false); setCustomInput(''); }} style={styles.backToOptions}>
                Back to options
              </button>
            </div>
          ) : (
            <>
              <div style={styles.optionsGrid}>
                {currentQ.options.map((opt, i) => (
                  <button
                    key={`opt-${opt.slice(0,15)}`}
                    onClick={() => handleSelect(opt)}
                    style={{
                      ...styles.optionBtn,
                      ...(selectedAnswer === opt ? styles.optionSelected : {}),
                      animationDelay: `${i * 60}ms`
                    }}
                    className="page-enter"
                  >
                    <span style={styles.optionText}>{opt}</span>
                    {selectedAnswer === opt && <CheckCircle2 size={18} style={{color:'var(--color-accent-light)'}} />}
                  </button>
                ))}
                <button
                  onClick={() => setCustomMode(true)}
                  style={{...styles.optionBtn, ...styles.customOptBtn}}
                  className="page-enter"
                >
                  <span style={styles.optionText}>✏️ Type your own answer</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        {onboardingStep > 0 && (
          <button className="btn btn-ghost" onClick={() => { if (customMode) { setCustomMode(false); setCustomInput(''); } else { prevOnboardingStep(); } }} style={styles.backBtn}>
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Step dots */}
        <div style={styles.dots}>
          {ONBOARDING_QUESTIONS.map((q) => (
            <div key={`dot-${q.id}`} style={{
              ...styles.dot,
              background: (q.id - 1) < onboardingStep ? 'var(--color-accent)' :
                          (q.id - 1) === onboardingStep ? 'var(--color-accent-light)' :
                          'rgba(255,255,255,0.1)'
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'2rem' },
  bgOrb: { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents:'none' },
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:'600px' },
  progressWrap: { marginBottom:'2rem' },
  progressHeader: { display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' },
  progressLabel: { fontSize:'0.8125rem', fontWeight:600, color:'var(--color-text-primary)' },
  progressTime: { fontSize:'0.8125rem', color:'var(--color-text-tertiary)' },
  card: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'3rem 2.5rem', textAlign:'center' },
  questionNumber: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'12px', background:'var(--color-accent-subtle)', color:'var(--color-accent-light)', fontWeight:700, fontSize:'0.875rem', marginBottom:'1.5rem' },
  questionTitle: { fontSize:'1.5rem', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'2rem', lineHeight:1.3 },
  optionsGrid: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  optionBtn: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.5rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', cursor:'pointer', transition:'all 0.2s', fontSize:'0.9375rem', fontWeight:500, color:'var(--color-text-primary)', textAlign:'left' },
  optionSelected: { background:'rgba(99,102,241,0.1)', borderColor:'rgba(99,102,241,0.3)', boxShadow:'0 0 20px rgba(99,102,241,0.1)' },
  customOptBtn: { borderStyle:'dashed', color:'var(--color-accent-light)', justifyContent:'center', gap:'0.5rem', marginTop:'0.25rem' },
  optionText: {},
  customWrap: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  customInput: { width:'100%', padding:'0.875rem 1rem', fontSize:'1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', color:'var(--color-text-primary)', outline:'none', resize:'none', fontFamily:'inherit' },
  customSubmit: { alignSelf:'center', gap:'0.5rem' },
  backToOptions: { alignSelf:'center', fontSize:'0.8125rem', color:'var(--color-text-tertiary)' },
  backBtn: { marginTop:'1.5rem' },
  dots: { display:'flex', gap:'0.5rem', justifyContent:'center', marginTop:'2rem' },
  dot: { width:'8px', height:'8px', borderRadius:'50%', transition:'all 0.3s' },
  iconWrap: { width:'64px', height:'64px', borderRadius:'20px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', margin:'0 auto 1.5rem' },
  title: { fontSize:'1.5rem', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'0.75rem' },
  subtitle: { color:'var(--color-text-secondary)', marginBottom:'2rem', fontSize:'0.9375rem' },
  nameInput: { fontSize:'1.25rem', textAlign:'center', padding:'1rem', marginBottom:'1.5rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px' },
  completeBtn: { width:'100%', transition:'opacity 0.3s' },
};
