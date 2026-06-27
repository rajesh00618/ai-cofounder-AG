import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore } from '../store/founderStore';
import { useBusinessStore } from '../store/businessStore';
import { useTaskStore } from '../store/taskStore';
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
  'MVP Plan', 'Roadmap', 'Financial Estimate', 'Success Metrics'
];

export default function BusinessPlanningPage() {
  const navigate = useNavigate();
  const { profile } = useFounderStore();
  const { setBlueprint, setBusinessHealth, setStartupScore } = useBusinessStore();
  const { addTask, createSprint } = useTaskStore();
  const [phase, setPhase] = useState('questions');
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [_generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [blueprint, setBp] = useState(null);
  const [bpError, setBpError] = useState('');

  const handleAnswer = (id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    if (currentQ < BUSINESS_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      generateBlueprint();
    }
  };

  const generateBlueprint = useCallback(async () => {
    setPhase('generating');
    setGenerating(true);
    for (let i = 0; i < BLUEPRINT_SECTIONS.length; i++) {
      setGenStep(i);
      await delay(200);
    }
    try {
      const bp = await api.generateBlueprint(answers);
      bp.id = generateId();
      bp.createdAt = new Date().toISOString();
      setBp(bp);
      setBlueprint(bp);
      setBusinessHealth({ idea: 50, validation: 50, product: 50, marketing: 50, sales: 50, finance: 50 });
      setStartupScore({ execution: 50, business: 50, customers: 50, product: 50, cash: 50, aiConfidence: 50 });
      const sprintId = createSprint({ goal: 'Initial Validation', deadline: 'This week', week: 1 });
      addTask({ title: 'Interview 5 target customers', priority: 'high', estimatedTime: '2 hrs', aiAssistance: 'AI-assisted', sprintId });
      addTask({ title: 'Build landing page', priority: 'high', estimatedTime: '3 hrs', aiAssistance: 'AI-generated', sprintId });
      addTask({ title: 'Set up analytics tracking', priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'AI-assisted', sprintId });
      addTask({ title: 'Create social media presence', priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'AI-assisted', sprintId });
      addTask({ title: 'Draft pricing page', priority: 'medium', estimatedTime: '45 min', aiAssistance: 'AI-generated', sprintId });
      addTask({ title: 'Competitor deep-dive analysis', priority: 'high', estimatedTime: '1.5 hrs', aiAssistance: 'AI-powered', sprintId });
    } catch (e) {
      setBpError('AI Generation failed: ' + e.message);
      console.error(e);
    }
    setGenerating(false);
    setPhase('blueprint');
  }, [answers, profile]);

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb} />
      <div style={styles.container}>

        {bpError && (
          <div style={{padding:'0.75rem 1rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',color:'var(--color-danger)',fontSize:'0.875rem',marginBottom:'1rem',textAlign:'center'}}>
            {bpError}
          </div>
        )}

        {phase === 'questions' && (
          <div style={styles.card} key={currentQ} className="page-enter">
            <div style={styles.header}>
              <FileText size={20} style={{color:'var(--color-accent-light)'}} />
              <span style={styles.headerLabel}>Business Planning — Question {currentQ + 1}/{BUSINESS_QUESTIONS.length}</span>
            </div>
            <div className="progress-bar" style={{marginBottom:'2rem'}}>
              <div className="progress-bar-fill" style={{width:`${((currentQ+1)/BUSINESS_QUESTIONS.length)*100}%`}} />
            </div>
            <h3 style={styles.question}>{BUSINESS_QUESTIONS[currentQ].q}</h3>
            <textarea
              placeholder={BUSINESS_QUESTIONS[currentQ].placeholder}
              value={answers[BUSINESS_QUESTIONS[currentQ].id] || ''}
              onChange={e => handleAnswer(BUSINESS_QUESTIONS[currentQ].id, e.target.value)}
              style={styles.textarea}
              rows={3}
              autoFocus
            />
            <div style={styles.actions}>
              {currentQ > 0 && <button className="btn btn-ghost" onClick={() => setCurrentQ(currentQ-1)}>Back</button>}
              <button className="btn btn-primary" onClick={handleNext}>
                {currentQ < BUSINESS_QUESTIONS.length - 1 ? <>Next <ArrowRight size={16} /></> : <>Generate Blueprint <Sparkles size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {phase === 'generating' && (
          <div style={styles.card} className="page-enter">
            <div style={styles.genHeader}>
              <Sparkles size={24} style={{color:'var(--color-accent-light)', animation:'float 2s ease-in-out infinite'}} />
              <h2 style={{fontSize:'1.5rem',fontWeight:700}}>Generating Business Blueprint</h2>
            </div>
            <div style={styles.genList}>
              {BLUEPRINT_SECTIONS.map((s, i) => (
                <div key={i} style={{...styles.genItem, opacity: i <= genStep ? 1 : 0.3}}>
                  {i < genStep ? <CheckCircle2 size={14} style={{color:'var(--color-success)'}} /> :
                   i === genStep ? <Loader2 size={14} style={{color:'var(--color-accent-light)',animation:'spin 1s linear infinite'}} /> :
                   <div style={{width:14,height:14,borderRadius:'50%',border:'1px solid var(--color-text-muted)'}} />}
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'blueprint' && blueprint && (
          <div style={styles.card} className="page-enter">
            <div style={styles.bpHeader}>
              <div>
                <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'0.25rem'}}>Business Blueprint</h2>
                <p style={{fontSize:'0.8125rem',color:'var(--color-text-tertiary)'}}>Auto-generated • Fully editable</p>
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <button className="btn btn-secondary btn-sm"><Edit3 size={14} /> Edit</button>
                <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
              </div>
            </div>
            <div style={styles.bpSections}>
              {[
                { title: 'Executive Summary', content: blueprint.executiveSummary },
                { title: 'Problem', content: blueprint.problem },
                { title: 'Solution & USP', content: blueprint.solution },
                { title: 'Target Customer', content: blueprint.targetCustomer },
                { title: 'Market Size', content: blueprint.marketSize },
                { title: 'Competitors', content: blueprint.competitors },
                { title: 'Revenue Model', content: blueprint.revenueModel },
                { title: 'Go-to-Market', content: blueprint.gtmPlan },
                { title: 'Validation Plan', content: blueprint.validationPlan },
                { title: 'MVP Plan', content: blueprint.mvpPlan },
              ].map((sec, i) => (
                <div key={i} style={styles.bpSection}>
                  <h4 style={styles.bpSectionTitle}>{sec.title}</h4>
                  <p style={styles.bpSectionContent}>{sec.content}</p>
                </div>
              ))}
              <div style={styles.bpSection}>
                <h4 style={styles.bpSectionTitle}>Success Metrics</h4>
                {blueprint.successMetrics.map((m, i) => (
                  <div key={i} style={styles.metric}>✓ {m}</div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{width:'100%',marginTop:'1.5rem'}}>
              <Sparkles size={18} /> Enter Your Dashboard
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
  container: { position:'relative', zIndex:1, width:'100%', maxWidth:'750px' },
  card: { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'2.5rem' },
  header: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' },
  headerLabel: { fontSize:'0.8125rem', fontWeight:600, color:'var(--color-text-secondary)' },
  question: { fontSize:'1.375rem', fontWeight:600, marginBottom:'1.5rem', lineHeight:1.3 },
  textarea: { resize:'vertical', minHeight:'80px', fontSize:'1rem', padding:'1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', marginBottom:'1.5rem', width:'100%', color:'var(--color-text-primary)', fontFamily:'inherit' },
  actions: { display:'flex', justifyContent:'space-between' },
  genHeader: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem', justifyContent:'center' },
  genList: { display:'flex', flexDirection:'column', gap:'0.5rem' },
  genItem: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', transition:'opacity 0.3s' },
  bpHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' },
  bpSections: { display:'flex', flexDirection:'column', gap:'1.25rem', maxHeight:'500px', overflow:'auto' },
  bpSection: { padding:'1rem 1.25rem', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)' },
  bpSectionTitle: { fontSize:'0.875rem', fontWeight:600, color:'var(--color-accent-light)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  bpSectionContent: { fontSize:'0.9375rem', color:'var(--color-text-secondary)', lineHeight:1.6 },
  metric: { fontSize:'0.875rem', color:'var(--color-success-light)', marginBottom:'0.375rem' },
};
