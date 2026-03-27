import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

interface PeerSyncOptions {
  id: string;
  isHost: boolean;
  onMessage?: (data: any) => void;
}

export const usePeerSync = ({ id, isHost, onMessage }: PeerSyncOptions) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const newPeer = isHost ? new Peer(id) : new Peer();
    
    newPeer.on('open', (peerId) => {
      console.log('Peer connected with ID:', peerId);
      setPeer(newPeer);
      if (!isHost) {
        const conn = newPeer.connect(id);
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
      console.error('Peer error:', err);
      if (err.type === 'peer-unavailable' && !isHost) {
        setIsConnected(false);
      }
    });

    const setupConnection = (conn: DataConnection) => {
      conn.on('open', () => {
        console.log('Connection opened with:', conn.peer);
        setConnections(prev => [...prev, conn]);
        setIsConnected(true);
        
        // If we are host, we might want to send current state immediately
        // but that should be handled by the caller
      });

      conn.on('data', (data) => {
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
        
        // If host receives data, it might need to broadcast to other clients
        if (isHost) {
            broadcast(data, conn.peer);
        }
      });

      conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        setConnections(prev => prev.filter(c => c.peer !== conn.peer));
      });
      
      conn.on('error', (err) => {
        console.error('Connection error:', err);
      });
    };

    return () => {
      newPeer.destroy();
    };
  }, [id, isHost]);

  const broadcast = useCallback((data: any, excludePeerId?: string) => {
    connections.forEach(conn => {
      if (conn.peer !== excludePeerId && conn.open) {
        conn.send(data);
      }
    });
  }, [connections]);

  const send = useCallback((data: any) => {
    if (isHost) {
      broadcast(data);
    } else if (connections.length > 0) {
      connections[0].send(data);
    }
  }, [isHost, broadcast, connections]);

  return {
    send,
    isConnected,
    peerId: peer?.id,
    connectionCount: connections.length
  };
};
