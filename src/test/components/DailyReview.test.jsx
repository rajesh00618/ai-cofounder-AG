import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyReview from '../../components/review/DailyReview';

vi.mock('../../utils/api', () => ({
  api: { submitReviewNote: vi.fn() },
}));

describe('DailyReview', () => {
  it('renders without crashing', () => {
    render(<DailyReview />);
    expect(screen.getByText('Daily Review')).toBeInTheDocument();
  });

  it('shows review form (completed, blocked, learned fields)', () => {
    render(<DailyReview />);
    expect(screen.getByText('What did you complete today?')).toBeInTheDocument();
    expect(screen.getByText('What blocked you?')).toBeInTheDocument();
    expect(screen.getByText('What did you learn?')).toBeInTheDocument();
  });

  it('shows mood/energy selectors', () => {
    render(<DailyReview />);
    expect(screen.getByText('Mood')).toBeInTheDocument();
    expect(screen.getByText('Energy Level')).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<DailyReview />);
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });
});
