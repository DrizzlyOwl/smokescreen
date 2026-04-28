import { TechnicalPane } from './TechnicalPane';
import { HelpIcon } from './Icons';
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
  return (
    <TechnicalPane
      id="howTo"
      title="SMOKESCREEN_GAME_MANUAL_v6.0"
      paneTitle="PROTOCOL: MISSION_OPERATIONS"
      classification="TOP_SECRET // EYES_ONLY"
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
        version: 'v6.0.4-ARCADE',
        source: 'SRE_TACTICAL_DIV',
        authority: 'TERMINABLE_OFFENCE'
      }}
    >
      <section className="how-to__intro-section">
        <p className="how-to__intro-text">
          SMOKESCREEN is an interactive "Technical Incident Theatre" simulator. As an elite SRE Operator, you must navigate catastrophic system failures, execute complex overrides, and balance the company's burn rate under extreme pressure. This manual provides the protocols necessary for system survival.
        </p>
      </section>

      <div className="how-to">
        <section className="how-to__section">
          <h2>01. THE CORE LOOP (HOW TO PLAY)</h2>
          <p className="how-to__text">
            SMOKESCREEN is driven by the terminal. The core gameplay loop consists of three distinct phases:
          </p>
          <ul className="how-to__list">
            <li><b className="how-to__highlight-amber">Monitor & Analyze:</b> Keep an eye on system metrics, Kubernetes pod statuses, and kernel logs. Arrange your observability panes from the top bar to stay ahead of any issues.</li>
            <li><b className="how-to__highlight-amber">Declare & Mitigate:</b> When a failure occurs, type <b className="how-to__highlight-red">declare</b> in the terminal. This triggers the theatre and begins burning the company's capital. You must solve puzzles and interact with the system to stabilize it.</li>
            <li><b className="how-to__highlight-amber">Resolve:</b> Only after successfully mitigating the threat and handling executive SITREP demands, type <b className="how-to__highlight-green">resolve</b> to conclude the incident and receive your After-Action Report (AAR).</li>
          </ul>
        </section>

        <section className="how-to__section">
          <h2>02. TERMINAL COMMANDS & USAGE</h2>
          <p className="how-to__text">
            The <b>SYSTEM_TERMINAL_CORE</b> (press <b className="how-to__highlight-amber">[F1]</b> to focus) is your primary interaction point. To execute a command, type it and press <b>[ENTER]</b>. Essential commands include:
          </p>
          <ul className="how-to__list">
            <li><b className="how-to__highlight-amber">declare</b> / <b className="how-to__highlight-green">resolve</b>: Starts or ends the active incident.</li>
            <li><b className="how-to__highlight-amber">aws</b> / <b className="how-to__highlight-amber">gcp</b> / <b className="how-to__highlight-amber">azure</b>: Switches the target infrastructure stack.</li>
            <li><b className="how-to__highlight-amber">p3</b> / <b className="how-to__highlight-amber">p1</b> / <b className="how-to__highlight-amber">p0</b>: Manually changes the incident severity.</li>
            <li><b className="how-to__highlight-amber">warroom</b> / <b className="how-to__highlight-amber">logs</b>: Opens the specified panes.</li>
            <li><b className="how-to__highlight-amber">help</b>: Displays a complete list of all available terminal commands.</li>
          </ul>
        </section>

        <section className="how-to__section">
          <h2>03. INTERACTIVE MITIGATION PUZZLES</h2>
          <p className="how-to__text">
            During an active incident, you must solve puzzles to mitigate the threat. Failure to act or making mistakes incurs immediate financial penalties:
          </p>
          <ul className="how-to__list">
            <li><b className="how-to__highlight-amber">Terminal Overrides:</b> The terminal will occasionally lock during critical failures. You must type the exact 12-character alphanumeric code displayed on-screen within a strict time limit (e.g., 20 seconds). <b>Punitive Typing:</b> Every incorrect keystroke significantly increases the burn rate.</li>
            <li><b className="how-to__highlight-amber">Failover Puzzles:</b> In the <b>Outage Map</b> pane, you will see network nodes. When a node turns red or amber, click and drag a line from the failing node to a healthy (green) infrastructure node to reroute traffic.</li>
            <li><b className="how-to__highlight-amber">Approval Modals:</b> High-risk actions require explicit authorization. You will be prompted to either <b>type a specific authorization phrase</b> accurately, <b>hold down a button</b> for 3 seconds, or <b>drag a slider</b> to 100% within a designated time window.</li>
          </ul>
        </section>

        <section className="how-to__section">
          <h2>04. THE WAR ROOM & OBSERVABILITY</h2>
          <p className="how-to__text">
            Survival requires monitoring multiple data streams and managing communications in the <b>War Room</b>.
          </p>
          <ul className="how-to__list">
            <li><b className="how-to__highlight-amber">Smart Unread System:</b> Messages require a 3-second "dwell" time (keeping them visible on screen) to be marked as read.</li>
            <li><b className="how-to__highlight-amber">Executive Interruptions:</b> High-stakes stakeholders (VP Eng, CISO, CTO) will demand immediate SITREPs (Situation Reports). You must select the correct response in the chat quickly. Ignoring an executive for too long results in catastrophic financial loss.</li>
            <li><b className="how-to__highlight-amber">Operator Bios:</b> Click any operator's avatar in the War Room to view their technical specialization and role.</li>
          </ul>
        </section>

        <section className="how-to__section">
          <h2>05. SYSTEM MECHANICS</h2>
          <p className="how-to__text">
            The SMOKESCREEN environment utilizes <b>Deep URL Synchronization</b>—your exact app state, theme, severity, and active panes are serialized in the URL for instant sharing and persistence.
          </p>
          <p className="how-to__text">
            <b>Global Audio Extract:</b> To toggle the procedural audio engine (environmental fan noise and procedural hums), use the terminal commands <b className="how-to__highlight-amber">audio on</b> and <b className="how-to__highlight-amber">audio off</b>.
          </p>
        </section>
      </div>
    </TechnicalPane>
  );
};
