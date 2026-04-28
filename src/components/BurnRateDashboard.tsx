import { useEffect, useState } from 'react';
import { BurnIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { getBurnRate } from '../utils/telemetry';
import { useIncidentStore } from '../store/useIncidentStore';
import '../styles/BurnRateDashboard.scss';

const TICKER_ITEMS = [
    'AWS_SPEND: +£1,240.12/hr',
    'SRE_BILLABLE: £150.00/hr/unit',
    'OPEX_ADJUSTMENT: -£4,200.00',
    'SLA_CREDIT_RISK: HIGH',
    'REVENUE_ATTRITION: £8,402.21/min',
    'INFRA_RECOVERY_BURN: £2,100.42/hr',
    'STAKEHOLDER_ANXIETY: CRITICAL',
    'COFFEE_CONSUMPTION: 4.2L/hr'
];

const BASE_SPEND = 1240.12; // Hourly baseline

export const BurnRateDashboard = ({ 
    severity, 
    zIndex, 
    onFocus, 
    isActive, 
    moneyLost, 
    onClose, 
    isMinimized, 
    onMinimizeToggle,
    initialPos = { x: 100, y: 400 },
    initialSize = { width: 400, height: 280 }, // Slightly taller for secondary stat
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    severity: Severity, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean,
    moneyLost: number,
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void,
    initialPos?: { x: number, y: number },
    initialSize?: { width: number, height: number },
    isPoppedOut?: boolean,
    onPopOutToggle?: () => void,
    isSnappedMain?: boolean,
    onSnapMainToggle?: () => void
}) => {
    const isPaused = useIncidentStore(state => state.isPaused);
    const [tickerIndex, setTickerIndex] = useState(0);
    const [history, setHistory] = useState<number[]>(Array(30).fill(0));
    const [opCostId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
    const [prevSeverity, setPrevSeverity] = useState<Severity>(severity);

    // Adjust history when severity changes, during render to avoid cascading effects
    if (severity !== prevSeverity) {
        setPrevSeverity(severity);
        if (severity === 'NOMINAL') {
            setHistory(Array(30).fill(0));
        } else if (prevSeverity !== 'NOMINAL') {
            const ratio = getBurnRate(severity) / (getBurnRate(prevSeverity) || 1);
            setHistory(prev => prev.map(v => v * ratio));
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused) return;
            setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused) return;
            // Get base burn rate for current severity
            const baseRate = getBurnRate(severity);
            
            // Add jitter (±20%) to make it look like real-time telemetry
            const jitter = (Math.random() * 0.4 + 0.8);
            const currentRate = baseRate * jitter;
            
            setHistory(prev => [...prev.slice(-29), currentRate]);
        }, 1000);

        return () => clearInterval(interval);
    }, [severity, isPaused]);

    const latestRate = history[history.length - 1];
    const currentHourlySpend = BASE_SPEND + (latestRate * 3600);
    
    const isP0 = severity === 'P0';
    const isP1 = severity === 'P1';
    const burnColor = isP0 ? 'var(--status-p0)' : isP1 ? 'var(--status-p3)' : 'var(--status-nominal)';

    return (
        <Pane
          id="burn"
          title="SYSTEM_FINANCIAL_BURN_MONITOR"
          icon={<BurnIcon />}
          iconColor={burnColor}
          initialPos={initialPos}
          initialSize={initialSize}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={severity === 'NOMINAL' ? undefined : burnColor}
          onClose={onClose}
          isPoppedOut={isPoppedOut}
          onPopOutToggle={onPopOutToggle}
          isSnappedMain={isSnappedMain}
          onSnapMainToggle={onSnapMainToggle}
        >
            <div className="burn-dashboard">
                <div className="burn-dashboard__display">
                    <div className="burn-dashboard__label">CURRENT_CLOUD_SPEND_RATE</div>
                    <div className="burn-dashboard__value" style={{ 
                        color: burnColor, 
                        textShadow: severity === 'NOMINAL' ? 'none' : `0 0 10px ${burnColor}44`
                    }}>
                        £{currentHourlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
                    </div>
                    <div className="burn-dashboard__secondary">
                        <span className="burn-dashboard__secondary-label">CUMULATIVE_INCIDENT_LOSS: </span>
                        <span className="burn-dashboard__secondary-value">£{moneyLost.toFixed(2)}</span>
                    </div>
                </div>

                <div className="burn-dashboard__graph">
                    {history.map((val, i) => {
                        const maxRate = getBurnRate('P0') * 1.2; // Normalize scale against P0 max possible
                        const height = (val / maxRate) * 100;
                        return (
                            <div key={i} className="burn-dashboard__graph-bar" style={{
                                height: `${Math.max(2, height)}%`,
                                background: burnColor,
                                opacity: 0.3 + (i / 30) * 0.7,
                                transition: 'height 0.3s ease'
                            }} />
                        );
                    })}
                </div>

                <div className="burn-dashboard__ticker">
                    <div className="burn-dashboard__ticker-content" style={{ color: burnColor }}>
                        {TICKER_ITEMS[tickerIndex]} | {TICKER_ITEMS[(tickerIndex + 1) % TICKER_ITEMS.length]} | {TICKER_ITEMS[(tickerIndex + 2) % TICKER_ITEMS.length]}
                    </div>
                </div>

                <div className="burn-dashboard__footer">
                    <span>STATUS: {severity}</span>
                    <span>OP_COST_ID: {opCostId}</span>
                </div>
            </div>
        </Pane>
    );
};
