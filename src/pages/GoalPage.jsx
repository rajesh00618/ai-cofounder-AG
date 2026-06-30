import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { useBusinessStore } from '../store/businessStore';
import { useTaskStore } from '../store/taskStore';
import { Card } from '../components/ui';
import { Target, Send, Brain, AlertTriangle, ArrowRight, ArrowLeft, Sparkles, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { getScoreColor, generateId } from '../utils/helpers';
import { api } from '../utils/api';

const PHASES = { WELCOME: 0, GOAL_INPUT: 1, CLARIFYING: 2, REALITY: 3, NEGOTIATION: 4, GENERATING: 5 };

const ThinkingAnimation = React.memo(function ThinkingAnimation({ generating }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!generating) { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [generating]);
  const label = generating ? 'Generating personalized questions' : 'Thinking';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        <span>{label}... ({elapsed}s)</span>
      </div>
    </div>
  );
});

function ConfidenceMeter({ value, reason }) {
  const color = getScoreColor(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginTop: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color, minWidth: '70px' }}>Confidence: {value}%</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{reason}</div>
    </div>
  );
}

const ScoreRadar = React.memo(function ScoreRadar({ scores }) {
  const size = 200, cx = size/2, cy = size/2, r = 70;
  const dims = Object.keys(scores);
  const n = dims.length;
  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const points = dims.map((_, i) => getPoint(i, scores[dims[i]]));
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {[20,40,60,80,100].map(v => {
        const pts = dims.map((d) => getPoint(dims.indexOf(d), v));
        return <polygon key={`sg-${v}`} points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" />;
      })}
      {dims.map((d) => {
        const end = getPoint(dims.indexOf(d), 100);
        return <line key={`sl-${d}`} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="var(--border)" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(196,154,108,0.1)" stroke="var(--accent)" strokeWidth="2" />
      {dims.map((d) => {
        const lp = getPoint(dims.indexOf(d), 120);
        return <text key={`st-${d}`} x={lp.x} y={lp.y} fill="var(--text-tertiary)" fontSize="8" textAnchor="middle" dominantBaseline="middle">{d.split(' ')[0]}</text>;
      })}
    </svg>
  );
}

export default function GoalPage() {
  const navigate = useNavigate();
  const { profile, setGoal, setClarificationAnswers, setRealityScore, setNegotiationResult } = useFounderStore();
  const [phase, setPhase] = useState(PHASES.WELCOME);
  const [goalText, setGoalText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [clarQuestions, setClarQuestions] = useState([]);
  const [clarAnswers, setClarAnswers] = useState({});
  const [clarStep, setClarStep] = useState(0);
  const [reality, setReality] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [clarCustomMode, setClarCustomMode] = useState(false);
  const [clarCustomInput, setClarCustomInput] = useState('');
  const [pageError, setPageError] = useState('');
  const [lastGoalInput, setLastGoalInput] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const clarTimerRef = useRef(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    const unsub = useFounderStore.persist.onFinishHydration(() => setHydrated(true));
    if (useFounderStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);
  useEffect(() => {
    return () => clearTimeout(clarTimerRef.current);
  }, []);
  useEffect(() => { if (hydrated && !profile) navigate('/onboarding'); }, [hydrated, profile, navigate]);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setLastGoalInput(goalText.trim());
    setGoal(goalText.trim());
    setPageError('');
    setGeneratingQuestions(true);
    try {
      const result = await api.chat(
        'Generate 5-7 clarifying questions about this startup goal. For each question, provide 4-6 relevant, specific answer options that make sense for that question. Return ONLY a JSON array of objects with "q" (string) and "opts" (array of strings). Example: [{"q": "Who is your target customer?", "opts": ["Consumers (B2C)", "Small businesses (SMB)", "Enterprise (B2B)", "Developers", "Not sure yet"]}]',
        { goal: goalText }
      );
      let parsed;
      try { parsed = JSON.parse(result.content); } catch { parsed = null; }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setPageError("I couldn't generate good clarifying questions. Try again.");
        setGeneratingQuestions(false); return;
      }
      for (const item of parsed) {
        if (!item.q || !Array.isArray(item.opts) || item.opts.length < 2) {
          setPageError("I couldn't generate good clarifying questions. Try again.");
          setGeneratingQuestions(false); return;
        }
      }
      setClarQuestions(parsed.map((item, i) => ({ id: i + 1, q: item.q.replace(/^\d+[.)]\s*/, ''), opts: item.opts })));
      setGeneratingQuestions(false);
      setPhase(PHASES.CLARIFYING);
    } catch {
      setPageError("I couldn't generate clarifying questions right now. Please try again.");
      setGeneratingQuestions(false);
    }
  };

  const handleClarAnswer = async (qid, answer) => {
    const updated = { ...clarAnswers, [qid]: answer };
    setClarAnswers(updated);
    if (clarStep < clarQuestions.length - 1) {
      clearTimeout(clarTimerRef.current);
      clarTimerRef.current = setTimeout(() => setClarStep(clarStep + 1), 250);
    } else {
      setClarificationAnswers(updated);
      setThinking(true);
      setPageError('');
      try {
        const [realityResult, negResult] = await Promise.all([
          api.evaluateGoal(goalText),
          (async () => {
            try {
              return await api.negotiateGoal(goalText);
            } catch {
              return null;
            }
          })(),
        ]);
        if (!realityResult?.dimensions || realityResult.score === undefined) throw new Error('AI returned incomplete reality assessment');
        const formattedReality = {
          scores: {
            'Market Size': realityResult.dimensions.market,
            'Competition Intensity': realityResult.dimensions.competition,
            'Tech Feasibility': realityResult.dimensions.tech,
            'Customer Access': realityResult.dimensions.customer,
            'Founder Fit': realityResult.dimensions.founder,
            'Revenue Potential': realityResult.dimensions.revenue,
            'Timeline Feasibility': realityResult.dimensions.timing,
            'Execution Complexity': realityResult.dimensions.execution,
          },
          overallScore: realityResult.score,
          probability: `${Math.max(5, realityResult.score - 15)}–${Math.min(95, realityResult.score + 10)}%`,
          risks: realityResult.risks,
          recommendation: realityResult.verdict,
        };
        setReality(formattedReality);
        setRealityScore(formattedReality);
        if (formattedReality.overallScore < 50 && negResult) {
          const formattedNeg = {
            current: { label: goalText, probability: formattedReality.probability, risk: 'Very High' },
            alternatives: negResult.alternatives.map(a => ({
              label: a.title,
              probability: a.probability === 'high' ? '60-80%' : a.probability === 'medium' ? '40-60%' : '20-40%',
              risk: a.probability === 'high' ? 'Low' : a.probability === 'medium' ? 'Medium' : 'High',
            })),
          };
          setNegotiation(formattedNeg);
          setPhase(PHASES.NEGOTIATION);
        } else if (formattedReality.overallScore < 50) {
          setPhase(PHASES.NEGOTIATION);
        } else {
          setPhase(PHASES.REALITY);
        }
      } catch (error) {
        setPageError('Something went wrong. Your answers are saved. Please try again.');
        setPhase(PHASES.CLARIFYING);
      }
      setThinking(false);
    }
  };

  const { setBlueprint, setBusinessHealth, setStartupScore } = useBusinessStore();

  const handleSelectAlternative = (alt) => { setSelectedAlt(alt); setNegotiationResult(alt); };

  const handleProceed = async () => {
    setPhase(PHASES.GENERATING);
    setPageError('');
    try {
      const context = {
        1: goalText,
        2: Object.values(clarAnswers).join('; '),
        3: `Reality Score: ${reality?.overallScore || 'N/A'} — ${reality?.recommendation || ''}`,
        4: selectedAlt?.label || goalText,
        5: `Founder: ${profile?.experienceLevel}, Team: ${profile?.teamStatus}`,
      };
      const bp = await api.generateBlueprintFromGoal(context);
      bp.id = generateId();
      bp.createdAt = new Date().toISOString();
      setBlueprint(bp);

      const results = await Promise.allSettled([
        api.generateBlueprintScores(context, bp, profile),
        api.generateFullPlan(context, bp),
      ]);
      const scores = results[0].status === 'fulfilled' ? results[0].value : null;
      const plan = results[1].status === 'fulfilled' ? results[1].value : null;

      if (results[0].status === 'rejected') {
        setPageError('Score generation encountered an issue. You can recalculate later from the dashboard.');
      }
      if (results[1].status === 'rejected') {
        setPageError(prev => prev + ' Plan generation had an issue. You can generate a plan from the Task Engine later.');
      }

      if (scores?.businessHealth && scores?.startupScore) {
        setBusinessHealth(scores.businessHealth);
        setStartupScore(scores.startupScore);
      }
      const { createSprint, addTask, setFullPlan } = useTaskStore.getState();
      setFullPlan(plan);
      if (plan?.phases?.length) {
        plan.phases.forEach((phase, idx) => {
          const sprintId = createSprint({ phaseTitle: phase.title, goal: phase.goal || 'Phase ' + (idx + 1), deadline: phase.duration || 'This week', week: idx + 1 });
          if (Array.isArray(phase.tasks)) phase.tasks.forEach(t => addTask({ ...t, sprintId }));
        });
      }

      navigate('/dashboard');
    } catch (e) {
      setPageError('We couldn\'t complete your blueprint. Please try again.');
      setPhase(PHASES.NEGOTIATION);
    }
  };

  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        {pageError && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {pageError}
          </div>
        )}

        {phase === PHASES.WELCOME && (
          <Card style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', margin: '0 auto 1.5rem',
            }}>
              <Sparkles size={28} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Hi {profile?.name}.</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '1rem' }}>
              I now understand how you work. You're a {profile?.experienceLevel?.toLowerCase()} founder, working {profile?.teamStatus?.toLowerCase()}, with {profile?.timeAvailable?.toLowerCase()} to spare.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '1rem' }}>
              My job is to help you build your company — honestly, directly, and with full execution support.
            </p>
            <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: '1.5rem' }}>Tell me your biggest goal today.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setPhase(PHASES.GOAL_INPUT)}>
              Let's Go <ArrowRight size={18} />
            </button>
          </Card>
        )}

        {phase === PHASES.GOAL_INPUT && (
          <Card style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', margin: '0 auto 1.25rem',
            }}>
              <Target size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>What's your biggest goal?</h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem', fontSize: '0.875rem' }}>Be specific. E.g. "Earn $1000 in 30 days" or "Launch my MVP in 2 weeks"</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input type="text" placeholder="Enter your goal..." value={goalText} onChange={e => setGoalText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGoalSubmit()} autoFocus />
              <button className="btn btn-primary" onClick={handleGoalSubmit} disabled={!goalText.trim()} style={{ opacity: goalText.trim() ? 1 : 0.4, whiteSpace: 'nowrap' }}>
                <Send size={16} /> Analyze
              </button>
            </div>
          </Card>
        )}

        {(thinking || generatingQuestions) && (
          <Card>
            <ThinkingAnimation generating={generatingQuestions} />
          </Card>
        )}

        {phase === PHASES.CLARIFYING && !thinking && clarQuestions.length > 0 && (
          <Card key={clarCustomMode ? 'clar-custom' : clarStep}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain size={20} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Clarification — Question {clarStep + 1}/{clarQuestions.length}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${((clarStep + 1) / clarQuestions.length) * 100}%` }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>{clarQuestions[clarStep]?.q}</h3>

            {clarCustomMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea placeholder="Type your own answer..." value={clarCustomInput} onChange={e => setClarCustomInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClarAnswer(clarQuestions[clarStep].id, clarCustomInput.trim()); setClarCustomMode(false); setClarCustomInput(''); } }} rows={3} autoFocus />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => { handleClarAnswer(clarQuestions[clarStep].id, clarCustomInput.trim()); setClarCustomMode(false); setClarCustomInput(''); }} disabled={!clarCustomInput.trim()}>
                    <Send size={14} /> Submit
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setClarCustomMode(false); setClarCustomInput(''); }} style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    Back to options
                  </button>
                </div>
              </div>
            ) : (
              <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {clarQuestions[clarStep]?.opts.map((opt) => (
                  <button key={`opt-${opt.slice(0, 15)}`} onClick={() => handleClarAnswer(clarQuestions[clarStep].id, opt)} style={{
                    padding: '0.875rem 1.25rem', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    cursor: 'pointer', textAlign: 'left', fontSize: '0.9375rem', fontWeight: 500,
                    transition: 'all 0.2s', color: 'var(--text)',
                  }}>
                    {opt}
                  </button>
                ))}
                <button onClick={() => setClarCustomMode(true)} style={{
                  padding: '0.875rem 1.25rem',
                  border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
                  cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 500,
                  color: 'var(--accent)', background: 'transparent',
                  marginTop: '0.25rem',
                }}>
                  Type your own answer
                </button>
              </div>
            )}

            {clarStep === 0 && (
              <button className="btn btn-ghost" onClick={() => {
                if (Object.keys(clarAnswers).length > 0) {
                  setShowBackConfirm(true);
                } else {
                  setPhase(PHASES.GOAL_INPUT);
                  setClarAnswers({});
                  setClarStep(0);
                  setPageError('');
                }
              }} style={{ marginTop: '1rem' }}>
                <ArrowLeft size={14} /> Back to goal
              </button>
            )}
          </Card>
        )}

        {phase === PHASES.REALITY && reality && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <Shield size={24} style={{ color: getScoreColor(reality.overallScore) }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Reality Engine Results</h2>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>Goal:</span> {goalText}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(reality.overallScore) }}>{reality.overallScore}%</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Reality Score</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <TrendingUp size={16} /> Success: {reality.probability}
              </div>
            </div>
            <ScoreRadar scores={reality.scores} />
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                <AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> Main Risks
              </h4>
              {(reality.risks || []).map((r) => (
                <div key={`rr-${r.slice(0, 20)}`} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.375rem', paddingLeft: '0.5rem' }}>• {r}</div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '1rem', background: 'var(--accent-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)', marginTop: 2 }} />
              <span><strong>Recommendation:</strong> {reality.recommendation}</span>
            </div>
            <ConfidenceMeter value={Math.min(95, reality.overallScore + Math.floor(reality.overallScore / 15))} reason="Based on founder profile + goal analysis" />
            <button className="btn btn-primary btn-lg" onClick={handleProceed} style={{ marginTop: '1.5rem', width: '100%' }}>
              Generate Blueprint <Sparkles size={18} />
            </button>
          </Card>
        )}

        {phase === PHASES.NEGOTIATION && negotiation && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Let's Be Honest</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, textAlign: 'center' }}>
              Your current goal has a low success probability. Here are better alternatives:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button type="button" onClick={() => handleSelectAlternative(negotiation.current)} style={{
                padding: '1.25rem', background: selectedAlt === negotiation.current ? 'var(--accent-subtle)' : 'var(--bg-card)',
                border: `1px solid ${selectedAlt === negotiation.current ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Current Goal</span>
                  <span className="badge badge-danger">HIGH RISK</span>
                </div>
                <div style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{negotiation.current.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Success: {negotiation.current.probability}</div>
              </button>
              {(negotiation.alternatives || []).map((alt, i) => (
                <button key={`alt-${alt.label?.slice(0, 15) || i}`} type="button" onClick={() => handleSelectAlternative(alt)} style={{
                  padding: '1.25rem', background: selectedAlt === alt ? 'var(--accent-subtle)' : 'var(--bg-card)',
                  border: `1px solid ${selectedAlt === alt ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alternative {String.fromCharCode(65 + i)}</span>
                    <span className={`badge ${alt.risk === 'Low' ? 'badge-success' : 'badge-warning'}`}>{alt.risk} RISK</span>
                  </div>
                  <div style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{alt.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 500 }}>Success: {alt.probability}</div>
                </button>
              ))}
            </div>
            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>You make the final decision. I'm here to inform, not override.</p>
            <button className="btn btn-primary btn-lg" onClick={handleProceed} disabled={!selectedAlt} title={!selectedAlt ? 'Select an alternative first' : ''} style={{ marginTop: '1rem', width: '100%', opacity: selectedAlt ? 1 : 0.4 }}>
              Generate Blueprint <Sparkles size={18} />
            </button>
          </Card>
        )}

        {phase === PHASES.GENERATING && (
          <Card style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Generating Your Blueprint</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Analyzing your goal, answers, and founder profile to build a complete business blueprint...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--accent)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.875rem' }}>This takes about 10 seconds</span>
            </div>
          </Card>
        )}

        {showBackConfirm && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'var(--color-surface)',padding:'2rem',borderRadius:'12px',maxWidth:'400px',textAlign:'center'}}>
              <h3>Go back to your goal?</h3>
              <p style={{margin:'1rem 0',fontSize:'0.9rem',color:'var(--color-text-muted)'}}>
                You will lose your clarifying answers and will need to answer them again.
              </p>
              <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
                <button className="btn btn-ghost" onClick={() => setShowBackConfirm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  setShowBackConfirm(false);
                  setPhase(PHASES.GOAL_INPUT);
                  setClarAnswers({});
                  setClarStep(0);
                  setPageError('');
                }}>Go Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
