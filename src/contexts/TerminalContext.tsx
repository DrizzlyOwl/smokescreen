import React, { useState, useEffect } from 'react';
import { TerminalContext } from './instances';
import type { AppState, Theme } from './types';

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pager') ? 'MOBILE_PAGER' : 'SPLASH';
  });
  const [operatorName, setInternalOperatorName] = useState(() => localStorage.getItem('operator_name') || '');
  const [theme, setTheme] = useState<Theme>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') as Theme;
    if (urlTheme === 'amber' || urlTheme === 'cobalt' || urlTheme === 'classic') {
        return urlTheme;
    }
    const saved = localStorage.getItem('terminal_theme');
    return (saved === 'amber' || saved === 'cobalt' || saved === 'classic') ? (saved as Theme) : 'classic';
  });
  const [uplinkId, setUplinkId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const pagerId = params.get('pager');
    if (pagerId) return pagerId.toUpperCase();
    
    // Generate a shorter, more "room code" like ID
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SRE-${random}`;
  });
  const [isDebugMode, setIsDebugMode] = useState(() => localStorage.getItem('debug_mode') === 'true');
  const [isEcoMode, setIsEcoMode] = useState(() => localStorage.getItem('eco_mode') === 'true');

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

  useEffect(() => {
    localStorage.setItem('eco_mode', String(isEcoMode));
    if (isEcoMode) {
        document.body.classList.add('eco-mode');
    } else {
        document.body.classList.remove('eco-mode');
    }
  }, [isEcoMode]);

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
      setIsDebugMode,
      isEcoMode,
      setIsEcoMode
    }}>
      {children}
    </TerminalContext.Provider>
  );
}
export default TerminalProvider;
