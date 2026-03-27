import type { Severity, Stack } from '../data/excuses';

export type AppState = 'SPLASH' | 'BOOT' | 'READY' | 'MOBILE_PAGER' | 'SHUTDOWN';
export type Theme = 'classic' | 'amber' | 'cobalt';

export interface TerminalContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  operatorName: string;
  setOperatorName: (name: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  uplinkId: string;
  setUplinkId: (id: string) => void;
  isDebugMode: boolean;
  setIsDebugMode: (enabled: boolean) => void;
}

export interface IncidentContextType {
  severity: Severity;
  stack: Stack;
  incidentReport: string;
  ticketId: string;
  status: string;
  moneyLost: number;
  isSlowBurn: boolean;
  slowBurnCountdown: number;
  totalSaved: number;
  setSeverity: (s: Severity) => void;
  setStack: (s: Stack) => void;
  setIncidentReport: (e: string) => void;
  setIsSlowBurn: (on: boolean) => void;
  declareIncident: (playAlert: (s: Severity) => void) => Promise<void>;
  ceaseTheatre: () => void;
}

export interface AudioContextType {
  isAudioOn: boolean;
  setIsAudioOn: (on: boolean) => void;
  initAudio: () => AudioContext | null;
  playSlackPing: () => void;
  playTeamsPing: () => void;
  playTagPing: () => void;
  playAlert: (type: Severity) => void;
  playLoginChime: () => void;
  playLogoutChime: () => void;
  playPostBeep: () => void;
  stopAllSounds: () => void;
}
