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

  logout: async () => {
    try {
      const [bsMod, tsMod, csMod, asMod] = await Promise.all([
        import('./businessStore'),
        import('./taskStore'),
        import('./chatStore'),
        import('./appStore'),
      ]);
      bsMod.useBusinessStore.getState().resetBusiness?.();
      tsMod.useTaskStore.getState().resetTasks?.();
      csMod.useChatStore.getState().resetChat?.();
      asMod.useAppStore.getState().resetApp?.();
    } catch (e) {
      console.warn('[Auth] Error resetting stores on logout:', e.message);
    }
    try {
      ['ai-cofounder-auth-storage', 'ai-cofounder-app-storage', 'ai-cofounder-chat-storage', 'ai-cofounder-business-storage', 'ai-cofounder-task-storage', 'ai-cofounder-founder-storage'].forEach(key => {
        try { localStorage.removeItem(key); } catch {}
      });
      ['ai-cofounder-whatsapp', 'ai-cofounder-reset-token'].forEach(key => {
        try { localStorage.removeItem(key); } catch {}
      });
    } catch {}
    set({ user: null, token: null, authError: null });
  },
    }),
    {
      name: 'ai-cofounder-auth-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, authError: null };
        return persisted;
      },
      partialize: (state) => {
        const { authError: _ae, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[authStore] Persist rehydration error:', error);
      },
    }
  )
);
