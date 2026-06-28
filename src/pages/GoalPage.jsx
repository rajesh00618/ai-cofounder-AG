import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { Target, Send, Brain, AlertTriangle, ArrowRight, ArrowLeft, Sparkles, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { getScoreColor } from '../utils/helpers';
import { api } from '../utils/api';

const PHASES = { WELCOME: 0, GOAL_INPUT: 1, CLARIFYING: 2, REALITY: 3, NEGOTIATION: 4, COMPLETE: 5 };

function ThinkingAnimation({ elapsed, generating }) {
  const label = generating ? 'Generating personalized questions' : 'Thinking';
  return (
    <div style={ts.container}>
      <div style={{...ts.step, opacity:1, color:'var(--color-accent-light)'}}>
        <Loader2 size={14} style={{animation:'spin 1s linear infinite'}} />
        <span>{label}... ({elapsed}s)</span>
      </div>
    </div>
  );
}
const ts = { container:{display:'flex',flexDirection:'column',gap:'0.5rem',padding:'1.5rem',background:'rgba(255,255,255,0.02)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.06)'}, step:{display:'flex',alignItems:'center',gap:'0.5rem',transition:'all 0.3s'} };

function ConfidenceMeter({ value, reason }) {
  const color = getScoreColor(value);
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',background:'rgba(255,255,255,0.02)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)',marginTop:'0.75rem'}}>
      <div style={{fontSize:'0.75rem',fontWeight:700,color,minWidth:'70px'}}>Confidence: {value}%</div>
      <div style={{fontSize:'0.75rem',color:'var(--color-text-tertiary)'}}>{reason}</div>
    </div>
  );
}

