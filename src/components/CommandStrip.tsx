import React from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import type { PaneId, PanesState } from '../hooks/useWindowManager';

interface CommandStripProps {
  panes: PanesState;
  loggedTogglePane: (id: PaneId) => void;
  handleLogout: () => void;
}

export const CommandStrip: React.FC<CommandStripProps> = ({ 
  panes, 
  loggedTogglePane, 
  handleLogout 
}) => {
  const operatorName = useTerminalStore(state => state.operatorName);
  const uplinkId = useTerminalStore(state => state.uplinkId);

  return (
    <div className="command-strip">
      <div className="command-strip__info">
        OP:{operatorName.toUpperCase()} // ID:{uplinkId.slice(0,8)}
      </div>
      <div className="command-strip__actions">
        <button className={`command-strip__btn ${panes.terminal ? 'active' : ''}`} onClick={() => loggedTogglePane('terminal')}>[F1] TERM</button>
        <button className={`command-strip__btn ${panes.logs ? 'active' : ''}`} onClick={() => loggedTogglePane('logs')}>[F2] LOGS</button>
        <button className={`command-strip__btn ${panes.deploy ? 'active' : ''}`} onClick={() => loggedTogglePane('deploy')}>[F3] K8S</button>
        <button className={`command-strip__btn ${panes.chat ? 'active' : ''}`} onClick={() => loggedTogglePane('chat')}>[F4] CHAT</button>
        <button className={`command-strip__btn ${panes.metrics ? 'active' : ''}`} onClick={() => loggedTogglePane('metrics')}>[F5] METR</button>
        <button className={`command-strip__btn ${panes.settings ? 'active' : ''}`} onClick={() => loggedTogglePane('settings')}>[F9] CFG</button>
        <button className={`command-strip__btn ${panes.howTo ? 'active' : ''}`} onClick={() => loggedTogglePane('howTo')}>[F10] HELP</button>
        <button className="command-strip__btn" onClick={handleLogout}>[ESC] EXIT</button>
      </div>
    </div>
  );
};
