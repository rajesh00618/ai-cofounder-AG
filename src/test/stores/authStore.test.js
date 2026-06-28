import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    const keys = [
      'ai-cofounder-auth-storage',
      'ai-cofounder-app-storage',
      'ai-cofounder-chat-storage',
      'ai-cofounder-business-storage',
      'ai-cofounder-task-storage',
      'ai-cofounder-founder-storage',
    ];
    for (const key of keys) localStorage.removeItem(key);
    useAuthStore.setState({ user: null, token: null, authError: null });
  });

  it('has initial state with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.authError).toBeNull();
  });

  it('setAuth updates user, token, and clears error', () => {
    const { setAuth } = useAuthStore.getState();
    const testUser = { id: '1', name: 'Test', email: 'test@test.com' };

    setAuth(testUser, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(testUser);
    expect(state.token).toBe('token-123');
    expect(state.authError).toBeNull();
  });

  it('setAuthError sets error state', () => {
    useAuthStore.getState().setAuthError('Invalid credentials');
    expect(useAuthStore.getState().authError).toBe('Invalid credentials');
  });

  it('logout clears user, token, and non-auth persisted stores', () => {
    const { setAuth, logout } = useAuthStore.getState();
    setAuth({ id: '1', name: 'Test', email: 'test@test.com' }, 'token-123');

    localStorage.setItem('ai-cofounder-chat-storage', JSON.stringify({ state: { messages: ['test'] } }));

    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.authError).toBeNull();
    // Auth store is re-written by persist middleware with null state
    const persisted = localStorage.getItem('ai-cofounder-auth-storage');
    expect(persisted).not.toBeNull();
    const parsed = JSON.parse(persisted);
    expect(parsed.state.user).toBeNull();
    expect(parsed.state.token).toBeNull();
    // Other stores are fully cleared in-memory; persist may rewrite empty state
    const chatPersisted = JSON.parse(localStorage.getItem('ai-cofounder-chat-storage'));
    expect(chatPersisted.state.messages).toEqual([]);
  });

  it('persists initial state to zustand storage', () => {
    const { setAuth } = useAuthStore.getState();
    const testUser = { id: '1', name: 'Test', email: 'test@test.com' };

    setAuth(testUser, 'token-123');

    const persisted = localStorage.getItem('ai-cofounder-auth-storage');
    expect(persisted).not.toBeNull();
    const parsed = JSON.parse(persisted);
    expect(parsed.state.token).toBe('token-123');
  });
});
