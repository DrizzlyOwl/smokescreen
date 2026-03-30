import React, { Suspense, lazy } from 'react';
import { FakeLogs } from './FakeLogs';
import { Button } from './Button';
import { ActionGroup } from './ActionGroup';
import { AudioToggle } from './AudioToggle';
import { Footer } from './Footer';
import type { Severity, Stack } from '../data/incidents';
import type { TerminalLine } from '../hooks/useIncidentState';
import type { ChatMessage, AppState, Theme } from '../contexts/types';
import type { PaneId, PanesState, MinimizedState, ZIndicesState } from '../hooks/useWindowManager';
import '../styles/SystemControlCluster.scss';

// Lazy load panes for better performance
const WarRoom = lazy(() => import('./WarRoom').then(m => ({ default: m.WarRoom })));
const HowToPane = lazy(() => import('./HowToPane').then(m => ({ default: m.HowToPane })));
const SettingsPane = lazy(() => import('./SettingsPane').then(m => ({ default: m.SettingsPane })));
const LatencyPane = lazy(() => import('./LatencyPane').then(m => ({ default: m.LatencyPane })));
const PlaybookPane = lazy(() => import('./PlaybookPane').then(m => ({ default: m.PlaybookPane })));
const TerminalPane = lazy(() => import('./TerminalPane').then(m => ({ default: m.TerminalPane })));
const OutageMap = lazy(() => import('./OutageMap').then(m => ({ default: m.OutageMap })));
const SystemLog = lazy(() => import('./SystemLog').then(m => ({ default: m.SystemLog })));
const BurnRateDashboard = lazy(() => import('./BurnRateDashboard').then(m => ({ default: m.BurnRateDashboard })));
const DeploymentStatus = lazy(() => import('./DeploymentStatus').then(m => ({ default: m.DeploymentStatus })));
const PagerSync = lazy(() => import('./PagerSync').then(m => ({ default: m.PagerSync })));
const DebugConsole = lazy(() => import('./DebugConsole').then(m => ({ default: m.DebugConsole })));
const ReadoutBox = lazy(() => import('./ReadoutBox').then(m => ({ default: m.ReadoutBox })));

interface SystemControlClusterProps {
  panes: PanesState;
  minimizedPanes: MinimizedState;
  zIndices: ZIndicesState;
  activePane: PaneId | null;
  bringToFront: (id: PaneId) => void;
  loggedTogglePane: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  isDeclared: boolean;
  operatorName: string;
  uplinkId: string;
  severity: Severity;
  stack: Stack;
  status: string;
  systemMetrics: { cpu: number; ram: number };
  moneyLost: number;
  isTransitioning: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  handleLogout: () => void;
  unreadChat: number;
  typingUsers: string[];
  isDebugMode: boolean;
  loggedSetStack: (s: Stack) => void;
  loggedSetSeverity: (s: Severity) => void;
  handleCommand: (cmd: string) => boolean;
  isSlowBurn: boolean;
  isChaos: boolean;
  slowBurnCountdown: number;
  loggedSetIsSlowBurn: (on: boolean) => void;
  loggedCeaseTheatre: () => void;
  loggedHandleDeclare: () => void;
  incidentReport: string;
  setIncidentReport: (r: string) => void;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  displayText: string;
  setView: (v: 'HOME' | 'TICKET') => void;
  appState: AppState;
  easterEggs: string[];
  activePlaybook: import('../data/playbooks/types').Playbook | null;
  startPlaybook: (p: import('../data/playbooks/types').Playbook) => void;
  stopPlaybook: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
}

