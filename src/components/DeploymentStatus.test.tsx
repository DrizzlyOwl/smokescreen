/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeploymentStatus } from './DeploymentStatus';
import { useIncidentStore } from '../store/useIncidentStore';

// Mock useIncidentStore
vi.mock('../store/useIncidentStore', () => ({
  useIncidentStore: vi.fn()
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
  const mockTickPods = vi.fn();
  const mockStabilizePod = vi.fn();

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
    (useIncidentStore as any).mockReturnValue({
      activePods: [
        { name: 'web-0', status: 'Running', cpu: '100m', memory: '256Mi', restarts: 0, age: '10m' },
        { name: 'db-0', status: 'Error', cpu: '0m', memory: '0Mi', restarts: 1, age: '1s' }
      ],
      tickPods: mockTickPods,
      stabilizePod: mockStabilizePod,
      isPaused: false
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders correctly with stack name and pod data', () => {
    render(<DeploymentStatus {...mockProps} />);
    expect(screen.getByText('AWS_WORKLOAD_STATUS')).toBeDefined();
    expect(screen.getByText('web-0')).toBeDefined();
    expect(screen.getByText('db-0')).toBeDefined();
    expect(screen.getByText('Error')).toBeDefined();
  });

  it('calls tickPods on interval', () => {
    render(<DeploymentStatus {...mockProps} />);
    
    vi.advanceTimersByTime(3000);
    expect(mockTickPods).toHaveBeenCalledWith('P0', false);
  });

  it('calls stabilizePod when clicking on a failed pod', () => {
    render(<DeploymentStatus {...mockProps} />);
    
    const failedStatus = screen.getByText('Error');
    fireEvent.click(failedStatus);

    expect(mockStabilizePod).toHaveBeenCalledWith('db-0');
  });

  it('renders terraform logs in non-nominal states', () => {
    render(<DeploymentStatus {...mockProps} />);
    
    vi.advanceTimersByTime(1000);

    const logsTitle = screen.getByText('TERRAFORM_APPLY_STDOUT');
    const logsContainer = logsTitle.nextElementSibling!;
    expect(logsContainer.children.length).toBeGreaterThan(0);
  });
});
