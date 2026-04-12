import { useEffect, useState } from 'react';
import './App.scss';
import './styles/terminal.scss';
import { AccessDenied } from './components/AccessDenied';
import { BootScreen } from './components/BootScreen';
import { MobilePager } from './components/MobilePager';
import { SecureGateway } from './components/SecureGateway';
import { ShutdownScreen } from './components/ShutdownScreen';
import { SystemControlCluster } from './components/SystemControlCluster';
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
    // If we're on a small screen and not in a state that should override it, 
    // switch to the mobile pager view.
    const isMobile = windowWidth <= MOBILE_THRESHOLD;
    const isPagerParamSet = new URLSearchParams(window.location.search).has('pager');
    
    if (isMobile && state.appState !== 'MOBILE_PAGER' && state.appState !== 'SHUTDOWN') {
      state.setAppState('MOBILE_PAGER');
    } else if (!isMobile && state.appState === 'MOBILE_PAGER' && !isPagerParamSet) {
      // If we resized back to desktop and didn't manually request the pager, go back to splash
      state.setAppState('SPLASH');
    }
  }, [windowWidth, state]);

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
    <div className={`crt-container ${state.isChaos ? 'glitch' : ''} ${state.isTransitioning ? 'crt-boot' : ''} ${state.isDeclared ? 'simulation-chaotic' : ''}`}>
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
      />
    </div>
  );
}

export default App;
