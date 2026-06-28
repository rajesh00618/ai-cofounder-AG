import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InvestorMode from '../../components/ai/InvestorMode';

vi.mock('../../utils/api', () => ({
  api: {
    investorEvaluate: vi.fn(),
    investorChat: vi.fn(),
  },
}));

vi.mock('../../store/founderStore', () => ({
  useFounderStore: vi.fn(() => ({
    profile: { name: 'Test Founder', experienceLevel: 'First startup' },
    dnaScores: { 'Decision-making': 70, 'Execution': 65 },
  })),
}));

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: vi.fn(() => ({
    blueprint: { problem: 'Test problem', solution: 'Test solution' },
    businessHealth: { idea: 50, validation: 40, product: 60, marketing: 30, sales: 20, finance: 45 },
    startupScore: { execution: 70, business: 60, customers: 40, product: 75, cash: 50, aiConfidence: 80 },
  })),
}));

describe('InvestorMode', () => {
  it('renders Investors Mode heading', () => {
    render(<InvestorMode />);
    expect(screen.getByText('Investor Mode')).toBeInTheDocument();
  });

  it('shows evaluate and chat tabs', () => {
    render(<InvestorMode />);
    expect(screen.getByText('Evaluate')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('evaluate tab initial state shows prompt', () => {
    render(<InvestorMode />);
    expect(screen.getByText(/Run Investor Evaluation/i)).toBeInTheDocument();
  });

  it('chat tab shows message history', () => {
    render(<InvestorMode />);
    fireEvent.click(screen.getByText('Chat'));
    expect(screen.getByText(/Hi, I'm your AI investor/i)).toBeInTheDocument();
  });
});
