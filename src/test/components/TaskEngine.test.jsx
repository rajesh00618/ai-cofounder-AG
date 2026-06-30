import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskEngine from '../../components/tasks/TaskEngine';

const mockUseTaskStore = vi.fn();

vi.mock('../../store/taskStore', () => ({
  useTaskStore: (selector) => mockUseTaskStore(selector),
}));

vi.mock('../../store/businessStore', () => ({
  useBusinessStore: vi.fn(() => ({ recalculateScores: vi.fn() })),
}));

vi.mock('../../store/founderStore', () => ({
  useFounderStore: vi.fn(() => ({ profile: null })),
}));

vi.mock('../../utils/api', () => ({
  api: { getTaskSuggestions: vi.fn(), addMemoryNode: vi.fn() },
}));

const mockAddTask = vi.fn();
const mockCompleteTask = vi.fn();
const mockUpdateTask = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  mockUseTaskStore.mockImplementation((selector) => {
    const state = {
      tasks: [
        { id: '1', title: 'Test Task 1', status: 'todo', priority: 'high', estimatedTime: '2 hrs', aiAssistance: 'AI-assisted' },
        { id: '2', title: 'Test Task 2', status: 'done', priority: 'medium', estimatedTime: '1 hr', aiAssistance: 'AI-suggested' },
      ],
      sprints: [{ id: 's1', goal: 'Initial Validation', week: 1, deadline: 'This Friday', status: 'active' }],
      currentSprintId: 's1',
      addTask: mockAddTask,
      completeTask: mockCompleteTask,
      updateTask: mockUpdateTask,
    };
    return selector ? selector(state) : state;
  });
});

describe('TaskEngine', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><TaskEngine /></MemoryRouter>);
    expect(screen.getByText(/Task Engine/i)).toBeDefined();
  });

  it('shows task list', () => {
    render(<MemoryRouter><TaskEngine /></MemoryRouter>);
    expect(screen.getByText(/Test Task 1/i)).toBeDefined();
    expect(screen.getByText(/Test Task 2/i)).toBeDefined();
  });

  it('has Add Task functionality', () => {
    render(<MemoryRouter><TaskEngine /></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByText('Add'));
    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'New task',
      priority: 'medium',
      estimatedTime: '1 hr',
      aiAssistance: 'AI-assisted',
    });
  });

  it('shows sprint selector', () => {
    render(<MemoryRouter><TaskEngine /></MemoryRouter>);
    expect(screen.getByText(/Sprint 1/i)).toBeDefined();
    expect(screen.getByText(/Initial Validation/i)).toBeDefined();
  });
});
