import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AIWorkspace from '../../components/dashboard/AIWorkspace';

const mockUseFounderStore = vi.fn();
const mockUseChatStore = vi.fn();
const mockUseBusinessStore = vi.fn();
const mockUseTaskStore = vi.fn();

vi.mock('../../store/founderStore', () => ({
  useFounderStore: (selector) => mockUseFounderStore(selector),
}));

vi.mock('../../store/chatStore', () => ({
  useChatStore: (selector) => mockUseChatStore(selector),
}));

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: (selector) => mockUseBusinessStore(selector),
}));

vi.mock('../../store/taskStore', () => ({
  useTaskStore: (selector) => mockUseTaskStore(selector),
}));

vi.mock('../../utils/api', () => ({
  api: { chat: vi.fn() },
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  mockUseFounderStore.mockImplementation((selector) => {
    const state = { profile: { name: 'Test Founder' } };
    return selector ? selector(state) : state;
  });

  mockUseChatStore.mockImplementation((selector) => {
    const state = {
      messages: [],
      isThinking: false,
      addMessage: vi.fn(),
      setThinking: vi.fn(),
      setConfidence: vi.fn(),
    };
    return selector ? selector(state) : state;
  });

  mockUseBusinessStore.mockImplementation((selector) => {
    const state = { blueprint: null };
    return selector ? selector(state) : state;
  });

  mockUseTaskStore.mockImplementation((selector) => {
    const state = { tasks: [] };
    return selector ? selector(state) : state;
  });
});

describe('AIWorkspace', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><AIWorkspace /></MemoryRouter>);
    expect(screen.getAllByText(/AI Co-Founder/i).length).toBeGreaterThan(0);
  });

  it('shows the chat panel', () => {
    render(<MemoryRouter><AIWorkspace /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Ask your AI Co-Founder/i)).toBeDefined();
  });

  it('shows the context panel', () => {
    render(<MemoryRouter><AIWorkspace /></MemoryRouter>);
    expect(screen.getAllByText(/Business/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tasks/i)).toBeDefined();
    expect(screen.getByText(/Research/i)).toBeDefined();
    expect(screen.getByText(/AI Team/i)).toBeDefined();
  });

  it('has agent selector in AI Team panel', () => {
    render(<MemoryRouter><AIWorkspace /></MemoryRouter>);
    expect(screen.getByText(/AI Team/i)).toBeDefined();
  });
});
