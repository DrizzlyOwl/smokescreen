import './App.scss';
import './styles/terminal.scss';
import { AccessDenied } from './components/AccessDenied';
import { BootScreen } from './components/BootScreen';
import { MobilePager } from './components/MobilePager';
import { SecureGateway } from './components/SecureGateway';
import { ShutdownScreen } from './components/ShutdownScreen';
import { SystemControlCluster } from './components/SystemControlCluster';
import { useIncidentState } from './hooks/useIncidentState';

function App() {
  const state = useIncidentState();

  if (state.appState === 'SHUTDOWN') {
    return <ShutdownScreen onComplete={() => window.location.reload()} />;
  }

  if (state.appState === 'MOBILE_PAGER') {
    return (
      <MobilePager 
        uplinkId={state.uplinkId} 
        initialSeverity={state.severity}
        initialStack={state.stack}
      />
    );
  }

  if (state.appState === 'SPLASH') {
    return (
      <SecureGateway 
        operatorName={state.operatorName}
        setOperatorName={state.setOperatorName}
        setAppState={state.setAppState}
        theme={state.theme}
        clientStats={state.clientStats}
        isEcoMode={state.isEcoMode}
        setIsEcoMode={state.setIsEcoMode}
      />
    );
  }

  if (state.appState === 'BOOT') {
    return (
      <BootScreen 
        operatorName={state.operatorName} 
        uplinkId={state.uplinkId}
        onComplete={() => state.setAppState('READY')} 
        playPostBeep={state.playPostBeep}
      />
    );
  }

  if (state.view === 'TICKET') {
    return (
      <AccessDenied 
        ticketId={state.ticketId} 
        onBack={() => state.setView('HOME')} 
      />
    );
  }

  return (
    <div className={`crt-container ${state.isChaos ? 'glitch' : ''}`}>
      <SystemControlCluster 
        panes={state.panes}
        minimizedPanes={state.minimizedPanes}
        zIndices={state.zIndices}
        activePane={state.activePane}
        bringToFront={state.bringToFront}
        loggedTogglePane={state.loggedTogglePane}
        toggleMinimize={state.toggleMinimize}
        messages={state.messages}
        sendMessage={state.sendMessage}
        isDeclared={state.isDeclared}
        operatorName={state.operatorName}
        uplinkId={state.uplinkId}
        severity={state.severity}
        stack={state.stack}
        status={state.status}
        systemMetrics={state.systemMetrics}
        moneyLost={state.moneyLost}
        isTransitioning={state.isTransitioning}
        theme={state.theme}
        setTheme={state.setTheme}
        handleLogout={state.handleLogout}
        unreadChat={state.unreadChat}
        typingUsers={state.typingUsers}
        isDebugMode={state.isDebugMode}
        loggedSetStack={state.loggedSetStack}
        loggedSetSeverity={state.loggedSetSeverity}
        handleCommand={state.handleCommand}
        isSlowBurn={state.isSlowBurn}
        isChaos={state.isChaos}
        slowBurnCountdown={state.slowBurnCountdown}
        loggedSetIsSlowBurn={state.loggedSetIsSlowBurn}
        loggedCeaseTheatre={state.loggedCeaseTheatre}
        loggedHandleDeclare={state.loggedHandleDeclare}
        incidentReport={state.incidentReport}
        setIncidentReport={state.setIncidentReport}
        terminalHistory={state.terminalHistory}
        setTerminalHistory={state.setTerminalHistory}
        displayText={state.displayText}
        setView={state.setView}
        appState={state.appState}
        easterEggs={state.easterEggs}
        activePlaybook={state.activePlaybook}
        startPlaybook={state.startPlaybook}
        stopPlaybook={state.stopPlaybook}
        markAsRead={state.markAsRead}
        markAllAsRead={state.markAllAsRead}
        isEcoMode={state.isEcoMode}
        setIsEcoMode={state.setIsEcoMode}
      />
    </div>
  );
}

export default App;
