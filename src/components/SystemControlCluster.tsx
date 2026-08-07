import React, { useState, useCallback } from 'react';
import { StatusBar } from './StatusBar';
import { ScreenContainer } from './ScreenContainer';
import { TerminalStrip } from './TerminalStrip';
import { DebugOverlay } from './DebugOverlay';
import { CommandStrip } from './CommandStrip';
import { useScreenShortcuts } from '../hooks/useKeyboardShortcuts';
import { useScreenManager, type ScreenId } from '../hooks/useScreenManager';
import type { Severity, Stack } from '../data/incidents';
import type { ChatMessage, Objective } from '../contexts/types';
import type { ApprovalState, TerminalOverrideState, GameMode } from '../store/useIncidentStore';
import type { CommandResult, TerminalLine } from '../hooks/useIncidentState';
import type { Command } from '../hooks/useCommandRegistry';
import type { Scenario } from '../data/scenarios/types';
import type { Theme } from '../contexts/types';

export interface SystemControlClusterProps {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  isEcoMode: boolean;
  setIsEcoMode: (val: boolean) => void;
  gameMode: GameMode;
  activeObjective: Objective | null;
  currentEventIndex: number;
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
  terminalId: string;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  typingUsers: string[];
  commands: Command[];
  handleResolve: () => void;
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
  const [escConfirmPending, setEscConfirmPending] = useState(false);

  // Screen manager state
  const screenManager = useScreenManager('howTo');

  // Handle screen navigation with logging
  const handleSetActiveScreen = useCallback((id: ScreenId) => {
    screenManager.setActiveScreen(id);
  }, [screenManager]);

  // Handle global keyboard shortcuts
  useScreenShortcuts({
    setActiveScreen: handleSetActiveScreen,
    toggleTerminalCollapsed: screenManager.toggleTerminalCollapsed,
    toggleDebug: screenManager.toggleDebug,
    togglePause: () => props.setIsPaused(!props.isPaused),
    handleLogout: props.handleLogout,
    isDeclared: props.isDeclared,
    onEscConfirmChange: setEscConfirmPending,
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
    <div className="cluster-layout cluster-layout--screen-mode">
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
        escConfirmPending={escConfirmPending}
      />

      <ScreenContainer
        activeScreen={screenManager.activeScreen}
        severity={props.severity}
        stack={props.stack}
        isDeclared={props.isDeclared}
        messages={props.messages}
        sendMessage={props.sendMessage}
        typingUsers={props.typingUsers}
        markAsRead={props.markAsRead}
        markAllAsRead={props.markAllAsRead}
        operatorName={props.operatorName}
        logMultiplier={props.logMultiplier}
        ticketId={props.ticketId}
        theme={props.theme}
        setTheme={props.setTheme}
        onSelectScenario={props.startScenario}
        activeScenario={props.activeScenario}
        completedScenarios={props.completedScenarios}
        activeObjective={props.activeObjective}
        incidentReport={props.incidentReport}
        setIncidentReport={props.setIncidentReport}
        displayText={props.displayText}
        scrollRef={scrollRef}
        moneyLost={props.moneyLost}
      />

      <TerminalStrip
        height={screenManager.terminalHeight}
        collapsed={screenManager.terminalCollapsed}
        onHeightChange={screenManager.setTerminalHeight}
        onToggleCollapse={screenManager.toggleTerminalCollapsed}
        onCommand={handleTerminalCommand}
        terminalHistory={props.terminalHistory}
        setTerminalHistory={props.setTerminalHistory}
        commandHistory={props.commandHistory}
        commands={props.commands}
        operatorName={props.operatorName}
        isActive={true}
      />

      <DebugOverlay
        isOpen={screenManager.debugOpen}
        onClose={screenManager.closeDebug}
      />

      <CommandStrip 
        activeScreen={screenManager.activeScreen}
        setActiveScreen={handleSetActiveScreen}
        toggleTerminal={screenManager.toggleTerminalCollapsed}
        terminalCollapsed={screenManager.terminalCollapsed}
        handleLogout={props.handleLogout}
        severity={props.severity}
        isDeclared={props.isDeclared}
        onDeclare={props.loggedHandleDeclare}
        onResolve={props.handleResolve}
        mitigationCount={props.mitigationCount}
        unreadChat={props.unreadChat}
        gameMode={props.gameMode}
      />
    </div>
  );
};
