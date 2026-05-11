import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SystemLog } from './SystemLog';

// Mock Worker import (Vite specific)
vi.mock('../utils/logWorker?worker', () => {
  return {
    default: vi.fn().mockImplementation(function() {
        return {
            onmessage: null,
            postMessage: vi.fn(),
            terminate: vi.fn(),
        };
    })
  };
});

// Mock Web Worker globally
vi.stubGlobal('Worker', vi.fn().mockImplementation(function() {
    return {
        onmessage: null,
        postMessage: vi.fn(),
        terminate: vi.fn(),
    };
}));

// Mock react-virtuoso
vi.mock('react-virtuoso', () => ({
  Virtuoso: <T,>({ data, itemContent }: { 
    data: T[], 
    itemContent: (index: number, item: T) => React.ReactNode 
  }) => (
    <div data-testid="virtuoso-mock">
      {data.map((item, index) => (
        <div key={index}>
          {itemContent(index, item)}
        </div>
      ))}
    </div>
  ),
}));

// Mock useSync
const mockSend = vi.fn();
vi.mock('../hooks/useSync', () => ({
  useSync: () => ({
    send: mockSend
  })
}));

// Mock useIncidentStore
vi.mock('../store/useIncidentStore', () => ({
  useIncidentStore: <T,>(selector: (state: { isPaused: boolean }) => T) => selector({ isPaused: false })
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

describe('SystemLog', () => {
  const defaultProps = {
    severity: 'P1' as const,
    logMultiplier: 1,
    terminalId: 'term-1',
    zIndex: 10,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
    isPoppedOut: false,
    onPopOutToggle: vi.fn(),
    isSnappedMain: false,
    onSnapMainToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SystemLog {...defaultProps} />);
    expect(screen.getByText('TAILING: /VAR/LOG/KERN.LOG')).toBeDefined();
  });

  it('displays logs received from worker', async () => {
    render(<SystemLog {...defaultProps} />);
    
    // Find the worker instance from the mock
    const { default: LogWorkerMock } = await import('../utils/logWorker?worker');
    const workerInstance = vi.mocked(LogWorkerMock).mock.instances[0] as unknown as { onmessage: (e: { data: { type: string, log: string } }) => void };
    
    act(() => {
      workerInstance.onmessage({ data: { type: 'LOG', log: 'Test Log Message' } });
    });

    expect(screen.getByText('Test Log Message')).toBeDefined();
    expect(mockSend).toHaveBeenCalledWith({ type: 'LOG_MESSAGE', log: 'Test Log Message' });
  });

  it('handles INJECT_LOG custom events', () => {
    render(<SystemLog {...defaultProps} />);
    
    act(() => {
      window.dispatchEvent(new CustomEvent('INJECT_LOG', { detail: 'Injected Log' }));
    });

    expect(screen.getByText('Injected Log')).toBeDefined();
  });

  it('applies correct CSS classes for log levels', async () => {
    render(<SystemLog {...defaultProps} />);
    const { default: LogWorkerMock } = await import('../utils/logWorker?worker');
    const workerInstance = vi.mocked(LogWorkerMock).mock.instances[0] as unknown as { onmessage: (e: { data: { type: string, log: string } }) => void };
    
    act(() => {
      workerInstance.onmessage({ data: { type: 'LOG', log: 'PANIC: Kernel error' } });
      workerInstance.onmessage({ data: { type: 'LOG', log: 'CRITICAL: Disk full' } });
      workerInstance.onmessage({ data: { type: 'LOG', log: 'failed to connect' } });
    });

    const panicLog = screen.getByText('PANIC: Kernel error');
    const criticalLog = screen.getByText('CRITICAL: Disk full');
    const warningLog = screen.getByText('failed to connect');

    expect(panicLog.className).toContain('system-log__content--panic');
    expect(criticalLog.className).toContain('system-log__content--critical');
    expect(warningLog.className).toContain('system-log__content--warning');
  });
});
