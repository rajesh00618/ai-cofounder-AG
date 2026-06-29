import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '../store/businessStore';
import { useTaskStore } from '../store/taskStore';
import { useFounderStore } from '../store/founderStore';
import { Card } from '../components/ui';
import { Sparkles, Edit3, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { delay, generateId } from '../utils/helpers';
import { api } from '../utils/api';

const BLUEPRINT_SECTIONS = [
  'Executive Summary', 'Problem & Solution', 'Target Customer & ICP', 'Market Size',
  'Unique Selling Proposition', 'Competitors & SWOT', 'Revenue Model & Pricing',
  'Business Model Canvas', 'Risk Analysis', 'Go-to-Market Plan', 'Validation Plan',
  'MVP Plan', 'Roadmap', 'Financial Estimate', 'Success Metrics',
];

export default function BusinessPlanningPage() {
  const navigate = useNavigate();
  const { blueprint, setBlueprint, setBusinessHealth, setStartupScore } = useBusinessStore();
  const { addTask, createSprint, setFullPlan } = useTaskStore();
  const { profile } = useFounderStore();
  const [loading, setLoading] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [editing, setEditing] = useState(false);
  const [bp, setBp] = useState(blueprint);
  const [bpError, setBpError] = useState('');

  useEffect(() => {
    if (blueprint) { setBp(blueprint); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setBpError('');
      for (let i = 0; i < BLUEPRINT_SECTIONS.length; i++) { setGenStep(i); await delay(200); if (cancelled) return; }
      try {
        const goalText = profile?.goal || '';
        const clarAnswers = profile?.clarificationAnswers || {};
        const reality = profile?.realityScore || {};
        const context = {
          1: goalText,
          2: Object.values(clarAnswers).join('; '),
          3: `Reality Score: ${reality?.overallScore || 'N/A'} — ${reality?.recommendation || ''}`,
          4: goalText,
          5: `Founder: ${profile?.experienceLevel}, Team: ${profile?.teamStatus}`,
        };
        const result = await api.generateBlueprintFromGoal(context);
        result.id = generateId();
        result.createdAt = new Date().toISOString();
        if (!cancelled) {
          setBp(result);
          setBlueprint(result);
          const scoresRes = await Promise.allSettled([
            api.generateBlueprintScores(context, result, profile),
            api.generateFullPlan(context, result),
          ]);
          const scores = scoresRes[0].status === 'fulfilled' ? scoresRes[0].value : null;
          const plan = scoresRes[1].status === 'fulfilled' ? scoresRes[1].value : null;
          if (scores?.businessHealth && scores?.startupScore) {
            setBusinessHealth(scores.businessHealth);
            setStartupScore(scores.startupScore);
          }
          setFullPlan(plan);
          if (plan?.phases?.length) {
            plan.phases.forEach((phase, idx) => {
              const sprintId = createSprint({ phaseTitle: phase.title, goal: phase.goal || 'Phase ' + (idx + 1), deadline: phase.duration || 'This week', week: idx + 1 });
              if (Array.isArray(phase.tasks)) phase.tasks.forEach(t => addTask({ ...t, sprintId }));
            });
          }
        }
      } catch (e) {
        if (!cancelled) setBpError('Blueprint generation failed: ' + e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [blueprint, profile, setBlueprint, setBusinessHealth, setStartupScore, addTask, createSprint, setFullPlan]);

  const handleExport = () => {
    if (!bp) return;
    const lines = [
      '=== Business Blueprint ===', '',
      `Executive Summary: ${bp.executiveSummary || ''}`, '',
      `Problem: ${bp.problem || ''}`, '',
      `Solution & USP: ${bp.solution || ''}`, '',
      `Target Customer: ${bp.targetCustomer || ''}`, '',
      `Market Size: ${bp.marketSize || ''}`, '',
      `Competitors: ${bp.competitors || ''}`, '',
      `Revenue Model: ${bp.revenueModel || ''}`, '',
      `Go-to-Market: ${bp.gtmPlan || ''}`, '',
      `Validation Plan: ${bp.validationPlan || ''}`, '',
      `MVP Plan: ${bp.mvpPlan || ''}`, '',
      'Success Metrics:', ...(bp.successMetrics || []).map(m => `  ✓ ${m}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `blueprint-${bp.id || 'export'}.txt`;
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '750px' }}>
        {bpError && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {bpError}
          </div>
        )}

        {loading && (
          <Card style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Generating Business Blueprint</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              {BLUEPRINT_SECTIONS.map((s, i) => (
                <div key={`bp-gen-${s}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', opacity: i <= genStep ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                  {i < genStep ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> :
                   i === genStep ? <Loader2 size={14} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} /> :
                   <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--text-muted)' }} />}
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!loading && bp && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Business Blueprint</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Auto-generated • Fully editable</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
                  {editing ? 'Done' : <><Edit3 size={14} /> Edit</>}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '500px', overflow: 'auto' }}>
              {[
                { title: 'Executive Summary', field: 'executiveSummary', content: bp.executiveSummary },
                { title: 'Problem', field: 'problem', content: bp.problem },
                { title: 'Solution & USP', field: 'solution', content: bp.solution },
                { title: 'Unique Selling Proposition', field: 'usp', content: bp.usp },
                { title: 'Target Customer', field: 'targetCustomer', content: bp.targetCustomer },
                { title: 'Market Size', field: 'marketSize', content: bp.marketSize },
                { title: 'Competitors & SWOT', field: 'competitors', content: bp.competitors },
                { title: 'Revenue Model', field: 'revenueModel', content: bp.revenueModel },
                { title: 'Risk Analysis', content: (bp.risks || []).join('\n') },
                { title: 'Financial Estimate', content: bp.financials ? `Monthly Burn: ${bp.financials.monthlyBurn || ''}\nBreakeven: ${bp.financials.breakeven || ''}\nProjected MRR: ${bp.financials.projectedMRR || ''}` : '' },
                { title: 'Go-to-Market', field: 'gtmPlan', content: bp.gtmPlan },
                { title: 'Validation Plan', field: 'validationPlan', content: bp.validationPlan },
                { title: 'MVP Plan', field: 'mvpPlan', content: bp.mvpPlan },
                { title: 'Roadmap', content: bp.roadmap ? `Q1: ${bp.roadmap.q1 || ''}\nQ2: ${bp.roadmap.q2 || ''}\nQ3: ${bp.roadmap.q3 || ''}\nQ4: ${bp.roadmap.q4 || ''}` : '' },
              ].map((sec) => (
                <div key={`bp-sec-${sec.title}`} style={{ padding: '1rem 1.25rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sec.title}</h4>
                  {editing && sec.field ? (
                    <textarea style={{ width: '100%', minHeight: '80px', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9375rem', resize: 'vertical' }}
                      value={sec.content || ''} onChange={e => setBp(prev => ({ ...prev, [sec.field]: e.target.value }))} />
                  ) : (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sec.content || '—'}</p>
                  )}
                </div>
              ))}
              <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Metrics</h4>
                {editing ? (
                  <textarea style={{ width: '100%', minHeight: '80px', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9375rem', resize: 'vertical' }}
                    value={(bp.successMetrics || []).join('\n')} onChange={e => setBp(prev => ({ ...prev, successMetrics: e.target.value.split('\n').filter(Boolean) }))} />
                ) : (
                  (bp.successMetrics || []).map((m) => (
                    <div key={`bpm-${m.slice(0, 20)}`} style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.375rem' }}>✓ {m}</div>
                  ))
                )}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: '1.5rem' }}>
              <Sparkles size={18} /> Enter Your Dashboard
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
