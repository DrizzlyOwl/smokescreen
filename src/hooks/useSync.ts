import type { SyncContextType, SyncPayload } from '../contexts/types';

export const useSync = (): SyncContextType => {
  return {
    send: (_data: SyncPayload) => {},
    subscribe: (_handler: (data: SyncPayload) => void) => () => {},
    isConnected: false,
    connectionStatus: 'DISCONNECTED',
    peerId: null,
    connectionCount: 0
  };
};
