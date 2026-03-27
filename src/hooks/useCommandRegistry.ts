import type { PaneId } from './useWindowManager';
import type { Severity, Stack } from '../data/excuses';

export interface Command {
  id: string;
  patterns: string[];
  action: (context: Record<string, unknown>) => void;
  description: string;
  category: 'PANES' | 'THREAT' | 'STACK' | 'SYSTEM' | 'ACTION';
  usage?: string;
}

export interface CommandActions {
  togglePane: (id: PaneId) => void;
  openPane: (id: PaneId) => void;
  closePane: (id: PaneId) => void;
  openAll: () => void;
  closeAll: () => void;
  setSeverity: (s: Severity) => void;
  setStack: (s: Stack) => void;
  setAudio: (on: boolean) => void;
  setSlowBurn: (on: boolean) => void;
  setBossMode: (on: boolean) => void;
  setTheme: (theme: 'classic' | 'amber' | 'cobalt') => void;
  handleEject: () => void;
  handleCease: () => void;
  copyExcuse: () => void;
  setView: (v: 'HOME' | 'TICKET') => void;
  handleLogout: () => void;
  help: (commands: Command[]) => void;
}

export const useCommandRegistry = (actions: CommandActions) => {
  const commands: Command[] = [
    // Panes
    {
      id: 'chat',
      patterns: ['show chat', 'chat', 'warroom'],
      action: () => actions.openPane('chat'),
      description: 'Display incident war room',
      category: 'PANES',
    },
    {
      id: 'logs',
      patterns: ['show logs', 'logs', 'kernel'],
      action: () => actions.openPane('logs'),
      description: 'Display kernel logs',
      category: 'PANES',
    },
    {
      id: 'map',
      patterns: ['show map', 'map', 'outage'],
      action: () => actions.openPane('map'),
      description: 'Display outage map',
      category: 'PANES',
    },
    {
      id: 'deploy',
      patterns: ['show deploy', 'show k8s', 'deploy', 'k8s'],
      action: () => actions.openPane('deploy'),
      description: 'Display deployment status',
      category: 'PANES',
    },
    {
      id: 'burn',
      patterns: ['show burn', 'show cost', 'burn', 'cost'],
      action: () => actions.openPane('burn'),
      description: 'Display financial burn rate',
      category: 'PANES',
    },
    {
      id: 'pager',
      patterns: ['show pager', 'sync pager', 'pager', 'uplink'],
      action: () => actions.openPane('pager'),
      description: 'Display mobile uplink QR',
      category: 'PANES',
    },
    {
      id: 'howto',
      patterns: ['show howto', 'how to', 'howto', 'manual'],
      action: () => actions.openPane('howTo'),
      description: 'Display operator manual',
      category: 'PANES',
    },
    {
      id: 'settings',
      patterns: ['show settings', 'settings', 'config'],
      action: () => actions.openPane('settings'),
      description: 'Display system settings',
      category: 'PANES',
    },
    {
      id: 'metrics',
      patterns: ['show metrics', 'metrics', 'charts', 'latency'],
      action: () => actions.openPane('metrics'),
      description: 'Display latency metrics',
      category: 'PANES',
    },
    {
      id: 'show_all',
      patterns: ['show all'],
      action: () => actions.openAll(),
      description: 'Show all active panes',
      category: 'PANES',
    },
    {
      id: 'hide_all',
      patterns: ['hide all', 'clear'],
      action: () => actions.closeAll(),
      description: 'Hide all active panes',
      category: 'PANES',
    },

    // Threat
    {
      id: 'nominal',
      patterns: ['nominal', 'reset'],
      action: () => actions.setSeverity('NOMINAL'),
      description: 'Reset systems to nominal',
      category: 'THREAT',
    },
    {
      id: 'p3',
      patterns: ['p3'],
      action: () => actions.setSeverity('P3'),
      description: 'Trigger P3 degradation',
      category: 'THREAT',
    },
    {
      id: 'p1',
      patterns: ['p1'],
      action: () => actions.setSeverity('P1'),
      description: 'Trigger P1 critical alert',
      category: 'THREAT',
    },
    {
      id: 'p0',
      patterns: ['p0'],
      action: () => actions.setSeverity('P0'),
      description: 'Trigger P0 catastrophic failure',
      category: 'THREAT',
    },

    // Stack
    {
      id: 'aws',
      patterns: ['aws'],
      action: () => actions.setStack('AWS'),
      description: 'Set stack to AWS',
      category: 'STACK',
    },
    {
      id: 'gcp',
      patterns: ['gcp'],
      action: () => actions.setStack('GCP'),
      description: 'Set stack to GCP',
      category: 'STACK',
    },
    {
      id: 'azure',
      patterns: ['azure'],
      action: () => actions.setStack('AZURE'),
      description: 'Set stack to AZURE',
      category: 'STACK',
    },
    {
      id: 'onprem',
      patterns: ['onprem'],
      action: () => actions.setStack('ON-PREM'),
      description: 'Set stack to ON-PREM',
      category: 'STACK',
    },
    {
      id: 'serverless',
      patterns: ['serverless'],
      action: () => actions.setStack('SERVERLESS'),
      description: 'Set stack to SERVERLESS',
      category: 'STACK',
    },

    // System
    {
      id: 'audio_on',
      patterns: ['audio on'],
      action: () => actions.setAudio(true),
      description: 'Enable system audio',
      category: 'SYSTEM',
    },
    {
      id: 'audio_off',
      patterns: ['audio off'],
      action: () => actions.setAudio(false),
      description: 'Disable system audio',
      category: 'SYSTEM',
    },
    {
      id: 'slowburn_on',
      patterns: ['slowburn on', 'slowburn'],
      action: () => actions.setSlowBurn(true),
      description: 'Engage slow burn protocol',
      category: 'SYSTEM',
    },
    {
      id: 'slowburn_off',
      patterns: ['slowburn off'],
      action: () => actions.setSlowBurn(false),
      description: 'Disengage slow burn protocol',
      category: 'SYSTEM',
    },
    {
      id: 'boss',
      patterns: ['boss', 'cover'],
      action: () => actions.setBossMode(true),
      description: 'Activate Boss Mode cover',
      category: 'SYSTEM',
    },
    {
      id: 'theme_classic',
      patterns: ['theme classic', 'theme green', 'classic'],
      action: () => actions.setTheme('classic'),
      description: 'Set visual theme to Classic Green',
      category: 'SYSTEM',
    },
    {
      id: 'theme_amber',
      patterns: ['theme amber', 'amber'],
      action: () => actions.setTheme('amber'),
      description: 'Set visual theme to Amber',
      category: 'SYSTEM',
    },
    {
      id: 'theme_cobalt',
      patterns: ['theme cobalt', 'cobalt', 'blue'],
      action: () => actions.setTheme('cobalt'),
      description: 'Set visual theme to Cobalt',
      category: 'SYSTEM',
    },

    // Action
    {
      id: 'declare',
      patterns: ['declare', 'emergency', 'panic'],
      action: () => actions.handleEject(),
      description: 'Declare critical incident theatre',
      category: 'ACTION',
    },
    {
      id: 'cease',
      patterns: ['cease', 'resolve', 'restore', 'abort'],
      action: () => actions.handleCease(),
      description: 'Resolve incident and restore nominal operations',
      category: 'ACTION',
    },
    {
      id: 'copy',
      patterns: ['copy', 'clipboard'],
      action: () => actions.copyExcuse(),
      description: 'Copy playbook to clipboard',
      category: 'ACTION',
    },
    {
      id: 'ticket',
      patterns: ['ticket', 'restricted'],
      action: () => actions.setView('TICKET'),
      description: 'View restricted incident ticket',
      category: 'ACTION',
    },
    {
      id: 'help',
      patterns: ['help', '/?', '?', 'man'],
      action: () => actions.help(commands),
      description: 'Display command manifest',
      category: 'ACTION',
    },
    {
      id: 'logout',
      patterns: ['logout', 'shutdown', 'exit', 'quit'],
      action: () => actions.handleLogout(),
      description: 'Terminate session and logout',
      category: 'SYSTEM',
    },
  ];

  const handleCommand = (input: string): boolean => {
    const cmd = input.toLowerCase().trim();
    if (!cmd) return false;

    const match = commands.find((c) =>
      c.patterns.some((p) => p.toLowerCase() === cmd)
    );

    if (match) {
      match.action({});
      return true;
    }

    return false;
  };

  return { commands, handleCommand };
};
