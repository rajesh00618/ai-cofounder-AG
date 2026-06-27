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

  it('setAuth updates user and token', () => {
    const { setAuth } = useAuthStore.getState();
    const testUser = { id: '1', name: 'Test', email: 'test@test.com' };

    setAuth(testUser, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(testUser);
    expect(state.token).toBe('token-123');
  });

  it('logout clears user and token', () => {
    const { setAuth, logout } = useAuthStore.getState();
    setAuth({ id: '1', name: 'Test', email: 'test@test.com' }, 'token-123');

    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('persists token to zustand storage', () => {
    const { setAuth } = useAuthStore.getState();
    const testUser = { id: '1', name: 'Test', email: 'test@test.com' };

    setAuth(testUser, 'token-123');

    const persisted = localStorage.getItem('ai-cofounder-auth-storage');
    expect(persisted).not.toBeNull();
    const parsed = JSON.parse(persisted);
    expect(parsed.state.token).toBe('token-123');
  });
});
