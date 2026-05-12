import { useCallback, useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore, type TerminalLine, type CommandResult } from '../store/useIncidentStore';
import { useAudioStore } from '../store/useAudioStore';
import { useWindowManager, type PaneId } from './useWindowManager';
import { useAudio as useAudioHook } from './useAudio';
import { useDebugLogger } from './useDebugLogger';
import { useScenarioEngine } from './useScenarioEngine';
import { useIncidentChat } from './useIncidentChat';
import { useCommandRegistry } from './useCommandRegistry';
import { useUrlSync } from './useUrlSync';
import { useChaosEvents } from './useChaosEvents';
import { useOnboarding } from './useOnboarding';
import type { Severity, Stack } from '../data/incidents';
import { SCENARIOS } from '../data/scenarios';

export type { TerminalLine, CommandResult };

export const useIncidentState = () => {
  const { log } = useDebugLogger();
  
  const terminalStore = useTerminalStore();
  const incidentStore = useIncidentStore();
  const audioStore = useAudioStore();

  const { 
    playAlert, 
    playLoginChime, 
    playLogoutChime, 
    playPostBeep, 
    playMitigationSuccess,
    playSimplePing,
    playDirectPing,
    playDegauss,
    stopAllSounds 
  } = useAudioHook();

  const windowManager = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, howTo: !localStorage.getItem('smokescreen_visited'), settings: false, playbooks: false, incidentPlaybook: false, readout: false, terminal: true, debug: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const loggedTogglePane = useCallback((id: PaneId) => {
    log('WINDOW', `TOGGLE ${id}`);
    windowManager.togglePane(id);
    if (!windowManager.panes[id]) incidentStore.removeBeacon(id);
  }, [windowManager, incidentStore, log]);

  const loggedSetStack = useCallback((s: Stack) => {
    log('INCIDENT', `SET_STACK ${s}`);
    incidentStore.setStack(s);
  }, [incidentStore, log]);

  const loggedSetSeverity = useCallback((s: Severity) => {
    log('INCIDENT', `SET_SEVERITY ${s}`);
    incidentStore.setSeverity(s);
  }, [incidentStore, log]);

  const loggedSetIsSlowBurn = useCallback((on: boolean) => {
    log('SYSTEM', `SET_SLOWBURN ${on}`);
    incidentStore.setIsSlowBurn(on);
  }, [incidentStore, log]);

  const loggedHandleDeclare = useCallback(() => {
    log('INCIDENT', 'DECLARE_INCIDENT');
    incidentStore.declareIncident(playAlert);
  }, [incidentStore, playAlert, log]);

  const handleCommandCease = useCallback(() => {
    const state = useIncidentStore.getState();
    if (state.isDeclared && state.mitigationCount === 0) {
        log('CMD', 'RESOLVE_DENIED', 'MITIGATION_REQUIRED');
        incidentStore.addTerminalLine({ text: 'ERROR: RESOLUTION DENIED. MITIGATION REQUIRED.', type: 'error' });
        return;
    }
    log('INCIDENT', 'START_RESOLUTION_SEQUENCE');
    incidentStore.setIsResolving(true);
  }, [incidentStore, log]);

  const handleNewChatMessage = useCallback(() => {}, []);

  const { messages, sendMessage, typingUsers, markAsRead, markAllAsRead } = useIncidentChat(
    incidentStore.severity, 
    incidentStore.stack, 
    terminalStore.operatorName, 
    terminalStore.terminalId, 
    handleNewChatMessage, 
    playSimplePing, 
    playDirectPing,
    windowManager.panes.chat && !windowManager.minimizedPanes.chat,
    windowManager.activePane === 'chat',
    incidentStore.chatMultiplier,
    log
  );

  // Use domain-specific hooks
  useChaosEvents({ sendMessage });
  useOnboarding();

  const { startScenario, stopScenario, resumeScenario, currentEventIndex, activeScenario, isWaiting } = useScenarioEngine({
    sendMessage,
    injectLog: (msg) => { window.dispatchEvent(new CustomEvent('INJECT_LOG', { detail: msg })); },
    setSeverity: loggedSetSeverity,
    setIsChaos: incidentStore.setIsChaos,
    addBeacon: incidentStore.addBeacon,
    triggerApproval: (type) => {
        log('SCENARIO', `TRIGGER_APPROVAL ${type || 'PHRASE'}`);
        incidentStore.setApproval({ id: Math.random().toString(), type: type || 'phrase', message: 'Scenario Auth' });
    },
    triggerOverride: () => {
        log('SCENARIO', 'TRIGGER_OVERRIDE');
        incidentStore.setOverride({ code: Math.random().toString(36).substring(2, 8).toUpperCase(), message: 'MANUAL OVERRIDE REQUIRED' });
    },
    triggerInterrupt: () => {},
    setObjective: (obj) => {
        log('SCENARIO', `SET_OBJECTIVE ${obj?.title || 'NULL'}`);
        incidentStore.setObjective(obj);
    },
    declareIncident: loggedHandleDeclare,
    stack: incidentStore.stack,
    operatorName: terminalStore.operatorName
  });

  const loggedCeaseTheatre = useCallback(() => {
    log('INCIDENT', 'CEASE_THEATRE');
    
    // Mark scenario as completed if a scenario was active
    if (activeScenario) {
      log('SCENARIO', 'SCENARIO_COMPLETED', activeScenario.id);
      terminalStore.markScenarioCompleted(activeScenario.id);
    }

    incidentStore.ceaseTheatre();
    if (incidentStore.onboardingStep === 4) {
        incidentStore.setOnboardingStep(-1);
    }
  }, [incidentStore, activeScenario, terminalStore, log]);

  const { commands, handleCommand: internalHandleCommand } = useCommandRegistry({
    gameMode: incidentStore.gameMode,
    togglePane: loggedTogglePane,
    openPane: (id) => {
        log('WINDOW', `OPEN ${id}`);
        windowManager.openPane(id);
    },
    closePane: (id) => {
        log('WINDOW', `CLOSE ${id}`);
        windowManager.closePane(id);
    },
    openAll: () => {
        log('WINDOW', 'OPEN_ALL');
        windowManager.openAll();
    },
    closeAll: () => {
        log('WINDOW', 'CLOSE_ALL');
        windowManager.closeAll();
    },
    setStack: loggedSetStack,
    setSeverity: loggedSetSeverity,
    setSlowBurn: loggedSetIsSlowBurn,
    handleCease: handleCommandCease,
    handleDeclare: loggedHandleDeclare,
    handleEject: loggedHandleDeclare,
    help: () => { 
        log('CMD', 'HELP_DISPLAYED');
        incidentStore.setIncidentReport('HELP_DISPLAYED'); 
        incidentStore.setDisplayText('MANUAL_LOADED'); 
    },
    incrementMitigationCount: () => {
        log('INCIDENT', 'MITIGATION_COUNT_INCREMENTED');
        incidentStore.incrementMitigationCount();
    },
    setLogMultiplier: (m: number) => {
        log('SYSTEM', `SET_LOG_MULTIPLIER ${m}`);
        incidentStore.setLogMultiplier(m);
    },
    setChatMultiplier: (m: number) => {
        log('SYSTEM', `SET_CHAT_MULTIPLIER ${m}`);
        incidentStore.setChatMultiplier(m);
    },
    setEcoMode: (on) => {
        log('SYSTEM', `SET_ECO_MODE ${on}`);
        terminalStore.setIsEcoMode(on);
    },
    setIsDebugMode: (on) => {
        log('SYSTEM', `SET_DEBUG_MODE ${on}`);
        terminalStore.setIsDebugMode(on);
    },
    getDiagnosticToken: () => useIncidentStore.getState().diagnosticToken,
    setAudio: (on) => {
        log('AUDIO', `SET_AUDIO_ENABLED ${on}`);
        audioStore.setIsAudioOn(on);
    },
    setIsChaos: (on) => {
        log('CHAOS', `SET_CHAOS_ENABLED ${on}`);
        incidentStore.setIsChaos(on);
    },
    mitigationCount: incidentStore.mitigationCount,
    isDeclared: incidentStore.isDeclared,
    getMitigationCount: () => useIncidentStore.getState().mitigationCount,
    getIsDeclared: () => useIncidentStore.getState().isDeclared,
    getIncidentReport: () => useIncidentStore.getState().incidentReport,
    generateStrategy: incidentStore.generateStrategy,
    scenarios: SCENARIOS,
    startScenario: (id: string) => {
        const scenario = SCENARIOS[id];
        if (scenario) startScenario(scenario);
    },
    playDegauss,
    clearInterruption: () => {
        log('INCIDENT', 'CLEAR_INTERRUPTION');
        incidentStore.setInterruption(null);
    },
    handlePhraseApprove: (phrase: string) => {
        const active = incidentStore.activeApproval;
        if (active && active.type === 'phrase' && active.phrase?.toLowerCase() === phrase.toLowerCase()) {
            log('INCIDENT', 'PHRASE_APPROVED');
            incidentStore.setApproval(null);
            playMitigationSuccess();
            incidentStore.incrementMitigationCount();
            return { isValid: true, message: 'AUTHORIZATION_GRANTED' };
        }
        return { isValid: false, message: 'AUTHORIZATION_DENIED: INVALID_PHRASE' };
    },
    triggerApproval: (type) => {
        log('INCIDENT', `TRIGGER_APPROVAL ${type || 'PHRASE'}`);
        incidentStore.setApproval({ id: Math.random().toString(), type: type || 'phrase', message: 'Manual Auth' });
    },
    setTheme: (theme) => {
        log('SYSTEM', `SET_THEME ${theme}`);
        terminalStore.setTheme(theme);
    },
    copyPlaybook: () => {
        log('SYSTEM', 'COPY_PLAYBOOK');
        // implementation if needed
    },
    setView: (v) => {
        log('SYSTEM', `SET_VIEW ${v}`);
        incidentStore.setView(v);
    },
    handleLogout: () => {
        log('SYSTEM', 'LOGOUT');
        playLogoutChime();
        // implement logout logic
    }
  });

  const handleCommand = useCallback((cmd: string) => {
    incidentStore.addTerminalLine({ text: cmd, type: 'command' });

    // Handle Active Override Mini-game - Use direct state access for freshness
    const state = useIncidentStore.getState();
    const activeOverride = state.activeOverride;
    if (activeOverride) {
        if (cmd.toUpperCase() === activeOverride.code.toUpperCase()) {
            log('INCIDENT', 'OVERRIDE_SUCCESS');
            incidentStore.setOverride(null);
            playMitigationSuccess();
            incidentStore.incrementMitigationCount();
            incidentStore.addTerminalLine({ text: 'MANUAL OVERRIDE GRANTED. SYSTEM STABILIZED.', type: 'output' });
            return { isValid: true, message: 'SUCCESS' };
        } else {
            log('INCIDENT', 'OVERRIDE_FAILURE');
            incidentStore.setMoneyLost(prev => prev + 5000);
            incidentStore.addTerminalLine({ text: 'ERROR: INVALID OVERRIDE CODE. FINANCIAL PENALTY INCURRED.', type: 'error' });
            return { isValid: false, message: 'INVALID_CODE' };
        }
    }

    const result = internalHandleCommand(cmd);
    
    if (result.message) {
      incidentStore.addTerminalLine({ text: result.message, type: result.isValid ? 'output' : 'error' });
    }

    // Auto-open Readout if strategy generated
    if (result.isValid && (cmd.toLowerCase().startsWith('strategy') || cmd.toLowerCase() === 'help')) {
        windowManager.openPane('readout');
    }

    // Resume scenario if waiting for a command
    if (result.isValid && isWaiting) {
        log('SCENARIO', 'RESUME_ON_CMD');
        resumeScenario();
    }

    return result;
  }, [internalHandleCommand, windowManager, isWaiting, resumeScenario, log, incidentStore, playMitigationSuccess]);

  useUrlSync({
    severity: incidentStore.severity,
    stack: incidentStore.stack,
    panes: windowManager.panes,
    theme: terminalStore.theme,
    isEcoMode: terminalStore.isEcoMode,
    isDebugMode: terminalStore.isDebugMode,
    isAudioOn: audioStore.isAudioOn
  }, (updates) => {
    if (updates.severity) incidentStore.setSeverity(updates.severity);
    if (updates.stack) incidentStore.setStack(updates.stack);
    if (updates.theme) terminalStore.setTheme(updates.theme);
    if (updates.isEcoMode !== undefined) terminalStore.setIsEcoMode(updates.isEcoMode);
    if (updates.isDebugMode !== undefined) terminalStore.setIsDebugMode(updates.isDebugMode);
    if (updates.isAudioOn !== undefined) audioStore.setIsAudioOn(updates.isAudioOn);
    if (updates.panes) {
        Object.entries(updates.panes).forEach(([id, active]) => {
            if (active) windowManager.openPane(id as PaneId);
            else windowManager.closePane(id as PaneId);
        });
    }
  });

  useEffect(() => {
    const isSlowBurn = incidentStore.isSlowBurn;
    const severity = incidentStore.severity;
    const isPaused = incidentStore.isPaused;
    const tickSlowBurn = incidentStore.tickSlowBurn;

    if (isSlowBurn && severity !== 'P0' && !isPaused) {
      const interval = setInterval(() => tickSlowBurn(playAlert, loggedHandleDeclare), 1000);
      return () => clearInterval(interval);
    }
  }, [incidentStore.isSlowBurn, incidentStore.severity, incidentStore.isPaused, incidentStore.tickSlowBurn, playAlert, loggedHandleDeclare]);

  return {
    ...terminalStore,
    ...incidentStore,
    completedScenarios: terminalStore.completedScenarios,
    ...windowManager,
    ...audioStore,
    messages, sendMessage, typingUsers, markAsRead, markAllAsRead,
    commands, handleCommand,
    playLoginChime, playLogoutChime, playPostBeep, playMitigationSuccess, playDegauss, stopAllSounds,
    activeScenario, startScenario, stopScenario, resumeScenario,
    currentEventIndex,
    loggedHandleDeclare, loggedCeaseTheatre,
    loggedTogglePane, loggedSetStack, loggedSetSeverity, loggedSetIsSlowBurn,
    scrollRef,
    handleNewChatMessage,
    handleResolve: handleCommandCease,
    executeCeaseTheatre: loggedCeaseTheatre,
    onFocus: (id: PaneId) => {
        windowManager.bringToFront(id);
    },
    onClose: (id: PaneId) => {
        log('WINDOW', `CLOSE ${id}`);
        windowManager.closePane(id);
    },
    toggleMinimize: (id: PaneId) => {
        log('WINDOW', `TOGGLE_MINIMIZE ${id}`);
        windowManager.toggleMinimize(id);
    },
    onPopOutToggle: (id: PaneId) => {
        log('WINDOW', `TOGGLE_POPOUT ${id}`);
        windowManager.togglePopOut(id);
    },
    onSnapMainToggle: (id: PaneId) => {
        log('WINDOW', `TOGGLE_SNAPMAIN ${id}`);
        windowManager.toggleSnapMain(id);
    }
  };
};
