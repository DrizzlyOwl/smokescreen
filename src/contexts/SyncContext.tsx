import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { TerminalContext, SyncContextInstance } from './instances';
import type { SyncPayload, ConnectionStatus } from './types';

const PEER_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
    debug: 1
};

export const SyncProvider = ({ 
    children, 
    isHost,
    onPeerConnected
}: { 
    children: React.ReactNode, 
    isHost: boolean,
    onPeerConnected?: (conn: DataConnection) => void
}) => {
  const terminal = useContext(TerminalContext);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const handlers = useRef<Set<(data: SyncPayload) => void>>(new Set());
  const onPeerConnectedRef = useRef(onPeerConnected);
  const heartbeatIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    onPeerConnectedRef.current = onPeerConnected;
  }, [onPeerConnected]);

  const uplinkId = terminal?.uplinkId;
  const setUplinkId = terminal?.setUplinkId;

  const broadcast = useCallback((data: SyncPayload, excludePeerId?: string) => {
    connections.forEach(conn => {
      if (conn.peer !== excludePeerId && conn.open) {
        conn.send(data);
      }
    });
  }, [connections]);

  const send = useCallback((data: SyncPayload) => {
    handlers.current.forEach(handler => handler(data));

    if (isHost) {
      broadcast(data);
    } else if (connections.length > 0) {
      connections[0].send(data);
    }
  }, [isHost, broadcast, connections]);

  const subscribe = useCallback((handler: (data: SyncPayload) => void) => {
    handlers.current.add(handler);
    return () => {
      handlers.current.delete(handler);
    };
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      console.log('Connection established with:', conn.peer);
      setConnections(prev => {
          if (prev.find(c => c.peer === conn.peer)) return prev;
          return [...prev, conn];
      });
      setIsConnected(true);
      setConnectionStatus('CONNECTED');
      
      if (isHost && onPeerConnectedRef.current) {
          onPeerConnectedRef.current(conn);
      }
    });

    conn.on('data', (data: unknown) => {
      const payload = data as SyncPayload;
      if (payload.type === 'HEARTBEAT') return; // Silence heartbeat in handlers
      
      handlers.current.forEach(handler => handler(payload));

      if (isHost) {
        broadcast(payload, conn.peer);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      setConnections(prev => prev.filter(c => c.peer !== conn.peer));
      if (connections.length <= 1) {
          setIsConnected(false);
          if (!isHost) setConnectionStatus('DISCONNECTED');
      }
    });

    conn.on('error', (err) => {
      console.error('Connection Error:', err);
      setConnectionStatus('ERROR');
    });
  }, [isHost, broadcast, connections.length]);

  useEffect(() => {
    if (!uplinkId) return;

    setTimeout(() => setConnectionStatus('CONNECTING'), 0);
    const newPeer = isHost ? new Peer(uplinkId, PEER_CONFIG) : new Peer(PEER_CONFIG);
    
    newPeer.on('open', (id) => {
      console.log('Peer connected with ID:', id);
      setPeer(newPeer);
      if (!isHost) {
        const conn = newPeer.connect(uplinkId, {
            reliable: true
        });
        setupConnection(conn);
      }
    });

    if (isHost) {
      newPeer.on('connection', (conn) => {
        console.log('Incoming connection from:', conn.peer);
        setupConnection(conn);
      });
    }

    newPeer.on('error', (err) => {
        console.error('PeerJS Error:', err);
        setConnectionStatus('ERROR');
        
        if (err.type === 'peer-unavailable' && !isHost) {
            setIsConnected(false);
            setConnectionStatus('DISCONNECTED');
        }

        if (err.type === 'unavailable-id' && isHost && setUplinkId) {
            console.warn('Uplink ID collision, generating new code...');
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            setUplinkId(`SRE-${random}`);
        }
    });

    // Heartbeat logic
    heartbeatIntervalRef.current = window.setInterval(() => {
        if (newPeer && !newPeer.destroyed && isConnected) {
            send({ type: 'HEARTBEAT', timestamp: Date.now() });
        }
    }, 5000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      newPeer.destroy();
    };
  }, [uplinkId, isHost, setupConnection, isConnected, send, setUplinkId]);

  return (
    <SyncContextInstance.Provider value={{
      send,
      subscribe,
      isConnected,
      connectionStatus,
      peerId: peer?.id || null,
      connectionCount: connections.length
    }}>
      {children}
    </SyncContextInstance.Provider>
  );
};
