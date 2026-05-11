import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useScenarioEngine } from './useScenarioEngine';
import type { Scenario } from '../data/scenarios/types';

describe('useScenarioEngine', () => {
  const mockProps = {
    sendMessage: vi.fn(),
    injectLog: vi.fn(),
    setSeverity: vi.fn(),
    setIsChaos: vi.fn(),
    addBeacon: vi.fn(),
    triggerApproval: vi.fn(),
    triggerOverride: vi.fn(),
    triggerInterrupt: vi.fn(),
    setObjective: vi.fn(),
    stack: 'AWS' as const,
    operatorName: 'Test Operator',
    declareIncident: vi.fn(),
  };

  const mockScenario: Scenario = {
    id: 'test-scenario',
    name: 'Test Scenario',
    description: 'Test Description',
    difficulty: 'L1',
    events: [
      {
        type: 'CHAT',
        offsetMs: 100,
        payload: { id: 'msg-1', user: 'Bot', text: 'Hello @operator from {{STACK}}', isBot: true }
      },
      {
        type: 'LOG',
        offsetMs: 200,
        payload: 'Log for @operator from {{STACK}}'
      },
      {
        type: 'SEVERITY',
        offsetMs: 300,
        payload: 'P0'
      },
      {
        type: 'CHAOS',
        offsetMs: 400,
        payload: true
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('executes events with correct timing and string interpolation', () => {
    const { result } = renderHook(() => useScenarioEngine(mockProps));
    
    act(() => {
      result.current.startScenario(mockScenario);
    });

    // 100ms: CHAT
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // In useScenarioEngine, bot name comes from getStackBot. 
    // For AWS, bot user 'Bot' might map to something else.
    // Let's just check if it's called.
    expect(mockProps.sendMessage).toHaveBeenCalled();
    const [text] = mockProps.sendMessage.mock.calls[0];
    expect(text).toContain('Hello @test from AWS');

    // 200ms: LOG
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.injectLog).toHaveBeenCalledWith('Log for @test from AWS');

    // 300ms: SEVERITY
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.setSeverity).toHaveBeenCalledWith('P0');
    expect(mockProps.declareIncident).toHaveBeenCalled();

    // 400ms: CHAOS
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.setIsChaos).toHaveBeenCalledWith(true);
  });

  it('stops a running scenario correctly', () => {
    const { result } = renderHook(() => useScenarioEngine(mockProps));
    
    act(() => {
      result.current.startScenario(mockScenario);
    });

    act(() => {
      vi.advanceTimersByTime(150); // CHAT executed
      result.current.stopScenario();
    });

    act(() => {
      vi.advanceTimersByTime(500); // Should have executed LOG, SEVERITY, CHAOS if not stopped
    });

    expect(mockProps.sendMessage).toHaveBeenCalled();
    expect(mockProps.injectLog).not.toHaveBeenCalled();
    expect(mockProps.setSeverity).not.toHaveBeenCalled();
    expect(mockProps.setIsChaos).toHaveBeenCalledWith(false); // Stop sets chaos to false
    expect(mockProps.setObjective).toHaveBeenCalledWith(null);
  });

  it('triggers beacons correctly', () => {
    const { result } = renderHook(() => useScenarioEngine(mockProps));
    const beaconScenario: Scenario = {
      id: 'beacon-s',
      name: 'Beacon Scenario',
      description: 'Test Beacons',
      difficulty: 'L1',
      events: [
        { type: 'BEACON', offsetMs: 100, payload: 'logs' }
      ]
    };

    act(() => {
      result.current.startScenario(beaconScenario);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockProps.addBeacon).toHaveBeenCalledWith('logs');
  });

  it('triggers game puzzles correctly', () => {
    const { result } = renderHook(() => useScenarioEngine(mockProps));
    const puzzleScenario: Scenario = {
      id: 'puzzle-s',
      name: 'Puzzle Scenario',
      description: 'Test Puzzles',
      difficulty: 'L1',
      events: [
        { type: 'APPROVAL', offsetMs: 100, payload: 'phrase' },
        { type: 'OVERRIDE', offsetMs: 200, payload: null },
        { type: 'INTERRUPT', offsetMs: 300, payload: null },
        { type: 'OBJECTIVE', offsetMs: 400, payload: { title: 'Test Obj', status: 'active' } }
      ]
    };

    act(() => {
      result.current.startScenario(puzzleScenario);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.triggerApproval).toHaveBeenCalledWith('phrase');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.triggerOverride).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.triggerInterrupt).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.setObjective).toHaveBeenCalledWith({ title: 'Test Obj', status: 'active' });
  });
});
