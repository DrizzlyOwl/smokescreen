import { useState, useEffect, useRef } from 'react';
import type { Severity, Stack } from '../data/excuses';
import { Button } from './Button';
import { useSync } from '../contexts/SyncContext';
import { useTerminal } from '../hooks/useTerminal';

interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isBot: boolean;
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
    const { subscribe, isConnected: isPeerConnected } = useSync();

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
            (navigator as any).getBattery().then((battery: any) => {
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
            <div className="h-screen flex flex-col items-center justify-center p-5 text-center font-mono" style={{ backgroundColor: '#000', color: 'var(--terminal-green)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '20px', animation: 'pulse 1s infinite' }}>●</div>
                <div className="bold">ESTABLISHING_SECURE_UPLINK</div>
                <div className="opacity-50" style={{ marginTop: '10px' }}>UPLINK_ID: {uplinkId}</div>
            </div>
        );
    }

    return (
        <div className="mobile-pager__container">
            {/* iOS Style Status Bar */}
            <div className="mobile-pager__status-bar">
                <span>{currentTime.slice(0, 5)}</span>
                <div className="flex gap-1">
                    <span>📶</span>
                    <span>🔋 {batteryLevel !== null ? `${batteryLevel}%` : '84%'}</span>
                </div>
            </div>

            {/* Header */}
            <header className="mobile-pager__header">
                <div className="mobile-pager__header-icon">SRE</div>
                <div>
                    <div className="mobile-pager__header-title">SMOKESCREEN Mobile</div>
                    <div className="mobile-pager__header-status">● UPLINK_ACTIVE</div>
                </div>
            </header>

            <main className="flex-1 overflow-auto flex flex-col">
                {activeTab === 'ALERTS' ? (
                    <div className="flex flex-col gap-5 p-5">
                        {isIncident ? (
                            <div 
                                className="mobile-pager__card mobile-pager__card--alert"
                                style={{ 
                                    background: isAcknowledged ? 'rgba(24, 255, 98, 0.05)' : `${incidentColor}11`, 
                                    border: `1px solid ${isAcknowledged ? '#1c2128' : incidentColor}`,
                                    animation: isAcknowledged ? 'none' : 'flicker 2s infinite'
                                }}
                            >
                                <div style={{ color: incidentColor }} className="bold gap-2 uppercase">
                                    {liveSeverity} INCIDENT DETECTED
                                </div>
                                <h2 className="m-0 bold" style={{ fontSize: 'var(--text-l3)', marginTop: '10px', marginBottom: '10px' }}>
                                    {liveStack} Stack Degradation
                                </h2>
                                <p className="m-0 opacity-80" style={{ fontSize: '16px', lineHeight: '1.5', color: '#adbac7' }}>
                                    Critical failure detected in {liveStack} control plane. Multiple services reporting 503 errors and cascading latencies.
                                </p>
                                
                                {!isAcknowledged && (
                                    <Button 
                                        onClick={() => setIsAcknowledged(true)}
                                        variant="mobile"
                                        fullWidth
                                        size="small"
                                        style={{ 
                                            marginTop: '20px',
                                            background: incidentColor,
                                        }}
                                    >
                                        ACKNOWLEDGE INCIDENT
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-5 opacity-50">
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                                <h3 className="bold" style={{ fontSize: 'var(--text-l3)' }}>ALL SYSTEMS NOMINAL</h3>
                                <p>Waiting for next incident page...</p>
                            </div>
                        )}

                        <div className="mobile-pager__card">
                            <div className="bold opacity-50" style={{ marginBottom: '10px' }}>ACTIVE_SESSION</div>
                            <div className="flex justify-between items-center">
                                <span>Uplink ID: {uplinkId}</span>
                                <span className="bold p-1" style={{ background: '#0d110d', borderRadius: '4px' }}>{liveStack}</span>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'CHAT' ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 p-5 flex flex-col gap-4">
                            {messages.length === 0 && <div className="text-center opacity-50" style={{ marginTop: '40px' }}>Connecting to incident-war-room...</div>}
                            {messages.map((m, i) => (
                                <div key={i} className="flex gap-3">
                                    <div 
                                        className="flex items-center justify-center bold"
                                        style={{ width: '32px', height: '32px', borderRadius: '4px', background: m.isBot ? '#e01e5a' : '#35373b', flexShrink: 0 }}
                                    >
                                        {m.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2" style={{ marginBottom: '2px' }}>
                                            <span className="bold">{m.user}</span>
                                            <span className="opacity-50" style={{ fontSize: '0.8rem' }}>{m.time}</span>
                                        </div>
                                        <div style={{ color: '#d1d2d3', lineHeight: '1.4' }}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                ) : activeTab === 'LOGS' ? (
                    <div className="font-mono h-full p-4 overflow-auto" style={{ background: '#000' }}>
                        {kernelLogs.length === 0 && <div className="opacity-50" style={{ color: 'var(--terminal-green)' }}>Awaiting kernel logs...</div>}
                        {kernelLogs.map((log, i) => (
                            <div key={i} style={{ 
                                marginBottom: '4px', 
                                whiteSpace: 'nowrap',
                                color: log.includes('PANIC') || log.includes('FATAL') || log.includes('CRITICAL') ? '#ff3b3b' : 'var(--terminal-green)'
                            }}>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 p-5">
                        <div>
                            <h3 className="m-0 bold" style={{ fontSize: 'var(--text-l3)', marginBottom: '10px' }}>Manual Re-sync</h3>
                            <p className="opacity-80" style={{ marginBottom: '20px', color: '#adbac7' }}>
                                Enter a different Uplink ID to connect this device to another active SMOKESCREEN terminal.
                            </p>
                            <form onSubmit={handleResync}>
                                <input 
                                    type="text" 
                                    value={tempUplinkId}
                                    onChange={(e) => setTempUplinkId(e.target.value.toUpperCase())}
                                    placeholder="ENTER UPLINK ID"
                                    className="w-full font-mono"
                                    style={{ 
                                        background: '#1c2128', 
                                        border: '1px solid #35373b', 
                                        padding: '15px', 
                                        borderRadius: '8px', 
                                        color: '#fff', 
                                        fontSize: 'var(--text-l3)',
                                        marginBottom: '15px',
                                        outline: 'none'
                                    }} 
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

                        <div className="mt-auto text-center opacity-40">
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
                    style={{ position: 'relative' }}
                >
                    <div className="mobile-pager__nav-item-icon">💬</div>
                    <div className="mobile-pager__nav-item-label">WAR_ROOM</div>
                    {messages.length > 0 && activeTab !== 'CHAT' && (
                        <div 
                            className="flex items-center justify-center bold"
                            style={{ 
                                position: 'absolute', 
                                top: '-2px', 
                                right: '50%', 
                                marginRight: '-22px',
                                background: '#ff3b3b', 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                border: '2px solid #0a0c0f',
                                fontSize: '0.6rem',
                                color: 'white',
                                animation: 'pulse 1s infinite',
                                zIndex: 10
                            }}
                        >
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
