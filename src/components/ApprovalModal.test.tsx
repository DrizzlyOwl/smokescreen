import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ApprovalModal } from './ApprovalModal';

// Mock useIncidentStore
const mockIncrementMitigationCount = vi.fn();
vi.mock('../store/useIncidentStore', () => ({
  useIncidentStore: () => ({
    isChaos: false,
    incrementMitigationCount: mockIncrementMitigationCount,
  }),
}));

// Mock useAudio
const mockPlayMitigationSuccess = vi.fn();
vi.mock('../hooks/useAudio', () => ({
  useAudio: () => ({
    playMitigationSuccess: mockPlayMitigationSuccess,
  }),
}));

describe('ApprovalModal', () => {
  const mockResolve = vi.fn();

  beforeEach(() => {
    mockResolve.mockClear();
    mockPlayMitigationSuccess.mockClear();
    vi.useFakeTimers();
  });

  it('renders phrase type correctly', () => {
    const phraseApproval = {
      id: '1',
      type: 'phrase' as const,
      message: 'CRITICAL_DRIFT_DETECTED',
      phrase: 'CONFIRM-REBOOT'
    };

    render(<ApprovalModal approval={phraseApproval} onResolve={mockResolve} />);
    
    expect(screen.getByText('CRITICAL_DRIFT_DETECTED')).toBeDefined();
    expect(screen.getByText('CONFIRM-REBOOT')).toBeDefined();
    expect(screen.getByPlaceholderText('Awaiting verification...')).toBeDefined();
  });

  it('resolves when correct phrase is typed (case-insensitive)', () => {
    const phraseApproval = {
      id: '1',
      type: 'phrase' as const,
      message: 'CRITICAL_DRIFT_DETECTED',
      phrase: 'CONFIRM-REBOOT'
    };

    render(<ApprovalModal approval={phraseApproval} onResolve={mockResolve} />);
    const input = screen.getByPlaceholderText('Awaiting verification...');

    fireEvent.change(input, { target: { value: 'confirm-reboot' } });
    expect(mockResolve).toHaveBeenCalledTimes(1);
    expect(mockPlayMitigationSuccess).toHaveBeenCalledTimes(1);
  });

  it('fails and closes after 10 second timeout', () => {
    const mockFail = vi.fn();
    const phraseApproval = {
      id: '1',
      type: 'phrase' as const,
      message: 'CRITICAL_DRIFT_DETECTED',
      phrase: 'CONFIRM-REBOOT'
    };

    render(<ApprovalModal approval={phraseApproval} onResolve={mockResolve} onFail={mockFail} />);
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('ACTION_FAILED')).toBeDefined();
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockFail).toHaveBeenCalledWith('VERIFICATION_TIMEOUT');
    expect(mockResolve).toHaveBeenCalledTimes(1);
  });

  it('renders hold type correctly', () => {
    const holdApproval = {
      id: '2',
      type: 'hold' as const,
      message: 'UNAUTHORIZED_ACCESS',
    };

    render(<ApprovalModal approval={holdApproval} onResolve={mockResolve} />);
    
    expect(screen.getByText('UNAUTHORIZED_ACCESS')).toBeDefined();
    expect(screen.getByText('[ INITIATE_FAILOVER ]')).toBeDefined();
  });

  it('resolves after holding button for 3 seconds', () => {
    const holdApproval = {
      id: '2',
      type: 'hold' as const,
      message: 'UNAUTHORIZED_ACCESS',
    };

    render(<ApprovalModal approval={holdApproval} onResolve={mockResolve} />);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(mockResolve).toHaveBeenCalledTimes(1);
    expect(mockPlayMitigationSuccess).toHaveBeenCalledTimes(1);
  });

  it('resets progress if button is released early', () => {
    const holdApproval = {
      id: '2',
      type: 'hold' as const,
      message: 'UNAUTHORIZED_ACCESS',
    };

    render(<ApprovalModal approval={holdApproval} onResolve={mockResolve} />);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(screen.getByText('50%')).toBeDefined();

    fireEvent.mouseUp(button);
    expect(screen.getByText('[ INITIATE_FAILOVER ]')).toBeDefined();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('renders slider type correctly and resolves at 100%', () => {
    const sliderApproval = {
      id: '3',
      type: 'slider' as const,
      message: 'VOLATILE_TRAFFIC_SPIKE',
    };

    render(<ApprovalModal approval={sliderApproval} onResolve={mockResolve} />);
    
    expect(screen.getByText('VOLATILE_TRAFFIC_SPIKE')).toBeDefined();
    expect(screen.getByText('SLIDE TO ACKNOWLEDGE ESCALATION')).toBeDefined();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });
    expect(mockResolve).not.toHaveBeenCalled();

    fireEvent.change(slider, { target: { value: '100' } });
    expect(mockResolve).toHaveBeenCalledTimes(1);
    expect(mockPlayMitigationSuccess).toHaveBeenCalledTimes(1);
  });

  it('resets hold progress on mouse leave', () => {
    const holdApproval = {
      id: '4',
      type: 'hold' as const,
      message: 'TEST_HOLD',
    };

    render(<ApprovalModal approval={holdApproval} onResolve={mockResolve} />);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    fireEvent.mouseLeave(button);
    expect(screen.getByText('[ INITIATE_FAILOVER ]')).toBeDefined();
    expect(mockResolve).not.toHaveBeenCalled();
  });
});