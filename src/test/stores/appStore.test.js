import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store/appStore';

beforeEach(() => {
  useAppStore.setState({
    currentPage: 'landing',
    sidebarOpen: true,
    sidebarCollapsed: false,
    activePanel: 'business',
    settingsOpen: false,
    apiKey: '',
    notifications: [],
  });
});

describe('appStore', () => {
  it('has initial state', () => {
    const state = useAppStore.getState();
    expect(state.currentPage).toBe('landing');
    expect(state.sidebarOpen).toBe(true);
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.apiKey).toBe('');
  });

  it('sets current page', () => {
    useAppStore.getState().setPage('dashboard');
    expect(useAppStore.getState().currentPage).toBe('dashboard');
  });

  it('toggles sidebar', () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });

  it('toggles sidebar collapse', () => {
    useAppStore.getState().toggleSidebarCollapse();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    useAppStore.getState().toggleSidebarCollapse();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it('sets active panel', () => {
    useAppStore.getState().setActivePanel('tasks');
    expect(useAppStore.getState().activePanel).toBe('tasks');
  });

  it('sets API key', () => {
    useAppStore.getState().setApiKey('sk-test-key');
    expect(useAppStore.getState().apiKey).toBe('sk-test-key');
  });

  it('adds and clears notifications', () => {
    useAppStore.getState().addNotification({ type: 'info', message: 'Test notification' });
    expect(useAppStore.getState().notifications).toHaveLength(1);
    expect(useAppStore.getState().notifications[0].message).toBe('Test notification');
    expect(useAppStore.getState().notifications[0].id).toBeDefined();

    const nid = useAppStore.getState().notifications[0].id;
    useAppStore.getState().clearNotification(nid);
    expect(useAppStore.getState().notifications).toHaveLength(0);
  });
});
