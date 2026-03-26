import { useState, useEffect, useRef } from 'react';
import './styles/terminal.css';
import { generateExcuse } from './data/excuses';
import type { Severity, Stack } from './data/excuses';
import { FakeLogs } from './components/FakeLogs';
import { FakeCharts } from './components/FakeCharts';
import { WarRoom } from './components/WarRoom';
import { AccessDenied } from './components/AccessDenied';
import { SystemLog } from './components/SystemLog';
import { BossMode } from './components/BossMode';
import { OutageMap } from './components/OutageMap';
import { BootScreen } from './components/BootScreen';
import { CommandInput } from './components/CommandInput';
import { DeploymentStatus } from './components/DeploymentStatus';
import { BurnRateDashboard } from './components/BurnRateDashboard';

function App() {
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [appState, setAppState] = useState<'SPLASH' | 'BOOT' | 'READY'>('SPLASH');
  const [operatorName, setOperatorName] = useState('');
  const [excuse, setExcuse] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [severity, setSeverity] = useState<Severity>('NOMINAL');
  const [stack, setStack] = useState<Stack>('AWS');
  const [isEjecting, setIsEjecting] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [status, setStatus] = useState('SYSTEMS NOMINAL');
  const [view, setView] = useState<'HOME' | 'TICKET'>('HOME');
  const [isBossMode, setIsBossMode] = useState(false);
  const [isSlowBurn, setIsSlowBurn] = useState(false);
  const [slowBurnCountdown, setSlowBurnCountdown] = useState(30);
  const [moneyLost, setMoneyLost] = useState(0);
  const [panes, setPanes] = useState({
    chat: false,
    logs: false,
    map: false,
    deploy: false,
    burn: false
  });
  const [zIndices, setZIndices] = useState({
    chat: 100,
    logs: 101,
    map: 102,
    deploy: 103,
    burn: 104
  });
  const [maxZ, setMaxZ] = useState(110);
  const [activePane, setActivePane] = useState<keyof typeof panes | null>(null);

  const bringToFront = (pane: keyof typeof zIndices) => {
    const nextZ = maxZ + 1;
    setZIndices(prev => ({ ...prev, [pane]: nextZ }));
    setMaxZ(nextZ);
    setActivePane(pane);
  };

  const [totalSaved, setTotalSaved] = useState(() => {
    return parseInt(localStorage.getItem('saved_minutes') || '0');
  });

  const lastEscTime = useRef<number>(0);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if ('fonts' in document) {
      (document as any).fonts.load('1em "VT323"').then(() => {
        setTimeout(() => setIsAssetsLoaded(true), 500);
      });
    } else {
      window.onload = () => setIsAssetsLoaded(true);
      setTimeout(() => setIsAssetsLoaded(true), 2000);
    }
  }, []);

  useEffect(() => {
    if (!isAudioOn || severity === 'NOMINAL') return;
    const playRandomPing = () => {
        const pings = [playSlackPing, playTeamsPing];
        const ping = pings[Math.floor(Math.random() * pings.length)];
        ping();
    };
    const baseInterval = severity === 'P0' ? 8000 : 20000;
    const interval = setInterval(() => {
        if (Math.random() > 0.5) playRandomPing();
    }, baseInterval);
    return () => clearInterval(interval);
  }, [isAudioOn, severity]);

  const initAudio = () => {
    if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSlackPing = () => {
    initAudio();
    if (!audioCtx.current) return;
    const now = audioCtx.current.currentTime;
    const playPulse = (time: number, freq: number) => {
        const osc = audioCtx.current!.createOscillator();
        const gain = audioCtx.current!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain).connect(audioCtx.current!.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    };
    playPulse(now, 800);
    playPulse(now + 0.05, 600);
  };

  const playTeamsPing = () => {
    initAudio();
    if (!audioCtx.current) return;
    const now = audioCtx.current.currentTime;
    const notes = [659.25, 783.99, 880.00, 1046.50];
    notes.forEach((freq, i) => {
        const osc = audioCtx.current!.createOscillator();
        const gain = audioCtx.current!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (i * 0.08));
        gain.gain.setValueAtTime(0, now + (i * 0.08));
        gain.gain.linearRampToValueAtTime(0.05, now + (i * 0.08) + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.15);
        osc.connect(gain).connect(audioCtx.current!.destination);
        osc.start(now + (i * 0.08));
        osc.stop(now + (i * 0.08) + 0.15);
    });
  };

  useEffect(() => {
    if (severity === 'NOMINAL') return;
    const rates = { NOMINAL: 0, P3: 0.08, P1: 0.83, P0: 8.33 };
    const rate = rates[severity];
    const interval = setInterval(() => {
      setMoneyLost(prev => prev + rate);
    }, 1000);
    return () => clearInterval(interval);
  }, [severity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsBossMode(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isBossMode) {
            setIsBossMode(false);
            return;
        }

        // Identify visible panes
        const visiblePanes = (Object.keys(panes) as Array<keyof typeof panes>)
            .filter(key => panes[key]);

        if (visiblePanes.length > 0) {
            // Target the active pane first, or the foreground one if active is missing
            const paneToClose = (activePane && panes[activePane]) 
                ? activePane 
                : visiblePanes.reduce((prev, curr) => zIndices[curr] > zIndices[prev] ? curr : prev);

            setPanes(p => ({ ...p, [paneToClose]: false }));

            // Select next active pane among remaining
            const remaining = visiblePanes.filter(p => p !== paneToClose);
            if (remaining.length > 0) {
                const nextActive = remaining.reduce((prev, curr) => 
                    zIndices[curr] > zIndices[prev] ? curr : prev
                );
                bringToFront(nextActive);
            } else {
                setActivePane(null);
            }
            return;
        }

        // No panes open -> Reset severity to nominal
        if (severity !== 'NOMINAL') {
            setSeverity('NOMINAL');
            setIsSlowBurn(false);
            setExcuse('');
            setMoneyLost(0);
        }
        
        const now = Date.now();
        if (now - lastEscTime.current < 500) {
          handleEject();
        }
        lastEscTime.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, [severity, stack, isEjecting, panes, zIndices, activePane, isBossMode]);

  useEffect(() => {
    localStorage.setItem('saved_minutes', totalSaved.toString());
  }, [totalSaved]);

  useEffect(() => {
    let countdownInterval: any;
    let p1Timer: any;
    let p0Timer: any;
    if (isSlowBurn) {
      setSeverity('P3');
      setStatus('MINOR DEGRADATION');
      setSlowBurnCountdown(30);
      countdownInterval = setInterval(() => {
        setSlowBurnCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      p1Timer = setTimeout(() => {
        setSeverity('P1');
        setStatus('CRITICAL ALERT');
        if (isAudioOn) playAlert('P1');
      }, 10000); 
      p0Timer = setTimeout(() => {
        setSeverity('P0');
        setStatus('BREACH DETECTED');
        if (isAudioOn) playAlert('P0');
      }, 25000); 
      return () => {
        clearInterval(countdownInterval);
        clearTimeout(p1Timer);
        clearTimeout(p0Timer);
      };
    }
  }, [isSlowBurn]);

  useEffect(() => {
    if (isSlowBurn) return;
    if (severity === 'NOMINAL') setStatus('SYSTEMS NOMINAL');
    else if (severity === 'P3') setStatus('MINOR DEGRADATION');
    else if (severity === 'P1') setStatus('CRITICAL ALERT');
    else if (severity === 'P0') setStatus('BREACH DETECTED');
  }, [severity, isSlowBurn]);

  const handleEject = () => {
    if (isEjecting || severity === 'NOMINAL') return;
    setIsEjecting(true);
    setStatus('BREACH DETECTED');
    if (isAudioOn) playAlert(severity);
    const result = generateExcuse(severity, stack);
    setExcuse(result.text);
    setTicketId(result.ticketId);
    setTotalSaved(prev => prev + result.timeSaved);
    setDisplayText('');
    setIsSlowBurn(false);
    setTimeout(() => {
      setIsEjecting(false);
    }, 800);
  };

  const playAlert = (type: Severity) => {
    if (type === 'NOMINAL') return;
    initAudio();
    if (!audioCtx.current) return;
    const now = audioCtx.current.currentTime;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    if (type === 'P0') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
    } else if (type === 'P1') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }
    osc.connect(gain).connect(audioCtx.current.destination);
    osc.start();
    osc.stop(now + (type === 'P0' ? 1 : 0.2));
  };

  useEffect(() => {
    if (excuse && !isEjecting) {
      if (excuse === 'HELP_DISPLAYED') return; // Don't animate help
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(excuse.slice(0, i + 1));
        i++;
        if (i >= excuse.length) clearInterval(timer);
      }, 20);
      return () => clearInterval(timer);
    }
  }, [excuse, isEjecting]);

  const handleCommand = (cmd: string): boolean => {
    let valid = false;
    if (cmd === 'show chat') { setPanes(p => ({ ...p, chat: true })); bringToFront('chat'); valid = true; }
    if (cmd === 'hide chat') { setPanes(p => ({ ...p, chat: false })); valid = true; }
    if (cmd === 'show logs') { setPanes(p => ({ ...p, logs: true })); bringToFront('logs'); valid = true; }
    if (cmd === 'hide logs') { setPanes(p => ({ ...p, logs: false })); valid = true; }
    if (cmd === 'show map') { setPanes(p => ({ ...p, map: true })); bringToFront('map'); valid = true; }
    if (cmd === 'hide map') { setPanes(p => ({ ...p, map: false })); valid = true; }
    if (cmd === 'show deploy' || cmd === 'show k8s') { setPanes(p => ({ ...p, deploy: true })); bringToFront('deploy'); valid = true; }
    if (cmd === 'hide deploy' || cmd === 'hide k8s') { setPanes(p => ({ ...p, deploy: false })); valid = true; }
    if (cmd === 'show burn' || cmd === 'show cost') { setPanes(p => ({ ...p, burn: true })); bringToFront('burn'); valid = true; }
    if (cmd === 'hide burn' || cmd === 'hide cost') { setPanes(p => ({ ...p, burn: false })); valid = true; }
    if (cmd === 'hide all') { setPanes({ chat: false, logs: false, map: false, deploy: false, burn: false }); valid = true; }
    if (cmd === 'show all') { 
        setPanes({ chat: true, logs: true, map: true, deploy: true, burn: true }); 
        // Focus order
        bringToFront('chat');
        bringToFront('map');
        bringToFront('deploy');
        bringToFront('logs');
        bringToFront('burn');
        valid = true; 
    }
    if (cmd === 'nominal') { setSeverity('NOMINAL'); setIsSlowBurn(false); setExcuse(''); setMoneyLost(0); valid = true; }
    if (cmd === 'p3') { setSeverity('P3'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (cmd === 'p1') { setSeverity('P1'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (cmd === 'p0') { setSeverity('P0'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (cmd === 'aws') { setStack('AWS'); valid = true; }
    if (cmd === 'gcp') { setStack('GCP'); valid = true; }
    if (cmd === 'azure') { setStack('AZURE'); valid = true; }
    if (cmd === 'onprem' || cmd === 'on-prem') { setStack('ON-PREM'); valid = true; }
    if (cmd === 'serverless') { setStack('SERVERLESS'); valid = true; }
    if (cmd === 'abort' || cmd === 'eject') { handleEject(); valid = true; }
    if (cmd === 'audio on') { setIsAudioOn(true); valid = true; }
    if (cmd === 'audio off') { setIsAudioOn(false); valid = true; }
    if (cmd === 'slowburn on' || cmd === 'slow burn on') { setIsSlowBurn(true); valid = true; }
    if (cmd === 'slowburn off' || cmd === 'slow burn off') { setIsSlowBurn(false); valid = true; }
    if (cmd === 'boss') { setIsBossMode(true); valid = true; }
    if (cmd === 'ticket' && excuse) { setView('TICKET'); valid = true; }
    if (cmd === 'back') { setView('HOME'); valid = true; }
    if (cmd === 'copy' && excuse) {
        navigator.clipboard.writeText(excuse);
        setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<');
        setTimeout(() => setDisplayText(excuse), 1500);
        valid = true;
    }
    if (cmd === 'ping slack') { playSlackPing(); valid = true; }
    if (cmd === 'ping teams') { playTeamsPing(); valid = true; }
    if (cmd === 'help' || cmd === '/?' || cmd === '?') {
        const commands = [
            '--- SMOKESCREEN_COMMAND_MANIFEST ---',
            'PANES:  show/hide [chat|logs|map|deploy|all]',
            'THREAT: nominal, p3, p1, p0',
            'STACK:  aws, gcp, azure, onprem, serverless',
            'SYSTEM: audio [on|off], slowburn [on|off], boss',
            'ACTION: abort, copy, ticket, back, ping [slack|teams]',
            '--------------------------------------'
        ];
        setDisplayText(commands.join('\n'));
        setExcuse('HELP_DISPLAYED'); // Prevent typing animation from clearing it immediately
        valid = true;
    }
    return valid;
  };

  if (!isAssetsLoaded) {
    return <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000' }} />;
  }

  if (appState === 'SPLASH') {
    return (
      <div className="crt-container" style={{ textAlign: 'center' }}>
        <div className="scanline"></div>
        <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '4rem', opacity: 0.9, marginBottom: '10px' }}>DXW</h1>
            <h2 style={{ fontSize: '1.8rem', opacity: 0.8, color: 'var(--terminal-green)', marginBottom: '20px' }}>SMOKESCREEN OS v4.5</h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.6, maxWidth: '600px', margin: '0 auto', marginBottom: '10px' }}>
                "Software solutions that work for public services"
            </p>
            <div style={{ fontSize: '0.9rem', opacity: 0.4, marginBottom: '40px' }}>
                DXW AI HACKATHON 26/03/2026 | BUILT BY GEMINI CLI
            </div>
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', border: '1px solid var(--terminal-green)', padding: '20px', background: 'rgba(24, 255, 98, 0.05)' }}>
                <div style={{ marginBottom: '10px' }}>LOGON_IDENTIFICATION_REQUIRED</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>SRE_OPERATOR:</span>
                    <form onSubmit={(e) => { e.preventDefault(); if(operatorName) setAppState('BOOT'); }} style={{ flex: 1 }}>
                        <input autoFocus type="text" value={operatorName} onChange={(e) => setOperatorName(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--terminal-green)', color: 'inherit', fontFamily: 'inherit', fontSize: '1.2rem', outline: 'none', textTransform: 'uppercase' }} />
                    </form>
                </div>
                {operatorName && <div style={{ marginTop: '20px', textAlign: 'center', animation: 'flicker 0.5s infinite' }}>PRESS [ENTER] TO INITIALIZE UPLINK</div>}
            </div>
        </div>
      </div>
    );
  }

  if (appState === 'BOOT') {
    return <BootScreen operatorName={operatorName} onComplete={() => setAppState('READY')} />;
  }

  if (view === 'TICKET') {
    return (
      <div className="crt-container">
        <AccessDenied ticketId={ticketId} onBack={() => setView('HOME')} />
      </div>
    );
  }

  return (
    <>
      <BossMode active={isBossMode} />
      {panes.chat && <WarRoom severity={severity} stack={stack} zIndex={zIndices.chat} onFocus={() => bringToFront('chat')} isActive={activePane === 'chat'} />}
      {panes.map && <OutageMap severity={severity} zIndex={zIndices.map} onFocus={() => bringToFront('map')} isActive={activePane === 'map'} />}
      {panes.deploy && <DeploymentStatus severity={severity} zIndex={zIndices.deploy} onFocus={() => bringToFront('deploy')} isActive={activePane === 'deploy'} />}
      {panes.logs && <SystemLog severity={severity} zIndex={zIndices.logs} onFocus={() => bringToFront('logs')} isActive={activePane === 'logs'} />}
      {panes.burn && <BurnRateDashboard severity={severity} zIndex={zIndices.burn} onFocus={() => bringToFront('burn')} isActive={activePane === 'burn'} moneyLost={moneyLost} />}

      <div className={`crt-container ${isEjecting ? 'glitch' : ''}`}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <FakeLogs severity={severity} />
          <FakeCharts severity={severity} />
        </div>
        <div className="scanline"></div>
        <div className="terminal-content">
          <header className="vault-header">
            <div>
              <div style={{ fontSize: '1.2rem', marginBottom: '-5px', opacity: 0.8 }}>SMOKESCREEN OS v4.5</div>
              <h1 style={{ fontSize: '3.5rem', margin: '0', letterSpacing: '2px' }}>SMOKESCREEN</h1>
              <div style={{ fontSize: '0.9rem', opacity: 0.5, letterSpacing: '4px', marginTop: '-5px', color: 'var(--terminal-green)' }}>
                FAILURE IS NOT AN OPTION. IT IS A CORPORATE MANDATE.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: severity === 'P0' || isEjecting ? 'var(--terminal-red)' : severity === 'P1' ? 'var(--terminal-amber)' : 'var(--terminal-green)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                STATUS: {isEjecting ? '!!! WARNING !!!' : status}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.6 }}>
                LIFE RECLAIMED: {Math.floor(totalSaved / 60)}H {totalSaved % 60}M | OP: {operatorName || 'UNKNOWN'}
              </div>
            </div>
          </header>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="selector-group">
              <label style={{ fontSize: '1rem', display: 'block', marginBottom: '5px' }}>[ CLOUD_STACK_SELECT ]</label>
              <div className="severity-selector" style={{ marginBottom: '10px' }}>
                {(['AWS', 'GCP', 'AZURE', 'ON-PREM', 'SERVERLESS'] as Stack[]).map((s) => (
                  <button key={s} className={`severity-btn ${stack === s ? 'active' : ''}`} onClick={() => setStack(s)} style={{ padding: '5px 10px', fontSize: '1rem' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {severity !== 'NOMINAL' && (
                <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ESTIMATED_BURN_RATE</div>
                    <div style={{ fontSize: '2rem', color: 'var(--terminal-red)', fontWeight: 'bold' }}>
                        £{moneyLost.toFixed(2)}
                    </div>
                </div>
            )}
            <div className="selector-group">
              <label style={{ fontSize: '1rem', display: 'block', marginBottom: '5px' }}>[ THREAT_LEVEL ]</label>
              <div className="severity-selector" style={{ marginBottom: '10px' }}>
                {(['NOMINAL', 'P3', 'P1', 'P0'] as Severity[]).map((level) => (
                  <button key={level} className={`severity-btn ${level.toLowerCase()} ${severity === level ? 'active' : ''}`} onClick={() => { setSeverity(level); setIsSlowBurn(false); setExcuse(''); if(level==='NOMINAL') setMoneyLost(0); }} style={{ padding: '5px 15px', fontSize: '1rem' }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <CommandInput onCommand={handleCommand} />

          <div style={{ 
            position: 'fixed', 
            bottom: '40px', 
            left: '40px', 
            display: 'flex', 
            gap: '15px', 
            zIndex: 1000 
          }}>
            <button onClick={() => { 
                const newState = !panes.chat;
                setPanes(p => ({ ...p, chat: newState })); 
                if (newState) bringToFront('chat');
            }} className={`severity-btn ${panes.chat ? 'active' : ''}`} style={{ fontSize: '1rem', background: 'rgba(13, 17, 13, 0.8)' }}>
                {panes.chat ? '[ HIDE_CHAT ]' : '[ SHOW_CHAT ]'}
            </button>
            <button onClick={() => { 
                const newState = !panes.logs;
                setPanes(p => ({ ...p, logs: newState })); 
                if (newState) bringToFront('logs');
            }} className={`severity-btn ${panes.logs ? 'active' : ''}`} style={{ fontSize: '1rem', background: 'rgba(13, 17, 13, 0.8)' }}>
                {panes.logs ? '[ HIDE_LOGS ]' : '[ SHOW_LOGS ]'}
            </button>
            <button onClick={() => { 
                const newState = !panes.deploy;
                setPanes(p => ({ ...p, deploy: newState })); 
                if (newState) bringToFront('deploy');
            }} className={`severity-btn ${panes.deploy ? 'active' : ''}`} style={{ fontSize: '1rem', background: 'rgba(13, 17, 13, 0.8)' }}>
                {panes.deploy ? '[ HIDE_DEPLOY ]' : '[ SHOW_DEPLOY ]'}
            </button>
            <button onClick={() => { 
                const newState = !panes.burn;
                setPanes(p => ({ ...p, burn: newState })); 
                if (newState) bringToFront('burn');
            }} className={`severity-btn ${panes.burn ? 'active' : ''}`} style={{ fontSize: '1rem', background: 'rgba(13, 17, 13, 0.8)' }}>
                {panes.burn ? '[ HIDE_BURN ]' : '[ SHOW_BURN ]'}
            </button>
            <button onClick={() => { 
                const newState = !panes.map;
                setPanes(p => ({ ...p, map: newState })); 
                if (newState) bringToFront('map');
            }} className={`severity-btn ${panes.map ? 'active' : ''}`} style={{ fontSize: '1rem', background: 'rgba(13, 17, 13, 0.8)' }}>
                {panes.map ? '[ HIDE_MAP ]' : '[ SHOW_MAP ]'}
            </button>
          </div>

          <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
            <button className="eject-button" onClick={handleEject} disabled={isEjecting || severity === 'NOMINAL'} style={{ padding: '20px 50px', fontSize: '2.5rem', whiteSpace: 'nowrap', opacity: severity === 'NOMINAL' ? 0.3 : 1, cursor: severity === 'NOMINAL' ? 'not-allowed' : 'pointer', margin: 0, background: 'rgba(13, 17, 13, 0.9)' }}>
              {isEjecting ? 'SIGNALING_INCIDENT...' : 'INITIATE_EMERGENCY_EXTRACTION'}
            </button>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setIsSlowBurn(!isSlowBurn)} className={`severity-btn ${isSlowBurn ? 'active p1' : ''}`} style={{ padding: '10px 20px', fontSize: '1rem', width: '180px', background: 'rgba(13, 17, 13, 0.8)' }}>
                SLOW BURN: {isSlowBurn ? `${slowBurnCountdown}s` : 'OFF'}
                </button>
                <button onClick={() => setIsAudioOn(!isAudioOn)} className="severity-btn" style={{ padding: '10px 20px', fontSize: '1rem', width: '120px', background: 'rgba(13, 17, 13, 0.8)' }}>
                AUDIO: {isAudioOn ? 'ON' : 'OFF'}
                </button>
            </div>
          </div>

          {excuse && (
            <div className="excuse-text" style={{ padding: '20px', minHeight: '120px', marginTop: '10px' }}>
              <div style={{ marginBottom: '10px', color: severity === 'P0' ? 'var(--terminal-red)' : 'var(--terminal-amber)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {isEjecting ? '>>> SCANNING FOR FAILURE...' : `> INCIDENT_LOG [${stack}]:`}
              </div>
              <div style={{ lineHeight: '1.2', fontSize: '1.8rem', whiteSpace: 'pre-wrap' }}>{displayText}</div>
              {!isEjecting && displayText === excuse && (
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                  <button onClick={() => { navigator.clipboard.writeText(excuse); setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<'); setTimeout(() => setDisplayText(excuse), 1500); }} className="severity-btn active" style={{ fontSize: '1.2rem', padding: '5px 20px' }}>[ COPY_FOR_COMMMS ]</button>
                  <button onClick={() => setView('TICKET')} className="severity-btn" style={{ fontSize: '1.2rem', padding: '5px 20px' }}>[ VIEW_TICKET ]</button>
                </div>
              )}
            </div>
          )}
          <footer style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.4, textAlign: 'center', borderTop: '2px solid rgba(24, 255, 98, 0.2)', paddingTop: '15px' }}>
            DXW | SECURE TERMINAL | BOSS: [CMD+B] | ABORT: [CMD+ENTER] | <a href="https://github.com/DrizzlyOwl/smokescreen" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>COPYRIGHT DRIZZLYOWL</a>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
