import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { Severity, Stack } from '../data/incidents';
import type { PaneId, PanesState } from './useWindowManager';
import { useCommandRegistry, type Command } from './useCommandRegistry';
import type { Theme } from '../contexts/types';

import { PLAYBOOKS } from '../data/playbooks';

interface AppCommandsProps {
  isDebugMode: boolean;
  log: (action: string, data?: unknown) => void;
  togglePane: (id: PaneId) => void;
  openPane: (id: PaneId) => void;
  closePane: (id: PaneId) => void;
  openAll: () => void;
  closeAll: () => void;
  setSeverity: (s: Severity) => void;
  setStack: (s: Stack) => void;
  initAudio: () => void;
  setIsAudioOn: (on: boolean) => void;
  setIsSlowBurn: (on: boolean) => void;
  setTheme: (t: Theme) => void;
  handleDeclare: () => void;
  ceaseTheatre: () => void;
  handleLogout: () => void;
  incidentReport: string;
  setDisplayText: (text: string) => void;
  setView: (v: 'HOME' | 'TICKET') => void;
  setIncidentReport: (text: string) => void;
  panes: PanesState;
  activePane: PaneId | null;
  zIndices: Record<PaneId, number>;
  bringToFront: (id: PaneId) => void;
  severity: Severity;
  startPlaybook: (playbook: import('../data/playbooks/types').Playbook) => void;
  addTerminalLine: (type: import('./useIncidentState').TerminalLine['type'], text: string) => void;
}

