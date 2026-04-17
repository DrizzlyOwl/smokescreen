import { create } from 'zustand';
import { generateIncidentReport, generateAIIncidentReport, type Severity, type Stack } from '../data/incidents';
import { getInitialStateFromUrl } from '../hooks/useUrlSync';
import type { Objective } from '../contexts/types';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

const initialState = getInitialStateFromUrl();

export interface ApprovalState {
  id: string;
  type: 'phrase' | 'hold' | 'slider';
  message: string;
  phrase?: string;
}

export interface TerminalOverrideState {
  code: string;
  message: string;
}

export type GameMode = 'ARCADE' | 'SANDBOX';

interface IncidentState {
  // Incident Core
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  selectedPlaybookId: string | null;
  setSelectedPlaybookId: (id: string | null) => void;
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
  mitigationScore: number;
  setMitigationScore: (updater: number | ((prev: number) => number)) => void;
  lastScoreEarned: number;
  mitigationCount: number;
  incrementMitigationCount: () => void;
  isDeclared: boolean;
  setIsDeclared: (val: boolean) => void;
  isResolving: boolean;
  setIsResolving: (val: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  activeBeacons: string[];
  addBeacon: (id: string) => void;
  removeBeacon: (id: string) => void;

  // Actions
  declareIncident: (playAlert: (s: Severity) => void) => Promise<void>;
  generateStrategy: () => Promise<void>;
  ceaseTheatre: () => void;
  tickSlowBurn: (playAlert: (s: Severity) => void, declare: (playAlertFn: (s: Severity) => void) => void) => void;

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
  logMultiplier: number;
  setLogMultiplier: (multiplier: number) => void;

  // Interactive Elements
  activeApproval: ApprovalState | null;
  setApproval: (approval: ApprovalState | null) => void;
  activeOverride: TerminalOverrideState | null;
  setOverride: (override: TerminalOverrideState | null) => void;

  // Mission HUD
  activeObjective: Objective | null;
  setObjective: (objective: Objective | null) => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  severity: initialState.severity || 'NOMINAL',
  setSeverity: (s) => set((state) => ({ 
    severity: s, 
    isSlowBurn: state.isSlowBurn, 
    isChaos: false, 
    incidentReport: '',
    slowBurnCountdown: 30,
    moneyLost: s === 'NOMINAL' ? 0 : state.moneyLost,
    status: s === 'NOMINAL' ? 'SYSTEMS NOMINAL' : 
            s === 'P3' ? 'MINOR DEGRADATION' : 
            s === 'P1' ? 'CRITICAL ALERT' : 'BREACH DETECTED'
  })),
  
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
  
  gameMode: 'SANDBOX',
  setGameMode: (gameMode) => set({ gameMode }),
  selectedPlaybookId: null,
  setSelectedPlaybookId: (selectedPlaybookId) => set({ selectedPlaybookId }),

  isSlowBurn: false,
  setIsSlowBurn: (isSlowBurn) => set({ isSlowBurn }),
  
  isChaos: false,
  setIsChaos: (isChaos) => set({ isChaos }),
  
  slowBurnCountdown: 30,
  setSlowBurnCountdown: (updater) => set((state) => ({ 
    slowBurnCountdown: typeof updater === 'function' ? updater(state.slowBurnCountdown) : updater 
  })),
  
  mitigationScore: parseInt(localStorage.getItem('mitigation_score') || '0'),
  setMitigationScore: (updater) => set((state) => {
    const next = typeof updater === 'function' ? updater(state.mitigationScore) : updater;
    localStorage.setItem('mitigation_score', next.toString());
    return { mitigationScore: next };
  }),
  lastScoreEarned: 0,
  mitigationCount: 0,
  incrementMitigationCount: () => set((state) => ({ mitigationCount: state.mitigationCount + 1 })),
  isDeclared: false,
  setIsDeclared: (isDeclared) => set({ isDeclared }),
  isResolving: false,
  setIsResolving: (isResolving) => set({ isResolving }),
  onboardingStep: localStorage.getItem('smokescreen_onboarded') === 'true' ? -1 : 0,
  setOnboardingStep: (onboardingStep) => {
    if (onboardingStep === -1) {
        localStorage.setItem('smokescreen_onboarded', 'true');
    }
    set({ onboardingStep });
  },

  activeBeacons: [],
  addBeacon: (id) => set((state) => ({ 
    activeBeacons: state.activeBeacons.includes(id) ? state.activeBeacons : [...state.activeBeacons, id] 
  })),
  removeBeacon: (id) => set((state) => ({ 
    activeBeacons: state.activeBeacons.filter(b => b !== id) 
  })),

  tickSlowBurn: (playAlert, declare) => {
    const { isSlowBurn, severity, slowBurnCountdown } = get();
    if (!isSlowBurn || severity === 'P0') return;

    if (slowBurnCountdown <= 1) {
        if (severity === 'NOMINAL') {
            set({ severity: 'P3', status: 'MINOR DEGRADATION', slowBurnCountdown: 30, isDeclared: true });
            declare(playAlert);
        } else if (severity === 'P3') {
            set({ severity: 'P1', status: 'CRITICAL ALERT', slowBurnCountdown: 30 });
            playAlert('P1');
        } else if (severity === 'P1') {
            set({ severity: 'P0', status: 'BREACH DETECTED', slowBurnCountdown: 0 });
            playAlert('P0');
        }
    } else {
        set({ slowBurnCountdown: slowBurnCountdown - 1 });
    }
  },

  declareIncident: async (playAlert) => {
    const { severity } = get();
    if (severity === 'NOMINAL') return;
    
    set((state) => ({ status: 'BREACH DETECTED', isSlowBurn: state.isSlowBurn, isDeclared: true }));
    playAlert(severity);
    await get().generateStrategy();
  },

  generateStrategy: async () => {
    const { severity, stack } = get();
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
        mitigationScore: get().mitigationScore + result.scoreEarned,
        lastScoreEarned: result.scoreEarned
    });
  },

  ceaseTheatre: () => set({
    severity: 'NOMINAL',
    incidentReport: '',
    ticketId: '',
    moneyLost: 0,
    isSlowBurn: false,
    isChaos: false,
    slowBurnCountdown: 30,
    status: 'SYSTEMS NOMINAL',
    isDeclared: false,
    gameMode: 'SANDBOX',
    selectedPlaybookId: null,
    activeBeacons: [],
    activeApproval: null,
    activeOverride: null,
    activeObjective: null,
    isResolving: false,
    mitigationCount: 0,
    lastScoreEarned: 0
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
  logMultiplier: 1,
  setLogMultiplier: (logMultiplier) => set({ logMultiplier }),

  // Interactive Elements
  activeApproval: null,
  setApproval: (activeApproval) => set({ activeApproval }),
  activeOverride: null,
  setOverride: (activeOverride) => set({ activeOverride }),

  // Mission HUD
  activeObjective: null,
  setObjective: (activeObjective) => set({ activeObjective }),
}));
