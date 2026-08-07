import React, { Suspense, lazy } from 'react';
import type { ScreenId } from '../hooks/useScreenManager';
import type { Severity, Stack } from '../data/incidents';
import type { ChatMessage, Objective, Theme } from '../contexts/types';
import type { Scenario } from '../data/scenarios/types';
import '../styles/ScreenContainer.scss';

// Lazy load screen components
const ChatPane = lazy(() => import('./ChatPane').then(m => ({ default: m.ChatPane })));
const OutageMap = lazy(() => import('./OutageMap').then(m => ({ default: m.OutageMap })));
const SystemLog = lazy(() => import('./SystemLog').then(m => ({ default: m.SystemLog })));
const BurnRateDashboard = lazy(() => import('./BurnRateDashboard').then(m => ({ default: m.BurnRateDashboard })));
const DeploymentStatus = lazy(() => import('./DeploymentStatus').then(m => ({ default: m.DeploymentStatus })));
const SettingsPane = lazy(() => import('./SettingsPane').then(m => ({ default: m.SettingsPane })));
const ScenarioPane = lazy(() => import('./ScenarioPane').then(m => ({ default: m.ScenarioPane })));
const IncidentPlaybookPane = lazy(() => import('./IncidentPlaybookPane').then(m => ({ default: m.IncidentPlaybookPane })));
const ReadoutBox = lazy(() => import('./ReadoutBox').then(m => ({ default: m.ReadoutBox })));
const HowToPane = lazy(() => import('./HowToPane').then(m => ({ default: m.HowToPane })));
const TacticalOverview = lazy(() => import('./TacticalOverview').then(m => ({ default: m.TacticalOverview })));

interface ScreenContainerProps {
  activeScreen: ScreenId;
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  // Chat
  messages: ChatMessage[];
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean, bio?: string) => void;
  typingUsers: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  operatorName: string;
  // Logs
  logMultiplier: number;
  ticketId: string;
  // Settings
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Scenarios
  onSelectScenario: (scenario: Scenario) => void;
  activeScenario: Scenario | null;
  completedScenarios: string[];
  activeObjective: Objective | null;
  // Readout
  incidentReport: string;
  setIncidentReport: (report: string) => void;
  displayText: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  // Money
  moneyLost: number;
}

/**
 * Props for legacy Pane compatibility in screen mode.
 * The screenMode flag tells Pane to render without window controls.
 */
const legacyPaneProps = {
  zIndex: 1,
  onFocus: () => {},
  isActive: true,
  onClose: () => {},
  isMinimized: false,
  onMinimizeToggle: () => {},
  screenMode: true,
};

/**
 * ScreenContainer renders the active screen content.
 * Only one screen is visible at a time, taking full available height.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  activeScreen,
  severity,
  stack,
  isDeclared,
  messages,
  sendMessage,
  typingUsers,
  markAsRead,
  markAllAsRead,
  operatorName,
  logMultiplier,
  ticketId,
  theme,
  setTheme,
  onSelectScenario,
  activeScenario,
  completedScenarios,
  activeObjective,
  incidentReport,
  setIncidentReport,
  displayText,
  scrollRef,
  moneyLost,
}) => {
  const renderScreen = () => {
    switch (activeScreen) {
      case 'logs':
        return (
          <SystemLog
            {...legacyPaneProps}
            severity={severity}
            logMultiplier={logMultiplier}
            terminalId={ticketId}
          />
        );

      case 'deploy':
        return (
          <DeploymentStatus
            {...legacyPaneProps}
            severity={severity}
            stack={stack}
          />
        );

      case 'chat':
        return (
          <ChatPane
            {...legacyPaneProps}
            messages={messages}
            sendMessage={sendMessage}
            typingUsers={typingUsers}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            isDeclared={isDeclared}
            operatorName={operatorName}
          />
        );

      case 'tactical':
        return (
          <TacticalOverview
            severity={severity}
            stack={stack}
            isDeclared={isDeclared}
            activeScenario={activeScenario}
            objective={activeObjective}
          />
        );

      case 'map':
        return (
          <OutageMap
            {...legacyPaneProps}
            severity={severity}
          />
        );

      case 'burn':
        return (
          <BurnRateDashboard
            {...legacyPaneProps}
            severity={severity}
            moneyLost={moneyLost}
          />
        );

      case 'playbooks':
        return (
          <ScenarioPane
            {...legacyPaneProps}
            onSelectScenario={onSelectScenario}
            completedScenarios={completedScenarios}
          />
        );

      case 'incidentPlaybook':
        return (
          <IncidentPlaybookPane
            {...legacyPaneProps}
            activeScenario={activeScenario}
          />
        );

      case 'readout':
        if (!incidentReport || incidentReport === 'HELP_DISPLAYED' || incidentReport.startsWith('COMMAND_NOT_RECOGNIZED')) {
          return (
            <div className="screen-container__empty">
              <span className="screen-container__empty-text">NO_ACTIVE_READOUT</span>
              <span className="screen-container__empty-hint">Generate a strategy report to view readout</span>
            </div>
          );
        }
        return (
          <ReadoutBox
            {...legacyPaneProps}
            title="INCIDENT_PLAYBOOK_GENERATED"
            label="AUTOMATED_RESPONSE_STRATEGY"
            metadata={{
              version: 'v1.0.0',
              source: 'REPORT_SERVICE',
              authority: 'SYSTEM_GENERATED'
            }}
            contentRef={scrollRef}
            headerRight={
              <button 
                className="screen-container__clear-btn"
                onClick={() => setIncidentReport('')}
              >
                [ CLEAR_READOUT ]
              </button>
            }
          >
            <div style={{ position: 'relative' }}>
              {displayText}
              {displayText === incidentReport && (
                <div className="readout-box__workflow">
                  <div className="readout-box__workflow-header">{'>>>'} REQUIRED_RESOLUTION_WORKFLOW {'<<<'}</div>
                  <div className="readout-box__workflow-step">[1] EXECUTE MITIGATION: Route traffic via Outage Map [^5] OR authorize system overrides.</div>
                  <div className="readout-box__workflow-step">[2] STABILIZE: Resolve crashing pod loops via K8s Status [^2].</div>
                  <div className="readout-box__workflow-step">[3] RESOLUTION: Once status board is GREEN, type 'resolve' in terminal.</div>
                </div>
              )}
            </div>
          </ReadoutBox>
        );

      case 'settings':
        return (
          <SettingsPane
            {...legacyPaneProps}
            currentTheme={theme}
            setTheme={setTheme}
          />
        );

      case 'howTo':
        return (
          <HowToPane
            {...legacyPaneProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="screen-container">
      <Suspense fallback={<div className="screen-container__loading">LOADING...</div>}>
        {renderScreen()}
      </Suspense>
    </div>
  );
};
