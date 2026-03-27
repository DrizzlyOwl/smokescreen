import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { TerminalContext } from './instances';

interface SyncContextType {
  send: (data: any) => void;
  subscribe: (handler: (data: any) => void) => () => void;
  isConnected: boolean;
  peerId: string | null;
  connectionCount: number;
}

export const SyncContext = createContext<SyncContextType | undefined>(undefined);

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
  const handlers = useRef<Set<(data: any) => void>>(new Set());
  const onPeerConnectedRef = useRef(onPeerConnected);

  useEffect(() => {
    onPeerConnectedRef.current = onPeerConnected;
  }, [onPeerConnected]);

  const uplinkId = terminal?.uplinkId;

  const broadcast = useCallback((data: any, excludePeerId?: string) => {
    connections.forEach(conn => {
      if (conn.peer !== excludePeerId && conn.open) {
        conn.send(data);
      }
    });
  }, [connections]);

  const send = useCallback((data: any) => {
    // Notify local subscribers
    handlers.current.forEach(handler => handler(data));

    if (isHost) {
      broadcast(data);
    } else if (connections.length > 0) {
      connections[0].send(data);
    }
  }, [isHost, broadcast, connections]);

  const subscribe = useCallback((handler: (data: any) => void) => {
    handlers.current.add(handler);
    return () => {
      handlers.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!uplinkId) return;

    const newPeer = isHost ? new Peer(uplinkId) : new Peer();
    
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
        if (err.type === 'peer-unavailable' && !isHost) {
            setIsConnected(false);
            // Could implement retry logic here
        }
    });

    const setupConnection = (conn: DataConnection) => {
      conn.on('open', () => {
        console.log('Connection established with:', conn.peer);
        setConnections(prev => [...prev, conn]);
        setIsConnected(true);
        
        if (isHost && onPeerConnectedRef.current) {
            onPeerConnectedRef.current(conn);
        }
      });

      conn.on('data', (data) => {
        handlers.current.forEach(handler => handler(data));
        if (isHost) {
            broadcast(data, conn.peer);
        }
      });

      conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        setConnections(prev => prev.filter(c => c.peer !== conn.peer));
        if (!isHost && connections.length <= 1) {
            setIsConnected(false);
        }
      });

      conn.on('error', (err) => {
        console.error('Connection Error:', err);
      });
    };

    return () => {
      newPeer.destroy();
    };
  }, [uplinkId, isHost, broadcast]);

  return (
    <SyncContext.Provider value={{
      send,
      subscribe,
      isConnected,
      peerId: peer?.id || null,
      connectionCount: connections.length
    }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
