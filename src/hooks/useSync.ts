import { useContext } from 'react';
import { SyncContextInstance } from '../contexts/instances';

export const useSync = () => {
  const context = useContext(SyncContextInstance);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
