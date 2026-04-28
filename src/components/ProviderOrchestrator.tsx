import React from 'react';
import { AudioProvider } from '../contexts/AudioContext';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore } from '../store/useIncidentStore';

export const ProviderOrchestrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appState = useTerminalStore(state => state.appState);
  const severity = useIncidentStore(state => state.severity);
  const isPaused = useIncidentStore(state => state.isPaused);

  return (
    <AudioProvider isLoggedIn={appState === 'READY'} severity={severity} isPaused={isPaused}>
      {children}
    </AudioProvider>
  );
};
