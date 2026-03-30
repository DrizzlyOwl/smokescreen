import { useEffect, useState, useRef } from 'react';
import { BurnIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { getBurnRate } from '../utils/telemetry';
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

export const BurnRateDashboard = ({ severity, zIndex, onFocus, isActive, moneyLost, onClose, isMinimized, onMinimizeToggle }: { 
    severity: Severity, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean,
    moneyLost: number,
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void
}) => {
    const [tickerIndex, setTickerIndex] = useState(0);
    const [history, setHistory] = useState<number[]>(Array(30).fill(0));
    const [opCostId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
    const lastSeverity = useRef<Severity>(severity);

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (severity === 'NOMINAL') {
            setHistory(Array(30).fill(0));
            return;
        }

        const interval = setInterval(() => {
            // Get base burn rate for current severity
            const baseRate = getBurnRate(severity);
            
            // Add jitter (±20%) to make it look like real-time telemetry
            const jitter = (Math.random() * 0.4 + 0.8);
            const currentRate = baseRate * jitter;
            
            setHistory(prev => [...prev.slice(-29), currentRate]);
        }, 1000);

        return () => clearInterval(interval);
    }, [severity]);

    // Handle abrupt severity changes (reset history if jumping between non-nominal states)
    useEffect(() => {
        if (lastSeverity.current !== severity && severity !== 'NOMINAL') {
            setHistory(prev => prev.map(v => v * (getBurnRate(severity) / (getBurnRate(lastSeverity.current) || 1))));
        }
        lastSeverity.current = severity;
    }, [severity]);

    const isP0 = severity === 'P0';
    const isP1 = severity === 'P1';
    const burnColor = isP0 ? 'var(--status-p0)' : isP1 ? 'var(--status-p3)' : 'var(--status-nominal)';

    return (
        <Pane
          id="burn"
          title="SYSTEM_FINANCIAL_BURN_MONITOR"
          icon={<BurnIcon />}
          iconColor={burnColor}
          initialPos={{ x: 100, y: 400 }}
          initialSize={{ width: 400, height: 250 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={severity === 'NOMINAL' ? undefined : burnColor}
          onClose={onClose}
        >
            <div className="burn-dashboard">
                <div className="burn-dashboard__display">
                    <div className="burn-dashboard__label">ESTIMATED_INCIDENT_LOSS</div>
                    <div className="burn-dashboard__value" style={{ 
                        color: burnColor, 
                        textShadow: severity === 'NOMINAL' ? 'none' : `0 0 10px ${burnColor}44`
                    }}>
                        £{moneyLost.toFixed(2)}
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
