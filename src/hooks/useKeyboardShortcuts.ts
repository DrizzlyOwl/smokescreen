import { useEffect, useCallback, useRef } from 'react';
import { SCREEN_SHORTCUTS, type ScreenId } from './useScreenManager';
import type { PaneId } from './useWindowManager';

/**
 * Legacy interface for old window-based navigation (Phase 1 compatibility).
 * Will be removed in Phase 4.
 */
interface LegacyShortcutsProps {
  loggedTogglePane: (id: PaneId) => void;
  togglePause: () => void;
  isDeclared: boolean;
}

/**
 * New interface for screen-based navigation.
 */
interface ScreenShortcutsProps {
  /** Navigate to a screen */
  setActiveScreen: (id: ScreenId) => void;
  /** Toggle terminal expand/collapse */
  toggleTerminalCollapsed: () => void;
  /** Toggle debug overlay */
  toggleDebug: () => void;
  /** Toggle pause state */
  togglePause: () => void;
  /** Handle logout (called after ESC confirmation) */
  handleLogout: () => void;
  /** Whether an incident has been declared (gates readout screen) */
  isDeclared: boolean;
  /** Callback when ESC confirm state changes (for UI feedback) */
  onEscConfirmChange?: (confirming: boolean) => void;
}

/** Time window for ESC double-press confirmation (ms) */
const ESC_CONFIRM_TIMEOUT = 3000;

/**
 * Legacy hook for old window-based F-key shortcuts.
 * Used during Phase 1-3 transition. Will be removed in Phase 4.
 * 
 * @deprecated Use useScreenShortcuts instead
 */
export const useKeyboardShortcuts = ({
  loggedTogglePane,
  togglePause,
  isDeclared
}: LegacyShortcutsProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Pause': e.preventDefault(); togglePause(); break;
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
  }, [loggedTogglePane, togglePause, isDeclared]);
};

/**
 * New hook for screen-based Ctrl+ keyboard shortcuts.
 * 
 * Shortcuts:
 * - Ctrl+1 through Ctrl+0: Navigate to screens
 * - Ctrl+/: Navigate to help
 * - Ctrl+`: Toggle terminal expand/collapse
 * - Ctrl+\: Toggle debug overlay
 * - Ctrl+Space or Pause: Toggle pause
 * - ESC: Logout (requires double-press within 3 seconds)
 */
export const useScreenShortcuts = ({
  setActiveScreen,
  toggleTerminalCollapsed,
  toggleDebug,
  togglePause,
  handleLogout,
  isDeclared,
  onEscConfirmChange,
}: ScreenShortcutsProps) => {
  const escPendingRef = useRef<boolean>(false);
  const escTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEscConfirm = useCallback(() => {
    escPendingRef.current = false;
    if (escTimeoutRef.current) {
      clearTimeout(escTimeoutRef.current);
      escTimeoutRef.current = null;
    }
    onEscConfirmChange?.(false);
  }, [onEscConfirmChange]);

  const handleEsc = useCallback(() => {
    if (escPendingRef.current) {
      // Second ESC press within timeout - confirm logout
      clearEscConfirm();
      handleLogout();
    } else {
      // First ESC press - start confirmation
      escPendingRef.current = true;
      onEscConfirmChange?.(true);
      
      escTimeoutRef.current = setTimeout(() => {
        clearEscConfirm();
      }, ESC_CONFIRM_TIMEOUT);
    }
  }, [handleLogout, clearEscConfirm, onEscConfirmChange]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ESC key (no modifier required)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleEsc();
        return;
      }

      // Any other key press cancels ESC confirmation
      if (escPendingRef.current && e.key !== 'Escape') {
        clearEscConfirm();
      }

      // Pause key (no modifier required)
      if (e.key === 'Pause') {
        e.preventDefault();
        togglePause();
        return;
      }

      // All other shortcuts require Ctrl
      if (!e.ctrlKey) return;

      // Ctrl+Space: Toggle pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
      }

      // Ctrl+`: Toggle terminal
      if (e.key === '`') {
        e.preventDefault();
        toggleTerminalCollapsed();
        return;
      }

      // Ctrl+\: Toggle debug
      if (e.key === '\\') {
        e.preventDefault();
        toggleDebug();
        return;
      }

      // Ctrl+1 through Ctrl+0, Ctrl+/: Navigate to screens
      const screenId = SCREEN_SHORTCUTS[e.key];
      if (screenId) {
        e.preventDefault();
        
        // Gate readout screen behind isDeclared
        if (screenId === 'readout' && !isDeclared) {
          return;
        }
        
        setActiveScreen(screenId);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      // Clean up timeout on unmount
      if (escTimeoutRef.current) {
        clearTimeout(escTimeoutRef.current);
      }
    };
  }, [
    setActiveScreen,
    toggleTerminalCollapsed,
    toggleDebug,
    togglePause,
    handleEsc,
    clearEscConfirm,
    isDeclared,
  ]);

  // Return a function to programmatically clear ESC confirm state
  // (useful if user clicks elsewhere or navigates)
  return { clearEscConfirm };
};
