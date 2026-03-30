import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { type Severity, type Stack } from '../data/incidents';
import { useWindowManager, type PaneId } from './useWindowManager';
import { useUrlSync } from './useUrlSync';
import { useTerminal } from './useTerminal';
import { useAudio } from './useAudio';
import { usePlaybookEngine } from './usePlaybookEngine';
import { useIncidentChat } from './useIncidentChat';
import { useClientStats } from './useClientStats';
import { useDebugLogger } from './useDebugLogger';
import { useCommandRegistry } from './useCommandRegistry';
import { IncidentContext } from '../contexts/instances';
import { PLAYBOOKS } from '../data/playbooks';

export type { ChatMessage } from '../contexts/types';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

export const useIncidentState = () => {
  const { log } = useDebugLogger();
  const { 
    appState, setAppState, 
    operatorName, setOperatorName, 
    theme, setTheme, 
    uplinkId, 
    isDebugMode, setIsDebugMode, 
    isEcoMode, setIsEcoMode,
    isAudioOn
  } = useTerminal();

  const incident = useContext(IncidentContext);
  if (!incident) {
    throw new Error('useIncidentState must be used within an IncidentProvider');
  }

  const { 
    severity, setSeverity, 
    stack, setStack, 
    incidentReport, setIncidentReport,
    isSlowBurn, setIsSlowBurn,
    isChaos, setIsChaos,
    slowBurnCountdown,
    moneyLost,
    status,
    declareIncident,
    ceaseTheatre
  } = incident;

  // 1. Local State (UI specific)
  const [unreadChat, setUnreadChat] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [displayText, setDisplayText] = useState('');
  const [view, setView] = useState<'HOME' | 'TICKET'>('HOME');

  // 2. Calculated / Memoized
  const systemMetrics = useMemo(() => ({
    cpu: severity === 'P0' ? 98 : severity === 'P1' ? 75 : severity === 'P3' ? 45 : 12,
    ram: severity === 'P0' ? 31.4 : severity === 'P1' ? 24.2 : severity === 'P3' ? 16.8 : 8.4
  }), [severity]);

  const isDeclared = !!incidentReport;

  // 3. Hooks
  const { 
    panes, minimizedPanes, zIndices, activePane, 
    openPane, closePane, togglePane, toggleMinimize,
    bringToFront: baseBringToFront, 
    closeAll, openAll, setPanes 
  } = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, pager: false, howTo: false, settings: false, metrics: false, playbooks: false, readout: false, terminal: false, debug: false
  });

  const clientStats = useClientStats();
  const { playSlackPing, playTagPing, playAlert, playLoginChime, playLogoutChime, playPostBeep, stopAllSounds } = useAudio();

  // 4. Callbacks
  const bringToFront = useCallback((id: PaneId) => {
    log('WINDOW_MANAGER', `Bringing ${id} to front`);
    baseBringToFront(id);
  }, [baseBringToFront, log]);

  const loggedTogglePane = useCallback((id: PaneId) => {
    log('WINDOW_MANAGER', `${panes[id] ? 'Closing' : 'Opening'} ${id} pane`);
    togglePane(id);
  }, [togglePane, panes, log]);

  const handleNewChatMessage = useCallback((isTag: boolean) => {
    if (isTag) {
      if (!panes.chat) openPane('chat');
      bringToFront('chat');
      setUnreadChat(prev => prev + 1);
    } else if (!panes.chat || minimizedPanes.chat || activePane !== 'chat') {
      setUnreadChat(prev => prev + 1);
    }
  }, [panes.chat, minimizedPanes.chat, activePane, bringToFront, openPane]);

  const { messages, sendMessage, typingUsers, markAsRead, markAllAsRead } = useIncidentChat(
    severity, 
    stack, 
    operatorName, 
    uplinkId, 
    handleNewChatMessage, 
    playSlackPing, 
    playTagPing, 
    appState === 'READY',
    panes.chat && !minimizedPanes.chat && activePane === 'chat'
  );

  const injectLog = useCallback((logMsg: string) => {
    window.dispatchEvent(new CustomEvent('INJECT_LOG', { detail: logMsg }));
  }, []);

  const { activePlaybook, startPlaybook, stopPlaybook } = usePlaybookEngine({
    sendMessage: (text, user, id, isBot) => sendMessage(text, user, id, isBot),
    injectLog,
    setSeverity,
    setIsChaos
  });

  const loggedSetStack = useCallback((s: Stack) => {
    log('CORE_CONFIG', `Switching cloud stack to ${s}`);
    setStack(s);
  }, [log, setStack]);

  const loggedSetSeverity = useCallback((s: Severity) => {
    log('THREAT_LEVEL', `Alert level shifted to ${s}`);
    setSeverity(s);
    if (s !== 'NOMINAL') {
        playAlert(s);
    }
  }, [log, playAlert, setSeverity]);

  const loggedSetIsSlowBurn = useCallback((on: boolean) => {
    log('AUTOMATION', `${on ? 'Initiating' : 'Aborting'} slow-burn protocol`);
    setIsSlowBurn(on);
  }, [log, setIsSlowBurn]);

  const loggedHandleDeclare = useCallback(() => {
    log('COMMAND_CENTER', '!!! INCIDENT DECLARED !!!');
    declareIncident(playAlert);
  }, [log, declareIncident, playAlert]);

  const loggedCeaseTheatre = useCallback(() => {
    log('COMMAND_CENTER', 'Resolving all incidents...');
    ceaseTheatre();
    stopPlaybook();
  }, [log, ceaseTheatre, stopPlaybook]);

  const handleLogout = useCallback(() => {
      playLogoutChime();
      setAppState('SHUTDOWN');
  }, [playLogoutChime, setAppState]);

  const { handleCommand: registryHandleCommand } = useCommandRegistry({
    togglePane: loggedTogglePane,
    openPane,
    closePane,
    openAll,
    closeAll,
    setSeverity: loggedSetSeverity,
    setStack: loggedSetStack,
    setAudio: (on) => log('SYSTEM', `Audio ${on ? 'enabled' : 'disabled'}`),
    setSlowBurn: loggedSetIsSlowBurn,
    setTheme,
    handleEject: loggedHandleDeclare,
    handleCease: loggedCeaseTheatre,
    copyPlaybook: () => {
        if (incidentReport) {
            navigator.clipboard.writeText(incidentReport);
            log('SYSTEM', 'Playbook copied to clipboard');
        }
    },
    setView,
    handleLogout,
    help: (cmds) => {
        const categories: Record<string, string[]> = {};
        cmds.forEach(c => {
            if (!categories[c.category]) categories[c.category] = [];
            const cmdPatterns = c.patterns.join('|');
            const usage = c.usage ? `\n\tUsage: ${c.usage}` : '';
            categories[c.category].push(`${cmdPatterns}${usage}\n\t${c.description}`);
        });

        let manPage = `SMOKESCREEN(1)                     Operator Manual                     SMOKESCREEN(1)\n\n`;
        manPage += `NAME\n\tsmokescreen - Technical Incident Theatre simulation control\n\n`;
        manPage += `SYNOPSIS\n\tcommand [arguments...]\n\n`;
        manPage += `DESCRIPTION\n\tsmokescreen provides a high-fidelity terminal interface for simulating catastrophic\n\tsystem failures to provide "performance cover" during meetings.\n\n`;
        
        Object.entries(categories).forEach(([category, commands]) => {
            manPage += `${category}\n\t${commands.join('\n\n\t')}\n\n`;
        });

        manPage += `HISTORY\n\tLast updated: March 2026\n`;

        setTerminalHistory(prev => [...prev, { text: manPage, type: 'output' }]);
    },
    startPlaybook: (id) => {
        const playbook = PLAYBOOKS[id];
        if (playbook) {
            log('SYSTEM', `Starting playbook ${id}`);
            startPlaybook(playbook);
        } else {
            log('SYSTEM', `Playbook ${id} not found`);
            setTerminalHistory(prev => [...prev, { text: `ERROR: PLAYBOOK [${id}] NOT FOUND`, type: 'error' }]);
        }
    },
    setEcoMode: setIsEcoMode
  });

  const handleCommand = useCallback((cmd: string) => {
    log('TERMINAL', `Executing command: ${cmd}`);
    
    // Add command to history
    setTerminalHistory(prev => [...prev, { text: cmd, type: 'command' }]);

    const result = registryHandleCommand(cmd);
    
    if (result.isValid) {
        if (result.message) {
            setTerminalHistory(prev => [...prev, { text: result.message!, type: 'output' }]);
        }
        return true;
    } else {
        if (result.message) {
            setTerminalHistory(prev => [...prev, { text: result.message!, type: 'error' }]);
        } else {
            setTerminalHistory(prev => [...prev, { text: `COMMAND_NOT_FOUND: ${cmd}`, type: 'error' }]);
        }
        return false;
    }
  }, [log, registryHandleCommand, incidentReport, setView, handleLogout, setTheme, openPane, closePane, openAll, closeAll, loggedTogglePane, loggedSetSeverity, loggedSetStack, loggedSetIsSlowBurn, loggedHandleDeclare, loggedCeaseTheatre]);

  // 5. Effects
  useUrlSync({ 
    severity, stack, panes, theme, isEcoMode, isDebugMode, isAudioOn 
  }, (updates) => {
      if (updates.severity) setSeverity(updates.severity);
      if (updates.stack) setStack(updates.stack);
      if (updates.theme) setTheme(updates.theme);
      if (updates.isEcoMode !== undefined) setIsEcoMode(updates.isEcoMode);
      if (updates.isDebugMode !== undefined) setIsDebugMode(updates.isDebugMode);
      if (updates.panes) setPanes(updates.panes);
  });

  useEffect(() => {
    const count = messages.filter(m => !m.read).length;
    setUnreadChat(count);
  }, [messages]);

  useEffect(() => {
    let interval: number;
    if (incidentReport) {
      // Auto-open the readout pane (Jira Ticket) when report is generated
      if (incidentReport !== 'HELP_DISPLAYED' && !incidentReport.startsWith('COMMAND_NOT_RECOGNIZED')) {
        openPane('readout');
      }

      let i = 0;
      setDisplayText('');
      interval = window.setInterval(() => {
        setDisplayText(incidentReport.slice(0, i));
        i++;
        if (i > incidentReport.length) clearInterval(interval);
      }, 15);
    }
    return () => clearInterval(interval);
  }, [incidentReport, openPane]);

  const easterEggs = useMemo(() => [
    'SEARCHING FOR RED OCTOBER... [NOT FOUND]',
    'DECRYPTING ENIGMA STREAM... [SUCCESS]',
    'LOCATING FLUX CAPACITOR... [OFFLINE]',
  ], []);

  return {
    panes, minimizedPanes, zIndices, activePane, openPane, closePane, togglePane, toggleMinimize, bringToFront, closeAll, openAll, setPanes,
    appState, setAppState, operatorName, setOperatorName, severity, stack, status, setStatus: (s: string) => log('SYSTEM', s),
    unreadChat, moneyLost, isSlowBurn, slowBurnCountdown, isTransitioning, setIsTransitioning,
    isChaos, incidentReport, setIncidentReport, terminalHistory, setTerminalHistory,
    displayText, setDisplayText, view, setView,
    easterEggs, activePlaybook, startPlaybook, stopPlaybook, typingUsers, messages, sendMessage,
    isDeclared, uplinkId, systemMetrics,
    theme, setTheme,
    handleLogout,
    clientStats,
    isEcoMode, setIsEcoMode,
    isDebugMode, setIsDebugMode,
    loggedTogglePane,
    loggedSetStack,
    loggedSetSeverity,
    loggedSetIsSlowBurn,
    loggedCeaseTheatre,
    loggedHandleDeclare,
    handleCommand,
    markAsRead,
    markAllAsRead,
    playLoginChime,
    playPostBeep,
    stopAllSounds,
    ticketId: incident.ticketId
  };
};
