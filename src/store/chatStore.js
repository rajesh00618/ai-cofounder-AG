import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

export const useChatStore = create(
  persist(
    (set, _get) => ({
  messages: [],
  isThinking: false,
  thinkingStep: '',
  confidence: null,
  activeAgent: 'ceo',
  boardMeetingActive: false,
  debateActive: false,
  investorModeActive: false,
  customerSimActive: false,

  addMessage: (msg) => set(s => {
    const newMessages = [...s.messages, {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...msg
    }];
    const MAX_MESSAGES = 500;
    return { messages: newMessages.length > MAX_MESSAGES ? newMessages.slice(-MAX_MESSAGES) : newMessages };
  }),

  updateMessage: (id, updates) => set(s => ({
    messages: s.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setThinking: (val) => set({ isThinking: val }),
  setThinkingStep: (step) => set({ thinkingStep: step }),
  setConfidence: (val) => set({ confidence: val }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  setBoardMeeting: (val) => set({ boardMeetingActive: val }),
  setDebate: (val) => set({ debateActive: val }),
  setInvestorMode: (val) => set({ investorModeActive: val }),
  setCustomerSim: (val) => set({ customerSimActive: val }),
  clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ai-cofounder-chat-storage',
    }
  )
);
