import { TechnicalPane } from './TechnicalPane';
import { Button } from './Button';
import { PlaybookIcon } from './Icons';
import { SCENARIOS } from '../data/scenarios';
import type { Scenario } from '../data/scenarios/types';
import '../styles/PlaybookPane.scss';

interface ScenarioPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  completedScenarios: string[];
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
}

export const ScenarioPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  onSelectScenario,
  completedScenarios,
  initialPos,
  initialSize = { width: 450, height: 650 }
}: ScenarioPaneProps) => {
  const scenarios = Object.values(SCENARIOS);

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
          {scenarios.map((scenario, index) => {
            const isCompleted = completedScenarios.includes(scenario.id);
            const isUnlocked = index === 0 || completedScenarios.includes(scenarios[index - 1].id);

            return (
              <div 
                key={scenario.id} 
                className={`playbooks__card ${scenario.difficulty === 'L0' ? 'playbooks__card--tutorial' : ''} ${!isUnlocked ? 'playbooks__card--locked' : ''}`}
              >
                <div className="playbooks__card-header">
                    <h3>{scenario.name}</h3>
                    {isCompleted && <div className="playbooks__badge playbooks__badge--completed">COMPLETED</div>}
                    {!isUnlocked && <div className="playbooks__badge playbooks__badge--locked">LOCKED</div>}
                </div>
                
                {scenario.difficulty === 'L0' && !isCompleted && <div className="playbooks__badge">BEGINNER_FRIENDLY</div>}
                
                <div className="playbooks__card-desc">
                    {!isUnlocked ? 'Required clearance not met. Complete previous scenario to unlock.' : scenario.description}
                </div>
                
                <div className="playbooks__card-scenario">
                  MIN_SEVERITY: <span className="text-amber">
                      {scenario.difficulty === 'L0' ? 'P3' : 
                       scenario.difficulty === 'L1' ? 'P3' : 
                       scenario.difficulty === 'L2' ? 'P3' : 
                       scenario.difficulty === 'L3' ? 'P1' : 'P0'}
                  </span>
                </div>
                <Button 
                  onClick={() => isUnlocked && onSelectScenario(scenario)}
                  variant={scenario.difficulty === 'L0' ? 'success' : 'primary'}
                  size="small"
                  fullWidth
                  disabled={!isUnlocked}
                >
                  {scenario.difficulty === 'L0' ? 'START_CERTIFICATION' : isUnlocked ? 'INITIALIZE_SCENARIO' : 'LOCKED_BY_PROCEDURE'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </TechnicalPane>
  );
};
