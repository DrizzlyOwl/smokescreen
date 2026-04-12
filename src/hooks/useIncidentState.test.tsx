import { renderHook, act } from '@testing-library/react';
import { useIncidentState } from './useIncidentState';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('useIncidentState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset stores
    useIncidentStore.setState(useIncidentStore.getInitialState());
    useTerminalStore.setState(useTerminalStore.getInitialState());
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useIncidentState());
    
    expect(result.current.appState).toBe('SPLASH');
    expect(result.current.operatorName).toBe('');
    expect(result.current.severity).toBe('NOMINAL');
  });

  it('sets operator name and shifts app state to BOOT', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.setOperatorName('ASH');
      result.current.setAppState('BOOT');
    });
    
    expect(result.current.operatorName).toBe('ASH');
    expect(result.current.appState).toBe('BOOT');
  });

  it('handles commands via registryHandleCommand', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.handleCommand('p0');
    });
    
    expect(useIncidentStore.getState().severity).toBe('P0');
  });

  it('opens How-To pane on first visit', () => {
    localStorage.removeItem('smokescreen_visited');
    const { result } = renderHook(() => useIncidentState());
    
    expect(result.current.panes.howTo).toBe(true);
    expect(localStorage.getItem('smokescreen_visited')).toBe('true');
  });

  it('resolves theatre correctly', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.handleCommand('p0');
      result.current.handleCommand('declare');
      result.current.handleCommand('resolve');
    });
    
    expect(useIncidentStore.getState().severity).toBe('NOMINAL');
    expect(useIncidentStore.getState().incidentReport).toBe('');
  });
});
