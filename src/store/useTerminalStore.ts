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

const urlState = getInitialStateFromUrl();

export const useTerminalStore = create<TerminalStore>((set) => ({
  appState: 'BOOT',
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
  
  terminalId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  setTerminalId: (terminalId) => set({ terminalId }),
  regenerateTerminalId: () => set({ 
    terminalId: `SRE-${Math.random().toString(36).substring(2, 6).toUpperCase()}` 
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

  completedScenarios: JSON.parse(localStorage.getItem('completed_scenarios') || '[]'),
  markScenarioCompleted: (id) => set((state) => {
    if (state.completedScenarios.includes(id)) return state;
    const next = [...state.completedScenarios, id];
    localStorage.setItem('completed_scenarios', JSON.stringify(next));
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
    localStorage.removeItem('operator_name');
    set({ appState: 'SHUTDOWN', operatorName: '' });
  },
}));
