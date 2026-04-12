import { useEffect, useCallback, useMemo, useRef } from 'react';
import { type Severity, type Stack } from '../data/incidents';
import { useWindowManager, type PaneId } from './useWindowManager';
import { useUrlSync } from './useUrlSync';
import { usePlaybookEngine } from './usePlaybookEngine';
import { useIncidentChat } from './useIncidentChat';
import { useClientStats } from './useClientStats';
import { useDebugLogger } from './useDebugLogger';
import { useCommandRegistry } from './useCommandRegistry';
import { PLAYBOOKS } from '../data/playbooks';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { useAudioStore } from '../store/useAudioStore';
import { useAudio as useAudioHook } from './useAudio'; // Keep for audio effects if needed, or migrate fully

export type { ChatMessage } from '../contexts/types';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

export const useIncidentState = () => {
  const { log } = useDebugLogger();
  
  // 1. Zustand Stores
  const {
    appState, setAppState,
    operatorName, setOperatorName,
    theme, setTheme,
    uplinkId,
    isDebugMode, setIsDebugMode,
    isEcoMode, setIsEcoMode
  } = useTerminalStore();

  const {
    severity, setSeverity,
    stack, setStack,
    incidentReport, setIncidentReport,
    ticketId,
    status,
    moneyLost,
    isSlowBurn, setIsSlowBurn,
    isChaos, setIsChaos,
    slowBurnCountdown,
    declareIncident,
    ceaseTheatre,
    unreadChat, setUnreadChat,
    isTransitioning, setIsTransitioning,
    terminalHistory, setTerminalHistory,
    displayText, setDisplayText,
    view, setView,
    chatMultiplier, setChatMultiplier
  } = useIncidentStore();

  const { isAudioOn, setIsAudioOn } = useAudioStore();

  // 2. Calculated / Memoized
  const systemMetrics = useMemo(() => ({
    cpu: severity === 'P0' ? 98 : severity === 'P1' ? 75 : severity === 'P3' ? 45 : 12,
    ram: severity === 'P0' ? 31.4 : severity === 'P1' ? 24.2 : severity === 'P3' ? 16.8 : 8.4
  }), [severity]);

  const isDeclared = !!incidentReport;
  const lastEscTime = useRef<number>(0);

  // 3. Hooks
  const { 
    panes, minimizedPanes, zIndices, poppedOutPanes, snappedMainPanes, activePane, 
    openPane, closePane, togglePane, toggleMinimize, togglePopOut, toggleSnapMain,
    bringToFront: baseBringToFront, 
    closeAll, openAll, setPanes 
  } = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, pager: false, howTo: !localStorage.getItem('smokescreen_visited'), settings: false, metrics: false, playbooks: false, readout: false, terminal: true, debug: false
  });

  useEffect(() => {
    if (!localStorage.getItem('smokescreen_visited')) {
      localStorage.setItem('smokescreen_visited', 'true');
    }
  }, []);

  const clientStats = useClientStats();
  const { playSlackPing, playTagPing, playAlert, playLoginChime, playLogoutChime, playPostBeep, stopAllSounds } = useAudioHook();

  // 4. Callbacks
  const bringToFront = useCallback((id: PaneId) => {
    if (activePane !== id) {
        log('WINDOW_MANAGER', `Bringing ${id} to front`);
        baseBringToFront(id);
    }
  }, [baseBringToFront, log, activePane]);

  const loggedTogglePane = useCallback((id: PaneId) => {
    log('WINDOW_MANAGER', `${panes[id] ? 'Closing' : 'Opening'} ${id} pane`);
    togglePane(id);
  }, [togglePane, panes, log]);

  const handleNewChatMessage = useCallback((isTag: boolean) => {
    log('CHAT_EVENT', `Incoming message (Tagged: ${isTag})`);
    if (isTag) {
      if (!panes.chat) openPane('chat');
      bringToFront('chat');
      setUnreadChat(prev => (typeof prev === 'number' ? prev : 0) + 1);
    } else if (!panes.chat || minimizedPanes.chat || activePane !== 'chat') {
      setUnreadChat(prev => (typeof prev === 'number' ? prev : 0) + 1);
    }
  }, [panes.chat, minimizedPanes.chat, activePane, bringToFront, openPane, setUnreadChat, log]);

  const { messages, sendMessage, typingUsers, markAsRead, markAllAsRead } = useIncidentChat(
    severity, 
    stack, 
    operatorName, 
    uplinkId, 
    handleNewChatMessage, 
    playSlackPing, 
    playTagPing, 
    appState === 'READY',
    panes.chat && !minimizedPanes.chat && activePane === 'chat',
    chatMultiplier,
    log
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
    setAudio: (on) => {
        log('SYSTEM', `Audio ${on ? 'enabled' : 'disabled'}`);
        setIsAudioOn(on);
    },
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
            const primaryPattern = c.patterns[0].toUpperCase();
            const usage = c.usage ? ` ${c.usage.split(' ').slice(1).join(' ')}` : '';
            categories[c.category].push(`${primaryPattern}${usage.padEnd(15)} - ${c.description}`);
        });

        let manPage = `SMOKESCREEN(1)                     Operator Manual                     SMOKESCREEN(1)\n\n`;
        manPage += `NAME\n\tsmokescreen - Technical Incident Theatre simulation control interface\n\n`;
        manPage += `SYNOPSIS\n\tcommand [arguments...]\n\n`;
        manPage += `DESCRIPTION\n\tsmokescreen provides a high-fidelity terminal interface for simulating catastrophic\n\tsystem failures. It is designed to provide "performance cover" during meetings,\n\tinterviews, or periods requiring deep focus.\n\n`;
        manPage += `CATEGORIES\n`;
        manPage += `\tPANES   - Workspace viewport management\n`;
        manPage += `\tTHREAT  - Incident severity escalation (P3 to P0)\n`;
        manPage += `\tSTACK   - Infrastructure provider context (AWS, GCP, etc.)\n`;
        manPage += `\tSYSTEM  - Global environment settings and themes\n`;
        manPage += `\tACTION  - Incident lifecycle and playbook execution\n\n`;

        manPage += `AVAILABLE COMMANDS\n`;
        Object.entries(categories).forEach(([category, commands]) => {
            manPage += `\t${category}\n\t\t${commands.join('\n\t\t')}\n\n`;
        });

        manPage += `EXAMPLES\n`;
        manPage += `\tSet context and escalate:\n\t\t> aws\n\t\t> p0\n\t\t> declare\n\n`;
        manPage += `\tClear workspace and resolve:\n\t\t> clear\n\t\t> resolve\n\n`;

        manPage += `SEE ALSO\n\thowto(1), settings(1)\n\n`;
        manPage += `HISTORY\n\tLast updated: April 2026 | Orchestrator Edition\n`;

        setTerminalHistory(prev => {
            const history = Array.isArray(prev) ? prev : [];
            return [...history, { text: manPage, type: 'output' }];
        });
    },    startPlaybook: (id) => {
        const playbook = PLAYBOOKS[id];
        if (playbook) {
            log('SYSTEM', `Starting playbook ${id}`);
            startPlaybook(playbook);
        } else {
            log('SYSTEM', `Playbook ${id} not found`);
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: `ERROR: PLAYBOOK [${id}] NOT FOUND`, type: 'error' }];
            });
        }
    },
    setEcoMode: setIsEcoMode
  });

  const handleCommand = useCallback((cmd: string) => {
    log('TERMINAL', `Executing command: ${cmd}`);
    
    // Add command to history
    setTerminalHistory(prev => {
        const history = Array.isArray(prev) ? prev : [];
        return [...history, { text: cmd, type: 'command' }];
    });

    const result = registryHandleCommand(cmd);
    
    if (result.isValid) {
        if (result.message) {
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: result.message!, type: 'output' }];
            });
        }
        return true;
    } else {
        if (result.message) {
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: result.message!, type: 'error' }];
            });
        } else {
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: `COMMAND_NOT_FOUND: ${cmd}`, type: 'error' }];
            });
        }
        return false;
    }
  }, [log, registryHandleCommand, setTerminalHistory]);

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
    if (count !== unreadChat) {
        log('STORE', `Unread chat count: ${count}`);
        setUnreadChat(count);
    }
  }, [messages, unreadChat, setUnreadChat, log]);

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
  }, [incidentReport, openPane, setDisplayText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const visiblePanes = (Object.keys(panes) as Array<PaneId>)
            .filter(key => panes[key]);

        if (visiblePanes.length > 0) {
            // Close the active pane if it's visible, otherwise the top-most one
            const paneToClose = (activePane && panes[activePane]) 
                ? activePane 
                : visiblePanes.reduce((prev, curr) => zIndices[curr] > zIndices[prev] ? curr : prev);

            closePane(paneToClose);

            const remaining = visiblePanes.filter(p => p !== paneToClose);
            if (remaining.length > 0) {
                const nextActive = remaining.reduce((prev, curr) => 
                    zIndices[curr] > zIndices[prev] ? curr : prev
                );
                bringToFront(nextActive);
            }
            return;
        }

        if (severity !== 'NOMINAL') {
            loggedCeaseTheatre();
        }
        
        const now = Date.now();
        if (now - lastEscTime.current < 500) {
          loggedHandleDeclare();
        }
        lastEscTime.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [severity, panes, zIndices, activePane, loggedHandleDeclare, loggedCeaseTheatre, bringToFront, closePane]);

  const easterEggs = useMemo(() => [
    'SEARCHING FOR RED OCTOBER... [NOT FOUND]',
    'DECRYPTING ENIGMA STREAM... [SUCCESS]',
    'LOCATING FLUX CAPACITOR... [OFFLINE]',
  ], []);

  return {
    panes, minimizedPanes, zIndices, poppedOutPanes, snappedMainPanes, activePane, openPane, closePane, togglePane, toggleMinimize, togglePopOut, toggleSnapMain, bringToFront, closeAll, openAll, setPanes,
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
    chatMultiplier, setChatMultiplier,
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
    isAudioOn, setIsAudioOn,
    ticketId
  };
};
