import { TechnicalPane } from './TechnicalPane';
import { Button } from './Button';
import { PlaybookIcon } from './Icons';
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
  onSelectPlaybook: (playbook: Playbook) => void;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
}

export const PlaybookPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  onSelectPlaybook,
  initialPos,
  initialSize = { width: 450, height: 650 }
}: PlaybookPaneProps) => {
  return (
    <TechnicalPane
      id="playbooks"
      title="SCENARIO_DATABASE_v6.1"
      paneTitle="SCENARIO_DECK"
      classification="RESTRICTED // OPS_USE_ONLY"
      icon={<PlaybookIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      initialPos={initialPos}
      initialSize={initialSize}
      metadata={{
        version: 'v6.0.4',
        source: 'SRE_DECK',
        authority: 'OPERATOR_SELECT'
      }}
    >
      <div className="playbooks">
        <p className="text-lead text-dim">
          Select a simulation scenario to initialize. All events are contained within the local virtual environment.
        </p>

        <div className="playbooks__list">
          {Object.values(PLAYBOOKS).map((playbook) => (
            <div key={playbook.id} className={`playbooks__card ${playbook.difficulty === 'L0' ? 'playbooks__card--tutorial' : ''}`}>
              <h3>{playbook.name}</h3>
              {playbook.difficulty === 'L0' && <div className="playbooks__badge">BEGINNER_FRIENDLY</div>}
              <div className="playbooks__card-desc">{playbook.description}</div>
              <div className="playbooks__card-scenario">
                MIN_SEVERITY: <span className="text-amber">
                    {playbook.difficulty === 'L0' ? 'P3' : 
                     playbook.difficulty === 'L1' ? 'P3' : 
                     playbook.difficulty === 'L2' ? 'P3' : 
                     playbook.difficulty === 'L3' ? 'P1' : 'P0'}
                </span>
              </div>
              <Button 
                onClick={() => onSelectPlaybook(playbook)}
                variant={playbook.difficulty === 'L0' ? 'success' : 'primary'}
                size="small"
                fullWidth
              >
                {playbook.difficulty === 'L0' ? 'START_CERTIFICATION' : 'INITIALIZE_SCENARIO'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </TechnicalPane>
  );
};
