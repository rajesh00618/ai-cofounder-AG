import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResearchCenter from '../../components/research/ResearchCenter';
import { useFounderStore } from '../../store/founderStore';
import { useBusinessStore } from '../../store/businessStore';

vi.mock('../../utils/api', () => ({
  api: {
    getResearch: vi.fn().mockResolvedValue([]),
    getOpportunities: vi.fn().mockResolvedValue([]),
    getMorningBriefing: vi.fn().mockResolvedValue(null),
  },
}));

beforeEach(() => {
  useFounderStore.setState({
    profile: { name: 'Test Founder', email: 'test@test.com' },
  });
  useBusinessStore.setState({
    blueprint: { name: 'Test Business' },
    currentStage: 'idea',
    businessHealth: { idea: 50, validation: 50, product: 50, marketing: 50, sales: 50, finance: 50 },
  });
});

describe('ResearchCenter', () => {
  it('renders without crashing', async () => {
    render(<ResearchCenter />);
    expect(await screen.findByText('Research Center')).toBeInTheDocument();
  });

  it('shows research tab', async () => {
    render(<ResearchCenter />);
    expect(await screen.findByText('Research')).toBeInTheDocument();
  });

  it('shows opportunities tab', async () => {
    render(<ResearchCenter />);
    expect(await screen.findByText('Opportunity Radar')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    render(<ResearchCenter />);
    expect(await screen.findByText(/No research items yet/i)).toBeInTheDocument();
  });
});
