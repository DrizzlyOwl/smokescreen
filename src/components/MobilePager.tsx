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
        
        // Fetch real battery status
        if ('getBattery' in navigator) {
            (navigator as unknown as { getBattery: () => Promise<{ level: number, addEventListener: (type: string, listener: () => void) => void }> }).getBattery().then((battery) => {
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
    const incidentColor = liveSeverity === 'P0' ? '#ff3b3b' : liveSeverity === 'P1' ? '#ffb000' : '#18ff62';

    if (status === 'CONNECTING') {
        return (
            <div style={{ height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#18ff62', fontFamily: 'monospace', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '20px', animation: 'pulse 1s infinite' }}>●</div>
                <div>ESTABLISHING_SECURE_UPLINK</div>
                <div style={{ fontSize: '1rem', opacity: 0.5, marginTop: '10px' }}>UPLINK_ID: {uplinkId}</div>
            </div>
        );
    }

    return (
        <div style={{ 
            height: '100vh', 
            backgroundColor: '#0d110d', 
            color: '#fff', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* iOS Style Status Bar */}
            <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-l4)', fontWeight: 'bold', opacity: 0.8 }}>
                <span>{currentTime.slice(0, 5)}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <span>📶</span>
                    <span>🔋 {batteryLevel !== null ? `${batteryLevel}%` : '84%'}</span>
                </div>
            </div>

            {/* Header */}
            <header style={{ padding: '20px', borderBottom: '1px solid #1c2128', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#18ff62', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: 'var(--text-l4)' }}>SRE</div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: 'var(--text-l3)' }}>SMOKESCREEN Mobile</div>
                    <div style={{ fontSize: 'var(--text-l4)', color: '#18ff62', letterSpacing: '1px', fontWeight: 'bold' }}>● UPLINK_ACTIVE</div>
                </div>
            </header>

            <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'ALERTS' ? (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {isIncident ? (
                            <div style={{ 
                                background: isAcknowledged ? 'rgba(24, 255, 98, 0.05)' : `${incidentColor}11`, 
                                border: `1px solid ${isAcknowledged ? '#1c2128' : incidentColor}`,
                                borderRadius: '12px',
                                padding: '20px',
                                animation: isAcknowledged ? 'none' : 'flicker 2s infinite'
                            }}>
                                <div style={{ color: incidentColor, fontWeight: 'bold', fontSize: 'var(--text-l4)', marginBottom: '10px', letterSpacing: '1px' }}>
                                    {liveSeverity} INCIDENT DETECTED
                                </div>
                                <h2 style={{ margin: '0 0 10px 0', fontSize: 'var(--text-l3)', fontWeight: 'bold' }}>
                                    {liveStack} Stack Degradation
                                </h2>
                                <p style={{ margin: '0', fontSize: 'var(--text-l4)', color: '#adbac7', lineHeight: '1.5' }}>
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
                                )}                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#768390' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                                <h3 style={{ fontSize: 'var(--text-l3)', fontWeight: 'bold' }}>ALL SYSTEMS NOMINAL</h3>
                                <p style={{ fontSize: 'var(--text-l4)' }}>Waiting for next incident page...</p>
                            </div>
                        )}

                        <div style={{ background: '#1c2128', borderRadius: '12px', padding: '15px' }}>
                            <div style={{ fontSize: 'var(--text-l4)', color: '#768390', marginBottom: '10px', fontWeight: 'bold' }}>ACTIVE_SESSION</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--text-l4)' }}>Uplink ID: {uplinkId}</span>
                                <span style={{ fontSize: 'var(--text-l4)', background: '#0d110d', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{liveStack}</span>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'CHAT' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#768390', marginTop: '40px', fontSize: 'var(--text-l4)' }}>Connecting to incident-war-room...</div>}
                            {messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: m.isBot ? '#e01e5a' : '#35373b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 'var(--text-l4)', fontWeight: 'bold' }}>
                                        {m.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: 'var(--text-l4)' }}>{m.user}</span>
                                            <span style={{ fontSize: 'var(--text-l4)', opacity: 0.5 }}>{m.time}</span>
                                        </div>
                                        <div style={{ fontSize: 'var(--text-l4)', color: '#d1d2d3', lineHeight: '1.4' }}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                ) : activeTab === 'LOGS' ? (
                    <div style={{ background: '#000', minHeight: '100%', padding: '15px', fontFamily: 'monospace', fontSize: 'var(--text-l4)' }}>
                        {kernelLogs.length === 0 && <div style={{ color: 'var(--terminal-green)', opacity: 0.5 }}>Awaiting kernel logs...</div>}
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
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: 'var(--text-l3)', fontWeight: 'bold' }}>Manual Re-sync</h3>
                            <p style={{ fontSize: 'var(--text-l4)', color: '#adbac7', marginBottom: '20px' }}>
                                Enter a different Uplink ID to connect this device to another active SMOKESCREEN terminal.
                            </p>
                            <form onSubmit={handleResync}>
                                <input 
                                    type="text" 
                                    value={tempUplinkId}
                                    onChange={(e) => setTempUplinkId(e.target.value.toUpperCase())}
                                    placeholder="ENTER UPLINK ID"
                                    style={{ 
                                        width: '100%', 
                                        background: '#1c2128', 
                                        border: '1px solid #35373b', 
                                        padding: '15px', 
                                        borderRadius: '8px', 
                                        color: '#fff', 
                                        fontFamily: 'monospace',
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

                        <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.4, fontSize: 'var(--text-l4)' }}>
                            DEVICE_MODEL: GENERIC_MOBILE_BROWSER<br/>
                            OS_VERSION: SRE_COMPANION_v4.5
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Navigation */}
            <footer style={{ padding: '10px 0', borderTop: '1px solid #1c2128', display: 'flex', justifyContent: 'space-around', background: '#0a0c0f' }}>
                <button 
                    onClick={() => setActiveTab('ALERTS')}
                    style={{ background: 'none', border: 'none', textAlign: 'center', color: activeTab === 'ALERTS' ? '#18ff62' : '#768390', cursor: 'pointer' }}
                >
                    <div style={{ fontSize: '1.2rem' }}>📟</div>
                    <div style={{ fontSize: 'var(--text-l4)', marginTop: '4px', fontWeight: 'bold' }}>ALERTS</div>
                </button>
                <button 
                    onClick={() => setActiveTab('CHAT')}
                    style={{ background: 'none', border: 'none', textAlign: 'center', color: activeTab === 'CHAT' ? '#18ff62' : '#768390', cursor: 'pointer', position: 'relative' }}
                >
                    <div style={{ fontSize: '1.2rem' }}>💬</div>
                    <div style={{ fontSize: 'var(--text-l4)', marginTop: '4px', fontWeight: 'bold' }}>WAR_ROOM</div>
                    {messages.length > 0 && activeTab !== 'CHAT' && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '-2px', 
                            right: '50%', 
                            marginRight: '-22px',
                            background: '#ff3b3b', 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            border: '2px solid #0a0c0f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem',
                            color: 'white',
                            fontWeight: 'bold',
                            animation: 'pulse 1s infinite',
                            zIndex: 10
                        }}>
                            {messages.length > 9 ? '9+' : messages.length}
                        </div>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('LOGS')}
                    style={{ background: 'none', border: 'none', textAlign: 'center', color: activeTab === 'LOGS' ? '#18ff62' : '#768390', cursor: 'pointer' }}
                >
                    <div style={{ fontSize: '1.2rem' }}>📜</div>
                    <div style={{ fontSize: 'var(--text-l4)', marginTop: '4px', fontWeight: 'bold' }}>LOGS</div>
                </button>
                <button 
                    onClick={() => setActiveTab('SETTINGS')}
                    style={{ background: 'none', border: 'none', textAlign: 'center', color: activeTab === 'SETTINGS' ? '#18ff62' : '#768390', cursor: 'pointer' }}
                >
                    <div style={{ fontSize: '1.2rem' }}>⚙️</div>
                    <div style={{ fontSize: 'var(--text-l4)', marginTop: '4px', fontWeight: 'bold' }}>UPLINK</div>
                </button>
            </footer>
        </div>
    );
};
