import { useEffect, useRef } from 'react';
import type { Severity, Stack } from '../data/incidents';
import type { PanesState, PaneId } from './useWindowManager';
import type { Theme } from '../contexts/types';

export interface UrlSyncState {
  severity: Severity;
  stack: Stack;
  panes: PanesState;
  theme: Theme;
  isEcoMode: boolean;
  isDebugMode: boolean;
  isAudioOn: boolean;
}

export const useUrlSync = (
  state: UrlSyncState,
  onUpdate: (state: Partial<UrlSyncState>) => void
) => {
  const isInitialMount = useRef(true);
  const onUpdateRef = useRef(onUpdate);

  // Keep ref up to date
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Initial load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const updates: Partial<UrlSyncState> = {};

    if (params.has('sev')) updates.severity = params.get('sev') as Severity;
    if (params.has('stack')) updates.stack = params.get('stack') as Stack;
    if (params.has('theme')) updates.theme = params.get('theme') as Theme;
    if (params.has('eco')) updates.isEcoMode = params.get('eco') === 'true';
    if (params.has('debug')) updates.isDebugMode = params.get('debug') === 'true';
    if (params.has('audio')) updates.isAudioOn = params.get('audio') === 'true';
    
    if (params.has('panes')) {
      try {
        const activePanes = params.get('panes')?.split(',') || [];
        const panesUpdate: Partial<PanesState> = {};
        activePanes.forEach(p => {
          if (p) panesUpdate[p as PaneId] = true;
        });
        updates.panes = panesUpdate as PanesState;
      } catch {
        console.error('Failed to parse panes from URL');
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdateRef.current(updates);
    }
    
    isInitialMount.current = false;
  }, []); 

  // Sync state to URL
  const panesStr = JSON.stringify(state.panes);

  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams(window.location.search);
    
    if (state.severity !== 'NOMINAL') params.set('sev', state.severity);
    else params.delete('sev');

    if (state.stack !== 'AWS') params.set('stack', state.stack);
    else params.delete('stack');

    if (state.theme !== 'classic') params.set('theme', state.theme);
    else params.delete('theme');

    if (state.isEcoMode) params.set('eco', 'true');
    else params.delete('eco');

    if (state.isDebugMode) params.set('debug', 'true');
    else params.delete('debug');

    if (state.isAudioOn) params.set('audio', 'true');
    else params.delete('audio');
    
    const activePanes = Object.entries(state.panes)
      .filter(([, active]) => active)
      .map(([id]) => id)
      .join(',');
    
    if (activePanes) params.set('panes', activePanes);
    else params.delete('panes');

    const newQuery = params.toString() ? '?' + params.toString() : '';
    const currentQuery = window.location.search;

    if (newQuery !== currentQuery) {
        const newRelativePathQuery = window.location.pathname + newQuery;
        window.history.replaceState(null, '', newRelativePathQuery);
    }
  }, [state.severity, state.stack, state.theme, state.isEcoMode, state.isDebugMode, state.isAudioOn, state.panes, panesStr]);
};

export const getInitialStateFromUrl = (): Partial<UrlSyncState> => {
    const params = new URLSearchParams(window.location.search);
    const state: Partial<UrlSyncState> = {};

    if (params.has('sev')) state.severity = params.get('sev') as Severity;
    if (params.has('stack')) state.stack = params.get('stack') as Stack;
    if (params.has('theme')) state.theme = params.get('theme') as Theme;
    if (params.has('eco')) state.isEcoMode = params.get('eco') === 'true';
    if (params.has('debug')) state.isDebugMode = params.get('debug') === 'true';
    if (params.has('audio')) state.isAudioOn = params.get('audio') === 'true';
    
    if (params.has('panes')) {
        const activePanes = params.get('panes')?.split(',') || [];
        const panes: Partial<PanesState> = {};
        activePanes.forEach(p => {
            if (p) panes[p as PaneId] = true;
        });
        state.panes = panes as PanesState;
    }

    return state;
};
