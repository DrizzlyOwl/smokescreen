import { renderHook, act } from '@testing-library/react';
import { useUrlSync, getInitialStateFromUrl, type UrlSyncState } from './useUrlSync';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useUrlSync hook', () => {
  const initialState: UrlSyncState = {
    severity: 'NOMINAL',
    stack: 'AWS',
    panes: {
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
    },
    theme: 'classic',
    isEcoMode: false,
    isDebugMode: false,
    isAudioOn: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL
    window.history.replaceState(null, '', '/');
  });

  it('correctly parses initial state from URL', () => {
    window.history.replaceState(null, '', '/?sev=P0&stack=GCP&theme=amber&panes=chat,logs');
    
    const state = getInitialStateFromUrl();
    
    expect(state.severity).toBe('P0');
    expect(state.stack).toBe('GCP');
    expect(state.theme).toBe('amber');
    expect(state.panes?.chat).toBe(true);
    expect(state.panes?.logs).toBe(true);
    expect(state.panes?.terminal).toBeUndefined(); // It only sets what's in the list
  });

  it('updates URL when state changes', () => {
    const onUpdate = vi.fn();
    const { rerender } = renderHook(
      ({ state }) => useUrlSync(state, onUpdate),
      { initialProps: { state: initialState } }
    );

    const newState: UrlSyncState = {
      ...initialState,
      severity: 'P1',
      theme: 'cobalt'
    };

    act(() => {
      rerender({ state: newState });
    });

    const params = new URLSearchParams(window.location.search);
    expect(params.get('sev')).toBe('P1');
    expect(params.get('theme')).toBe('cobalt');
  });

  it('calls onUpdate if URL has parameters on mount', () => {
    window.history.replaceState(null, '', '/?sev=P3');
    const onUpdate = vi.fn();
    
    renderHook(() => useUrlSync(initialState, onUpdate));
    
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'P3'
    }));
  });

  it('handles boolean flags (eco, debug, audio)', () => {
    window.history.replaceState(null, '', '/?eco=true&debug=true&audio=true');
    const state = getInitialStateFromUrl();
    expect(state.isEcoMode).toBe(true);
    expect(state.isDebugMode).toBe(true);
    expect(state.isAudioOn).toBe(true);
  });

  it('removes parameters from URL when state returns to default', () => {
    const onUpdate = vi.fn();
    
    // Start with non-default state
    const customState: UrlSyncState = {
      ...initialState,
      severity: 'P0',
      isEcoMode: true
    };
    
    const { rerender } = renderHook(
      ({ state }) => useUrlSync(state, onUpdate),
      { initialProps: { state: customState } }
    );

    // Verify initial URL
    expect(window.location.search).toContain('sev=P0');
    expect(window.location.search).toContain('eco=true');

    // Return to default
    const defaultState: UrlSyncState = {
        ...initialState,
        panes: { ...initialState.panes, terminal: false }
    };

    act(() => {
      rerender({ state: defaultState });
    });

    expect(window.location.search).toBe('');
  });
});
