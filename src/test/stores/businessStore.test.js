import { describe, it, expect, beforeEach } from 'vitest';
import { useBusinessStore } from '../../store/businessStore';

beforeEach(() => {
  useBusinessStore.setState({
    blueprint: null,
    businessHealth: { idea: 0, validation: 0, product: 0, marketing: 0, sales: 0, finance: 0 },
    startupScore: { execution: 0, business: 0, customers: 0, product: 0, cash: 0, aiConfidence: 50 },
    currentStage: 'idea',
    businessAnswers: {},
    documents: [],
  });
});

describe('businessStore', () => {
  it('has initial state', () => {
    const state = useBusinessStore.getState();
    expect(state.blueprint).toBeNull();
    expect(state.currentStage).toBe('idea');
    expect(state.documents).toEqual([]);
  });

  it('sets blueprint', () => {
    const bp = { problem: 'Test problem', solution: 'Test solution', targetCustomer: 'Developers' };
    useBusinessStore.getState().setBlueprint(bp);
    expect(useBusinessStore.getState().blueprint).toEqual(bp);
  });

  it('updates blueprint field', () => {
    useBusinessStore.getState().setBlueprint({ problem: 'Old', solution: 'Test' });
    useBusinessStore.getState().updateBlueprint('problem', 'Updated problem');
    expect(useBusinessStore.getState().blueprint.problem).toBe('Updated problem');
    expect(useBusinessStore.getState().blueprint.solution).toBe('Test');
  });

  it('sets business health scores', () => {
    const health = { idea: 80, validation: 40, product: 60, marketing: 30, sales: 20, finance: 50 };
    useBusinessStore.getState().setBusinessHealth(health);
    expect(useBusinessStore.getState().businessHealth).toEqual(health);
  });

  it('updates single health score category', () => {
    useBusinessStore.getState().updateHealthScore('marketing', 75);
    expect(useBusinessStore.getState().businessHealth.marketing).toBe(75);
    expect(useBusinessStore.getState().businessHealth.idea).toBe(0);
  });

  it('sets startup score', () => {
    const scores = { execution: 80, business: 60, customers: 40, product: 70, cash: 50, aiConfidence: 85 };
    useBusinessStore.getState().setStartupScore(scores);
    expect(useBusinessStore.getState().startupScore).toEqual(scores);
  });

  it('sets current stage', () => {
    useBusinessStore.getState().setStage('validation');
    expect(useBusinessStore.getState().currentStage).toBe('validation');
    useBusinessStore.getState().setStage('mvp');
    expect(useBusinessStore.getState().currentStage).toBe('mvp');
  });

  it('sets business answers', () => {
    useBusinessStore.getState().setBusinessAnswers({ customer: 'Developers', problem: 'No time' });
    expect(useBusinessStore.getState().businessAnswers.customer).toBe('Developers');
  });

  it('adds document', () => {
    useBusinessStore.getState().addDocument({ type: 'business-plan', title: 'My Plan' });
    expect(useBusinessStore.getState().documents).toHaveLength(1);
    expect(useBusinessStore.getState().documents[0].type).toBe('business-plan');
    expect(useBusinessStore.getState().documents[0].id).toBeDefined();
    expect(useBusinessStore.getState().documents[0].createdAt).toBeDefined();
  });

  it('updates document', () => {
    useBusinessStore.getState().addDocument({ type: 'prd', title: 'PRD v1' });
    const docId = useBusinessStore.getState().documents[0].id;
    useBusinessStore.getState().updateDocument(docId, { title: 'PRD v2' });
    expect(useBusinessStore.getState().documents[0].title).toBe('PRD v2');
  });
});