export const useAppCommands = ({
  isDebugMode,
  log,
  togglePane,
  openPane,
  closePane,
  openAll,
  closeAll,
  setSeverity,
  setStack,
  initAudio,
  setIsAudioOn,
  setIsSlowBurn,
  setTheme,
  handleDeclare,
  ceaseTheatre,
  handleLogout,
  incidentReport,
  setDisplayText,
  setView,
  setIncidentReport,
  panes,
  activePane,
  zIndices,
  bringToFront,
  severity,
  startPlaybook,
  addTerminalLine
}: AppCommandsProps) => {
  const lastEscTime = useRef<number>(0);

  const loggedTogglePane = useCallback((id: PaneId) => {
    if (isDebugMode) log('PANE_TOGGLE', { id });
    togglePane(id);
  }, [togglePane, isDebugMode, log]);

  const loggedSetSeverity = useCallback((s: Severity) => {
    if (isDebugMode) log('SEVERITY_SET', { level: s });
    setSeverity(s);
  }, [setSeverity, isDebugMode, log]);

  const loggedSetStack = useCallback((s: Stack) => {
    if (isDebugMode) log('STACK_SET', { stack: s });
    setStack(s);
  }, [setStack, isDebugMode, log]);

  const loggedSetIsSlowBurn = useCallback((on: boolean) => {
    if (isDebugMode) log('ACTION', { type: 'SLOW_BURN_TOGGLE', on });
    setIsSlowBurn(on);
  }, [setIsSlowBurn, isDebugMode, log]);

  const loggedHandleDeclare = useCallback(() => {
    if (isDebugMode) log('ACTION', { type: 'INCIDENT_DECLARED' });
    handleDeclare();
  }, [handleDeclare, isDebugMode, log]);

  const loggedCeaseTheatre = useCallback(() => {
    if (isDebugMode) log('ACTION', { type: 'THEATRE_CEASED' });
    ceaseTheatre();
  }, [ceaseTheatre, isDebugMode, log]);

  const commandActions = useMemo(() => ({
    togglePane: loggedTogglePane, 
    openPane: (id: PaneId) => { if (isDebugMode) log('PANE_OPEN', { id }); openPane(id); }, 
    closePane: (id: PaneId) => { if (isDebugMode) log('PANE_CLOSE', { id }); closePane(id); }, 
    openAll: () => { if (isDebugMode) log('ACTION', { type: 'OPEN_ALL' }); openAll(); }, 
    closeAll: () => { if (isDebugMode) log('ACTION', { type: 'CLOSE_ALL' }); closeAll(); },
    setSeverity: loggedSetSeverity, 
    setStack: loggedSetStack, 
    setAudio: (on: boolean) => { 
        if (isDebugMode) log('ACTION', { type: 'AUDIO_TOGGLE', on });
        if(on) initAudio(); 
        setIsAudioOn(on); 
    },
    setSlowBurn: loggedSetIsSlowBurn,
    setTheme: (t: Theme) => {
        if (isDebugMode) log('ACTION', { type: 'THEME_SET', theme: t });
        setTheme(t);
    },
    handleEject: loggedHandleDeclare,
    handleCease: loggedCeaseTheatre,
    handleLogout,
    copyPlaybook: () => { 
        if (isDebugMode) log('ACTION', { type: 'COPY_REPORT' });
        navigator.clipboard.writeText(incidentReport); 
        setDisplayText('>>> CLIPBOARD_SYNC_COMPLETE <<<'); 
        setTimeout(() => setDisplayText(incidentReport), 1500); 
    },
    setView: (v: 'HOME' | 'TICKET') => {
        if (isDebugMode) log('ACTION', { type: 'VIEW_SET', view: v });
        setView(v);
    },
    startPlaybook: (id: string) => {
        if (isDebugMode) log('ACTION', { type: 'PLAYBOOK_START', id });
        const playbook = PLAYBOOKS[id];
        if (playbook) {
            startPlaybook(playbook);
            setIncidentReport(`[ PLAYBOOK ENGAGED: ${playbook.name} ]\n\n${playbook.description}`);
        } else {
            setIncidentReport(`[ ERROR: PLAYBOOK NOT FOUND ]\n\nAvailable: ${Object.keys(PLAYBOOKS).join(', ')}`);
        }
    },
    help: (commands: Command[]) => {
        if (isDebugMode) log('ACTION', { type: 'HELP_REQUESTED' });
        
        let helpText = 'SMOKESCREEN(1)              SRE_INCIDENT_THEATRE             SMOKESCREEN(1)\n\n';
        helpText += 'NAME\n    smokescreen - technical performance cover interface\n\n';
        helpText += 'SYNOPSIS\n    [COMMAND] [ARGUMENT...]\n\n';
        helpText += 'DESCRIPTION\n    SMOKESCREEN provides high-fidelity simulations of catastrophic system\n    failures to provide authentic performance cover during meetings.\n\n';
        helpText += 'COMMANDS\n';

        const categories: Command['category'][] = ['ACTION', 'THREAT', 'STACK', 'PANES', 'SYSTEM'];
        
        categories.forEach(cat => {
            helpText += `    ${cat}\n`;
            const catCmds = commands.filter(c => c.category === cat);
            catCmds.forEach(cmd => {
                const patterns = cmd.patterns.join(', ');
                const padding = ' '.repeat(Math.max(2, 24 - patterns.length));
                helpText += `        ${patterns}${padding}${cmd.description}\n`;
                if (cmd.usage) {
                    helpText += `          Usage: ${cmd.usage}\n`;
                }
            });
            helpText += '\n';
        });

        helpText += 'AUTHOR\n    Developed by DrizzlyOwl for SRE Incident Theatre operations.\n';
        
        addTerminalLine('output', helpText);
    }
  }), [
    loggedTogglePane, openPane, closePane, openAll, closeAll, loggedSetSeverity, loggedSetStack, loggedSetIsSlowBurn, initAudio, 
    setIsAudioOn, setTheme, loggedHandleDeclare, loggedCeaseTheatre, handleLogout, incidentReport, setIncidentReport, isDebugMode, log, setDisplayText, setView, startPlaybook, addTerminalLine
  ]);

  const { handleCommand: registryHandleCommand } = useCommandRegistry(commandActions);

  const handleCommand = useCallback((cmd: string): boolean => {
    if (isDebugMode) {
        log('COMMAND_EXEC', { command: cmd });
    }
    
    // Add command to terminal history immediately
    addTerminalLine('command', cmd);

    const result = registryHandleCommand(cmd);
    
    if (result.message) {
        addTerminalLine('output', result.message);
    } else if (!result.isValid && cmd.trim().length > 0) {
        const errorMsg = `COMMAND_NOT_RECOGNIZED: "${cmd.toUpperCase()}"\nINPUT "HELP" FOR COMMAND_MANIFEST.`;
        addTerminalLine('output', errorMsg);
    }
    
    return result.isValid;
  }, [registryHandleCommand, setIncidentReport, isDebugMode, log, addTerminalLine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const visiblePanes = (Object.keys(panes) as Array<keyof typeof panes>)
            .filter(key => panes[key]);

        if (visiblePanes.length > 0) {
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

  return {
    handleCommand,
    loggedTogglePane,
    loggedSetStack,
    loggedSetSeverity,
    loggedSetIsSlowBurn,
    loggedCeaseTheatre,
    loggedHandleDeclare
  };
};
