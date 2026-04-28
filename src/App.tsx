import { useEffect } from 'react';
import { useIncidentState } from './hooks/useIncidentState';
import { ProviderOrchestrator } from './components/ProviderOrchestrator';
import { SecureGateway } from './components/SecureGateway';
import { BootScreen } from './components/BootScreen';
import { ShutdownScreen } from './components/ShutdownScreen';
import { SystemControlCluster } from './components/SystemControlCluster';
import { ApprovalModal } from './components/ApprovalModal';
import { AfterActionReport } from './components/AfterActionReport';
import './App.scss';

function AppContent() {
  const state = useIncidentState();

  useEffect(() => {
    document.body.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  if (state.appState === 'SPLASH') {
    return <SecureGateway 
        onComplete={() => state.setAppState('READY')} 
        playLoginChime={state.playLoginChime}
    />;
  }

  if (state.appState === 'BOOT') {
    return <BootScreen 
      onComplete={() => state.setAppState('SPLASH')} 
      terminalId={state.terminalId}
      playPostBeep={state.playPostBeep}
    />;
  }

  if (state.appState === 'SHUTDOWN') {
    return <ShutdownScreen 
        onComplete={() => {}} 
    />;
  }

  const handleLogout = () => {
    state.playLogoutChime();
    state.setAppState('SHUTDOWN');
    state.handleLogout();
  };

  return (
    <div className={`app app--theme-${state.theme}`}>
      {state.activeApproval && (
        <ApprovalModal 
          approval={state.activeApproval} 
          onResolve={() => state.setApproval(null)} 
          onFail={(reason) => {
            state.setTerminalHistory(prev => [
              ...prev, 
              { text: `CRITICAL_ERROR: ${reason}. MANUAL_OVERRIDE_FAILED.`, type: 'error' }
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
        <div className="pause-overlay">
          <div className="pause-overlay__content">
            <div className="pause-overlay__title">SYSTEM_PAUSED</div>
            <div className="pause-overlay__hint">SYSTEM_STATE_FROZEN</div>
            <button 
              className="pause-overlay__resume-btn"
              onClick={() => state.setIsPaused(false)}
            >
              RESUME_OPERATIONS
            </button>
          </div>
        </div>
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
