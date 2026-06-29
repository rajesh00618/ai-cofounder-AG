import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '../store/businessStore';
import { useTaskStore } from '../store/taskStore';
import { useFounderStore } from '../store/founderStore';
import { SlashCard, ThreeDCard } from '../components/ui';
import { FileText, ArrowRight, Sparkles, CheckCircle2, Loader2, Edit3, Download } from 'lucide-react';
import { delay, generateId } from '../utils/helpers';
import { api } from '../utils/api';

const BUSINESS_QUESTIONS = [
  { id: 1, q: 'Who is your target customer?', placeholder: 'e.g., Small business owners who struggle with social media marketing' },
  { id: 2, q: "What is their biggest problem?", placeholder: 'e.g., They spend too much time creating content with poor results' },
  { id: 3, q: 'What do they currently use instead?', placeholder: 'e.g., Canva, hiring freelancers, doing it manually' },
  { id: 4, q: "What's your pricing model?", placeholder: 'e.g., $29/mo for basic, $79/mo for pro' },
  { id: 5, q: "What's your unique advantage?", placeholder: 'e.g., AI generates brand-consistent content in seconds' },
];

const BLUEPRINT_SECTIONS = [
  'Executive Summary', 'Problem & Solution', 'Target Customer & ICP', 'Market Size',
  'Unique Selling Proposition', 'Competitors & SWOT', 'Revenue Model & Pricing',
  'Business Model Canvas', 'Risk Analysis', 'Go-to-Market Plan', 'Validation Plan',
  'MVP Plan', 'Roadmap', 'Financial Estimate', 'Success Metrics',
];

