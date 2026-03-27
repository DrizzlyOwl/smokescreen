import { useState } from 'react';
import { PagerIcon } from './Icons';
import type { Severity, Stack } from '../data/excuses';
import { Button } from './Button';
import { Pane } from './Pane';
import { QRCodeSVG } from 'qrcode.react';
import { useSync } from '../contexts/SyncContext';

import { useTerminal } from '../hooks/useTerminal';

export const PagerSync = ({ severity, stack, zIndex, onFocus, isActive, uplinkId, onClose }: { 
    severity: Severity, 
    stack: Stack,
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean,
    uplinkId: string,
    onClose: () => void
}) => {
    const { isConnected, connectionCount } = useSync();
    const { theme } = useTerminal();
    const [manuallySyncing, setManuallySyncing] = useState(false);
    const isSyncing = manuallySyncing && !isConnected;

    const handleSync = () => {
        setManuallySyncing(true);
    };

    const isHighSeverity = severity === 'P0' || severity === 'P1';
    const baseUrl = window.location.origin + window.location.pathname;
    const pagerUrl = `${baseUrl}?pager=${uplinkId}&sev=${severity}&stack=${stack}&theme=${theme}`;

    const isP0 = severity === 'P0';

    return (
        <Pane
          title="SYSTEM_PAGERSYNC_UPLINK"
          icon={<PagerIcon />}
          iconColor={isConnected ? 'var(--terminal-green)' : isSyncing ? 'var(--terminal-amber)' : 'color-mix(in srgb, var(--terminal-green), transparent 80%)'}
          initialPos={{ x: 800, y: 50 }}
          initialSize={{ width: 280, height: 380 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          severityColor={severity === 'NOMINAL' ? undefined : (isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)')}
          onClose={onClose}
        >
            <div style={{
                height: '100%',
                background: '#0a0c0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '15px',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.75rem', color: '#768390', marginBottom: '8px' }}>
                    SECURE_UPLINK_ID
                </div>
                <div style={{ 
                    fontSize: '1.5rem', 
                    color: 'var(--terminal-green)', 
                    fontWeight: 'bold', 
                    letterSpacing: '2px',
                    marginBottom: '15px',
                    textShadow: '0 0 10px rgba(24, 255, 98, 0.5)'
                }}>
                    {uplinkId}
                </div>

                {/* Valid QR Code */}
                <div style={{ 
                    background: '#fff', 
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    display: 'inline-block'
                }}>
                    <QRCodeSVG 
                        value={pagerUrl} 
                        size={120}
                        level="M"
                        includeMargin={false}
                    />
                </div>

                {!isConnected ? (
                    <Button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        variant="primary"
                        size="x-small"
                        fullWidth
                    >
                        {isSyncing ? 'AWAITING_PEER...' : 'INITIATE_SYNC'}
                    </Button>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ 
                            color: 'var(--terminal-green)', 
                            fontSize: '0.85rem', 
                            fontWeight: 'bold',
                            border: '1px solid var(--terminal-green)',
                            padding: '8px',
                            marginBottom: '8px'
                        }}>
                            UPLINK: ACTIVE ({connectionCount})
                        </div>
                        {isHighSeverity && (
                            <div style={{ 
                                animation: 'flicker 0.5s infinite', 
                                color: 'var(--terminal-red)',
                                fontSize: '0.75rem'
                            }}>
                                ALERT_TRANSMITTING...
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 'auto', fontSize: '0.7rem', color: '#768390', opacity: 0.6 }}>
                    ENC: AES-256 | LAT: 42ms
                </div>
            </div>
        </Pane>
    );
};
