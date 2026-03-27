import { describe, it, expect, vi } from 'vitest';
import { useCommandRegistry, type CommandActions } from '../hooks/useCommandRegistry';
import type { PaneId } from './useWindowManager';
import type { Severity, Stack } from '../data/excuses';

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
    setBossMode: vi.fn<(on: boolean) => void>(),
    setTheme: vi.fn<(t: 'classic' | 'amber' | 'cobalt') => void>(),
    handleEject: vi.fn<() => void>(),
    copyExcuse: vi.fn<() => void>(),
    setView: vi.fn<(v: 'HOME' | 'TICKET') => void>(),
    playPing: vi.fn<(type: 'slack' | 'teams') => void>(),
    handleLogout: vi.fn<() => void>(),
    help: vi.fn<() => void>(),
  };

  it('correctly identifies and executes a threat level command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('p0');
    
    expect(result).toBe(true);
    expect(mockActions.setSeverity).toHaveBeenCalledWith('P0');
  });

  it('correctly identifies and executes a stack command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('aws');
    
    expect(result).toBe(true);
    expect(mockActions.setStack).toHaveBeenCalledWith('AWS');
  });

  it('correctly identifies and executes a pane command', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('show chat');
    
    expect(result).toBe(true);
    expect(mockActions.openPane).toHaveBeenCalledWith('chat');
  });

  it('returns false for unknown commands', () => {
    const { handleCommand } = useCommandRegistry(mockActions as unknown as CommandActions);
    
    const result = handleCommand('invalid_command_xyz');
    
    expect(result).toBe(false);
  });
});
