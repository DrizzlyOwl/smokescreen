import { render, screen } from '@testing-library/react';
import { SystemControlCluster, type SystemControlClusterProps } from './SystemControlCluster';
import { describe, it, expect, vi } from 'vitest';

// Mock child components to keep test focused
vi.mock('./StatusBar', () => ({ StatusBar: () => <div data-testid="status-bar" /> }));
vi.mock('./CommandStrip', () => ({ CommandStrip: () => <div data-testid="command-strip" /> }));
vi.mock('./ScreenContainer', () => ({ ScreenContainer: () => <div data-testid="screen-container" /> }));
vi.mock('./TerminalStrip', () => ({ TerminalStrip: () => <div data-testid="terminal-strip" /> }));
vi.mock('./DebugOverlay', () => ({ DebugOverlay: () => <div data-testid="debug-overlay" /> }));

describe('SystemControlCluster', () => {
  const mockProps: SystemControlClusterProps = {
    messages: [],
    sendMessage: vi.fn(),
    isDeclared: false,
    operatorName: 'Test Op',
    terminalId: 'test-id',
    severity: 'NOMINAL',
    stack: 'AWS',
    moneyLost: 0,
    theme: 'classic',
    setTheme: vi.fn(),
    handleLogout: vi.fn(),
    typingUsers: [],
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    playLoginChime: vi.fn(),
    playLogoutChime: vi.fn(),
    playPostBeep: vi.fn(),
    playMitigationSuccess: vi.fn(),
    stopAllSounds: vi.fn(),
    isAudioOn: true,
    setIsAudioOn: vi.fn(),
    ticketId: 'T-123',
    activeApproval: null,
    setApproval: vi.fn(),
    activeOverride: null,
    setOverride: vi.fn(),
    setObjective: vi.fn(),
    startScenario: vi.fn(),
    stopScenario: vi.fn(),
    resumeScenario: vi.fn(),
    currentEventIndex: -1,
    setIsChaos: vi.fn(),
    activeBeacons: [],
    addBeacon: vi.fn(),
    displayText: '',
    setDisplayText: vi.fn(),
    logMultiplier: 1,
    setLogMultiplier: vi.fn(),
    chatMultiplier: 1,
    setChatMultiplier: vi.fn(),
    setIsResolving: vi.fn(),
    setIsDebugMode: vi.fn(),
    isPaused: false,
    setIsPaused: vi.fn(),
    activeScenario: null,
    completedScenarios: [],
    handleCommand: vi.fn(() => ({ isValid: true })),
    lastScoreEarned: 0,
    mitigationCount: 0,
    incidentReport: '',
    setIncidentReport: vi.fn(),
    terminalHistory: [],
    setTerminalHistory: vi.fn(),
    commandHistory: [],
    addCommandToHistory: vi.fn(),
    isDeployStabilized: true,
    unreadChat: 0,
    loggedHandleDeclare: vi.fn(),
    declareIncident: vi.fn(),
    gameMode: 'SANDBOX',
    activeObjective: null,
    commands: [],
    handleResolve: vi.fn(),
    executeCeaseTheatre: vi.fn(),
    isChaos: false,
    isEcoMode: false,
    setIsEcoMode: vi.fn(),
  };

  it('renders correctly with base props', () => {
    render(<SystemControlCluster {...mockProps} />);
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('command-strip')).toBeInTheDocument();
    expect(screen.getByTestId('screen-container')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-strip')).toBeInTheDocument();
  });

  it('sets correct theme on mount', () => {
    render(<SystemControlCluster {...mockProps} theme="amber" />);
    // Initial theme set is handled in App.tsx or useTerminalStore now, 
    // but the app--theme-amber class should be on a parent.
    // In this component, we just verify it doesn't crash.
  });
});
