import { useEffect, useState } from 'react';
import './App.scss';
import './styles/terminal.scss';
import { AccessDenied } from './components/AccessDenied';
import { BootScreen } from './components/BootScreen';
import { SecureGateway } from './components/SecureGateway';
import { ShutdownScreen } from './components/ShutdownScreen';
import { SystemControlCluster } from './components/SystemControlCluster';
import { ApprovalModal } from './components/ApprovalModal';
import { AfterActionReport } from './components/AfterActionReport';
import { useIncidentState } from './hooks/useIncidentState';

const MOBILE_THRESHOLD = 768;

function App() {
  const state = useIncidentState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const isMobile = windowWidth <= MOBILE_THRESHOLD;

    if (isMobile && state.appState !== 'SHUTDOWN') {
      // In a real app we might show a "use desktop" message, 
      // but for smokescreen we just let it be or handle it in CSS.
    }
  }, [windowWidth, state]);

  if (state.appState === 'SHUTDOWN') {
    return <ShutdownScreen onComplete={() => window.location.reload()} />;
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
        gameMode={state.gameMode}
        setGameMode={state.setGameMode}
        stack={state.stack}
        setStack={state.loggedSetStack}
        selectedPlaybookId={state.selectedPlaybookId}
        setSelectedPlaybookId={state.setSelectedPlaybookId}
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
    <div className={`crt-container ${state.isChaos ? 'glitch' : ''} ${state.isTransitioning ? 'crt-boot' : ''} ${state.isDeclared ? 'simulation-chaotic' : ''}`}>
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
          score={state.lastScoreEarned} 
          mitigations={state.mitigationCount} 
          moneyLost={state.moneyLost}
          onAcknowledge={state.executeCeaseTheatre} 
        />
      )}
      <SystemControlCluster 
        panes={state.panes}
        minimizedPanes={state.minimizedPanes}
        zIndices={state.zIndices}
        poppedOutPanes={state.poppedOutPanes}
        snappedMainPanes={state.snappedMainPanes}
        togglePopOut={state.togglePopOut}
        toggleSnapMain={state.toggleSnapMain}
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
        moneyLost={state.moneyLost}
        theme={state.theme}
        setTheme={state.setTheme}
        handleLogout={state.handleLogout}
        typingUsers={state.typingUsers}
        handleCommand={state.handleCommand}
        loggedCeaseTheatre={state.loggedCeaseTheatre}
        commands={state.commands}
        commandHistory={state.commandHistory}
        isChaos={state.isChaos}
        incidentReport={state.incidentReport}
        setIncidentReport={state.setIncidentReport}
        terminalHistory={state.terminalHistory}
        setTerminalHistory={state.setTerminalHistory}
        displayText={state.displayText}
        setView={state.setView}
        activePlaybook={state.activePlaybook}
        startPlaybook={state.startPlaybook}
        stopPlaybook={state.stopPlaybook}
        markAsRead={state.markAsRead}
        markAllAsRead={state.markAllAsRead}
        isEcoMode={state.isEcoMode}
        setIsEcoMode={state.setIsEcoMode}
        chatMultiplier={state.chatMultiplier}
        setChatMultiplier={state.setChatMultiplier}
        logMultiplier={state.logMultiplier}
        setLogMultiplier={state.setLogMultiplier}
        loggedHandleDeclare={state.loggedHandleDeclare}
        gameMode={state.gameMode}
        activeObjective={state.activeObjective}
        mitigationCount={state.mitigationCount}
        unreadChat={state.unreadChat}
      />
    </div>
  );
}

export default App;