import { useEffect } from 'react';
import type { PaneId } from './useWindowManager';

interface ShortcutsProps {
  loggedTogglePane: (id: PaneId) => void;
}

export const useKeyboardShortcuts = ({ loggedTogglePane }: ShortcutsProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F1': e.preventDefault(); loggedTogglePane('terminal'); break;
        case 'F2': e.preventDefault(); loggedTogglePane('logs'); break;
        case 'F3': e.preventDefault(); loggedTogglePane('deploy'); break;
        case 'F4': e.preventDefault(); loggedTogglePane('chat'); break;
        case 'F5': e.preventDefault(); loggedTogglePane('metrics'); break;
        case 'F9': e.preventDefault(); loggedTogglePane('settings'); break;
        case 'F10': e.preventDefault(); loggedTogglePane('howTo'); break;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [loggedTogglePane]);
};
