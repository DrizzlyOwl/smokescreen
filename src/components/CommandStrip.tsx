import React from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore } from '../store/useIncidentStore';
import type { ScreenId } from '../hooks/useScreenManager';
import { SCREEN_LABELS, SCREEN_TO_SHORTCUT } from '../hooks/useScreenManager';
import { type GameMode } from '../store/useIncidentStore';

interface CommandStripProps {
  /** Current active screen */
  activeScreen: ScreenId;
  /** Navigate to a screen */
  setActiveScreen: (id: ScreenId) => void;
  /** Toggle terminal collapse state */
  toggleTerminal: () => void;
  /** Whether terminal is collapsed */
  terminalCollapsed: boolean;
  /** Handle logout */
  handleLogout: () => void;
  /** Current severity */
  severity: string;
  /** Whether incident is declared */
  isDeclared: boolean;
  /** Declare incident handler */
  onDeclare: () => void;
  /** Resolve incident handler */
  onResolve: () => void;
  /** Mitigation count */
  mitigationCount: number;
  /** Unread chat count */
  unreadChat: number;
  /** Game mode */
  gameMode: GameMode;
}

/** Screen IDs in display order */
const SCREEN_ORDER: ScreenId[] = [
  'logs',
  'deploy', 
  'chat',
  'tactical',
  'map',
  'burn',
  'playbooks',
  'incidentPlaybook',
  'readout',
  'settings',
  'howTo',
];

export const CommandStrip: React.FC<CommandStripProps> = ({ 
  activeScreen,
  setActiveScreen,
  toggleTerminal,
  terminalCollapsed,
  handleLogout,
  severity,
  isDeclared,
  onDeclare,
  onResolve,
  mitigationCount,
  unreadChat,
  gameMode
}) => {
  const operatorName = useTerminalStore(state => state.operatorName);
  const terminalId = useTerminalStore(state => state.terminalId);
  const activeBeacons = useIncidentStore(state => state.activeBeacons);
  const isDeployStabilized = useIncidentStore(state => state.isDeployStabilized);

  const showDeclare = severity !== 'NOMINAL' && !isDeclared && gameMode === 'SANDBOX';
  const showResolve = severity === 'NOMINAL' && isDeclared && mitigationCount > 0 && isDeployStabilized;

  const getBeaconClass = (id: ScreenId) => activeBeacons.includes(id) ? 'command-strip__btn--beacon' : '';

  const handleScreenClick = (id: ScreenId) => {
    // Gate readout behind isDeclared
    if (id === 'readout' && !isDeclared) return;
    setActiveScreen(id);
  };

  return (
    <div className="command-strip">
      <div className="command-strip__info">
        OP:{operatorName.toUpperCase()} // ID:{terminalId.slice(0,8)}
      </div>
      <div className="command-strip__actions">
        {showDeclare && (
          <button 
            className="command-strip__btn command-strip__btn--declare" 
            onClick={onDeclare}
          >
            [ ! ] DECLARE INCIDENT
          </button>
        )}
        {showResolve && (
          <button 
            className="command-strip__btn command-strip__btn--resolve" 
            onClick={onResolve}
          >
            [ ✔ ] RESOLVE INCIDENT
          </button>
        )}

        {/* Terminal toggle */}
        <button 
          className={`command-strip__btn ${!terminalCollapsed ? 'active' : ''}`}
          onClick={toggleTerminal}
          title={terminalCollapsed ? 'Expand terminal' : 'Collapse terminal'}
        >
          <span className="f-key">[^`]</span> TERM
        </button>

        {/* Screen navigation buttons */}
        {SCREEN_ORDER.map(id => {
          const isActive = activeScreen === id;
          const isDisabled = id === 'readout' && !isDeclared;
          const shortcut = SCREEN_TO_SHORTCUT[id];
          const label = SCREEN_LABELS[id];
          const beaconClass = getBeaconClass(id);

          return (
            <button
              key={id}
              className={`command-strip__btn ${isActive ? 'active' : ''} ${beaconClass}`}
              onClick={() => handleScreenClick(id)}
              disabled={isDisabled}
              title={isDisabled ? 'AWAITING_INCIDENT_DECLARATION' : `Navigate to ${label}`}
            >
              <span className="f-key">[^{shortcut}]</span> {label}
              {id === 'chat' && unreadChat > 0 && (
                <span className="command-strip__unread-badge">({unreadChat})</span>
              )}
            </button>
          );
        })}

        {/* Exit */}
        <button 
          className="command-strip__btn" 
          onClick={handleLogout}
        >
          <span className="f-key">[ESC]</span> EXIT
        </button>
      </div>
    </div>
  );
};
