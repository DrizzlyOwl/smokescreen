import { useState, useEffect } from 'react';
import { PagerIcon } from './Icons';
import type { Severity, Stack } from '../data/excuses';
import { Button } from './Button';
import { Pane } from './Pane';
import { QRCodeSVG } from 'qrcode.react';
import { useSync } from '../contexts/SyncContext';

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
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setIsSyncing(false);
        }
    }, [isConnected]);

    const handleSync = () => {
        setIsSyncing(true);
    };

    const isHighSeverity = severity === 'P0' || severity === 'P1';
    const pagerUrl = `https://drizzlyowl.github.io/smokescreen/?pager=${uplinkId}&sev=${severity}&stack=${stack}`;

    return (
        <Pane
          title="SYSTEM_PAGERSYNC_UPLINK"
          icon={<PagerIcon />}
          iconColor={isConnected ? 'var(--terminal-green)' : isSyncing ? 'var(--terminal-amber)' : 'rgba(255, 255, 255, 0.2)'}
          initialPos={{ x: 800, y: 50 }}
          initialSize={{ width: 320, height: 450 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          onClose={onClose}
        >
            <div style={{
                height: '100%',
                background: '#0a0c0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '1rem', color: '#768390', marginBottom: '15px' }}>
                    SECURE_DEVICE_UPLINK_ID: {uplinkId}
                </div>

                {/* Valid QR Code */}
                <div style={{ 
                    background: '#fff', 
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    display: 'inline-block'
                }}>
                    <QRCodeSVG 
                        value={pagerUrl} 
                        size={180}
                        level="M"
                        includeMargin={false}
                    />
                </div>

                <p style={{ fontSize: '1rem', color: '#adbac7', marginBottom: '20px', lineHeight: '1.4' }}>
                    SCAN TO SYNCHRONIZE MOBILE PAGER WITH SMOKESCREEN CLOUD
                </p>

                {!isConnected ? (
                    <Button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        variant="primary"
                        size="small"
                        fullWidth
                    >
                        {isSyncing ? 'AWAITING_PEER_HANDSHAKE...' : 'INITIATE_SYNC_LISTEN'}
                    </Button>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ 
                            color: 'var(--terminal-green)', 
                            fontSize: '1rem', 
                            fontWeight: 'bold',
                            border: '1px solid var(--terminal-green)',
                            padding: '10px',
                            marginBottom: '10px'
                        }}>
                            UPLINK: ACTIVE ({connectionCount})
                        </div>
                        {isHighSeverity && (
                            <div style={{ 
                                animation: 'flicker 0.5s infinite', 
                                color: 'var(--terminal-red)',
                                fontSize: '1rem'
                            }}>
                                {">>>"} ALERT_PACKETS_TRANSMITTING...
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 'auto', fontSize: '1rem', color: '#768390' }}>
                    ENCRYPTION: AES-256-GCM<br/>
                    LATENCY: 42ms
                </div>
            </div>
        </Pane>
    );
};
