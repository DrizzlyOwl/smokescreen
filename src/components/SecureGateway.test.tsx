// src/components/SecureGateway.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SecureGateway } from './SecureGateway';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

describe('SecureGateway', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
    localStorage.clear();
    // Reset Zustand stores
    useTerminalStore.setState({
      operatorName: '',
      appState: 'SPLASH'
    });
    useIncidentStore.setState({
      gameMode: 'SANDBOX',
      severity: 'NOMINAL',
      moneyLost: 0,
    });
  });

  it('renders login screen when localStorage is empty', () => {
    render(<SecureGateway onComplete={mockOnComplete} />);
    
    expect(screen.getByText(/OPERATOR_IDENTIFICATION_REQUIRED/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('...')).toBeInTheDocument();
  });

  it('renders mode selection options', () => {
    render(<SecureGateway onComplete={mockOnComplete} />);
    
    expect(screen.getByText(/SELECT_SIMULATION_MODE/)).toBeInTheDocument();
    expect(screen.getByText(/ARCADE/)).toBeInTheDocument();
    expect(screen.getByText(/SANDBOX/)).toBeInTheDocument();
  });

  it('handles login submission with valid name', async () => {
    vi.useFakeTimers();
    render(<SecureGateway onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('...');
    fireEvent.change(input, { target: { value: 'OPERATOR_TEST' } });

    const submitBtn = screen.getByText(/INITIALIZE_SESSION/);
    fireEvent.click(submitBtn);

    // Wait for LOADING phase
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/ACCESS_GRANTED/)).toBeInTheDocument();

    // Wait for onComplete to be called
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(useTerminalStore.getState().operatorName).toBe('OPERATOR_TEST');
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('shows error state when submitting empty name', () => {
    render(<SecureGateway onComplete={mockOnComplete} />);

    const submitBtn = screen.getByText(/INITIALIZE_SESSION/);
    fireEvent.click(submitBtn);

    // Should remain on login screen (not proceed to loading)
    expect(screen.getByText(/OPERATOR_IDENTIFICATION_REQUIRED/)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
