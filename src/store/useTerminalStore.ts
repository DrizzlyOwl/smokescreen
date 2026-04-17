import { create } from 'zustand';
import type { AppState, Theme } from '../contexts/types';
import { getInitialStateFromUrl } from '../hooks/useUrlSync';

interface TerminalStore {
  appState: AppState;
  setAppState: (state: AppState) => void;
  
  operatorName: string;
  setOperatorName: (name: string) => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  uplinkId: string;
  setUplinkId: (id: string) => void;
  regenerateUplinkId: () => void;
  
  isDebugMode: boolean;
  setIsDebugMode: (val: boolean) => void;
  
  isEcoMode: boolean;
  setIsEcoMode: (val: boolean) => void;

  commandHistory: string[];
  addCommandToHistory: (cmd: string) => void;
}

const urlState = getInitialStateFromUrl();

export const useTerminalStore = create<TerminalStore>((set) => ({
  appState: 'SPLASH',
  setAppState: (appState) => set({ appState }),
  
  operatorName: localStorage.getItem('operator_name') || '',
  setOperatorName: (operatorName) => {
    localStorage.setItem('operator_name', operatorName);
    set({ operatorName });
  },
  
  theme: (urlState.theme || localStorage.getItem('terminal_theme') || 'classic') as Theme,
  setTheme: (theme) => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('terminal_theme', theme);
    set({ theme });
  },
  
  uplinkId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  setUplinkId: (uplinkId) => set({ uplinkId }),
  regenerateUplinkId: () => set({ 
    uplinkId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}` 
  }),
  
  isDebugMode: urlState.isDebugMode ?? (localStorage.getItem('debug_mode') === 'true'),
  setIsDebugMode: (isDebugMode) => {
    localStorage.setItem('debug_mode', String(isDebugMode));
    set({ isDebugMode });
  },
  
  isEcoMode: urlState.isEcoMode ?? (localStorage.getItem('eco_mode') === 'true'),
  setIsEcoMode: (isEcoMode) => {
    localStorage.setItem('eco_mode', String(isEcoMode));
    if (isEcoMode) document.body.classList.add('eco-mode');
    else document.body.classList.remove('eco-mode');
    set({ isEcoMode });
  },

  commandHistory: [],
  addCommandToHistory: (cmd) => set((state) => ({
    // Only add if it's not the same as the last command to avoid duplicates
    commandHistory: state.commandHistory[state.commandHistory.length - 1] === cmd 
        ? state.commandHistory 
        : [...state.commandHistory, cmd].slice(-50) // Keep last 50 commands
  })),
}));
