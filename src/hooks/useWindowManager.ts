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
  | 'debug';

export type PanesState = Record<PaneId, boolean>;
export type ZIndicesState = Record<PaneId, number>;

export const useWindowManager = (initialPanes: PanesState) => {
  const [panes, setPanes] = useState<PanesState>(initialPanes);
  const [zIndices, setZIndices] = useState<ZIndicesState>({
    chat: 100,
    logs: 101,
    map: 102,
    deploy: 103,
    burn: 104,
    pager: 105,
    howTo: 106,
    settings: 107,
    metrics: 108,
    debug: 109,
  });
  const [activePane, setActivePane] = useState<PaneId | null>(null);

  const bringToFront = useCallback((paneId: PaneId) => {
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev));
      const nextZ = currentMax + 1;
      return { ...prev, [paneId]: nextZ };
    });
    setActivePane(paneId);
  }, []);

  const openPane = useCallback(
    (paneId: PaneId) => {
      setPanes((prev) => ({ ...prev, [paneId]: true }));
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
          // Delaying bringToFront to avoid state batching issues if needed,
          // but calling it here is fine since we use functional updates.
          setTimeout(() => bringToFront(paneId), 0);
        }
        return { ...prev, [paneId]: nextState };
      });
    },
    [bringToFront]
  );

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
    zIndices,
    activePane,
    openPane,
    closePane,
    togglePane,
    bringToFront,
    closeAll,
    openAll,
    setActivePane,
    setPanes
  };
};
