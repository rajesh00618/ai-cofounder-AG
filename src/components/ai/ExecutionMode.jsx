import React, { useState, useRef, useEffect } from 'react';
import { Zap, CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { delay } from '../../utils/helpers';
import { api } from '../../utils/api';

const EXECUTION_EXAMPLES = [
  { label: 'Build landing page', task: 'Build a landing page for my startup' },
  { label: 'Research competitors', task: 'Research my top 5 competitors' },
  { label: 'Generate business plan', task: 'Generate a complete business plan' },
  { label: 'Draft pitch deck', task: 'Draft an investor pitch deck' },
];

export default function ExecutionMode() {
  const [task, setTask] = useState('');
  const [active, setActive] = useState(false);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepOutputs, setStepOutputs] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleExecute = async () => {
    if (!task.trim()) return;
    setActive(true);
    setCompleted(false);
    setError(null);
    setCurrentStep(-1);
    setStepOutputs([]);

    try {
      const executionPlan = await api.getExecutionPlan(task);
      if (!mountedRef.current) return;
      if (!executionPlan?.plan?.steps || !Array.isArray(executionPlan.plan.steps)) {
        throw new Error('AI returned an incomplete execution plan. Try a more specific task.');
      }
      setPlan(executionPlan);

      for (let i = 0; i < executionPlan.plan.steps.length; i++) {
        if (!mountedRef.current) return;
        setCurrentStep(i);
        await delay(800 + Math.random() * 600);
        if (!mountedRef.current) return;
        const result = await api.executeStep(i + 1, task);
        if (!mountedRef.current) return;
        setStepOutputs(prev => [...prev, { step: i + 1, output: result?.output || 'Step completed (no detailed output)' }]);
      }

      if (mountedRef.current) setCompleted(true);
    } catch (err) {
      if (mountedRef.current) setError('Execution failed. Please try a different task or try again.');
    }
    if (mountedRef.current) setActive(false);
  };

    return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Zap size={22} style={{color:'var(--color-warning)'}} /> Execution Mode</h2>
      <p style={styles.subtitle}>AI executes tasks autonomously — not just advises, but builds</p>

      <div style={styles.inputRow}>
        <input type="text" placeholder="Tell the AI what to build (e.g., 'Build my landing page')" value={task} onChange={e => setTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleExecute()} style={styles.input} disabled={active} />
        <button className="btn btn-primary" onClick={handleExecute} disabled={active || !task.trim()}>
          <Zap size={16} /> Execute
        </button>
      </div>

      <div style={styles.examples}>
        {EXECUTION_EXAMPLES.map(ex => (
          <button key={ex.label} style={styles.exampleBtn} onClick={() => setTask(ex.task)} disabled={active}>
            {ex.label}
          </button>
        ))}
      </div>

      {plan && (
        <div style={styles.planCard}>
          <div style={styles.planHeader}>
            <span style={{fontWeight:600}}>Execution Plan</span>
            <span className="badge badge-accent"><Clock size={10} /> {plan.plan.estimatedTime}</span>
          </div>
          <div style={styles.steps}>
            {plan.plan.steps.map((step, i) => (
              <div key={step.id} style={{
                ...styles.step,
                opacity: i <= currentStep ? 1 : 0.4,
                borderColor: i < currentStep ? 'var(--color-success)' : i === currentStep ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                background: i < currentStep ? 'rgba(16,185,129,0.05)' : i === currentStep ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)'
              }}>
                <div style={styles.stepLeft}>
                  {i < currentStep ? <CheckCircle2 size={18} style={{color:'var(--color-success)'}} /> :
                   i === currentStep ? <Loader2 size={18} style={{color:'var(--color-accent)',animation:'spin 1s linear infinite'}} /> :
                   <div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.15)'}} />}
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.875rem'}}>{step.label}</div>
                    {i === currentStep && stepOutputs[i] && <div style={{fontSize:'0.75rem',color:'var(--color-accent-light)'}}>Running...</div>}
                    {i < currentStep && stepOutputs[i] && <div style={{fontSize:'0.75rem',color:'var(--color-success-light)'}}>Complete</div>}
                  </div>
                </div>
                <span style={{fontSize:'0.75rem',color:'var(--color-text-muted)'}}>{step.duration}</span>
              </div>
            ))}
          </div>

          {completed && (
            <div style={styles.completeBanner}>
              <CheckCircle2 size={20} style={{color:'var(--color-success)'}} />
              <div>
                <div style={{fontWeight:600}}>Execution Complete</div>
                <div style={{fontSize:'0.8125rem',color:'var(--color-text-secondary)'}}>All steps completed successfully. Review the outputs above.</div>
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorBanner}>
              <AlertTriangle size={20} style={{color:'var(--color-danger)'}} />
              <div>
                <div style={{fontWeight:600}}>Execution Error</div>
                <div style={{fontSize:'0.8125rem',color:'var(--color-text-secondary)'}}>{error}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!plan && !active && (
        <div style={styles.emptyCard}>
          <Zap size={48} style={{opacity:0.2,marginBottom:'1rem'}} />
          <p style={{fontSize:'1rem',fontWeight:500,marginBottom:'0.5rem'}}>What should the AI build for you?</p>
          <p style={{fontSize:'0.875rem',color:'var(--color-text-tertiary)'}}>Describe any task — the AI will research, code, test, and deploy autonomously.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth:'800px' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.25rem' },
  subtitle: { color:'var(--color-text-tertiary)', fontSize:'0.875rem', marginBottom:'1.5rem' },
  inputRow: { display:'flex', gap:'0.5rem', marginBottom:'0.75rem' },
  input: { flex:1, padding:'0.75rem 1rem', fontSize:'0.875rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px' },
  examples: { display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' },
  exampleBtn: { padding:'0.375rem 0.875rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', fontSize:'0.75rem', color:'var(--color-text-secondary)', cursor:'pointer', transition:'all 0.2s' },
  planCard: { padding:'1.5rem', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' },
  planHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' },
  steps: { display:'flex', flexDirection:'column', gap:'0.625rem' },
  step: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.875rem 1rem', borderRadius:'12px', border:'1px solid', transition:'all 0.3s' },
  stepLeft: { display:'flex', alignItems:'center', gap:'0.75rem' },
  completeBanner: { display:'flex', gap:'0.75rem', padding:'1rem', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'12px', marginTop:'1rem' },
  errorBanner: { display:'flex', gap:'0.75rem', padding:'1rem', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'12px', marginTop:'1rem' },
  emptyCard: { textAlign:'center', padding:'4rem 2rem', color:'var(--color-text-muted)' },
};
