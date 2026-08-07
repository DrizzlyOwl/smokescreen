import React, { Suspense, lazy } from 'react';
import { Button } from './Button';
import type { TerminalLine } from '../store/useIncidentStore';
import type { ChatMessage } from '../contexts/types';
import type { PaneId, PanesState } from '../hooks/useWindowManager';
import type { Severity, Stack } from '../data/incidents';
import type { Theme } from '../contexts/types';
import { useIncidentStore } from '../store/useIncidentStore';
import { TacticalOverview } from './TacticalOverview';

// Lazy load panes
const ChatPane = lazy(() => import('./ChatPane').then(m => ({ default: m.ChatPane })));
const OutageMap = lazy(() => import('./OutageMap').then(m => ({ default: m.OutageMap })));
const SystemLog = lazy(() => import('./SystemLog').then(m => ({ default: m.SystemLog })));
const BurnRateDashboard = lazy(() => import('./BurnRateDashboard').then(m => ({ default: m.BurnRateDashboard })));
const DeploymentStatus = lazy(() => import('./DeploymentStatus').then(m => ({ default: m.DeploymentStatus })));
const SettingsPane = lazy(() => import('./SettingsPane').then(m => ({ default: m.SettingsPane })));
const ScenarioPane = lazy(() => import('./ScenarioPane').then(m => ({ default: m.ScenarioPane })));
const IncidentPlaybookPane = lazy(() => import('./IncidentPlaybookPane').then(m => ({ default: m.IncidentPlaybookPane })));
const ReadoutBox = lazy(() => import('./ReadoutBox').then(m => ({ default: m.ReadoutBox })));
const DebugConsole = lazy(() => import('./DebugConsole').then(m => ({ default: m.DebugConsole })));
const HowToPane = lazy(() => import('./HowToPane').then(m => ({ default: m.HowToPane })));
const TerminalPane = lazy(() => import('./TerminalPane').then(m => ({ default: m.TerminalPane })));

import type { Command } from '../hooks/useCommandRegistry';
import type { Scenario } from '../data/scenarios/types';

interface PaneGridProps {
  panes: PanesState;
  minimizedPanes: Record<PaneId, boolean>;
  zIndices: Record<PaneId, number>;
  poppedOutPanes: Record<PaneId, boolean>;
  snappedMainPanes: Record<PaneId, boolean>;
  activePane: PaneId | null;
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  incidentReport: string;
  setIncidentReport: (report: string) => void;
  terminalHistory: TerminalLine[];
  onCommand: (cmd: string) => boolean;
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  commandHistory: string[];
  commands: Command[];
  operatorName: string;
  onFocus: (id: PaneId) => void;
  onClose: (id: PaneId) => void;
  toggleMinimize: (id: PaneId) => void;
  onPopOutToggle: (id: PaneId) => void;
  onSnapMainToggle: (id: PaneId) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean, bio?: string) => void;
  typingUsers: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  activeScenario: Scenario | null;
  completedScenarios: string[];
  activeObjective: import('../contexts/types').Objective | null;
  displayText: string;
  setDisplayText: (text: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  logMultiplier: number;
}

