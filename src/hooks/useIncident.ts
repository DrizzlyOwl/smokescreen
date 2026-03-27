import { useContext } from 'react';
import { IncidentContext } from '../contexts/instances';

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
