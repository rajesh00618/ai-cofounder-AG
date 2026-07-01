import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_STATE = {
  currentPage: 'landing',
  sidebarOpen: true,
  sidebarCollapsed: false,
  activePanel: 'business',
  settingsOpen: false,
  apiKey: '',
  notifications: [],
  appError: null,
};

let notificationCounter = 0;

export const useAppStore = create(
  persist(
    (set) => ({
  ...INITIAL_STATE,

  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setApiKey: (key) => set({ apiKey: key }),
  setAppError: (error) => set({ appError: error }),
  addNotification: (n) => set(s => ({ notifications: [{ id: `notif-${++notificationCounter}-${Date.now()}`, ...n }, ...s.notifications] })),
  clearNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  resetApp: () => set({
    currentPage: 'landing',
    sidebarOpen: true,
    sidebarCollapsed: false,
    activePanel: 'business',
    settingsOpen: false,
    apiKey: '',
    notifications: [],
    appError: null,
  }),
    }),
    {
      name: 'ai-cofounder-app-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, appError: null, notifications: [] };
        return persisted;
      },
      partialize: (state) => {
        const { appError: _ae, apiKey: _ak, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[appStore] Persist rehydration error:', error);
      },
    }
  )
);
