import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeeklyReview from '../../components/review/WeeklyReview';
import { api } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: {
    generateWeeklyReview: vi.fn(),
  },
}));

vi.mock('../../store/founderStore', () => ({
  useFounderStore: vi.fn(() => ({
    profile: { name: 'Test Founder' },
    dnaScores: {},
  })),
}));

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: vi.fn(() => ({
    businessHealth: { idea: 50, validation: 40, product: 60, marketing: 30, sales: 20, finance: 45 },
    startupScore: { execution: 70, business: 60, customers: 40, product: 75, cash: 50, aiConfidence: 80 },
  })),
}));

vi.mock('../../store/taskStore', () => ({
  useTaskStore: vi.fn(() => ({
    tasks: [],
  })),
}));

describe('WeeklyReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Weekly Review heading', () => {
    render(<WeeklyReview />);
    expect(screen.getByText('Weekly CEO / Board Review')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(api.generateWeeklyReview).mockReturnValue(new Promise(() => {}));
    render(<WeeklyReview />);
    expect(screen.getByText(/Analyzing your week/i)).toBeInTheDocument();
  });

  it('shows generated review data', async () => {
    vi.mocked(api.generateWeeklyReview).mockResolvedValue({
      weekSummary: 'Good week of progress',
      achievements: ['Shipped feature', 'Closed deal'],
      missedGoals: [],
      businessHealthTrend: 'improving',
      executionScore: 75,
      focusAreas: [{ area: 'marketing', status: 'needs attention', recommendation: 'Run ads' }],
      nextWeekPlan: 'Focus on growth',
      grade: 'B',
      coachingNote: 'Keep up the momentum',
    });
    render(<WeeklyReview />);
    expect(await screen.findByText('Good week of progress')).toBeInTheDocument();
    expect(screen.getByText('Week Summary')).toBeInTheDocument();
    expect(screen.getByText('Coaching Note')).toBeInTheDocument();
  });
});
