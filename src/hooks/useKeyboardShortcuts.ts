import { useEffect } from 'react';
import type { PaneId } from './useWindowManager';

interface ShortcutsProps {
  loggedTogglePane: (id: PaneId) => void;
  isDeclared: boolean;
}

export const useKeyboardShortcuts = ({ loggedTogglePane, isDeclared }: ShortcutsProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F1': e.preventDefault(); loggedTogglePane('terminal'); break;
        case 'F2': e.preventDefault(); loggedTogglePane('logs'); break;
        case 'F3': e.preventDefault(); loggedTogglePane('deploy'); break;
        case 'F4': e.preventDefault(); loggedTogglePane('chat'); break;
        case 'F6': e.preventDefault(); loggedTogglePane('map'); break;
        case 'F7': e.preventDefault(); loggedTogglePane('burn'); break;
        case 'F8':
          e.preventDefault();
          loggedTogglePane('playbooks');
          break;
        case 'F9':
          e.preventDefault();
          loggedTogglePane('incidentPlaybook');
          break;
        case 'F10':
          e.preventDefault();
          if (isDeclared) {
            loggedTogglePane('readout');
          }
          break;
        case 'F11':
          e.preventDefault();
          loggedTogglePane('settings');
          break;
        case 'F12':
          e.preventDefault();
          loggedTogglePane('howTo');
          break;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [loggedTogglePane, isDeclared]);
};
