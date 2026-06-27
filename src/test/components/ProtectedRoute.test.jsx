import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

const mockUseAuthStore = vi.fn();

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector) => mockUseAuthStore(selector),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
  });

  it('redirects to /auth when no token', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { token: null };
      return selector(state);
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when token is present', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { token: 'valid-token-123' };
      return selector(state);
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
