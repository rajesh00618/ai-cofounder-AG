import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecisionSimulator from '../../components/simulators/DecisionSimulator';
import { useBusinessStore } from '../../store/businessStore';

vi.mock('../../utils/api', () => ({
  api: {
    simulateDecision: vi.fn(),
    simulateCompany: vi.fn(),
    simulateCustomer: vi.fn(),
    getFailurePrediction: vi.fn().mockResolvedValue(null),
  },
}));

beforeEach(() => {
  useBusinessStore.setState({
    businessHealth: { idea: 50, validation: 50, product: 50, marketing: 50, sales: 50, finance: 50 },
    blueprint: null,
  });
});

describe('DecisionSimulator', () => {
  it('renders without crashing', () => {
    render(<DecisionSimulator />);
    expect(screen.getByText('Simulator')).toBeInTheDocument();
  });

  it('shows tab navigation (Decision, Company, Customer)', () => {
    render(<DecisionSimulator />);
    expect(screen.getByText('Decision Simulator')).toBeInTheDocument();
    expect(screen.getByText('Company Simulator')).toBeInTheDocument();
    expect(screen.getByText('Customer Simulator')).toBeInTheDocument();
  });

  it('shows at least one simulator panel', () => {
    render(<DecisionSimulator />);
    expect(screen.getByPlaceholderText(/Describe your decision/i)).toBeInTheDocument();
  });
});
