import React from 'react';
import { TechnicalPane } from './TechnicalPane';
import { PlaybookIcon } from './Icons';
import type { Playbook } from '../data/playbooks/types';
import '../styles/PlaybookPane.scss';

interface IncidentPlaybookPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  activePlaybook: Playbook | null;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
}

export const IncidentPlaybookPane: React.FC<IncidentPlaybookPaneProps> = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  activePlaybook,
  initialPos,
  initialSize = { width: 400, height: 500 },
  isPoppedOut,
  onPopOutToggle,
  isSnappedMain,
  onSnapMainToggle
}) => {
  return (
    <TechnicalPane
      id="incidentPlaybook"
      title="INCIDENT_PLAYBOOK"
      paneTitle="RUNBOOK: ACTIVE"
      classification="INTERNAL_ONLY"
      icon={<PlaybookIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      initialPos={initialPos}
      initialSize={initialSize}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
      metadata={{
        version: '2026.04.21',
        source: 'PLATFORM_OPS',
        authority: 'INTERNAL_ONLY'
      }}
    >
      <div className="playbook-content">
        {activePlaybook ? (
          <div className="playbook-content__active">
            <h2 className="playbook-content__name">{activePlaybook.name}</h2>
            <div className="playbook-content__steps">
              {activePlaybook.runbookText ? (
                <div className="playbook-content__runbook-text">
                  {activePlaybook.runbookText.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h3 key={i}>{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={i}>{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('# ')) {
                      return <h1 key={i}>{line.replace('# ', '')}</h1>;
                    }
                    
                    // Basic bold and code replacement
                    const formatted = line
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`(.*?)`/g, '<code>$1</code>');
                      
                    return (
                      <p 
                        key={i} 
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p>No specific runbook steps defined for this scenario.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="playbook-content__empty">
            <p className="playbook-content__status">NO_ACTIVE_INCIDENT</p>
            <p dangerouslySetInnerHTML={{ 
              __html: "Stand by for system alerts. Load a scenario from the <strong>SCENARIO_DECK</strong> to begin." 
            }} />
          </div>
        )}
      </div>
    </TechnicalPane>
  );
};
