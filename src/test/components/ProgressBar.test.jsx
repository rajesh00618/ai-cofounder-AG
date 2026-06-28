import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../../components/onboarding/ProgressBar';

describe('ProgressBar', () => {
  it('shows correct step progress', () => {
    render(<ProgressBar currentStep={2} totalSteps={5} />);
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('displays total steps at beginning', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('shows last step as complete', () => {
    render(<ProgressBar currentStep={3} totalSteps={3} />);
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
  });
});
