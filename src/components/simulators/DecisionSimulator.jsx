import React, { useState, useEffect } from 'react';
import { Beaker, TrendingUp, AlertTriangle, Sparkles, Users, MessageSquare, Loader2 } from 'lucide-react';
import { getScoreColor } from '../../utils/helpers';
import { useBusinessStore } from '../../store/businessStore';
import { api } from '../../utils/api';

const CUSTOMER_PERSONAS = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'ceo', label: 'CEO/Executive', icon: '👔' },
  { id: 'developer', label: 'Developer', icon: '💻' },
  { id: 'teacher', label: 'Teacher', icon: '📚' },
  { id: 'doctor', label: 'Doctor', icon: '🏥' },
];

export default function DecisionSimulator() {
  const { businessHealth, blueprint } = useBusinessStore();
  const [question, setQuestion] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('decision');
  const [selectedPersona, setSelectedPersona] = useState('student');
  const [customerResult, setCustomerResult] = useState(null);
  const [failureData, setFailureData] = useState(null);
  const [failureLoading, setFailureLoading] = useState(false);

  const runSimulation = async () => {
    if (!question.trim()) return;
    setSimulating(true);
    try {
      const data = await api.simulateDecision(question);
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setSimulating(false);
  };

  const runCompanySim = async () => {
    if (!question.trim()) return;
    setSimulating(true);
    try {
      const data = await api.simulateCompany(question);
      data.isCompanySim = true;
      setResult(data);
    } catch (e) {
      setResult({ error: e.message, isCompanySim: true });
    }
    setSimulating(false);
  };

  useEffect(() => {
    if (tab === 'failure') {
      setFailureLoading(true);
      api.getFailurePrediction({ businessHealth, blueprint })
        .then(data => setFailureData(data))
        .catch(e => setFailureData({ error: e.message }))
        .finally(() => setFailureLoading(false));
    }
  }, [tab, businessHealth, blueprint]);

  const runCustomerSim = async () => {
    if (!question.trim()) return;
    setSimulating(true);
    try {
      const data = await api.simulateCustomer(question, selectedPersona);
      setCustomerResult(data);
    } catch (e) {
      setCustomerResult({ error: e.message });
    }
    setSimulating(false);
  };

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Beaker size={22} style={{color:'var(--color-accent-light)'}} /> Simulator</h2>
      <p style={styles.subtitle}>Test decisions before committing — play the future first</p>

      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(tab==='decision'?styles.tabActive:{})}} onClick={()=>{setTab('decision');setResult(null);setCustomerResult(null);}}>
          <TrendingUp size={14} /> Decision Simulator
        </button>
        <button style={{...styles.tab, ...(tab==='company'?styles.tabActive:{})}} onClick={()=>{setTab('company');setResult(null);setCustomerResult(null);}}>
          <Users size={14} /> Company Simulator
        </button>
        <button style={{...styles.tab, ...(tab==='customer'?styles.tabActive:{})}} onClick={()=>{setTab('customer');setResult(null);setCustomerResult(null);}}>
          <MessageSquare size={14} /> Customer Simulator
        </button>
        <button style={{...styles.tab, ...(tab==='failure'?styles.tabActive:{})}} onClick={()=>{setTab('failure');setResult(null);setCustomerResult(null);}}>
          <AlertTriangle size={14} /> Failure Prediction
        </button>
      </div>

      {(tab === 'decision' || tab === 'company' || tab === 'customer') && (
        <div style={styles.inputRow}>
          <input type="text" placeholder={
            tab === 'decision' ? 'Describe your decision (e.g., "Should I build a mobile app?")' :
            tab === 'company' ? 'What decision to simulate? (e.g., "Launch at $29/mo pricing")' :
            'Describe your product (e.g., "AI-powered project management tool")'
          } value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(tab==='decision'?runSimulation():tab==='company'?runCompanySim():runCustomerSim())} style={styles.input} />
          <button className="btn btn-primary" onClick={tab==='decision'?runSimulation:tab==='company'?runCompanySim:runCustomerSim} disabled={simulating || !question.trim()}>
            <Beaker size={16} /> Simulate
          </button>
        </div>
      )}

      {tab === 'customer' && (
        <div style={styles.personaRow}>
          {CUSTOMER_PERSONAS.map(p => (
            <button key={p.id} onClick={()=>setSelectedPersona(p.id)} style={{...styles.personaBtn, ...(selectedPersona===p.id?styles.personaActive:{})}}>
              <span style={{fontSize:'1.25rem'}}>{p.icon}</span>
              <span style={{fontSize:'0.75rem'}}>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {simulating && (
        <div style={styles.simulating}>
          <div style={styles.simDots}><span style={styles.simDot}/><span style={{...styles.simDot,animationDelay:'0.2s'}}/><span style={{...styles.simDot,animationDelay:'0.4s'}}/></div>
          <span>{tab === 'company' ? 'Running 1,000 virtual customers through simulation...' : tab === 'customer' ? 'Role-playing customer persona...' : 'Modeling scenarios...'}</span>
        </div>
      )}

      {result && !result.isCompanySim && tab === 'decision' && (
        <div className="page-enter">
          {result.scenarios.map((s) => (
            <div key={`sc-${s.label}`} style={{...styles.scenarioCard, borderLeftColor:getScoreColor(s.success)}}>
              <div style={styles.scenarioHeader}>
                <span style={{fontWeight:600}}>{s.label}</span>
                <span className={`badge ${s.risk==='High'?'badge-danger':s.risk==='Medium'?'badge-warning':'badge-success'}`}>{s.risk} Risk</span>
              </div>
              <div style={styles.scenarioMeta}>
                <span>Timeline: {s.timeline}</span>
                <span style={{fontWeight:600,color:getScoreColor(s.success)}}>Success: {s.success}%</span>
              </div>
              <div className="progress-bar" style={{height:'4px',marginTop:'0.5rem'}}>
                <div className="progress-bar-fill" style={{width:`${s.success}%`,background:getScoreColor(s.success)}} />
              </div>
            </div>
          ))}
          <div style={styles.recommendCard}>
            <Sparkles size={16} style={{color:'var(--color-accent-light)'}} />
            <span><strong>Recommendation:</strong> Go with {result.recommendation}</span>
          </div>
        </div>
      )}

      {result && result.isCompanySim && tab === 'company' && (
        <div className="page-enter">
          <div style={styles.companyResult}>
            <h3 style={{fontWeight:600,marginBottom:'1rem'}}>Simulation Results — {result.virtualCustomers} Virtual Customers</h3>
            <div style={styles.metricGrid}>
              {[{l:'Conversion',v:result.conversion},{l:'Projected Revenue',v:result.projectedRevenue},{l:'Retention',v:result.retention}].map(m => (
                <div key={`met-${m.l}`} style={styles.metricCard}>
                  <div style={{fontSize:'0.6875rem',color:'var(--color-text-muted)',textTransform:'uppercase'}}>{m.l}</div>
                  <div style={{fontSize:'1.5rem',fontWeight:700,color:'var(--color-accent-light)'}}>{m.v}</div>
                </div>
              ))}
            </div>
            <h4 style={{fontWeight:600,fontSize:'0.875rem',marginTop:'1rem',marginBottom:'0.5rem'}}>Likely Complaints</h4>
            {result.complaints.map((c) => <div key={`cmp-${c.slice(0,20)}`} style={{fontSize:'0.8125rem',color:'var(--color-warning-light)',marginBottom:'0.25rem'}}>⚠ {c}</div>)}
            <div style={{...styles.recommendCard,marginTop:'1rem'}}>
              <Sparkles size={16} style={{color:'var(--color-accent-light)'}} />
              <span>{result.recommendation}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'customer' && customerResult && (
        <div className="page-enter">
          <div style={styles.customerCard}>
            <div style={styles.customerHeader}>
              <span style={{fontSize:'2rem'}}>{CUSTOMER_PERSONAS.find(p=>p.id===selectedPersona)?.icon}</span>
              <div>
                <div style={{fontWeight:600,fontSize:'1rem'}}>{customerResult.persona?.name || CUSTOMER_PERSONAS.find(p=>p.id===selectedPersona)?.label}</div>
                <div style={{fontSize:'0.75rem',color:'var(--color-text-tertiary)'}}>Customer Persona Simulation</div>
              </div>
            </div>
            <div style={styles.reactionBubble}>
              <MessageSquare size={16} style={{color:'var(--color-accent-light)'}} />
              <span>{customerResult.reaction}</span>
            </div>
            {customerResult.objections && customerResult.objections.length > 0 && (
              <>
                <h4 style={{fontWeight:600,fontSize:'0.875rem',marginBottom:'0.5rem',marginTop:'1rem'}}>Likely Objections</h4>
                {customerResult.objections.map((o) => (
                  <div key={`obj-${o.slice(0,20)}`} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.8125rem',color:'var(--color-warning-light)',marginBottom:'0.375rem'}}>
                    <AlertTriangle size={12} /> {o}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'failure' && (
        <div style={styles.failureCard} className="page-enter">
          {failureLoading ? (
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'1rem 0'}}>
              <Loader2 size={14} style={{animation:'spin 1s linear infinite'}} />
              <span style={{fontSize:'0.8125rem',color:'var(--color-text-tertiary)'}}>Analyzing failure risk...</span>
            </div>
          ) : failureData ? (
            <>
              <div style={styles.failureHeader}>
                <AlertTriangle size={32} style={{color:'var(--color-warning)'}} />
                <div>
                  <div style={{fontSize:'2rem',fontWeight:800,color:'var(--color-warning)'}}>{failureData.failureProbability}%</div>
                  <div style={{fontSize:'0.875rem',color:'var(--color-text-tertiary)'}}>Current failure probability</div>
                </div>
              </div>
              <h4 style={{fontWeight:600,marginBottom:'0.75rem'}}>Your startup currently has an elevated failure risk because:</h4>
              {(failureData.topRisks || []).map((r) => (
                <div key={`risk-${r.risk?.slice(0,20) || Math.random()}`} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem',fontSize:'0.875rem',color:'var(--color-text-secondary)'}}>
                  <AlertTriangle size={14} style={{color:'var(--color-danger)'}} /> {r.risk}
                </div>
              ))}
              <div style={{...styles.recommendCard,marginTop:'1rem'}}>
                <Sparkles size={16} style={{color:'var(--color-success)'}} />
                <span><strong>{failureData.recommendation}</strong></span>
              </div>
            </>
          ) : (
            <div style={{padding:'1rem 0',fontSize:'0.8125rem',color:'var(--color-text-tertiary)'}}>
              Unable to load failure prediction. Provide business context first.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth:'900px' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.25rem' },
  subtitle: { color:'var(--color-text-tertiary)', fontSize:'0.875rem', marginBottom:'1.5rem' },
  tabs: { display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' },
  tab: { display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 1rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', fontSize:'0.8125rem', color:'var(--color-text-secondary)', cursor:'pointer' },
  tabActive: { background:'rgba(99,102,241,0.1)', borderColor:'rgba(99,102,241,0.3)', color:'var(--color-accent-light)' },
  inputRow: { display:'flex', gap:'0.5rem', marginBottom:'0.75rem' },
  input: { flex:1, padding:'0.75rem 1rem', fontSize:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px' },
  personaRow: { display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' },
  personaBtn: { display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem', padding:'0.75rem 1.25rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', cursor:'pointer', transition:'all 0.2s' },
  personaActive: { background:'rgba(99,102,241,0.1)', borderColor:'rgba(99,102,241,0.3)' },
  simulating: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'1.5rem', color:'var(--color-text-secondary)', fontSize:'0.875rem' },
  simDots: { display:'flex', gap:'0.25rem' },
  simDot: { width:'8px', height:'8px', borderRadius:'50%', background:'var(--color-accent)', animation:'pulse 1.5s ease-in-out infinite' },
  scenarioCard: { padding:'1.25rem', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid', marginBottom:'0.75rem' },
  scenarioHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' },
  scenarioMeta: { display:'flex', gap:'1rem', fontSize:'0.8125rem', color:'var(--color-text-secondary)' },
  recommendCard: { display:'flex', alignItems:'flex-start', gap:'0.5rem', padding:'1rem', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'12px', fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.6, marginTop:'1rem' },
  companyResult: { padding:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' },
  metricGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' },
  metricCard: { padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', textAlign:'center' },
  customerCard: { padding:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' },
  customerHeader: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' },
  reactionBubble: { display:'flex', gap:'0.75rem', padding:'1rem', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.1)', borderRadius:'14px', fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.6 },
  failureCard: { padding:'2rem', background:'rgba(245,158,11,0.03)', borderRadius:'16px', border:'1px solid rgba(245,158,11,0.1)' },
  failureHeader: { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' },
};
