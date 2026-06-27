import React, { useState, useRef, useEffect } from 'react';
import { useFounderStore } from '../../store/founderStore';
import { useChatStore } from '../../store/chatStore';
import { useBusinessStore } from '../../store/businessStore';
import { useTaskStore } from '../../store/taskStore';
import { Send, Sparkles, Brain, FileText, CheckSquare, Bot, User, Loader2, CheckCircle2, Users } from 'lucide-react';
import { delay, getScoreColor } from '../../utils/helpers';
import { AI_AGENTS } from '../../utils/constants';

import { api } from '../../utils/api';

const PANELS = [
  { id: 'business', label: 'Business', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'research', label: 'Research', icon: Brain },
  { id: 'agents', label: 'AI Team', icon: Users },
];

function ThinkBubble({ steps, current }) {
  return (
    <div style={tb.wrap}>
      {steps.map((s, i) => (
        <div key={i} style={{...tb.step, opacity: i <= current ? 1 : 0.3, color: i < current ? 'var(--color-success-light)' : i === current ? 'var(--color-accent-light)' : 'var(--color-text-muted)'}}>
          {i < current ? <CheckCircle2 size={12} /> : i === current ? <Loader2 size={12} style={{animation:'spin 1s linear infinite'}} /> : <div style={{width:12,height:12}} />}
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}
const tb = { wrap:{padding:'0.75rem 1rem',background:'rgba(99,102,241,0.05)',borderRadius:'10px',display:'flex',flexDirection:'column',gap:'0.375rem',marginBottom:'0.5rem'}, step:{display:'flex',alignItems:'center',gap:'0.375rem',fontSize:'0.75rem',transition:'all 0.3s'} };

export default function AIWorkspace() {
  const { profile } = useFounderStore();
  const { messages, addMessage, isThinking, setThinking, setConfidence } = useChatStore();
  const { blueprint } = useBusinessStore();
  const { tasks } = useTaskStore();
  const [input, setInput] = useState('');
  const [activePanel, setActivePanel] = useState('business');
  const [thinkSteps, setThinkSteps] = useState([]);
  const [thinkCurrent, setThinkCurrent] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isThinking]);

  const generateResponse = async (userMsg) => {
    const steps = ['Thinking...', 'Analyzing Context...', 'Formulating Response...'];
    setThinkSteps(steps);
    setThinking(true);
    
    for (let i = 0; i < steps.length; i++) {
      setThinkCurrent(i);
      await delay(300);
    }
    
    setThinking(false);

    const context = {
      profile,
      blueprint,
      tasks: tasks.filter(t => t.status !== 'done')
    };

    const msgId = `stream-${Date.now()}`;
    let accumulated = '';

    api.chatStream(userMsg, context,
      (token, fullText) => {
        if (!accumulated) {
          addMessage({ id: msgId, role: 'assistant', content: '', confidence: 85, agent: 'ceo' });
        }
        accumulated = fullText;
        const store = useChatStore.getState();
        const updated = store.messages.map(m =>
          m.id === msgId ? { ...m, content: fullText } : m
        );
        useChatStore.setState({ messages: updated });
      },
      (fullText) => {
        accumulated = fullText;
        const store = useChatStore.getState();
        const updated = store.messages.map(m =>
          m.id === msgId ? { ...m, content: fullText, confidence: 92 } : m
        );
        useChatStore.setState({ messages: updated, confidence: 92 });
        setConfidence(92);
      },
      (error) => {
        const isNetwork = error === 'Failed to fetch' || error?.includes('NetworkError') || error?.includes('network');
        const msg = isNetwork
          ? '⚠️ Cannot reach the server. Make sure the backend is running (`node server/index.js`).'
          : `⚠️ Error: ${error}`;
        addMessage({ role: 'assistant', content: msg, agent: 'ceo' });
      }
    );
  };

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    addMessage({ role: 'user', content: input.trim() });
    const msg = input.trim();
    setInput('');
    generateResponse(msg);
  };

  return (
    <div style={styles.workspace}>
      {/* Left: Chat */}
      <div style={styles.chatSide}>
        <div style={styles.chatHeader}>
          <Sparkles size={18} style={{color:'var(--color-accent-light)'}} />
          <span style={{fontWeight:600}}>AI Co-Founder</span>
          <span className="badge badge-accent" style={{marginLeft:'auto'}}>CEO Mode</span>
        </div>

        <div style={styles.chatMessages}>
          {messages.length === 0 && (
            <div style={styles.emptyChat}>
              <div style={styles.emptyChatIcon}><Sparkles size={28} /></div>
              <h3 style={{fontWeight:600,marginBottom:'0.5rem'}}>Your AI Co-Founder is ready</h3>
              <p style={{fontSize:'0.875rem',color:'var(--color-text-tertiary)',lineHeight:1.6}}>
                Ask me anything about your startup. I'll challenge your assumptions, suggest next steps, and help you execute.
              </p>
              <div style={styles.quickActions}>
                {['What should I do next?','Analyze my competitors','Help me with pricing','Review my strategy'].map(q => (
                  <button key={q} style={styles.quickBtn} onClick={() => { setInput(q); }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{...styles.message, ...(msg.role === 'user' ? styles.userMsg : styles.aiMsg)}}>
              <div style={styles.msgAvatar}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div style={styles.msgContent}>
                <div style={styles.msgHeader}>
                  <span style={{fontWeight:600,fontSize:'0.8125rem'}}>{msg.role === 'user' ? profile?.name : 'AI Co-Founder'}</span>
                  <span style={{fontSize:'0.6875rem',color:'var(--color-text-muted)'}}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                  </span>
                </div>
                <div style={styles.msgText}>{msg.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{display:'block',marginTop:'0.5rem'}}>{line.replace(/\*\*/g,'')}</strong>;
                  if (line.startsWith('**')) {
                    const parts = line.split('**');
                    return <p key={i} style={{margin:'0.25rem 0'}}>{parts.map((p,j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}</p>;
                  }
                  if (line.match(/^\d\./)) return <p key={i} style={{margin:'0.25rem 0',paddingLeft:'0.5rem'}}>{line}</p>;
                  if (line.startsWith('⚠️') || line.startsWith('🎯') || line.startsWith('📊') || line.startsWith('📋') || line.startsWith('🏗️') || line.startsWith('🧠') || line.startsWith('👥') || line.startsWith('💡')) return <p key={i} style={{margin:'0.25rem 0'}}>{line}</p>;
                  return line ? <p key={i} style={{margin:'0.25rem 0'}}>{line}</p> : <br key={i} />;
                })}</div>
                {msg.confidence && (
                  <div style={styles.confidenceBar}>
                    <span style={{fontSize:'0.6875rem',fontWeight:600,color:getScoreColor(msg.confidence)}}>Confidence: {msg.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{...styles.message, ...styles.aiMsg}}>
              <div style={styles.msgAvatar}><Bot size={14} /></div>
              <div style={styles.msgContent}>
                <ThinkBubble steps={thinkSteps} current={thinkCurrent} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={styles.chatInput}>
          <input
            type="text"
            placeholder="Ask your AI Co-Founder..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={styles.input}
            disabled={isThinking}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim() || isThinking}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Right: Context Panel */}
      <div style={styles.panelSide}>
        <div style={styles.panelTabs}>
          {PANELS.map(p => (
            <button key={p.id} onClick={() => setActivePanel(p.id)}
              style={{...styles.panelTab, ...(activePanel === p.id ? styles.panelTabActive : {})}}>
              <p.icon size={14} /> {p.label}
            </button>
          ))}
        </div>

        <div style={styles.panelContent}>
          {activePanel === 'business' && (
            <div className="page-enter">
              <h4 style={styles.panelHeader}>Business Overview</h4>
              {blueprint ? (
                <>
                  {[{l:'Customer',v:blueprint.targetCustomer},{l:'Problem',v:blueprint.problem},{l:'Solution',v:blueprint.solution},{l:'Pricing',v:blueprint.revenueModel},{l:'Market',v:blueprint.marketSize}].map(item => (
                    <div key={item.l} style={styles.fieldCard}>
                      <div style={styles.fieldLabel}>{item.l}</div>
                      <div style={styles.fieldValue}>{item.v}</div>
                    </div>
                  ))}
                </>
              ) : (
                <p style={{fontSize:'0.875rem',color:'var(--color-text-muted)'}}>Complete business planning first</p>
              )}
            </div>
          )}

          {activePanel === 'tasks' && (
            <div className="page-enter">
              <h4 style={styles.panelHeader}>Active Tasks</h4>
              {tasks.filter(t=>t.status!=='done').map(t => (
                <div key={t.id} style={styles.miniTask}>
                  <div style={{...styles.taskDot, background: t.priority==='high'?'var(--color-danger)':'var(--color-warning)'}} />
                  <span style={{fontSize:'0.8125rem',flex:1}}>{t.title}</span>
                  <span style={{fontSize:'0.6875rem',color:'var(--color-text-muted)'}}>{t.estimatedTime}</span>
                </div>
              ))}
              {tasks.filter(t=>t.status!=='done').length === 0 && <p style={{fontSize:'0.875rem',color:'var(--color-text-muted)'}}>No active tasks</p>}
            </div>
          )}

          {activePanel === 'research' && (
            <div className="page-enter">
              <h4 style={styles.panelHeader}>Research Findings</h4>
              <p style={{fontSize:'0.875rem',color:'var(--color-text-muted)',textAlign:'center',padding:'2rem 0'}}>Research data will appear here after you start using the dashboard</p>
            </div>
          )}

          {activePanel === 'agents' && (
            <div className="page-enter">
              <h4 style={styles.panelHeader}>AI Team</h4>
              {AI_AGENTS.slice(0,6).map(agent => (
                <div key={agent.id} style={styles.agentItem}>
                  <span style={{fontSize:'1.25rem'}}>{agent.icon}</span>
                  <div>
                    <div style={{fontSize:'0.8125rem',fontWeight:600}}>{agent.name}</div>
                    <div style={{fontSize:'0.6875rem',color:'var(--color-text-muted)'}}>{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  workspace: { display:'flex', gap:'1px', height:'calc(100vh - 96px)', marginTop:'-0.5rem', marginRight:'-2rem', marginBottom:'-1.5rem' },
  chatSide: { flex:'1 1 55%', display:'flex', flexDirection:'column', minWidth:0 },
  chatHeader: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' },
  chatMessages: { flex:1, overflow:'auto', padding:'1rem' },
  emptyChat: { textAlign:'center', padding:'3rem 2rem' },
  emptyChatIcon: { width:'56px', height:'56px', borderRadius:'16px', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', margin:'0 auto 1rem', animation:'float 3s ease-in-out infinite' },
  quickActions: { display:'flex', flexWrap:'wrap', gap:'0.5rem', justifyContent:'center', marginTop:'1.5rem' },
  quickBtn: { padding:'0.5rem 1rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', fontSize:'0.8125rem', color:'var(--color-text-secondary)', cursor:'pointer', transition:'all 0.2s' },
  message: { display:'flex', gap:'0.75rem', marginBottom:'1rem' },
  userMsg: {},
  aiMsg: {},
  msgAvatar: { width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-text-secondary)', flexShrink:0, marginTop:'0.125rem' },
  msgContent: { flex:1, minWidth:0 },
  msgHeader: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.375rem' },
  msgText: { fontSize:'0.875rem', color:'var(--color-text-secondary)', lineHeight:1.7 },
  confidenceBar: { marginTop:'0.5rem', padding:'0.375rem 0.625rem', background:'rgba(255,255,255,0.02)', borderRadius:'6px', display:'inline-block' },
  chatInput: { display:'flex', gap:'0.5rem', padding:'0.75rem 1rem', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' },
  input: { flex:1, padding:'0.625rem 1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', fontSize:'0.875rem' },
  panelSide: { flex:'0 0 360px', borderLeft:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', background:'rgba(255,255,255,0.01)' },
  panelTabs: { display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  panelTab: { flex:1, padding:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.375rem', fontSize:'0.6875rem', fontWeight:500, color:'var(--color-text-muted)', cursor:'pointer', border:'none', background:'transparent', transition:'all 0.2s', borderBottom:'2px solid transparent' },
  panelTabActive: { color:'var(--color-accent-light)', borderBottomColor:'var(--color-accent)', background:'rgba(99,102,241,0.05)' },
  panelContent: { flex:1, overflow:'auto', padding:'1rem' },
  panelHeader: { fontSize:'0.875rem', fontWeight:600, marginBottom:'1rem', color:'var(--color-text-primary)' },
  fieldCard: { padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', marginBottom:'0.5rem', border:'1px solid rgba(255,255,255,0.04)' },
  fieldLabel: { fontSize:'0.6875rem', color:'var(--color-text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' },
  fieldValue: { fontSize:'0.8125rem', color:'var(--color-text-secondary)', lineHeight:1.5 },
  miniTask: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  taskDot: { width:'6px', height:'6px', borderRadius:'50%', flexShrink:0 },
  researchItem: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  agentItem: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
};
