import React, { useState } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { FileText, Edit3, Download, Save } from 'lucide-react';

export default function BusinessBlueprint() {
  const { blueprint, updateBlueprint } = useBusinessStore();
  const [editing, setEditing] = useState(false);

  if (!blueprint) {
    return (
      <div style={styles.page} className="page-enter">
        <h2 style={styles.title}><FileText size={22} style={{color:'var(--color-accent-light)'}} /> Business Workspace</h2>
        <div style={styles.empty}>
          <FileText size={48} style={{opacity:0.2,marginBottom:'1rem'}} />
          <p>No business blueprint generated yet.</p>
          <p style={{fontSize:'0.8125rem',color:'var(--color-text-muted)'}}>Complete the onboarding flow to generate your blueprint.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { key:'executiveSummary', title:'Executive Summary', content:blueprint.executiveSummary },
    { key:'problem', title:'Problem', content:blueprint.problem },
    { key:'solution', title:'Solution & USP', content:blueprint.solution },
    { key:'targetCustomer', title:'Target Customer', content:blueprint.targetCustomer },
    { key:'marketSize', title:'Market Size', content:blueprint.marketSize },
    { key:'competitors', title:'Competitors', content:blueprint.competitors },
    { key:'revenueModel', title:'Revenue Model', content:blueprint.revenueModel },
    { key:'gtmPlan', title:'Go-to-Market Plan', content:blueprint.gtmPlan },
    { key:'validationPlan', title:'Validation Plan', content:blueprint.validationPlan },
    { key:'mvpPlan', title:'MVP Plan', content:blueprint.mvpPlan },
  ];

  return (
    <div style={styles.page} className="page-enter">
      <div style={styles.header}>
        <h2 style={styles.title}><FileText size={22} style={{color:'var(--color-accent-light)'}} /> Business Workspace</h2>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>{editing ? <Save size={14} /> : <Edit3 size={14} />} {editing ? 'Done Editing' : 'Edit'}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><Download size={14} /> Export</button>
        </div>
      </div>
      <div style={styles.sections}>
        {sections.map((sec, i) => (
          <div key={i} style={styles.section}>
            <h4 style={styles.sectionTitle}>{sec.title}</h4>
            {editing ? (
              <textarea
                style={{...styles.sectionContent, ...styles.editTextarea}}
                value={sec.content || ''}
                onChange={e => updateBlueprint(sec.key, e.target.value)}
              />
            ) : (
              <p style={styles.sectionContent}>{sec.content}</p>
            )}
          </div>
        ))}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Success Metrics</h4>
          {blueprint.successMetrics?.map((m, i) => (
            <div key={i} style={{color:'var(--color-success-light)',fontSize:'0.875rem',marginBottom:'0.375rem'}}>✓ {m}</div>
          ))}
        </div>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Risk Analysis</h4>
          {blueprint.risks?.map((r, i) => (
            <div key={i} style={{color:'var(--color-warning-light)',fontSize:'0.875rem',marginBottom:'0.375rem'}}>⚠ {r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth:'900px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  title: { display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.5rem', fontWeight:700 },
  empty: { textAlign:'center', padding:'4rem 2rem', color:'var(--color-text-muted)' },
  sections: { display:'flex', flexDirection:'column', gap:'1rem' },
  section: { padding:'1.25rem', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)' },
  sectionTitle: { fontSize:'0.8125rem', fontWeight:600, color:'var(--color-accent-light)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  sectionContent: { fontSize:'0.9375rem', color:'var(--color-text-secondary)', lineHeight:1.7 },
  editTextarea: { width:'100%', minHeight:'80px', padding:'0.75rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'var(--color-text-primary)', fontFamily:'inherit', fontSize:'0.9375rem', resize:'vertical' },
};
