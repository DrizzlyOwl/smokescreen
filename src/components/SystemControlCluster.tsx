import React from 'react';
import { StatusBar } from './StatusBar';
import { PaneGrid } from './PaneGrid';
import { CommandStrip } from './CommandStrip';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Severity, Stack } from '../data/incidents';
import type { PaneId, WindowManagerActions } from '../hooks/useWindowManager';
import type { ChatMessage, Objective, ApprovalState, TerminalOverrideState } from '../contexts/types';
import type { CommandResult } from '../hooks/useIncidentState';
import type { Command } from '../hooks/useCommandRegistry';
import type { Scenario } from '../data/scenarios/types';

interface SystemControlClusterProps extends WindowManagerActions {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  isEcoMode: boolean;
  setIsEcoMode: (val: boolean) => void;
  gameMode: import('../store/useIncidentStore').GameMode;
  activeObjective: Objective | null;
  currentEventIndex: number;
  loggedTogglePane: (id: PaneId) => void;
  addCommandToHistory: (cmd: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  ticketId: string;
  activeApproval: ApprovalState | null;
  setApproval: (approval: ApprovalState | null) => void;
  activeOverride: TerminalOverrideState | null;
  setOverride: (override: TerminalOverrideState | null) => void;
  setObjective: (obj: Objective | null) => void;
  startScenario: (p: Scenario) => void;
  stopScenario: () => void;
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
        messages={props.messages}
        sendMessage={props.sendMessage}
        typingUsers={props.typingUsers}
        markAsRead={props.markAsRead}
        markAllAsRead={props.markAllAsRead}
        commands={props.commands}
        onCommand={handleTerminalCommand}
        onSelectScenario={props.startScenario}
        activeScenario={props.activeScenario}
        completedScenarios={props.completedScenarios}
        scrollRef={scrollRef}
        severity={props.severity}
        logMultiplier={props.logMultiplier}
      />
      <CommandStrip 
        panes={props.panes} 
        loggedTogglePane={props.loggedTogglePane} 
        beacons={props.beacons}
        isDeclared={props.isDeclared}
        severity={props.severity}
        onSnapMainToggle={props.onSnapMainToggle}
        onPopOutToggle={props.onPopOutToggle}
        toggleMinimize={props.toggleMinimize}
        bringToFront={props.onFocus}
      />
    </div>
  );
};
