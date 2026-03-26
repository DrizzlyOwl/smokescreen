import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { PagerSync } from './components/PagerSync';
import { MobilePager } from './components/MobilePager';
import { HowToPane } from './components/HowToPane';
import { Button } from './components/Button';

function App() {
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [appState, setAppState] = useState<'SPLASH' | 'BOOT' | 'READY' | 'MOBILE_PAGER'>('SPLASH');
  const [operatorName, setInternalOperatorName] = useState('');
  const [excuse, setExcuse] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [severity, setSeverity] = useState<Severity>('NOMINAL');
  const [stack, setStack] = useState<Stack>('AWS');
  const [isEjecting, setIsEjecting] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [status, setStatus] = useState('SYSTEMS NOMINAL');
  const [view, setView] = useState<'HOME' | 'TICKET'>('HOME');
  const [isBossMode, setIsBossMode] = useState(false);
  const [isSlowBurn, setIsSlowBurn] = useState(false);
  const [slowBurnCountdown, setSlowBurnCountdown] = useState(30);
  const [moneyLost, setMoneyLost] = useState(0);
  const [currentEggIndex, setCurrentEggIndex] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  
  const easterEggs = useMemo(() => [
    'SEARCHING FOR RED OCTOBER... [NOT FOUND]',
    'DECRYPTING ENIGMA STREAM... [SUCCESS]',
    'LOCATING FLUX CAPACITOR... [OFFLINE]',
    'DIVIDING BY ZERO... [ERROR_PROTECTED]',
    'OPTIMIZING VIBES... [MAXIMAL]',
    'RETICULATING SPLINES...',
    'COMPILING CLOUD-NATIVE COFFEE... [DONE]',
    'BYPASSING THE MAINFRAME FIREWALL... [OK]',
    'INITIALIZING SKOBO-CHIP... [STABLE]',
    'RECALIBRATING PARSECS... [DONE]'
  ], []);

  // Typewriter effect for footer eggs
  useEffect(() => {
    if (appState !== 'READY') return;
    
    let isMounted = true;
    let currentIdx = currentEggIndex;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: number;

    const type = () => {
        const fullText = easterEggs[currentIdx];
        let typingSpeed = isDeleting ? 50 : 100;
        
        if (isDeleting) {
            setFooterText(fullText.substring(0, charIdx - 1));
            charIdx--;
        } else {
            setFooterText(fullText.substring(0, charIdx + 1));
            charIdx++;
        }

        if (!isDeleting && charIdx === fullText.length) {
            isDeleting = true;
            typingSpeed = 3000; // Pause at end
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            currentIdx = (currentIdx + 1) % easterEggs.length;
            setCurrentEggIndex(currentIdx);
            typingSpeed = 500; // Pause before next
        }

        if (isMounted) {
            timeoutId = window.setTimeout(type, typingSpeed);
        }
    };

    const initialTimeout = window.setTimeout(type, 1000);
    return () => {
        isMounted = false;
        window.clearTimeout(initialTimeout);
        window.clearTimeout(timeoutId);
    };
  }, [appState, easterEggs, currentEggIndex]);

  const [panes, setPanes] = useState({
    chat: false,
    logs: false,
    map: false,
    deploy: false,
    burn: false,
    pager: false,
    howTo: false
  });

  // Auto-open HowTo for first-time users
  useEffect(() => {
    const hasSeenHowTo = localStorage.getItem('smokescreen_seen_howto');
    if (!hasSeenHowTo && appState === 'READY') {
        setPanes(p => ({ ...p, howTo: true }));
        // bringToFront('howTo') cannot be used here because it's defined later
        // and we are in an effect. We'll just set activePane.
        setActivePane('howTo');
        localStorage.setItem('smokescreen_seen_howto', 'true');
    }
  }, [appState]);

  const [zIndices, setZIndices] = useState({
    chat: 100,
    logs: 101,
    map: 102,
    deploy: 103,
    burn: 104,
    pager: 105,
    howTo: 106
  });
  const [activePane, setActivePane] = useState<keyof typeof panes | null>(null);
  const [uplinkId] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
const bringToFront = useCallback((pane: keyof typeof panes) => {
  setZIndices(prev => {
      const currentMax = Math.max(...Object.values(prev));
      const nextZ = currentMax + 1;
      return { ...prev, [pane]: nextZ };
  });
  setActivePane(pane);
  if (pane === 'chat') setUnreadChat(0);
}, []);

  const [totalSaved, setTotalSaved] = useState(() => {
    return parseInt(localStorage.getItem('saved_minutes') || '0');
  });

  const lastEscTime = useRef<number>(0);
  const audioCtx = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx.current = new AudioContextClass();
    } else if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
    }
  }, []);

  const playSlackPing = useCallback(() => {
    if (!isAudioOn) return;
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
  }, [initAudio, isAudioOn]);

  const playTagPing = useCallback(() => {
    if (!isAudioOn) return;
    initAudio();
    if (!audioCtx.current) return;
    const now = audioCtx.current.currentTime;
    const playPulse = (time: number, freq: number) => {
        const osc = audioCtx.current!.createOscillator();
        const gain = audioCtx.current!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain).connect(audioCtx.current!.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    };
    // Higher pitched double-beep
    playPulse(now, 1200);
    playPulse(now + 0.08, 1200);
  }, [initAudio, isAudioOn]);

  const playTeamsPing = useCallback(() => {
    if (!isAudioOn) return;
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
  }, [initAudio, isAudioOn]);

  const playAlert = useCallback((type: Severity) => {
    if (type === 'NOMINAL' || !isAudioOn) return;
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
  }, [initAudio, isAudioOn]);

  const handleEject = useCallback(() => {
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
    window.setTimeout(() => {
      setIsEjecting(false);
    }, 800);
  }, [isEjecting, severity, isAudioOn, stack, playAlert]);

  // Broadcast state changes for the "Room Concept"
  useEffect(() => {
    const channel = new BroadcastChannel(`smokescreen_room_${uplinkId}`);
    channel.postMessage({ type: 'STATE_UPDATE', severity, stack });
    return () => channel.close();
  }, [severity, stack, uplinkId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('pager')) {
        setAppState('MOBILE_PAGER');
    }

    if ('fonts' in document) {
      (document as unknown as { fonts: { load: (f: string) => Promise<void> } }).fonts.load('1em "VT323"').then(() => {
        setTimeout(() => setIsAssetsLoaded(true), 500);
      });
    } else {
      setIsAssetsLoaded(true);
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
  }, [isAudioOn, severity, playSlackPing, playTeamsPing]);

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

        const visiblePanes = (Object.keys(panes) as Array<keyof typeof panes>)
            .filter(key => panes[key]);

        if (visiblePanes.length > 0) {
            const paneToClose = (activePane && panes[activePane]) 
                ? activePane 
                : visiblePanes.reduce((prev, curr) => zIndices[curr] > zIndices[prev] ? curr : prev);

            setPanes(p => ({ ...p, [paneToClose]: false }));

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
    }, [severity, stack, isEjecting, panes, zIndices, activePane, isBossMode, handleEject, bringToFront]);

  useEffect(() => {
    localStorage.setItem('saved_minutes', totalSaved.toString());
  }, [totalSaved]);

  useEffect(() => {
    let countdownInterval: number | undefined;
    let p1Timer: number | undefined;
    let p0Timer: number | undefined;
    if (isSlowBurn) {
      setSeverity('P3');
      setStatus('MINOR DEGRADATION');
      setSlowBurnCountdown(30);
      countdownInterval = window.setInterval(() => {
        setSlowBurnCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      p1Timer = window.setTimeout(() => {
        setSeverity('P1');
        setStatus('CRITICAL ALERT');
        if (isAudioOn) playAlert('P1');
      }, 10000); 
      p0Timer = window.setTimeout(() => {
        setSeverity('P0');
        setStatus('BREACH DETECTED');
        if (isAudioOn) playAlert('P0');
      }, 25000); 
      return () => {
        window.clearInterval(countdownInterval);
        window.clearTimeout(p1Timer);
        window.clearTimeout(p0Timer);
      };
    }
  }, [isSlowBurn, isAudioOn, playAlert]);

  useEffect(() => {
    if (isSlowBurn) return;
    if (severity === 'NOMINAL') setStatus('SYSTEMS NOMINAL');
    else if (severity === 'P3') setStatus('MINOR DEGRADATION');
    else if (severity === 'P1') setStatus('CRITICAL ALERT');
    else if (severity === 'P0') setStatus('BREACH DETECTED');
  }, [severity, isSlowBurn]);

  useEffect(() => {
    if (excuse && !isEjecting) {
      if (excuse === 'HELP_DISPLAYED') return;
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(excuse.slice(0, i + 1));
        i++;
        if (i >= excuse.length) clearInterval(timer);
      }, 20);
      return () => clearInterval(timer);
    }
  }, [excuse, isEjecting]);

  const handleNewChatMessage = useCallback(() => {
    if (!panes.chat || activePane !== 'chat') {
      setUnreadChat(prev => prev + 1);
    }
  }, [panes.chat, activePane]);

  const handleCommand = (cmd: string): boolean => {
    let valid = false;
    const c = cmd.toLowerCase();
    if (c === 'show chat') { setPanes(p => ({ ...p, chat: true })); bringToFront('chat'); valid = true; }
    if (c === 'hide chat') { setPanes(p => ({ ...p, chat: false })); valid = true; }
    if (c === 'show logs') { setPanes(p => ({ ...p, logs: true })); bringToFront('logs'); valid = true; }
    if (c === 'hide logs') { setPanes(p => ({ ...p, logs: false })); valid = true; }
    if (c === 'show map') { setPanes(p => ({ ...p, map: true })); bringToFront('map'); valid = true; }
    if (c === 'hide map') { setPanes(p => ({ ...p, map: false })); valid = true; }
    if (c === 'show deploy' || c === 'show k8s') { setPanes(p => ({ ...p, deploy: true })); bringToFront('deploy'); valid = true; }
    if (c === 'hide deploy' || c === 'hide k8s') { setPanes(p => ({ ...p, deploy: false })); valid = true; }
    if (c === 'show burn' || c === 'show cost') { setPanes(p => ({ ...p, burn: true })); bringToFront('burn'); valid = true; }
    if (c === 'hide burn' || c === 'hide cost') { setPanes(p => ({ ...p, burn: false })); valid = true; }
    if (c === 'show pager' || c === 'sync pager') { setPanes(p => ({ ...p, pager: true })); bringToFront('pager'); valid = true; }
    if (c === 'hide pager') { setPanes(p => ({ ...p, pager: false })); valid = true; }
    if (c === 'show howto' || c === 'how to' || c === 'howto') { setPanes(p => ({ ...p, howTo: true })); bringToFront('howTo'); valid = true; }
    if (c === 'hide howto') { setPanes(p => ({ ...p, howTo: false })); valid = true; }
    if (c === 'hide all') { setPanes({ chat: false, logs: false, map: false, deploy: false, burn: false, pager: false, howTo: false }); valid = true; }
    if (c === 'show all') { 
        setPanes({ chat: true, logs: true, map: true, deploy: true, burn: true, pager: true, howTo: true }); 
        bringToFront('chat');
        bringToFront('map');
        bringToFront('deploy');
        bringToFront('logs');
        bringToFront('burn');
        bringToFront('pager');
        bringToFront('howTo');
        valid = true; 
    }
    if (c === 'nominal') { setSeverity('NOMINAL'); setIsSlowBurn(false); setExcuse(''); setMoneyLost(0); valid = true; }
    if (c === 'p3') { setSeverity('P3'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (c === 'p1') { setSeverity('P1'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (c === 'p0') { setSeverity('P0'); setIsSlowBurn(false); setExcuse(''); valid = true; }
    if (c === 'aws') { setStack('AWS'); valid = true; }
    if (c === 'gcp') { setStack('GCP'); valid = true; }
    if (c === 'azure') { setStack('AZURE'); valid = true; }
    if (c === 'onprem') { setStack('ON-PREM'); valid = true; }
    if (c === 'serverless') { setStack('SERVERLESS'); valid = true; }
    if (c === 'audio on') { initAudio(); setIsAudioOn(true); valid = true; }
    if (c === 'audio off') { setIsAudioOn(false); valid = true; }
    if (c === 'slowburn on') { setIsSlowBurn(true); valid = true; }
    if (c === 'slowburn off') { setIsSlowBurn(false); valid = true; }
    if (c === 'boss') { setIsBossMode(true); valid = true; }
    if (c === 'abort') { handleEject(); valid = true; }
    if (c === 'copy') { navigator.clipboard.writeText(excuse); valid = true; }
    if (c === 'ticket') { setView('TICKET'); valid = true; }
    if (c === 'back') { setView('HOME'); valid = true; }
    if (c === 'ping slack') { playSlackPing(); valid = true; }
    if (c === 'ping teams') { playTeamsPing(); valid = true; }
    if (c === 'help' || c === '/?' || c === '?') {
        const commands = [
            '--- SMOKESCREEN_COMMAND_MANIFEST ---',
            'PANES:  show/hide [chat|logs|map|deploy|burn|pager|howto|all]',
            'THREAT: nominal, p3, p1, p0',
            'STACK:  aws, gcp, azure, onprem, serverless',
            'SYSTEM: audio [on|off], slowburn [on|off], boss, howto',
            'ACTION: abort, copy, ticket, back, ping [slack|teams]',
            '--------------------------------------'
        ];
        setDisplayText(commands.join('\n'));
        setExcuse('HELP_DISPLAYED');
        valid = true;
    }

    if (!valid && cmd.trim().length > 0) {
        const errorMsg = `COMMAND_NOT_RECOGNIZED: "${cmd.toUpperCase()}"\nINPUT "HELP" FOR COMMAND_MANIFEST.`;
        setExcuse(errorMsg);
    }

    return valid;
  };

  if (!isAssetsLoaded) {
    return <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000' }} />;
  }

  if (appState === 'MOBILE_PAGER') {
    const params = new URLSearchParams(window.location.search);
    return (
        <MobilePager 
            uplinkId={params.get('pager') || 'UNKNOWN'} 
            initialSeverity={(params.get('sev') as Severity) || 'NOMINAL'}
            initialStack={(params.get('stack') as Stack) || 'AWS'}
        />
    );
  }

  if (appState === 'SPLASH') {
    return (
      <div className="crt-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 }}>
          <FakeLogs severity="NOMINAL" />
        </div>
        
        <div style={{ 
            zIndex: 1,
            textAlign: 'center', 
            padding: '60px', 
            border: '2px solid var(--terminal-green)', 
            background: 'rgba(13, 17, 13, 0.95)',
            boxShadow: '0 0 30px rgba(24, 255, 98, 0.15)',
            maxWidth: '600px',
            width: '90%'
        }}>
          <div style={{ fontSize: 'var(--text-l3)', opacity: 0.6, marginBottom: '5px', fontWeight: 'bold' }}>DXW SECURE GATEWAY v4.5</div>
          <h1 style={{ fontSize: 'var(--text-l1)', margin: '0 0 10px 0', letterSpacing: '4px' }}>SMOKESCREEN</h1>
          <div style={{ fontSize: 'var(--text-l4)', opacity: 0.5, letterSpacing: '2px', marginBottom: '40px' }}>
            TACTICAL_COVER_GENERATOR
          </div>

          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: 'var(--text-l3)', color: 'var(--terminal-green)', fontWeight: 'bold' }}>
              {'>'} IDENTIFY_OPERATOR:
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '15px', color: 'var(--terminal-green)', fontSize: 'var(--text-l3)' }}>_</span>
                <input 
                    autoFocus
                    type="text" 
                    value={operatorName}
                    placeholder="NAME_REQUIRED"
                    onChange={(e) => setInternalOperatorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && operatorName.trim() && setAppState('BOOT')}
                    style={{ 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        border: '1px solid var(--terminal-green)', 
                        color: 'var(--terminal-green)', 
                        fontSize: 'var(--text-l3)', 
                        padding: '15px 15px 15px 35px',
                        outline: 'none', 
                        width: '100%',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                    }}
                />
            </div>
          </div>

          <Button 
            onClick={() => operatorName.trim() && setAppState('BOOT')} 
            disabled={!operatorName.trim()} 
            variant="primary"
            style={{ fontSize: 'var(--text-l2)', width: '100%' }}
          >
            INITIATE_SYSTEM_BOOT
          </Button>

          <div style={{ marginTop: '30px', opacity: 0.3, fontSize: 'var(--text-l4)', textAlign: 'center' }}>
            UNAUTHORIZED ACCESS IS PROHIBITED<br/>
            (C) 1984 DXW SRE DIVISION
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'BOOT') {
    return <BootScreen operatorName={operatorName} uplinkId={uplinkId} onComplete={() => { setAppState('READY'); }} />;
  }

  if (view === 'TICKET') {
    return (
      <div className="crt-container">
        <AccessDenied 
          ticketId={ticketId} 
          onBack={() => setView('HOME')} 
        />
      </div>
    );
  }

  return (
    <>
      <BossMode active={isBossMode} />
      {panes.chat && <WarRoom severity={severity} stack={stack} zIndex={zIndices.chat} onFocus={() => bringToFront('chat')} isActive={activePane === 'chat'} uplinkId={uplinkId} onClose={() => setPanes(p => ({ ...p, chat: false }))} playPing={playSlackPing} playTagPing={playTagPing} onNewMessage={handleNewChatMessage} operatorName={operatorName} />}
      {panes.map && <OutageMap severity={severity} zIndex={zIndices.map} onFocus={() => bringToFront('map')} isActive={activePane === 'map'} onClose={() => setPanes(p => ({ ...p, map: false }))} />}
      {panes.deploy && <DeploymentStatus severity={severity} zIndex={zIndices.deploy} onFocus={() => bringToFront('deploy')} isActive={activePane === 'deploy'} onClose={() => setPanes(p => ({ ...p, deploy: false }))} />}
      {panes.logs && <SystemLog severity={severity} zIndex={zIndices.logs} onFocus={() => bringToFront('logs')} isActive={activePane === 'logs'} uplinkId={uplinkId} onClose={() => setPanes(p => ({ ...p, logs: false }))} />}
      {panes.burn && <BurnRateDashboard severity={severity} zIndex={zIndices.burn} onFocus={() => bringToFront('burn')} isActive={activePane === 'burn'} moneyLost={moneyLost} onClose={() => setPanes(p => ({ ...p, burn: false }))} />}
      {panes.pager && <PagerSync severity={severity} stack={stack} zIndex={zIndices.pager} onFocus={() => bringToFront('pager')} isActive={activePane === 'pager'} uplinkId={uplinkId} onClose={() => setPanes(p => ({ ...p, pager: false }))} />}
      {panes.howTo && <HowToPane zIndex={zIndices.howTo} onFocus={() => bringToFront('howTo')} isActive={activePane === 'howTo'} onClose={() => setPanes(p => ({ ...p, howTo: false }))} />}

      <div className={`crt-container ${isEjecting ? 'glitch' : ''}`}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <FakeLogs severity={severity} />
          <FakeCharts severity={severity} />
        </div>

        <div className="terminal-content">
          <header className="vault-header">
            <div>
              <div style={{ fontSize: 'var(--text-l3)', marginBottom: '-5px', opacity: 0.8, fontWeight: 'bold' }}>DXW SMOKESCREEN OS v4.5</div>
              <h1 style={{ fontSize: 'var(--text-l1)', margin: '0', letterSpacing: '2px' }}>SMOKESCREEN</h1>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.5, letterSpacing: '4px', marginTop: '-5px', color: 'var(--terminal-green)' }}>
                FAILURE IS NOT AN OPTION. IT IS A CORPORATE MANDATE.
              </div>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.4, marginTop: '5px' }}>AUTHOR: ASH DAVIES (DRIZZLYOWL)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: severity === 'P0' || isEjecting ? 'var(--terminal-red)' : severity === 'P1' ? 'var(--terminal-amber)' : 'var(--terminal-green)', fontWeight: 'bold', fontSize: 'var(--text-l2)' }}>
                STATUS: {isEjecting ? '!!! WARNING !!!' : status}
              </div>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.6 }}>
                LIFE RECLAIMED: {Math.floor(totalSaved / 60)}H {totalSaved % 60}M
              </div>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.6 }}>
                OP: {operatorName || 'UNKNOWN'} | UPLINK: <a href={`https://drizzlyowl.github.io/smokescreen/?pager=${uplinkId}&sev=${severity}&stack=${stack}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>{uplinkId}</a>
              </div>
            </div>
          </header>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: 'var(--text-l3)', display: 'block', marginBottom: '8px', opacity: 0.8, fontWeight: 'bold' }}>[ ACTIONS ]</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Button onClick={() => { 
                    const newState = !panes.chat;
                    setPanes(p => ({ ...p, chat: newState })); 
                    if (newState) bringToFront('chat');
                }} active={panes.chat}>
                    CHAT {unreadChat > 0 ? `(${unreadChat})` : ''}
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.logs;
                    setPanes(p => ({ ...p, logs: newState })); 
                    if (newState) bringToFront('logs');
                }} active={panes.logs}>
                    LOGS
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.deploy;
                    setPanes(p => ({ ...p, deploy: newState })); 
                    if (newState) bringToFront('deploy');
                }} active={panes.deploy}>
                    DEPLOY
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.burn;
                    setPanes(p => ({ ...p, burn: newState })); 
                    if (newState) bringToFront('burn');
                }} active={panes.burn}>
                    BURN
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.pager;
                    setPanes(p => ({ ...p, pager: newState })); 
                    if (newState) bringToFront('pager');
                }} active={panes.pager}>
                    PAGER
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.map;
                    setPanes(p => ({ ...p, map: newState })); 
                    if (newState) bringToFront('map');
                }} active={panes.map}>
                    MAP
                </Button>
                <Button onClick={() => { 
                    const newState = !panes.howTo;
                    setPanes(p => ({ ...p, howTo: newState })); 
                    if (newState) bringToFront('howTo');
                }} active={panes.howTo}>
                    HOW_TO
                </Button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="selector-group">
              <label style={{ fontSize: 'var(--text-l3)', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>[ CLOUD_STACK_SELECT ]</label>
              <div className="severity-selector" style={{ marginBottom: '10px' }}>
                {(['AWS', 'GCP', 'AZURE', 'ON-PREM', 'SERVERLESS'] as Stack[]).map((s) => (
                  <Button 
                    key={s} 
                    active={stack === s} 
                    onClick={() => setStack(s)} 
                    size="sm"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            {severity !== 'NOMINAL' && (
                <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                    <div style={{ fontSize: 'var(--text-l4)', opacity: 0.6, fontWeight: 'bold' }}>ESTIMATED_BURN_RATE</div>
                    <div style={{ fontSize: 'var(--text-l2)', color: 'var(--terminal-red)', fontWeight: 'bold' }}>
                        £{moneyLost.toFixed(2)}
                    </div>
                </div>
            )}
            <div className="selector-group">
              <label style={{ fontSize: 'var(--text-l3)', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>[ THREAT_LEVEL ]</label>
              <div className="severity-selector" style={{ marginBottom: '10px' }}>
                {(['NOMINAL', 'P3', 'P1', 'P0'] as Severity[]).map((level) => (
                  <Button 
                    key={level} 
                    variant={level === 'P0' ? 'danger' : 'terminal'}
                    active={severity === level} 
                    onClick={() => { setSeverity(level); setIsSlowBurn(false); setExcuse(''); if(level==='NOMINAL') setMoneyLost(0); }} 
                    size="sm"
                    style={{ padding: '5px 15px' }}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <CommandInput onCommand={handleCommand} />

          <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
            <Button 
                variant="primary" 
                onClick={handleEject} 
                disabled={isEjecting || severity === 'NOMINAL'}
                style={{ fontSize: 'var(--text-l3)' }}
            >
              {isEjecting ? 'SIGNALING_INCIDENT...' : 'INITIATE_EMERGENCY_EXTRACTION'}
            </Button>
            <div style={{ display: 'flex', gap: '15px' }}>
                <Button 
                    onClick={() => setIsSlowBurn(!isSlowBurn)} 
                    active={isSlowBurn} 
                    style={{ width: '180px' }}
                >
                    SLOW BURN: {isSlowBurn ? `${slowBurnCountdown}s` : 'OFF'}
                </Button>
                <Button 
                    onClick={() => { initAudio(); setIsAudioOn(!isAudioOn); }} 
                    active={isAudioOn}
                    style={{ width: '120px' }}
                >
                    AUDIO: {isAudioOn ? 'ON' : 'OFF'}
                </Button>
            </div>
          </div>

          {excuse && (
            <div className="excuse-text" style={{ padding: '20px', minHeight: '120px', marginTop: '10px' }}>
              <div style={{ color: 'var(--terminal-amber)', marginBottom: '10px', fontSize: 'var(--text-l3)', fontWeight: 'bold' }}>
                {isEjecting ? '>>> SCANNING FOR FAILURE...' : `> INCIDENT_LOG [${stack}]:`}
              </div>
              <div style={{ lineHeight: '1.4', fontSize: 'var(--text-l3)', whiteSpace: 'pre-wrap' }}>{displayText}</div>
              {!isEjecting && displayText === excuse && excuse !== 'HELP_DISPLAYED' && !excuse.startsWith('COMMAND_NOT_RECOGNIZED') && (
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                  <Button onClick={() => { navigator.clipboard.writeText(excuse); setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<'); setTimeout(() => setDisplayText(excuse), 1500); }} active>
                    [ COPY_FOR_COMMMS ]
                  </Button>
                  <Button onClick={() => setView('TICKET')}>
                    [ VIEW_TICKET ]
                  </Button>
                </div>
              )}
            </div>
          )}
          <footer style={{ marginTop: '30px', borderTop: '2px solid rgba(24, 255, 98, 0.2)', paddingTop: '15px', textAlign: 'center' }}>
            <div style={{ 
                fontSize: 'var(--text-l4)', 
                opacity: 0.4, 
                letterSpacing: '2px',
                minHeight: '1.2em',
                marginBottom: '10px'
            }}>
                {footerText}<span style={{ borderLeft: '8px solid currentColor', marginLeft: '4px', animation: 'flicker 0.5s infinite' }}></span>
            </div>
            <div style={{ fontSize: 'var(--text-l4)', opacity: 0.4 }}>
                <a href="https://github.com/DrizzlyOwl/smokescreen" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>COPYRIGHT DRIZZLYOWL</a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
