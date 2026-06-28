import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from '../../components/dashboard/AnalyticsDashboard';

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: vi.fn(() => ({
    businessHealth: { idea: 50, validation: 40, product: 60, marketing: 30, sales: 20, finance: 45 },
    startupScore: { execution: 70, business: 60, customers: 40, product: 75, cash: 50, aiConfidence: 80 },
    blueprint: { problem: 'Test problem', solution: 'Test solution' },
  })),
}));

describe('AnalyticsDashboard', () => {
  it('renders Analytics heading', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('shows metric cards', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('MRR')).toBeInTheDocument();
    expect(screen.getByText('Retention Rate')).toBeInTheDocument();
    expect(screen.getByText('Burn Rate')).toBeInTheDocument();
    expect(screen.getByText('Growth Score')).toBeInTheDocument();
  });

  it('displays AI Insights', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });
});
