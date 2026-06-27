import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPanel from '../../components/dashboard/SettingsPanel';
import { useAppStore } from '../../store/appStore';

beforeEach(() => {
  useAppStore.setState({ apiKey: '', setApiKey: vi.fn() });
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SettingsPanel', () => {
  it('renders without crashing', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ apiKeyConfigured: false }) });
    render(<SettingsPanel />);
    expect(await screen.findByText('Settings')).toBeInTheDocument();
  });

  it('shows API key input', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ apiKeyConfigured: false }) });
    render(<SettingsPanel />);
    expect(await screen.findByPlaceholderText(/sk-\.\.\./)).toBeInTheDocument();
  });

  it('shows server status indicator', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ apiKeyConfigured: false }) });
    render(<SettingsPanel />);
    expect(await screen.findByText(/No API key configured/i)).toBeInTheDocument();
  });
});
