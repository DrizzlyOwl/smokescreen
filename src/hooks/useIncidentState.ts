import { useCallback, useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore, type TerminalLine, type CommandResult } from '../store/useIncidentStore';
import { useAudioStore } from '../store/useAudioStore';
import { useWindowManager, type PaneId } from './useWindowManager';
import { useAudio as useAudioHook } from './useAudio';
import { useDebugLogger } from './useDebugLogger';
import { usePlaybookEngine } from './usePlaybookEngine';
import { useIncidentChat } from './useIncidentChat';
import { useCommandRegistry } from './useCommandRegistry';
import { useUrlSync } from './useUrlSync';
import type { Severity, Stack } from '../data/incidents';

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
    playSlackPing,
    playTagPing,
    stopAllSounds 
  } = useAudioHook();

  const windowManager = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, howTo: !localStorage.getItem('smokescreen_visited'), settings: false, playbooks: false, incidentPlaybook: false, readout: false, terminal: true, debug: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const loggedTogglePane = useCallback((id: PaneId) => {
    log('WINDOW_MANAGER', `Toggle ${id}`);
    windowManager.togglePane(id);
    if (!windowManager.panes[id]) incidentStore.removeBeacon(id);
  }, [windowManager, incidentStore, log]);

  const loggedSetStack = useCallback((s: Stack) => incidentStore.setStack(s), [incidentStore]);
  const loggedSetSeverity = useCallback((s: Severity) => incidentStore.setSeverity(s), [incidentStore]);
  const loggedSetIsSlowBurn = useCallback((on: boolean) => incidentStore.setIsSlowBurn(on), [incidentStore]);
  const loggedHandleDeclare = useCallback(() => incidentStore.declareIncident(playAlert), [incidentStore, playAlert]);

  const loggedCeaseTheatre = useCallback(() => {
    incidentStore.ceaseTheatre();
    if (incidentStore.onboardingStep === 4) {
        incidentStore.setOnboardingStep(-1);
    }
  }, [incidentStore.ceaseTheatre, incidentStore.onboardingStep, incidentStore.setOnboardingStep]);

  const handleCommandCease = useCallback(() => {
    const state = useIncidentStore.getState();
    if (state.isDeclared && state.mitigationCount === 0) {
        incidentStore.addTerminalLine({ text: 'ERROR: RESOLUTION DENIED. MITIGATION REQUIRED.', type: 'error' });
        return;
    }
    incidentStore.setIsResolving(true);
  }, [incidentStore]);

  const handleNewChatMessage = useCallback(() => {}, []);

  const { messages, sendMessage, typingUsers, markAsRead, markAllAsRead } = useIncidentChat(
    incidentStore.severity, 
    incidentStore.stack, 
    terminalStore.operatorName, 
    terminalStore.terminalId, 
    handleNewChatMessage, 
    playSlackPing, 
    playTagPing,
    windowManager.panes.chat && !windowManager.minimizedPanes.chat,
    windowManager.activePane === 'chat',
    incidentStore.chatMultiplier,
    log
  );

  const { commands, handleCommand: internalHandleCommand } = useCommandRegistry({
    gameMode: incidentStore.gameMode,
    togglePane: loggedTogglePane,
    openPane: loggedTogglePane,
    closePane: (id) => windowManager.closePane(id),
    openAll: () => windowManager.openAll(),
    closeAll: () => windowManager.closeAll(),
    setStack: loggedSetStack,
    setSeverity: loggedSetSeverity,
    setSlowBurn: loggedSetIsSlowBurn,
    handleCease: handleCommandCease,
    handleDeclare: loggedHandleDeclare,
    handleEject: loggedHandleDeclare,
    help: () => { 
        incidentStore.setIncidentReport('HELP_DISPLAYED'); 
        incidentStore.setDisplayText('MANUAL_LOADED'); 
    },
    incrementMitigationCount: incidentStore.incrementMitigationCount,
    setLogMultiplier: (m: number) => incidentStore.setLogMultiplier(m), 
    setChatMultiplier: (m: number) => incidentStore.setChatMultiplier(m),
    setEcoMode: terminalStore.setIsEcoMode, 
    setIsDebugMode: terminalStore.setIsDebugMode, 
    setAudio: audioStore.setIsAudioOn, 
    setIsChaos: incidentStore.setIsChaos,
    mitigationCount: incidentStore.mitigationCount,
    isDeclared: incidentStore.isDeclared,
    getMitigationCount: () => useIncidentStore.getState().mitigationCount,
    getIsDeclared: () => useIncidentStore.getState().isDeclared,
    setTheme: terminalStore.setTheme,
    handleLogout: terminalStore.handleLogout,
    setView: incidentStore.setView,
    startPlaybook: (id: string) => { log('PLAYBOOK', `Start ${id}`); },
    triggerApproval: (type) => incidentStore.setApproval({ id: Math.random().toString(), type: type || 'phrase', message: 'Auth required' }),
    generateStrategy: incidentStore.generateStrategy,
    copyPlaybook: () => {},
  });

  const { startPlaybook, stopPlaybook, currentEventIndex, activePlaybook } = usePlaybookEngine({
    sendMessage,
    injectLog: (msg) => { window.dispatchEvent(new CustomEvent('INJECT_LOG', { detail: msg })); },
    setSeverity: loggedSetSeverity,
    setIsChaos: incidentStore.setIsChaos,
    addBeacon: incidentStore.addBeacon,
    triggerApproval: (type) => incidentStore.setApproval({ id: Math.random().toString(), type: type || 'phrase', message: 'Playbook Auth' }),
    triggerOverride: () => incidentStore.setOverride({ code: Math.random().toString(36).substring(2, 8).toUpperCase(), message: 'MANUAL OVERRIDE REQUIRED' }),
    triggerInterrupt: () => {},
    setObjective: (obj) => incidentStore.setObjective(obj),
    declareIncident: loggedHandleDeclare,
    stack: incidentStore.stack,
    operatorName: terminalStore.operatorName
  });

  const handleCommand = useCallback((cmd: string): CommandResult => {
    const originalCmd = cmd.trim();
    const state = useIncidentStore.getState();
    
    // Terminal Override Handling
    if (state.activeOverride) {
        if (originalCmd.toUpperCase() === state.activeOverride.code) {
            incidentStore.setOverride(null);
            incidentStore.incrementMitigationCount();
            const successMsg = 'OVERRIDE_SUCCESSFUL... [OK]';
            if (state.onboardingStep === -1) incidentStore.setTerminalHistory(prev => [...prev, { text: `> ${originalCmd}`, type: 'command' }, { text: successMsg, type: 'output' }]);
            return { isValid: true, message: successMsg };
        } else {
            const penalty = 50000 + Math.floor(Math.random() * 25000);
            incidentStore.setMoneyLost(prev => prev + penalty);
            const errorMsg = `ERROR: INVALID_OVERRIDE_CODE. PENALTY: £${penalty.toLocaleString()}`;
            if (state.onboardingStep === -1) incidentStore.setTerminalHistory(prev => [...prev, { text: `> ${originalCmd}`, type: 'command' }, { text: errorMsg, type: 'error' }]);
            return { isValid: false, message: errorMsg };
        }
    }

    const result = internalHandleCommand(originalCmd);
    
    // Add to history
    if (state.onboardingStep === -1 || !result.isValid) {
        incidentStore.setTerminalHistory(prev => [
            ...prev, 
            { text: `> ${originalCmd}`, type: 'command' },
            ...(result.message ? [{ text: result.message, type: result.isValid ? 'output' : 'error' } as TerminalLine] : [])
        ]);
    }

    // Onboarding Transitions
    if (result.isValid) {
        if (state.onboardingStep === 1 && originalCmd.toLowerCase().includes('aws')) {
            incidentStore.setOnboardingStep(2);
        } else if (state.onboardingStep === 2 && originalCmd.toLowerCase().includes('p3')) {
            incidentStore.setOnboardingStep(3);
        } else if (state.onboardingStep === 3 && (originalCmd.toLowerCase().includes('declare') || originalCmd.toLowerCase().includes('emergency'))) {
            incidentStore.setOnboardingStep(4);
        } else if (state.onboardingStep === 4 && (originalCmd.toLowerCase().includes('resolve') || originalCmd.toLowerCase().includes('cease'))) {
            incidentStore.setOnboardingStep(-1);
        }
    }

    return result;
  }, [internalHandleCommand, incidentStore]);

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
    if (incidentStore.isResolving) {
        const timeout = setTimeout(() => { 
            incidentStore.ceaseTheatre(); 
            incidentStore.setIsResolving(false); 
        }, 5000);
        return () => clearTimeout(timeout);
    }
  }, [incidentStore.isResolving, incidentStore.ceaseTheatre, incidentStore.setIsResolving]);

  const initialReadySet = useRef(false);
  useEffect(() => {
    if (terminalStore.appState === 'READY' && !initialReadySet.current) {
        initialReadySet.current = true;
        if (incidentStore.onboardingStep === 0) {
            incidentStore.setOnboardingStep(1);
            incidentStore.setTerminalHistory([
                { text: '!!! OPERATOR CERTIFICATION REQUIRED !!!', type: 'error' },
                { text: "TYPE 'aws' TO INITIALIZE PRIMARY STACK.", type: 'system' }
            ]);
        } else {
            if (incidentStore.gameMode === 'ARCADE') {
                incidentStore.setTerminalHistory([{ text: 'CRITICAL_INCIDENT_LOADED... [OK]', type: 'system' }, { text: 'PREPARE FOR MISSION BRIEFING.', type: 'system' }]);
            } else {
                incidentStore.setTerminalHistory([{ text: 'SYSTEM_READY. AWAITING_COMMAND...', type: 'system' }]);
            }
        }
    }
  }, [terminalStore.appState, incidentStore.gameMode, incidentStore.onboardingStep, incidentStore.setOnboardingStep, incidentStore]);

  const lastStepRef = useRef(incidentStore.onboardingStep);
  useEffect(() => {
    if (incidentStore.onboardingStep !== lastStepRef.current) {
        const step = incidentStore.onboardingStep;
        lastStepRef.current = step;
        
        if (step === 2) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'p3' TO ESCALATE THREAT LEVEL.", type: 'system' }]);
        } else if (step === 3) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'declare' TO ENGAGE THEATRE.", type: 'system' }]);
        } else if (step === 4) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'resolve' TO CEASE THEATRE.", type: 'system' }]);
        }
    }
  }, [incidentStore.onboardingStep, incidentStore]);

  useEffect(() => {
    if (incidentStore.isSlowBurn && incidentStore.severity !== 'P0' && !incidentStore.isPaused) {
      const interval = setInterval(() => incidentStore.tickSlowBurn(playAlert, loggedHandleDeclare), 1000);
      return () => clearInterval(interval);
    }
  }, [incidentStore.isSlowBurn, incidentStore.severity, incidentStore.isPaused, incidentStore.tickSlowBurn, playAlert, loggedHandleDeclare]);

  // Chaos Loop
  useEffect(() => {
    if (!incidentStore.isDeclared || incidentStore.isPaused) return;

    const interval = setInterval(() => {
        const threshold = incidentStore.severity === 'P0' ? 0.4 : incidentStore.severity === 'P1' ? 0.6 : 0.8;
        const roll = Math.random();

        if (roll > threshold) {
            incidentStore.setApproval({
                id: Math.random().toString(36).substring(2, 9),
                type: 'phrase',
                message: 'AUTHORIZE INFRASTRUCTURE ROTATION?',
                phrase: 'rotate-now'
            });
        } else if (roll > threshold - 0.1 && incidentStore.activeApproval) {
            incidentStore.setOverride({
                code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                message: 'CRITICAL SYSTEM OVERRIDE REQUIRED'
            });
        } else if (roll < threshold - 0.15) {
            // Money penalty for Executive Interruption
            const penalty = 150000 + Math.floor(Math.random() * 50000);
            incidentStore.setMoneyLost(prev => prev + penalty);
            incidentStore.setTerminalHistory(prev => [...prev, { text: `ALERT: EXECUTIVE INTERRUPTION TIMEOUT - £${penalty.toLocaleString()} PENALTY`, type: 'error' }]);
        }
    }, 15000);

    return () => clearInterval(interval);
  }, [incidentStore.isDeclared, incidentStore.isPaused, incidentStore.severity, incidentStore.activeApproval, incidentStore.setApproval, incidentStore.setOverride, incidentStore.setMoneyLost, incidentStore]);

  return {
    ...terminalStore,
    ...incidentStore,
    ...windowManager,
    ...audioStore,
    messages, sendMessage, typingUsers, markAsRead, markAllAsRead,
    commands, handleCommand,
    playLoginChime, playLogoutChime, playPostBeep, playMitigationSuccess, stopAllSounds,
    activePlaybook, startPlaybook, stopPlaybook,
    currentEventIndex,
    loggedHandleDeclare, loggedCeaseTheatre,
    loggedTogglePane, loggedSetStack, loggedSetSeverity, loggedSetIsSlowBurn,
    scrollRef,
    handleNewChatMessage,
    executeCeaseTheatre: loggedCeaseTheatre,
    onFocus: (id: PaneId) => windowManager.bringToFront(id),
    onClose: (id: PaneId) => windowManager.closePane(id),
    toggleMinimize: (id: PaneId) => windowManager.toggleMinimize(id),
    onPopOutToggle: (id: PaneId) => windowManager.togglePopOut(id),
    onSnapMainToggle: (id: PaneId) => windowManager.toggleSnapMain(id)
  };
};
