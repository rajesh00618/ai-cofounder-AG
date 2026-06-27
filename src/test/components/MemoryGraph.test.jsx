import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MemoryGraph from '../../components/memory/MemoryGraph';

const mockUseFounderStore = vi.fn();

vi.mock('../../store/founderStore', () => ({
  useFounderStore: (selector) => mockUseFounderStore(selector),
}));

vi.mock('../../utils/api', () => ({
  api: {
    getMemoryTimeline: vi.fn(() => Promise.resolve([])),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockUseFounderStore.mockImplementation((selector) => {
    const state = { profile: { id: 'test-id', name: 'Test' } };
    return selector ? selector(state) : state;
  });
});

describe('MemoryGraph', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    expect(screen.getByText(/Memory Graph/i)).toBeDefined();
  });

  it('shows SVG graph element', () => {
    const { container } = render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('shows default nodes', async () => {
    render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    await screen.findByText(/Timeline View/i);
    expect(screen.getAllByText(/Idea/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Validation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MVP/i).length).toBeGreaterThan(0);
  });
});
