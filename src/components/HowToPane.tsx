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
}

export const HowToPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle
}: HowToPaneProps) => {
  return (
    <TechnicalPane
      id="howTo"
      title="SOP_OPERATOR_MANUAL_v5.0"
      paneTitle="PROTOCOL: MISSION_OPERATIONS"
      classification="TOP_SECRET // EYES_ONLY"
      icon={<HelpIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      initialPos={{ x: 150, y: 50 }}
      initialSize={{ width: 650, height: 750 }}
      footerText={
        <>
          SRE_DIVISION_TACTICAL_THEATRE_UNIT
          <br />
          UNAUTHORIZED REPRODUCTION IS A TERMINABLE OFFENCE
        </>
      }
    >
      <section className="how-to__intro-section">
        <p className="how-to__intro-text">
          SMOKESCREEN is a high-fidelity incident simulation suite. It generates convincing technical evidence to provide "performance cover" during meetings or when you need uninterrupted focus for deep work.
        </p>
      </section>

      <div className="how-to">
        <section className="how-to__section">
          <h2 className="how-to__header">01. INITIALIZATION</h2>
          <p className="how-to__text">
            Before starting the simulation, set your context. Select a <b>Cloud Stack</b> (AWS, GCP, etc.) and a <b className="how-to__highlight-amber">Threat Level</b> (P3 to P0). This ensures all generated logs, chats, and system metrics match your actual engineering environment.
          </p>
        </section>

        <section className="how-to__section">
          <h2 className="how-to__header">02. DECLARING THE INCIDENT</h2>
          <p className="how-to__text">
            Click <b className="how-to__highlight-red">DECLARE_INCIDENT</b> to trigger the main event. The status bar will shift color, alerts will trigger, and an official <b>Technical Playbook</b> will be drafted. To get hyper-realistic reports, add a <b className="how-to__highlight-amber">Gemini API Key</b> in Settings.
          </p>
        </section>

        <section className="how-to__section">
          <h2 className="how-to__header">03. VISUAL DENSITY (THE THEATRE)</h2>
          <p className="how-to__text">
            To be convincing, you must create a "Data Flood." Open and arrange multiple <b>Observability Panes</b> from the top toolbar:
          </p>
          <ul className="how-to__list">
            <li><b className="how-to__highlight-amber">Kernel Logs:</b> Provides constant "background activity."</li>
            <li><b className="how-to__highlight-amber">K8s Status:</b> Shows service health and deployment failures.</li>
            <li><b className="how-to__highlight-amber">War Room:</b> Real-time coordination with a persistent fake team.</li>
            <li><b className="how-to__highlight-amber">Outage Map:</b> Visualizes global impact—ideal for managers.</li>
          </ul>
        </section>

        <section className="how-to__section">
          <h2 className="how-to__header">04. ESCALATION & AUTOMATION</h2>
          <p className="how-to__text">
            Use <b>SLOW BURN</b> for a scripted departure. The system will automatically escalate from Nominal to P0 over 30 seconds. Alternatively, use the <b>PLAYBOOKS</b> menu to launch specific pre-written scenarios like "DNS Meltdown" or "Security Breach."
          </p>
        </section>

        <section className="how-to__section">
          <h2 className="how-to__header">05. MOBILE SYNC (THE PAGER)</h2>
          <p className="how-to__text">
            Use your phone as a secondary "evidence screen." Open the <b>MOBILE_SYNC</b> pane and scan the QR code. Your mobile device will mirror the incident state, scrolling logs and flashing "Critical" alerts—perfect for showing on camera during a video call.
          </p>
        </section>
      </div>
    </TechnicalPane>
  );
};
