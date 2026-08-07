import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from './useTerminalStore';
import { safeLocalStorageGet } from '../utils/storage';

describe('useTerminalStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useTerminalStore.setState({
        appState: 'SPLASH',
        operatorName: '',
        theme: 'classic',
        isEcoMode: false,
        completedScenarios: [],
        commandHistory: []
    });
  });

  it('initializes with default values', () => {
    const state = useTerminalStore.getState();
    expect(state.appState).toBe('SPLASH');
    expect(state.operatorName).toBe('');
    expect(state.theme).toBe('classic');
    expect(state.isEcoMode).toBe(false);
    expect(state.completedScenarios).toEqual([]);
  });

  it('marks scenario as completed and persists to localStorage', () => {
    useTerminalStore.getState().markScenarioCompleted('l0-certification');
    expect(useTerminalStore.getState().completedScenarios).toEqual(['l0-certification']);
    expect(safeLocalStorageGet<string[]>('completed_scenarios', [])).toEqual(['l0-certification']);
  });

  it('does not add duplicate completed scenarios', () => {
    useTerminalStore.getState().markScenarioCompleted('l0-certification');
    useTerminalStore.getState().markScenarioCompleted('l0-certification');
    expect(useTerminalStore.getState().completedScenarios).toEqual(['l0-certification']);
  });

  it('sets operator name and persists to localStorage', () => {
    useTerminalStore.getState().setOperatorName('ASH');
    expect(useTerminalStore.getState().operatorName).toBe('ASH');
    expect(safeLocalStorageGet('operator_name', '')).toBe('ASH');
  });

  it('sets theme and persists to localStorage', () => {
    useTerminalStore.getState().setTheme('amber');
    expect(useTerminalStore.getState().theme).toBe('amber');
    expect(safeLocalStorageGet('terminal_theme', 'classic')).toBe('amber');
  });

  it('sets eco mode and persists to localStorage', () => {
    useTerminalStore.getState().setIsEcoMode(true);
    expect(useTerminalStore.getState().isEcoMode).toBe(true);
    expect(safeLocalStorageGet('eco_mode', false)).toBe(true);
  });

  it('adds commands to history', () => {
    useTerminalStore.getState().addCommandToHistory('aws');
    useTerminalStore.getState().addCommandToHistory('p0');
    expect(useTerminalStore.getState().commandHistory).toEqual(['aws', 'p0']);
  });

  it('avoids duplicate consecutive commands in history', () => {
    useTerminalStore.getState().addCommandToHistory('aws');
    useTerminalStore.getState().addCommandToHistory('aws');
    expect(useTerminalStore.getState().commandHistory).toEqual(['aws']);
  });
});
