import { TechnicalPane } from './TechnicalPane';
import { HelpIcon } from './Icons';
import { useIncidentStore } from '../store/useIncidentStore';
import '../styles/HowToPane.scss';

interface HowToPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
}

export const HowToPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  isPoppedOut,
  onPopOutToggle,
  isSnappedMain,
  onSnapMainToggle,
  initialPos,
  initialSize
}: HowToPaneProps) => {
  const gameMode = useIncidentStore(state => state.gameMode);
  const isArcade = gameMode === 'ARCADE';

  return (
    <TechnicalPane
      id="howTo"
      title={isArcade ? "SMOKESCREEN_ARCADE_PROTOCOL" : "SMOKESCREEN_SANDBOX_MANUAL"}
      paneTitle={isArcade ? "CERTIFICATION_IN_PROGRESS" : "SYSTEM_EXPLORATION_MODE"}
      classification={isArcade ? "RESTRICTED // ARCADE_LEVEL" : "UNCLASSIFIED // PUBLIC_RELEASE"}
      icon={<HelpIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
      onClose={onClose}
      initialPos={initialPos || { x: 150, y: 50 }}
      initialSize={initialSize || { width: 650, height: 750 }}
      metadata={{
        version: isArcade ? 'v6.1-ARCADE' : 'v6.1-SANDBOX',
        source: isArcade ? 'SRE_ACADEMY' : 'SRE_OPS_RESOURCES',
        authority: isArcade ? 'CHIEF_OPERATOR' : 'SYSTEM_ADMIN'
      }}
    >
      <section className="manual-intro">
        {isArcade ? (
          <p className="text-lead">
            Welcome to the <b>ARCADE</b> training program. This is a high-stakes simulation environment where you must follow specific playbooks to earn your Operator Certification. Manual overrides are restricted; precision is everything.
          </p>
        ) : (
          <p className="text-lead">
            Welcome to the <b>SANDBOX</b> environment. This is your personal playground for learning the SMOKESCREEN systems. Feel free to break things, experiment with commands, and learn the cloud stacks at your own pace.
          </p>
        )}
      </section>

      <div className="how-to">
        <section className="manual-section">
          <h2>01. {isArcade ? "ARCADE PROTOCOLS" : "QUICK START: YOUR FIRST MISSION"}</h2>
          {isArcade ? (
            <div className="step-guide">
              <div className="step">
                <span className="step-number">PHASE 1</span>
                <div className="step-content">
                  <p><b>Load a Training Scenario.</b> You cannot manually trigger incidents. Start a mission via:</p>
                  <code>scenario l0-certification</code>
                </div>
              </div>
              <div className="step">
                <span className="step-number">PHASE 2</span>
                <div className="step-content">
                  <p><b>Follow Objectives.</b> Watch the bottom-left Mission HUD. Complete each task as it appears to progress through the story.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">PHASE 3</span>
                <div className="step-content">
                  <p><b>Protect the Budget.</b> Every second of downtime costs the company money. Failure to mitigate threats will drain your capital and lower your final score.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="step-guide">
              <div className="step">
                <span className="step-number">STEP 1</span>
                <div className="step-content">
                  <p><b>Choose your battlefield.</b> Use the terminal to pick a cloud provider:</p>
                  <code>aws</code>, <code>gcp</code>, or <code>azure</code>
                </div>
              </div>
              <div className="step">
                <span className="step-number">STEP 2</span>
                <div className="step-content">
                  <p><b>Start the chaos.</b> Trigger an incident by typing:</p>
                  <code>declare</code>
                </div>
              </div>
              <div className="step">
                <span className="step-number">STEP 3</span>
                <div className="step-content">
                  <p><b>Save the stack.</b> Use the <b>Map [F3]</b> and <b>Deploy [F2]</b> panes to fix failing nodes and pods.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">STEP 4</span>
                <div className="step-content">
                  <p><b>Clock out.</b> Once everything is green, type:</p>
                  <code className="text-green">resolve</code>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="manual-section">
          <h2>02. MASTERING THE TERMINAL [F1]</h2>
          <p>The terminal is your primary interface. Commands are restricted based on your mode:</p>
          <div className="command-grid">
            <div className="command-item">
              <span className="command-name">analyze / sitrep</span>
              <span className="command-desc">Generates a detailed AI report of the failure. Essential when Executives demand updates.</span>
            </div>
            {!isArcade && (
              <div className="command-item">
                <span className="command-name">p0 / p1 / p3</span>
                <span className="command-desc"><b>SANDBOX ONLY:</b> Manually adjust the Severity level to test system reactions.</span>
              </div>
            )}
            <div className="command-item">
              <span className="command-name">panes [id] [on/off]</span>
              <span className="command-desc">Toggle observability windows like <code>logs</code>, <code>chat</code>, or <code>map</code>.</span>
            </div>
            <div className="command-item">
              <span className="command-name">scenario list</span>
              <span className="command-desc">View all available training missions and certifications.</span>
            </div>
          </div>
        </section>

        <section className="manual-section">
          <h2>03. INTERACTIVE FIXES</h2>
          <p>When the alarms go off, static monitoring isn't enough. Action is required:</p>
          <ul>
            <li>
                <b className="text-amber">Traffic Failover:</b> 
                Open <b>Map [F3]</b>. Drag lines from failing (red) regions to healthy (green) ones to reroute user traffic.
            </li>
            <li>
                <b className="text-amber">Pod Restarts:</b> 
                In <b>Deploy [F2]</b>, click any pod in <code>Error</code> or <code>CrashLoop</code> to manually attempt a stabilization sequence.
            </li>
            <li>
                <b className="text-amber">Critical Overrides:</b> 
                System locks require authorization codes. Type the flashing code into the terminal perfectly. <b>Incorrect keys drain budget.</b>
            </li>
          </ul>
        </section>

        {isArcade && (
          <section className="manual-section">
            <h2>04. ARCADE SURVIVAL RULES</h2>
            <p>
              In Arcade mode, your performance is measured by <b>Time to Resolution (TTR)</b> and <b>Capital Burn</b>.
            </p>
            <ul className="pro-tips">
              <li><b>Zero Tolerance:</b> You cannot change your cloud provider or severity levels once a mission starts.</li>
              <li><b>Playbook Mandatory:</b> You must follow the exact mission objectives. Deviating or ignoring objectives will stall your certification.</li>
              <li><b>High Score:</b> Fast mitigation + minimal burn = Gold Certification.</li>
            </ul>
          </section>
        )}

        <section className="manual-section">
          <h2>05. PRO TIPS</h2>
          <ul className="pro-tips">
            <li><b>Shortcut Mastery:</b> Use <code>F1</code>-<code>F4</code> to quickly toggle your most critical views.</li>
            <li><b>Tab Completion:</b> Use <code>TAB</code> in the terminal to speed up command entry.</li>
            <li><b>Mode Switch:</b> If you want to switch modes, type <code>game sandbox</code> or <code>game arcade</code>.</li>
          </ul>
        </section>
      </div>
    </TechnicalPane>
  );
};
