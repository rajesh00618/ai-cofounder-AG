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
    getMemoryGraph: vi.fn(() => Promise.resolve({ nodes: [], edges: [] })),
    addMemoryNode: vi.fn(() => Promise.resolve({ id: 'new-id' })),
    addMemoryEdge: vi.fn(() => Promise.resolve({ id: 'edge-id' })),
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

  it('shows SVG graph element', async () => {
    const { container } = render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });
  });

  it('shows Timeline View header', async () => {
    render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Timeline View/i)).toBeDefined();
    });
  });

  it('has Add Node button', async () => {
    render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Add Node/i)).toBeDefined();
    });
  });

  it('has Add Edge button', async () => {
    render(<MemoryRouter><MemoryGraph /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Add Edge/i)).toBeDefined();
    });
  });
});
