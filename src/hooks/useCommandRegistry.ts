import type { PaneId } from './useWindowManager';
import type { Severity, Stack } from '../data/incidents';
import type { Theme } from '../contexts/types';
import { getCommands } from '../data/commands.config';

export interface Command {
  id: string;
  patterns: string[];
  action: (context: { arg?: string }) => void | CommandResult;
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
  handleDeclare: () => void;
  handleCease: () => void;
  copyPlaybook: () => void;
  setView: (v: 'HOME' | 'TICKET') => void;
  handleLogout: () => void;
  help: (commands: Command[]) => void;
  startScenario: (id: string) => void;
  setLogMultiplier: (m: number) => void;
  setChatMultiplier: (m: number) => void;
  setEcoMode: (on: boolean) => void;
  setIsDebugMode: (on: boolean) => void;
  setIsChaos: (on: boolean) => void;
  triggerApproval: (type?: 'phrase' | 'hold' | 'slider') => void;
  playDegauss: () => void;
  mitigationCount: number;
  incrementMitigationCount: () => void;  isDeclared: boolean;
  generateStrategy: () => Promise<void>;
  scenarios: Record<string, import('../data/scenarios/types').Scenario>;
  clearInterruption: () => void;
  handlePhraseApprove: (phrase: string) => CommandResult;
  getDiagnosticToken?: () => string | null;
  // For freshness in tests
  getMitigationCount?: () => number;
  getIsDeclared?: () => boolean;
  getIncidentReport?: () => string | null;
}

export const useCommandRegistry = (actions: CommandActions) => {
  const commands = getCommands(actions);

  const handleCommand = (input: string): CommandResult => {
    const originalInput = input.trim();
    let cmd = originalInput.toLowerCase();
    if (!cmd) return { isValid: false };

    // Modal Phrase Puzzle Handling
    if (cmd.startsWith('authorize ')) {
        const phrase = originalInput.slice(10).trim();
        return actions.handlePhraseApprove(phrase);
    }

    // Check if command starts with a category (e.g. "panes show logs")
    const categories: Command['category'][] = ['PANES', 'THREAT', 'STACK', 'SYSTEM', 'ACTION'];
    let categoryLimit: Command['category'] | null = null;

    // man page / general help
    if (['help', 'man', '?', '/?'].includes(cmd)) {
        let message = `SMOKESCREEN(1)             User Commands            SMOKESCREEN(1)\n\n`;
        message += `NAME\n`;
        message += `       smokescreen - technical incident theatre simulation console\n\n`;
        message += `SYNOPSIS\n`;
        message += `       help [category]\n`;
        message += `       [command]\n\n`;
        message += `DESCRIPTION\n`;
        message += `       SMOKESCREEN provides a command-line interface for managing\n`;
        message += `       incident simulations, infrastructure stacks, and observability\n`;
        message += `       panes. Commands are grouped into functional categories.\n\n`;
        message += `CATEGORIES\n`;

        for (const cat of categories) {
          const catCmds = commands.filter(c => c.category === cat);
          message += `       ${cat.padEnd(10)} ${catCmds.length} commands available.\n`;
          message += `                  (Type '${cat.toLowerCase()} help' for details)\n\n`;
        }

        message += `EXAMPLES\n`;
        message += `       panes help          List all viewport management commands\n`;
        message += `       p0                  Escalate to catastrophic threat level\n`;
        message += `       aws                 Switch primary stack to AWS\n`;
        message += `       analyze             Run automated diagnostics\n\n`;
        message += `SEE ALSO\n`;
        message += `       F12 [HELP] button for full graphical manual.\n\n`;
        message += `Smokescreen 1.0.0            2026-05-08            SMOKESCREEN(1)`;
        
        actions.help(commands);
        return { isValid: true, message };
    }

    // Check if command starts with a category (e.g. "panes show logs")
    for (const cat of categories) {
      if (cmd === cat.toLowerCase() || cmd === cat.toLowerCase() + ' help' || cmd === 'help ' + cat.toLowerCase()) {
        const catCmds = commands.filter(c => c.category === cat);
        let message = `SMOKESCREEN(1)             ${cat} Commands            SMOKESCREEN(1)\n\n`;
        message += `NAME\n`;
        message += `       ${cat.toLowerCase()} - commands for managing ${cat.toLowerCase()} systems\n\n`;
        message += `SYNOPSIS\n`;
        message += `       ${cat.toLowerCase()} [command]\n\n`;
        message += `COMMANDS\n`;

        catCmds.forEach(c => {
            const patternStr = c.patterns.join(', ');
            message += `       ${patternStr.padEnd(20)} ${c.description}\n`;
            if (c.usage && c.usage !== c.patterns[0]) {
                message += `                            Usage: ${c.usage}\n`;
            }
            message += `\n`;
        });
        
        message += `SEE ALSO\n`;
        message += `       help (Return to main manual)\n\n`;
        message += `Smokescreen 1.0.0            2026-05-08            SMOKESCREEN(1)`;
        
        return { isValid: true, message };
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
      const isDeclared = actions.getIsDeclared ? actions.getIsDeclared() : actions.isDeclared;
      const mitigationCount = actions.getMitigationCount ? actions.getMitigationCount() : actions.mitigationCount;

      if (match.id === 'cease' && isDeclared && mitigationCount === 0) {
        return { 
            isValid: false, 
            message: `ERROR: RESOLUTION DENIED. NO MITIGATION ACTIONS LOGGED. PERFORM FAILOVER ROUTING [MAP] OR AUTHORIZE OVERRIDES FIRST.` 
        };
      }

      const actionResult = match.action({});
      if (actionResult && !actionResult.isValid) {
        return actionResult;
      }

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

      const actionResult = match.action({ arg });
      if (actionResult && !actionResult.isValid) {
        return actionResult;
      }

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
