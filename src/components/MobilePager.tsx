import { useState, useEffect, useRef } from 'react';
import type { Severity, Stack } from '../data/incidents';
import { Button } from './Button';
import { useSync } from '../hooks/useSync';
import { useTerminal } from '../hooks/useTerminal';

interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isBot: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: (this: BatteryManager, ev: Event) => void): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

export const MobilePager = ({ initialSeverity, initialStack, uplinkId: initialUplinkId }: { 
    initialSeverity: Severity, 
    initialStack: Stack,
    uplinkId: string 
}) => {
    const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED'>('CONNECTING');
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [liveSeverity, setLiveSeverity] = useState<Severity>(initialSeverity);
    const [liveStack, setLiveStack] = useState<Stack>(initialStack);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [kernelLogs, setKernelLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'ALERTS' | 'CHAT' | 'LOGS' | 'SETTINGS'>('ALERTS');
    const { setUplinkId, uplinkId } = useTerminal();
    const [tempUplinkId, setTempUplinkId] = useState(initialUplinkId);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const { subscribe, isConnected: isPeerConnected, connectionStatus } = useSync();

    useEffect(() => {
        const unsubscribe = subscribe((data) => {
            if (data.type === 'STATE_UPDATE') {
                setLiveSeverity(data.severity);
                setLiveStack(data.stack);
                setIsAcknowledged(false);
            }
            if (data.type === 'CHAT_MESSAGE') {
                setMessages(prev => [...prev, data.message].slice(-50));
            }
            if (data.type === 'LOG_MESSAGE') {
                setKernelLogs(prev => [...prev, data.log].slice(-100));
            }
        });
        return unsubscribe;
    }, [subscribe]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isPeerConnected) setStatus('CONNECTED');
        }, 1500);
        const clock = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        
        if ('getBattery' in navigator) {
            (navigator as unknown as NavigatorWithBattery).getBattery().then((battery: BatteryManager) => {
                setBatteryLevel(Math.round(battery.level * 100));
                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                });
            });
        }

        return () => { 
            clearTimeout(timer); 
            clearInterval(clock); 
        };
    }, [isPeerConnected]);

    useEffect(() => {
        if (activeTab === 'CHAT' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (activeTab === 'LOGS' && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, kernelLogs, activeTab]);

    const handleResync = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempUplinkId.trim()) {
            setUplinkId(tempUplinkId.toUpperCase());
            setActiveTab('ALERTS');
            setStatus('CONNECTING');
        }
    };

    const isIncident = liveSeverity !== 'NOMINAL';
    const incidentColor = liveSeverity === 'P0' ? '#ff3b3b' : liveSeverity === 'P1' ? '#ffb000' : 'var(--terminal-green)';

    if (status === 'CONNECTING') {
        return (
            <div className="mobile-pager__connecting">
                <div className="mobile-pager__connecting-indicator">●</div>
                <div className="mobile-pager__connecting-label">ESTABLISHING_SECURE_UPLINK</div>
                <div className="mobile-pager__connecting-id">UPLINK_ID: {uplinkId}</div>
            </div>
        );
    }

    return (
        <div className="mobile-pager__container">
            {/* iOS Style Status Bar */}
            <div className="mobile-pager__status-bar">
                <span>{currentTime.slice(0, 5)}</span>
                <div className="mobile-pager__status-bar-right">
                    <span>📶</span>
                    <span>🔋 {batteryLevel !== null ? `${batteryLevel}%` : '84%'}</span>
                </div>
            </div>

            {/* Header */}
            <header className="mobile-pager__header">
                <div className="mobile-pager__header-icon">SRE</div>
                <div className="mobile-pager__header-info">
                    <div className="mobile-pager__header-title">SMOKESCREEN Mobile</div>
                    <div className="mobile-pager__header-status" style={{ 
                        color: connectionStatus === 'CONNECTED' ? 'var(--terminal-green)' : 
                               connectionStatus === 'CONNECTING' ? 'var(--terminal-amber)' : '#768390' 
                    }}>
                        ● {connectionStatus}
                    </div>
                </div>
            </header>

            <main className="mobile-pager__main">
                {activeTab === 'ALERTS' ? (
                    <div className="mobile-pager__content">
                        {isIncident ? (
                            <div 
                                className={`mobile-pager__card mobile-pager__card--alert ${isAcknowledged ? 'mobile-pager__card--acknowledged' : ''}`}
                                style={{ 
                                    borderColor: isAcknowledged ? undefined : incidentColor,
                                    animation: isAcknowledged ? 'none' : undefined
                                }}
                            >
                                <div style={{ color: incidentColor }} className="mobile-pager__card-severity">
                                    {liveSeverity} INCIDENT DETECTED
                                </div>
                                <h2 className="mobile-pager__card-title">
                                    {liveStack} Stack Degradation
                                </h2>
                                <p className="mobile-pager__card-description">
                                    Critical failure detected in {liveStack} control plane. Multiple services reporting 503 errors and cascading latencies.
                                </p>
                                
                                {!isAcknowledged && (
                                    <Button 
                                        onClick={() => setIsAcknowledged(true)}
                                        variant="mobile"
                                        fullWidth
                                        size="small"
                                        className="mobile-pager__acknowledge-button"
                                        style={{ background: incidentColor }}
                                    >
                                        ACKNOWLEDGE INCIDENT
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="mobile-pager__nominal">
                                <div className="mobile-pager__nominal-icon">🛡️</div>
                                <h3 className="mobile-pager__nominal-title">ALL SYSTEMS NOMINAL</h3>
                                <p className="mobile-pager__nominal-text">Waiting for next incident page...</p>
                            </div>
                        )}

                        <div className="mobile-pager__card">
                            <div className="mobile-pager__card-label">ACTIVE_SESSION</div>
                            <div className="mobile-pager__card-row">
                                <span>Uplink ID: {uplinkId}</span>
                                <span className="mobile-pager__stack-badge">{liveStack}</span>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'CHAT' ? (
                    <div className="mobile-pager__chat">
                        <div className="mobile-pager__chat-messages">
                            {messages.length === 0 && <div className="mobile-pager__chat-empty">Connecting to incident-war-room...</div>}
                            {messages.map((m, i) => (
                                <div key={i} className="mobile-pager__chat-message">
                                    <div 
                                        className={`mobile-pager__chat-avatar ${m.isBot ? 'mobile-pager__chat-avatar--bot' : ''}`}
                                    >
                                        {m.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="mobile-pager__chat-content">
                                        <div className="mobile-pager__chat-header">
                                            <span className="mobile-pager__chat-user">{m.user}</span>
                                            <span className="mobile-pager__chat-time">{m.time}</span>
                                        </div>
                                        <div className="mobile-pager__chat-body">
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                ) : activeTab === 'LOGS' ? (
                    <div className="mobile-pager__logs">
                        {kernelLogs.length === 0 && <div className="mobile-pager__logs-empty">Awaiting kernel logs...</div>}
                        {kernelLogs.map((log, i) => (
                            <div key={i} className={`mobile-pager__log-entry ${
                                log.includes('PANIC') || log.includes('FATAL') || log.includes('CRITICAL') ? 'mobile-pager__log-entry--critical' : ''
                            }`}>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                ) : (
                    <div className="mobile-pager__content">
                        <div className="mobile-pager__settings">
                            <h3 className="mobile-pager__settings-title">Manual Re-sync</h3>
                            <p className="mobile-pager__settings-description">
                                Enter a different Uplink ID to connect this device to another active SMOKESCREEN terminal.
                            </p>
                            <form onSubmit={handleResync} className="mobile-pager__settings-form">
                                <input 
                                    type="text" 
                                    value={tempUplinkId}
                                    onChange={(e) => setTempUplinkId(e.target.value.toUpperCase())}
                                    placeholder="ENTER UPLINK ID"
                                    className="mobile-pager__settings-input"
                                />
                                <Button 
                                    type="submit"
                                    variant="mobile"
                                    fullWidth
                                    size="small"
                                >
                                    RE-INITIALIZE UPLINK
                                </Button>
                            </form>
                        </div>

                        <div className="mobile-pager__device-info">
                            DEVICE_MODEL: GENERIC_MOBILE_BROWSER<br/>
                            OS_VERSION: SRE_COMPANION_v5.0
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Navigation */}
            <footer className="mobile-pager__nav">
                <button 
                    onClick={() => setActiveTab('ALERTS')}
                    className={`mobile-pager__nav-item ${activeTab === 'ALERTS' ? 'mobile-pager__nav-item--active' : ''}`}
                >
                    <div className="mobile-pager__nav-item-icon">📟</div>
                    <div className="mobile-pager__nav-item-label">ALERTS</div>
                </button>
                <button 
                    onClick={() => setActiveTab('CHAT')}
                    className={`mobile-pager__nav-item ${activeTab === 'CHAT' ? 'mobile-pager__nav-item--active' : ''}`}
                >
                    <div className="mobile-pager__nav-item-icon">💬</div>
                    <div className="mobile-pager__nav-item-label">WAR_ROOM</div>
                    {messages.length > 0 && activeTab !== 'CHAT' && (
                        <div className="mobile-pager__nav-badge">
                            {messages.length > 9 ? '9+' : messages.length}
                        </div>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('LOGS')}
                    className={`mobile-pager__nav-item ${activeTab === 'LOGS' ? 'mobile-pager__nav-item--active' : ''}`}
                >
                    <div className="mobile-pager__nav-item-icon">📜</div>
                    <div className="mobile-pager__nav-item-label">LOGS</div>
                </button>
                <button 
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`mobile-pager__nav-item ${activeTab === 'SETTINGS' ? 'mobile-pager__nav-item--active' : ''}`}
                >
                    <div className="mobile-pager__nav-item-icon">⚙️</div>
                    <div className="mobile-pager__nav-item-label">UPLINK</div>
                </button>
            </footer>
        </div>
    );
};
