import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import './styles/terminal.scss';
import { type Severity, type Stack } from './data/excuses';
import { FakeLogs } from './components/FakeLogs';
import { AccessDenied } from './components/AccessDenied';
import { BossMode } from './components/BossMode';
import { BootScreen } from './components/BootScreen';
import { CommandInput } from './components/CommandInput';
import { MobilePager } from './components/MobilePager';
import { Button } from './components/Button';
import { ShutdownScreen } from './components/ShutdownScreen';
import { ActivityIcon } from './components/Icons';
import { AudioToggle } from './components/AudioToggle';
import { Footer } from './components/Footer';
import { ActionGroup } from './components/ActionGroup';
import { ReadoutBox } from './components/ReadoutBox';
import { StatReadout } from './components/StatReadout';


import { useWindowManager, type PaneId, type PanesState } from './hooks/useWindowManager';
import { useCommandRegistry, type Command } from './hooks/useCommandRegistry';
import { useUrlSync } from './hooks/useUrlSync';
import { useIncidentChat } from './hooks/useIncidentChat';
import { useClientStats } from './hooks/useClientStats';
import { useIncident } from './hooks/useIncident';
import { useTerminal } from './hooks/useTerminal';
import { useAudio } from './hooks/useAudio';

// Lazy loaded panes
const WarRoom = lazy(() => import('./components/WarRoom').then(m => ({ default: m.WarRoom })));
const OutageMap = lazy(() => import('./components/OutageMap').then(m => ({ default: m.OutageMap })));
const DeploymentStatus = lazy(() => import('./components/DeploymentStatus').then(m => ({ default: m.DeploymentStatus })));
const SystemLog = lazy(() => import('./components/SystemLog').then(m => ({ default: m.SystemLog })));
const BurnRateDashboard = lazy(() => import('./components/BurnRateDashboard').then(m => ({ default: m.BurnRateDashboard })));
const PagerSync = lazy(() => import('./components/PagerSync').then(m => ({ default: m.PagerSync })));
const HowToPane = lazy(() => import('./components/HowToPane').then(m => ({ default: m.HowToPane })));
const SettingsPane = lazy(() => import('./components/SettingsPane').then(m => ({ default: m.SettingsPane })));
const LatencyPane = lazy(() => import('./components/LatencyPane').then(m => ({ default: m.LatencyPane })));
const DebugConsole = lazy(() => import('./components/DebugConsole').then(m => ({ default: m.DebugConsole })));

import { useDebugLogger } from './hooks/useDebugLogger';

