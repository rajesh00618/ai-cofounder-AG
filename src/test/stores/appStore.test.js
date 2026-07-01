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
    appError: null,
  });
});

describe('appStore', () => {
  it('has initial state', () => {
    const state = useAppStore.getState();
    expect(state.currentPage).toBe('landing');
    expect(state.sidebarOpen).toBe(true);
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.apiKey).toBe('');
    expect(state.appError).toBeNull();
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

  it('sets app error', () => {
    useAppStore.getState().setAppError('Something went wrong');
    expect(useAppStore.getState().appError).toBe('Something went wrong');
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

  it('resets to initial state', () => {
    useAppStore.getState().setPage('dashboard');
    useAppStore.getState().setApiKey('sk-test-key');
    useAppStore.getState().addNotification({ message: 'Test' });
    useAppStore.getState().resetApp();
    const state = useAppStore.getState();
    expect(state.currentPage).toBe('landing');
    expect(state.apiKey).toBe('');
    expect(state.notifications).toEqual([]);
    expect(state.appError).toBeNull();
  });

  it('partializes persisted state (excludes apiKey from localStorage)', () => {
    useAppStore.getState().setApiKey('sk-secret-key');
    useAppStore.getState().setPage('dashboard');
    const raw = localStorage.getItem('ai-cofounder-app-storage');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.state.currentPage).toBe('dashboard');
    expect(parsed.state.apiKey).toBeUndefined();
  });
});
