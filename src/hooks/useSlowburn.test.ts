import { renderHook, act } from '@testing-library/react';
import { useIncidentState } from './useIncidentState';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

// Mock dependencies
vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playSimplePing: vi.fn(),
    playDirectPing: vi.fn(),
    playAlert: vi.fn(),
    playLoginChime: vi.fn(),
    playLogoutChime: vi.fn(),
    playPostBeep: vi.fn(),
    playMitigationSuccess: vi.fn(),
    stopAllSounds: vi.fn(),
  })
}));

vi.mock('./useClientStats', () => ({
  useClientStats: () => ({
    gpu: 'MOCKED_GPU',
    batteryLevel: 80,
    isCharging: true,
    connectionType: '4g'
  })
}));

vi.mock('./useSync', () => ({
  useSync: () => ({
    send: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    isConnected: false,
    connectionStatus: 'DISCONNECTED',
    peerId: null,
    connectionCount: 0
  })
}));

vi.mock('./useIncidentChat', () => ({
  useIncidentChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    typingUsers: [],
    unreadCount: 0
  })
}));

vi.mock('./useDebugLogger', () => ({
  useDebugLogger: () => ({
    log: vi.fn()
  })
}));

describe('Slowburn Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useIncidentStore.setState(useIncidentStore.getInitialState());
    useTerminalStore.setState(useTerminalStore.getInitialState());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('escalates severity over time when slowburn is active', () => {
    const { result } = renderHook(() => useIncidentState());
    
    // 1. Engage slowburn
    act(() => {
        result.current.handleCommand('slowburn on');
    });
    expect(useIncidentStore.getState().isSlowBurn).toBe(true);
    expect(result.current.severity).toBe('NOMINAL');

    // 2. Advance 30 seconds -> Should hit P3
    act(() => {
        vi.advanceTimersByTime(30000);
    });
    expect(useIncidentStore.getState().severity).toBe('P3');
    expect(useIncidentStore.getState().isDeclared).toBe(true);
    expect(useIncidentStore.getState().slowBurnCountdown).toBe(30);

    // 3. Advance 30 more seconds -> Should hit P1
    act(() => {
        vi.advanceTimersByTime(30000);
    });
    expect(useIncidentStore.getState().severity).toBe('P1');
    expect(useIncidentStore.getState().slowBurnCountdown).toBe(30);

    // 4. Advance 30 more seconds -> Should hit P0
    act(() => {
        vi.advanceTimersByTime(30000);
    });
    expect(useIncidentStore.getState().severity).toBe('P0');
    expect(useIncidentStore.getState().slowBurnCountdown).toBe(0);
  });
});
