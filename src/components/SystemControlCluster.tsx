import React from 'react';
import { StatusBar } from './StatusBar';
import { PaneGrid } from './PaneGrid';
import { CommandStrip } from './CommandStrip';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Severity, Stack } from '../data/incidents';
import type { PaneId, WindowManagerActions } from '../hooks/useWindowManager';
import type { ChatMessage, Objective } from '../contexts/types';
import type { ApprovalState, TerminalOverrideState, GameMode } from '../store/useIncidentStore';
import type { CommandResult, TerminalLine } from '../hooks/useIncidentState';
import type { Command } from '../hooks/useCommandRegistry';
import type { Scenario } from '../data/scenarios/types';
import type { Theme } from '../contexts/types';

export interface SystemControlClusterProps extends WindowManagerActions {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  isEcoMode: boolean;
  setIsEcoMode: (val: boolean) => void;
  gameMode: GameMode;
  activeObjective: Objective | null;
  currentEventIndex: number;
  loggedTogglePane: (id: PaneId) => void;
  addCommandToHistory: (cmd: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  playLoginChime: () => void;
  playLogoutChime: () => void;
  playPostBeep: () => void;
  playMitigationSuccess: () => void;
  stopAllSounds: () => void;
  isAudioOn: boolean;
  setIsAudioOn: (on: boolean) => void;
  ticketId: string;
  activeApproval: ApprovalState | null;
  setApproval: (approval: ApprovalState | null) => void;
  activeOverride: TerminalOverrideState | null;
  setOverride: (override: TerminalOverrideState | null) => void;
  setObjective: (obj: Objective | null) => void;
  startScenario: (p: Scenario) => void;
  stopScenario: () => void;
  resumeScenario: () => void;
  onFocus: (id: PaneId) => void;
  onClose: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  onPopOutToggle: (id: PaneId) => void;
  onSnapMainToggle: (id: PaneId) => void;
  isChaos: boolean;
  setIsChaos: (on: boolean) => void;
  activeBeacons: string[];
  addBeacon: (id: string) => void;
  displayText: string;
  setDisplayText: (text: string) => void;
  logMultiplier: number;
  setLogMultiplier: (m: number) => void;
  chatMultiplier: number;
  setChatMultiplier: (multiplier: number) => void;
  setIsResolving: (on: boolean) => void;
  setIsDebugMode: (on: boolean) => void;
  isPaused: boolean;
  setIsPaused: (on: boolean) => void;
  operatorName: string;
  activeScenario: Scenario | null;
  completedScenarios: string[];
  handleCommand: (cmd: string) => CommandResult;
  handleLogout: () => void;
  moneyLost: number;
  lastScoreEarned: number;
  bringToFront: (id: PaneId) => void;
  terminalId: string;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  typingUsers: string[];
  commands: Command[];
  executeCeaseTheatre: () => void;
  incidentReport: string;
  setIncidentReport: (r: string) => void;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  commandHistory: string[];
  isDeployStabilized: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  unreadChat: number;
  mitigationCount: number;
  declareIncident: (playAlert: (s: Severity) => void) => Promise<void>;
  loggedHandleDeclare: () => void;
}

export const SystemControlCluster: React.FC<SystemControlClusterProps> = (props) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Handle global keyboard shortcuts
  useKeyboardShortcuts({
    loggedTogglePane: props.loggedTogglePane,
    togglePause: () => props.setIsPaused(!props.isPaused),
    isDeclared: props.isDeclared
  });
  // Handle auto-scroll for readout
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [props.displayText]);

  const handleTerminalCommand = (cmd: string): boolean => {
    props.addCommandToHistory(cmd);
    const result = props.handleCommand(cmd);
    return result.isValid;
  };

  const actionableEvents = props.activeScenario?.events.filter(e => 
    e.type === 'OBJECTIVE' && (e.payload as Objective).status !== 'complete'
  ) || [];
  
  const currentActionableCount = props.activeScenario?.events
    .slice(0, (props.currentEventIndex ?? -1) + 1)
    .filter(e => e.type === 'OBJECTIVE' && (e.payload as Objective).status !== 'complete').length || 0;

  return (
    <div className="cluster-layout">
      <StatusBar 
        severity={props.severity}
        stack={props.stack}
        isDeclared={props.isDeclared}
        isEcoMode={props.isEcoMode}
        setIsEcoMode={props.setIsEcoMode}
        gameMode={props.gameMode}
        activeObjective={props.activeObjective}
        playbookProgress={{ 
          current: Math.max(1, currentActionableCount), 
          total: actionableEvents.length 
        }}
      />
      <PaneGrid
        {...props}
        onCommand={handleTerminalCommand}
        onSelectScenario={props.startScenario}
        scrollRef={scrollRef}
      />
      <CommandStrip 
        panes={props.panes} 
        loggedTogglePane={props.loggedTogglePane} 
        handleLogout={props.handleLogout}
        severity={props.severity}
        isDeclared={props.isDeclared}
        onDeclare={props.loggedHandleDeclare}
        onResolve={props.executeCeaseTheatre}
        mitigationCount={props.mitigationCount}
        unreadChat={props.unreadChat}
        gameMode={props.gameMode}
      />
    </div>
  );
};

