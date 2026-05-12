/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeploymentStatus } from './DeploymentStatus';

// Mock useIncidentStore
vi.mock('../store/useIncidentStore', () => ({
  useIncidentStore: (selector: any) => selector({
    isDeployStabilized: false,
    isPaused: false
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

describe('DeploymentStatus', () => {
  const mockProps = {
    severity: 'P0' as const,
    stack: 'AWS' as const,
    zIndex: 1,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders correctly with stack name', () => {
    render(<DeploymentStatus {...mockProps} />);
    expect(screen.getByText('AWS_WORKLOAD_STATUS')).toBeDefined();
    // AWS stack from data/incidents usually has 'EKS control plane', etc.
    expect(screen.getByText(/eks-control-plane-0/)).toBeDefined();
  });

  it('shows error status in P0', () => {
    // Mock Math.random to force an error status
    vi.spyOn(Math, 'random').mockReturnValue(0.01); 
    
    render(<DeploymentStatus {...mockProps} />);
    
    // Fast-forward to trigger useEffect update
    vi.advanceTimersByTime(3000);

    const errorStatuses = screen.getAllByText(/CrashLoopBackOff|Error|Terminating/);
    expect(errorStatuses.length).toBeGreaterThan(0);
  });

  it('shows running status in NOMINAL', () => {
    render(<DeploymentStatus {...mockProps} severity="NOMINAL" />);
    
    vi.advanceTimersByTime(3000);

    const runningStatuses = screen.getAllByText('Running');
    // All pods should be running in NOMINAL (or if stabilized)
    expect(runningStatuses.length).toBeGreaterThan(0);
  });

  it('renders terraform logs in non-nominal states', () => {
    render(<DeploymentStatus {...mockProps} />);
    
    vi.advanceTimersByTime(1000);

    const logsContainer = screen.getByText('TERRAFORM_APPLY_STDOUT').nextElementSibling!;
    expect(logsContainer.children.length).toBeGreaterThan(0);
  });

  it('changes pod list when stack changes', () => {
    const { rerender } = render(<DeploymentStatus {...mockProps} />);
    expect(screen.getByText(/eks-control-plane-0/)).toBeDefined();

    rerender(<DeploymentStatus {...mockProps} stack="GCP" />);
    // GCP stack usually has 'GKE Autopilot cluster', etc.
    expect(screen.getByText(/gke-autopilot-cluster-0/)).toBeDefined();
  });
});
