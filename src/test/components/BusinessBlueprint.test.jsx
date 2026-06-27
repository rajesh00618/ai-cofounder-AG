import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BusinessBlueprint from '../../components/business/BusinessBlueprint';

const mockUseBusinessStore = vi.fn();

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: (selector) => mockUseBusinessStore(selector),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BusinessBlueprint', () => {
  it('renders without crashing', () => {
    mockUseBusinessStore.mockImplementation((selector) => {
      const state = { blueprint: null, updateBlueprint: vi.fn() };
      return selector ? selector(state) : state;
    });

    render(<MemoryRouter><BusinessBlueprint /></MemoryRouter>);
    expect(screen.getByText(/Business Workspace/i)).toBeDefined();
  });

  it('shows blueprint sections when data is present', () => {
    mockUseBusinessStore.mockImplementation((selector) => {
      const state = {
        blueprint: {
          executiveSummary: 'Test summary',
          problem: 'Test problem',
          solution: 'Test solution',
          targetCustomer: 'Test customer',
          marketSize: 'Test market',
          competitors: 'Test competitors',
          revenueModel: 'Test revenue',
          gtmPlan: 'Test gtm',
          validationPlan: 'Test validation',
          mvpPlan: 'Test mvp',
          successMetrics: ['Metric 1', 'Metric 2'],
          risks: ['Risk 1', 'Risk 2'],
        },
        updateBlueprint: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<MemoryRouter><BusinessBlueprint /></MemoryRouter>);
    expect(screen.getByText(/Executive Summary/i)).toBeDefined();
    expect(screen.getByText(/Test summary/i)).toBeDefined();
    expect(screen.getAllByText(/Problem/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Solution & USP/i)).toBeDefined();
  });

  it('shows empty state when no blueprint data', () => {
    mockUseBusinessStore.mockImplementation((selector) => {
      const state = { blueprint: null, updateBlueprint: vi.fn() };
      return selector ? selector(state) : state;
    });

    render(<MemoryRouter><BusinessBlueprint /></MemoryRouter>);
    expect(screen.getByText(/No business blueprint generated/i)).toBeDefined();
  });
});
