import { create } from 'zustand';
import type { AppState, Theme } from '../contexts/types';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from '../utils/storage';

interface TerminalStore {
  appState: AppState;
  setAppState: (state: AppState) => void;
  
  operatorName: string;
  setOperatorName: (name: string) => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  terminalId: string;
  setTerminalId: (id: string) => void;
  regenerateTerminalId: () => void;
  
  isDebugMode: boolean;
  setIsDebugMode: (val: boolean) => void;
  
  isEcoMode: boolean;
  setIsEcoMode: (val: boolean) => void;

  completedScenarios: string[];
  markScenarioCompleted: (id: string) => void;

  commandHistory: string[];
  addCommandToHistory: (cmd: string) => void;
  handleLogout: () => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  appState: 'BOOT',
  setAppState: (appState) => set({ appState }),
  
  operatorName: safeLocalStorageGet('operator_name', ''),
  setOperatorName: (operatorName) => {
    safeLocalStorageSet('operator_name', operatorName);
    set({ operatorName });
  },
  
  theme: safeLocalStorageGet('terminal_theme', 'classic') as Theme,
  setTheme: (theme) => {
    document.body.setAttribute('data-theme', theme);
    safeLocalStorageSet('terminal_theme', theme);
    set({ theme });
  },
  
  terminalId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  setTerminalId: (terminalId) => set({ terminalId }),
  regenerateTerminalId: () => set({ 
    terminalId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}` 
  }),
  
  isDebugMode: safeLocalStorageGet('debug_mode', false),
  setIsDebugMode: (isDebugMode) => {
    safeLocalStorageSet('debug_mode', isDebugMode);
    set({ isDebugMode });
  },
  
  isEcoMode: safeLocalStorageGet('eco_mode', false),
  setIsEcoMode: (isEcoMode) => {
    safeLocalStorageSet('eco_mode', isEcoMode);
    if (isEcoMode) document.body.classList.add('eco-mode');
    else document.body.classList.remove('eco-mode');
    set({ isEcoMode });
  },

  completedScenarios: safeLocalStorageGet<string[]>('completed_scenarios', []),
  markScenarioCompleted: (id) => set((state) => {
    if (state.completedScenarios.includes(id)) return state;
    const next = [...state.completedScenarios, id];
    safeLocalStorageSet('completed_scenarios', next);
    return { completedScenarios: next };
  }),

  commandHistory: [],
  addCommandToHistory: (cmd) => set((state) => ({
    // Only add if it's not the same as the last command to avoid duplicates
    commandHistory: state.commandHistory[state.commandHistory.length - 1] === cmd 
        ? state.commandHistory 
        : [...state.commandHistory, cmd].slice(-50) // Keep last 50 commands
  })),

  handleLogout: () => {
    safeLocalStorageRemove('operator_name');
    set({ appState: 'SHUTDOWN', operatorName: '' });
  },
}));
