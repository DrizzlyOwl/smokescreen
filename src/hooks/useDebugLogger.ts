import { useCallback } from 'react';
import { useSync } from '../contexts/SyncContext';

export const useDebugLogger = () => {
  const { send } = useSync();

  const log = useCallback((action: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false, fractionalSecondDigits: 3 });
    send({
      type: 'DEBUG_LOG',
      log: {
        timestamp,
        action: action.toUpperCase(),
        data: data ? JSON.stringify(data) : 'NULL'
      }
    });
  }, [send]);

  return { log };
};
