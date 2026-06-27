import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FounderTwin from '../../components/founder/FounderTwin';

const mockUseFounderStore = vi.fn();

vi.mock('../../store/founderStore', () => ({
  useFounderStore: (selector) => mockUseFounderStore(selector),
}));

vi.mock('../../utils/api', () => ({
  api: {
    adaptDNA: vi.fn(() => Promise.resolve({ adaptations: [{ weakness: 'Test', action: 'Improve test' }] })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockUseFounderStore.mockImplementation((selector) => {
    const state = {
      dnaScores: {
        'Decision-making': 70,
        'Execution': 60,
        'Consistency': 80,
        'Learning speed': 50,
        'Leadership': 40,
        'Sales ability': 30,
        'Technical skill': 60,
        'Communication': 75,
        'Focus': 55,
        'Confidence': 65,
      },
      founderTwin: {
        thinkStyle: 'analytical',
        decideStyle: 'balanced',
        learnStyle: 'building',
        workPattern: 'focused',
        failurePattern: 'stall',
        recoveryPattern: 'structured',
      },
    };
    return selector ? selector(state) : state;
  });
});

describe('FounderTwin', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><FounderTwin /></MemoryRouter>);
    expect(screen.getByText(/Founder DNA/i)).toBeDefined();
  });

  it('shows DNA scores chart', () => {
    render(<MemoryRouter><FounderTwin /></MemoryRouter>);
    expect(screen.getByText(/DNA Scores/i)).toBeDefined();
    expect(screen.getByText(/Average Score/i)).toBeDefined();
  });

  it('shows dimension breakdown', () => {
    render(<MemoryRouter><FounderTwin /></MemoryRouter>);
    expect(screen.getByText(/Dimension Breakdown/i)).toBeDefined();
  });

  it('shows founder twin model section', () => {
    render(<MemoryRouter><FounderTwin /></MemoryRouter>);
    expect(screen.getByText(/Founder Twin Model/i)).toBeDefined();
    expect(screen.getByText(/Think Style/i)).toBeDefined();
    expect(screen.getByText(/analytical/i)).toBeDefined();
  });

  it('shows adaptations', () => {
    render(<MemoryRouter><FounderTwin /></MemoryRouter>);
    expect(screen.getByText(/AI Adaptations/i)).toBeDefined();
  });
});
