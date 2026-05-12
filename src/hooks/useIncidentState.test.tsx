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

let urlSyncCallback: (updates: import('./useUrlSync').UrlSyncState) => void = () => {};
vi.mock('./useUrlSync', () => ({
  useUrlSync: vi.fn((_state, onUpdate) => {
    urlSyncCallback = onUpdate;
  }),
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    renderHook(() => useIncidentState());
    
    expect(useTerminalStore.getState().appState).toBe('BOOT');
    expect(useTerminalStore.getState().operatorName).toBe('');
    expect(useIncidentStore.getState().severity).toBe('NOMINAL');
  });

  it('enforces Locked Terminal architecture', () => {
    const { result } = renderHook(() => useIncidentState());
    
    // Attempt to close terminal
    act(() => {
      result.current.closePane('terminal');
    });
    expect(result.current.panes.terminal).toBe(true);

    // Attempt to toggle terminal
    act(() => {
      result.current.togglePane('terminal');
    });
    expect(result.current.panes.terminal).toBe(true);

    // Attempt to close all
    act(() => {
      result.current.closeAll();
    });
    expect(result.current.panes.terminal).toBe(true);
  });

  it('handles Terminal Overrides successfully', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      useIncidentStore.setState({ 
        severity: 'P0',
        isDeclared: true,
        incidentReport: 'Test Report'
      });
    });

    // Mock Math.random to hit Terminal Override threshold
    // threshold for P0 is 0.4. Override is roll > threshold - 0.1 (0.3)
    // We want roll > 0.4 to trigger Approval first, then on next tick trigger Override
    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.8); // First tick: triggers Approval

    act(() => {
        vi.advanceTimersByTime(15000);
    });

    expect(useIncidentStore.getState().activeApproval).not.toBeNull();
    
    // Second tick: roll 0.35 -> triggers Override because activeApproval is set
    randomSpy.mockReturnValue(0.35); 
    act(() => {
        vi.advanceTimersByTime(15000);
    });

    const store = useIncidentStore.getState();
    expect(store.activeOverride).not.toBeNull();
    const overrideCode = store.activeOverride?.code || '';

    // Typing wrong code should penalize
    const initialMoney = store.moneyLost;
    act(() => {
      result.current.handleCommand('WRONG_CODE');
    });
    expect(useIncidentStore.getState().moneyLost).toBeGreaterThan(initialMoney);

    // Typing correct code should resolve
    act(() => {
      result.current.handleCommand(overrideCode);
    });
    expect(useIncidentStore.getState().activeOverride).toBeNull();
    expect(useIncidentStore.getState().mitigationCount).toBe(1);
    
    randomSpy.mockRestore();
  });

  it('handles Executive Interruptions', async () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      useIncidentStore.setState({ 
        severity: 'P0',
        isDeclared: true,
        incidentReport: 'Test Report',
        gameMode: 'ARCADE',
        strikes: 5
      });
    });

    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.1); 
    
    // Trigger the interruption
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    const store = useIncidentStore.getState();
    expect(store.activeInterruption).not.toBeNull();

    // Advance timers in small chunks to ensure intervals and effects process
    for (let i = 0; i < 70; i++) {
        act(() => {
            vi.advanceTimersByTime(1000);
        });
    }

    const midStore = useIncidentStore.getState();
    expect(midStore.strikes).toBe(4);
    expect(midStore.activeInterruption).toBeNull();

    // Now test successful resolution
    act(() => {
        randomSpy.mockReturnValue(0.1);
        vi.advanceTimersByTime(15000);
    });

    expect(useIncidentStore.getState().activeInterruption).not.toBeNull();
    
    act(() => {
        result.current.handleCommand('sitrep');
    });

    expect(useIncidentStore.getState().activeInterruption).toBeNull();
    expect(useIncidentStore.getState().mitigationScore).toBeGreaterThan(0);
    
    randomSpy.mockRestore();
  });

  it('sets operator name and shifts app state to READY', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.setOperatorName('ASH');
      result.current.setAppState('READY');
    });
    
    expect(result.current.operatorName).toBe('ASH');
    expect(result.current.appState).toBe('READY');
  });

  it('resolves theatre correctly after mitigation', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      useIncidentStore.setState({ 
        severity: 'NOMINAL', // Severity must be nominal to resolve
        isDeclared: true,
        incidentReport: 'Test Report',
        mitigationCount: 0
      });
    });

    // Attempt resolution without mitigation - should fail
    act(() => {
      result.current.handleCommand('resolve');
    });
    expect(useIncidentStore.getState().isResolving).toBe(false);

    // Perform mitigation
    act(() => {
      useIncidentStore.getState().incrementMitigationCount();
    });

    // Resolve now should trigger AAR
    act(() => {
      result.current.handleCommand('resolve');
    });
    
    expect(useIncidentStore.getState().isResolving).toBe(true);

    // Finalize resolution
    act(() => {
      result.current.executeCeaseTheatre();
    });

    expect(useIncidentStore.getState().severity).toBe('NOMINAL');
    expect(useIncidentStore.getState().isDeclared).toBe(false);
  });

  it('triggers Remediation Guard error when resolving without mitigation', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      useIncidentStore.setState({ 
        isDeclared: true,
        incidentReport: 'Test',
        mitigationCount: 0
      });
    });

    act(() => {
      result.current.handleCommand('resolve');
    });

    expect(result.current.terminalHistory.some(line => 
      line.text.includes('RESOLUTION DENIED')
    )).toBe(true);
  });

  it('handles updates from URL synchronization', () => {
    renderHook(() => useIncidentState());
    
    act(() => {
      urlSyncCallback({
        severity: 'P0',
        stack: 'GCP',
        theme: 'amber',
        isEcoMode: true,
        isDebugMode: true,
        isAudioOn: true,
        panes: { 
          chat: true, logs: false, map: false, deploy: false, burn: false, 
          howTo: false, settings: false, playbooks: false,
 
          incidentPlaybook: false, readout: false, terminal: false, debug: false 
        }
      });
      useIncidentStore.setState({ isDeployStabilized: true });
    });

    const state = useIncidentStore.getState();
    expect(state.severity).toBe('P0');
    expect(state.stack).toBe('GCP');
    expect(useTerminalStore.getState().theme).toBe('amber');
    expect(useTerminalStore.getState().isEcoMode).toBe(true);
    expect(useTerminalStore.getState().isDebugMode).toBe(true);
  });

  it('provides logged callbacks for state transitions', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.loggedSetStack('GCP');
      result.current.loggedSetSeverity('P1');
      result.current.loggedSetIsSlowBurn(true);
      result.current.loggedHandleDeclare();
    });

    const state = useIncidentStore.getState();
    expect(state.stack).toBe('GCP');
    expect(state.severity).toBe('P1');
    expect(state.isSlowBurn).toBe(true);
    expect(state.isDeclared).toBe(true);
  });

  it('provides window management callbacks', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.bringToFront('chat');
      result.current.loggedTogglePane('logs');
    });

    expect(result.current.activePane).toBe('chat');
    expect(result.current.panes.logs).toBe(true);
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useIncidentState());
    
    act(() => {
      result.current.handleLogout();
    });

    expect(useTerminalStore.getState().appState).toBe('SHUTDOWN');
  });
});
