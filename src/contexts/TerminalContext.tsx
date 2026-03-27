import React, { useState, useEffect } from 'react';
import { TerminalContext } from './instances';
import type { AppState, Theme } from './types';

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>('SPLASH');
  const [operatorName, setInternalOperatorName] = useState(() => localStorage.getItem('operator_name') || '');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('terminal_theme');
    return (saved === 'amber' || saved === 'cobalt' || saved === 'classic') ? (saved as Theme) : 'classic';
  });
  const [uplinkId, setUplinkId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const pagerId = params.get('pager');
    return (pagerId || Math.random().toString(36).substring(2, 10)).toUpperCase();
  });
  const [isDebugMode, setIsDebugMode] = useState(() => localStorage.getItem('debug_mode') === 'true');

  useEffect(() => {
    if (operatorName) {
        localStorage.setItem('operator_name', operatorName);
    }
  }, [operatorName]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('terminal_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('debug_mode', String(isDebugMode));
  }, [isDebugMode]);

  return (
    <TerminalContext.Provider value={{
      appState,
      setAppState,
      operatorName,
      setOperatorName: setInternalOperatorName,
      theme,
      setTheme,
      uplinkId,
      setUplinkId,
      isDebugMode,
      setIsDebugMode
    }}>
      {children}
    </TerminalContext.Provider>
  );
}
export default TerminalProvider;
