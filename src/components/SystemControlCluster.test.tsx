import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemControlCluster, type SystemControlClusterProps } from './SystemControlCluster';

vi.mock('./StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar-mock" />
}));

vi.mock('./CommandStrip', () => ({
  CommandStrip: () => <div data-testid="command-strip-mock" />
}));

vi.mock('./PaneGrid', () => ({
  PaneGrid: () => <div data-testid="pane-grid-mock" />
}));

// Mock hook
vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}));

describe('SystemControlCluster', () => {
  const mockProps: SystemControlClusterProps = {
    panes: { 
      chat: false, logs: false, map: false, deploy: false, burn: false, 
      howTo: false, settings: false, metrics: false, playbooks: false, 
      incidentPlaybook: false, readout: false, terminal: true, debug: false 
    },
    minimizedPanes: { 
      chat: false, logs: false, map: false, deploy: false, burn: false, 
      howTo: false, settings: false, metrics: false, playbooks: false, 
      incidentPlaybook: false, readout: false, terminal: false, debug: false 
    },
    zIndices: { 
      chat: 100, logs: 101, map: 102, deploy: 103, burn: 104, 
      howTo: 105, settings: 106, metrics: 107, playbooks: 108, 
      incidentPlaybook: 109, readout: 110, terminal: 111, debug: 112 
    },
    poppedOutPanes: { 
      chat: false, logs: false, map: false, deploy: false, burn: false, 
      howTo: false, settings: false, metrics: false, playbooks: false, 
      incidentPlaybook: false, readout: false, terminal: false, debug: false 
    },
    snappedMainPanes: { 
      chat: false, logs: false, map: false, deploy: false, burn: false, 
      howTo: false, settings: false, metrics: false, playbooks: false, 
      incidentPlaybook: false, readout: false, terminal: false, debug: false 
    },
    togglePopOut: vi.fn(),
    toggleSnapMain: vi.fn(),
    activePane: null,
    bringToFront: vi.fn(),
    loggedTogglePane: vi.fn(),
    toggleMinimize: vi.fn(),
    messages: [],
    sendMessage: vi.fn(),
    isDeclared: false,
    operatorName: 'Test Op',
    uplinkId: 'test-id',
    severity: 'NOMINAL',
    stack: 'AWS',
    status: 'OPERATIONAL',
    moneyLost: 0,
    theme: 'classic',
    setTheme: vi.fn(),
    handleLogout: vi.fn(),
    typingUsers: [],
    handleCommand: vi.fn(),
    loggedHandleDeclare: vi.fn(),
    loggedCeaseTheatre: vi.fn(),
    commands: [],
    commandHistory: [],
    isChaos: false,
    incidentReport: '',
    setIncidentReport: vi.fn(),
    terminalHistory: [],
    setTerminalHistory: vi.fn(),
    displayText: '',
    setView: vi.fn(),
    activePlaybook: null,
    startPlaybook: vi.fn(),
    stopPlaybook: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    isEcoMode: false,
    setIsEcoMode: vi.fn(),
    chatMultiplier: 1,
    setChatMultiplier: vi.fn(),
    logMultiplier: 1,
    setLogMultiplier: vi.fn(),
    gameMode: 'ARCADE',
    activeObjective: null,
    mitigationCount: 0,
    unreadChat: 0,
  };

  it('renders all core components', () => {
    render(<SystemControlCluster {...mockProps} />);
    
    expect(screen.getByTestId('status-bar-mock')).toBeDefined();
    expect(screen.getByTestId('pane-grid-mock')).toBeDefined();
    expect(screen.getByTestId('command-strip-mock')).toBeDefined();
  });
});
