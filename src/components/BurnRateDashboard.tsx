import { useEffect, useState } from 'react';
import { BurnIcon } from './Icons';
import type { Severity } from '../data/excuses';
import { Pane } from './Pane';

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

export const BurnRateDashboard = ({ severity, zIndex, onFocus, isActive, moneyLost, onClose }: { 
    severity: Severity, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean,
    moneyLost: number,
    onClose: () => void
}) => {
    const [tickerIndex, setTickerIndex] = useState(0);
    const [history, setHistory] = useState<number[]>(Array(30).fill(0));
    const [opCostId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setHistory(prev => [...prev.slice(-29), moneyLost]);
        }, 1000);
        return () => clearInterval(interval);
    }, [moneyLost]);

    const isP0 = severity === 'P0';
    const isP1 = severity === 'P1';
    const burnColor = isP0 ? 'var(--terminal-red)' : isP1 ? 'var(--terminal-amber)' : 'var(--terminal-green)';

    return (
        <Pane
          title="SYSTEM_FINANCIAL_BURN_MONITOR"
          icon={<BurnIcon />}

          iconColor={burnColor}
          initialPos={{ x: 100, y: 400 }}

          initialSize={{ width: 400, height: 250 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          severityColor={severity === 'NOMINAL' ? undefined : burnColor}
          onClose={onClose}
        >
            <div style={{
                height: '100%',
                background: '#0a0c0f',
                display: 'flex',
                flexDirection: 'column',
                padding: '15px',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
            }}>
                {/* Total Loss Display */}
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#768390', letterSpacing: '2px', fontWeight: 'bold' }}>ESTIMATED_INCIDENT_LOSS</div>
                    <div style={{ 
                        fontSize: '1.75rem', 
                        color: burnColor, 
                        fontWeight: 'bold',
                        textShadow: `0 0 10px ${burnColor}44`
                    }}>
                        £{moneyLost.toFixed(2)}
                    </div>
                </div>

                {/* Mini Graph (Simulated) */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    gap: '2px', 
                    borderBottom: '1px solid #1c2128',
                    marginBottom: '10px',
                    padding: '0 5px'
                }}>
                    {history.map((val, i) => {
                        const max = Math.max(...history, 1);
                        const height = (val / max) * 100;
                        return (
                            <div key={i} style={{
                                flex: 1,
                                height: `${Math.max(2, height)}%`,
                                background: burnColor,
                                opacity: 0.3 + (i / 30) * 0.7
                            }} />
                        );
                    })}
                </div>

                {/* Ticker */}
                <div style={{ 
                    background: '#000', 
                    padding: '6px', 
                    border: '1px solid #1c2128',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: burnColor,
                        whiteSpace: 'nowrap',
                        animation: 'ticker 10s linear infinite',
                        fontWeight: 'bold'
                    }}>
                        {TICKER_ITEMS[tickerIndex]} | {TICKER_ITEMS[(tickerIndex + 1) % TICKER_ITEMS.length]} | {TICKER_ITEMS[(tickerIndex + 2) % TICKER_ITEMS.length]}
                    </div>
                </div>

                <div style={{ 
                    marginTop: '8px', 
                    fontSize: '0.75rem', 
                    color: '#768390',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold'
                }}>
                    <span>STATUS: {severity}</span>
                    <span>OP_COST_ID: {opCostId}</span>
                </div>
            </div>
        </Pane>
    );
};
