import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, randomBetween } from '../utils/helpers';

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
    'Decision-making': randomBetween(40, 80),
    'Execution': randomBetween(35, 75),
    'Consistency': randomBetween(30, 70),
    'Learning speed': randomBetween(50, 85),
    'Leadership': randomBetween(35, 75),
    'Sales ability': randomBetween(25, 65),
    'Technical skill': randomBetween(40, 90),
    'Communication': randomBetween(45, 80),
    'Focus': randomBetween(35, 75),
    'Confidence': randomBetween(40, 80)
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
