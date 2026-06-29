import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useBusinessStore } from '../../store/businessStore';
import { Map, CheckCircle2, Circle, Clock, Zap, ChevronDown, ChevronRight, Target, Calendar } from 'lucide-react';

export default function FullPlanView() {
  const { fullPlan, sprints, tasks } = useTaskStore();
  const { blueprint } = useBusinessStore();
  const [expandedPhase, setExpandedPhase] = useState(null);

  const phases = fullPlan?.phases || [];

  if (!phases.length) {
    return (
      <div style={{ maxWidth: '900px' }} className="page-enter">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Map size={22} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Full Execution Plan</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <Map size={40} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>No execution plan yet. Generate your business blueprint first — the full plan will be created automatically.</p>
        </div>
      </div>
    );
  }

  const getPhaseTasks = (phaseTitle) => {
    const sprint = sprints.find(s => s.phaseTitle === phaseTitle);
    if (!sprint) return [];
    return tasks.filter(t => t.sprintId === sprint.id);
  };

  const totalPhaseTasks = (phaseTitle) => {
    const t = getPhaseTasks(phaseTitle);
    return { total: t.length, done: t.filter(x => x.status === 'done').length };
  };

  const progress = (done, total) => total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ maxWidth: '900px' }} className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Map size={22} style={{ color: 'var(--accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Full Execution Plan</h2>
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Your complete roadmap from start to goal — {phases.length} phases
      </p>

      {phases.map((phase, idx) => {
        const isExpanded = expandedPhase === idx;
        const phaseTasks = getPhaseTasks(phase.title);
        const { total, done: doneCount } = totalPhaseTasks(phase.title);
        const pct = progress(doneCount, total);

        return (
          <div key={`phase-${phase.title?.slice(0, 20) || idx}`} style={{
            marginBottom: '0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setExpandedPhase(isExpanded ? null : idx)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem 1.25rem', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: idx === 0 ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>{phase.title}</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {phase.goal && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Target size={11} /> {phase.goal}
                    </span>
                  )}
                  {phase.duration && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={11} /> {phase.duration}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doneCount}/{total} tasks
                  </span>
                </div>
                <div className="progress-bar" style={{ marginTop: '0.5rem', height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                {pct === 100 && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                {isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </button>

            {isExpanded && (
              <div style={{ padding: '0.75rem 1.25rem 1rem' }}>
                {phaseTasks.length === 0 && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>No tasks in this phase yet.</p>
                )}
                {phaseTasks.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: task.status === 'done' ? 'var(--success)' :
                        task.priority === 'high' ? 'var(--danger)' :
                        task.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)',
                    }} />
                    <div style={{ flex: 1, fontSize: '0.875rem',
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      opacity: task.status === 'done' ? 0.5 : 1,
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {task.estimatedTime && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {task.estimatedTime}</span>}
                      {task.dueDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={10} /> {task.dueDate}</span>}
                      {task.aiAssistance && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Zap size={10} /> {task.aiAssistance}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
