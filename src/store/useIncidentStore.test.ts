import { describe, it, expect, beforeEach } from 'vitest';
import { useIncidentStore } from './useIncidentStore';

describe('useIncidentStore', () => {
  beforeEach(() => {
    useIncidentStore.setState(useIncidentStore.getInitialState());
    localStorage.clear();
  });

  it('initializes with default values', () => {
    const state = useIncidentStore.getState();
    expect(state.severity).toBe('NOMINAL');
    expect(state.isDeclared).toBe(false);
    expect(state.moneyLost).toBe(0);
  });

  it('updates severity and status', () => {
    useIncidentStore.getState().setSeverity('P0');
    const state = useIncidentStore.getState();
    expect(state.severity).toBe('P0');
    expect(state.status).toBe('BREACH DETECTED');
    expect(state.slowBurnCountdown).toBe(30);
  });

  it('increments mitigation count', () => {
    useIncidentStore.getState().incrementMitigationCount();
    expect(useIncidentStore.getState().mitigationCount).toBe(1);
  });

  it('sets incident report and ticket ID', () => {
    useIncidentStore.getState().setIncidentReport('INCIDENT_001');
    useIncidentStore.getState().setTicketId('TICKET_123');
    expect(useIncidentStore.getState().incidentReport).toBe('INCIDENT_001');
    expect(useIncidentStore.getState().ticketId).toBe('TICKET_123');
  });

  it('handles money lost updates with function updater', () => {
    useIncidentStore.getState().setMoneyLost(100);
    useIncidentStore.getState().setMoneyLost((prev) => prev + 50);
    expect(useIncidentStore.getState().moneyLost).toBe(150);
  });

  it('resets state on ceaseTheatre', () => {
    useIncidentStore.getState().setSeverity('P0');
    useIncidentStore.getState().setIsDeclared(true);
    useIncidentStore.getState().setMoneyLost(500000);
    
    useIncidentStore.getState().ceaseTheatre();
    
    const state = useIncidentStore.getState();
    expect(state.severity).toBe('NOMINAL');
    expect(state.isDeclared).toBe(false);
    expect(state.moneyLost).toBe(0);
  });

  it('updates mitigation score and persists to localStorage', () => {
    useIncidentStore.getState().setMitigationScore(1000);
    expect(useIncidentStore.getState().mitigationScore).toBe(1000);
    expect(localStorage.getItem('mitigation_score')).toBe('1000');
  });

  it('handles onboarding step progression', () => {
    useIncidentStore.getState().setOnboardingStep(1);
    expect(useIncidentStore.getState().onboardingStep).toBe(1);
    
    useIncidentStore.getState().setOnboardingStep(-1);
    expect(localStorage.getItem('smokescreen_onboarded')).toBe('true');
  });
});
