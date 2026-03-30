import React from 'react';
import { TechnicalPane } from './TechnicalPane';
import { PlaybookIcon } from './Icons';
import { Button } from './Button';
import { PLAYBOOKS } from '../data/playbooks';
import type { Playbook } from '../data/playbooks/types';
import '../styles/PlaybookPane.scss';

interface PlaybookPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  activePlaybook: Playbook | null;
  startPlaybook: (playbook: Playbook) => void;
  stopPlaybook: () => void;
}

export const PlaybookPane: React.FC<PlaybookPaneProps> = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  activePlaybook,
  startPlaybook,
  stopPlaybook
}) => {
  return (
    <TechnicalPane
      id="playbooks"
      title="INCIDENT_PLAYBOOK_LIBRARY"
      paneTitle="INCIDENT: AUTOMATION"
      classification="RESTRICTED_ACCESS"
      icon={<PlaybookIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      initialPos={{ x: 400, y: 200 }}
      initialSize={{ width: 450, height: 550 }}
      footerText={
        <>
          ENGINE: SMOKESCREEN_PLAYBOOK_v5.0
          <br />
          RESTRICTION: SRE_LEVEL_4_OR_HIGHER
        </>
      }
    >
      <div className="playbooks">
        <section>
          <p className="playbooks__intro">
            Select a pre-scripted scenario to launch an automated incident. Each playbook coordinates specific chat messages, technical logs, and severity escalations.
          </p>
        </section>

        <div className="playbooks__list">
          {Object.values(PLAYBOOKS).map((playbook) => (
            <div key={playbook.id} className="playbooks__card">
              <div>
                <div className="playbooks__card-title">
                  {playbook.name.toUpperCase()}
                </div>
                <div className="playbooks__card-desc">
                  {playbook.description}
                </div>
                <div className="playbooks__card-scenario">
                  {playbook.id === 'dns-meltdown' && "SCENARIO: Global traffic failure, BGP routing errors, and DNS resolution timeouts."}
                  {playbook.id === 'db-deadlock' && "SCENARIO: Database locking, connection pool exhaustion, and OOM (Out of Memory) crashes."}
                  {playbook.id === 'bgp-blackhole' && "SCENARIO: Network connectivity loss, Tier-1 peering failures, and global flatline metrics."}
                  {playbook.id === 'kernel-panic-cascade' && "SCENARIO: Low-level system crashes, Kubernetes node drops, and fleet-wide failure."}
                  {playbook.id === 'cloud-security-breach' && "SCENARIO: Unauthorized API access alerts, credential leakage logs, and emergency region isolation."}
                </div>
              </div>
              
              <Button 
                active={activePlaybook?.id === playbook.id} 
                onClick={() => activePlaybook?.id === playbook.id ? stopPlaybook() : startPlaybook(playbook)} 
                size="small"
                fullWidth
                variant={activePlaybook?.id === playbook.id ? 'primary' : 'terminal'}
              >
                {activePlaybook?.id === playbook.id ? 'TERMINATE_SCENARIO' : 'LAUNCH_SCENARIO'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </TechnicalPane>
  );
};
