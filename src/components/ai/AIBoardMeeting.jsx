import React, { useState } from 'react';
import { Users, Sparkles, Shield, Swords } from 'lucide-react';
import { delay } from '../../utils/helpers';
import { api } from '../../utils/api';

const SAMPLE_DEBATE = {
  question: 'What should we price our product at?',
  responses: [
    { agent:'CEO AI', icon:'👔', color:'#6366f1', position:'Price at $49/mo — protects margin, signals quality, and positions us as premium in a crowded mid-tier market.' },
    { agent:'Sales AI', icon:'🤝', color:'#10b981', position:'Price at $19/mo — removes friction, gets faster adoption. We can upsell later. Volume beats margin at this stage.' },
    { agent:'Finance AI', icon:'📊', color:'#f59e0b', position:'Price at $29/mo — balances runway with conversion. At $19 we burn cash too fast; at $49 conversion drops 40%.' },
    { agent:'Research AI', icon:'🔬', color:'#06b6d4', position:'Need validation first. Run a Gabor-Granger pricing study with 50 prospects before committing to any price point.' },
    { agent:'CMO AI', icon:'📢', color:'#ec4899', position:'Offer a free tier + $39/mo pro. The free tier is your marketing engine; paid conversion from free averages 4-7% in SaaS.' },
  ]
};

export default function AIBoardMeeting() {
  const [question, setQuestion] = useState('');
  const [debateActive, setDebateActive] = useState(false);
  const [responses, setResponses] = useState([]);
  const [showSample, setShowSample] = useState(true);
  const [investorMode, setInvestorMode] = useState(false);

  const runDebate = async () => {
    if (!question.trim()) return;
    setDebateActive(true);
    setShowSample(false);
    setResponses([]);
    try {
      const data = await api.boardMeeting(question);
      // Animate responses coming in sequentially
      for (const resp of data.responses) {
        await delay(500);
        setResponses(prev => [...prev, { ...resp, question: question }]);
      }
    } catch (err) {
      alert('API Error: ' + err.message);
      setShowSample(true);
    } finally {
      setDebateActive(false);
    }
  };

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><Users size={22} style={{color:'var(--color-accent-light)'}} /> AI Board Meeting</h2>
      <p style={styles.subtitle}>Get diverse perspectives from your AI team on any decision</p>

      {/* Mode Toggle */}
      <div style={styles.modeRow}>
        <button className={`btn ${!investorMode ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setInvestorMode(false)}>
          <Users size={14} /> Board Meeting
        </button>
        <button className={`btn ${investorMode ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setInvestorMode(true)}>
          <Shield size={14} /> Investor Mode
        </button>
      </div>

      {!investorMode ? (
        <>
          {/* Question Input */}
          <div style={styles.inputRow}>
            <input type="text" placeholder="Ask a strategic question (e.g., 'Should we raise funding?')" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runDebate()} style={styles.input} />
            <button className="btn btn-primary" onClick={runDebate} disabled={debateActive || !question.trim()}>
              <Swords size={16} /> Debate
            </button>
          </div>

          {/* Responses */}
          {(showSample ? SAMPLE_DEBATE.responses : responses).map((resp, i) => (
            <div key={i} style={{...styles.responseCard, borderLeftColor: resp.color, animationDelay:`${i*100}ms`}} className="page-enter">
              <div style={styles.respHeader}>
                <span style={{fontSize:'1.5rem'}}>{resp.icon}</span>
                <span style={{fontWeight:600,fontSize:'0.9375rem'}}>{resp.agent}</span>
              </div>
              <p style={styles.respText}>{resp.position}</p>
            </div>
          ))}

          {debateActive && <div style={styles.thinking}><Sparkles size={16} style={{animation:'spin 2s linear infinite',color:'var(--color-accent-light)'}} /> Agents are debating...</div>}

          {(responses.length > 0 || showSample) && (
            <div style={styles.decisionBox}>
              <Sparkles size={16} style={{color:'var(--color-warning)'}} />
              <span style={{fontWeight:600}}>Your decision.</span>
              <span style={{color:'var(--color-text-secondary)',fontSize:'0.875rem'}}>The agents have shared their perspectives. You have the final say.</span>
            </div>
          )}
        </>
      ) : (
        /* Investor Mode */
        <div style={styles.investorCard}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>🏦</div>
            <div>
              <div style={{fontWeight:700,fontSize:'1.125rem'}}>Investor Mode</div>
              <div style={{fontSize:'0.8125rem',color:'var(--color-text-tertiary)'}}>Adversarial analysis — finding every weakness</div>
            </div>
          </div>
          {[
            { q:'Why should I invest?', a:'Your product addresses a growing market but lacks validation data. The AI differentiation is promising but unproven at scale.' },
            { q:'Identified Weaknesses', a:'• No paying customers yet\n• No moat against well-funded competitors\n• Single founder risk\n• Unclear unit economics' },
            { q:'Hard Questions', a:'• What happens when OpenAI builds this feature natively?\n• How do you acquire customers at <$50 CAC?\n• What\'s your 18-month runway without funding?' },
            { q:'Estimated Valuation', a:'Pre-seed: $500K–$1.5M (highly dependent on traction milestones)' },
            { q:'Pitch Rating', a:'5.5/10 — Good problem identification, weak on evidence of solution working' },
          ].map((item, i) => (
            <div key={i} style={styles.investorItem}>
              <h4 style={{fontSize:'0.875rem',fontWeight:600,color:'var(--color-danger-light)',marginBottom:'0.375rem'}}>{item.q}</h4>
              <p style={{fontSize:'0.8125rem',color:'var(--color-text-secondary)',lineHeight:1.6,whiteSpace:'pre-line'}}>{item.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth:'900px' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.25rem' },
  subtitle: { color:'var(--color-text-tertiary)', fontSize:'0.875rem', marginBottom:'1.5rem' },
  modeRow: { display:'flex', gap:'0.5rem', marginBottom:'1.25rem' },
  inputRow: { display:'flex', gap:'0.5rem', marginBottom:'1.5rem' },
  input: { flex:1, padding:'0.75rem 1rem', fontSize:'0.9375rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px' },
  responseCard: { padding:'1.25rem', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid', marginBottom:'0.75rem' },
  respHeader: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' },
  respText: { fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.7 },
  thinking: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'1rem', fontSize:'0.875rem', color:'var(--color-text-secondary)' },
  decisionBox: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'1rem 1.25rem', background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:'14px', marginTop:'0.5rem' },
  investorCard: { padding:'2rem', background:'rgba(239,68,68,0.03)', borderRadius:'16px', border:'1px solid rgba(239,68,68,0.1)' },
  investorItem: { padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', marginBottom:'0.75rem' },
};
