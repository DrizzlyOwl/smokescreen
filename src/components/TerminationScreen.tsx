import React from 'react';
import { Button } from './Button';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore } from '../store/useIncidentStore';
import { formatCurrency } from '../utils/currency';
import '../styles/terminal.scss';

export const TerminationScreen: React.FC = () => {
    const setAppState = useTerminalStore(state => state.setAppState);
    const { mitigationScore, moneyLost, ceaseTheatre } = useIncidentStore();

    const [randomId, setRandomId] = React.useState('');

    React.useEffect(() => {
        setRandomId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, []);

    const handleReboot = () => {
        ceaseTheatre();
        setAppState('BOOT');
    };

    return (
        <div className="shutdown-screen">
            <div className="shutdown-screen__content">
                <div className="shutdown-screen__glitch">
                    <h1 style={{ color: 'var(--terminal-red)', fontSize: '4rem' }}>ACCESS_REVOKED</h1>
                    <p style={{ color: 'var(--terminal-red)', fontSize: '1.5rem', marginBottom: '2rem' }}>
                        SYSTEM_INTEGRITY_FAILURE // TERMINATION_PROTOCOL_ACTIVE
                    </p>
                </div>

                <div className="shutdown-screen__stats" style={{ textAlign: 'left', display: 'inline-block', border: '1px solid var(--terminal-red)', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ color: 'var(--ui-text-dim)', marginBottom: '1rem' }}>POST-INCIDENT PERFORMANCE REPORT:</div>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>FINAL_MITIGATION_SCORE: {mitigationScore}</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--terminal-red)' }}>TOTAL_FINANCIAL_LOSS: {formatCurrency(moneyLost)}</div>
                    <div style={{ marginTop: '1rem', color: 'var(--ui-text-dim)' }}>STATUS: FIRED_FOR_CAUSE</div>
                </div>

                <div style={{ width: '300px', margin: '0 auto' }}>
                    <Button variant="primary" onClick={handleReboot} fullWidth>
                        [ SYSTEM_REBOOT ]
                    </Button>
                </div>

                <div className="shutdown-screen__footer" style={{ marginTop: '4rem', opacity: 0.5 }}>
                    ID: {randomId} // SMOKESCREEN_OS
                </div>
            </div>
        </div>
    );
};
