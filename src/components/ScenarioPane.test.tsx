import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioPane } from './ScenarioPane';
import { SCENARIOS } from '../data/scenarios';

describe('ScenarioPane', () => {
  const mockProps = {
    zIndex: 10,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
    onSelectScenario: vi.fn(),
    completedScenarios: [],
  };

  it('renders all scenarios in the deck', () => {
    render(<ScenarioPane {...mockProps} />);
    const scenarioCount = Object.keys(SCENARIOS).length;
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.length).toBe(scenarioCount);
  });

  it('unlocks the first scenario (L0) by default', () => {
    render(<ScenarioPane {...mockProps} />);
    const l0Button = screen.getByText('START_CERTIFICATION');
    expect(l0Button).not.toBeDisabled();
  });

  it('locks subsequent scenarios if prerequisites are missing', () => {
    render(<ScenarioPane {...mockProps} />);
    const lockedButtons = screen.getAllByText('LOCKED_BY_PROCEDURE');
    expect(lockedButtons.length).toBeGreaterThan(0);
    lockedButtons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('unlocks L1 if L0 is completed', () => {
    const scenarios = Object.values(SCENARIOS);
    const l0Id = scenarios[0].id;
    
    render(<ScenarioPane {...mockProps} completedScenarios={[l0Id]} />);
    
    const l1Button = screen.getByText('INITIALIZE_SCENARIO');
    expect(l1Button).not.toBeDisabled();
  });

  it('shows COMPLETED badge for finished scenarios', () => {
    const scenarios = Object.values(SCENARIOS);
    const l0Id = scenarios[0].id;
    
    render(<ScenarioPane {...mockProps} completedScenarios={[l0Id]} />);
    
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('shows LOCKED badge for locked scenarios', () => {
    render(<ScenarioPane {...mockProps} />);
    expect(screen.getAllByText('LOCKED').length).toBeGreaterThan(0);
  });

  it('prevents interaction with locked scenarios', () => {
    render(<ScenarioPane {...mockProps} />);
    const l1Card = screen.getByText('Scenario L1: Routine Patching').closest('.playbooks__card');
    const button = l1Card?.querySelector('button');
    
    if (button) {
      fireEvent.click(button);
    }
    
    expect(mockProps.onSelectScenario).not.toHaveBeenCalled();
  });
});
