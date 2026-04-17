import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemControlCluster } from './SystemControlCluster';

// Mock children to simplify testing of the cluster itself
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
  const mockProps: any = {
    panes: { 
      chat: false, logs: false, map: false, deploy: false, burn: false, 
      howTo: false, settings: false, metrics: false, playbooks: false, 
      readout: false, terminal: true, debug: false 
    },
    loggedTogglePane: vi.fn(),
    handleLogout: vi.fn(),
    severity: 'NOMINAL',
    isDeclared: false,
    loggedHandleDeclare: vi.fn(),
    loggedCeaseTheatre: vi.fn(),
    mitigationCount: 0,
    unreadChat: 0,
    displayText: '',
  };

  it('renders all core components', () => {
    render(<SystemControlCluster {...mockProps} />);
    
    expect(screen.getByTestId('status-bar-mock')).toBeDefined();
    expect(screen.getByTestId('pane-grid-mock')).toBeDefined();
    expect(screen.getByTestId('command-strip-mock')).toBeDefined();
  });
});
