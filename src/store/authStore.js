import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('ai-cofounder-token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('ai-cofounder-token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('ai-cofounder-token'),
    }),
    {
      name: 'ai-cofounder-auth-storage',
    }
  )
);
