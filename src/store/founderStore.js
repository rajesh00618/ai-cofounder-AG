import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

export const useFounderStore = create(
  persist(
    (set, get) => ({
  profile: null,
  onboardingComplete: false,
  onboardingStep: 0,
  onboardingAnswers: {},
  goal: null,
  goalClarified: false,
  clarificationAnswers: {},
  realityScore: null,
  negotiationResult: null,
  founderTwin: null,
  dnaScores: null,
  founderError: null,

  setFounderError: (error) => set({ founderError: error }),

  toggleOnboardingAnswer: (questionId, answer) => set(s => {
    const current = s.onboardingAnswers[questionId] || [];
    const arr = Array.isArray(current) ? current : [current];
    const next = arr.includes(answer) ? arr.filter(a => a !== answer) : [...arr, answer];
    return { onboardingAnswers: { ...s.onboardingAnswers, [questionId]: next } };
  }),
  nextOnboardingStep: () => set(s => ({ onboardingStep: Math.min(10, s.onboardingStep + 1) })),
  prevOnboardingStep: () => set(s => ({ onboardingStep: Math.max(0, s.onboardingStep - 1) })),

  completeOnboarding: (name) => {
    const answers = get().onboardingAnswers;
    const pick = (key, fallback) => { const v = answers[key]; return Array.isArray(v) ? v[0] : (v || fallback); };
    const profile = {
      id: generateId(),
      name: name || 'Founder',
      experienceLevel: pick(2, 'First startup'),
      primaryGoal: pick(1, 'Find an idea'),
      teamStatus: pick(3, 'Solo'),
      timeAvailable: pick(4, '1–2 hrs/day'),
      workingStyle: pick(5, 'Mix of both'),
      biggestBlocker: pick(6, 'Idea'),
      successDefinition: pick(7, 'MVP'),
      strengths: [],
      weaknesses: [],
      riskAppetite: pick(2) === 'Serial entrepreneur' ? 'high' : pick(2) === 'First startup' ? 'low' : 'medium',
      createdAt: new Date().toISOString()
    };
    set({ profile, onboardingComplete: true });
  },

  resetOnboarding: () => set({
    profile: null,
    onboardingComplete: false,
    onboardingStep: 0,
    onboardingAnswers: {},
    goal: null,
    goalClarified: false,
    clarificationAnswers: {},
    realityScore: null,
    negotiationResult: null,
    founderTwin: null,
    dnaScores: null,
    founderError: null,
  }),

  setGoal: (goal) => set({ goal }),
  setClarificationAnswers: (answers) => set({ clarificationAnswers: answers, goalClarified: true }),
  setRealityScore: (score) => set({ realityScore: score }),
  setNegotiationResult: (result) => set({ negotiationResult: result }),
  updateDnaScore: (dim, val) => set(s => ({ dnaScores: { ...(s.dnaScores || {}), [dim]: val } })),
    }),
    {
      name: 'ai-cofounder-founder-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, founderError: null };
        return persisted;
      },
      partialize: (state) => {
        const { founderError: _fe, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[founderStore] Persist rehydration error:', error);
      },
    }
  )
);
