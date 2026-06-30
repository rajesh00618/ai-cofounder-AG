import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';
import { api } from '../utils/api';
import { useFounderStore } from './founderStore';
import { useTaskStore } from './taskStore';

export const useBusinessStore = create(
  persist(
    (set, get) => ({
  blueprint: null,
  businessHealth: {
    idea: 0, validation: 0, product: 0, marketing: 0, sales: 0, finance: 0
  },
  startupScore: {
    execution: 0, business: 0, customers: 0, product: 0, cash: 0, aiConfidence: 50
  },
  currentStage: 'idea',
  businessAnswers: {},
  documents: [],
  businessError: null,
  scoreRecalculating: false,

  setBlueprint: (bp) => set({ blueprint: bp, businessError: null }),
  updateBlueprint: (field, value) => set(s => ({
    blueprint: { ...(s.blueprint || {}), [field]: value }
  })),
  setBusinessHealth: (health) => set({ businessHealth: health }),
  updateHealthScore: (cat, val) => set(s => ({
    businessHealth: { ...s.businessHealth, [cat]: val }
  })),
  setStartupScore: (scores) => set({ startupScore: scores }),
  setStage: (stage) => set({ currentStage: stage }),
  setBusinessAnswers: (answers) => set({ businessAnswers: answers }),
  setBusinessError: (error) => set({ businessError: error }),
  addDocument: (doc) => set(s => ({
    documents: [...s.documents, { id: generateId(), createdAt: new Date().toISOString(), ...doc }]
  })),
  updateDocument: (id, updates) => set(s => ({
    documents: s.documents.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  resetBusiness: () => set({
    blueprint: null,
    businessHealth: { idea: 0, validation: 0, product: 0, marketing: 0, sales: 0, finance: 0 },
    startupScore: { execution: 0, business: 0, customers: 0, product: 0, cash: 0, aiConfidence: 50 },
    currentStage: 'idea',
    businessAnswers: {},
    documents: [],
    businessError: '',
    scoreRecalculating: false,
  }),

  recalculateScores: (() => {
    let timer = null;
    return async () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const state = get();
        if (!state.blueprint) return;
        set({ scoreRecalculating: true, businessError: '' });
        try {
          const profile = useFounderStore.getState().profile;
          const tasks = useTaskStore.getState().tasks;
          const result = await api.recalculateScores(state.businessAnswers, state.blueprint, profile, tasks, state.currentStage);
          if (!result?.businessHealth || !result?.startupScore) {
            set({ businessError: 'Score recalculation returned incomplete data.', scoreRecalculating: false });
            return;
          }
          const currentStage = result.currentStage || state.currentStage;
          set({ businessHealth: result.businessHealth, startupScore: result.startupScore, currentStage, scoreRecalculating: false });
        } catch (error) {
          set({ businessError: error.message, scoreRecalculating: false });
        }
      }, 2000);
    };
  })(),
    }),
    {
      name: 'ai-cofounder-business-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, currentStage: persisted?.currentStage || 'idea', scoreRecalculating: false };
        return persisted;
      },
      partialize: (state) => {
        const { businessError: _be, scoreRecalculating: _sr, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[businessStore] Persist rehydration error:', error);
      },
    }
  )
);
