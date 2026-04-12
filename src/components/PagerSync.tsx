import { useState } from 'react';
import { PagerIcon } from './Icons';
import type { Severity, Stack } from '../data/incidents';
import { Button } from './Button';
import { Pane } from './Pane';
import { QRCodeSVG } from 'qrcode.react';
import { useSync } from '../hooks/useSync';
import { useTerminal } from '../hooks/useTerminal';
import '../styles/PagerSync.scss';

export const PagerSync = ({ 
    severity, 
    stack, 
    zIndex, 
    onFocus, 
    isActive, 
    uplinkId, 
    onClose, 
    isMinimized, 
    onMinimizeToggle,
    initialPos = { x: 800, y: 50 },
    initialSize = { width: 280, height: 440 },
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    severity: Severity, 
    stack: Stack,
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean,
    uplinkId: string,
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
    const { isConnected, connectionCount, connectionStatus } = useSync();
    const { theme, regenerateUplinkId } = useTerminal();
    const [manuallySyncing, setManuallySyncing] = useState(false);
    const isSyncing = manuallySyncing && !isConnected;

    const handleSync = () => {
        setManuallySyncing(true);
    };

    const isHighSeverity = severity === 'P0' || severity === 'P1';
    const baseUrl = window.location.origin + window.location.pathname;
    const pagerUrl = `${baseUrl}?pager=${uplinkId}&sev=${severity}&stack=${stack}&theme=${theme}`;

    const isP0 = severity === 'P0';

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'CONNECTED': return 'var(--terminal-green)';
            case 'CONNECTING': return 'var(--terminal-amber)';
            case 'ERROR': return 'var(--terminal-red)';
            case 'DISCONNECTED': return '#768390';
            default: return '#768390';
        }
    };

    return (
        <Pane
          id="pager"
          title="SYSTEM_PAGERSYNC_UPLINK"
          icon={<PagerIcon />}
          iconColor={getStatusColor()}
          initialPos={initialPos}
          initialSize={initialSize}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={severity === 'NOMINAL' ? undefined : (isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)')}
          onClose={onClose}
          isPoppedOut={isPoppedOut}
          onPopOutToggle={onPopOutToggle}
          isSnappedMain={isSnappedMain}
          onSnapMainToggle={onSnapMainToggle}
        >
            <div className="pager-sync">
                <div className="pager-sync__label">
                    SECURE_UPLINK_ID
                </div>
                <div className="pager-sync__id">
                    {uplinkId}
                </div>

                <div className="pager-sync__qr-container">
                    <QRCodeSVG 
                        value={pagerUrl} 
                        size={120}
                        level="M"
                        includeMargin={false}
                    />
                </div>

                <div className="pager-sync__status-group">
                    <div 
                        className="pager-sync__status-badge"
                        style={{ color: getStatusColor() }}
                    >
                        STATUS: {connectionStatus} {isConnected ? `(${connectionCount})` : ''}
                    </div>
                    {isHighSeverity && isConnected && (
                        <div className="pager-sync__alert-indicator">
                            ALERT_TRANSMITTING...
                        </div>
                    )}
                </div>

                <div className="pager-sync__actions">
                    {!isConnected && (
                        <Button 
                            onClick={handleSync}
                            disabled={isSyncing || connectionStatus === 'CONNECTING'}
                            variant="primary"
                            size="x-small"
                            fullWidth
                        >
                            {isSyncing ? 'AWAITING_PEER...' : 'INITIATE_SYNC'}
                        </Button>
                    )}
                    
                    <Button 
                        onClick={regenerateUplinkId}
                        variant="terminal"
                        size="x-small"
                        fullWidth
                    >
                        RE-INITIALIZE UPLINK
                    </Button>
                </div>

                <div className="pager-sync__footer">
                    STUN: GOOGLE_CLOUD | TRN: P2P_ONLY
                </div>
            </div>
        </Pane>
    );
};
