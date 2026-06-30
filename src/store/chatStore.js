import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

export const useChatStore = create(
  persist(
    (set) => ({
  messages: [],
  isThinking: false,
  thinkingStep: '',
  confidence: null,
  activeAgent: 'ceo',
  boardMeetingActive: false,
  debateActive: false,
  investorModeActive: false,
  customerSimActive: false,
  chatError: null,

  addMessage: (msg) => set(s => {
    const newMessage = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...msg
    };
    const newMessages = [...s.messages, newMessage];
    const MAX_MESSAGES = 100;
    return {
      messages: newMessages.length > MAX_MESSAGES ? newMessages.slice(-MAX_MESSAGES) : newMessages,
    };
  }),

  updateMessage: (id, updates) => set(s => ({
    messages: s.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setChatError: (error) => set({ chatError: error }),
  dismissChatError: () => set({ chatError: null }),

  setThinking: (val) => set({ isThinking: val }),
  setThinkingStep: (step) => set({ thinkingStep: step }),
  setConfidence: (val) => set({ confidence: val }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  setBoardMeeting: (val) => set({ boardMeetingActive: val }),
  setDebate: (val) => set({ debateActive: val }),
  setInvestorMode: (val) => set({ investorModeActive: val }),
  setCustomerSim: (val) => set({ customerSimActive: val }),
  clearMessages: () => set({ messages: [], chatError: null }),

  resetChat: () => set({
    messages: [],
    isThinking: false,
    thinkingStep: '',
    confidence: null,
    activeAgent: 'ceo',
    boardMeetingActive: false,
    debateActive: false,
    investorModeActive: false,
    customerSimActive: false,
    chatError: null,
  }),
    }),
    {
      name: 'ai-cofounder-chat-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, isThinking: false, thinkingStep: '', chatError: null };
        return persisted;
      },
      partialize: (state) => {
        const { isThinking: _it, thinkingStep: _ts, chatError: _ce, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[chatStore] Persist rehydration error:', error);
      },
    }
  )
);
