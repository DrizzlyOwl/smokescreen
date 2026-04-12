import { useIncidentStore } from '../store/useIncidentStore';

export const useIncident = () => {
  return useIncidentStore();
};
