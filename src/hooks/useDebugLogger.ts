import { useCallback } from 'react';
import { useSync } from './useSync';
import { formatTimeWithSeconds } from '../utils/telemetry';

export type LogCategory = 
  | 'SYSTEM' 
  | 'CMD' 
  | 'WINDOW' 
  | 'AUDIO' 
  | 'INCIDENT' 
  | 'CHAOS' 
  | 'PLAYBOOK' 
  | 'CHAT' 
  | 'UI'
  | 'BOOT';

export const useDebugLogger = () => {
  const { send } = useSync();

  const log = useCallback((category: LogCategory, action: string, data?: unknown) => {
    const timestamp = formatTimeWithSeconds();
    send({
      type: 'DEBUG_LOG',
      log: {
        timestamp,
        action: `[${category}] ${action.toUpperCase()}`,
        data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : 'NULL'
      }
    });
  }, [send]);

  return { log };
};
