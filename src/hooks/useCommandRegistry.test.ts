import { describe, it, expect, vi } from 'vitest';
import { useCommandRegistry, type CommandActions } from '../hooks/useCommandRegistry';
import type { PaneId } from './useWindowManager';
import type { Severity, Stack } from '../data/incidents';

describe('useCommandRegistry', () => {
  const mockActions = {
    togglePane: vi.fn<(id: PaneId) => void>(),
    openPane: vi.fn<(id: PaneId) => void>(),
    closePane: vi.fn<(id: PaneId) => void>(),
    openAll: vi.fn<() => void>(),
    closeAll: vi.fn<() => void>(),
    setSeverity: vi.fn<(s: Severity) => void>(),
    setStack: vi.fn<(s: Stack) => void>(),
    setAudio: vi.fn<(on: boolean) => void>(),
    setSlowBurn: vi.fn<(on: boolean) => void>(),
    setTheme: vi.fn<(theme: 'classic' | 'amber' | 'cobalt' | 'dracula' | 'monokai') => void>(),


    handleEject: vi.fn<() => void>(),
    handleCease: vi.fn<() => void>(),
    copyPlaybook: vi.fn<() => void>(),
    setView: vi.fn<(v: 'HOME' | 'TICKET') => void>(),
    playPing: vi.fn<(type: 'slack' | 'teams') => void>(),
    handleLogout: vi.fn<() => void>(),
    help: vi.fn<() => void>(),
    startPlaybook: vi.fn<(id: string) => void>(),
    setEcoMode: vi.fn<(on: boolean) => void>(),
    triggerApproval: vi.fn<(type?: 'phrase' | 'hold' | 'slider') => void>(),
    mitigationCount: 0,
    isDeclared: false
  };

  it('correctly identifies and executes a threat level command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('p0');
    
    expect(result.isValid).toBe(true);
    expect(mockActions.setSeverity).toHaveBeenCalledWith('P0');
  });

  it('correctly identifies and executes a stack command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('aws');
    
    expect(result.isValid).toBe(true);
    expect(mockActions.setStack).toHaveBeenCalledWith('AWS');
  });

  it('correctly identifies and executes a pane command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('show chat');
    
    expect(result.isValid).toBe(true);
    expect(mockActions.openPane).toHaveBeenCalledWith('chat');
  });

  it('returns isValid: false for unknown commands', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('invalid_command_xyz');
    
    expect(result.isValid).toBe(false);
  });

  it('returns usage message for commands missing arguments', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('playbook');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('USAGE:');
  });

  it('correctly executes a category-prefixed command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('panes show logs');
    
    expect(result.isValid).toBe(true);
    expect(mockActions.openPane).toHaveBeenCalledWith('logs');
  });

  it('returns a manifest when only a category is entered', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('threat');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('--- THREAT_COMMAND_MANIFEST ---');
    expect(result.message).toContain('p0');
  });

  it('returns a manifest when category help is entered', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('stack help');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('--- STACK_COMMAND_MANIFEST ---');
    expect(result.message).toContain('aws');
  });

  it('returns an error when a command is not found in a specific category', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('panes p0');
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('ERROR: COMMAND NOT FOUND IN CATEGORY [PANES]');
  });

  it('enforces Remediation Guard on resolve command', () => {
    // Case 1: Declared but no mitigation
    const actionsWithNoMitigation = { ...mockActions, isDeclared: true, mitigationCount: 0 };
    const { handleCommand: handleCommand1 } = useCommandRegistry(actionsWithNoMitigation as unknown as CommandActions);
    
    const result1 = handleCommand1('resolve');
    expect(result1.isValid).toBe(false);
    expect(result1.message).toContain('RESOLUTION DENIED. NO MITIGATION ACTIONS LOGGED.');

    // Case 2: Declared and has mitigation
    const actionsWithMitigation = { ...mockActions, isDeclared: true, mitigationCount: 1 };
    const { handleCommand: handleCommand2 } = useCommandRegistry(actionsWithMitigation as unknown as CommandActions);
    
    const result2 = handleCommand2('resolve');
    expect(result2.isValid).toBe(true);
  });
});
