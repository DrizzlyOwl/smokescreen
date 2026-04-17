import React from 'react';
import type { Objective } from '../contexts/types';
import '../styles/MissionHUD.scss';

interface MissionHUDProps {
  objective: Objective | null;
}

export const MissionHUD: React.FC<MissionHUDProps> = ({ objective }) => {
  if (!objective) return null;

  return (
    <div className={`mission-hud mission-hud--${objective.status}`}>
      <div className="mission-hud__scanline" />
      <div className="mission-hud__container">
        <span className="mission-hud__label">
          {objective.status === 'warning' ? '!!! CRITICAL_DIRECTIVE !!!' : '[ CURRENT_DIRECTIVE ]'}
        </span>
        <span className="mission-hud__title">
          {objective.title.toUpperCase()}
        </span>
        <div className="mission-hud__status-indicator">
            <span className="mission-hud__status-text">{objective.status.toUpperCase()}</span>
            <div className="mission-hud__progress-bar">
                <div className="mission-hud__progress-fill" />
            </div>
        </div>
      </div>
    </div>
  );
};
