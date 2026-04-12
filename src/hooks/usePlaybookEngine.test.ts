import { renderHook, act } from '@testing-library/react';
import { usePlaybookEngine } from './usePlaybookEngine';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Playbook } from '../data/playbooks/types';

describe('usePlaybookEngine hook', () => {
  const mockProps = {
    sendMessage: vi.fn(),
    injectLog: vi.fn(),
    setSeverity: vi.fn(),
    setIsChaos: vi.fn()
  };
const mockPlaybook: Playbook = {
  id: 'test-playbook',
  name: 'Test Playbook',
  description: 'Testing',
  events: [
      { type: 'CHAT', offsetMs: 100, payload: { user: 'Bot', text: 'Hello', id: '1', isBot: true } },
      { type: 'LOG', offsetMs: 200, payload: 'System error' },
      { type: 'SEVERITY', offsetMs: 300, payload: 'P0' },
      { type: 'CHAOS', offsetMs: 400, payload: true }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('starts a playbook and executes events in sequence', () => {
    const { result } = renderHook(() => usePlaybookEngine(mockProps));
    
    act(() => {
      result.current.startPlaybook(mockPlaybook);
    });
    
    expect(result.current.activePlaybook).toBe(mockPlaybook);

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockProps.sendMessage).toHaveBeenCalledWith('Hello', 'Bot', '1', true);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.injectLog).toHaveBeenCalledWith('System error');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.setSeverity).toHaveBeenCalledWith('P0');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockProps.setIsChaos).toHaveBeenCalledWith(true);
  });

  it('stops a playbook and clears timeouts', () => {
    const { result } = renderHook(() => usePlaybookEngine(mockProps));
    
    act(() => {
      result.current.startPlaybook(mockPlaybook);
    });
    
    act(() => {
      result.current.stopPlaybook();
    });
    
    expect(result.current.activePlaybook).toBeNull();
    expect(mockProps.setIsChaos).toHaveBeenCalledWith(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // No more calls should have happened
    expect(mockProps.sendMessage).not.toHaveBeenCalled();
  });

  it('automatically clears activePlaybook state when finished', () => {
    const { result } = renderHook(() => usePlaybookEngine(mockProps));
    
    act(() => {
      result.current.startPlaybook(mockPlaybook);
    });
    
    act(() => {
      vi.advanceTimersByTime(600); // Beyond the last event + buffer
    });
    
    expect(result.current.activePlaybook).toBeNull();
  });
});
