import { Severity, Stack, stackJargon, commonJargon } from '../data/incidents';
import { getNodeType, NodeType } from '../utils/nodeTypes';

/**
 * Service for handling complex incident business logic.
 * Decouples logic from the Zustand store.
 */
export const incidentService = {
  /**
   * Generates a set of failed nodes for a given stack.
   */
  generateFailedNodes(stack: Stack): Record<string, 'UP' | 'DN'> {
    const systems = stackJargon[stack]?.systems || commonJargon.systems;
    const shuffled = [...systems].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4
    const failedNodes = shuffled.slice(0, count);
    
    const initialHealth: Record<string, 'UP' | 'DN'> = {};
    systems.forEach(s => {
        initialHealth[s.toUpperCase()] = failedNodes.includes(s) ? 'DN' : 'UP';
    });
    
    return initialHealth;
  },

  /**
   * Calculates the next health state and score bonus when healing a node type.
   */
  calculateHealing(
    currentHealth: Record<string, 'UP' | 'DN'>, 
    type: NodeType
  ): { nextHealth: Record<string, 'UP' | 'DN'>; scoreBonus: number } {
    const nextHealth = { ...currentHealth };
    let healedCount = 0;
    
    Object.keys(nextHealth).forEach(key => {
        const wasDown = nextHealth[key] === 'DN';
        const matched = getNodeType(key) === type;

        if (matched && wasDown) {
            nextHealth[key] = 'UP';
            healedCount++;
        }
    });

    const anyWasDown = Object.values(currentHealth).some(s => s === 'DN');
    const anyStillDown = Object.values(nextHealth).some(s => s === 'DN');
    const fullRecoveryBonus = (!anyStillDown && anyWasDown) ? 50 : 0;
    
    const scoreBonus = healedCount > 0 ? (healedCount * 10) + fullRecoveryBonus : 0;

    return { nextHealth, scoreBonus };
  },

  /**
   * Determines the next severity and countdown for slow-burn progression.
   */
  getNextSlowBurnState(severity: Severity, countdown: number): { 
    nextSeverity: Severity; 
    nextStatus: string; 
    nextCountdown: number; 
    shouldDeclare: boolean;
    playAlert: Severity | null;
  } {
    if (countdown > 1) {
        return {
            nextSeverity: severity,
            nextStatus: '', // No change
            nextCountdown: countdown - 1,
            shouldDeclare: false,
            playAlert: null
        };
    }

    if (severity === 'NOMINAL') {
        return {
            nextSeverity: 'P3',
            nextStatus: 'MINOR DEGRADATION',
            nextCountdown: 30,
            shouldDeclare: true,
            playAlert: 'P3'
        };
    } else if (severity === 'P3') {
        return {
            nextSeverity: 'P1',
            nextStatus: 'CRITICAL ALERT',
            nextCountdown: 30,
            shouldDeclare: false,
            playAlert: 'P1'
        };
    } else if (severity === 'P1') {
        return {
            nextSeverity: 'P0',
            nextStatus: 'BREACH DETECTED',
            nextCountdown: 0,
            shouldDeclare: false,
            playAlert: 'P0'
        };
    }

    return {
        nextSeverity: severity,
        nextStatus: '',
        nextCountdown: 0,
        shouldDeclare: false,
        playAlert: null
    };
  }
};
