import { useCallback } from 'react';
import type { SyncContextType, SyncPayload } from '../contexts/types';

const CHANNEL_NAME = 'smokescreen-sync';
const handlers = new Set<(data: SyncPayload) => void>();
let broadcastChannel: BroadcastChannel | null = null;

// Initialize channel once
if (typeof window !== 'undefined') {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  broadcastChannel.onmessage = (event) => {
    handlers.forEach(handler => handler(event.data));
  };
}

export const useSync = (): SyncContextType => {
  const send = useCallback((data: SyncPayload) => {
    // Send to other tabs
    broadcastChannel?.postMessage(data);
    // Also trigger local handlers so the same tab sees its own debug logs
    handlers.forEach(handler => handler(data));
  }, []);

  const subscribe = useCallback((handler: (data: SyncPayload) => void) => {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }, []);

  return {
    send,
    subscribe,
    isConnected: true,
    connectionStatus: 'CONNECTED',
    peerId: 'local-session',
    connectionCount: 1
  };
};
