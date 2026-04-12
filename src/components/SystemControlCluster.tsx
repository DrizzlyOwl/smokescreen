import React from 'react';
import { StatusBar } from './StatusBar';
import { CommandStrip } from './CommandStrip';
import { PaneGrid } from './PaneGrid';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Severity, Stack } from '../data/incidents';
import type { TerminalLine } from '../hooks/useIncidentState';
import type { ChatMessage, Theme } from '../contexts/types';
import type { PaneId, PanesState, MinimizedState, ZIndicesState } from '../hooks/useWindowManager';
import '../styles/SystemControlCluster.scss';

interface SystemControlClusterProps {
  panes: PanesState;
  minimizedPanes: MinimizedState;
  zIndices: ZIndicesState;
  poppedOutPanes: Record<PaneId, boolean>;
  snappedMainPanes: Record<PaneId, boolean>;
  togglePopOut: (id: PaneId) => void;
  toggleSnapMain: (id: PaneId) => void;
  activePane: PaneId | null;
  bringToFront: (id: PaneId) => void;
  loggedTogglePane: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  isDeclared: boolean;
  operatorName: string;
  uplinkId: string;
  severity: Severity;
  stack: Stack;
  status: string;
  moneyLost: number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  handleLogout: () => void;
  typingUsers: string[];
  handleCommand: (cmd: string) => boolean;
  isChaos: boolean;
  incidentReport: string;
  setIncidentReport: (r: string) => void;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  displayText: string;
  setView: (v: 'HOME' | 'TICKET') => void;
  activePlaybook: import('../data/playbooks/types').Playbook | null;
  startPlaybook: (p: import('../data/playbooks/types').Playbook) => void;
  stopPlaybook: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
  chatMultiplier: number;
  setChatMultiplier: (multiplier: number) => void;
}

export const SystemControlCluster: React.FC<SystemControlClusterProps> = (props) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Handle global keyboard shortcuts
  useKeyboardShortcuts({ loggedTogglePane: props.loggedTogglePane });

  // Handle auto-scroll for readout
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [props.displayText]);

  return (
    <>
      <StatusBar />
      
      <PaneGrid 
        {...props}
        scrollRef={scrollRef}
      />

      <CommandStrip 
        panes={props.panes}
        loggedTogglePane={props.loggedTogglePane}
        handleLogout={props.handleLogout}
      />
    </>
  );
};
