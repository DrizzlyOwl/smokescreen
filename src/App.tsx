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
        {...state}
        handleLogout={handleLogout}
        onSnapMainToggle={state.onSnapMainToggle}
        onPopOutToggle={state.onPopOutToggle}
        toggleMinimize={state.toggleMinimize}
        bringToFront={state.onFocus}
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
