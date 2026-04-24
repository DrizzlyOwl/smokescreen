import { useState, useCallback } from 'react';

export type PaneId =
  | 'chat'
  | 'logs'
  | 'map'
  | 'deploy'
  | 'burn'
  | 'howTo'
  | 'settings'
  | 'metrics'
  | 'playbooks'
  | 'incidentPlaybook'
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
      howTo: 106,
      settings: 107,
      metrics: 108,
      playbooks: 109,
      incidentPlaybook: 110,
      readout: 111,
      terminal: 112,
      debug: 113,
    };
  });
  const [activePane, setActivePane] = useState<PaneId | null>(null);
  const [poppedOutPanes, setPoppedOutPanes] = useState<Record<PaneId, boolean>>(() => {
    const state: Partial<Record<PaneId, boolean>> = {};
    (Object.keys(initialPanes) as PaneId[]).forEach(id => {
      state[id] = false;
    });
    return state as Record<PaneId, boolean>;
  });

  const [snappedMainPanes, setSnappedMainPanes] = useState<Record<PaneId, boolean>>(() => {
    const state: Partial<Record<PaneId, boolean>> = {};
    (Object.keys(initialPanes) as PaneId[]).forEach(id => {
      state[id] = false;
    });
    return state as Record<PaneId, boolean>;
  });

  const togglePopOut = useCallback((paneId: PaneId) => {
    setPoppedOutPanes(prev => ({ ...prev, [paneId]: !prev[paneId] }));
  }, []);

  const toggleSnapMain = useCallback((paneId: PaneId) => {
    setSnappedMainPanes(prev => ({ ...prev, [paneId]: !prev[paneId] }));
  }, []);

  const bringToFront = useCallback((paneId: PaneId) => {
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev));
      
      // If this pane is already at the top and there are other panes, 
      // we don't necessarily need to increment, but doing it anyway is safer.
      // However, to prevent infinite growth, if we're above a threshold, we can normalize.
      
      let nextState: ZIndicesState;
      
      if (currentMax > 2000) {
        // Normalize all z-indices back to a lower range starting from 100
        const sortedIds = (Object.keys(prev) as PaneId[]).sort((a, b) => prev[a] - prev[b]);
        nextState = {} as ZIndicesState;
        sortedIds.forEach((id, index) => {
          nextState[id] = 100 + index;
        });
        // Ensure the current one is at the absolute top
        nextState[paneId] = 100 + sortedIds.length;
      } else {
        const nextZ = currentMax + 1;
        nextState = { ...prev, [paneId]: nextZ };
      }
      
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
    if (paneId === 'terminal') return;
    setPanes((prev) => ({ ...prev, [paneId]: false }));
    setActivePane((current) => (current === paneId ? null : current));
  }, []);

  const togglePane = useCallback(
    (paneId: PaneId) => {
      if (paneId === 'terminal') return;
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
        next[key] = key === 'terminal';
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
    poppedOutPanes,
    snappedMainPanes,
    activePane,
    openPane,
    closePane,
    togglePane,
    toggleMinimize,
    togglePopOut,
    toggleSnapMain,
    setMinimized,
    bringToFront,
    closeAll,
    openAll,
    setActivePane,
    setPanes
  };
};
