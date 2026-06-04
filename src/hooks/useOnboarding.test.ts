import { renderHook, act } from '@testing-library/react';
import { useIncidentState } from './useIncidentState';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('Onboarding Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useIncidentStore.setState(useIncidentStore.getInitialState());
    useTerminalStore.setState(useTerminalStore.getInitialState());
  });

  it('shows arcade specific welcome on first boot in arcade mode', () => {
    useIncidentStore.setState({ gameMode: 'ARCADE' });
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
        result.current.setAppState('READY');
    });

    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: '--- ARCADE_MODE_ACTIVE ---', type: 'system' })
    );
    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: '!!! OPERATOR_CERTIFICATION_REQUIRED !!!', type: 'error' })
    );
    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: "TYPE 'scenario l0-certification' TO BEGIN TRAINING.", type: 'system' })
    );
  });

  it('shows sandbox specific welcome on first boot in sandbox mode', () => {
    useIncidentStore.setState({ gameMode: 'SANDBOX' });
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
        result.current.setAppState('READY');
    });

    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: '--- SANDBOX_MODE_ACTIVE ---', type: 'system' })
    );
    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: "TYPE 'help' FOR SYSTEM_MANUAL.", type: 'system' })
    );
    expect(result.current.onboardingStep).toBe(-1);
  });
});
