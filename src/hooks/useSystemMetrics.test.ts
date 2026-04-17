import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemMetrics } from './useSystemMetrics';

describe('useSystemMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides baseline metrics and updates them', () => {
    const { result } = renderHook(() => useSystemMetrics('NOMINAL'));
    
    expect(result.current.cpu).toBe(12);
    expect(result.current.ram).toBe(4.2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Baseline jitter for NOMINAL is small (12 +/- 2.5)
    expect(result.current.cpu).toBeGreaterThan(5);
    expect(result.current.cpu).toBeLessThan(20);
  });

  it('elevates metrics when a METRIC_SPIKE event is received', () => {
    const { result } = renderHook(() => useSystemMetrics('NOMINAL'));

    act(() => {
      window.dispatchEvent(new CustomEvent('METRIC_SPIKE', { 
        detail: { metric: 'cpu', target: 99, duration: 5000 } 
      }));
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // After 1 second, it should be lerping towards 99
    expect(result.current.cpu).toBeGreaterThan(12);
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // After a few more ticks, it should be near the target
    expect(result.current.cpu).toBeGreaterThan(70);
  });

  it('sustains elevation for the duration and then decays', () => {
    const { result } = renderHook(() => useSystemMetrics('NOMINAL'));

    act(() => {
      window.dispatchEvent(new CustomEvent('METRIC_SPIKE', { 
        detail: { metric: 'ram', target: 30, duration: 3000 } 
      }));
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.ram).toBeGreaterThan(20);

    // After 4 seconds total (duration is 3s), it should decay back towards baseline (4.2)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.ram).toBeLessThan(15);
  });

  it('scales metrics for P3 severity', () => {
    const { result } = renderHook(() => useSystemMetrics('P3'));
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // P3: base 25, volatility 15 (17.5 - 32.5)
    expect(result.current.cpu).toBeGreaterThan(15);
    expect(result.current.cpu).toBeLessThan(40);
    expect(result.current.ram).toBeGreaterThan(5);
  });

  it('scales metrics for P1 severity', () => {
    const { result } = renderHook(() => useSystemMetrics('P1'));
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // P1: base 65, volatility 25 (52.5 - 77.5)
    expect(result.current.cpu).toBeGreaterThan(45);
    expect(result.current.cpu).toBeLessThan(85);
    expect(result.current.ram).toBeGreaterThan(10);
  });

  it('scales metrics for P0 severity', () => {
    const { result } = renderHook(() => useSystemMetrics('P0'));
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // P0: base 94, volatility 5 (91.5 - 96.5)
    expect(result.current.cpu).toBeGreaterThan(85);
    expect(result.current.cpu).toBeLessThan(100);
    expect(result.current.ram).toBeGreaterThan(25);
  });
});
