import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useFounderStore } from './founderStore';
import { useBusinessStore } from './businessStore';
import { useTaskStore } from './taskStore';
import { useChatStore } from './chatStore';
import { useAppStore } from './appStore';

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
    const otherStoreKeys = [
      'ai-cofounder-app-storage',
      'ai-cofounder-chat-storage',
      'ai-cofounder-business-storage',
      'ai-cofounder-task-storage',
      'ai-cofounder-founder-storage',
    ];
    for (const key of otherStoreKeys) {
      try { localStorage.removeItem(key); } catch (e) { console.warn('Failed to clear persisted store on logout:', key, e); }
    }
    // Reset all other stores' in-memory state to prevent data leakage
    try { useFounderStore.getState().resetOnboarding(); } catch (e) { console.error('Failed to reset founder store:', e); }
    try { useBusinessStore.getState().resetBusiness(); } catch (e) { console.error('Failed to reset business store:', e); }
    try { useTaskStore.getState().resetTasks(); } catch (e) { console.error('Failed to reset task store:', e); }
    try { useChatStore.getState().resetChat(); } catch (e) { console.error('Failed to reset chat store:', e); }
    try { useAppStore.getState().resetApp(); } catch (e) { console.error('Failed to reset app store:', e); }
    set({ user: null, token: null, authError: null });
  },
    }),
    {
      name: 'ai-cofounder-auth-storage',
    }
  )
);
