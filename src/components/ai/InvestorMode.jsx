import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, MessageCircle, BarChart3, ThumbsUp, ThumbsDown, HelpCircle, AlertTriangle, Star, Send, Sparkles, RotateCw } from 'lucide-react';
import { api } from '../../utils/api';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { useShallow } from 'zustand/react/shallow';

export default function InvestorMode() {
  const { profile, dnaScores } = useFounderStore(
    useShallow(s => ({ profile: s.profile, dnaScores: s.dnaScores || {} }))
  );
  const { blueprint, businessHealth, startupScore } = useBusinessStore(
    useShallow(s => ({ blueprint: s.blueprint, businessHealth: s.businessHealth, startupScore: s.startupScore }))
  );

  const [tab, setTab] = useState('evaluate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I'm your AI investor. Ask me anything about your startup, pitch, or fundraising strategy." }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const buildContext = () => ({
    blueprint,
    businessHealth,
    startupScore,
    profile,
    dnaScores,
  });

  const runEvaluation = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.investorEvaluate(buildContext());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const data = await api.investorChat(input.trim(), buildContext());
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderVerdict = (verdict) => {
    if (verdict === 'would invest') return { icon: <ThumbsUp size={20} />, label: 'Would Invest', color: 'var(--color-success)' };
    if (verdict === 'would not invest') return { icon: <ThumbsDown size={20} />, label: 'Would Not Invest', color: 'var(--color-danger)' };
    return { icon: <HelpCircle size={20} />, label: 'Need More Data', color: 'var(--color-warning)' };
  };

  const ScoreDisplay = ({ label, value, max = 100 }) => (
    <div style={styles.scoreRow}>
      <span style={styles.scoreLabel}>{label}</span>
      <div style={{ flex: 1, margin: '0 0.75rem' }}>
        <div className="progress-bar" style={{ height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${(value / max) * 100}%`, background: value > 70 ? 'var(--color-success)' : value > 40 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
        </div>
      </div>
      <span style={{ ...styles.scoreValue, color: value > 70 ? 'var(--color-success)' : value > 40 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{value}{max !== 100 ? `/${max}` : '%'}</span>
    </div>
  );

  return (
    <div style={styles.container} className="page-enter">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <DollarSign size={22} style={{ color: 'var(--color-accent-light)' }} />
          <div>
            <h2 style={styles.title}>Investor Mode</h2>
            <p style={styles.subtitle}>Get a VC's perspective on your startup</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'evaluate' ? styles.tabActive : {}) }}
          onClick={() => setTab('evaluate')}
        >
          <BarChart3 size={16} /> Evaluate
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'chat' ? styles.tabActive : {}) }}
          onClick={() => setTab('chat')}
        >
          <MessageCircle size={16} /> Chat
        </button>
      </div>

      {tab === 'evaluate' ? (
        <div style={styles.evaluatePanel}>
          {/* Run button */}
          {!result && !loading && (
            <div style={styles.evalPrompt}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Analyze your startup through the eyes of an experienced venture capitalist. The investor will evaluate your business health, founder DNA, and blueprint to give you a pitch-ready assessment.
              </p>
              <button className="btn btn-primary" onClick={runEvaluation} style={{ alignSelf: 'flex-start' }}>
                <Sparkles size={16} /> Run Investor Evaluation
              </button>
            </div>
          )}

          {loading && (
            <div style={styles.loadingState}>
              <Sparkles size={20} style={{ animation: 'spin 2s linear infinite', color: 'var(--color-accent-light)' }} />
              <span>Analyzing your startup from an investor's perspective...</span>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {result && !loading && (
            <div style={styles.resultsArea}>
              {/* Verdict */}
              <div style={{ ...styles.verdictCard, borderColor: renderVerdict(result.verdict).color }}>
                <div style={{ ...styles.verdictIcon, color: renderVerdict(result.verdict).color }}>
                  {renderVerdict(result.verdict).icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.125rem' }}>Verdict</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: renderVerdict(result.verdict).color }}>{renderVerdict(result.verdict).label}</div>
                  {result.valuation && <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Est. Valuation: {result.valuation}</div>}
                </div>
              </div>

              {/* Scores */}
              <div style={styles.scoresGrid}>
                {result.pitchRating != null && <ScoreDisplay label="Pitch Rating" value={result.pitchRating} />}
                {result.failureProbability != null && <ScoreDisplay label="Failure Probability" value={result.failureProbability} max={100} />}
              </div>

              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}><ThumbsUp size={16} style={{ color: 'var(--color-success)' }} /> Strengths</h4>
                  <ul style={styles.list}>
                    {result.strengths.map((s, i) => <li key={i} style={styles.listItem}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}><ThumbsDown size={16} style={{ color: 'var(--color-danger)' }} /> Weaknesses</h4>
                  <ul style={styles.list}>
                    {result.weaknesses.map((w, i) => <li key={i} style={styles.listItem}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Hard Questions */}
              {result.hardQuestions && result.hardQuestions.length > 0 && (
                <div style={{ ...styles.section, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <h4 style={{ ...styles.sectionTitle, marginBottom: '0.75rem' }}><HelpCircle size={16} style={{ color: 'var(--color-warning)' }} /> Hard Questions You'll Face</h4>
                  <ul style={styles.list}>
                    {result.hardQuestions.map((q, i) => <li key={i} style={styles.listItem}>{q}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {result.recommendation && (
                <div style={{ ...styles.section, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <h4 style={{ ...styles.sectionTitle, marginBottom: '0.5rem' }}><Star size={16} style={{ color: 'var(--color-accent-light)' }} /> Recommendation</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{result.recommendation}</p>
                </div>
              )}

              <button className="btn btn-ghost btn-sm" onClick={runEvaluation} style={{ color: 'var(--color-accent-light)', alignSelf: 'flex-start' }}>
                <RotateCw size={14} /> Re-evaluate
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.chatPanel}>
          {/* Messages */}
          <div style={styles.chatArea}>
            {messages.map((msg, i) => (
              msg.role === 'user' ? (
                <div key={i} style={styles.userRow}>
                  <div style={styles.userBubble}>{msg.content}</div>
                </div>
              ) : (
                <div key={i} style={styles.investorMsg}>
                  <div style={styles.investorHeader}>
                    <DollarSign size={16} style={{ color: 'var(--color-accent-light)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Investor</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              )
            ))}

            {chatLoading && (
              <div style={styles.thinking}>
                <Sparkles size={14} style={{ animation: 'spin 2s linear infinite', color: 'var(--color-accent-light)' }} />
                <span>Investor is thinking...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputBar}>
            <input
              type="text"
              placeholder="Ask about fundraising, pitch feedback, market sizing..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              style={styles.input}
              disabled={chatLoading}
            />
            <button className="btn btn-primary" onClick={sendChat} disabled={chatLoading || !input.trim()} style={styles.sendBtn}>
              {chatLoading ? <Sparkles size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  title: { fontSize: '1.25rem', fontWeight: 700 },
  subtitle: { fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' },

  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0 },
  tab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: 'var(--color-text-tertiary)', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-accent-light)' },

  evaluatePanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', padding: '0.25rem 0' },
  evalPrompt: { padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' },

  loadingState: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-danger)' },

  resultsArea: { display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' },

  verdictCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '2px solid' },
  verdictIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' },

  scoresGrid: { display: 'grid', gap: '0.75rem' },
  scoreRow: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  scoreLabel: { fontSize: '0.8125rem', color: 'var(--color-text-secondary)', width: '140px', flexShrink: 0 },
  scoreValue: { fontSize: '0.875rem', fontWeight: 700, width: '48px', textAlign: 'right' },

  section: { marginBottom: '0.25rem' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  listItem: { padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, borderLeft: '2px solid rgba(255,255,255,0.06)' },

  chatPanel: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  userBubble: { maxWidth: '70%', padding: '0.75rem 1.25rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px 16px 4px 16px', fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.6 },
  investorMsg: { padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid var(--color-accent)' },
  investorHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' },
  thinking: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' },
  inputBar: { display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  input: { flex: 1, padding: '0.75rem 1rem', fontSize: '0.9375rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--color-text-primary)', outline: 'none' },
  sendBtn: { borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