function App() {
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [view, setView] = useState<'HOME' | 'TICKET'>('HOME');
  const [isBossMode, setIsBossMode] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tempJoinId, setTempJoinId] = useState('');

  const { 
    appState, setAppState, 
    operatorName, setOperatorName,
    theme, setTheme,
    uplinkId
  } = useTerminal();

  const {
    severity,
    stack,
    incidentReport,
    ticketId,
    status,
    moneyLost,
    isSlowBurn,
    slowBurnCountdown,
    totalSaved,
    setSeverity,
    setStack,
    setIncidentReport,
    setIsSlowBurn,
    declareIncident: baseDeclareIncident,
    ceaseTheatre
  } = useIncident();


  const {
    setIsAudioOn, initAudio,
    playSlackPing, playTagPing, playAlert,
    playLoginChime, playLogoutChime, playPostBeep, stopAllSounds
  } = useAudio();

  const { 
    panes, zIndices, activePane, 
    openPane, closePane, togglePane, 
    bringToFront: baseBringToFront, 
    closeAll, openAll, setPanes 
  } = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, pager: false, howTo: false, settings: false, metrics: false, debug: false
  });

  const { isDebugMode } = useTerminal();
  const { log } = useDebugLogger();

  const clientStats = useClientStats();

  const bringToFront = useCallback((paneId: PaneId) => {
    baseBringToFront(paneId);
    if (paneId === 'chat') setUnreadChat(0);
  }, [baseBringToFront]);

  const handleNewChatMessage = useCallback((isTag: boolean) => {
    if (isTag && panes.chat) {
      bringToFront('chat');
    } else if (isTag || !panes.chat || activePane !== 'chat') {
      setUnreadChat(prev => prev + 1);
    }
  }, [panes.chat, activePane, bringToFront]);

  const { messages, sendMessage } = useIncidentChat(severity, stack, operatorName, uplinkId, handleNewChatMessage, playSlackPing, playTagPing, appState === 'READY');

  const handleUrlUpdate = useCallback((updates: Partial<{ severity: Severity; stack: Stack; panes: PanesState }>) => {
    if (updates.severity) setSeverity(updates.severity);
    if (updates.stack) setStack(updates.stack);
    if (updates.panes) setPanes((prev: PanesState) => ({ ...prev, ...updates.panes }));
  }, [setSeverity, setStack, setPanes]);

  // Unified Debug Logger for system events
  useEffect(() => {
    if (isDebugMode) {
        log('STATE_CHANGE', { severity, stack, appState });
    }
  }, [severity, stack, appState, isDebugMode, log]);

  useEffect(() => {
    if (isDebugMode && activePane) {
        log('WINDOW_FOCUS', { activePane });
    }
  }, [activePane, isDebugMode, log]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('terminal_theme', theme);
  }, [theme]);

  // Sync state to URL
  useUrlSync({ severity, stack, panes }, handleUrlUpdate);

  const lastEscTime = useRef<number>(0);

  const handleDeclare = useCallback(() => {
    baseDeclareIncident(playAlert);
    setDisplayText('');
  }, [baseDeclareIncident, playAlert]);

  const handleLogout = useCallback(() => {
    if (isDebugMode) log('ACTION', { type: 'LOGOUT' });
    playLogoutChime();
    setAppState('SHUTDOWN');
  }, [playLogoutChime, setAppState, isDebugMode, log]);

  const loggedTogglePane = useCallback((id: PaneId) => {
    if (isDebugMode) log('PANE_TOGGLE', { id });
    togglePane(id);
  }, [togglePane, isDebugMode, log]);

  const loggedSetSeverity = useCallback((s: Severity) => {
    if (isDebugMode) log('SEVERITY_SET', { level: s });
    setSeverity(s);
  }, [setSeverity, isDebugMode, log]);

  const loggedSetStack = useCallback((s: Stack) => {
    if (isDebugMode) log('STACK_SET', { stack: s });
    setStack(s);
  }, [setStack, isDebugMode, log]);

  const loggedSetIsSlowBurn = useCallback((on: boolean) => {
    if (isDebugMode) log('ACTION', { type: 'SLOW_BURN_TOGGLE', on });
    setIsSlowBurn(on);
  }, [setIsSlowBurn, isDebugMode, log]);

  const loggedHandleDeclare = useCallback(() => {
    if (isDebugMode) log('ACTION', { type: 'INCIDENT_DECLARED' });
    handleDeclare();
  }, [handleDeclare, isDebugMode, log]);

  const loggedCeaseTheatre = useCallback(() => {
    if (isDebugMode) log('ACTION', { type: 'THEATRE_CEASED' });
    ceaseTheatre();
  }, [ceaseTheatre, isDebugMode, log]);

  const commandActions = useMemo(() => ({
    togglePane: loggedTogglePane, 
    openPane: (id: PaneId) => { if (isDebugMode) log('PANE_OPEN', { id }); openPane(id); }, 
    closePane: (id: PaneId) => { if (isDebugMode) log('PANE_CLOSE', { id }); closePane(id); }, 
    openAll: () => { if (isDebugMode) log('ACTION', { type: 'OPEN_ALL' }); openAll(); }, 
    closeAll: () => { if (isDebugMode) log('ACTION', { type: 'CLOSE_ALL' }); closeAll(); },
    setSeverity: loggedSetSeverity, 
    setStack: loggedSetStack, 
    setAudio: (on: boolean) => { 
        if (isDebugMode) log('ACTION', { type: 'AUDIO_TOGGLE', on });
        if(on) initAudio(); 
        setIsAudioOn(on); 
    },
    setSlowBurn: loggedSetIsSlowBurn,
    setBossMode: (on: boolean) => {
        if (isDebugMode) log('ACTION', { type: 'BOSS_MODE_TOGGLE', on });
        setIsBossMode(on);
    },
    setTheme: (t: any) => {
        if (isDebugMode) log('ACTION', { type: 'THEME_SET', theme: t });
        setTheme(t);
    },
    handleEject: loggedHandleDeclare,
    handleCease: loggedCeaseTheatre,
    handleLogout,
    copyExcuse: () => { 
        if (isDebugMode) log('ACTION', { type: 'COPY_REPORT' });
        navigator.clipboard.writeText(incidentReport); 
        setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<'); 
        setTimeout(() => setDisplayText(incidentReport), 1500); 
    },
    setView: (v: any) => {
        if (isDebugMode) log('ACTION', { type: 'VIEW_SET', view: v });
        setView(v);
    },
    help: (commands: Command[]) => {
        if (isDebugMode) log('ACTION', { type: 'HELP_REQUESTED' });
        const allCmds = commands.map(c => c.patterns[0].toUpperCase());
        let helpText = '--- SYSTEM_COMMAND_INDEX ---\n\n';
        
        for (let i = 0; i < allCmds.length; i += 5) {
            helpText += allCmds.slice(i, i + 5).join(' | ') + '\n';
        }
        
        helpText += '\n----------------------------';
        setDisplayText(helpText);
        setIncidentReport('HELP_DISPLAYED');
    }
  }), [
    loggedTogglePane, openPane, closePane, openAll, closeAll, loggedSetSeverity, loggedSetStack, loggedSetIsSlowBurn, initAudio, 
    setIsAudioOn, setTheme, loggedHandleDeclare, loggedCeaseTheatre, handleLogout, incidentReport, setIncidentReport, isDebugMode, log
  ]);

  const { handleCommand: registryHandleCommand } = useCommandRegistry(commandActions);

  const handleCommand = useCallback((cmd: string): boolean => {
    if (isDebugMode) {
        log('COMMAND_EXEC', { command: cmd });
    }
    const valid = registryHandleCommand(cmd);
    if (!valid && cmd.trim().length > 0) {
        const errorMsg = `COMMAND_NOT_RECOGNIZED: "${cmd.toUpperCase()}"\nINPUT "HELP" FOR COMMAND_MANIFEST.`;
        setIncidentReport(errorMsg);
    }
    return valid;
  }, [registryHandleCommand, setIncidentReport, isDebugMode, log]);

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

  // Auto-open HowTo for first-time users
  useEffect(() => {
    const hasSeenHowTo = localStorage.getItem('smokescreen_seen_howto');
    if (!hasSeenHowTo && appState === 'READY') {
        openPane('howTo');
        localStorage.setItem('smokescreen_seen_howto', 'true');
    }
  }, [appState, openPane]);

  useEffect(() => {
    if ('fonts' in document) {
      (document as unknown as { fonts: { load: (f: string) => Promise<void> } }).fonts.load('1em "VT323"').then(() => {
        setTimeout(() => setIsAssetsLoaded(true), 500);
      });
    } else {
      setIsAssetsLoaded(true);
    }
  }, []);

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

            closePane(paneToClose);

            const remaining = visiblePanes.filter(p => p !== paneToClose);
            if (remaining.length > 0) {
                const nextActive = remaining.reduce((prev, curr) => 
                    zIndices[curr] > zIndices[prev] ? curr : prev
                );
                bringToFront(nextActive);
            }
            return;
        }

        if (severity !== 'NOMINAL') {
            loggedCeaseTheatre();
        }
        
        const now = Date.now();
        if (now - lastEscTime.current < 500) {
          loggedHandleDeclare();
        }
        lastEscTime.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, [severity, panes, zIndices, activePane, isBossMode, loggedHandleDeclare, loggedCeaseTheatre, bringToFront, closePane]);

  useEffect(() => {
    if (incidentReport) {
      if (incidentReport === 'HELP_DISPLAYED') return;
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(incidentReport.slice(0, i + 1));
        i++;
        if (i >= incidentReport.length) clearInterval(timer);
      }, 20);
      return () => clearInterval(timer);
    }
  }, [incidentReport]);

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
      <div className="crt-container gateway-container">
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 }}>
          <FakeLogs severity="NOMINAL" />
        </div>
        
        <div className="gateway-console">
          <div className="gateway-technical-readout">
            <div>
                <StatReadout label="OS_V" value="5.0.0" /><br/>
                <StatReadout label="GPU" value={clientStats.gpu} />
            </div>
            <div style={{ textAlign: 'right' }}>
                <StatReadout label="PWR" value={
                    `${clientStats.batteryLevel !== null ? `${clientStats.batteryLevel}%` : 'AC_POWER'}${clientStats.isCharging ? ' (CHARGING)' : ''}`
                } /><br/>
                <StatReadout label="SIGNAL" value={clientStats.connectionType} />
            </div>
          </div>

          <div className="gateway-label">SRE SECURE GATEWAY</div>
          <h1 className="gateway-title">SMOKESCREEN</h1>
          <div className="gateway-subtitle">
            TECHNICAL_INCIDENT_THEATRE
          </div>

          <div className="gateway-input-group">
            <label>
              {'>'} IDENTIFY_OPERATOR:
            </label>
            <div className="gateway-input-wrapper">
                <span className="cursor">_</span>
                <input 
                    autoFocus
                    type="text" 
                    value={operatorName}
                    placeholder="NAME_REQUIRED"
                    className="gateway-input"
                    onChange={(e) => setOperatorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && operatorName.trim() && setAppState('BOOT')}
                />
            </div>
          </div>

          <Button 
            onClick={() => operatorName.trim() && setAppState('BOOT')} 
            disabled={!operatorName.trim()} 
            variant="primary"
            size="large"
            fullWidth
          >
            INITIATE_SYSTEM_BOOT
          </Button>

          <div style={{ marginTop: '20px' }}>
            <AudioToggle 
                fullWidth 
                size="small" 
                labelPrefix="AUDIO"
                activeLabel="ON"
                inactiveLabel="OFF"
            />
          </div>

          <div style={{ marginTop: '30px', opacity: 0.3, fontSize: 'var(--text-l4)', textAlign: 'center' }}>
            UNAUTHORIZED ACCESS IS PROHIBITED<br/>
            (C) 1984 SRE DIVISION
          </div>

          <div className="gateway-pager-link">
             <div className="gateway-pager-link-label">
              {">"} LINK_COMPANION_PAGER:
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="SRE-XXXX"
                    value={tempJoinId}
                    onChange={(e) => setTempJoinId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && tempJoinId && (window.location.search = `?pager=${tempJoinId}&theme=${theme}`)}
                    className="gateway-input"
                    style={{ padding: '10px' }} // Local override for smaller size
                />
                <Button 
                    onClick={() => {
                        if (tempJoinId) {
                            window.location.search = `?pager=${tempJoinId}&theme=${theme}`;
                        }
                    }}
                    size="small"
                    disabled={!tempJoinId}
                    style={{ minWidth: '100px' }}
                >
                    CONNECT
                </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'BOOT') {
    return <BootScreen operatorName={operatorName} uplinkId={uplinkId} playPostBeep={playPostBeep} onComplete={() => { 
        playLoginChime();
        setIsTransitioning(true);
        setAppState('READY'); 
        setTimeout(() => setIsTransitioning(false), 800);
    }} />;
  }

  if (appState === 'SHUTDOWN') {
    return <ShutdownScreen onComplete={() => {
        stopAllSounds();
        setAppState('SPLASH');
        loggedCeaseTheatre();
        closeAll();
    }} />;
  }

  const isDeclared = !!(incidentReport && incidentReport !== 'HELP_DISPLAYED' && !incidentReport.startsWith('COMMAND_NOT_RECOGNIZED'));

  if (view === 'TICKET') {
    return (
      <div className={`crt-container ${isTransitioning ? 'crt-boot' : ''}`}>
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
      <Suspense fallback={null}>
        {panes.chat && <WarRoom 
            messages={messages} 
            zIndex={zIndices.chat} 
            onFocus={() => bringToFront('chat')} 
            isActive={activePane === 'chat'} 
            onClose={() => loggedTogglePane('chat')}
            sendMessage={sendMessage}
            isDeclared={isDeclared}
            operatorName={operatorName}
        />}
        {panes.map && <OutageMap severity={severity} zIndex={zIndices.map} onFocus={() => bringToFront('map')} isActive={activePane === 'map'} onClose={() => loggedTogglePane('map')} />}
        {panes.deploy && <DeploymentStatus severity={severity} zIndex={zIndices.deploy} onFocus={() => bringToFront('deploy')} isActive={activePane === 'deploy'} onClose={() => loggedTogglePane('deploy')} />}
        {panes.logs && <SystemLog severity={severity} zIndex={zIndices.logs} onFocus={() => bringToFront('logs')} isActive={activePane === 'logs'} uplinkId={uplinkId} onClose={() => loggedTogglePane('logs')} />}
        {panes.burn && <BurnRateDashboard severity={severity} zIndex={zIndices.burn} onFocus={() => bringToFront('burn')} isActive={activePane === 'burn'} moneyLost={moneyLost} onClose={() => loggedTogglePane('burn')} />}
        {panes.pager && <PagerSync severity={severity} stack={stack} zIndex={zIndices.pager} onFocus={() => bringToFront('pager')} isActive={activePane === 'pager'} uplinkId={uplinkId} onClose={() => loggedTogglePane('pager')} />}
        {panes.howTo && <HowToPane zIndex={zIndices.howTo} onFocus={() => bringToFront('howTo')} isActive={activePane === 'howTo'} onClose={() => loggedTogglePane('howTo')} />}
        {panes.settings && <SettingsPane currentTheme={theme} setTheme={setTheme} zIndex={zIndices.settings} onFocus={() => bringToFront('settings')} isActive={activePane === 'settings'} onClose={() => loggedTogglePane('settings')} />}
        {panes.metrics && <LatencyPane zIndex={zIndices.metrics} onFocus={() => bringToFront('metrics')} isActive={activePane === 'metrics'} onClose={() => loggedTogglePane('metrics')} />}
        {isDebugMode && panes.debug && <DebugConsole zIndex={zIndices.debug} onFocus={() => bringToFront('debug')} isActive={activePane === 'debug'} onClose={() => loggedTogglePane('debug')} />}
      </Suspense>

      <div className={`crt-container ${isTransitioning ? 'crt-boot' : ''} ${isDeclared ? 'simulation-chaotic' : ''}`}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <FakeLogs severity={severity} />
        </div>

        <div className="terminal-content">
          <header className="terminal-header">
            <div>
              <div style={{ fontSize: 'var(--text-l3)', marginBottom: '-5px', opacity: 0.8, fontWeight: 'bold' }}>SMOKESCREEN OS v4.5</div>
              <h1 style={{ fontSize: 'var(--text-l1)', margin: '0', letterSpacing: '2px' }}>SMOKESCREEN</h1>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.5, letterSpacing: '4px', marginTop: '-5px', color: 'var(--terminal-green)' }}>
                FAILURE IS NOT AN OPTION. IT IS A CORPORATE MANDATE.
              </div>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.4, marginTop: '5px' }}>
                AUTHOR: ASH DAVIES (DRIZZLYOWL) | <span style={{ opacity: 0.6 }}>[CMD+B] FOR EMERGENCY COVER</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: severity === 'P0' ? 'var(--terminal-red)' : severity === 'P1' ? 'var(--terminal-amber)' : 'var(--terminal-green)', fontWeight: 'bold', fontSize: 'var(--text-l2)' }}>
                STATUS: {status}
              </div>
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.6 }}>
                LIFE RECLAIMED: {Math.floor(totalSaved / 60)}H {totalSaved % 60}M
              </div>
              {severity !== 'NOMINAL' && (
                <div style={{ fontSize: 'var(--text-l4)', opacity: 0.5, color: 'var(--terminal-red)' }}>
                  EST_BURN: £{moneyLost.toFixed(2)}
                </div>
              )}
              <div style={{ fontSize: 'var(--text-l4)', opacity: 0.6 }}>
                OP: {operatorName || 'UNKNOWN'} | UPLINK: <a href={`${window.location.origin}${window.location.pathname}?pager=${uplinkId}&sev=${severity}&stack=${stack}&theme=${theme}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>{uplinkId}</a>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button onClick={() => loggedTogglePane('howTo')} active={panes.howTo} size="small inline" title="Operator Manual">
                  HELP
                </Button>
                <Button onClick={() => loggedTogglePane('settings')} active={panes.settings} size="small inline" title="System Configuration">
                  SETTINGS
                </Button>
                <Button onClick={handleLogout} variant="danger" size="small inline" title="Logout / Shutdown">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  LOGOUT
                </Button>
              </div>
            </div>
          </header>

          <ActionGroup label="[ THEATRE_CONTROLS ]">
                <Button onClick={() => loggedTogglePane('chat')} active={panes.chat} size="medium inline">
                    WAR_ROOM ({unreadChat})
                </Button>
                <Button onClick={() => loggedTogglePane('logs')} active={panes.logs} size="medium inline">
                    KERNEL_LOGS
                </Button>
                <Button onClick={() => loggedTogglePane('deploy')} active={panes.deploy} size="medium inline">
                    K8S_STATUS
                </Button>
                <Button onClick={() => loggedTogglePane('burn')} active={panes.burn} size="medium inline">
                    BURN_RATE
                </Button>
                <Button onClick={() => loggedTogglePane('pager')} active={panes.pager} size="medium inline">
                    MOBILE_UPLINK
                </Button>
                <Button onClick={() => loggedTogglePane('map')} active={panes.map} size="medium inline">
                    OUTAGE_MAP
                </Button>
                <Button onClick={() => loggedTogglePane('metrics')} active={panes.metrics} size="medium inline">
                    LATENCY_METRICS
                </Button>
                {isDebugMode && (
                    <Button onClick={() => loggedTogglePane('debug')} active={panes.debug} variant="terminal" size="medium inline">
                        DEBUG
                    </Button>
                )}
          </ActionGroup>

          <div className="selector-container">
            <ActionGroup label="[ CLOUD_STACK_SELECT ]" style={{ flex: 1 }}>
                {(['AWS', 'GCP', 'AZURE', 'ON-PREM', 'SERVERLESS'] as Stack[]).map((s) => (
                  <Button 
                    key={s} 
                    active={stack === s} 
                    onClick={() => loggedSetStack(s)} 
                    size="medium inline"
                  >
                    {s}
                  </Button>
                ))}
            </ActionGroup>
            <ActionGroup label="[ THREAT_LEVEL ]" style={{ flex: 1 }}>
                {(['NOMINAL', 'P3', 'P1', 'P0'] as Severity[]).map((level) => (
                  <Button 
                    key={level} 
                    variant={level === 'P0' ? 'danger' : 'terminal'}
                    active={severity === level} 
                    onClick={() => { loggedSetSeverity(level); }} 
                    size="medium inline"
                  >
                    {level}
                  </Button>
                ))}
            </ActionGroup>
          </div>

          <CommandInput onCommand={handleCommand} />

          <div className="system-controls">
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <Button 
                    onClick={() => loggedSetIsSlowBurn(!isSlowBurn)} 
                    active={isSlowBurn} 
                    size="small"
                    style={{ minWidth: '220px', whiteSpace: 'nowrap' }}
                >
                    <ActivityIcon />
                    SLOW BURN: {isSlowBurn ? `${slowBurnCountdown}s` : 'OFF'}
                </Button>
                <AudioToggle 
                    size="small" 
                    labelPrefix="AUDIO"
                    activeLabel="ON"
                    inactiveLabel="OFF"
                    style={{ minWidth: '160px', whiteSpace: 'nowrap' }} 
                />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <Button 
                    variant={isDeclared ? "danger" : "primary"}
                    onClick={isDeclared ? loggedCeaseTheatre : loggedHandleDeclare} 
                    disabled={severity === 'NOMINAL'}
                    size="large"
                    style={{ flex: 1 }}
                >
                    {isDeclared ? 'RESOLVE_INCIDENT' : 'DECLARE_INCIDENT'}
                </Button>
            </div>
          </div>

          {incidentReport && (
            <ReadoutBox 
                label={`> INCIDENT_TECHNICAL_PLAYBOOK [${stack}]:`}
                className="excuse-text"
                headerRight={localStorage.getItem('gemini_api_key') && (
                    <div className="ai-badge">
                        AI_ENHANCED
                    </div>
                )}
                footer={displayText === incidentReport && incidentReport !== 'HELP_DISPLAYED' && !incidentReport.startsWith('COMMAND_NOT_RECOGNIZED') && (
                    <div className="flex gap-3">
                      <Button onClick={() => { navigator.clipboard.writeText(incidentReport); setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<'); setTimeout(() => setDisplayText(incidentReport), 1500); }} active size="x-small">
                        [ COPY_PLAYBOOK ]
                      </Button>
                      <Button onClick={() => setView('TICKET')} size="x-small">
                        [ VIEW_RESTRICTED_TICKET ]
                      </Button>
                    </div>
                )}
            >
              <div style={{ lineHeight: '1.4', fontSize: 'var(--text-l3)', whiteSpace: 'pre-wrap' }}>{displayText}</div>
            </ReadoutBox>
          )}
          <Footer appState={appState} easterEggs={easterEggs} />
        </div>
      </div>
    </>
  );
}

export default App;
