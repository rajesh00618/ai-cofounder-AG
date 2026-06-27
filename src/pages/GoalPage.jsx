import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { Target, Send, Brain, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, TrendingUp, Shield, Loader2, PenSquare } from 'lucide-react';
import { delay, getScoreColor, randomBetween } from '../utils/helpers';
import { api } from '../utils/api';

const PHASES = { WELCOME: 0, GOAL_INPUT: 1, CLARIFYING: 2, REALITY: 3, NEGOTIATION: 4, COMPLETE: 5 };

function ThinkingAnimation({ steps, currentStep }) {
  return (
    <div style={ts.container}>
      {steps.map((s, i) => (
        <div key={i} style={{...ts.step, opacity: i <= currentStep ? 1 : 0.3, color: i === currentStep ? 'var(--color-accent-light)' : i < currentStep ? 'var(--color-success-light)' : 'var(--color-text-muted)'}}>
          {i < currentStep ? <CheckCircle2 size={14} /> : i === currentStep ? <Loader2 size={14} style={{animation:'spin 1s linear infinite'}} /> : <div style={{width:14,height:14,borderRadius:'50%',border:'1px solid var(--color-text-muted)'}} />}
          <span style={{fontSize:'0.8125rem'}}>{s}</span>
        </div>
      ))}
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
        const pts = dims.map((_, i) => getPoint(i, v));
        return <polygon key={v} points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {dims.map((_, i) => {
        const end = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(99,102,241,0.15)" stroke="var(--color-accent)" strokeWidth="2" />
      {dims.map((d, i) => {
        const lp = getPoint(i, 120);
        return <text key={i} x={lp.x} y={lp.y} fill="var(--color-text-tertiary)" fontSize="8" textAnchor="middle" dominantBaseline="middle">{d.split(' ')[0]}</text>;
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
  const [thinkStep, setThinkStep] = useState(0);
  const [clarQuestions, setClarQuestions] = useState([]);
  const [clarAnswers, setClarAnswers] = useState({});
  const [clarStep, setClarStep] = useState(0);
  const [reality, setReality] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [clarCustomMode, setClarCustomMode] = useState(false);
  const [clarCustomInput, setClarCustomInput] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => { if (!profile) navigate('/onboarding'); }, [profile, navigate]);

  const thinkSteps = ['Thinking...', 'Checking Memory...', 'Analyzing Goal...', 'Running Reality Engine...', 'Done.'];

  const runThinking = useCallback(async (cb) => {
    setThinking(true);
    for (let i = 0; i < thinkSteps.length; i++) {
      setThinkStep(i);
      await delay(600 + Math.random() * 400);
    }
    await delay(300);
    setThinking(false);
    cb();
  }, []);

  const handleGoalSubmit = () => {
    if (!goalText.trim()) return;
    setGoal(goalText.trim());
    const questions = generateClarQuestions(goalText);
    setClarQuestions(questions);
    runThinking(() => setPhase(PHASES.CLARIFYING));
  };

  const generateClarQuestions = (goal) => {
    const gl = goal.toLowerCase();
    const qs = [];
    if (gl.includes('revenue') || gl.includes('$') || gl.includes('earn') || gl.includes('money')) {
      qs.push({ id: 1, q: 'How will you earn it?', opts: ['SaaS', 'AI Agency', 'Freelancing', 'AI Product', 'E-commerce', 'Not sure'] });
      qs.push({ id: 2, q: 'Current stage?', opts: ['Idea', 'Prototype/MVP', 'Existing product', 'Nothing yet'] });
      qs.push({ id: 3, q: 'Daily available time?', opts: ['2 hrs', '4 hrs', '8 hrs', 'Full-time'] });
      qs.push({ id: 4, q: 'Budget available?', opts: ['$0', 'Under $100', 'Under $1000', 'More'] });
      qs.push({ id: 5, q: 'Strongest skill?', opts: ['AI/Programming', 'Sales', 'Marketing', 'Design', 'Product Management'] });
    } else if (gl.includes('launch') || gl.includes('build') || gl.includes('mvp') || gl.includes('app')) {
      qs.push({ id: 1, q: 'What are you building?', opts: ['Web App', 'Mobile App', 'SaaS Platform', 'API/Tool', 'Marketplace', 'Other'] });
      qs.push({ id: 2, q: 'Target customer?', opts: ['Consumers (B2C)', 'Small Business (SMB)', 'Enterprise (B2B)', 'Developers', 'Not sure'] });
      qs.push({ id: 3, q: 'Technical capability?', opts: ['Can code', 'Some coding', 'No-code tools', 'Need a developer'] });
      qs.push({ id: 4, q: 'Timeline goal?', opts: ['2 weeks', '1 month', '3 months', '6 months'] });
      qs.push({ id: 5, q: 'Have you validated the idea?', opts: ['Yes, with paying users', 'Talked to users', 'Only research', 'No validation'] });
    } else {
      qs.push({ id: 1, q: 'What industry/niche?', opts: ['Tech/SaaS', 'AI/ML', 'E-commerce', 'Education', 'Health', 'Finance', 'Other'] });
      qs.push({ id: 2, q: 'Who is your target customer?', opts: ['Consumers', 'Small businesses', 'Enterprise', 'Developers', 'Not sure'] });
      qs.push({ id: 3, q: 'What\'s your budget?', opts: ['$0', 'Under $500', 'Under $5000', 'More'] });
      qs.push({ id: 4, q: 'Timeline?', opts: ['1 month', '3 months', '6 months', '1 year'] });
      qs.push({ id: 5, q: 'Strongest skill?', opts: ['Technical', 'Sales', 'Marketing', 'Design', 'Domain expertise'] });
    }
    return qs;
  };

  const handleClarAnswer = (qid, answer) => {
    const updated = { ...clarAnswers, [qid]: answer };
    setClarAnswers(updated);
    if (clarStep < clarQuestions.length - 1) {
      setTimeout(() => setClarStep(clarStep + 1), 250);
    } else {
      setClarificationAnswers(updated);
      runThinking(async () => {
        try {
          const realityResult = await api.evaluateGoal(goalText);
          const formattedReality = {
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
          
          setReality(formattedReality);
          setRealityScore(formattedReality);
          
          if (formattedReality.overallScore < 50) {
            const neg = await api.negotiateGoal(goalText);
            const formattedNeg = {
              current: { label: goalText, probability: formattedReality.probability, risk: 'Very High' },
              alternatives: neg.alternatives.map(a => ({
                label: a.title,
                probability: a.probability === 'high' ? '60-80%' : a.probability === 'medium' ? '40-60%' : '20-40%',
                risk: a.probability === 'high' ? 'Low' : a.probability === 'medium' ? 'Medium' : 'High'
              }))
            };
            setNegotiation(formattedNeg);
            setPhase(PHASES.NEGOTIATION);
          } else {
            setPhase(PHASES.REALITY);
          }
        } catch (error) {
          console.error(error);
          setPageError('API Error: ' + error.message);
          setPhase(PHASES.GOAL_INPUT);
        }
      });
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
                {clarQuestions[clarStep]?.opts.map((opt, i) => (
                  <button key={i} onClick={() => handleClarAnswer(clarQuestions[clarStep].id, opt)}
                    style={{...styles.clarBtn, animationDelay:`${i*60}ms`}} className="page-enter">
                    {opt}
                  </button>
                ))}
                <button onClick={() => setClarCustomMode(true)}
                  style={{...styles.clarBtn, ...styles.clarCustomOpt}} className="page-enter">
                  ✏️ Type your own answer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Thinking Animation */}
        {thinking && (
          <div style={styles.card} className="page-enter">
            <ThinkingAnimation steps={thinkSteps} currentStep={thinkStep} />
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
              {reality.risks.map((r, i) => (
                <div key={i} style={styles.riskItem}>• {r}</div>
              ))}
            </div>
            <div style={styles.recommendation}>
              <Sparkles size={16} style={{color:'var(--color-accent-light)'}} />
              <span><strong>Recommendation:</strong> {reality.recommendation}</span>
            </div>
            <ConfidenceMeter value={Math.min(95, reality.overallScore + randomBetween(5, 15))} reason="Based on founder profile + goal analysis" />
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
              <div style={{...styles.altCard, ...(selectedAlt === 'current' ? styles.altSelected : {}), borderColor:'rgba(239,68,68,0.3)'}} onClick={() => handleSelectAlternative('current')}>
                <div style={styles.altHeader}>
                  <span style={styles.altLabel}>Current Goal</span>
                  <span className="badge badge-danger">HIGH RISK</span>
                </div>
                <div style={styles.altGoal}>{negotiation.current.label}</div>
                <div style={styles.altProb}>Success: {negotiation.current.probability}</div>
              </div>
              {negotiation.alternatives.map((alt, i) => (
                <div key={i} style={{...styles.altCard, ...(selectedAlt === `alt${i}` ? styles.altSelected : {})}} onClick={() => handleSelectAlternative(`alt${i}`)}>
                  <div style={styles.altHeader}>
                    <span style={styles.altLabel}>Alternative {String.fromCharCode(65 + i)}</span>
                    <span className={`badge ${alt.risk === 'Low' ? 'badge-success' : 'badge-warning'}`}>{alt.risk} RISK</span>
                  </div>
                  <div style={styles.altGoal}>{alt.label}</div>
                  <div style={{...styles.altProb, color:'var(--color-success-light)'}}>Success: {alt.probability}</div>
                </div>
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
