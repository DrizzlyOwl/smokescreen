import { useCallback } from 'react';
import { useSync } from './useSync';
import { formatTimeWithSeconds } from '../utils/telemetry';

export const useDebugLogger = () => {
  const { send } = useSync();

  const log = useCallback((action: string, data?: unknown) => {
    const timestamp = formatTimeWithSeconds();
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
