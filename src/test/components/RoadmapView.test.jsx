import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoadmapView from '../../components/roadmap/RoadmapView';

const mockUseBusinessStore = vi.fn();

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: (selector) => mockUseBusinessStore(selector),
}));

vi.mock('../../utils/api', () => ({
  api: { getRoadmapGuidance: vi.fn(() => Promise.resolve({ guidance: 'Test guidance' })) },
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockUseBusinessStore.mockImplementation((selector) => {
    const state = {
      currentStage: 'validation',
      blueprint: { targetCustomer: 'Test', problem: 'Test', solution: 'Test' },
    };
    return selector ? selector(state) : state;
  });
});

describe('RoadmapView', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><RoadmapView /></MemoryRouter>);
    expect(screen.getByText(/Startup Roadmap/i)).toBeDefined();
  });

  it('shows startup stages', () => {
    render(<MemoryRouter><RoadmapView /></MemoryRouter>);
    expect(screen.getByText(/Validation/i)).toBeDefined();
    expect(screen.getByText(/MVP/i)).toBeDefined();
    expect(screen.getByText(/Product-Market Fit/i)).toBeDefined();
  });

  it('shows guidance section', async () => {
    render(<MemoryRouter><RoadmapView /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Stage:/i)).toBeDefined();
    });
  });
});
