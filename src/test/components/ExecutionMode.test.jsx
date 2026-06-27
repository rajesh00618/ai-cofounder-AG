import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExecutionMode from '../../components/ai/ExecutionMode';

vi.mock('../../utils/api', () => ({
  api: { getExecutionPlan: vi.fn(), executeStep: vi.fn() },
}));

describe('ExecutionMode', () => {
  it('renders without crashing', () => {
    render(<ExecutionMode />);
    expect(screen.getByText('Execution Mode')).toBeInTheDocument();
  });

  it('shows execution plan section', () => {
    render(<ExecutionMode />);
    expect(screen.getByPlaceholderText(/Tell the AI what to build/i)).toBeInTheDocument();
    expect(screen.getByText('Execute')).toBeInTheDocument();
  });

  it('shows step-by-step view', () => {
    render(<ExecutionMode />);
    expect(screen.getByText('Build landing page')).toBeInTheDocument();
    expect(screen.getByText('Research competitors')).toBeInTheDocument();
    expect(screen.getByText('Generate business plan')).toBeInTheDocument();
    expect(screen.getByText('Draft pitch deck')).toBeInTheDocument();
  });
});
