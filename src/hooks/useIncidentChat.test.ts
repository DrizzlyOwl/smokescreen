import { renderHook, act } from '@testing-library/react';
import { useIncidentChat } from './useIncidentChat';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();
const mockSubscribe = vi.fn((handler) => {
  // Store handler to trigger it manually in tests if needed
  (globalThis as any).chatHandler = handler;
  return vi.fn();
});

// Mock dependencies
vi.mock('./useSync', () => ({
  useSync: vi.fn(() => ({
    send: mockSend,
    subscribe: mockSubscribe
  }))
}));

vi.mock('../utils/avatarGenerator', () => ({
  generateBitmapAvatar: vi.fn(() => 'mock-avatar-url')
}));

describe('useIncidentChat hook', () => {
  const mockOnNewMessage = vi.fn();
  const mockPlayPing = vi.fn();
  const mockPlayTagPing = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('sends a message via useSync', () => {
    const { result } = renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage
    ));

    act(() => {
      result.current.sendMessage('Hello', 'Operator');
    });

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      type: 'CHAT_MESSAGE',
      message: expect.objectContaining({
        text: 'Hello',
        user: 'Operator'
      })
    }));
  });

  it('marks messages as read', () => {
    const { result } = renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage
    ));

    // Simulate incoming message
    act(() => {
      (globalThis as any).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm1', text: 'Hi', user: 'Bot', time: '12:00', isBot: true }
      });
    });

    expect(result.current.messages[0].read).toBe(false);

    act(() => {
      result.current.markAsRead('m1');
    });

    expect(result.current.messages[0].read).toBe(true);
  });

  it('marks all as read', () => {
    const { result } = renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage
    ));

    act(() => {
      (globalThis as any).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm1', text: 'Hi', user: 'Bot', time: '12:00', isBot: true }
      });
      (globalThis as any).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm2', text: 'Hi again', user: 'Bot', time: '12:01', isBot: true }
      });
    });

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.messages.every(m => m.read)).toBe(true);
  });

  it('plays tag ping when @ is present in incoming message', () => {
    renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage, mockPlayPing, mockPlayTagPing
    ));

    act(() => {
      (globalThis as any).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm1', text: 'Hello @operator', user: 'Bot', time: '12:00', isBot: true }
      });
    });

    expect(mockPlayTagPing).toHaveBeenCalled();
    expect(mockOnNewMessage).toHaveBeenCalledWith(true);
  });

  it('updates typing indicators', () => {
    const { result } = renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage
    ));

    act(() => {
      (globalThis as any).chatHandler({
        type: 'TYPING_INDICATOR',
        user: 'BotUser',
        isTyping: true
      });
    });

    expect(result.current.typingUsers).toContain('BotUser');

    act(() => {
      (globalThis as any).chatHandler({
        type: 'TYPING_INDICATOR',
        user: 'BotUser',
        isTyping: false
      });
    });

    expect(result.current.typingUsers).not.toContain('BotUser');
  });
});
