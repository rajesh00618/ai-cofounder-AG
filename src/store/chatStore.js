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

  addMessage: (msg) => set(s => ({
    messages: [...s.messages, {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...msg
    }]
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
