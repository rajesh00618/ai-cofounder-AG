import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, _get) => ({
  currentPage: 'landing',
  sidebarOpen: true,
  sidebarCollapsed: false,
  activePanel: 'business',
  settingsOpen: false,
  apiKey: '',
  notifications: [],

  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setApiKey: (key) => set({ apiKey: key }),
  addNotification: (n) => set(s => ({ notifications: [{ id: Date.now(), ...n }, ...s.notifications] })),
  clearNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
    }),
    {
      name: 'ai-cofounder-app-storage',
    }
  )
);
