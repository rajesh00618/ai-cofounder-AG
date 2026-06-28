import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

export const useBusinessStore = create(
  persist(
    (set) => ({
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
    businessError: null,
  }),
    }),
    {
      name: 'ai-cofounder-business-storage',
    }
  )
);
