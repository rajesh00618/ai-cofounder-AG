import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommandCenter from '../../components/dashboard/CommandCenter';
import { getGreeting } from '../../utils/helpers';

const mockUseFounderStore = vi.fn();
const mockUseBusinessStore = vi.fn();
const mockUseTaskStore = vi.fn();

vi.mock('../../store/founderStore', () => ({
  useFounderStore: (selector) => mockUseFounderStore(selector),
}));

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: (selector) => mockUseBusinessStore(selector),
}));

vi.mock('../../store/taskStore', () => ({
  useTaskStore: (selector) => mockUseTaskStore(selector),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (selector) => selector,
}));

vi.mock('../../utils/api', () => ({
  api: {
    getMission: vi.fn(() => Promise.resolve({ mission: 'Test mission' })),
    getHealth: vi.fn(() => Promise.resolve({ recommendation: 'Test recommendation' })),
  },
}));

const mockNavigate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  mockUseFounderStore.mockImplementation((selector) => {
    const state = {
      profile: { name: 'Test Founder' },
      dnaScores: { 'Decision-making': 70, Execution: 60 },
    };
    return selector ? selector(state) : state;
  });

  mockUseBusinessStore.mockImplementation((selector) => {
    const state = {
      businessHealth: { idea: 50, validation: 40, product: 60, marketing: 30, sales: 70, finance: 80 },
      startupScore: { execution: 65, business: 55, customers: 45, product: 75, cash: 35, aiConfidence: 80 },
      currentStage: 'validation',
      blueprint: { targetCustomer: 'Test', problem: 'Test', solution: 'Test' },
    };
    return selector ? selector(state) : state;
  });

  mockUseTaskStore.mockImplementation((selector) => {
    const state = {
      tasks: [
        { id: '1', title: 'Task 1', status: 'todo', priority: 'high', estimatedTime: '2 hrs', aiAssistance: 'Full' },
        { id: '2', title: 'Task 2', status: 'done', priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'Partial' },
      ],
    };
    return selector ? selector(state) : state;
  });
});

describe('CommandCenter', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><CommandCenter onNavigate={mockNavigate} /></MemoryRouter>);
    expect(screen.getByText(/Test Founder/i)).toBeDefined();
  });

  it('shows daily greeting', () => {
    render(<MemoryRouter><CommandCenter onNavigate={mockNavigate} /></MemoryRouter>);
    expect(screen.getByText(new RegExp(getGreeting(), 'i'))).toBeDefined();
  });

  it('renders score cards', () => {
    render(<MemoryRouter><CommandCenter onNavigate={mockNavigate} /></MemoryRouter>);
    const scoreCards = screen.getAllByText(/%/i);
    expect(scoreCards.length).toBeGreaterThanOrEqual(6);
  });

  it('renders today\'s mission section', () => {
    render(<MemoryRouter><CommandCenter onNavigate={mockNavigate} /></MemoryRouter>);
    expect(screen.getByText(/Today's Mission/i)).toBeDefined();
  });

  it('shows business health scores', () => {
    render(<MemoryRouter><CommandCenter onNavigate={mockNavigate} /></MemoryRouter>);
    expect(screen.getByText(/Business Health/i)).toBeDefined();
    expect(screen.getByText(/Overall/i)).toBeDefined();
  });
});
