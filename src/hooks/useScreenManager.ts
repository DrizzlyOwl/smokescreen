import { useState, useCallback } from 'react';

/**
 * Screen IDs for full-viewport screens.
 * Note: 'terminal' is NOT a screen - it's a persistent strip at the bottom.
 * Note: 'debug' is NOT a screen - it's an overlay panel.
 */
export type ScreenId =
  | 'logs'
  | 'deploy'
  | 'chat'
  | 'tactical'
  | 'map'
  | 'burn'
  | 'playbooks'
  | 'incidentPlaybook'
  | 'readout'
  | 'settings'
  | 'howTo';

/**
 * Mapping of Ctrl+key shortcuts to screen IDs.
 * Ctrl+1 through Ctrl+0, plus Ctrl+/ for help.
 */
export const SCREEN_SHORTCUTS: Record<string, ScreenId> = {
  '1': 'logs',
  '2': 'deploy',
  '3': 'chat',
  '4': 'tactical',
  '5': 'map',
  '6': 'burn',
  '7': 'playbooks',
  '8': 'incidentPlaybook',
  '9': 'readout',
  '0': 'settings',
  '/': 'howTo',
};

/**
 * Reverse mapping: screen ID to shortcut key.
 */
export const SCREEN_TO_SHORTCUT: Record<ScreenId, string> = {
  logs: '1',
  deploy: '2',
  chat: '3',
  tactical: '4',
  map: '5',
  burn: '6',
  playbooks: '7',
  incidentPlaybook: '8',
  readout: '9',
  settings: '0',
  howTo: '/',
};

/**
 * Display labels for each screen (used in CommandStrip).
 * Max 4 characters for consistent width.
 */
export const SCREEN_LABELS: Record<ScreenId, string> = {
  logs: 'LOGS',
  deploy: 'PODS',
  chat: 'CHAT',
  tactical: 'TACT',
  map: 'MAP',
  burn: 'BURN',
  playbooks: 'LOAD',
  incidentPlaybook: 'PLAY',
  readout: 'READ',
  settings: 'CONF',
  howTo: 'HELP',
};

/**
 * Default terminal height in pixels (reset on each page load).
 */
export const DEFAULT_TERMINAL_HEIGHT = 200;

/**
 * Minimum terminal height when expanded.
 */
export const MIN_TERMINAL_HEIGHT = 100;

/**
 * Maximum terminal height as percentage of viewport.
 */
export const MAX_TERMINAL_HEIGHT_PERCENT = 0.6;

export interface ScreenManagerState {
  activeScreen: ScreenId;
  terminalHeight: number;
  terminalCollapsed: boolean;
  debugOpen: boolean;
}

export interface ScreenManagerActions extends ScreenManagerState {
  setActiveScreen: (id: ScreenId) => void;
  setTerminalHeight: (height: number) => void;
  toggleTerminalCollapsed: () => void;
  expandTerminal: () => void;
  collapseTerminal: () => void;
  toggleDebug: () => void;
  openDebug: () => void;
  closeDebug: () => void;
}

/**
 * Hook for managing screen-based navigation.
 * 
 * Replaces the old useWindowManager with a simpler model:
 * - One active screen at a time (full viewport)
 * - Persistent terminal strip at bottom (resizable, collapsible)
 * - Debug overlay (toggleable on any screen)
 * 
 * @param initialScreen - The screen to show on mount (default: 'howTo')
 */
export const useScreenManager = (
  initialScreen: ScreenId = 'howTo'
): ScreenManagerActions => {
  const [activeScreen, setActiveScreenState] = useState<ScreenId>(initialScreen);
  const [terminalHeight, setTerminalHeightState] = useState<number>(DEFAULT_TERMINAL_HEIGHT);
  const [terminalCollapsed, setTerminalCollapsed] = useState<boolean>(false);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);

  const setActiveScreen = useCallback((id: ScreenId) => {
    setActiveScreenState(id);
  }, []);

  const setTerminalHeight = useCallback((height: number) => {
    // Clamp between min and max
    const maxHeight = window.innerHeight * MAX_TERMINAL_HEIGHT_PERCENT;
    const clampedHeight = Math.max(MIN_TERMINAL_HEIGHT, Math.min(height, maxHeight));
    setTerminalHeightState(clampedHeight);
  }, []);

  const toggleTerminalCollapsed = useCallback(() => {
    setTerminalCollapsed(prev => !prev);
  }, []);

  const expandTerminal = useCallback(() => {
    setTerminalCollapsed(false);
  }, []);

  const collapseTerminal = useCallback(() => {
    setTerminalCollapsed(true);
  }, []);

  const toggleDebug = useCallback(() => {
    setDebugOpen(prev => !prev);
  }, []);

  const openDebug = useCallback(() => {
    setDebugOpen(true);
  }, []);

  const closeDebug = useCallback(() => {
    setDebugOpen(false);
  }, []);

  return {
    // State
    activeScreen,
    terminalHeight,
    terminalCollapsed,
    debugOpen,
    // Actions
    setActiveScreen,
    setTerminalHeight,
    toggleTerminalCollapsed,
    expandTerminal,
    collapseTerminal,
    toggleDebug,
    openDebug,
    closeDebug,
  };
};
