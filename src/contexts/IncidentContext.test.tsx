import { renderHook, act } from '@testing-library/react';
import IncidentProvider from '../contexts/IncidentContext';
import { useIncident } from '../hooks/useIncident';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('IncidentContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <IncidentProvider>{children}</IncidentProvider>
  );

  it('initializes with nominal state', () => {
    const { result } = renderHook(() => useIncident(), { wrapper });
    
    expect(result.current.severity).toBe('NOMINAL');
    expect(result.current.status).toBe('SYSTEMS NOMINAL');
  });

  it('updates state when setting severity', () => {
    const { result } = renderHook(() => useIncident(), { wrapper });
    
    act(() => {
      result.current.setSeverity('P0');
    });
    
    expect(result.current.severity).toBe('P0');
    expect(result.current.status).toBe('BREACH DETECTED');
  });

  it('resets incident state correctly', () => {
    const { result } = renderHook(() => useIncident(), { wrapper });
    
    act(() => {
      result.current.setSeverity('P1');
      result.current.ceaseTheatre();
    });
    
    expect(result.current.severity).toBe('NOMINAL');
    expect(result.current.status).toBe('SYSTEMS NOMINAL');
  });
});
