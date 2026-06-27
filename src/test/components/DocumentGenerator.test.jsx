import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocumentGenerator from '../../components/documents/DocumentGenerator';
import { useBusinessStore } from '../../store/businessStore';

vi.mock('../../utils/api', () => ({
  api: { generateDocument: vi.fn() },
}));

beforeEach(() => {
  useBusinessStore.setState({ blueprint: { name: 'Test Business' } });
});

describe('DocumentGenerator', () => {
  it('renders without crashing', () => {
    render(<DocumentGenerator />);
    expect(screen.getByText('Document Generator')).toBeInTheDocument();
  });

  it('shows document type selector', () => {
    render(<DocumentGenerator />);
    expect(screen.getByText('Business Plan')).toBeInTheDocument();
    expect(screen.getByText('Product Requirements (PRD)')).toBeInTheDocument();
    expect(screen.getByText('Pitch Deck')).toBeInTheDocument();
  });

  it('shows generate button', () => {
    render(<DocumentGenerator />);
    const buttons = screen.getAllByText('Generate');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows document list', () => {
    render(<DocumentGenerator />);
    expect(screen.getByText('Marketing Plan')).toBeInTheDocument();
    expect(screen.getByText('Financial Plan')).toBeInTheDocument();
    expect(screen.getByText('Technical Docs')).toBeInTheDocument();
  });
});
