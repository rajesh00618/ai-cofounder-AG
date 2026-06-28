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

export const useAppStore = create(
  persist(
    (set, _get) => ({
  ...INITIAL_STATE,

  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setApiKey: (key) => set({ apiKey: key }),
  setAppError: (error) => set({ appError: error }),
  addNotification: (n) => set(s => ({ notifications: [{ id: Date.now(), ...n }, ...s.notifications] })),
  clearNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  resetApp: () => set(INITIAL_STATE),
    }),
    {
      name: 'ai-cofounder-app-storage',
      partialize: (state) => ({
        currentPage: state.currentPage,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        activePanel: state.activePanel,
        settingsOpen: state.settingsOpen,
        apiKey: state.apiKey,
        notifications: state.notifications,
        appError: state.appError,
      }),
    }
  )
);
