import { useEffect, useRef } from 'react';
import type { Severity, Stack } from '../data/excuses';
import type { PanesState } from './useWindowManager';

interface SyncState {
  severity: Severity;
  stack: Stack;
  panes: PanesState;
}

export const useUrlSync = (
  state: SyncState,
  onUpdate: (state: Partial<SyncState>) => void
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
    const updates: Partial<SyncState> = {};

    if (params.has('sev')) updates.severity = params.get('sev') as Severity;
    if (params.has('stack')) updates.stack = params.get('stack') as Stack;
    
    if (params.has('panes')) {
      try {
        const activePanes = params.get('panes')?.split(',') || [];
        const panesUpdate: Partial<PanesState> = {};
        activePanes.forEach(p => {
          if (p) panesUpdate[p as keyof PanesState] = true;
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
  }, []); // Only on mount

  // Sync state to URL - use stringified panes to avoid object reference changes
  const panesStr = JSON.stringify(state.panes);

  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();
    if (state.severity !== 'NOMINAL') params.set('sev', state.severity);
    if (state.stack !== 'AWS') params.set('stack', state.stack);
    
    const activePanes = Object.entries(state.panes)
      .filter(([, active]) => active)
      .map(([id]) => id)
      .join(',');
    
    if (activePanes) params.set('panes', activePanes);

    const newQuery = params.toString() ? '?' + params.toString() : '';
    const currentQuery = window.location.search;

    if (newQuery !== currentQuery) {
        const newRelativePathQuery = window.location.pathname + newQuery;
        window.history.replaceState(null, '', newRelativePathQuery);
    }
  }, [state.severity, state.stack, panesStr, state.panes]);
};
