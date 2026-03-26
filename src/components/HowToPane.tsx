import { Pane } from './Pane';

export const HowToPane = ({ zIndex, onFocus, isActive, onClose }: { zIndex: number, onFocus: () => void, isActive: boolean, onClose: () => void }) => {
    return (
        <Pane
          title="SOP_OPERATOR_MANUAL_v4.5"
          icon="?"
          iconColor="var(--terminal-green)"
          initialPos={{ x: 200, y: 100 }}
          initialSize={{ width: 550, height: 600 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          onClose={onClose}
        >
            <div style={{
                height: '100%',
                background: '#0a0c0f',
                padding: '30px',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                color: '#adbac7',
                lineHeight: '1.5',
                overflowY: 'auto'
            }}>
                <header style={{ marginBottom: '30px', borderBottom: '2px solid var(--terminal-green)', paddingBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--terminal-green)', opacity: 0.6, letterSpacing: '2px' }}>CLASSIFICATION: TOP_SECRET</div>
                    <h1 style={{ color: 'var(--terminal-green)', fontSize: '2rem', margin: '5px 0 0 0', fontWeight: '900' }}>
                        PROTOCOL: SMOKESCREEN
                    </h1>
                </header>
                
                <section style={{ marginBottom: '25px' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--terminal-green)', opacity: 0.9, fontStyle: 'italic' }}>
                        Welcome, Operator. Use this terminal to provide tactical cover for emergency meeting extractions.
                    </p>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--terminal-green)' }}>01.</span> CONFIGURATION
                        </h3>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Select your <b style={{ color: 'var(--terminal-green)' }}>Cloud Stack</b> and <b style={{ color: 'var(--terminal-green)' }}>Threat Level</b>. 
                            Higher levels (P1/P0) generate exponentially more catastrophic technical evidence.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--terminal-green)' }}>02.</span> VISUAL_DATA_FLOOD
                        </h3>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Activate multiple <b style={{ color: 'var(--terminal-green)' }}>Action Panes</b>. Resize and position windows to overlap your workstation. 
                            Active logs and failing deployments provide the necessary psychological pressure.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--terminal-green)' }}>03.</span> MOBILE_UPLINK
                        </h3>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Initialize <b style={{ color: 'var(--terminal-green)' }}>PagerSync</b>. Scan the secure QR code with your mobile device. 
                            This provides a live companion view to prove incident severity to physical bystanders.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--terminal-green)' }}>04.</span> EXTRACTION
                        </h3>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Trigger <b style={{ color: 'var(--terminal-green)' }}>INITIATE_EMERGENCY_EXTRACTION</b> to generate your technical alibi. 
                            Copy the jargon-heavy log for communications and present the 403-Restricted ticket page as final evidence.
                        </p>
                    </section>
                    <section>
                        <h3 style={{ color: '#fff', fontSize: 'var(--text-l3)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--terminal-green)' }}>05.</span> SLOW_BURN_PROTOCOL
                        </h3>
                        <p style={{ margin: 0, fontSize: 'var(--text-l4)' }}>
                            Enable <b style={{ color: 'var(--terminal-green)' }}>SLOW BURN</b> for a scripted 30-second escalation. 
                            The system will transition from <b style={{ color: 'var(--terminal-green)' }}>P3</b> to <b style={{ color: 'var(--terminal-red)' }}>P0</b> automatically, 
                            triggering audio alerts and visual data floods to create a convincing, gradual departure scenario.
                        </p>
                    </section>
                </div>

                <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #35373b', borderRadius: '4px', background: 'rgba(255, 176, 0, 0.05)' }}>
                    <h3 style={{ color: 'var(--terminal-amber)', fontSize: '1.1rem', margin: '0 0 15px 0', letterSpacing: '1px' }}>QUICK_REF_SHORTCUTS</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '1rem' }}>
                        <div><b style={{ color: '#fff' }}>[ESC]</b> <span style={{ opacity: 0.6 }}>Close / Reset</span></div>
                        <div><b style={{ color: '#fff' }}>[CMD+B]</b> <span style={{ opacity: 0.6 }}>Boss Mode</span></div>
                        <div><b style={{ color: '#fff' }}>[2x ESC]</b> <span style={{ opacity: 0.6 }}>Quick Abort</span></div>
                        <div><b style={{ color: '#fff' }}>[?]</b> <span style={{ opacity: 0.6 }}>Commands</span></div>
                    </div>
                </div>

                <footer style={{ marginTop: '40px', textAlign: 'center', opacity: 0.3, fontSize: '0.9rem', borderTop: '1px solid #1c2128', paddingTop: '20px' }}>
                    PROPERTY OF DXW SRE DIVISION<br/>
                    REPRODUCTION IS A TERMINABLE OFFENCE
                </footer>
            </div>
        </Pane>
    );
};
