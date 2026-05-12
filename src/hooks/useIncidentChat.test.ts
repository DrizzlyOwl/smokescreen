import { renderHook, act } from '@testing-library/react';
import { useIncidentChat } from './useIncidentChat';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SyncPayload } from '../contexts/types';

const mockSend = vi.fn();
const mockSubscribe = vi.fn((handler: (data: SyncPayload) => void) => {
  // Store handler to trigger it manually in tests if needed
  (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler = handler;
  return vi.fn();
});

// ... (rest of the file)

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

vi.mock('../utils/chatGenerator', () => ({
  generateDynamicMessage: vi.fn(async () => ({
    user: 'Bot',
    text: 'Dynamic message',
    isBot: true
  }))
}));

describe('useIncidentChat hook', () => {
  const mockOnNewMessage = vi.fn();
  const mockPlayPing = vi.fn();
  const mockPlayDirectPing = vi.fn();

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
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
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
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm1', text: 'Hi', user: 'Bot', time: '12:00', isBot: true }
      });
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
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
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage, mockPlayPing, mockPlayDirectPing
    ));

    act(() => {
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
        type: 'CHAT_MESSAGE',
        message: { id: 'm1', text: 'Hello @operator', user: 'Bot', time: '12:00', isBot: true }
      });
    });

    expect(mockPlayDirectPing).toHaveBeenCalled();
    expect(mockOnNewMessage).toHaveBeenCalledWith(true);
  });

  it('updates typing indicators', () => {
    const { result } = renderHook(() => useIncidentChat(
      'NOMINAL', 'AWS', 'Operator', 'room-1', mockOnNewMessage
    ));

    act(() => {
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
        type: 'TYPING_INDICATOR',
        user: 'BotUser',
        isTyping: true
      });
    });

    expect(result.current.typingUsers).toContain('BotUser');

    act(() => {
      (globalThis as unknown as { chatHandler: (data: SyncPayload) => void }).chatHandler({
        type: 'TYPING_INDICATOR',
        user: 'BotUser',
        isTyping: false
      });
    });

    expect(result.current.typingUsers).not.toContain('BotUser');
  });

  it('adds a system message when severity level is updated', () => {
    const { rerender, result } = renderHook(
      ({ severity }) => useIncidentChat(severity, 'AWS', 'Operator', 'room-1', mockOnNewMessage),
      { initialProps: { severity: 'NOMINAL' as import('../data/incidents').Severity } }
    );

    act(() => {
      rerender({ severity: 'P0' as import('../data/incidents').Severity });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.messages[0].text).toContain('--- ALERT LEVEL UPDATED TO P0 [AWS] ---');
    expect(result.current.messages[0].user).toBe('Smokescreen');
  });

  it('respects chatMultiplier for message delays', async () => {
    // chatMultiplier = 0.1 (10x faster)
    renderHook(() => useIncidentChat(
      'P0', 'AWS', 'Operator', 'room-1', mockOnNewMessage, mockPlayPing, mockPlayDirectPing, true, false, 0.1
    ));

    // Base delay for P0 is 3000ms. With 0.1 multiplier it's 300ms.
    await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
    });

    // Check if send was called for typing indicator
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TYPING_INDICATOR',
        isTyping: true
    }));
  });
});
