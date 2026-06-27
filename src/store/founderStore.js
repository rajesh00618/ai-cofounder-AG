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
  founderTwin: {
    thinkStyle: 'analytical',
    decideStyle: 'balanced',
    learnStyle: 'building',
    workPattern: 'focused',
    failurePattern: 'stall',
    recoveryPattern: 'structured'
  },
  dnaScores: {
    'Decision-making': 50,
    'Execution': 50,
    'Consistency': 50,
    'Learning speed': 50,
    'Leadership': 50,
    'Sales ability': 50,
    'Technical skill': 50,
    'Communication': 50,
    'Focus': 50,
    'Confidence': 50
  },

  setOnboardingAnswer: (questionId, answer) => set(s => ({
    onboardingAnswers: { ...s.onboardingAnswers, [questionId]: answer }
  })),
  nextOnboardingStep: () => set(s => ({ onboardingStep: s.onboardingStep + 1 })),
  prevOnboardingStep: () => set(s => ({ onboardingStep: Math.max(0, s.onboardingStep - 1) })),

  completeOnboarding: (name) => {
    const answers = get().onboardingAnswers;
    const profile = {
      id: generateId(),
      name: name || 'Founder',
      experienceLevel: answers[2] || 'First startup',
      primaryGoal: answers[1] || 'Find an idea',
      teamStatus: answers[3] || 'Solo',
      timeAvailable: answers[4] || '1–2 hrs/day',
      workingStyle: answers[5] || 'Mix of both',
      biggestBlocker: answers[6] || 'Idea',
      successDefinition: answers[7] || 'MVP',
      strengths: [],
      weaknesses: [],
      riskAppetite: answers[2] === 'Serial entrepreneur' ? 'high' : answers[2] === 'First startup' ? 'low' : 'medium',
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
  }),

  setGoal: (goal) => set({ goal }),
  setClarificationAnswers: (answers) => set({ clarificationAnswers: answers, goalClarified: true }),
  setRealityScore: (score) => set({ realityScore: score }),
  setNegotiationResult: (result) => set({ negotiationResult: result }),
  updateDnaScore: (dim, val) => set(s => ({ dnaScores: { ...s.dnaScores, [dim]: val } })),
    }),
    {
      name: 'ai-cofounder-founder-storage',
    }
  )
);
