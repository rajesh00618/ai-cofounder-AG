import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from '../../pages/AuthPage';

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();
const mockLogout = vi.fn();
const mockResetOnboarding = vi.fn();
const mockUseAuthStore = vi.fn();
const mockUseFounderStore = vi.fn();

const { mockAuthStoreModule, mockFounderStoreModule } = vi.hoisted(() => {
  const persist = { onFinishHydration: (cb) => { cb(); return () => {}; }, hasHydrated: () => true };
  const authFn = (sel) => mockUseAuthStore(sel);
  authFn.persist = persist;
  const founderFn = (sel) => mockUseFounderStore(sel);
  founderFn.persist = persist;
  founderFn.getState = () => ({ profile: null });
  return { mockAuthStoreModule: authFn, mockFounderStoreModule: founderFn };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../store/authStore', () => ({
  useAuthStore: mockAuthStoreModule,
}));

vi.mock('../../store/founderStore', () => ({
  useFounderStore: mockFounderStoreModule,
}));

vi.mock('../../utils/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuthStore.mockReset();
  mockUseFounderStore.mockReset();
  mockUseFounderStore.mockImplementation((selector) => {
    const state = { resetOnboarding: mockResetOnboarding };
    return selector(state);
  });
});

describe('AuthPage', () => {
  it('renders login form by default when no token', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user: null, token: null, setAuth: mockSetAuth, logout: mockLogout };
      return selector(state);
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
  });

  it('toggles to register form', async () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user: null, token: null, setAuth: mockSetAuth, logout: mockLogout };
      return selector(state);
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Sign up'));
    await new Promise(r => setTimeout(r, 300));
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  });

  it('shows signed-in view when token exists', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        user: { name: 'Test Founder', email: 'test@example.com' },
        token: 'some-token',
        setAuth: mockSetAuth,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByText("You're signed in")).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });
});
