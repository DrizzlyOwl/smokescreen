import { NodeType } from '../utils/nodeTypes';
import { create } from 'zustand';
import { type Severity, type Stack } from '../data/incidents';
import { getInitialStateFromUrl } from '../hooks/useUrlSync';
import type { Objective } from '../contexts/types';
import { incidentService } from '../services/incidentService';
import { reportService } from '../services/reportService';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

export interface CommandResult {
  isValid: boolean;
  message?: string;
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

export interface ExecutiveInterruption {
  id: string;
  execName: string;
  deadline: number;
  penalty: number;
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
  isDeployStabilized: boolean;
  setIsDeployStabilized: (val: boolean) => void;
  isResolving: boolean;
  setIsResolving: (val: boolean) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  activeBeacons: string[];
  addBeacon: (id: string) => void;
  removeBeacon: (id: string) => void;
  serviceHealth: Record<string, 'UP' | 'DN'>;
  updateServiceNode: (name: string, status: 'UP' | 'DN') => void;
  healNodes: (type: NodeType) => void;
  strikes: number;
  timeInP0: number;
  setStrikes: (s: number | ((prev: number) => number)) => void;
  setTimeInP0: (t: number | ((prev: number) => number)) => void;
  deductStrike: () => void;

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
  activeInterruption: ExecutiveInterruption | null;
  setInterruption: (interruption: ExecutiveInterruption | null) => void;

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
  isDeployStabilized: true,
  setIsDeployStabilized: (isDeployStabilized) => set({ isDeployStabilized }),
  isResolving: false,
  setIsResolving: (isResolving) => set({ isResolving }),
  isPaused: false,
  setIsPaused: (isPaused) => set({ isPaused }),
  onboardingStep: localStorage.getItem('smokescreen_onboarded') === 'true' ? -1 : 0,
  setOnboardingStep: (onboardingStep) => {
    if (onboardingStep === -1) {
        localStorage.setItem('smokescreen_onboarded', 'true');
    }
    set({ onboardingStep });
  },

  strikes: 5,
  timeInP0: 0,
  setStrikes: (updater) => set((state) => ({ 
    strikes: typeof updater === 'function' ? updater(state.strikes) : updater 
  })),
  setTimeInP0: (updater) => set((state) => ({ 
    timeInP0: typeof updater === 'function' ? updater(state.timeInP0) : updater 
  })),
  deductStrike: () => set((state) => ({ 
    strikes: state.gameMode === 'SANDBOX' ? state.strikes : Math.max(0, state.strikes - 1) 
  })),

  activeBeacons: [],
  addBeacon: (id) => set((state) => ({ 
    activeBeacons: state.activeBeacons.includes(id) ? state.activeBeacons : [...state.activeBeacons, id] 
  })),
  removeBeacon: (id) => set((state) => ({ 
    activeBeacons: state.activeBeacons.filter(b => b !== id) 
  })),

  serviceHealth: {},
  updateServiceNode: (name, status) => set((state) => ({
    serviceHealth: { ...state.serviceHealth, [name]: status }
  })),

  healNodes: (type) => set((state) => {
    const { nextHealth, scoreBonus } = incidentService.calculateHealing(state.serviceHealth, type);
    
    if (scoreBonus > 0) {
        state.setMitigationScore(prev => prev + scoreBonus);
    }

    return { serviceHealth: nextHealth };
  }),

  tickSlowBurn: (playAlert, declare) => {
    const { isSlowBurn, severity, slowBurnCountdown } = get();
    if (!isSlowBurn || severity === 'P0') return;

    const nextState = incidentService.getNextSlowBurnState(severity, slowBurnCountdown);
    
    if (nextState.nextSeverity !== severity || nextState.nextCountdown !== slowBurnCountdown) {
        const update: Partial<IncidentState> = {
            slowBurnCountdown: nextState.nextCountdown
        };

        if (nextState.nextSeverity !== severity) {
            update.severity = nextState.nextSeverity;
            if (nextState.nextStatus) update.status = nextState.nextStatus;
            if (nextState.shouldDeclare) update.isDeclared = true;
        }

        set(update);

        if (nextState.shouldDeclare) {
            declare(playAlert);
        } else if (nextState.playAlert) {
            playAlert(nextState.playAlert);
        }
    }
  },

  declareIncident: async (playAlert) => {
    const { severity, stack } = get();
    if (severity === 'NOMINAL') return;
    
    const initialHealth = incidentService.generateFailedNodes(stack);

    set((state) => ({ 
        status: 'BREACH DETECTED', 
        isSlowBurn: state.isSlowBurn, 
        isDeclared: true, 
        isDeployStabilized: false,
        serviceHealth: initialHealth
    }));
    playAlert(severity);
    await get().generateStrategy();
  },

  generateStrategy: async () => {
    const { severity, stack } = get();
    const apiKey = localStorage.getItem('gemini_api_key');
    let result;
    if (apiKey) {
        result = await reportService.generateAIIncidentReport(severity, stack, apiKey);
    } else {
        result = reportService.generateIncidentReport(severity, stack);
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
    serviceHealth: {},
    activeApproval: null,
    activeOverride: null,
    activeInterruption: null,
    activeObjective: null,
    strikes: 5,
    timeInP0: 0,
    isResolving: false,
    isDeployStabilized: true,
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
  activeInterruption: null,
  setInterruption: (activeInterruption) => set({ activeInterruption }),

  // Mission HUD
  activeObjective: null,
  setObjective: (activeObjective) => set({ activeObjective }),
}));
