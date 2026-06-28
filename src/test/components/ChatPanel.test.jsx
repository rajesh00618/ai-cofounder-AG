import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from '../../components/chat/ChatPanel';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ChatPanel', () => {
  it('renders chat messages', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];
    render(<ChatPanel messages={messages} onSend={() => {}} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(<ChatPanel messages={[]} onSend={() => {}} />);
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('calls onSend when input submitted', () => {
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Test message');
  });
});
