import type { Severity, Stack } from '../data/incidents';

export type AppState = 'SPLASH' | 'BOOT' | 'READY' | 'SHUTDOWN' | 'TERMINATED';
export type Theme = 'classic' | 'amber' | 'cobalt' | 'dracula' | 'monokai' | 'cyberpunk' | 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isBot: boolean;
  read?: boolean;
  avatarUrl?: string;
  bio?: string;
}

export interface DebugLogEntry {
  timestamp: string;
  action: string;
  data: string;
}

export interface Objective {
  title: string;
  status: 'pending' | 'warning' | 'active' | 'complete';
}

export type SyncPayload = 
  | { type: 'CHAT_MESSAGE', message: ChatMessage }
  | { type: 'LOG_MESSAGE', log: string }
  | { type: 'STATE_UPDATE', severity: Severity, stack: Stack }
  | { type: 'TYPING_INDICATOR', user: string, isTyping: boolean }
  | { type: 'DEBUG_LOG', log: DebugLogEntry }
  | { type: 'HEARTBEAT', timestamp: number };

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface SyncContextType {
  send: (data: SyncPayload) => void;
  subscribe: (handler: (data: SyncPayload) => void) => () => void;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  peerId: string | null;
  connectionCount: number;
}

export interface TerminalContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  operatorName: string;
  setOperatorName: (name: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  terminalId: string;
  setTerminalId: (id: string) => void;
  isDebugMode: boolean;
  setIsDebugMode: (enabled: boolean) => void;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
  isAudioOn: boolean;
  setIsAudioOn: (on: boolean) => void;
  regenerateTerminalId: () => void;
}


export interface IncidentContextType {
  severity: Severity;
  stack: Stack;
  incidentReport: string;
  ticketId: string;
  status: string;
  moneyLost: number;
  isSlowBurn: boolean;
  isChaos: boolean;
  slowBurnCountdown: number;
  mitigationScore: number;
  setSeverity: (s: Severity) => void;
  setStack: (s: Stack) => void;
  setIncidentReport: (e: string) => void;
  setIsSlowBurn: (on: boolean) => void;
  setIsChaos: (on: boolean) => void;
  declareIncident: (playAlert: (s: Severity) => void) => Promise<void>;
  ceaseTheatre: () => void;
}

export interface AudioContextType {
  isAudioOn: boolean;
  setIsAudioOn: (on: boolean) => void;
  initAudio: () => AudioContext | null;
  playSimplePing: () => void;
  playSequencePing: () => void;
  playDirectPing: () => void;
  playAlert: (type: Severity) => void;
  playDegauss: () => void;
  playLoginChime: () => void;
  playLogoutChime: () => void;
  playPostBeep: () => void;
  playMitigationSuccess: () => void;
  stopAllSounds: () => void;
}
