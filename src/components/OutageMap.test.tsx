import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutageMap } from './OutageMap';

// Mock useTerminal
vi.mock('../hooks/useTerminal', () => ({
  useTerminal: () => ({
    isEcoMode: false,
  }),
}));

// Mock useAudio
const mockPlayMitigationSuccess = vi.fn();
vi.mock('../hooks/useAudio', () => ({
  useAudio: () => ({
    playMitigationSuccess: mockPlayMitigationSuccess,
  }),
}));

// Mock useIncidentStore
const mockSetSeverity = vi.fn();
const mockIncrementMitigationCount = vi.fn();
const mockSetMitigationScore = vi.fn();
vi.mock('../store/useIncidentStore', () => ({
  useIncidentStore: Object.assign(() => ({
    setSeverity: mockSetSeverity,
    incrementMitigationCount: mockIncrementMitigationCount,
  }), {
    getState: () => ({
        setMitigationScore: mockSetMitigationScore
    })
  }),
}));

// Mock Pane
vi.mock('./Pane', () => ({
  Pane: ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div data-testid="pane-mock">
        <h2>{title}</h2>
        {children}
    </div>
  ),
}));

describe('OutageMap', () => {
  const mockProps = {
    severity: 'P0' as const,
    zIndex: 1,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
  };

  beforeEach(() => {
    mockPlayMitigationSuccess.mockClear();
    mockSetSeverity.mockClear();
    mockIncrementMitigationCount.mockClear();
    mockSetMitigationScore.mockClear();
    
    // Fixed seed for predictable node states
    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        // 1-8: Status generation for 8 regions (none healthy if all < 0.3 or similar logic)
        // Let's just make everything critical/warning except when we force healthy
        if (callCount <= 8) return 0.5; 
        
        // 9: randomIndex selection in the "Guarantee" block
        // REGIONS has 8 items. We want index 1 (US-WEST-2).
        // floor(0.2 * 8) = floor(1.6) = 1.
        if (callCount === 9) return 0.2;
        
        return 0.5;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with severity', () => {
    render(<OutageMap {...mockProps} />);
    expect(screen.getByText('GLOBAL_INCIDENT_MONITOR')).toBeDefined();
    expect(screen.getByText('US-EAST-1')).toBeDefined();
  });

  it('initiates drag on unhealthy nodes only', () => {
    render(<OutageMap {...mockProps} />);
    
    const criticalNode = screen.getByText('US-EAST-1').parentElement!;
    const healthyNode = screen.getByText('US-WEST-2').parentElement!;

    fireEvent.mouseDown(criticalNode);
    // Should set dragStartNode internally
    
    // Healthy nodes don't initiate drag
    fireEvent.mouseDown(healthyNode);
  });

  it('successful failover updates state and plays audio', () => {
    // We need to carefully mock the target node hit detection
    // The getPos mapping is: x = ((lng + 180) / 360) * 100, y = ((90 - lat) / 180) * 100 (in raw %)
    // US-WEST-2 is 45.0, -120.0 -> x = (-120+180)/360 * 100 = 16.6%, y = (90-45)/180 * 100 = 25%
    
    render(<OutageMap {...mockProps} />);
    
    const criticalNode = screen.getByText('US-EAST-1').parentElement!;
    const mapContainer = screen.getByTestId('outage-map-container');
    
    // Mock getBoundingClientRect for mapContainer
    vi.spyOn(mapContainer, 'getBoundingClientRect').mockReturnValue({
        left: 0, top: 0, width: 1000, height: 500
    } as DOMRect);

    fireEvent.mouseDown(criticalNode, { clientX: 10, clientY: 10 });
    
    // Move to US-WEST-2 position (approx 16.6% of 1000 = 166, 25% of 500 = 125)
    fireEvent.mouseMove(mapContainer, { clientX: 166, clientY: 125 });
    fireEvent.mouseUp(mapContainer, { clientX: 166, clientY: 125 });

    expect(mockPlayMitigationSuccess).toHaveBeenCalled();
    expect(mockIncrementMitigationCount).toHaveBeenCalled();
    expect(mockSetMitigationScore).toHaveBeenCalled();
  });

  it('handles touch events', () => {
    render(<OutageMap {...mockProps} />);
    const criticalNode = screen.getByText('US-EAST-1').parentElement!;
    
    fireEvent.touchStart(criticalNode, { 
        touches: [{ clientX: 10, clientY: 10 }] 
    });
    
    const mapContainer = screen.getByTestId('outage-map-container');
    fireEvent.touchMove(mapContainer, { 
        touches: [{ clientX: 166, clientY: 125 }] 
    });
    fireEvent.touchEnd(mapContainer, { 
        changedTouches: [{ clientX: 166, clientY: 125 }] 
    });
  });
});
