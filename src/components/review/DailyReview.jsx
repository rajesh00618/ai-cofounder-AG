import React, { useState, useEffect } from 'react';
import { CalendarCheck, Send, Smile, Meh, Frown, Battery, BatteryLow, BatteryFull, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';

const STORAGE_KEY = 'ai-cofounder-daily-review';

export default function DailyReview() {
  const [completed, setCompleted] = useState('');
  const [blocked, setBlocked] = useState('');
  const [learned, setLearned] = useState('');
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [tomorrow, setTomorrow] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        if (data.date === today) {
          setCompleted(data.completed || '');
          setBlocked(data.blocked || '');
          setLearned(data.learned || '');
          setMood(data.mood || null);
          setEnergy(data.energy || null);
          setTomorrow(data.tomorrow || '');
          if (data.submitted) {
            setSubmitted(true);
            setAiNote(data.aiNote || '');
          }
        }
      }
    } catch {}
  }, []);

  const persist = (extra = {}) => {
    const data = {
      date: new Date().toDateString(),
      completed, blocked, learned, mood, energy, tomorrow,
      submitted, aiNote, ...extra
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const review = { completed, blocked, learned, mood, energy, tomorrow };
      const res = await api.submitReviewNote(review);
      const note = res.note || '';
      setAiNote(note);
      setSubmitted(true);
      persist({ submitted: true, aiNote: note });
    } catch (e) {
      setError(e.message);
      // Do NOT setSubmitted(true) on error — user should retry
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={styles.page} className="page-enter">
        <div style={styles.successCard}>
          <CheckCircle2 size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Review Submitted</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            I've updated your memory and will adjust tomorrow's task load based on your responses.
          </p>
          {aiNote ? (
            <div style={styles.aiNote}>
              <Sparkles size={16} style={{ color: 'var(--color-accent-light)' }} />
              <span>{aiNote}</span>
            </div>
          ) : null}
          {error && <div style={styles.errorBanner}><AlertCircle size={14} /> {error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="page-enter">
      <h2 style={styles.title}><CalendarCheck size={22} style={{ color: 'var(--color-accent-light)' }} /> Daily Review</h2>
      <p style={styles.subtitle}>End-of-day check-in — helps your AI adapt to your patterns</p>

      {error && <div style={styles.errorBanner}><AlertCircle size={14} /> {error}</div>}

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>What did you complete today?</label>
          <textarea style={styles.textarea} value={completed} onChange={e => { setCompleted(e.target.value); persist(); }} placeholder="List what you got done..." rows={2} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>What blocked you?</label>
          <textarea style={styles.textarea} value={blocked} onChange={e => { setBlocked(e.target.value); persist(); }} placeholder="Any obstacles or blockers..." rows={2} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>What did you learn?</label>
          <textarea style={styles.textarea} value={learned} onChange={e => { setLearned(e.target.value); persist(); }} placeholder="Key insights or lessons..." rows={2} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Mood</label>
          <div style={styles.moodRow}>
            {[{ val: 'high', icon: Smile, label: 'Great', color: 'var(--color-success)' }, { val: 'medium', icon: Meh, label: 'Okay', color: 'var(--color-warning)' }, { val: 'low', icon: Frown, label: 'Rough', color: 'var(--color-danger)' }].map(m => (
              <button key={m.val} onClick={() => { setMood(m.val); persist(); }} style={{ ...styles.moodBtn, ...(mood === m.val ? { borderColor: m.color, background: `${m.color}15` } : {}) }}>
                <m.icon size={24} style={{ color: mood === m.val ? m.color : 'var(--color-text-muted)' }} />
                <span style={{ fontSize: '0.75rem', color: mood === m.val ? m.color : 'var(--color-text-muted)' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Energy Level</label>
          <div style={styles.moodRow}>
            {[{ val: 'high', icon: BatteryFull, label: 'High', color: 'var(--color-success)' }, { val: 'medium', icon: Battery, label: 'Medium', color: 'var(--color-warning)' }, { val: 'low', icon: BatteryLow, label: 'Low', color: 'var(--color-danger)' }].map(e => (
              <button key={e.val} onClick={() => { setEnergy(e.val); persist(); }} style={{ ...styles.moodBtn, ...(energy === e.val ? { borderColor: e.color, background: `${e.color}15` } : {}) }}>
                <e.icon size={24} style={{ color: energy === e.val ? e.color : 'var(--color-text-muted)' }} />
                <span style={{ fontSize: '0.75rem', color: energy === e.val ? e.color : 'var(--color-text-muted)' }}>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Tomorrow's focus</label>
          <input type="text" style={styles.input} value={tomorrow} onChange={e => { setTomorrow(e.target.value); persist(); }} placeholder="What's the #1 priority for tomorrow?" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><Send size={16} /> Submit Review</>}
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => setSubmitted(true)} style={{ flex: '0 0 auto', color: 'var(--color-text-muted)' }}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '700px' },
  title: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1rem' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: {},
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' },
  textarea: { width: '100%', resize: 'vertical', minHeight: '60px', padding: '0.75rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--color-text-primary)', fontFamily: 'inherit' },
  input: { width: '100%', padding: '0.75rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--color-text-primary)', fontFamily: 'inherit' },
  moodRow: { display: 'flex', gap: '0.75rem' },
  moodBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  successCard: { textAlign: 'center', padding: '4rem 2rem' },
  aiNote: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '1rem', background: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: '12px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, textAlign: 'left', maxWidth: '500px', margin: '0 auto' },
};
