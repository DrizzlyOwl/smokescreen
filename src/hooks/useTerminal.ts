import { useTerminalStore } from '../store/useTerminalStore';

export const useTerminal = () => {
  return useTerminalStore();
};
