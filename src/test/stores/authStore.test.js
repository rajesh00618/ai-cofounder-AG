import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null });
  });

  it('has initial state with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setAuth updates user, token, and localStorage', () => {
    const { setAuth } = useAuthStore.getState();
    const testUser = { id: '1', name: 'Test', email: 'test@test.com' };

    setAuth(testUser, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(testUser);
    expect(state.token).toBe('token-123');
    expect(localStorage.getItem('ai-cofounder-token')).toBe('token-123');
  });

  it('logout clears user, token, and localStorage', () => {
    const { setAuth, logout } = useAuthStore.getState();
    setAuth({ id: '1', name: 'Test', email: 'test@test.com' }, 'token-123');

    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('ai-cofounder-token')).toBeNull();
  });

  it('isAuthenticated returns false when no token in localStorage', () => {
    localStorage.removeItem('ai-cofounder-token');
    const { isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true when token exists in localStorage', () => {
    localStorage.setItem('ai-cofounder-token', 'some-token');
    const { isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated()).toBe(true);
  });
});
