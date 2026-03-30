import React, { useState, useEffect, useMemo } from 'react';
import { TerminalContext } from './instances';
import type { AppState, Theme } from './types';
import { getInitialStateFromUrl } from '../hooks/useUrlSync';

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const urlState = useMemo(() => getInitialStateFromUrl(), []);

  const [appState, setAppState] = useState<AppState>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pager') ? 'MOBILE_PAGER' : 'SPLASH';
  });
  const [operatorName, setInternalOperatorName] = useState(() => localStorage.getItem('operator_name') || '');
  const [theme, setTheme] = useState<Theme>(() => {
    if (urlState.theme) return urlState.theme;
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
  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (urlState.isDebugMode !== undefined) return urlState.isDebugMode;
    return localStorage.getItem('debug_mode') === 'true';
  });
  const [isEcoMode, setIsEcoMode] = useState(() => {
    if (urlState.isEcoMode !== undefined) return urlState.isEcoMode;
    return localStorage.getItem('eco_mode') === 'true';
  });
  const [isAudioOn, setIsAudioOn] = useState(() => {
    if (urlState.isAudioOn !== undefined) return urlState.isAudioOn;
    return false;
  });

  const regenerateUplinkId = () => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setUplinkId(`SRE-${random}`);
  };

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
      setIsEcoMode,
      isAudioOn,
      setIsAudioOn,
      regenerateUplinkId
    }}>
      {children}
    </TerminalContext.Provider>
  );
}
export default TerminalProvider;
