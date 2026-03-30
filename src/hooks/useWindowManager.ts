import { useState, useCallback } from 'react';

export type PaneId =
  | 'chat'
  | 'logs'
  | 'map'
  | 'deploy'
  | 'burn'
  | 'pager'
  | 'howTo'
  | 'settings'
  | 'metrics'
  | 'playbooks'
  | 'readout'
  | 'terminal'
  | 'debug';

export type PanesState = Record<PaneId, boolean>;
export type MinimizedState = Record<PaneId, boolean>;
export type ZIndicesState = Record<PaneId, number>;

export const useWindowManager = (initialPanes: PanesState) => {
  const [panes, setPanes] = useState<PanesState>(initialPanes);
  const [minimizedPanes, setMinimizedPanes] = useState<MinimizedState>(() => {
    const state: Partial<MinimizedState> = {};
    (Object.keys(initialPanes) as PaneId[]).forEach(id => {
      state[id] = false;
    });
    return state as MinimizedState;
  });

  const [zIndices, setZIndices] = useState<ZIndicesState>(() => {
    const saved = localStorage.getItem('smokescreen_zindices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load zIndices from storage', e);
      }
    }
    return {
      chat: 100,
      logs: 101,
      map: 102,
      deploy: 103,
      burn: 104,
      pager: 105,
      howTo: 106,
      settings: 107,
      metrics: 108,
      playbooks: 109,
      readout: 110,
      terminal: 111,
      debug: 112,
    };
  });
  const [activePane, setActivePane] = useState<PaneId | null>(null);

  const bringToFront = useCallback((paneId: PaneId) => {
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev));
      const nextZ = currentMax + 1;
      const nextState = { ...prev, [paneId]: nextZ };
      localStorage.setItem('smokescreen_zindices', JSON.stringify(nextState));
      return nextState;
    });
    setActivePane(paneId);
  }, []);

  const openPane = useCallback(
    (paneId: PaneId) => {
      setPanes((prev) => ({ ...prev, [paneId]: true }));
      setMinimizedPanes(prev => ({ ...prev, [paneId]: false }));
      bringToFront(paneId);
    },
    [bringToFront]
  );

  const closePane = useCallback((paneId: PaneId) => {
    setPanes((prev) => ({ ...prev, [paneId]: false }));
    setActivePane((current) => (current === paneId ? null : current));
  }, []);

  const togglePane = useCallback(
    (paneId: PaneId) => {
      setPanes((prev) => {
        const nextState = !prev[paneId];
        if (nextState) {
          setTimeout(() => bringToFront(paneId), 0);
          setMinimizedPanes(m => ({ ...m, [paneId]: false }));
        }
        return { ...prev, [paneId]: nextState };
      });
    },
    [bringToFront]
  );

  const toggleMinimize = useCallback((paneId: PaneId) => {
    setMinimizedPanes(prev => ({ ...prev, [paneId]: !prev[paneId] }));
  }, []);

  const setMinimized = useCallback((paneId: PaneId, minimized: boolean) => {
    setMinimizedPanes(prev => ({ ...prev, [paneId]: minimized }));
  }, []);

  const closeAll = useCallback(() => {
    setPanes((prev) => {
      const next: Partial<PanesState> = {};
      (Object.keys(prev) as PaneId[]).forEach((key) => {
        next[key] = false;
      });
      return next as PanesState;
    });
    setActivePane(null);
  }, []);

  const openAll = useCallback(() => {
    setPanes((prev) => {
      const next: Partial<PanesState> = {};
      (Object.keys(prev) as PaneId[]).forEach((key) => {
        next[key] = true;
      });
      return next as PanesState;
    });
    // Brute force bring everything to front in sequence
    (Object.keys(panes) as PaneId[]).forEach((id) => bringToFront(id));
  }, [bringToFront, panes]);

  return {
    panes,
    minimizedPanes,
    zIndices,
    activePane,
    openPane,
    closePane,
    togglePane,
    toggleMinimize,
    setMinimized,
    bringToFront,
    closeAll,
    openAll,
    setActivePane,
    setPanes
  };
};
