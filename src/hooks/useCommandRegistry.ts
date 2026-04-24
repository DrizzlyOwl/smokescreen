import type { PaneId } from './useWindowManager';
import type { Severity, Stack } from '../data/incidents';
import type { Theme } from '../contexts/types';
import { getCommands } from '../data/commands.config';

export interface Command {
  id: string;
  patterns: string[];
  action: (context: Record<string, unknown>) => void;
  description: string;
  category: 'PANES' | 'THREAT' | 'STACK' | 'SYSTEM' | 'ACTION';
  usage: string;
  confirmation?: string;
}

export interface CommandResult {
  isValid: boolean;
  message?: string;
}

export interface CommandActions {
  gameMode: import('../store/useIncidentStore').GameMode;
  togglePane: (id: PaneId) => void;
  openPane: (id: PaneId) => void;
  closePane: (id: PaneId) => void;
  openAll: () => void;
  closeAll: () => void;
  setSeverity: (s: Severity) => void;
  setStack: (s: Stack) => void;
  setAudio: (on: boolean) => void;
  setSlowBurn: (on: boolean) => void;
  setTheme: (theme: Theme) => void;
  handleEject: () => void;
  handleCease: () => void;
  copyPlaybook: () => void;
  setView: (v: 'HOME' | 'TICKET') => void;
  handleLogout: () => void;
  help: (commands: Command[]) => void;
  startPlaybook: (id: string) => void;
  setEcoMode: (on: boolean) => void;
  triggerApproval: (type?: 'phrase' | 'hold' | 'slider') => void;
  mitigationCount: number;
  incrementMitigationCount: () => void;
  isDeclared: boolean;
  generateStrategy: () => Promise<void>;
}

export const useCommandRegistry = (actions: CommandActions) => {
  const commands = getCommands(actions);

  const handleCommand = (input: string): CommandResult => {
    const originalInput = input.trim();
    let cmd = originalInput.toLowerCase();
    if (!cmd) return { isValid: false };

    // Check if command starts with a category (e.g. "panes show logs")
    const categories: Command['category'][] = ['PANES', 'THREAT', 'STACK', 'SYSTEM', 'ACTION'];
    let categoryLimit: Command['category'] | null = null;

    for (const cat of categories) {
      if (cmd === cat.toLowerCase() || cmd === cat.toLowerCase() + ' help') {
        const catCmds = commands.filter(c => c.category === cat);
        let message = `--- ${cat}_COMMAND_MANIFEST ---\n\n`;
        catCmds.forEach(c => {
            message += `  ${c.patterns.join(', ')}\n`;
            message += `  > ${c.description}\n\n`;
        });
        message += `---------------------------`;
        return { isValid: false, message };
      }

      if (cmd.startsWith(cat.toLowerCase() + ' ')) {
        categoryLimit = cat;
        cmd = cmd.slice(cat.length + 1).trim();
        break;
      }
    }

    const filteredCommands = categoryLimit 
        ? commands.filter(c => c.category === categoryLimit)
        : commands;

    let match = filteredCommands.find((c) =>
      c.patterns.some((p) => p.toLowerCase() === cmd)
    );

    if (match) {
      // Arcade Mode Restrictions
      if (actions.gameMode === 'ARCADE' && (match.category === 'THREAT' || match.category === 'STACK' || match.id === 'eject')) {
        return { 
            isValid: false, 
            message: `ERROR: MANUAL OVERRIDE DENIED. ARCADE MODE ACTIVE. FOLLOW PLAYBOOK DIRECTIVES.` 
        };
      }

      if (match.usage && match.usage.includes('<') && !match.patterns.some(p => p.includes(' '))) {
         return { isValid: false, message: `USAGE: ${match.usage}` };
      }

      // Remediation Guard: Block resolution if no mitigations logged
      if (match.id === 'cease' && actions.isDeclared && actions.mitigationCount === 0) {
        return { 
            isValid: false, 
            message: `ERROR: RESOLUTION DENIED. NO MITIGATION ACTIONS LOGGED. PERFORM FAILOVER ROUTING [MAP] OR AUTHORIZE OVERRIDES FIRST.` 
        };
      }

      match.action({});
      return { 
        isValid: true, 
        message: match.confirmation || `EXECUTING: ${match.id.toUpperCase()}... [OK]` 
      };
    }

    match = filteredCommands.find((c) =>
      c.patterns.some((p) => cmd.startsWith(p.toLowerCase() + ' '))
    );

    if (match) {
      // Arcade Mode Restrictions
      if (actions.gameMode === 'ARCADE' && (match.category === 'THREAT' || match.category === 'STACK' || match.id === 'eject')) {
        return { 
            isValid: false, 
            message: `ERROR: MANUAL OVERRIDE DENIED. ARCADE MODE ACTIVE. FOLLOW PLAYBOOK DIRECTIVES.` 
        };
      }

      const matchedPattern = match.patterns.find((p) => cmd.startsWith(p.toLowerCase() + ' '));
      const arg = cmd.slice(matchedPattern!.length).trim();
      
      if (!arg && match.usage && match.usage.includes('<')) {
        return { isValid: false, message: `USAGE: ${match.usage}` };
      }

      match.action({ arg });
      return { 
        isValid: true, 
        message: match.confirmation 
            ? match.confirmation.replace('$arg', arg.toUpperCase()) 
            : `EXECUTING: ${match.id.toUpperCase()} [${arg.toUpperCase()}]... [OK]` 
      };
    }

    // If we had a category limit but no match, explicitly fail
    if (categoryLimit) {
        return { isValid: false, message: `ERROR: COMMAND NOT FOUND IN CATEGORY [${categoryLimit}]` };
    }

    return { isValid: false };
  };

  return { commands, handleCommand };
};
