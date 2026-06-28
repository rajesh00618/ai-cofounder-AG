import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
  user: null,
  token: null,
  authError: null,

  setAuth: (user, token) => {
    set({ user, token, authError: null });
  },

  setAuthError: (error) => set({ authError: error }),

  logout: () => {
    // Clear all non-auth persisted stores to prevent data leakage between users.
    // Auth store will be re-written by persist middleware with null state.
    const otherStoreKeys = [
      'ai-cofounder-app-storage',
      'ai-cofounder-chat-storage',
      'ai-cofounder-business-storage',
      'ai-cofounder-task-storage',
      'ai-cofounder-founder-storage',
    ];
    for (const key of otherStoreKeys) {
      try { localStorage.removeItem(key); } catch { /* client-side only */ }
    }
    set({ user: null, token: null, authError: null });
  },
    }),
    {
      name: 'ai-cofounder-auth-storage',
    }
  )
);
