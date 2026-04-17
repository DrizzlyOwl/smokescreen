import { renderHook, act } from '@testing-library/react';
import { useWindowManager, type PanesState } from './useWindowManager';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useWindowManager', () => {
  const initialPanes: PanesState = {
    chat: false,
    logs: false,
    terminal: true,
    map: false,
    deploy: false,
    burn: false,
    howTo: false,
    settings: false,
    metrics: false,
    playbooks: false,
    readout: false,
    debug: false
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('initializes with provided panes state', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    expect(result.current.panes.terminal).toBe(true);
    expect(result.current.panes.chat).toBe(false);
  });

  it('opens a pane and brings it to front', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.openPane('chat');
    });
    
    expect(result.current.panes.chat).toBe(true);
    expect(result.current.activePane).toBe('chat');
    expect(result.current.minimizedPanes.chat).toBe(false);
  });

  it('closes a pane', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.openPane('chat');
      result.current.closePane('chat');
    });
    
    expect(result.current.panes.chat).toBe(false);
    expect(result.current.activePane).toBeNull();
  });

  it('toggles a pane', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.togglePane('chat');
    });
    expect(result.current.panes.chat).toBe(true);
    
    // Simulate the settimeout call in togglePane
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.activePane).toBe('chat');

    act(() => {
      result.current.togglePane('chat');
    });
    expect(result.current.panes.chat).toBe(false);
  });

  it('minimizes and restores a pane', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.toggleMinimize('terminal');
    });
    expect(result.current.minimizedPanes.terminal).toBe(true);

    act(() => {
      result.current.setMinimized('terminal', false);
    });
    expect(result.current.minimizedPanes.terminal).toBe(false);
  });

  it('toggles pop out state', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.togglePopOut('terminal');
    });
    expect(result.current.poppedOutPanes.terminal).toBe(true);

    act(() => {
      result.current.togglePopOut('terminal');
    });
    expect(result.current.poppedOutPanes.terminal).toBe(false);
  });

  it('toggles snapped main state', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.toggleSnapMain('chat');
    });
    expect(result.current.snappedMainPanes.chat).toBe(true);

    act(() => {
      result.current.toggleSnapMain('chat');
    });
    expect(result.current.snappedMainPanes.chat).toBe(false);
  });

  it('brings a pane to front and increments z-index', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    const initialZ = result.current.zIndices.chat;
    
    act(() => {
      result.current.bringToFront('chat');
    });
    
    expect(result.current.zIndices.chat).toBeGreaterThan(initialZ);
    expect(result.current.activePane).toBe('chat');
  });

  it('normalizes z-indices when they exceed threshold', () => {
    // Manually push z-index above 2000
    act(() => {
      // We can't directly set z-indices from outside, but we can call bringToFront repeatedly
      // Or we can mock the localStorage saved state
      localStorage.setItem('smokescreen_zindices', JSON.stringify({
        chat: 2005,
        logs: 100,
        terminal: 101
      }));
    });

    // Re-render hook to pick up localStorage
    const { result: newResult } = renderHook(() => useWindowManager(initialPanes));

    act(() => {
      newResult.current.bringToFront('logs');
    });

    // It should have normalized back to a lower range
    expect(newResult.current.zIndices.logs).toBeLessThan(2000);
    expect(newResult.current.zIndices.chat).toBeLessThan(2000);
  });

  it('closes all panes (except locked terminal)', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.openPane('chat');
      result.current.openPane('logs');
      result.current.closeAll();
    });
    
    expect(result.current.panes.chat).toBe(false);
    expect(result.current.panes.logs).toBe(false);
    expect(result.current.panes.terminal).toBe(true); // Locked
    expect(result.current.activePane).toBeNull();
  });

  it('opens all panes', () => {
    const { result } = renderHook(() => useWindowManager(initialPanes));
    
    act(() => {
      result.current.openAll();
    });
    
    Object.values(result.current.panes).forEach(val => {
      expect(val).toBe(true);
    });
  });
});
