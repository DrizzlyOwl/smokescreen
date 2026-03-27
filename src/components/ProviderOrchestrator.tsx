import React, { useContext, useCallback, useEffect } from 'react';
import type { DataConnection } from 'peerjs';
import { IncidentProvider } from '../contexts/IncidentContext';
import { useTerminal } from '../hooks/useTerminal';
import { AudioProvider } from '../contexts/AudioContext';
import { SyncProvider, useSync } from '../contexts/SyncContext';
import { IncidentContext } from '../contexts/instances';

const SyncBroadcaster: React.FC = () => {
  const incident = useContext(IncidentContext);
  const { send } = useSync();

  useEffect(() => {
    if (incident) {
      send({
        type: 'STATE_UPDATE',
        severity: incident.severity,
        stack: incident.stack
      });
    }
  }, [incident, send]);

  return null;
};

const SyncOrchestrator: React.FC<{ children: React.ReactNode, isHost: boolean, appState: string }> = ({ children, isHost, appState }) => {
  const incident = useContext(IncidentContext);

  const handlePeerConnected = useCallback((conn: DataConnection) => {
    if (incident) {
        conn.send({
            type: 'STATE_UPDATE',
            severity: incident.severity,
            stack: incident.stack
        });
    }
  }, [incident]);

  return (
    <SyncProvider isHost={isHost} onPeerConnected={handlePeerConnected}>
      <SyncBroadcaster />
      <AudioProvider isLoggedIn={appState === 'READY'} severity={incident?.severity || 'NOMINAL'}>
        {children}
      </AudioProvider>
    </SyncProvider>
  );
};

export const ProviderOrchestrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appState } = useTerminal();
  const isHost = appState !== 'MOBILE_PAGER';

  return (
    <IncidentProvider>
      <SyncOrchestrator isHost={isHost} appState={appState}>
        {children}
      </SyncOrchestrator>
    </IncidentProvider>
  );
};