export default function BusinessPlanningPage() {
  const navigate = useNavigate();
  const { setBlueprint, setBusinessHealth, setStartupScore } = useBusinessStore();
  const { addTask, createSprint } = useTaskStore();
  const { profile } = useFounderStore();
  const [phase, setPhase] = useState('questions');
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [blueprint, setBp] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bpError, setBpError] = useState('');

  const handleExport = () => {
    if (!blueprint) return;
    const lines = [
      '=== Business Blueprint ===', '',
      `Executive Summary: ${blueprint.executiveSummary || ''}`, '',
      `Problem: ${blueprint.problem || ''}`, '',
      `Solution & USP: ${blueprint.solution || ''}`, '',
      `Target Customer: ${blueprint.targetCustomer || ''}`, '',
      `Market Size: ${blueprint.marketSize || ''}`, '',
      `Competitors: ${blueprint.competitors || ''}`, '',
      `Revenue Model: ${blueprint.revenueModel || ''}`, '',
      `Go-to-Market: ${blueprint.gtmPlan || ''}`, '',
      `Validation Plan: ${blueprint.validationPlan || ''}`, '',
      `MVP Plan: ${blueprint.mvpPlan || ''}`, '',
      'Success Metrics:', ...(blueprint.successMetrics || []).map(m => `  ✓ ${m}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `blueprint-${blueprint.id || 'export'}.txt`;
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));
  const handleNext = () => {
    if (currentQ < BUSINESS_QUESTIONS.length - 1) setCurrentQ(currentQ + 1);
    else generateBlueprint();
  };

  const generateBlueprint = useCallback(async () => {
    setPhase('generating'); setGenerating(true); setBpError('');
    for (let i = 0; i < BLUEPRINT_SECTIONS.length; i++) { setGenStep(i); await delay(200); }
    try {
      const bp = await api.generateBlueprint(answers);
      bp.id = generateId(); bp.createdAt = new Date().toISOString();
      setBp(bp); setBlueprint(bp);
      const results = await Promise.allSettled([
        api.generateBlueprintScores(answers, bp, profile),
        api.generateBlueprintTasks(answers, bp),
      ]);
      const scores = results[0].status === 'fulfilled' ? results[0].value : null;
      const tasks = results[1].status === 'fulfilled' ? results[1].value?.tasks : [];
      if (scores?.businessHealth && scores?.startupScore) {
        setBusinessHealth(scores.businessHealth); setStartupScore(scores.startupScore);
      }
      const sprintId = createSprint({ goal: 'Initial Validation', deadline: 'This week', week: 1 });
      if (Array.isArray(tasks) && tasks.length > 0) tasks.forEach(t => addTask({ ...t, sprintId }));
    } catch (e) {
      setBpError('AI Generation failed: ' + e.message); setGenerating(false); setPhase('questions'); return;
    }
    setGenerating(false); setPhase('blueprint');
  }, [answers, addTask, createSprint, setBlueprint, setBusinessHealth, setStartupScore, profile]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '750px' }}>
        {bpError && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {bpError}
          </div>
        )}

        {phase === 'questions' && (
          <ThreeDCard intensity={3} key={currentQ}>
            <SlashCard variant="accent">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileText size={20} style={{ color: 'var(--accent-light)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Business Planning — {currentQ + 1}/{BUSINESS_QUESTIONS.length}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: '2rem' }}>
                <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / BUSINESS_QUESTIONS.length) * 100}%` }} />
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.3 }}>{BUSINESS_QUESTIONS[currentQ].q}</h3>
              <textarea
                placeholder={BUSINESS_QUESTIONS[currentQ].placeholder}
                value={answers[BUSINESS_QUESTIONS[currentQ].id] || ''}
                onChange={e => handleAnswer(BUSINESS_QUESTIONS[currentQ].id, e.target.value)}
                rows={3} autoFocus
                style={{ resize: 'vertical', minHeight: '80px', fontSize: '1rem', marginBottom: '1.5rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {currentQ > 0 && <button className="btn btn-ghost" onClick={() => setCurrentQ(currentQ - 1)}>Back</button>}
                {!currentQ && <div />}
                <button className="btn btn-primary" onClick={handleNext}>
                  {currentQ < BUSINESS_QUESTIONS.length - 1 ? <>Next <ArrowRight size={16} /></> : <>Generate Blueprint <Sparkles size={16} /></>}
                </button>
              </div>
            </SlashCard>
          </ThreeDCard>
        )}

        {phase === 'generating' && (
          <ThreeDCard intensity={3}>
            <SlashCard variant="accent" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <Sparkles size={24} style={{ color: 'var(--accent-light)', animation: 'float 2s ease-in-out infinite' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Generating Business Blueprint</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                {BLUEPRINT_SECTIONS.map((s, i) => (
                  <div key={`bp-gen-${s}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', opacity: i <= genStep ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                    {i < genStep ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> :
                     i === genStep ? <Loader2 size={14} style={{ color: 'var(--accent-light)', animation: 'spin 1s linear infinite' }} /> :
                     <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--text-muted)' }} />}
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </SlashCard>
          </ThreeDCard>
        )}

        {phase === 'blueprint' && blueprint && (
          <ThreeDCard intensity={4}>
            <SlashCard variant="accent">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Business Blueprint</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Auto-generated • Fully editable</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)} disabled={!blueprint}>
                    {editing ? 'Done' : <><Edit3 size={14} /> Edit</>}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!blueprint}>
                    <Download size={14} /> Export
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '500px', overflow: 'auto' }}>
                {[
                  { title: 'Executive Summary', field: 'executiveSummary', content: blueprint.executiveSummary },
                  { title: 'Problem', field: 'problem', content: blueprint.problem },
                  { title: 'Solution & USP', field: 'solution', content: blueprint.solution },
                  { title: 'Unique Selling Proposition', field: 'usp', content: blueprint.usp },
                  { title: 'Target Customer', field: 'targetCustomer', content: blueprint.targetCustomer },
                  { title: 'Market Size', field: 'marketSize', content: blueprint.marketSize },
                  { title: 'Competitors & SWOT', field: 'competitors', content: blueprint.competitors },
                  { title: 'Revenue Model', field: 'revenueModel', content: blueprint.revenueModel },
                  { title: 'Risk Analysis', content: (blueprint.risks || []).join('\n') },
                  { title: 'Financial Estimate', content: blueprint.financials ? `Monthly Burn: ${blueprint.financials.monthlyBurn || ''}\nBreakeven: ${blueprint.financials.breakeven || ''}\nProjected MRR: ${blueprint.financials.projectedMRR || ''}` : '' },
                  { title: 'Go-to-Market', field: 'gtmPlan', content: blueprint.gtmPlan },
                  { title: 'Validation Plan', field: 'validationPlan', content: blueprint.validationPlan },
                  { title: 'MVP Plan', field: 'mvpPlan', content: blueprint.mvpPlan },
                  { title: 'Roadmap', content: blueprint.roadmap ? `Q1: ${blueprint.roadmap.q1 || ''}\nQ2: ${blueprint.roadmap.q2 || ''}\nQ3: ${blueprint.roadmap.q3 || ''}\nQ4: ${blueprint.roadmap.q4 || ''}` : '' },
                ].map((sec) => (
                  <div key={`bp-sec-${sec.title}`} style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sec.title}</h4>
                    {editing && sec.field ? (
                      <textarea style={{ width: '100%', minHeight: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9375rem', resize: 'vertical' }}
                        value={sec.content || ''} onChange={e => setBp(prev => ({ ...prev, [sec.field]: e.target.value }))} />
                    ) : (
                      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sec.content || '—'}</p>
                    )}
                  </div>
                ))}
                <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Metrics</h4>
                  {editing ? (
                    <textarea style={{ width: '100%', minHeight: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9375rem', resize: 'vertical' }}
                      value={(blueprint.successMetrics || []).join('\n')} onChange={e => setBp(prev => ({ ...prev, successMetrics: e.target.value.split('\n').filter(Boolean) }))} />
                  ) : (
                    (blueprint.successMetrics || []).map((m) => (
                      <div key={`bpm-${m.slice(0, 20)}`} style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.375rem' }}>✓ {m}</div>
                    ))
                  )}
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: '1.5rem' }}>
                <Sparkles size={18} /> Enter Your Dashboard
              </button>
            </SlashCard>
          </ThreeDCard>
        )}
      </div>
    </div>
  );
}
