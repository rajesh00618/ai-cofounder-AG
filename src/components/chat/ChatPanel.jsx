import React, { useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Loader2 } from 'lucide-react';

export default function ChatPanel({ messages = [], onSend, loading = false, placeholder = 'Type a message...', emptyMessage = 'Start a conversation' }) {
  const [input, setInput] = React.useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <MessageSquare size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
            <p style={styles.emptyText}>{emptyMessage}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} style={{ ...styles.row, ...(msg.role === 'user' ? styles.userRow : styles.aiRow) }}>
            <div style={styles.avatar}>
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
              <div style={styles.text}>{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.row}>
            <div style={styles.avatar}><Bot size={12} /></div>
            <div style={styles.loadingBubble}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={styles.inputRow}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.5 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'rgba(255,255,255,0.01)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  emptyText: {
    color: 'var(--color-text-muted)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  userRow: {
    flexDirection: 'row-reverse',
  },
  aiRow: {},
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  bubble: {
    maxWidth: '75%',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  userBubble: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: 'var(--color-text-primary)',
  },
  aiBubble: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--color-text-secondary)',
  },
  text: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  loadingBubble: {
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: 'var(--color-text-primary)',
    outline: 'none',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--gradient-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },
};
