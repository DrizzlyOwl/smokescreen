import React from 'react';
import { StatusBar } from './StatusBar';
import { CommandStrip } from './CommandStrip';
import { PaneGrid } from './PaneGrid';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Severity, Stack } from '../data/incidents';
import type { PaneId, PanesState, MinimizedState, ZIndicesState } from '../hooks/useWindowManager';
import type { TerminalLine, CommandResult } from '../hooks/useIncidentState';
import type { ChatMessage } from '../contexts/types';
import type { Command } from '../hooks/useCommandRegistry';
import '../styles/SystemControlCluster.scss';

import type { ApprovalState, TerminalOverrideState } from '../store/useIncidentStore';
import type { Playbook } from '../data/playbooks/types';
import type { Objective, Theme } from '../contexts/types';

export interface SystemControlClusterProps {
  panes: PanesState;
  minimizedPanes: MinimizedState;
  zIndices: ZIndicesState;
  poppedOutPanes: Record<PaneId, boolean>;
  snappedMainPanes: Record<PaneId, boolean>;
  activePane: PaneId | null;
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  incidentReport: string;
  setIncidentReport: (report: string) => void;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  commandHistory: string[];
  addCommandToHistory: (cmd: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setView: (view: 'HOME' | 'TICKET') => void;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
  loggedTogglePane: (id: PaneId) => void;
  loggedSetStack: (s: Stack) => void;
  loggedSetSeverity: (s: Severity) => void;
  loggedSetIsSlowBurn: (on: boolean) => void;
  loggedCeaseTheatre: () => void;
  loggedHandleDeclare: () => void;
  gameMode: import('../store/useIncidentStore').GameMode;
  activeObjective: Objective | null;
  mitigationCount: number;
  incrementMitigationCount: () => void;
  unreadChat: number;
  isDeployStabilized: boolean;
  currentEventIndex?: number;
  handleNewChatMessage: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  playLoginChime: () => void;
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
  startPlaybook: (p: Playbook) => void;
  stopPlaybook: () => void;
  onFocus: (id: PaneId) => void;
  onClose: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  onPopOutToggle: (id: PaneId) => void;
  onSnapMainToggle: (id: PaneId) => void;
  isChaos: boolean;
  setIsChaos: (on: boolean) => void;
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
  activePlaybook: Playbook | null;
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
        playbookProgress={{ current: (props.currentEventIndex ?? -1) + 1, total: props.activePlaybook?.events.length || 0 }}
      />
      <PaneGrid
        {...props}
        messages={props.messages}
        sendMessage={props.sendMessage}
        typingUsers={props.typingUsers}
        markAsRead={props.markAsRead}
        markAllAsRead={props.markAllAsRead}
        commands={props.commands}
        onCommand={handleTerminalCommand}
        onSelectPlaybook={props.startPlaybook}
        activePlaybook={props.activePlaybook}
        scrollRef={scrollRef}
        severity={props.severity}
        logMultiplier={props.logMultiplier}
      />
      <CommandStrip 
        panes={props.panes}
        loggedTogglePane={props.loggedTogglePane}
        severity={props.severity}
        isDeclared={props.isDeclared}
        onDeclare={props.loggedHandleDeclare}
        onResolve={props.loggedCeaseTheatre}
        mitigationCount={props.mitigationCount}
        unreadChat={props.unreadChat}
        gameMode={props.gameMode}
        handleLogout={props.handleLogout}
      />
    </div>
  );
};