export const SystemControlCluster: React.FC<SystemControlClusterProps> = ({
  panes,
  minimizedPanes,
  zIndices,
  activePane,
  bringToFront,
  loggedTogglePane,
  toggleMinimize,
  messages,
  sendMessage,
  isDeclared,
  operatorName,
  uplinkId,
  severity,
  stack,
  status,
  systemMetrics,
  moneyLost,
  isTransitioning,
  theme,
  setTheme,
  handleLogout,
  unreadChat,
  typingUsers,
  isDebugMode,
  loggedSetStack,
  loggedSetSeverity,
  handleCommand,
  isSlowBurn,
  isChaos,
  slowBurnCountdown,
  loggedSetIsSlowBurn,
  loggedCeaseTheatre,
  loggedHandleDeclare,
  incidentReport,
  setIncidentReport,
  terminalHistory,
  displayText,
  setView,
  appState,
  easterEggs,
  activePlaybook,
  startPlaybook,
  stopPlaybook,
  markAsRead,
  markAllAsRead,
  isEcoMode,
  setIsEcoMode
}) => {
  const [fps, setFps] = React.useState(60);
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let frameId: number;
    const calculateFps = (time: number) => {
      frameCount.current++;
      if (time >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
        lastTime.current = time;
        frameCount.current = 0;
      }
      frameId = requestAnimationFrame(calculateFps);
    };
    frameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(frameId);
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayText]);

  return (
    <>
      <div className={`status-bar status-bar--${severity.toLowerCase()}`}>
        <div className="status-bar__left">
          <span>OPERATOR: {operatorName || 'UNKNOWN'}</span>
          <span>|</span>
          <div className="status-bar__metrics">
            <span className="status-bar__label">FPS:</span>
            <span 
              className={`status-bar__metric-badge status-bar__metric-badge--fps ${fps < 30 ? 'status-bar__metric-badge--critical' : fps < 55 ? 'status-bar__metric-badge--warning' : ''}`}
            >
              {fps}
            </span>
          </div>
          <span>|</span>
          <span>SYSTEM_STATUS: {status}</span>
          {isChaos && <span className="italic" style={{ color: 'var(--terminal-red)', marginLeft: '10px' }}>[UNSTABLE]</span>}
        </div>
        <div className="status-bar__right">
          <Button 
            onClick={() => setIsEcoMode(!isEcoMode)} 
            variant="ghost" 
            size="x-small"
            active={isEcoMode}
            className={isEcoMode ? 'status-bar__eco--active' : ''}
          >
            ECO: {isEcoMode ? 'ON' : 'OFF'}
          </Button>
          <AudioToggle size="x-small" variant="ghost" />
          <Button onClick={handleLogout} variant="ghost" size="x-small">LOGOUT</Button>
        </div>
      </div>

      <div className={`crt-container ${isTransitioning ? 'crt-boot' : ''} ${isDeclared ? 'simulation-chaotic' : ''}`}>
        <div className="system-background">
          <FakeLogs severity={severity} />
        </div>

        <div className="system-layout">
          <header className="system-header">
            <div className="system-header__title-group">
              <h1 className="system-header__title">SMOKESCREEN</h1>
              <div className="system-header__subtitle">
                FAILURE IS NOT AN OPTION. IT IS A CORPORATE MANDATE.
              </div>
            </div>
            <div className="system-header__info">
              <div className="system-header__info-line">
                OP: {operatorName || 'UNKNOWN'} | STACK: {stack}
              </div>
              <div className="system-header__info-line">
                UPLINK_NODE: <a href={`${window.location.origin}${window.location.pathname}?pager=${uplinkId}&sev=${severity}&stack=${stack}&theme=${theme}`} target="_blank" rel="noopener noreferrer" className="system-header__link">{uplinkId}</a>
              </div>
            </div>
          </header>

          <div className="system-controls">
            <ActionGroup label="[ OBSERVABILITY_ARRAY ]" className="action-group--expanded" variant="grid">
                <Button onClick={() => loggedTogglePane('terminal')} active={panes.terminal} size="small-inline">TERMINAL</Button>
                <Button onClick={() => loggedTogglePane('logs')} active={panes.logs} size="small-inline">KERNEL_LOGS</Button>
                <Button onClick={() => loggedTogglePane('deploy')} active={panes.deploy} size="small-inline">K8S_STATUS</Button>
                <Button onClick={() => loggedTogglePane('map')} active={panes.map} size="small-inline">OUTAGE_MAP</Button>
                <Button onClick={() => loggedTogglePane('metrics')} active={panes.metrics} size="small-inline">LATENCY_METRICS</Button>
                <Button onClick={() => loggedTogglePane('burn')} active={panes.burn} size="small-inline">BURN_RATE</Button>
            </ActionGroup>
            <ActionGroup label="[ COMMS_UPLINK ]" className="action-group--expanded">
                <Button onClick={() => loggedTogglePane('chat')} active={panes.chat} size="small-inline">WAR_ROOM ({unreadChat})</Button>
                <Button onClick={() => loggedTogglePane('pager')} active={panes.pager} size="small-inline">MOBILE_SYNC</Button>
                {isDebugMode && <Button onClick={() => loggedTogglePane('debug')} active={panes.debug} variant="terminal" size="small-inline">DEBUG</Button>}
            </ActionGroup>
          </div>

          <div className="cluster-layout">
            {/* Command & Control Panel */}
            <div className="cluster-layout__sidebar">
              <ActionGroup label="[ SYSTEM_PARAMETERS ]" variant="grid">
                  {(['AWS', 'GCP', 'AZURE', 'ON-PREM', 'SERVERLESS', 'CLOUDFLARE', 'HEROKU', 'HYPER-V', 'VMWARE'] as Stack[]).map((s) => (
                    <Button key={s} active={stack === s} onClick={() => loggedSetStack(s)} size="x-small">
                      {s}
                    </Button>
                  ))}
              </ActionGroup>

              <ActionGroup label="[ THREAT_LEVEL_PROTOCOL ]" variant="grid">
                    {(['NOMINAL', 'P3', 'P1', 'P0'] as Severity[]).map((level) => (
                      <Button 
                        key={level} 
                        variant={level === 'P0' ? 'danger' : 'terminal'}
                        active={severity === level} 
                        onClick={() => { loggedSetSeverity(level); }} 
                        size="x-small"
                      >
                        {level}
                      </Button>
                    ))}
              </ActionGroup>

              <ActionGroup label="[ INCIDENT_EXECUTION ]">
                <div className="execution-controls">
                  <Button 
                    onClick={loggedHandleDeclare} 
                    variant="primary" 
                    fullWidth 
                    active={isDeclared}
                    disabled={isDeclared}
                  >
                    DECLARE_INCIDENT
                  </Button>
                  
                  <div className="execution-controls__row">
                    <Button 
                        onClick={() => loggedSetIsSlowBurn(!isSlowBurn)} 
                        variant={isSlowBurn ? 'danger' : 'terminal'}
                        active={isSlowBurn}
                    >
                        {isSlowBurn ? `ABORT_BURN (${slowBurnCountdown}s)` : 'SLOW_BURN'}
                    </Button>
                    <Button onClick={loggedCeaseTheatre} variant="terminal">RESOLVE_ALL</Button>
                  </div>
                </div>
              </ActionGroup>

              <ActionGroup label="[ SYSTEM_UTILITIES ]">
                <div className="system-utilities">
                  <Button onClick={() => loggedTogglePane('playbooks')} active={panes.playbooks} variant="ghost" size="x-small" title="Playbook Library">
                    PLAYBOOKS
                  </Button>
                  <Button onClick={() => loggedTogglePane('settings')} active={panes.settings} variant="ghost" size="x-small" title="System Configuration">
                    SETTINGS
                  </Button>
                  <Button onClick={() => loggedTogglePane('howTo')} active={panes.howTo} variant="ghost" size="x-small" title="Operator Manual">
                    HELP
                  </Button>
                </div>
              </ActionGroup>
            </div>

            <div className="cluster-layout__main">
              {/* Terminal and Readout are now floating Panes */}
            </div>
          </div>

          <Footer appState={appState} easterEggs={easterEggs} />
        </div>
      </div>

      <Suspense fallback={null}>
        {panes.chat && <WarRoom 
            messages={messages} 
            typingUsers={typingUsers}
            zIndex={zIndices.chat} 
            onFocus={() => bringToFront('chat')} 
            isActive={activePane === 'chat'} 
            isMinimized={minimizedPanes.chat}
            onMinimizeToggle={() => toggleMinimize('chat')}
            onClose={() => loggedTogglePane('chat')}
            sendMessage={sendMessage}
            isDeclared={isDeclared}
            operatorName={operatorName}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
        />}
        
        {panes.howTo && <HowToPane 
            zIndex={zIndices.howTo} 
            onFocus={() => bringToFront('howTo')} 
            isActive={activePane === 'howTo'} 
            isMinimized={minimizedPanes.howTo}
            onMinimizeToggle={() => toggleMinimize('howTo')}
            onClose={() => loggedTogglePane('howTo')} 
        />}
        
        {panes.settings && <SettingsPane 
            zIndex={zIndices.settings} 
            onFocus={() => bringToFront('settings')} 
            isActive={activePane === 'settings'} 
            isMinimized={minimizedPanes.settings}
            onMinimizeToggle={() => toggleMinimize('settings')}
            currentTheme={theme} 
            setTheme={setTheme} 
            onClose={() => loggedTogglePane('settings')} 
        />}
        
        {panes.metrics && <LatencyPane 
            zIndex={zIndices.metrics} 
            onFocus={() => bringToFront('metrics')} 
            isActive={activePane === 'metrics'} 
            isMinimized={minimizedPanes.metrics}
            onMinimizeToggle={() => toggleMinimize('metrics')}
            onClose={() => loggedTogglePane('metrics')} 
        />}
        
        {panes.playbooks && <PlaybookPane 
            zIndex={zIndices.playbooks} 
            onFocus={() => bringToFront('playbooks')} 
            isActive={activePane === 'playbooks'} 
            isMinimized={minimizedPanes.playbooks}
            onMinimizeToggle={() => toggleMinimize('playbooks')}
            onClose={() => loggedTogglePane('playbooks')}
            activePlaybook={activePlaybook}
            startPlaybook={startPlaybook}
            stopPlaybook={stopPlaybook}
        />}

        {panes.terminal && <TerminalPane 
            zIndex={zIndices.terminal} 
            onFocus={() => bringToFront('terminal')} 
            isActive={activePane === 'terminal'} 
            isMinimized={minimizedPanes.terminal}
            onMinimizeToggle={() => toggleMinimize('terminal')}
            terminalHistory={terminalHistory}
            onClose={() => loggedTogglePane('terminal')}
            operatorName={operatorName}
            onCommand={handleCommand}
        />}

        {panes.map && <OutageMap severity={severity} zIndex={zIndices.map} onFocus={() => bringToFront('map')} isActive={activePane === 'map'} isMinimized={minimizedPanes.map} onMinimizeToggle={() => toggleMinimize('map')} onClose={() => loggedTogglePane('map')} />}
        {panes.logs && <SystemLog severity={severity} zIndex={zIndices.logs} onFocus={() => bringToFront('logs')} isActive={activePane === 'logs'} isMinimized={minimizedPanes.logs} onMinimizeToggle={() => toggleMinimize('logs')} uplinkId={uplinkId} onClose={() => loggedTogglePane('logs')} />}
        {panes.burn && <BurnRateDashboard severity={severity} zIndex={zIndices.burn} onFocus={() => bringToFront('burn')} isActive={activePane === 'burn'} isMinimized={minimizedPanes.burn} onMinimizeToggle={() => toggleMinimize('burn')} moneyLost={moneyLost} onClose={() => loggedTogglePane('burn')} />}
        {panes.deploy && <DeploymentStatus severity={severity} zIndex={zIndices.deploy} onFocus={() => bringToFront('deploy')} isActive={activePane === 'deploy'} isMinimized={minimizedPanes.deploy} onMinimizeToggle={() => toggleMinimize('deploy')} onClose={() => loggedTogglePane('deploy')} />}
        {panes.pager && <PagerSync severity={severity} stack={stack} zIndex={zIndices.pager} onFocus={() => bringToFront('pager')} isActive={activePane === 'pager'} isMinimized={minimizedPanes.pager} onMinimizeToggle={() => toggleMinimize('pager')} uplinkId={uplinkId} onClose={() => loggedTogglePane('pager')} />}
        {isDebugMode && panes.debug && <DebugConsole zIndex={zIndices.debug} onFocus={() => bringToFront('debug')} isActive={activePane === 'debug'} isMinimized={minimizedPanes.debug} onMinimizeToggle={() => toggleMinimize('debug')} onClose={() => loggedTogglePane('debug')} />}
        
        {panes.readout && incidentReport && incidentReport !== 'HELP_DISPLAYED' && !incidentReport.startsWith('COMMAND_NOT_RECOGNIZED') && (
          <ReadoutBox 
            title="INCIDENT_PLAYBOOK_GENERATED"
            label="AUTOMATED_RESPONSE_STRATEGY"
            zIndex={zIndices.readout}
            onFocus={() => bringToFront('readout')}
            isActive={activePane === 'readout'}
            isMinimized={minimizedPanes.readout}
            onMinimizeToggle={() => toggleMinimize('readout')}
            onClose={() => setIncidentReport('')}
            headerRight={
              <div className="readout-box__header-actions">
                <Button 
                  onClick={() => setIncidentReport('')} 
                  size="x-small" 
                  variant="ghost"
                >
                  [ CLEAR_READOUT ]
                </Button>
                {localStorage.getItem('gemini_api_key') && (
                  <div className="ai-badge">AI_ENHANCED</div>
                )}
              </div>
            }
            contentRef={scrollRef}
            footer={displayText === incidentReport && incidentReport !== 'HELP_DISPLAYED' && !incidentReport.startsWith('COMMAND_NOT_RECOGNIZED') && (
                <div className="readout-box__footer-actions">
                  <Button onClick={() => { 
                    navigator.clipboard.writeText(incidentReport); 
                    const original = incidentReport;
                    setIncidentReport('>>> CLIPBOARD_SYNC_COMPLETE <<<'); 
                    setTimeout(() => setIncidentReport(original), 1500); 
                  }} active size="x-small">
                    [ COPY_PLAYBOOK ]
                  </Button>
                  <Button onClick={() => setView('TICKET')} size="x-small">
                    [ VIEW_RESTRICTED_TICKET ]
                  </Button>
                </div>
            )}
          >
            {displayText}
          </ReadoutBox>
        )}
      </Suspense>
    </>
  );
};
