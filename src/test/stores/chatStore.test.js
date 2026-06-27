import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../../store/chatStore';

beforeEach(() => {
  useChatStore.setState({
    messages: [],
    isThinking: false,
    thinkingStep: '',
    confidence: null,
    activeAgent: 'ceo',
    boardMeetingActive: false,
    debateActive: false,
    investorModeActive: false,
    customerSimActive: false,
  });
});

describe('chatStore', () => {
  it('has initial state', () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isThinking).toBe(false);
    expect(state.activeAgent).toBe('ceo');
  });

  it('adds a message with id and timestamp', () => {
    useChatStore.getState().addMessage({ role: 'user', content: 'Hello' });
    const msg = useChatStore.getState().messages[0];
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello');
    expect(msg.id).toBeDefined();
    expect(msg.timestamp).toBeDefined();
    expect(new Date(msg.timestamp).toISOString()).toBe(msg.timestamp);
  });

  it('adds a message with custom id', () => {
    useChatStore.getState().addMessage({ id: 'custom-1', role: 'assistant', content: 'Hi' });
    expect(useChatStore.getState().messages[0].id).toBe('custom-1');
  });

  it('updates a message by id', () => {
    useChatStore.getState().addMessage({ id: 'msg-1', role: 'assistant', content: 'Initial', confidence: 50 });
    useChatStore.getState().updateMessage('msg-1', { content: 'Updated', confidence: 90 });
    const msg = useChatStore.getState().messages[0];
    expect(msg.content).toBe('Updated');
    expect(msg.confidence).toBe(90);
    expect(msg.role).toBe('assistant');
  });

  it('updates non-existent message does nothing', () => {
    useChatStore.getState().addMessage({ role: 'user', content: 'Hello' });
    useChatStore.getState().updateMessage('non-existent', { content: 'Nope' });
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].content).toBe('Hello');
  });

  it('sets thinking state', () => {
    useChatStore.getState().setThinking(true);
    expect(useChatStore.getState().isThinking).toBe(true);
    useChatStore.getState().setThinking(false);
    expect(useChatStore.getState().isThinking).toBe(false);
  });

  it('sets thinking step', () => {
    useChatStore.getState().setThinkingStep('Analyzing...');
    expect(useChatStore.getState().thinkingStep).toBe('Analyzing...');
  });

  it('sets confidence', () => {
    useChatStore.getState().setConfidence(85);
    expect(useChatStore.getState().confidence).toBe(85);
  });

  it('sets active agent', () => {
    useChatStore.getState().setActiveAgent('cto');
    expect(useChatStore.getState().activeAgent).toBe('cto');
  });

  it('toggles mode flags', () => {
    useChatStore.getState().setBoardMeeting(true);
    expect(useChatStore.getState().boardMeetingActive).toBe(true);
    useChatStore.getState().setDebate(true);
    expect(useChatStore.getState().debateActive).toBe(true);
    useChatStore.getState().setInvestorMode(true);
    expect(useChatStore.getState().investorModeActive).toBe(true);
    useChatStore.getState().setCustomerSim(true);
    expect(useChatStore.getState().customerSimActive).toBe(true);
  });

  it('clears all messages', () => {
    useChatStore.getState().addMessage({ role: 'user', content: 'M1' });
    useChatStore.getState().addMessage({ role: 'assistant', content: 'M2' });
    expect(useChatStore.getState().messages).toHaveLength(2);
    useChatStore.getState().clearMessages();
    expect(useChatStore.getState().messages).toEqual([]);
  });
});
