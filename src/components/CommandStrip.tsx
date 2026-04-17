import React from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore } from '../store/useIncidentStore';
import type { PaneId, PanesState } from '../hooks/useWindowManager';

import { type GameMode } from '../store/useIncidentStore';

interface CommandStripProps {
  panes: PanesState;
  loggedTogglePane: (id: PaneId) => void;
  handleLogout: () => void;
  severity: string;
  isDeclared: boolean;
  onDeclare: () => void;
  onResolve: () => void;
  mitigationCount: number;
  unreadChat: number;
  gameMode: GameMode;
}

export const CommandStrip: React.FC<CommandStripProps> = ({ 
  panes, 
  loggedTogglePane, 
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
  const uplinkId = useTerminalStore(state => state.uplinkId);
  const activeBeacons = useIncidentStore(state => state.activeBeacons);

  const showDeclare = severity !== 'NOMINAL' && !isDeclared && gameMode === 'SANDBOX';
  const showResolve = severity === 'NOMINAL' && isDeclared && mitigationCount > 0;

  const getBeaconClass = (id: PaneId) => activeBeacons.includes(id) ? 'command-strip__btn--beacon' : '';

  return (
    <div className="command-strip">
      <div className="command-strip__info">
        OP:{operatorName.toUpperCase()} // ID:{uplinkId.slice(0,8)}
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
        <button className={`command-strip__btn ${panes.terminal ? 'active' : ''} ${getBeaconClass('terminal')}`} onClick={() => loggedTogglePane('terminal')}><span className="f-key">[F1]</span> TERM</button>
        <button className={`command-strip__btn ${panes.logs ? 'active' : ''} ${getBeaconClass('logs')}`} onClick={() => loggedTogglePane('logs')}><span className="f-key">[F2]</span> LOGS</button>
        <button className={`command-strip__btn ${panes.deploy ? 'active' : ''} ${getBeaconClass('deploy')}`} onClick={() => loggedTogglePane('deploy')}><span className="f-key">[F3]</span> K8S</button>
        <button className={`command-strip__btn ${panes.chat ? 'active' : ''} ${getBeaconClass('chat')}`} onClick={() => loggedTogglePane('chat')}>
          <span className="f-key">[F4]</span> CHAT {unreadChat > 0 && <span className="command-strip__unread-badge">({unreadChat})</span>}
        </button>
        <button className={`command-strip__btn ${panes.metrics ? 'active' : ''} ${getBeaconClass('metrics')}`} onClick={() => loggedTogglePane('metrics')}><span className="f-key">[F5]</span> METR</button>
        <button className={`command-strip__btn ${panes.playbooks ? 'active' : ''} ${getBeaconClass('playbooks')}`} onClick={() => loggedTogglePane('playbooks')}><span className="f-key">[F8]</span> PLYBK</button>
        <button className={`command-strip__btn ${panes.settings ? 'active' : ''} ${getBeaconClass('settings')}`} onClick={() => loggedTogglePane('settings')}><span className="f-key">[F9]</span> CFG</button>
        <button className={`command-strip__btn ${panes.howTo ? 'active' : ''} ${getBeaconClass('howTo')}`} onClick={() => loggedTogglePane('howTo')}><span className="f-key">[F10]</span> HELP</button>
        <button className="command-strip__btn" onClick={handleLogout}><span className="f-key">[ESC]</span> EXIT</button>
      </div>
    </div>
  );
};