export const PaneGrid: React.FC<PaneGridProps> = ({
  panes,
  minimizedPanes,
  zIndices,
  poppedOutPanes,
  snappedMainPanes,
  activePane,
  severity,
  stack,
  isDeclared,
  incidentReport,
  setIncidentReport,
  terminalHistory,
  onCommand,
  setTerminalHistory,
  commandHistory,
  commands,
  operatorName,
  onFocus,
  onClose,
  toggleMinimize,
  onPopOutToggle,
  onSnapMainToggle,
  theme,
  setTheme,
  messages,
  sendMessage,
  typingUsers,
  markAsRead,
  markAllAsRead,
  onSelectScenario,
  activeScenario,
  completedScenarios,
  activeObjective,
  displayText,
  scrollRef,
  logMultiplier
}) => {
  const moneyLost = useIncidentStore(state => state.moneyLost);
  const ticketId = useIncidentStore(state => state.ticketId);

  const renderPane = (id: PaneId) => {
    const commonProps = {
      zIndex: zIndices[id],
      onFocus: () => onFocus(id),
      isActive: activePane === id,
      onClose: () => onClose(id),
      isMinimized: minimizedPanes[id],
      onMinimizeToggle: () => toggleMinimize(id),
      isPoppedOut: poppedOutPanes[id],
      onPopOutToggle: () => onPopOutToggle(id),
      isSnappedMain: snappedMainPanes[id],
      onSnapMainToggle: () => onSnapMainToggle(id),
    };

    switch (id) {
      case 'terminal':
        return <TerminalPane 
          key={id}
          {...commonProps} 
          terminalHistory={terminalHistory}
          onCommand={onCommand}
          setTerminalHistory={setTerminalHistory}
          commandHistory={commandHistory}
          commands={commands}
          operatorName={operatorName}
        />;
      case 'chat':
        return <ChatPane 
          key={id}
          {...commonProps}
          messages={messages}
          sendMessage={sendMessage}
          typingUsers={typingUsers}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          isDeclared={isDeclared}
          operatorName={operatorName}
        />;
      case 'logs':
        return <SystemLog 
          key={id}
          {...commonProps}
          severity={severity}
          logMultiplier={logMultiplier}
          terminalId={ticketId}
        />;
      case 'map':
        return <OutageMap 
          key={id}
          {...commonProps}
          severity={severity} 
        />;
      case 'burn':
        return <BurnRateDashboard 
          key={id}
          {...commonProps}
          severity={severity} 
          moneyLost={moneyLost}
        />;
      case 'deploy':
        return <DeploymentStatus 
          key={id}
          {...commonProps}
          severity={severity} 
          stack={stack}
          initialPos={{ x: 1020, y: 200 }}
        />;
      case 'settings':
        return <SettingsPane 
          key={id}
          {...commonProps}
          currentTheme={theme} 
          setTheme={setTheme} 
        />;
      case 'playbooks':
        return <ScenarioPane 
          key={id}
          {...commonProps}
          onSelectScenario={onSelectScenario}
          completedScenarios={completedScenarios}
        />;
      case 'incidentPlaybook':
        return <IncidentPlaybookPane 
          key={id}
          {...commonProps}
          activeScenario={activeScenario}
        />;
      case 'howTo':
        return <HowToPane 
          key={id}
          {...commonProps}
          initialPos={{ x: 50, y: 100 }}
        />;
      case 'readout':
        if (!incidentReport || incidentReport === 'HELP_DISPLAYED' || incidentReport.startsWith('COMMAND_NOT_RECOGNIZED')) return null;
        return <ReadoutBox 
          key={id}
          {...commonProps}
          title="INCIDENT_PLAYBOOK_GENERATED"
          label="AUTOMATED_RESPONSE_STRATEGY"
          initialPos={{ x: 600, y: 150 }}
          metadata={{
            version: 'v1.0.0',
            source: 'REPORT_SERVICE',
            authority: 'SYSTEM_GENERATED'
          }}
          headerRight={
            <div className="readout-box__header-actions">
              <Button onClick={() => setIncidentReport('')} size="x-small" variant="ghost">[ CLEAR_READOUT ]</Button>
            </div>
          }
          contentRef={scrollRef}
        >
          <div style={{ position: 'relative' }}>
            {displayText}
            {displayText === incidentReport && (
                 <div className="readout-box__workflow">
                   <div className="readout-box__workflow-header">{'>>>'} REQUIRED_RESOLUTION_WORKFLOW {'<<<'}</div>
                   <div className="readout-box__workflow-step">[1] EXECUTE MITIGATION: Route traffic via Outage Map [F3] OR authorize system overrides.</div>
                   <div className="readout-box__workflow-step">[2] STABILIZE: Resolve crashing pod loops via K8s Status [F2].</div>
                   <div className="readout-box__workflow-step">[3] RESOLUTION: Once status board is GREEN, type 'resolve' in terminal.</div>
                 </div>
            )}
          </div>
        </ReadoutBox>;
      case 'debug':
        return <DebugConsole key={id} {...commonProps} />;
      default:
        return null;
    }
  };

  const paneIds: PaneId[] = ['chat', 'logs', 'map', 'deploy', 'burn', 'howTo', 'settings', 'playbooks', 'incidentPlaybook', 'readout', 'terminal', 'debug'];
  const tiledPanes = paneIds.filter(id => panes[id] && !poppedOutPanes[id]);
  const mainSnappedPanes = tiledPanes.filter(id => snappedMainPanes[id]);
  const rightTiledPanes = tiledPanes.filter(id => !snappedMainPanes[id]);
  const floatingPanes = paneIds.filter(id => panes[id] && poppedOutPanes[id]);

  return (
    <div className="cluster-content-wrapper">
        <div className="cluster-layout__main">
            <TacticalOverview 
              severity={severity}
              stack={stack}
              isDeclared={isDeclared}
              activeScenario={activeScenario}
              objective={activeObjective}
            />
            <div className="cluster-layout__snapped-layer">
                <Suspense fallback={null}>
                    {mainSnappedPanes.map(id => (
                        <React.Fragment key={id}>
                            {renderPane(id)}
                        </React.Fragment>
                    ))}
                </Suspense>
            </div>
        </div>
        <div className="cluster-layout__right">
            <Suspense fallback={null}>
                {rightTiledPanes.map(id => (
                    <React.Fragment key={id}>
                        {renderPane(id)}
                    </React.Fragment>
                ))}
            </Suspense>
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
    </div>
  );
};