function ScoreRadar({ scores }) {
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',margin:'0 auto'}}>
      {[20,40,60,80,100].map(v => {
        const pts = dims.map((d) => getPoint(dims.indexOf(d), v));
        return <polygon key={`sg-${v}`} points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {dims.map((d) => {
        const end = getPoint(dims.indexOf(d), 100);
        return <line key={`sl-${d}`} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(99,102,241,0.15)" stroke="var(--color-accent)" strokeWidth="2" />
      {dims.map((d) => {
        const lp = getPoint(dims.indexOf(d), 120);
        return <text key={`st-${d}`} x={lp.x} y={lp.y} fill="var(--color-text-tertiary)" fontSize="8" textAnchor="middle" dominantBaseline="middle">{d.split(' ')[0]}</text>;
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
  const [elapsed, setElapsed] = useState(0);
  const [lastGoalInput, setLastGoalInput] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useFounderStore.persist.onFinishHydration(() => setHydrated(true));
    if (useFounderStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!thinking && !generatingQuestions) { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [thinking, generatingQuestions]);

  useEffect(() => { if (hydrated && !profile) navigate('/onboarding'); }, [hydrated, profile, navigate]);

  const defaultQuestions = [
    { id: 1, q: 'Who is your target customer?', opts: ['Consumers (B2C)', 'Small businesses (SMB)', 'Enterprise (B2B)', 'Developers', 'Not sure yet'] },
    { id: 2, q: 'What problem are you solving?', opts: ['A personal frustration I experienced', 'A gap I see in the market', 'A request from potential customers', 'An existing problem with no good solution', 'Not fully defined yet'] },
    { id: 3, q: 'How will you make money?', opts: ['Subscription / SaaS', 'One-time purchases', 'Advertising / marketplace', 'Services / consulting', 'Not decided yet'] },
    { id: 4, q: 'What is your biggest challenge right now?', opts: ['Validating the idea', 'Building the product', 'Getting first customers', 'Funding / runway', 'Team / hiring'] },
    { id: 5, q: 'What stage is your startup at?', opts: ['Just an idea', 'Building MVP', 'Launched with users', 'Generating revenue', 'Scaling'] },
  ];

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
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const item of parsed) {
          if (!item.q || !Array.isArray(item.opts) || item.opts.length < 2) {
            parsed = null;
            break;
          }
        }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        setClarQuestions(parsed.map((item, i) =>
          ({ id: i + 1, q: item.q.replace(/^\d+[.)]\s*/, ''), opts: item.opts })
        ));
        setGeneratingQuestions(false);
        setPhase(PHASES.CLARIFYING);
        return;
      }
    } catch {}
    setClarQuestions(defaultQuestions);
    setGeneratingQuestions(false);
    setPhase(PHASES.CLARIFYING);
  };

  const getFallbackReality = (goal) => {
    const base = goal.length > 50 ? 65 : goal.length > 20 ? 55 : 45;
    const hasNumbers = /\d+/.test(goal) ? 10 : 0;
    const hasTimeline = /week|month|day|year/.test(goal) ? 10 : 0;
    const score = Math.min(85, Math.max(20, base + hasNumbers + hasTimeline));
    const dimensions = {
      market: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 15) - 5)),
      competition: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 10) - 10)),
      tech: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 10) - 5)),
      customer: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 15) - 5)),
      founder: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 10))),
      revenue: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 10) - 10)),
      timing: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 15) - 5)),
      execution: Math.min(90, Math.max(10, score + Math.floor(Math.random() * 10) - 5)),
    };
    return {
      scores: {
        'Market Size': dimensions.market,
        'Competition Intensity': dimensions.competition,
        'Tech Feasibility': dimensions.tech,
        'Customer Access': dimensions.customer,
        'Founder Fit': dimensions.founder,
        'Revenue Potential': dimensions.revenue,
        'Timeline Feasibility': dimensions.timing,
        'Execution Complexity': dimensions.execution,
      },
      overallScore: score,
      probability: `${Math.max(5, score - 15)}–${Math.min(95, score + 10)}%`,
      risks: ['Limited data for full AI analysis', 'Score based on goal specificity'],
      recommendation: score >= 50 ? 'Proceed with validation' : 'Refine your goal for better clarity',
    };
  };

  const getFallbackNegotiation = (goal) => ({
    current: { label: goal, probability: '40-60%', risk: 'Medium' },
    alternatives: [
      { label: `Validate ${goal.length > 30 ? goal.slice(0, 30) + '...' : goal} with 10 customer interviews`, probability: '60-80%', risk: 'Low' },
      { label: 'Start with a landing page and measure interest', probability: '70-85%', risk: 'Low' },
      { label: 'Build a no-code MVP in 2 weeks', probability: '50-70%', risk: 'Medium' },
    ],
  });

  const handleClarAnswer = async (qid, answer) => {
    const updated = { ...clarAnswers, [qid]: answer };
    setClarAnswers(updated);
    if (clarStep < clarQuestions.length - 1) {
      setTimeout(() => setClarStep(clarStep + 1), 250);
    } else {
      setClarificationAnswers(updated);
      setThinking(true);
      setPageError('');
      let formattedReality;
      try {
        const realityResult = await api.evaluateGoal(goalText);
        if (!realityResult?.dimensions || realityResult.score === undefined) {
          throw new Error('AI returned incomplete reality assessment');
        }
        formattedReality = {
          scores: {
            'Market Size': realityResult.dimensions.market,
            'Competition Intensity': realityResult.dimensions.competition,
            'Tech Feasibility': realityResult.dimensions.tech,
            'Customer Access': realityResult.dimensions.customer,
            'Founder Fit': realityResult.dimensions.founder,
            'Revenue Potential': realityResult.dimensions.revenue,
            'Timeline Feasibility': realityResult.dimensions.timing,
            'Execution Complexity': realityResult.dimensions.execution
          },
          overallScore: realityResult.score,
          probability: `${Math.max(5, realityResult.score - 15)}–${Math.min(95, realityResult.score + 10)}%`,
          risks: realityResult.risks,
          recommendation: realityResult.verdict
        };
      } catch {
        formattedReality = getFallbackReality(goalText);
      }
      
      setReality(formattedReality);
      setRealityScore(formattedReality);
      
      if (formattedReality.overallScore < 50) {
        let formattedNeg;
        try {
          const neg = await api.negotiateGoal(goalText);
          formattedNeg = {
            current: { label: goalText, probability: formattedReality.probability, risk: 'Very High' },
            alternatives: neg.alternatives.map(a => ({
              label: a.title,
              probability: a.probability === 'high' ? '60-80%' : a.probability === 'medium' ? '40-60%' : '20-40%',
              risk: a.probability === 'high' ? 'Low' : a.probability === 'medium' ? 'Medium' : 'High'
            }))
          };
        } catch {
          formattedNeg = getFallbackNegotiation(goalText);
        }
        setNegotiation(formattedNeg);
        setPhase(PHASES.NEGOTIATION);
      } else {
        setPhase(PHASES.REALITY);
      }
      setThinking(false);
    }
  };



  const handleSelectAlternative = (alt) => {
    setSelectedAlt(alt);
    setNegotiationResult(alt);
  };

  const handleProceed = () => {
    navigate('/business-planning');
  };

  if (!profile) return null;

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb} />
      <div style={styles.container}>

        {/* Phase: Welcome */}
        {phase === PHASES.WELCOME && (
          <div style={styles.card} className="page-enter">
            <div style={styles.aiAvatar}>
              <Sparkles size={28} />
            </div>
            <h2 style={styles.welcomeTitle}>Hi {profile.name}.</h2>
            <p style={styles.welcomeText}>
              I now understand how you work. I know you're a {profile.experienceLevel.toLowerCase()} founder, 
              working {profile.teamStatus.toLowerCase()}, with {profile.timeAvailable.toLowerCase()} to spare.
            </p>
            <p style={styles.welcomeText}>
              My job is to help you build your company — honestly, directly, and with full execution support.
            </p>
            <p style={{...styles.welcomeText, color:'var(--color-accent-light)', fontWeight:500}}>
              Tell me your biggest goal today.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setPhase(PHASES.GOAL_INPUT)} style={{marginTop:'1rem'}}>
              Let's Go <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Error banner */}
        {pageError && (
          <div style={{padding:'0.75rem 1rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',color:'var(--color-danger)',fontSize:'0.875rem',marginBottom:'1rem',textAlign:'center'}}>
            {pageError}
          </div>
        )}

        {/* Phase: Goal Input */}
        {phase === PHASES.GOAL_INPUT && (
          <div style={styles.card} className="page-enter">
            <div style={styles.cardIcon}><Target size={24} /></div>
            <h2 style={styles.cardTitle}>What's your biggest goal?</h2>
            <p style={styles.cardSubtitle}>Be specific. E.g. "Earn $1000 in 30 days" or "Launch my MVP in 2 weeks"</p>
            <div style={styles.inputWrap}>
              <input
                type="text"
                placeholder="Enter your goal..."
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGoalSubmit()}
                style={styles.goalInput}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleGoalSubmit} disabled={!goalText.trim()} style={{opacity:goalText.trim()?1:0.4}}>
                <Send size={16} /> Analyze
              </button>
            </div>
          </div>
        )}

        {/* Phase: Clarifying */}
        {phase === PHASES.CLARIFYING && !thinking && (
          <div style={styles.card} key={clarCustomMode ? 'clar-custom' : clarStep} className="page-enter">
            <div style={styles.clarHeader}>
              <Brain size={20} style={{color:'var(--color-accent-light)'}} />
              <span style={styles.clarLabel}>Clarification Engine — Question {clarStep + 1}/{clarQuestions.length}</span>
            </div>
            <div className="progress-bar" style={{marginBottom:'1.5rem'}}>
              <div className="progress-bar-fill" style={{width:`${((clarStep+1)/clarQuestions.length)*100}%`}} />
            </div>
            <h3 style={styles.clarQuestion}>{clarQuestions[clarStep]?.q}</h3>

            {clarCustomMode ? (
              <div style={styles.clarCustomWrap}>
                <textarea
                  placeholder="Type your own answer..."
                  value={clarCustomInput}
                  onChange={e => setClarCustomInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClarAnswer(clarQuestions[clarStep].id, clarCustomInput.trim()); setClarCustomMode(false); setClarCustomInput(''); } }}
                  style={styles.clarCustomInput}
                  rows={3}
                  autoFocus
                />
                <div style={{display:'flex', gap:'0.5rem', justifyContent:'center'}}>
                  <button className="btn btn-primary" onClick={() => { handleClarAnswer(clarQuestions[clarStep].id, clarCustomInput.trim()); setClarCustomMode(false); setClarCustomInput(''); }} disabled={!clarCustomInput.trim()}>
                    <Send size={14} /> Submit
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setClarCustomMode(false); setClarCustomInput(''); }} style={{fontSize:'0.8125rem', color:'var(--color-text-tertiary)'}}>
                    Back to options
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.clarOptions}>
                {clarQuestions[clarStep]?.opts.map((opt) => (
                  <button key={`opt-${opt.slice(0,15)}`} onClick={() => handleClarAnswer(clarQuestions[clarStep].id, opt)}
                    style={{...styles.clarBtn, animationDelay:`${clarQuestions[clarStep]?.opts.indexOf(opt)*60}ms`}} className="page-enter">
                    {opt}
                  </button>
                ))}
                <button onClick={() => setClarCustomMode(true)}
                  style={{...styles.clarBtn, ...styles.clarCustomOpt}} className="page-enter">
                  ✏️ Type your own answer
                </button>
              </div>
            )}
            {clarStep === 0 && (
              <button className="btn btn-ghost" onClick={() => { setPhase(PHASES.GOAL_INPUT); setGoalText(lastGoalInput || goalText); setPageError(''); setClarCustomMode(false); setClarCustomInput(''); setClarAnswers({}); setClarStep(0); }} style={{marginTop:'1rem'}}>
                <ArrowLeft size={14} /> Back to goal
              </button>
            )}
          </div>
        )}

        {/* Thinking Animation */}
        {(thinking || generatingQuestions) && (
          <div style={styles.card} className="page-enter">
            <ThinkingAnimation elapsed={elapsed} generating={generatingQuestions} />
          </div>
        )}

        {/* Phase: Reality */}
        {phase === PHASES.REALITY && reality && (
          <div style={styles.card} className="page-enter">
            <div style={styles.realityHeader}>
              <Shield size={24} style={{color:getScoreColor(reality.overallScore)}} />
              <h2 style={styles.cardTitle}>Reality Engine Results</h2>
            </div>
            <div style={styles.realityGoal}>
              <span style={styles.goalLabel}>Goal:</span> {goalText}
            </div>
            <div style={styles.scoreSection}>
              <div style={styles.bigScore}>
                <div style={{...styles.bigScoreValue, color: getScoreColor(reality.overallScore)}}>{reality.overallScore}%</div>
                <div style={styles.bigScoreLabel}>Reality Score</div>
              </div>
              <div style={styles.probability}>
                <TrendingUp size={16} />
                <span>Success Probability: {reality.probability}</span>
              </div>
            </div>
            <ScoreRadar scores={reality.scores} />
            <div style={styles.riskSection}>
              <h4 style={styles.riskTitle}><AlertTriangle size={16} style={{color:'var(--color-warning)'}} /> Main Risks</h4>
              {reality.risks.map((r) => (
                <div key={`rr-${r.slice(0,20)}`} style={styles.riskItem}>• {r}</div>
              ))}
            </div>
            <div style={styles.recommendation}>
              <Sparkles size={16} style={{color:'var(--color-accent-light)'}} />
              <span><strong>Recommendation:</strong> {reality.recommendation}</span>
            </div>
            <ConfidenceMeter value={Math.min(95, reality.overallScore + Math.floor(reality.overallScore / 15))} reason="Based on founder profile + goal analysis" />
            <button className="btn btn-primary btn-lg" onClick={handleProceed} style={{marginTop:'1.5rem',width:'100%'}}>
              Continue to Business Planning <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Phase: Negotiation */}
        {phase === PHASES.NEGOTIATION && negotiation && (
          <div style={styles.card} className="page-enter">
            <div style={styles.realityHeader}>
              <AlertTriangle size={24} style={{color:'var(--color-warning)'}} />
              <h2 style={styles.cardTitle}>Let's Be Honest</h2>
            </div>
            <p style={styles.negText}>Your current goal has a low success probability. I'm not going to sugarcoat it — here are better alternatives:</p>
            <div style={styles.altGrid}>
              <button type="button" style={{...styles.altCard, ...(selectedAlt === 'current' ? styles.altSelected : {}), borderColor:'rgba(239,68,68,0.3)'}} onClick={() => handleSelectAlternative('current')} aria-pressed={selectedAlt === 'current'}>
                <div style={styles.altHeader}>
                  <span style={styles.altLabel}>Current Goal</span>
                  <span className="badge badge-danger">HIGH RISK</span>
                </div>
                <div style={styles.altGoal}>{negotiation.current.label}</div>
                <div style={styles.altProb}>Success: {negotiation.current.probability}</div>
              </button>
              {negotiation.alternatives.map((alt, i) => (
                <button type="button" key={`alt-${alt.label?.slice(0,15) || i}`} style={{...styles.altCard, ...(selectedAlt === `alt${i}` ? styles.altSelected : {})}} onClick={() => handleSelectAlternative(`alt${i}`)} aria-pressed={selectedAlt === `alt${i}`}>
                  <div style={styles.altHeader}>
                    <span style={styles.altLabel}>Alternative {String.fromCharCode(65 + i)}</span>
                    <span className={`badge ${alt.risk === 'Low' ? 'badge-success' : 'badge-warning'}`}>{alt.risk} RISK</span>
                  </div>
                  <div style={styles.altGoal}>{alt.label}</div>
                  <div style={{...styles.altProb, color:'var(--color-success-light)'}}>Success: {alt.probability}</div>
                </button>
              ))}
            </div>
            <p style={styles.negNote}>You make the final decision. I'm here to inform, not override.</p>
            <button className="btn btn-primary btn-lg" onClick={handleProceed} disabled={!selectedAlt} style={{marginTop:'1rem',width:'100%',opacity:selectedAlt?1:0.4}}>
              Proceed with Selection <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'2rem' },
  bgOrb: { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)', pointerEvents:'none' },
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:'700px' },
  card: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'2.5rem' },
  aiAvatar: { width:'64px', height:'64px', borderRadius:'20px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', margin:'0 auto 1.5rem', animation:'float 3s ease-in-out infinite' },
  welcomeTitle: { fontSize:'2rem', fontWeight:700, textAlign:'center', marginBottom:'1rem', letterSpacing:'-0.02em' },
  welcomeText: { textAlign:'center', color:'var(--color-text-secondary)', lineHeight:1.7, marginBottom:'0.75rem', fontSize:'1rem' },
  cardIcon: { width:'48px', height:'48px', borderRadius:'14px', background:'var(--color-accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-accent-light)', margin:'0 auto 1.25rem' },
  cardTitle: { fontSize:'1.5rem', fontWeight:700, textAlign:'center', marginBottom:'0.5rem', letterSpacing:'-0.02em' },
  cardSubtitle: { textAlign:'center', color:'var(--color-text-tertiary)', marginBottom:'2rem', fontSize:'0.875rem' },
  inputWrap: { display:'flex', gap:'0.75rem' },
  goalInput: { flex:1, padding:'0.875rem 1rem', fontSize:'1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px' },
  clarHeader: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' },
  clarLabel: { fontSize:'0.8125rem', fontWeight:600, color:'var(--color-text-secondary)' },
  clarQuestion: { fontSize:'1.25rem', fontWeight:600, marginBottom:'1.5rem' },
  clarOptions: { display:'flex', flexDirection:'column', gap:'0.625rem' },
  clarBtn: { padding:'0.875rem 1.25rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', cursor:'pointer', textAlign:'left', fontSize:'0.9375rem', fontWeight:500, transition:'all 0.2s', color:'var(--color-text-primary)' },
  realityHeader: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem', justifyContent:'center' },
  realityGoal: { padding:'0.75rem 1rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px', marginBottom:'1.5rem', fontSize:'0.9375rem' },
  goalLabel: { fontWeight:600, color:'var(--color-text-tertiary)' },
  scoreSection: { display:'flex', alignItems:'center', justifyContent:'center', gap:'2rem', marginBottom:'1.5rem' },
  bigScore: { textAlign:'center' },
  bigScoreValue: { fontSize:'3rem', fontWeight:800 },
  bigScoreLabel: { fontSize:'0.8125rem', color:'var(--color-text-tertiary)', marginTop:'0.25rem' },
  probability: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', background:'rgba(255,255,255,0.03)', borderRadius:'8px', fontSize:'0.875rem', color:'var(--color-text-secondary)' },
  riskSection: { marginTop:'1.5rem' },
  riskTitle: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.9375rem', fontWeight:600, marginBottom:'0.75rem' },
  riskItem: { color:'var(--color-text-secondary)', fontSize:'0.875rem', marginBottom:'0.375rem', paddingLeft:'0.5rem' },
  recommendation: { display:'flex', alignItems:'flex-start', gap:'0.5rem', padding:'1rem', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'12px', marginTop:'1rem', fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.6 },
  negText: { color:'var(--color-text-secondary)', marginBottom:'1.5rem', lineHeight:1.6, textAlign:'center' },
  altGrid: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  altCard: { padding:'1.25rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', cursor:'pointer', transition:'all 0.2s' },
  altSelected: { background:'rgba(99,102,241,0.08)', borderColor:'rgba(99,102,241,0.3)', boxShadow:'0 0 20px rgba(99,102,241,0.1)' },
  altHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' },
  altLabel: { fontWeight:600, fontSize:'0.875rem' },
  altGoal: { fontSize:'0.9375rem', marginBottom:'0.375rem' },
  altProb: { fontSize:'0.8125rem', color:'var(--color-warning-light)', fontWeight:500 },
  negNote: { marginTop:'1rem', textAlign:'center', fontSize:'0.8125rem', color:'var(--color-text-muted)', fontStyle:'italic' },
  clarCustomWrap: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  clarCustomInput: { width:'100%', padding:'0.875rem 1rem', fontSize:'1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', color:'var(--color-text-primary)', outline:'none', resize:'none', fontFamily:'inherit' },
  clarCustomOpt: { borderStyle:'dashed', color:'var(--color-accent-light)', justifyContent:'center', gap:'0.5rem', marginTop:'0.25rem' },
};
