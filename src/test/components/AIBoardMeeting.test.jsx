import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIBoardMeeting from '../../components/ai/AIBoardMeeting';

vi.mock('../../utils/api', () => ({
  api: { boardChat: vi.fn() },
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('AIBoardMeeting', () => {
  it('renders without crashing', () => {
    render(<AIBoardMeeting />);
    expect(screen.getByText('AI Board Meeting')).toBeInTheDocument();
  });

  it('shows chat panel', () => {
    render(<AIBoardMeeting />);
    expect(screen.getByText(/Present your strategic question/i)).toBeInTheDocument();
  });

  it('shows agent responses area', () => {
    render(<AIBoardMeeting />);
    expect(screen.getByText('Board Member')).toBeInTheDocument();
  });

  it('shows input for questions', () => {
    render(<AIBoardMeeting />);
    expect(screen.getByPlaceholderText(/Respond to the board/i)).toBeInTheDocument();
  });
});
