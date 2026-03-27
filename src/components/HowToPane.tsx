import { TechnicalPane } from './TechnicalPane';
import { HelpIcon } from './Icons';
import { TechnicalTypography as Ty } from '../styles/Typography';

interface HowToPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
}

export const HowToPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
}: HowToPaneProps) => {
  const green = 'var(--terminal-green)';
  const red = 'var(--terminal-red)';
  const amber = 'var(--terminal-amber)';

  return (
    <TechnicalPane
      title="SOP_OPERATOR_MANUAL_v5.0"
      paneTitle="PROTOCOL: MISSION_OPERATIONS"
      classification="TOP_SECRET // EYES_ONLY"
      icon={<HelpIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
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
      <section style={Ty.section}>
        <p style={Ty.intro(green)}>
          Welcome to SMOKESCREEN. This platform provides high-fidelity "Performance Cover" for engineers. Use it to generate a convincing digital alibi when you need to exit a low-value meeting or focus on deep-work without interruption.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>01.</span> THE CORE CONCEPT
          </h2>
          <p style={Ty.p}>
            A "Declared Incident" is more than just a status code; it's a social performance. SMOKESCREEN simulates the chaotic environment of a P0 infrastructure failure. To be successful, you must convince observers that your workstation is the epicenter of a critical recovery effort.
          </p>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>02.</span> THE VISUAL DATA FLOOD (CRITICAL)
          </h2>
          <p style={Ty.p}>
            <b style={Ty.bold(red)}>IMPORTANT:</b> Simply pressing "Declare Incident" is not enough to fool a technical audience. Immersion requires <b style={Ty.bold(green)}>Visual Density</b>. You must open and arrange multiple <b>Action Panes</b> to create a "Data Flood" effect:
          </p>
          <ul style={{ ...Ty.p, marginTop: '10px', paddingLeft: '20px' }}>
            <li><b style={Ty.bold(amber)}>System Logs:</b> Provides the "Matrix" effect. Essential for proof of activity.</li>
            <li><b style={Ty.bold(amber)}>Deployment Status:</b> Shows failing Kubernetes pods. Proves "The fix is failing."</li>
            <li><b style={Ty.bold(amber)}>Outage Map:</b> Visual proof of global impact. Great for non-technical managers.</li>
            <li><b style={Ty.bold(amber)}>War Room:</b> Simulated chat traffic proves you are "Coordinating with the team."</li>
          </ul>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>03.</span> ESCALATION PROTOCOLS
          </h2>
          <p style={Ty.p}>
            Use the <b style={Ty.bold(green)}>SLOW BURN</b> feature for a scripted departure. Once enabled, the system will automatically ramp from Nominal to Catastrophic over 30 seconds. This allows you to say, "Everything looks fine..." then pause, look at the screen as sirens trigger, and announce, "Actually, I have to drop. Now."
          </p>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>04.</span> MOBILE SYNCHRONIZATION (PAGER)
          </h2>
          <p style={Ty.p}>
            The <b style={Ty.bold(green)}>PagerSync</b> system provides a secondary "evidence screen" on your mobile device. To configure:
          </p>
          <ol style={{ ...Ty.p, marginTop: '10px', paddingLeft: '20px' }}>
            <li>Open the <b style={Ty.bold(amber)}>PagerSync</b> pane (type <b style={Ty.bold(green)}>'uplink'</b> or <b style={Ty.bold(green)}>'pager'</b> in the command console).</li>
            <li>Scan the <b style={Ty.bold(amber)}>QR Code</b> with your mobile device to auto-initialize the secure tunnel.</li>
            <li>Alternatively, navigate to the terminal URL on your phone and manually enter the 8-character <b style={Ty.bold(amber)}>UPLINK_ID</b> (e.g., SRE-XXXX) in the 'UPLINK' settings tab.</li>
            <li>Once the status displays <b style={Ty.bold(green)}>● UPLINK_ACTIVE</b>, your phone will receive real-time incident alerts, war room chat, and kernel logs.</li>
          </ol>
          <p style={{ ...Ty.p, marginTop: '10px' }}>
            Hold your phone up during a video call to show the flashing "Critical Alert" badge—it is the ultimate physical proof of a P0 infrastructure failure.
          </p>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>05.</span> BOSS MODE (EMERGENCY ABORT)
          </h2>
          <p style={Ty.p}>
            If an actual executive or manager approaches your desk and the simulation is too "intense," hit <b style={Ty.bold(green)}>[CMD+B]</b> immediately. The system will instantly switch to a high-fidelity macOS Update screen, making it look like you are simply waiting for a system patch.
          </p>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>06.</span> AI ENHANCEMENT
          </h2>
          <p style={Ty.p}>
            For hyper-realistic technical jargon, supply a <b style={Ty.bold(green)}>Gemini API Key</b> in Settings. This enables the AI to generate context-aware incident reports specific to your chosen Cloud Stack (AWS, GCP, etc.).
          </p>
        </section>
      </div>

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          border: '1px solid #35373b',
          borderRadius: '4px',
          background: 'rgba(255, 176, 0, 0.05)',
        }}
      >
        <h3 style={Ty.h3(amber)}>
          TACTICAL_KEYBOARD_SHORTCUTS
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <b style={{ color: '#fff' }}>[ESC]</b>{' '}
            <span style={{ opacity: 0.6 }}>Reset Console</span>
          </div>
          <div>
            <b style={{ color: '#fff' }}>[CMD+B]</b>{' '}
            <span style={{ opacity: 0.6 }}>Boss Mode</span>
          </div>
          <div>
            <b style={{ color: '#fff' }}>[2x ESC]</b>{' '}
            <span style={{ opacity: 0.6 }}>Emergency Extraction</span>
          </div>
          <div>
            <b style={{ color: '#fff' }}>[?]</b>{' '}
            <span style={{ opacity: 0.6 }}>View All Commands</span>
          </div>
        </div>
      </div>
    </TechnicalPane>
  );
};
