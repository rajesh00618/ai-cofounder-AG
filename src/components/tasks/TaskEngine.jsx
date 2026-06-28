import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { CheckSquare, Plus, Clock, Zap, CheckCircle2, Circle, Sparkles, Calendar, Loader2, Lightbulb } from 'lucide-react';
import { api } from '../../utils/api';

export default function TaskEngine() {
  const { tasks, sprints, currentSprintId, addTask, completeTask, updateTask } = useTaskStore();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [taskError, setTaskError] = useState('');

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const sprint = sprints.find(s => s.id === currentSprintId) || { goal: 'Initial Validation', week: 1, deadline: 'This Friday' };

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask({ title: newTask.trim(), priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'AI-assisted' });
    setNewTask('');
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const res = await api.getTaskSuggestions({ sprint: sprint.goal, stage: 'ideation' });
      setSuggestions(res.suggestions || []);
    } catch (e) {
      setTaskError(e.message);
    }
    setSuggesting(false);
  };

  const addSuggestion = (title) => {
    addTask({ title, priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'AI-suggested' });
  };

  const priorityColor = (p) => p === 'high' ? 'var(--color-danger)' : p === 'medium' ? 'var(--color-warning)' : 'var(--color-text-muted)';

  return (
    <div style={styles.page} className="page-enter">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}><CheckSquare size={22} style={{ color: 'var(--color-accent-light)' }} /> Task Engine</h2>
          <p style={styles.subtitle}>{done}/{total} tasks completed</p>
        </div>
        <div className="progress-bar" style={{ width: '200px' }}>
          <div className="progress-bar-fill" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
        </div>
      </div>

      <div style={styles.sprint}>
        <div style={styles.sprintHeader}>
          <Calendar size={16} style={{ color: 'var(--color-accent-light)' }} />
          <span style={{ fontWeight: 600 }}>Sprint {sprint.week}</span>
          <span className="badge badge-accent">{sprint.deadline}</span>
        </div>
        <div style={styles.sprintGoal}>
          <Sparkles size={14} style={{ color: 'var(--color-warning)' }} />
          <span>Goal: <strong>{sprint.goal}</strong></span>
        </div>
      </div>

      {taskError && (
        <div style={{padding:'0.5rem 1rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'10px',fontSize:'0.75rem',color:'var(--color-danger)',marginBottom:'0.75rem'}}>
          {taskError}
        </div>
      )}

      {/* AI Suggestions */}
      <div style={styles.suggestBar}>
        <button className="btn btn-secondary btn-sm" onClick={handleSuggest} disabled={suggesting}>
          {suggesting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Lightbulb size={14} />}
          {' '}AI Suggest Tasks
        </button>
        {suggestions.length > 0 && (
          <div style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <button key={i} className="badge badge-accent" style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={() => addSuggestion(s)}>
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.filters}>
        {['all', 'todo', 'in-progress', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
            {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : f === 'in-progress' ? 'In Progress' : 'Done'}
            <span style={styles.filterCount}>{f === 'all' ? total : tasks.filter(t => t.status === f).length}</span>
          </button>
        ))}
      </div>

      <div style={styles.addRow}>
        <input type="text" placeholder="Add a new task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} style={styles.addInput} />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}><Plus size={14} /> Add</button>
      </div>

      <div style={styles.taskList}>
        {filtered.map((task) => (
          <div key={task.id} style={styles.taskCard} className="page-enter">
            <button onClick={() => task.status === 'done' ? updateTask(task.id, { status: 'todo', completedAt: null }) : completeTask(task.id)} style={styles.checkBtn}>
              {task.status === 'done' ? <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} /> : <Circle size={20} style={{ color: 'var(--color-text-muted)' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.taskTitle, textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.5 : 1 }}>{task.title}</div>
              <div style={styles.taskMeta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {task.estimatedTime}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={11} /> {task.aiAssistance}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ ...styles.priorityDot, background: priorityColor(task.priority) }} aria-label={`Priority: ${task.priority}`} />
              <select value={task.status} onChange={e => updateTask(task.id, { status: e.target.value })} style={styles.statusSelect}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <CheckSquare size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No tasks {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.8125rem', marginTop: '0.25rem' },
  sprint: { padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '14px', marginBottom: '0.75rem' },
  sprintHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  sprintGoal: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' },
  suggestBar: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  filterBtn: { padding: '0.375rem 0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' },
  filterActive: { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: 'var(--color-accent-light)' },
  filterCount: { fontSize: '0.6875rem', padding: '0 0.375rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' },
  addRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  addInput: { flex: 1, padding: '0.625rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--color-text-primary)', fontFamily: 'inherit' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  taskCard: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', transition: 'all 0.2s' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },
  taskTitle: { fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.25rem' },
  taskMeta: { display: 'flex', gap: '0.75rem', fontSize: '0.6875rem', color: 'var(--color-text-muted)' },
  priorityDot: { width: '8px', height: '8px', borderRadius: '50%' },
  statusSelect: { padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', cursor: 'pointer' },
};
