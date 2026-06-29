import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { ONBOARDING_QUESTIONS } from '../utils/constants';
import { Card } from '../components/ui';
import { ArrowLeft, ArrowRight, Sparkles, User, CheckCircle2, Send } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { onboardingStep, onboardingAnswers, toggleOnboardingAnswer, nextOnboardingStep, prevOnboardingStep, completeOnboarding } = useFounderStore();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const customRef = useRef(null);
  const totalSteps = ONBOARDING_QUESTIONS.length;
  const progress = ((onboardingStep + 1) / totalSteps) * 100;

  useEffect(() => { if (customMode) customRef.current?.focus(); }, [customMode]);

  const handleToggle = (answer) => {
    toggleOnboardingAnswer(onboardingStep + 1, answer);
    setCustomMode(false);
    setCustomInput('');
  };

  const handleContinue = () => {
    const answers = onboardingAnswers[onboardingStep + 1];
    const selected = Array.isArray(answers) ? answers : [];
    if (selected.length === 0) return;
    if (onboardingStep < totalSteps - 1) {
      nextOnboardingStep();
    } else {
      setShowNameInput(true);
    }
  };

  const handleCustomSubmit = () => {
    if (!customInput.trim()) return;
    toggleOnboardingAnswer(onboardingStep + 1, customInput.trim());
    setCustomMode(false);
    setCustomInput('');
  };

  const handleComplete = () => {
    if (!name.trim()) return;
    completeOnboarding(name.trim());
    navigate('/goal');
  };

  const currentQ = ONBOARDING_QUESTIONS[onboardingStep];

  if (showNameInput) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <Card style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', margin: '0 auto 1.5rem',
            }}>
              <User size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>One last thing — what should I call you?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>This is how your AI Co-Founder will address you.</p>
            <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComplete()} autoFocus style={{ textAlign: 'center', fontSize: '1.25rem', marginBottom: '1.5rem' }} />
            <button className="btn btn-primary btn-lg" onClick={handleComplete} disabled={!name.trim()} style={{ width: '100%', opacity: name.trim() ? 1 : 0.5 }}>
              <Sparkles size={18} /> Meet Your AI Co-Founder
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Question {onboardingStep + 1} of {totalSteps}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>~{Math.max(1, Math.ceil((totalSteps - onboardingStep) * 0.3))} min left</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card key={customMode ? 'custom' : onboardingStep} style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--accent-subtle)', color: 'var(--accent)',
            fontWeight: 700, fontSize: '0.875rem', marginBottom: '1.5rem',
          }}>Q{onboardingStep + 1}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem', lineHeight: 1.3 }}>{currentQ.question}</h2>

          {customMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea ref={customRef} placeholder="Type your own answer..." value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomSubmit(); } }} rows={3} />
              <button className="btn btn-primary" onClick={handleCustomSubmit} disabled={!customInput.trim()} style={{ alignSelf: 'center', gap: '0.5rem' }}>
                <Send size={16} /> Submit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setCustomMode(false); setCustomInput(''); }} style={{ alignSelf: 'center', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Back to options
              </button>
            </div>
          ) : (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(currentQ.options || []).map((opt) => {
                const selected = onboardingAnswers[onboardingStep + 1];
                const isSelected = Array.isArray(selected) && selected.includes(opt);
                return (
                  <button key={`opt-${opt.slice(0, 15)}`} onClick={() => handleToggle(opt)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.9375rem', fontWeight: 500,
                    transition: 'all 0.2s', color: 'var(--text)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <span>{opt}</span>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent)', animation: 'bounceIn 0.4s ease-out' }} />
                    )}
                  </button>
                );
              })}
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                <button className="btn btn-primary" onClick={handleContinue} disabled={!Array.isArray(onboardingAnswers[onboardingStep + 1]) || onboardingAnswers[onboardingStep + 1]?.length === 0}>
                  Continue <ArrowRight size={16} />
                </button>
                <button onClick={() => setCustomMode(true)} style={{
                  padding: '0.625rem 1.25rem',
                  border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
                  cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 500,
                  color: 'var(--accent)', background: 'transparent',
                }}>
                  Type your own
                </button>
              </div>
            </div>
          )}
        </Card>

        {onboardingStep > 0 && (
          <button className="btn btn-ghost" onClick={() => { if (customMode) { setCustomMode(false); setCustomInput(''); } else { prevOnboardingStep(); } }} style={{ marginTop: '1.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
          {ONBOARDING_QUESTIONS.map((q) => (
            <div key={`dot-${q.id}`} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: (q.id - 1) < onboardingStep ? 'var(--accent)' :
                (q.id - 1) === onboardingStep ? 'var(--accent-light)' : 'var(--border)',
              transform: (q.id - 1) === onboardingStep ? 'scale(1.3)' : 'scale(1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
