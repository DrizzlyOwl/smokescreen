import React, { Suspense, lazy } from 'react';
import { Button } from './Button';
import type { TerminalLine } from '../hooks/useIncidentState';
import type { ChatMessage } from '../contexts/types';
import type { PaneId, PanesState, MinimizedState, ZIndicesState } from '../hooks/useWindowManager';
import { TacticalOverview } from './TacticalOverview';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

// Lazy load panes
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

interface PaneGridProps {
  panes: PanesState;
  minimizedPanes: MinimizedState;
  zIndices: ZIndicesState;
  poppedOutPanes: Record<PaneId, boolean>;
  snappedMainPanes: Record<PaneId, boolean>;
  togglePopOut: (id: PaneId) => void;
  toggleSnapMain: (id: PaneId) => void;
  activePane: PaneId | null;
  bringToFront: (id: PaneId) => void;
  loggedTogglePane: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  typingUsers: string[];
  handleCommand: (cmd: string) => boolean;
  terminalHistory: TerminalLine[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  activePlaybook: any;
  startPlaybook: (p: any) => void;
  stopPlaybook: () => void;
}

export const PaneGrid: React.FC<PaneGridProps> = ({
  panes,
  minimizedPanes,
  zIndices,
  poppedOutPanes,
  snappedMainPanes,
  togglePopOut,
  toggleSnapMain,
  activePane,
  bringToFront,
  loggedTogglePane,
  toggleMinimize,
  messages,
  sendMessage,
  typingUsers,
  handleCommand,
  terminalHistory,
  scrollRef,
  markAsRead,
  markAllAsRead,
  activePlaybook,
  startPlaybook,
  stopPlaybook
}) => {
  const severity = useIncidentStore(state => state.severity);
  const stack = useIncidentStore(state => state.stack);
  const isDeclared = !!useIncidentStore(state => state.incidentReport);
  const incidentReport = useIncidentStore(state => state.incidentReport);
  const setIncidentReport = useIncidentStore(state => state.setIncidentReport);
  const displayText = useIncidentStore(state => state.displayText);
  const setView = useIncidentStore(state => state.setView);
  const moneyLost = useIncidentStore(state => state.moneyLost);
  const chatMultiplier = useIncidentStore(state => state.chatMultiplier);
  const setChatMultiplier = useIncidentStore(state => state.setChatMultiplier);

  const theme = useTerminalStore(state => state.theme);
  const setTheme = useTerminalStore(state => state.setTheme);
  const operatorName = useTerminalStore(state => state.operatorName);
  const uplinkId = useTerminalStore(state => state.uplinkId);

  const renderPane = (id: PaneId) => {
    if (!panes[id]) return null;

    const isPopped = poppedOutPanes[id];
    const isSnapped = snappedMainPanes[id];
    const commonProps = {
      id,
      zIndex: isPopped ? zIndices[id] : 1,
      isActive: activePane === id,
      isPoppedOut: isPopped,
      onPopOutToggle: () => togglePopOut(id),
      isSnappedMain: isSnapped,
      onSnapMainToggle: () => toggleSnapMain(id),
      onFocus: () => bringToFront(id),
      onClose: () => loggedTogglePane(id),
      isMinimized: minimizedPanes[id],
      onMinimizeToggle: () => toggleMinimize(id)
    };

    switch (id) {
      case 'chat':
        return <WarRoom 
          {...commonProps}
          messages={messages} 
          typingUsers={typingUsers}
          sendMessage={sendMessage}
          isDeclared={isDeclared}
          operatorName={operatorName}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          initialPos={{ x: 400, y: 50 }}
        />;
      case 'terminal':
        return <TerminalPane 
          {...commonProps}
          terminalHistory={terminalHistory}
          operatorName={operatorName}
          onCommand={handleCommand}
          initialPos={{ x: 400, y: 460 }}
        />;
      case 'logs':
        return <SystemLog 
          {...commonProps}
          severity={severity} 
          uplinkId={uplinkId} 
          initialPos={{ x: 400, y: 80 }}
        />;
      case 'deploy':
        return <DeploymentStatus 
          {...commonProps}
          severity={severity} 
          initialPos={{ x: 1020, y: 200 }}
        />;
      case 'metrics':
        return <LatencyPane 
          {...commonProps}
          initialPos={{ x: 870, y: 500 }}
        />;
      case 'settings':
        return <SettingsPane 
          {...commonProps}
          currentTheme={theme} 
          setTheme={setTheme} 
          initialPos={{ x: 600, y: 150 }}
        />;
      case 'map':
        return <OutageMap 
          {...commonProps}
          severity={severity} 
          initialPos={{ x: 870, y: 50 }}
        />;
      case 'burn':
        return <BurnRateDashboard 
          {...commonProps}
          severity={severity} 
          moneyLost={moneyLost} 
          initialPos={{ x: 1250, y: 460 }}
        />;
      case 'pager':
        return <PagerSync 
          {...commonProps}
          severity={severity} 
          stack={stack} 
          uplinkId={uplinkId} 
          initialPos={{ x: 1480, y: 50 }}
        />;
      case 'playbooks':
        return <PlaybookPane 
          {...commonProps}
          activePlaybook={activePlaybook}
          startPlaybook={startPlaybook}
          stopPlaybook={stopPlaybook}
          initialPos={{ x: 450, y: 200 }}
        />;
      case 'debug':
        return <DebugConsole 
          {...commonProps}
          initialPos={{ x: 50, y: 600 }}
          chatMultiplier={chatMultiplier}
          setChatMultiplier={setChatMultiplier}
        />;
      case 'howTo':
        return <HowToPane 
          {...commonProps}
          initialPos={{ x: 500, y: 100 }}
        />;
      case 'readout':
        if (!incidentReport || incidentReport === 'HELP_DISPLAYED' || incidentReport.startsWith('COMMAND_NOT_RECOGNIZED')) return null;
        return <ReadoutBox 
          {...commonProps}
          title="INCIDENT_PLAYBOOK_GENERATED"
          label="AUTOMATED_RESPONSE_STRATEGY"
          initialPos={{ x: 600, y: 150 }}
          headerRight={
            <div className="readout-box__header-actions">
              <Button onClick={() => setIncidentReport('')} size="x-small" variant="ghost">[ CLEAR_READOUT ]</Button>
              {localStorage.getItem('gemini_api_key') && <div className="ai-badge">AI_ENHANCED</div>}
            </div>
          }
          contentRef={scrollRef as any}
          footer={displayText === incidentReport && (
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
        </ReadoutBox>;
      default:
        return null;
    }
  };

  const paneIds: PaneId[] = ['chat', 'logs', 'map', 'deploy', 'burn', 'pager', 'howTo', 'settings', 'metrics', 'playbooks', 'readout', 'terminal', 'debug'];
  const tiledPanes = paneIds.filter(id => panes[id] && !poppedOutPanes[id]);
  const mainSnappedPanes = tiledPanes.filter(id => snappedMainPanes[id]);
  const rightTiledPanes = tiledPanes.filter(id => !snappedMainPanes[id]);
  const floatingPanes = paneIds.filter(id => panes[id] && poppedOutPanes[id]);

  return (
    <>
      <div className="tiled-layout">
        <div className="tiled-grid">
          <div className="tiled-grid__main">
            {mainSnappedPanes.length === 0 ? (
              <TacticalOverview 
                severity={severity}
                stack={stack}
                isDeclared={isDeclared}
              />
            ) : (
              <Suspense fallback={null}>
                {mainSnappedPanes.map(id => (
                    <React.Fragment key={id}>
                        {renderPane(id)}
                    </React.Fragment>
                ))}
              </Suspense>
            )}
          </div>
          
          <div className="tiled-grid__panes">
            <Suspense fallback={null}>
              {rightTiledPanes.map(id => (
                  <React.Fragment key={id}>
                      {renderPane(id)}
                  </React.Fragment>
              ))}
            </Suspense>
          </div>
        </div>
      </div>

      <div className="floating-panes">
        <Suspense fallback={null}>
            {floatingPanes.map(id => (
                <React.Fragment key={id}>
                    {renderPane(id)}
                </React.Fragment>
            ))}
        </Suspense>
      </div>
    </>
  );
};
