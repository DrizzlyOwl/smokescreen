import { renderHook, act } from '@testing-library/react';
import { useIncidentState } from './useIncidentState';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

// Mock dependencies
vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playSlackPing: vi.fn(),
    playTagPing: vi.fn(),
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

vi.mock('./useUrlSync', () => ({
  useUrlSync: vi.fn(),
  getInitialStateFromUrl: vi.fn(() => ({}))
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

describe('Onboarding Tutorial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useIncidentStore.setState({
        ...useIncidentStore.getInitialState(),
        onboardingStep: 0 // Force onboarding
    });
    useTerminalStore.setState(useTerminalStore.getInitialState());
  });

  it('starts onboarding on first boot', () => {
    const { result } = renderHook(() => useIncidentState());
    
    // Trigger the READY state
    act(() => {
        result.current.setAppState('READY');
    });

    expect(result.current.onboardingStep).toBe(1);
    expect(result.current.terminalHistory).toContainEqual(
        expect.objectContaining({ text: '!!! OPERATOR CERTIFICATION REQUIRED !!!', type: 'error' })
    );
  });

  it('advances steps only with correct commands', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
        result.current.setAppState('READY');
    });

    // Try wrong command
    act(() => {
        result.current.handleCommand('help');
    });
    expect(result.current.onboardingStep).toBe(1);
    expect(result.current.terminalHistory[result.current.terminalHistory.length - 1].text).toContain("TYPE 'aws'");

    // Step 1: aws
    act(() => {
        result.current.handleCommand('aws');
    });
    expect(result.current.onboardingStep).toBe(2);
    expect(result.current.stack).toBe('AWS');

    // Step 2: p3
    act(() => {
        result.current.handleCommand('p3');
    });
    expect(result.current.onboardingStep).toBe(3);
    expect(result.current.severity).toBe('P3');

    // Step 3: declare
    act(() => {
        result.current.handleCommand('declare');
    });
    expect(result.current.onboardingStep).toBe(4);
    expect(result.current.isDeclared).toBe(true);

    // Step 4: resolve
    act(() => {
        // Need to simulate a mitigation count for resolve to work in the registry
        useIncidentStore.getState().incrementMitigationCount();
        result.current.handleCommand('resolve');
    });
    expect(result.current.onboardingStep).toBe(-1);
    expect(localStorage.getItem('smokescreen_onboarded')).toBe('true');
  });
});
