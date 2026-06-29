import { describe, it, expect, beforeEach } from 'vitest';
import { useFounderStore } from '../../store/founderStore';

beforeEach(() => {
  useFounderStore.setState({
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
      recoveryPattern: 'structured',
    },
    dnaScores: {
      'Decision-making': 50, 'Execution': 50, 'Consistency': 50,
      'Learning speed': 50, 'Leadership': 50, 'Sales ability': 50,
      'Technical skill': 50, 'Communication': 50, 'Focus': 50, 'Confidence': 50,
    },
  });
});

describe('founderStore', () => {
  it('has initial state', () => {
    const state = useFounderStore.getState();
    expect(state.profile).toBeNull();
    expect(state.onboardingComplete).toBe(false);
    expect(state.goal).toBeNull();
  });

  it('toggles onboarding answer', () => {
    useFounderStore.getState().toggleOnboardingAnswer(1, 'Find an idea');
    let answers = useFounderStore.getState().onboardingAnswers;
    expect(answers[1]).toEqual(['Find an idea']);
    useFounderStore.getState().toggleOnboardingAnswer(1, 'Validate an idea');
    answers = useFounderStore.getState().onboardingAnswers;
    expect(answers[1]).toEqual(['Find an idea', 'Validate an idea']);
    useFounderStore.getState().toggleOnboardingAnswer(1, 'Find an idea');
    answers = useFounderStore.getState().onboardingAnswers;
    expect(answers[1]).toEqual(['Validate an idea']);
  });

  it('increments onboarding step', () => {
    useFounderStore.getState().nextOnboardingStep();
    expect(useFounderStore.getState().onboardingStep).toBe(1);
    useFounderStore.getState().nextOnboardingStep();
    expect(useFounderStore.getState().onboardingStep).toBe(2);
  });

  it('decrements onboarding step but not below 0', () => {
    useFounderStore.getState().prevOnboardingStep();
    expect(useFounderStore.getState().onboardingStep).toBe(0);
    useFounderStore.getState().nextOnboardingStep();
    useFounderStore.getState().nextOnboardingStep();
    useFounderStore.getState().prevOnboardingStep();
    expect(useFounderStore.getState().onboardingStep).toBe(1);
  });

  it('completes onboarding with profile', () => {
    useFounderStore.getState().toggleOnboardingAnswer(2, 'Serial entrepreneur');
    useFounderStore.getState().toggleOnboardingAnswer(3, 'Solo');
    useFounderStore.getState().toggleOnboardingAnswer(4, 'Full-time');
    useFounderStore.getState().completeOnboarding('Test Founder');

    const state = useFounderStore.getState();
    expect(state.onboardingComplete).toBe(true);
    expect(state.profile).not.toBeNull();
    expect(state.profile.name).toBe('Test Founder');
    expect(state.profile.experienceLevel).toBe('Serial entrepreneur');
    expect(state.profile.riskAppetite).toBe('high');
  });

  it('resets onboarding state', () => {
    useFounderStore.getState().toggleOnboardingAnswer(1, 'Test');
    useFounderStore.getState().completeOnboarding('User');
    expect(useFounderStore.getState().onboardingComplete).toBe(true);

    useFounderStore.getState().resetOnboarding();
    const state = useFounderStore.getState();
    expect(state.onboardingComplete).toBe(false);
    expect(state.profile).toBeNull();
    expect(state.goal).toBeNull();
    expect(state.realityScore).toBeNull();
  });

  it('sets goal and clarification answers', () => {
    useFounderStore.getState().setGoal('Build an MVP in 30 days');
    expect(useFounderStore.getState().goal).toBe('Build an MVP in 30 days');

    useFounderStore.getState().setClarificationAnswers({ 1: 'SaaS', 2: 'Idea' });
    expect(useFounderStore.getState().goalClarified).toBe(true);
    expect(useFounderStore.getState().clarificationAnswers[1]).toBe('SaaS');
  });

  it('sets reality score and negotiation result', () => {
    const score = { overallScore: 72, scores: { market: 80 }, risks: ['No validation'], recommendation: 'Interview customers' };
    useFounderStore.getState().setRealityScore(score);
    expect(useFounderStore.getState().realityScore).toEqual(score);

    useFounderStore.getState().setNegotiationResult({ alternative: 'Reduce scope' });
    expect(useFounderStore.getState().negotiationResult.alternative).toBe('Reduce scope');
  });

  it('updates DNA scores', () => {
    useFounderStore.getState().updateDnaScore('Execution', 75);
    expect(useFounderStore.getState().dnaScores['Execution']).toBe(75);
    useFounderStore.getState().updateDnaScore('Focus', 60);
    expect(useFounderStore.getState().dnaScores['Focus']).toBe(60);
  });
});
