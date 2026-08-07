import { useEffect } from 'react';
import { useIncidentState } from './hooks/useIncidentState';
import { ProviderOrchestrator } from './components/ProviderOrchestrator';
import { SecureGateway } from './components/SecureGateway';
import { BootScreen } from './components/BootScreen';
import { ShutdownScreen } from './components/ShutdownScreen';
import { TerminationScreen } from './components/TerminationScreen';
import { SystemControlCluster } from './components/SystemControlCluster';
import { ApprovalModal } from './components/ApprovalModal';
import { AfterActionReport } from './components/AfterActionReport';
import { PauseScreen } from './components/PauseScreen';
import { useDebugLogger } from './hooks/useDebugLogger';
import './App.scss';

function AppContent() {
  const state = useIncidentState();
  const { log } = useDebugLogger();

  useEffect(() => {
    document.body.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  if (state.appState === 'SPLASH') {
    return <SecureGateway
        onComplete={() => {
            log('SYSTEM', 'GATEWAY_SUCCESS');
            state.setAppState('READY');
        }}
        playLoginChime={state.playLoginChime}
        playDegauss={state.playDegauss}
    />;  }

  if (state.appState === 'BOOT') {
    return <BootScreen 
      onComplete={() => {
        log('BOOT', 'BIOS_COMPLETE');
        state.setAppState('SPLASH');
      }} 
      terminalId={state.terminalId}
      playPostBeep={state.playPostBeep}
    />;
  }

  if (state.appState === 'SHUTDOWN') {
    return <ShutdownScreen 
        onComplete={() => {}} 
    />;
  }

  if (state.appState === 'TERMINATED') {
    return <TerminationScreen />;
  }

  const handleLogout = () => {
    log('SYSTEM', 'SHUTDOWN_INITIATED');
    state.playLogoutChime();
    state.setAppState('SHUTDOWN');
    state.handleLogout();
  };

  return (
    <div className={`app app--theme-${state.theme}`}>
      {state.activeApproval && (
        <ApprovalModal 
          approval={state.activeApproval} 
          onResolve={() => {
            state.setApproval(null);
            state.resumeScenario();
          }} 
          onFail={(reason) => {
            state.deductStrike();
            state.setTerminalHistory(prev => [
              ...prev, 
              { text: `CRITICAL_ERROR: ${reason}. MANUAL_OVERRIDE_FAILED | STRIKE_DEDUCTED`, type: 'error' }
            ]);
          }}
        />
      )}

      {state.isResolving && (
        <AfterActionReport 
          severity={state.severity}
          stack={state.stack}
          mitigations={state.mitigationCount}
          mitigationScore={state.lastScoreEarned}
          moneyLost={state.moneyLost}
          onClose={state.executeCeaseTheatre}
        />
      )}

      <SystemControlCluster 
        severity={state.severity}
        stack={state.stack}
        isDeclared={state.isDeclared}
        isEcoMode={state.isEcoMode}
        setIsEcoMode={state.setIsEcoMode}
        gameMode={state.gameMode}
        activeObjective={state.activeObjective}
        currentEventIndex={state.currentEventIndex}
        addCommandToHistory={state.addCommandToHistory}
        markAsRead={state.markAsRead}
        markAllAsRead={state.markAllAsRead}
        playLoginChime={state.playLoginChime}
        playLogoutChime={state.playLogoutChime}
        playPostBeep={state.playPostBeep}
        playMitigationSuccess={state.playMitigationSuccess}
        stopAllSounds={state.stopAllSounds}
        isAudioOn={state.isAudioOn}
        setIsAudioOn={state.setIsAudioOn}
        ticketId={state.ticketId}
        activeApproval={state.activeApproval}
        setApproval={state.setApproval}
        activeOverride={state.activeOverride}
        setOverride={state.setOverride}
        setObjective={state.setObjective}
        startScenario={state.startScenario}
        stopScenario={state.stopScenario}
        resumeScenario={state.resumeScenario}
        isChaos={state.isChaos}
        setIsChaos={state.setIsChaos}
        activeBeacons={state.activeBeacons}
        addBeacon={state.addBeacon}
        displayText={state.displayText}
        setDisplayText={state.setDisplayText}
        logMultiplier={state.logMultiplier}
        setLogMultiplier={state.setLogMultiplier}
        chatMultiplier={state.chatMultiplier}
        setChatMultiplier={state.setChatMultiplier}
        setIsResolving={state.setIsResolving}
        setIsDebugMode={state.setIsDebugMode}
        isPaused={state.isPaused}
        setIsPaused={state.setIsPaused}
        operatorName={state.operatorName}
        activeScenario={state.activeScenario}
        completedScenarios={state.completedScenarios}
        handleCommand={state.handleCommand}
        handleLogout={handleLogout}
        moneyLost={state.moneyLost}
        lastScoreEarned={state.lastScoreEarned}
        terminalId={state.terminalId}
        messages={state.messages}
        sendMessage={state.sendMessage}
        typingUsers={state.typingUsers}
        commands={state.commands}
        handleResolve={state.handleResolve}
        executeCeaseTheatre={state.executeCeaseTheatre}
        incidentReport={state.incidentReport}
        setIncidentReport={state.setIncidentReport}
        terminalHistory={state.terminalHistory}
        setTerminalHistory={state.setTerminalHistory}
        commandHistory={state.commandHistory}
        isDeployStabilized={state.isDeployStabilized}
        theme={state.theme}
        setTheme={state.setTheme}
        unreadChat={state.unreadChat}
        mitigationCount={state.mitigationCount}
        declareIncident={state.declareIncident}
        loggedHandleDeclare={state.loggedHandleDeclare}
      />
      
      {state.isPaused && (
        <PauseScreen onResume={() => state.setIsPaused(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ProviderOrchestrator>
      <AppContent />
    </ProviderOrchestrator>
  );
}

export default App;
