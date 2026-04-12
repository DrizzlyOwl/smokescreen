import { create } from 'zustand';
import { generateIncidentReport, generateAIIncidentReport, type Severity, type Stack } from '../data/incidents';
import { getInitialStateFromUrl } from '../hooks/useUrlSync';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

const initialState = getInitialStateFromUrl();

interface IncidentState {
  // Incident Core
  severity: Severity;
  setSeverity: (s: Severity) => void;
  stack: Stack;
  setStack: (s: Stack) => void;
  incidentReport: string;
  setIncidentReport: (r: string) => void;
  ticketId: string;
  setTicketId: (id: string) => void;
  status: string;
  setStatus: (s: string) => void;
  moneyLost: number;
  setMoneyLost: (updater: number | ((prev: number) => number)) => void;
  isSlowBurn: boolean;
  setIsSlowBurn: (val: boolean) => void;
  isChaos: boolean;
  setIsChaos: (val: boolean) => void;
  slowBurnCountdown: number;
  setSlowBurnCountdown: (updater: number | ((prev: number) => number)) => void;
  totalSaved: number;
  setTotalSaved: (updater: number | ((prev: number) => number)) => void;

  // Actions
  declareIncident: (playAlert: (s: Severity) => void) => Promise<void>;
  ceaseTheatre: () => void;

  // UI State
  unreadChat: number;
  setUnreadChat: (count: number | ((prev: number) => number)) => void;
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  terminalHistory: TerminalLine[];
  setTerminalHistory: (updater: TerminalLine[] | ((prev: TerminalLine[]) => TerminalLine[])) => void;
  addTerminalLine: (line: TerminalLine) => void;
  displayText: string;
  setDisplayText: (text: string) => void;
  view: 'HOME' | 'TICKET';
  setView: (view: 'HOME' | 'TICKET') => void;
  chatMultiplier: number;
  setChatMultiplier: (multiplier: number) => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  severity: initialState.severity || 'NOMINAL',
  setSeverity: (s) => set({ 
    severity: s, 
    isSlowBurn: false, 
    isChaos: false, 
    incidentReport: '',
    moneyLost: s === 'NOMINAL' ? 0 : get().moneyLost,
    status: s === 'NOMINAL' ? 'SYSTEMS NOMINAL' : 
            s === 'P3' ? 'MINOR DEGRADATION' : 
            s === 'P1' ? 'CRITICAL ALERT' : 'BREACH DETECTED'
  }),
  
  stack: initialState.stack || 'AWS',
  setStack: (stack) => set({ stack }),
  
  incidentReport: '',
  setIncidentReport: (incidentReport) => set({ incidentReport }),
  
  ticketId: '',
  setTicketId: (ticketId) => set({ ticketId }),
  
  status: 'SYSTEMS NOMINAL',
  setStatus: (status) => set({ status }),
  
  moneyLost: 0,
  setMoneyLost: (updater) => set((state) => ({ 
    moneyLost: typeof updater === 'function' ? updater(state.moneyLost) : updater 
  })),
  
  isSlowBurn: false,
  setIsSlowBurn: (isSlowBurn) => set({ isSlowBurn }),
  
  isChaos: false,
  setIsChaos: (isChaos) => set({ isChaos }),
  
  slowBurnCountdown: 30,
  setSlowBurnCountdown: (updater) => set((state) => ({ 
    slowBurnCountdown: typeof updater === 'function' ? updater(state.slowBurnCountdown) : updater 
  })),
  
  totalSaved: parseInt(localStorage.getItem('saved_minutes') || '0'),
  setTotalSaved: (updater) => set((state) => {
    const next = typeof updater === 'function' ? updater(state.totalSaved) : updater;
    localStorage.setItem('saved_minutes', next.toString());
    return { totalSaved: next };
  }),

  declareIncident: async (playAlert) => {
    const { severity, stack } = get();
    if (severity === 'NOMINAL') return;
    
    set({ status: 'BREACH DETECTED' });
    playAlert(severity);
    
    const apiKey = localStorage.getItem('gemini_api_key');
    let result;
    if (apiKey) {
        result = await generateAIIncidentReport(severity, stack, apiKey);
    } else {
        result = generateIncidentReport(severity, stack);
    }
    
    set({ 
        incidentReport: result.text,
        ticketId: result.ticketId,
        totalSaved: get().totalSaved + result.timeSaved,
        isSlowBurn: false
    });
  },

  ceaseTheatre: () => set({
    severity: 'NOMINAL',
    incidentReport: '',
    ticketId: '',
    moneyLost: 0,
    isSlowBurn: false,
    isChaos: false,
    status: 'SYSTEMS NOMINAL'
  }),

  // UI state from existing store
  unreadChat: 0,
  setUnreadChat: (updater) => set((state) => ({ 
    unreadChat: typeof updater === 'function' ? updater(state.unreadChat) : updater 
  })),
  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  terminalHistory: [],
  setTerminalHistory: (updater) => set((state) => ({ 
    terminalHistory: typeof updater === 'function' ? updater(state.terminalHistory) : updater 
  })),
  addTerminalLine: (line) => set((state) => ({ 
    terminalHistory: [...state.terminalHistory, line] 
  })),
  displayText: '',
  setDisplayText: (displayText) => set({ displayText }),
  view: 'HOME',
  setView: (view) => set({ view }),
  chatMultiplier: 1,
  setChatMultiplier: (chatMultiplier) => set({ chatMultiplier }),
}));
