import React, { useState, useRef, useEffect } from 'react';
import { Users, Sparkles, Send, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { useShallow } from 'zustand/react/shallow';

const INITIAL_MSG = { id: 'board-initial', role: 'assistant', name: 'Board', content: 'Present your strategic question to the board and we will debate it from every angle.' };
const INITIAL_DISCUSSION = [INITIAL_MSG];

export default function AIBoardMeeting() {
  const { profile, dnaScores } = useFounderStore(
    useShallow(s => ({ profile: s.profile, dnaScores: s.dnaScores }))
  );
  const { blueprint, businessHealth, startupScore, currentStage } = useBusinessStore(
    useShallow(s => ({ blueprint: s.blueprint, businessHealth: s.businessHealth, startupScore: s.startupScore, currentStage: s.currentStage }))
  );
  const { tasks } = useTaskStore();

  const [messages, setMessages] = useState(INITIAL_DISCUSSION);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debating, setDebating] = useState(false);
  const bottomRef = useRef(null);
  const mountedRef = useRef(false);
  const msgCounterRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: `user-${Date.now()}`, role: 'user', content: input.trim() };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setDebating(true);
    try {
      const history = [...messages, userMsg];
      const ctx = { profile, blueprint, businessHealth, startupScore, currentStage, dnaScores, tasks };
      const data = await api.boardChat(history, ctx);
      for (const resp of data.responses) {
        if (!mountedRef.current) return;
        await new Promise(r => setTimeout(r, 400));
        if (!mountedRef.current) return;
        const msgId = `resp-${Date.now()}-${++msgCounterRef.current}`;
        setMessages(prev => [...prev, { id: msgId, role: 'assistant', name: resp.agent, icon: resp.icon, color: resp.color, content: resp.position }]);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', name: 'Board', icon: '⚠️', color: '#ef4444', content: 'Sorry, the board encountered an error. Please try again.' }]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setDebating(false);
      }
    }
  };

  const reset = () => {
    setMessages(INITIAL_DISCUSSION);
    setInput('');
    setDebating(false);
  };

  return (
    <div style={styles.container} className="page-enter">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Users size={22} style={{color:'var(--color-accent-light)'}} />
          <div>
            <h2 style={styles.title}>AI Board Meeting</h2>
            <p style={styles.subtitle}>Debate decisions with your AI executive team</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reset} style={{color:'var(--color-text-tertiary)'}}>
          <Trash2 size={14} /> New Topic
        </button>
      </div>

      {/* Messages */}
      <div className="board-chat-panel" style={styles.chatArea}>
        {messages.map((msg) => (
          msg.role === 'user' ? (
            <div key={msg.id} style={styles.userRow}>
              <div style={styles.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={msg.id} style={{...styles.respCard, borderLeftColor: msg.color || 'var(--color-accent)'}} className="page-enter">
              <div style={styles.respHeader}>
                <span style={{fontSize:'1.25rem'}}>{msg.icon || '🧑‍💼'}</span>
                <span style={{fontWeight:600, fontSize:'0.875rem'}}>{msg.name}</span>
                <span style={{fontSize:'0.75rem', color:'var(--color-text-muted)'}}>Board Member</span>
              </div>
              <p style={styles.respText}>{msg.content}</p>
            </div>
          )
        ))}

        {debating && (
          <div style={styles.thinking}>
            <Sparkles size={14} style={{animation:'spin 2s linear infinite', color:'var(--color-accent-light)'}} />
            <span>Agents are debating...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <input
          type="text"
          placeholder="Respond to the board, ask a follow-up, or challenge their views..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={styles.input}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()} style={styles.sendBtn} aria-label="Send message">
          {loading ? <Sparkles size={16} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth:'900px', display:'flex', flexDirection:'column', height:'calc(100vh - 120px)' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexShrink:0 },
  headerLeft: { display:'flex', alignItems:'center', gap:'0.75rem' },
  title: { fontSize:'1.25rem', fontWeight:700 },
  subtitle: { fontSize:'0.8125rem', color:'var(--color-text-tertiary)', marginTop:'0.125rem' },
  chatArea: { flex:1, overflowY:'auto', padding:'0.5rem 0', display:'flex', flexDirection:'column', gap:'0.75rem' },
  userRow: { display:'flex', justifyContent:'flex-end' },
  userBubble: { maxWidth:'70%', padding:'0.75rem 1.25rem', background:'var(--accent-subtle)', border:'1px solid var(--accent)', borderRadius:'16px 16px 4px 16px', fontSize:'0.9375rem', color:'var(--color-text-primary)', lineHeight:1.6 },
  respCard: { padding:'1rem 1.25rem', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid' },
  respHeader: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.375rem' },
  respText: { fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.7 },
  thinking: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem', fontSize:'0.8125rem', color:'var(--color-text-tertiary)' },
  inputBar: { display:'flex', gap:'0.5rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 },
  input: { flex:1, padding:'0.75rem 1rem', fontSize:'0.9375rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'var(--color-text-primary)', outline:'none' },
  sendBtn: { borderRadius:'12px', width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center' },
};
